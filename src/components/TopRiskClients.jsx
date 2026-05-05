import React from "react";
import { AlertTriangle } from "lucide-react";

import SectionTitle from "./SectionTitle.jsx";

export default function TopRiskClients({ rows }) {
  return (
    <div className="card" style={{ marginBottom: 24 }}>
      <SectionTitle
        icon={<AlertTriangle size={18} />}
        title="Топ-3 самых рискованных клиентов"
        subtitle="Карточки показывают записи с наибольшим итоговым баллом аномальности"
      />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginTop: 18 }}>
        {rows.map((row, index) => (
          <div
            key={`${row.client_id}-${row.timestamp}`}
            style={{
              borderRadius: 20,
              padding: 16,
              background: "rgba(2, 6, 23, 0.72)",
              border: "1px solid rgba(148, 163, 184, 0.14)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <strong style={{ color: "#f8fafc" }}>
                #{index + 1} {row.client_id}
              </strong>
              <span className="badge danger">{row.riskLevel}</span>
            </div>
            <div style={{ color: "#94a3b8", fontSize: 13, lineHeight: 1.6 }}>{row.timestamp}</div>
            <div style={{ marginTop: 10, color: "#cbd5e1" }}>
              Сумма: {row.amount.toLocaleString("ru-RU")} ₽
            </div>
            <div style={{ marginTop: 8, color: "#67e8f9", fontSize: 22, fontWeight: 700 }}>{row.anomalyScore}</div>
            <div
              style={{
                marginTop: 12,
                height: 8,
                borderRadius: 999,
                background: "rgba(148,163,184,0.15)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${row.anomalyScore}%`,
                  height: "100%",
                  background: "linear-gradient(90deg, #22d3ee, #ef4444)",
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

