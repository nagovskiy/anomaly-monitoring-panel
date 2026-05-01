import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  BarChart3,
  Brain,
  Database,
  Eye,
  FileUp,
  Layers3,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Pie,
  PieChart,
  Legend,
} from "recharts";
import "./App.css";

const SAMPLE_DATA = `client_id,timestamp,amount,frequency,channel,category
C001,2026-04-01 09:15,12000,3,online,transfer
C002,2026-04-01 10:20,95000,12,online,cashout
C003,2026-04-01 11:00,2400,2,mobile,payment
C004,2026-04-01 11:30,180000,20,online,transfer
C005,2026-04-01 12:10,4500,1,branch,payment
C006,2026-04-01 13:45,72000,8,online,transfer
C007,2026-04-01 14:30,5600,2,mobile,topup
C008,2026-04-01 15:00,210000,25,online,withdrawal
C009,2026-04-01 15:30,8800,4,branch,transfer
C010,2026-04-01 16:10,150000,18,online,transfer`;

const NORMAL_TEST_DATA = `client_id,timestamp,amount,frequency,channel,category
N001,2026-04-02 09:10,5200,2,branch,payment
N002,2026-04-02 10:05,7800,3,mobile,transfer
N003,2026-04-02 11:20,6400,2,branch,topup
N004,2026-04-02 12:15,9100,3,mobile,payment
N005,2026-04-02 13:30,7000,2,branch,transfer`;

const ANOMALY_TEST_DATA = `client_id,timestamp,amount,frequency,channel,category
A001,2026-04-02 09:10,98000,14,online,cashout
A002,2026-04-02 10:05,145000,19,online,withdrawal
A003,2026-04-02 11:20,187000,24,online,transfer
A004,2026-04-02 12:15,164000,21,online,cashout
A005,2026-04-02 13:30,203000,27,online,withdrawal`;

const COLORS = ["#22c55e", "#f59e0b", "#ef4444"];

function parseCsv(text) {
  const lines = text.trim().split("\n");
  return lines.slice(1).map((line) => {
    const [client_id, timestamp, amount, frequency, channel, category] =
      line.split(",");
    return {
      client_id: (client_id || "").trim(),
      timestamp: (timestamp || "").trim(),
      amount: Number(amount),
      frequency: Number(frequency),
      channel: (channel || "").trim(),
      category: (category || "").trim(),
    };
  });
}

function mean(values) {
  return values.reduce((sum, value) => sum + value, 0) / Math.max(values.length, 1);
}

function std(values) {
  const m = mean(values);
  const variance = values.reduce((sum, x) => sum + (x - m) ** 2, 0) / Math.max(values.length, 1);
  return Math.sqrt(variance) || 1;
}

function normalizeScore(score) {
  return Math.max(0, Math.min(100, Math.round(score)));
}

function riskLabel(score) {
  if (score < 35) return "Низкий";
  if (score < 70) return "Средний";
  return "Высокий";
}

function flagByScore(score) {
  if (score < 35) return "Норма";
  if (score < 70) return "Нужно наблюдение";
  return "Требует проверки";
}

function getRiskReasons(row) {
  const reasons = [];
  if (row.amount >= 50000) reasons.push("высокая сумма операции");
  if (row.frequency >= 10) reasons.push("повышенная частота транзакций");
  if (row.channel === "online") reasons.push("использование онлайн-канала");
  if (row.category === "withdrawal" || row.category === "cashout") {
    reasons.push("операция относится к риск-категории");
  }
  if (reasons.length === 0) reasons.push("поведение близко к нормальному профилю");
  return reasons;
}

function getRecommendedAction(row) {
  if (row.riskLevel === "Высокий") return "Передать операцию на дополнительную проверку и ручной контроль.";
  if (row.riskLevel === "Средний") return "Оставить операцию под наблюдением и проверить контекст клиента.";
  return "Операция соответствует ожидаемому профилю поведения.";
}

function scoreRows(rows) {
  const amounts = rows.map((r) => r.amount);
  const freqs = rows.map((r) => r.frequency);
  const amountMean = mean(amounts);
  const amountStd = std(amounts);
  const freqMean = mean(freqs);
  const freqStd = std(freqs);

  return rows.map((row) => {
    const zAmount = Math.abs((row.amount - amountMean) / amountStd);
    const zFreq = Math.abs((row.frequency - freqMean) / freqStd);
    const channelBoost = row.channel === "online" ? 8 : row.channel === "mobile" ? 4 : 2;
    const categoryBoost = row.category === "withdrawal" ? 10 : row.category === "cashout" ? 12 : 5;
    const rawScore = zAmount * 18 + zFreq * 14 + channelBoost + categoryBoost;
    const anomalyScore = normalizeScore(rawScore);

    return {
      ...row,
      anomalyScore,
      riskLevel: riskLabel(anomalyScore),
      flag: flagByScore(anomalyScore),
    };
  });
}

