import base64
import hashlib
import hmac
import json
import time
from typing import Dict, List

import numpy as np
import pandas as pd
from fastapi import Depends, FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sklearn.compose import ColumnTransformer
from sklearn.neural_network import MLPRegressor
from sklearn.preprocessing import OneHotEncoder, StandardScaler


# =========================
# Авторизация
# =========================

SECRET_KEY = "change-this-secret-key-for-production"
TOKEN_TTL_SECONDS = 60 * 60 * 8

DEMO_USER = {
    "login": "analyst",
    "password_hash": hashlib.sha256("analyst123".encode("utf-8")).hexdigest(),
}


class LoginRequest(BaseModel):
    login: str
    password: str


def base64url_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).decode("utf-8").rstrip("=")


def base64url_decode(data: str) -> bytes:
    padding = "=" * (-len(data) % 4)
    return base64.urlsafe_b64decode(data + padding)


def create_access_token(payload: Dict) -> str:
    header = {
        "alg": "HS256",
        "typ": "JWT",
    }

    token_payload = {
        **payload,
        "exp": int(time.time()) + TOKEN_TTL_SECONDS,
    }

    header_encoded = base64url_encode(
        json.dumps(header, separators=(",", ":")).encode("utf-8")
    )

    payload_encoded = base64url_encode(
        json.dumps(token_payload, separators=(",", ":")).encode("utf-8")
    )

    message = f"{header_encoded}.{payload_encoded}".encode("utf-8")

    signature = hmac.new(
        SECRET_KEY.encode("utf-8"),
        message,
        hashlib.sha256,
    ).digest()

    signature_encoded = base64url_encode(signature)

    return f"{header_encoded}.{payload_encoded}.{signature_encoded}"


def verify_access_token(token: str) -> Dict:
    try:
        header_encoded, payload_encoded, signature_encoded = token.split(".")
    except ValueError:
        raise HTTPException(status_code=401, detail="Некорректный токен")

    message = f"{header_encoded}.{payload_encoded}".encode("utf-8")

    expected_signature = hmac.new(
        SECRET_KEY.encode("utf-8"),
        message,
        hashlib.sha256,
    ).digest()

    actual_signature = base64url_decode(signature_encoded)

    if not hmac.compare_digest(expected_signature, actual_signature):
        raise HTTPException(status_code=401, detail="Недействительный токен")

    payload = json.loads(base64url_decode(payload_encoded).decode("utf-8"))

    if int(payload.get("exp", 0)) < int(time.time()):
        raise HTTPException(status_code=401, detail="Срок действия токена истек")

    return payload


def get_current_user(authorization: str = Header(default="")) -> Dict:
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Требуется авторизация")

    token = authorization.replace("Bearer ", "", 1)

    return verify_access_token(token)


# =========================
# Модели данных
# =========================

class Transaction(BaseModel):
    client_id: str
    timestamp: str
    amount: float
    frequency: int
    channel: str
    category: str


class AnalyzeRequest(BaseModel):
    transactions: List[Transaction]


# =========================
# Инициализация FastAPI
# =========================

