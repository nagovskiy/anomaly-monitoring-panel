import React from "react";
import { motion } from "framer-motion";
import { BarChart3 } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import SectionTitle from "./SectionTitle.jsx";

export default function RiskCharts({ sourceName, stats, timelineData, chartData, colors, loading, error, children }) {
  return (
    <motion.section
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
    </motion.section>
  );
}

