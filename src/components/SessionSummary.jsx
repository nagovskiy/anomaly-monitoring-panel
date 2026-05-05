import React from "react";
import { Brain } from "lucide-react";

import SectionTitle from "./SectionTitle.jsx";

export default function SessionSummary({ summary }) {
  const gradient =
    summary.tone === "danger"
      ? "linear-gradient(135deg, rgba(239,68,68,0.18), rgba(34,211,238,0.08))"
      : summary.tone === "warning"
        ? "linear-gradient(135deg, rgba(245,158,11,0.18), rgba(34,211,238,0.08))"
        : "linear-gradient(135deg, rgba(34,197,94,0.14), rgba(34,211,238,0.08))";

  return (
    <div className="card" style={{ marginBottom: 24 }}>
      <SectionTitle icon={<Brain size={18} />} title={summary.title} subtitle="Итоговое состояние текущего набора транзакций" />
      <div
        style={{
          marginTop: 18,
          borderRadius: 20,
          padding: 18,
          background: gradient,
          border: "1px solid rgba(148,163,184,0.14)",
        }}
      >
        <div style={{ color: "#f8fafc", fontSize: 18, fontWeight: 700 }}>{summary.text}</div>
        <div style={{ marginTop: 10, color: "#cbd5e1", lineHeight: 1.6 }}>
          Показатель формируется на основе доли операций с высоким риском, средней оценки аномальности и распределения подозрительных записей по набору данных.
        </div>
      </div>
    </div>
  );
}