function SectionTitle({ icon, title, subtitle }) {
  return (
    <div className="section-title">
      <div className="section-icon">{icon}</div>
      <div>
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div className="stat-card">
      <div className="stat-icon">{icon}</div>
      <div>
        <div className="stat-label">{label}</div>
        <div className="stat-value">{value}</div>
      </div>
    </div>
  );
}

function InfoCard({ icon, title, text }) {
  return (
    <div className="mini-card">
      <div className="info-head">
        <div className="section-icon">{icon}</div>
        <h3>{title}</h3>
      </div>
      <p>{text}</p>
    </div>
  );
}

function RiskBadge({ level }) {
  const styles = {
    Низкий: "badge success",
    Средний: "badge warning",
    Высокий: "badge danger",
  };
  return <span className={styles[level]}>{level}</span>;
}

function Th({ children }) {
  return <th>{children}</th>;
}

function Td({ children, className = "", style }) {
  return <td className={className} style={style}>{children}</td>;
}

function toFrontendRows(results) {
  return results.map((row) => ({
    client_id: row.client_id,
    timestamp: row.timestamp,
    amount: row.amount,
    frequency: row.frequency,
    channel: row.channel,
    category: row.category,
    anomalyScore: row.anomaly_score,
    riskLevel: row.risk_level,
    flag: row.flag,
  }));
}