app = FastAPI(title="Anomaly Monitoring API", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================
# Нейросетевое ядро
# =========================

RNG = np.random.default_rng(42)

NUMERIC_FEATURES = ["amount", "frequency"]
CATEGORICAL_FEATURES = ["channel", "category"]

preprocessor: ColumnTransformer | None = None
model: MLPRegressor | None = None
train_error_mean: float = 0.0
train_error_std: float = 1.0


def generate_normal_training_data(n: int = 2000) -> pd.DataFrame:
    amounts = np.clip(RNG.normal(12000, 4500, n), 500, 40000)
    frequencies = np.clip(RNG.normal(3.2, 1.1, n).round(), 1, 10).astype(int)

    channels = RNG.choice(
        ["branch", "mobile", "online"],
        size=n,
        p=[0.45, 0.35, 0.20],
    )

    categories = RNG.choice(
        ["payment", "transfer", "topup"],
        size=n,
        p=[0.45, 0.40, 0.15],
    )

    return pd.DataFrame(
        {
            "amount": amounts,
            "frequency": frequencies,
            "channel": channels,
            "category": categories,
        }
    )


def build_model() -> None:
    global preprocessor, model, train_error_mean, train_error_std

    train_df = generate_normal_training_data()

    preprocessor = ColumnTransformer(
        transformers=[
            ("num", StandardScaler(), NUMERIC_FEATURES),
            (
                "cat",
                OneHotEncoder(handle_unknown="ignore", sparse_output=False),
                CATEGORICAL_FEATURES,
            ),
        ]
    )

    X_train = preprocessor.fit_transform(train_df)

    model = MLPRegressor(
        hidden_layer_sizes=(16, 8, 16),
        activation="relu",
        solver="adam",
        max_iter=700,
        random_state=42,
    )

    model.fit(X_train, X_train)

    train_pred = model.predict(X_train)
    train_errors = np.mean((X_train - train_pred) ** 2, axis=1)

    train_error_mean = float(np.mean(train_errors))
    train_error_std = float(np.std(train_errors) or 1e-6)


def score_to_level(score: float) -> str:
    if score < 35:
        return "Низкий"

    if score < 70:
        return "Средний"

    return "Высокий"


def score_to_flag(score: float) -> str:
    if score < 35:
        return "Норма"

    if score < 70:
        return "Нужно наблюдение"

    return "Требует проверки"


def analyze_transactions(df: pd.DataFrame) -> list[dict]:
    assert preprocessor is not None
    assert model is not None

    X = preprocessor.transform(df)
    X_pred = model.predict(X)

    errors = np.mean((X - X_pred) ** 2, axis=1)

    scored_rows: list[dict] = []

    for idx, row in df.iterrows():
        error = float(errors[idx])

        score = ((error - train_error_mean) / train_error_std) * 15.0 + 40.0
        score = float(np.clip(score, 0, 100))

        scored_rows.append(
            {
                "client_id": row["client_id"],
                "timestamp": row["timestamp"],
                "amount": float(row["amount"]),
                "frequency": int(row["frequency"]),
                "channel": row["channel"],
                "category": row["category"],
                "reconstruction_error": round(error, 6),
                "anomaly_score": round(score, 2),
                "risk_level": score_to_level(score),
                "flag": score_to_flag(score),
            }
        )

    return scored_rows


# =========================
# Endpoint'ы
# =========================

@app.on_event("startup")
def startup_event() -> None:
    build_model()


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}


@app.post("/login")
def login_user(data: LoginRequest) -> dict:
    password_hash = hashlib.sha256(data.password.encode("utf-8")).hexdigest()

    if data.login != DEMO_USER["login"] or password_hash != DEMO_USER["password_hash"]:
        raise HTTPException(status_code=401, detail="Неверный логин или пароль")

    token = create_access_token({"sub": data.login})

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": data.login,
    }


@app.post("/analyze")
def analyze(
    request: AnalyzeRequest,
    current_user: Dict = Depends(get_current_user),
) -> dict:
    if not request.transactions:
        return {
            "summary": {
                "total": 0,
                "low": 0,
                "medium": 0,
                "high": 0,
                "average_score": 0,
            },
            "results": [],
        }

    df = pd.DataFrame([item.model_dump() for item in request.transactions])

    results = analyze_transactions(df)

    total = len(results)
    low = sum(1 for r in results if r["risk_level"] == "Низкий")
    medium = sum(1 for r in results if r["risk_level"] == "Средний")
    high = sum(1 for r in results if r["risk_level"] == "Высокий")

    avg_score = round(sum(r["anomaly_score"] for r in results) / total, 2)

    return {
        "summary": {
            "total": total,
            "low": low,
            "medium": medium,
            "high": high,
            "average_score": avg_score,
        },
        "results": results,
        "user": current_user.get("sub"),
    }