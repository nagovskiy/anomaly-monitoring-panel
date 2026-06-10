import React from "react";
import { motion } from "framer-motion";
import { BarChart3 } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Legend,
  Pie,
  PieChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import SectionTitle from "./SectionTitle.jsx";

const MotionSection = motion.section;
const HIGH_RISK_THRESHOLD = 70;
const RISK_COLORS = {
  Низкий: "#22c55e",
  Средний: "#f59e0b",
  Высокий: "#ef4444",
};

function getRiskColor(level) {
  return RISK_COLORS[level] || "#06b6d4";
}

function formatScore(value) {
  const score = Number(value);

  if (!Number.isFinite(score)) return value;

  return Number.isInteger(score) ? String(score) : score.toFixed(1);
}

function RiskBarTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;

  const row = payload[0].payload;

  return (
    <div className="chart-tooltip">
      <div className="chart-tooltip__label">{row.name}</div>
      <div className="chart-tooltip__row">
        <span>Балл риска</span>
        <strong>{formatScore(row.score)}</strong>
      </div>
      <div className="chart-tooltip__row">
        <span>Уровень</span>
        <strong style={{ color: getRiskColor(row.riskLevel) }}>{row.riskLevel}</strong>
      </div>
    </div>
  );
}

export default function RiskCharts({ sourceName, stats, timelineData, chartData, colors, loading, error, children }) {
  return (
    <MotionSection
      className="card wide"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.1 }}
    >
      <SectionTitle icon={<BarChart3 size={18} />} title="Распределение риска" subtitle={`Источник данных: ${sourceName}`} />

      {loading && <div className="info-box" style={{ marginTop: 18 }}>Идёт анализ данных нейросетевым ядром...</div>}
      {error && <div className="info-box" style={{ marginTop: 18, color: "#fca5a5" }}>{error}</div>}

      <div style={{ marginTop: 18, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
        <div style={{ borderRadius: 18, padding: 14, background: "rgba(2,6,23,0.72)", border: "1px solid rgba(148,163,184,0.14)" }}>
          <div style={{ color: "#94a3b8", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.08em" }}>Доля высокого риска</div>
          <strong style={{ display: "block", marginTop: 6, fontSize: 22, color: "#f8fafc" }}>{stats.highRatio}%</strong>
        </div>
        <div style={{ borderRadius: 18, padding: 14, background: "rgba(2,6,23,0.72)", border: "1px solid rgba(148,163,184,0.14)" }}>
          <div style={{ color: "#94a3b8", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.08em" }}>Средний балл</div>
          <strong style={{ display: "block", marginTop: 6, fontSize: 22, color: "#f8fafc" }}>{stats.avg}</strong>
        </div>
        <div style={{ borderRadius: 18, padding: 14, background: "rgba(2,6,23,0.72)", border: "1px solid rgba(148,163,184,0.14)" }}>
          <div style={{ color: "#94a3b8", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.08em" }}>Состояние системы</div>
          <strong style={{ display: "block", marginTop: 6, fontSize: 22, color: "#67e8f9" }}>Активна</strong>
        </div>
      </div>

      <div className="charts-grid" style={{ marginTop: 18 }}>
        <div className="chart-box chart-box--bars">
          <div className="chart-heading">
            <div>
              <span>Дискретные значения</span>
              <strong>Оценка риска по клиентам</strong>
            </div>
            <div className="chart-threshold">Порог высокого риска: {HIGH_RISK_THRESHOLD}</div>
          </div>

          <div className="chart-canvas">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={timelineData}
                margin={{ top: 28, right: 10, left: 0, bottom: 0 }}
                barCategoryGap={timelineData.length > 12 ? "18%" : "28%"}
              >
                <CartesianGrid vertical={false} strokeDasharray="4 4" stroke="rgba(148,163,184,0.16)" />
                <XAxis
                  dataKey="name"
                  stroke="#94a3b8"
                  tick={{ fill: "#94a3b8", fontSize: 12 }}
                  tickLine={false}
                  axisLine={{ stroke: "rgba(148,163,184,0.22)" }}
                  interval={timelineData.length > 12 ? "preserveStartEnd" : 0}
                  tickMargin={10}
                />
                <YAxis
                  domain={[0, 105]}
                  ticks={[0, 25, 50, 75, 100]}
                  stroke="#94a3b8"
                  tick={{ fill: "#94a3b8", fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  width={42}
                />
                <Tooltip cursor={{ fill: "rgba(34,211,238,0.08)" }} content={<RiskBarTooltip />} />
                <ReferenceLine
                  y={HIGH_RISK_THRESHOLD}
                  stroke="#f87171"
                  strokeDasharray="6 5"
                  strokeWidth={2}
                />
                <Bar dataKey="score" name="Балл риска" radius={[8, 8, 4, 4]} maxBarSize={46} animationDuration={700}>
                  {timelineData.map((entry) => (
                    <Cell key={`${entry.name}-${entry.order}`} fill={getRiskColor(entry.riskLevel)} />
                  ))}
                  <LabelList dataKey="score" position="top" fill="#f8fafc" fontSize={12} fontWeight={700} formatter={formatScore} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="risk-legend">
            {Object.entries(RISK_COLORS).map(([level, color]) => (
              <span key={level}>
                <i style={{ background: color, boxShadow: `0 0 14px ${color}66` }} />
                {level}
              </span>
            ))}
          </div>
        </div>

        <div className="chart-box">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={70} outerRadius={105} paddingAngle={3}>
                {chartData.map((entry, idx) => (
                  <Cell key={entry.name} fill={colors[idx % colors.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: "#020617", border: "1px solid #334155", borderRadius: 12, color: "#e2e8f0" }} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {children}
    </MotionSection>
  );
}
