import { useEffect, useMemo, useState } from "react";
import AuthScreen from "./components/AuthScreen";
import "./App.css";

import HeroSection from "./components/HeroSection.jsx";
import DataSourcePanel from "./components/DataSourcePanel.jsx";
import RiskCharts from "./components/RiskCharts.jsx";
import RiskExplanation from "./components/RiskExplanation.jsx";
import OperationsTable from "./components/OperationsTable.jsx";
import TopRiskClients from "./components/TopRiskClients.jsx";
import SessionSummary from "./components/SessionSummary.jsx";
import FeatureInfluence from "./components/FeatureInfluence.jsx";
import SystemLogic from "./components/SystemLogic.jsx";
import BottomInfoCards from "./components/BottomInfoCards.jsx";

import { parseCsv } from "./utils/csv.js";
import { toFrontendRows } from "./utils/risk.js";
import {
  ANOMALY_TEST_DATA,
  COLORS,
  NORMAL_TEST_DATA,
  SAMPLE_DATA,
} from "./utils/constants.js";

export default function App() {
  const [accessToken, setAccessToken] = useState(
    localStorage.getItem("accessToken") || ""
  );

  const [rows, setRows] = useState(parseCsv(SAMPLE_DATA));
  const [analysisRows, setAnalysisRows] = useState([]);
  const [search, setSearch] = useState("");
  const [sourceName, setSourceName] = useState("Демонстрационные данные");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  const handleLogin = (token) => {
    setAccessToken(token);
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("authorizedUser");
    setAccessToken("");
    setAnalysisRows([]);
    setError("");
  };

  async function analyzeByBackend(inputRows, sourceLabel) {
    if (!accessToken) {
      setError("Для анализа данных необходимо пройти авторизацию.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("http://127.0.0.1:8000/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ transactions: inputRows }),
      });

      if (response.status === 401) {
        handleLogout();
        throw new Error("Срок действия авторизации истек. Выполните вход повторно.");
      }

      if (!response.ok) {
        throw new Error(`Ошибка анализа: ${response.status}`);
      }

      const data = await response.json();
      setAnalysisRows(toFrontendRows(data.results || []));
      setSourceName(sourceLabel);
    } catch (err) {
      setError(
        err.message ||
          "Не удалось подключиться к backend. Проверь, что сервер на 8000 порту запущен."
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const stats = useMemo(() => {
    const total = analysisRows.length;
    const high = analysisRows.filter((r) => r.riskLevel === "Высокий").length;
    const medium = analysisRows.filter((r) => r.riskLevel === "Средний").length;
    const low = analysisRows.filter((r) => r.riskLevel === "Низкий").length;

    const avg = total
      ? Math.round(
          analysisRows.reduce(
            (sum, r) => sum + Number(r.anomalyScore || 0),
            0
          ) / total
        )
      : 0;

    const highRatio = total ? Math.round((high / total) * 100) : 0;

    return { total, high, medium, low, avg, highRatio };
  }, [analysisRows]);

  const chartData = [
    { name: "Низкий", value: stats.low },
    { name: "Средний", value: stats.medium },
    { name: "Высокий", value: stats.high },
  ];

  const topRiskRows = useMemo(
    () =>
      [...analysisRows]
        .sort(
          (a, b) =>
            Number(b.anomalyScore || 0) - Number(a.anomalyScore || 0)
        )
        .slice(0, 3),
    [analysisRows]
  );

  const timelineData = analysisRows.map((r, index) => ({
    name: r.client_id,
    score: Number(r.anomalyScore || 0),
    riskLevel: r.riskLevel,
    order: index + 1,
  }));

  const filteredRows = analysisRows.filter((r) => {
    const q = search.trim().toLowerCase();

    if (!q) return true;

    return [
      r.client_id,
      r.timestamp,
      r.channel,
      r.category,
      r.riskLevel,
      r.flag,
    ]
      .join(" ")
      .toLowerCase()
      .includes(q);
  });

  const selectedRow = filteredRows[selectedIndex] || filteredRows[0] || null;

  const sessionSummary = useMemo(() => {
    if (!analysisRows.length) {
      return {
        title: "Нет данных для оценки",
        text: "Загрузите CSV или выберите тестовый сценарий, чтобы система сформировала итоговую сводку.",
        tone: "neutral",
      };
    }

    if (stats.highRatio >= 50) {
      return {
        title: "Высокий уровень риска",
        text: "В текущем наборе данных преобладают операции с высоким уровнем аномальности. Рекомендуется усиленный контроль.",
        tone: "danger",
      };
    }

    if (stats.highRatio >= 20) {
      return {
        title: "Умеренный уровень риска",
        text: "В данных присутствуют подозрительные операции, которые требуют внимания и дополнительной проверки.",
        tone: "warning",
      };
    }

    return {
      title: "Низкий уровень риска",
      text: "Большая часть операций соответствует нормальному профилю поведения клиента.",
      tone: "success",
    };
  }, [analysisRows, stats.highRatio]);

  const featureInfluenceItems = [
    { name: "Сумма", value: 40 },
    { name: "Частота", value: 25 },
    { name: "Канал", value: 20 },
    { name: "Категория", value: 15 },
  ];

  async function handleFile(file) {
    if (!file) return;

    const text = await file.text();
    const parsed = parseCsv(text);

    setRows(parsed);
    setSelectedIndex(0);

    await analyzeByBackend(parsed, file.name);
  }

  async function loadSample() {
    const parsed = parseCsv(SAMPLE_DATA);

    setRows(parsed);
    setSearch("");
    setSelectedIndex(0);

    await analyzeByBackend(parsed, "Демонстрационные данные");
  }

  async function loadTestScenario(type) {
    const parsed =
      type === "normal"
        ? parseCsv(NORMAL_TEST_DATA)
        : parseCsv(ANOMALY_TEST_DATA);

    setRows(parsed);
    setSearch("");
    setSelectedIndex(0);

    await analyzeByBackend(
      parsed,
      type === "normal"
        ? "Тест: нормальный сценарий"
        : "Тест: аномальный сценарий"
    );
  }

  useEffect(() => {
    if (accessToken) {
      analyzeByBackend(rows, sourceName);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

  if (!accessToken) {
    return <AuthScreen onLogin={handleLogin} />;
  }

  return (
    <div className="app-shell">
      <div className="page">
        <div className="app-actions">
          <button className="logout-button" onClick={handleLogout}>
            Выйти
          </button>
        </div>

        <HeroSection stats={stats} />

        <div className="content-grid">
          <DataSourcePanel
            onFile={handleFile}
            onLoadSample={loadSample}
            onLoadTestScenario={loadTestScenario}
          />

          <RiskCharts
            sourceName={sourceName}
            stats={stats}
            timelineData={timelineData}
            chartData={chartData}
            colors={COLORS}
            loading={loading}
            error={error}
          >
            <RiskExplanation selectedRow={selectedRow} />
          </RiskCharts>
        </div>

        <OperationsTable
          search={search}
          onSearchChange={setSearch}
          filteredRows={filteredRows}
          selectedRow={selectedRow}
          onSelectIndex={setSelectedIndex}
        />

        <TopRiskClients rows={topRiskRows} />
        <SessionSummary summary={sessionSummary} />
        <FeatureInfluence items={featureInfluenceItems} />
        <SystemLogic />
        <BottomInfoCards />
      </div>
    </div>
  );
}
