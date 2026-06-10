import { useEffect, useState } from "react";
import { Activity, Database, Eye, EyeOff, Fingerprint, Lock, ShieldCheck } from "lucide-react";

const HEALTH_URL = "http://127.0.0.1:8000/health";

export default function AuthScreen({ onLogin }) {
  const [login, setLogin] = useState("analyst");
  const [password, setPassword] = useState("analyst123");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [backendStatus, setBackendStatus] = useState({
    state: "checking",
    badge: "CHECK",
    label: "Проверка backend",
    responseTime: "...",
    authApi: "Ожидание",
    model: "Ожидание",
  });

  useEffect(() => {
    const controller = new AbortController();

    async function checkBackend() {
      const startedAt = performance.now();

      try {
        const response = await fetch(HEALTH_URL, {
          cache: "no-store",
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Healthcheck failed: ${response.status}`);
        }

        const data = await response.json();
        const responseTime = Math.max(1, Math.round(performance.now() - startedAt));

        if (data.status !== "ok") {
          throw new Error("Backend returned non-ok status");
        }

        setBackendStatus({
          state: "online",
          badge: "ONLINE",
          label: "Backend подключен",
          responseTime: `${responseTime} мс`,
          authApi: "Активна",
          model: "Готов",
        });
      } catch (err) {
        if (err.name === "AbortError") return;

        setBackendStatus({
          state: "offline",
          badge: "OFFLINE",
          label: "Backend недоступен",
          responseTime: "Нет связи",
          authApi: "Недоступна",
          model: "Ожидание",
        });
      }
    }

    checkBackend();

    return () => controller.abort();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:8000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ login, password }),
      });

      if (!response.ok) {
        throw new Error("Неверный логин или пароль");
      }

      const data = await response.json();

      localStorage.setItem("accessToken", data.access_token);
      localStorage.setItem("authorizedUser", data.user);

      onLogin(data.access_token);
    } catch (err) {
      setError("Неверный логин или пароль либо backend недоступен");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-shell">
        <section className="auth-card">
          <div className="auth-card-glow" />

          <div className="auth-header">
            <div className="auth-icon">
              <ShieldCheck size={34} />
            </div>

            <p className="auth-label">Нейросетевая система финансового мониторинга</p>
          </div>

          <h1 className="auth-title">Авторизация пользователя</h1>

          <p className="auth-description">
            Доступ к аналитической панели предоставляется только после проверки
            учетных данных на серверной стороне.
          </p>

          <form className="auth-form" onSubmit={handleSubmit}>
            <label className="auth-field">
              <span>Логин</span>
              <input
                type="text"
                value={login}
                onChange={(event) => {
                  setLogin(event.target.value);
                  setError("");
                }}
                placeholder="Введите логин"
                autoComplete="username"
              />
            </label>

            <label className="auth-field">
              <span>Пароль</span>

              <div className="password-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    setError("");
                  }}
                  placeholder="Введите пароль"
                  autoComplete="current-password"
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label="Показать или скрыть пароль"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </label>

            {error && <div className="auth-error">{error}</div>}

            <button className="auth-button" type="submit" disabled={loading}>
              <Lock size={18} />
              {loading ? "Проверка..." : "Войти в систему"}
            </button>
          </form>

          <div className="auth-hint">
            <span>Демонстрационный доступ:</span>
            <b>analyst / analyst123</b>
          </div>
        </section>

        <aside className={`auth-visual auth-visual--${backendStatus.state}`} aria-label="Состояние системы мониторинга">
          <div className="auth-visual-top">
            <div className={`auth-status-pill auth-status-pill--${backendStatus.state}`}>
              <span />
              {backendStatus.label}
            </div>
            <strong>{backendStatus.badge}</strong>
          </div>

          <div className="auth-core">
            <div className="auth-orbit auth-orbit--outer" />
            <div className="auth-orbit auth-orbit--inner" />
            <div className="auth-node auth-node--one" />
            <div className="auth-node auth-node--two" />
            <div className="auth-node auth-node--three" />
            <div className="auth-core-center">
              <Fingerprint size={48} />
              <span>ML</span>
            </div>
          </div>

          <div className="auth-signal-grid">
            <div>
              <Activity size={18} />
              <span>Ответ backend</span>
              <strong>{backendStatus.responseTime}</strong>
            </div>
            <div>
              <Database size={18} />
              <span>ML-сервис</span>
              <strong>{backendStatus.model}</strong>
            </div>
            <div>
              <ShieldCheck size={18} />
              <span>API авторизации</span>
              <strong>{backendStatus.authApi}</strong>
            </div>
          </div>

          <div className="auth-trace">
            <span />
            <span />
            <span />
          </div>
        </aside>
      </div>
    </div>
  );
}