export default function App() {
  const [rows, setRows] = useState(parseCsv(SAMPLE_DATA));
  const [analysisRows, setAnalysisRows] = useState([]);
  const [search, setSearch] = useState("");
  const [sourceName, setSourceName] = useState("Демонстрационные данные");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  async function analyzeByBackend(inputRows, sourceLabel) {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("http://127.0.0.1:8000/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactions: inputRows }),
      });

      if (!response.ok) {
        throw new Error(`Ошибка анализа: ${response.status}`);
      }

      const data = await response.json();
      setAnalysisRows(toFrontendRows(data.results || []));
      setSourceName(sourceLabel);
    } catch (err) {
      setError("Не удалось подключиться к backend. Проверь, что сервер на 8000 порту запущен.");
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
    const avg = total ? Math.round(analysisRows.reduce((sum, r) => sum + Number(r.anomalyScore || 0), 0) / total) : 0;
    const highRatio = total ? Math.round((high / total) * 100) : 0;
    return { total, high, medium, low, avg, highRatio };
  }, [analysisRows]);

  const chartData = [
    { name: "Низкий", value: stats.low },
    { name: "Средний", value: stats.medium },
    { name: "Высокий", value: stats.high },
  ];

  const topRiskRows = useMemo(
    () => [...analysisRows].sort((a, b) => Number(b.anomalyScore || 0) - Number(a.anomalyScore || 0)).slice(0, 3),
    [analysisRows]
  );

  const timelineData = analysisRows.map((r, index) => ({
    name: r.client_id,
    score: Number(r.anomalyScore || 0),
    order: index + 1,
  }));

  const filteredRows = analysisRows.filter((r) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return [r.client_id, r.timestamp, r.channel, r.category, r.riskLevel, r.flag].join(" ").toLowerCase().includes(q);
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

  const featureInfluence = [
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
    const parsed = type === "normal" ? parseCsv(NORMAL_TEST_DATA) : parseCsv(ANOMALY_TEST_DATA);
    setRows(parsed);
    setSearch("");
    setSelectedIndex(0);
    await analyzeByBackend(parsed, type === "normal" ? "Тест: нормальный сценарий" : "Тест: аномальный сценарий");
  }

  useEffect(() => {
    analyzeByBackend(rows, sourceName);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="app-shell">
      <div className="page">
        <motion.section className="hero" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
          <div className="hero-top">
            <div className="hero-text">
              <div className="pill">
                <Sparkles size={14} />
                Нейросетевая система финансового мониторинга
              </div>
              <h1>Выявление аномального стиля поведения клиентов</h1>
              <p>
                Веб-панель для демонстрации логики анализа транзакций: загрузка данных, расчёт риска, визуализация аномалий и просмотр подозрительных операций в удобном интерфейсе.
              </p>
            </div>

            <div className="stats-grid">
              <StatCard icon={<Database size={18} />} label="Записей" value={stats.total} />
              <StatCard icon={<AlertTriangle size={18} />} label="Высокий риск" value={stats.high} />
              <StatCard icon={<TrendingUp size={18} />} label="Средний риск" value={stats.medium} />
              <StatCard icon={<ShieldCheck size={18} />} label="Средний балл" value={stats.avg} />
            </div>
          </div>
        </motion.section>

        <div className="content-grid">
          <motion.aside className="card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.05 }}>
            <SectionTitle icon={<FileUp size={18} />} title="Источник данных" subtitle="Загрузка CSV-файла или использование демонстрационного набора" />

            <label className="upload-box">
              <FileUp size={28} />
              <span>Загрузить CSV</span>
              <small>client_id,timestamp,amount,frequency,channel,category</small>
              <input type="file" accept=".csv,text/csv" className="hidden" onChange={(e) => handleFile(e.target.files?.[0] || null)} />
            </label>

            <button onClick={loadSample} className="button">Вернуть демонстрационные данные</button>

            <div style={{ display: "grid", gap: "10px", marginTop: "12px" }}>
              <button className="button" onClick={() => loadTestScenario("normal")}>Проверить нормальный сценарий</button>
              <button className="button" onClick={() => loadTestScenario("anomaly")}>Проверить аномальный сценарий</button>
            </div>

            <div className="info-box">
              <strong>Что делает эта версия</strong>
              <p>
                Панель показывает основу будущего проекта: загрузку транзакций, оценку риска, выделение аномалий и визуализацию результата.
              </p>
            </div>
          </motion.aside>

          <motion.section className="card wide" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.1 }}>
            <SectionTitle icon={<BarChart3 size={18} />} title="Распределение риска" subtitle={`Источник данных: ${sourceName}`} />

            {loading && <div className="info-box" style={{ marginTop: 18 }}>Идёт анализ данных нейросетевым ядром...</div>}
            {error && <div className="info-box" style={{ marginTop: 18, color: "#fca5a5" }}>{error}</div>}

            <div style={{ marginTop: 18, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
              <div style={{ borderRadius: 18, padding: 14, background: "rgba(2,6,23,0.72)", border: "1px solid rgba(148,163,184,0.14)" }}>
                <div style={{ color: "#94a3b8", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.08em" }}>Доля высокого риска</div>
                <strong style={{ display: "block", marginTop: 6, fontSize: 22, color: "#f8fafc" }}>{stats.highRatio}%</strong>
              </div>
              <div style={{ borderRadius: 18, padding: 14, background: "rgba(2,6,23,0.72)", border: "1px solid rgba(148,163,184,0.14)" }}>
                <div style={{ color: "#94a3b8", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.08em" }}>Средний риск</div>
                <strong style={{ display: "block", marginTop: 6, fontSize: 22, color: "#f8fafc" }}>{stats.avg}</strong>
              </div>
              <div style={{ borderRadius: 18, padding: 14, background: "rgba(2,6,23,0.72)", border: "1px solid rgba(148,163,184,0.14)" }}>
                <div style={{ color: "#94a3b8", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.08em" }}>Состояние системы</div>
                <strong style={{ display: "block", marginTop: 6, fontSize: 22, color: "#67e8f9" }}>Активна</strong>
              </div>
            </div>

            <div className="charts-grid" style={{ marginTop: 18 }}>
              <div className="chart-box">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={timelineData}>
                    <defs>
                      <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                    <XAxis dataKey="name" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip contentStyle={{ background: "#020617", border: "1px solid #334155", borderRadius: 12, color: "#e2e8f0" }} />
                    <Area type="monotone" dataKey="score" stroke="#06b6d4" fill="url(#scoreGradient)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="chart-box">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={70} outerRadius={105} paddingAngle={3}>
                      {chartData.map((entry, idx) => (
                        <Cell key={entry.name} fill={COLORS[idx % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: "#020617", border: "1px solid #334155", borderRadius: 12, color: "#e2e8f0" }} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div style={{ marginTop: 18, borderRadius: 22, border: "1px solid rgba(148, 163, 184, 0.14)", background: "rgba(2, 6, 23, 0.65)", padding: 18 }}>
              <SectionTitle icon={<Sparkles size={18} />} title="Пояснение риска" subtitle="Система показывает, какие признаки повлияли на итоговую оценку" />
              {selectedRow ? (
                <>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginTop: 18 }}>
                    <div style={{ borderRadius: 16, padding: 14, background: "rgba(15,23,42,0.95)", border: "1px solid rgba(148,163,184,0.14)" }}>
                      <div style={{ color: "#94a3b8", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.08em" }}>Клиент</div>
                      <strong style={{ display: "block", marginTop: 6, fontSize: 18 }}>{selectedRow.client_id}</strong>
                    </div>
                    <div style={{ borderRadius: 16, padding: 14, background: "rgba(15,23,42,0.95)", border: "1px solid rgba(148,163,184,0.14)" }}>
                      <div style={{ color: "#94a3b8", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.08em" }}>Итог</div>
                      <strong style={{ display: "block", marginTop: 6, fontSize: 18 }}>{selectedRow.riskLevel}</strong>
                    </div>
                    <div style={{ borderRadius: 16, padding: 14, background: "rgba(15,23,42,0.95)", border: "1px solid rgba(148,163,184,0.14)" }}>
                      <div style={{ color: "#94a3b8", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.08em" }}>Оценка</div>
                      <strong style={{ display: "block", marginTop: 6, fontSize: 18 }}>{selectedRow.anomalyScore}</strong>
                    </div>
                  </div>

                  <div style={{ marginTop: 16, display: "grid", gap: 10 }}>
                    {getRiskReasons(selectedRow).map((reason) => (
                      <div key={reason} style={{ borderRadius: 16, padding: "12px 14px", background: "rgba(15,23,42,0.88)", border: "1px solid rgba(148,163,184,0.12)", color: "#cbd5e1" }}>
                        {reason}
                      </div>
                    ))}
                  </div>

                  <div style={{ marginTop: 16, borderRadius: 18, padding: 16, background: "linear-gradient(135deg, rgba(34,211,238,0.12), rgba(239,68,68,0.12))", border: "1px solid rgba(148,163,184,0.14)" }}>
                    <div style={{ color: "#94a3b8", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                      Рекомендованное действие
                    </div>
                    <div style={{ marginTop: 6, color: "#f8fafc", fontWeight: 700, lineHeight: 1.6 }}>
                      {getRecommendedAction(selectedRow)}
                    </div>
                  </div>
                </>
              ) : (
                <div className="info-box" style={{ marginTop: 18 }}>Для просмотра объяснения выбери строку в таблице.</div>
              )}
            </div>
          </motion.section>
        </div>

        <motion.section className="card table-card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.15 }}>
          <SectionTitle icon={<ShieldCheck size={18} />} title="Реестр операций" subtitle="Список транзакций с рассчитанным уровнем риска" />

          <div className="table-toolbar">
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Поиск по клиенту, каналу, категории или риску" className="search" />
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <Th>Клиент</Th>
                  <Th>Время</Th>
                  <Th>Сумма</Th>
                  <Th>Частота</Th>
                  <Th>Канал</Th>
                  <Th>Категория</Th>
                  <Th>Оценка</Th>
                  <Th>Уровень</Th>
                  <Th>Статус</Th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((row, index) => {
                  const isSelected = selectedRow && row.client_id === selectedRow.client_id && row.timestamp === selectedRow.timestamp;
                  return (
                    <tr
                      key={`${row.client_id}-${row.timestamp}`}
                      onClick={() => setSelectedIndex(index)}
                      style={{ cursor: "pointer", background: isSelected ? "rgba(34, 211, 238, 0.08)" : "transparent" }}
                    >
                      <Td className="font-medium text-slate-100">{row.client_id}</Td>
                      <Td>{row.timestamp}</Td>
                      <Td>{row.amount.toLocaleString("ru-RU")} ₽</Td>
                      <Td>{row.frequency}</Td>
                      <Td>{row.channel}</Td>
                      <Td>{row.category}</Td>
                      <Td><span className="score-pill">{row.anomalyScore}</span></Td>
                      <Td><RiskBadge level={row.riskLevel} /></Td>
                      <Td className="text-slate-300">{row.flag}</Td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.section>

        <div className="card" style={{ marginBottom: 24 }}>
          <SectionTitle
            icon={<AlertTriangle size={18} />}
            title="Топ-3 самых рискованных клиентов"
            subtitle="Карточки показывают записи с наибольшим итоговым баллом аномальности"
          />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginTop: 18 }}>
            {topRiskRows.map((row, index) => (
              <div key={`${row.client_id}-${row.timestamp}`} style={{ borderRadius: 20, padding: 16, background: "rgba(2, 6, 23, 0.72)", border: "1px solid rgba(148, 163, 184, 0.14)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <strong style={{ color: "#f8fafc" }}>#{index + 1} {row.client_id}</strong>
                  <span className="badge danger">{row.riskLevel}</span>
                </div>
                <div style={{ color: "#94a3b8", fontSize: 13, lineHeight: 1.6 }}>{row.timestamp}</div>
                <div style={{ marginTop: 10, color: "#cbd5e1" }}>Сумма: {row.amount.toLocaleString("ru-RU")} ₽</div>
                <div style={{ marginTop: 8, color: "#67e8f9", fontSize: 22, fontWeight: 700 }}>{row.anomalyScore}</div>
                <div style={{ marginTop: 12, height: 8, borderRadius: 999, background: "rgba(148,163,184,0.15)", overflow: "hidden" }}>
                  <div style={{ width: `${row.anomalyScore}%`, height: "100%", background: "linear-gradient(90deg, #22d3ee, #ef4444)" }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card" style={{ marginBottom: 24 }}>
          <SectionTitle
            icon={<Brain size={18} />}
            title={sessionSummary.title}
            subtitle="Итоговое состояние текущего набора транзакций"
          />
          <div style={{ marginTop: 18, borderRadius: 20, padding: 18, background: sessionSummary.tone === "danger" ? "linear-gradient(135deg, rgba(239,68,68,0.18), rgba(34,211,238,0.08))" : sessionSummary.tone === "warning" ? "linear-gradient(135deg, rgba(245,158,11,0.18), rgba(34,211,238,0.08))" : "linear-gradient(135deg, rgba(34,197,94,0.14), rgba(34,211,238,0.08))", border: "1px solid rgba(148,163,184,0.14)" }}>
            <div style={{ color: "#f8fafc", fontSize: 18, fontWeight: 700 }}>{sessionSummary.text}</div>
            <div style={{ marginTop: 10, color: "#cbd5e1", lineHeight: 1.6 }}>
              Показатель формируется на основе доли операций с высоким риском, средней оценки аномальности и распределения подозрительных записей по набору данных.
            </div>
          </div>
        </div>

        <div className="card" style={{ marginBottom: 24 }}>
          <SectionTitle
            icon={<Layers3 size={18} />}
            title="Влияние признаков на риск"
            subtitle="Показывает, какие характеристики сильнее всего влияют на итоговую оценку"
          />
          <div style={{ marginTop: 18, display: "grid", gap: 12 }}>
            {featureInfluence.map((item) => (
              <div key={item.name} style={{ display: "grid", gridTemplateColumns: "120px 1fr 48px", gap: 12, alignItems: "center" }}>
                <div style={{ color: "#cbd5e1", fontWeight: 600 }}>{item.name}</div>
                <div style={{ height: 12, borderRadius: 999, background: "rgba(148,163,184,0.15)", overflow: "hidden" }}>
                  <div style={{ width: `${item.value}%`, height: "100%", background: "linear-gradient(90deg, #22d3ee, #ef4444)" }} />
                </div>
                <div style={{ color: "#67e8f9", fontWeight: 700, textAlign: "right" }}>{item.value}%</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card" style={{ marginBottom: 24 }}>
          <SectionTitle
            icon={<Layers3 size={18} />}
            title="Логика работы системы"
            subtitle="От входных транзакций до итоговой оценки риска"
          />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginTop: 18 }}>
            {[
              { icon: <FileUp size={16} />, title: "1. Загрузка", text: "CSV с транзакциями" },
              { icon: <Brain size={16} />, title: "2. Анализ", text: "Нейросетевое ядро" },
              { icon: <Eye size={16} />, title: "3. Пояснение", text: "Причины риска" },
              { icon: <ShieldCheck size={16} />, title: "4. Результат", text: "Список аномалий" },
            ].map((step) => (
              <div key={step.title} style={{ borderRadius: 20, padding: 16, background: "rgba(2,6,23,0.72)", border: "1px solid rgba(148,163,184,0.14)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#67e8f9", marginBottom: 10 }}>
                  {step.icon}
                  <strong style={{ color: "#f8fafc" }}>{step.title}</strong>
                </div>
                <div style={{ color: "#cbd5e1", fontSize: 14, lineHeight: 1.6 }}>{step.text}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bottom-grid">
          <InfoCard icon={<TrendingUp size={20} />} title="Функциональное назначение интерфейса" text="Интерфейс обеспечивает прием транзакционных данных и отображение итогового уровня риска по каждому клиенту, что позволяет наглядно представить результаты анализа." />
          <InfoCard icon={<Sparkles size={20} />} title="Перспективы развития решения" text="Архитектура системы допускает расширение за счет более сложной нейросетевой модели, серверной обработки и хранения результатов в базе данных." />
          <InfoCard icon={<ShieldCheck size={20} />} title="Практическая значимость прототипа" text="Разработанный прототип реализует полный цикл автоматизированной обработки транзакционных данных: от загрузки и анализа до визуализации результатов и формирования итоговой оценки риска." />
        </div>
      </div>
    </div>
  );
}
