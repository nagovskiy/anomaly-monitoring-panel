import React from "react";
import { Sparkles } from "lucide-react";

import SectionTitle from "./SectionTitle.jsx";
import { getRecommendedAction, getRiskReasons } from "../utils/risk.js";

export default function RiskExplanation({ selectedRow }) {
  return (
    <div
      style={{
        marginTop: 18,
        borderRadius: 22,
        border: "1px solid rgba(148, 163, 184, 0.14)",
        background: "rgba(2, 6, 23, 0.65)",
        padding: 18,
      }}
    >
      <SectionTitle
        icon={<Sparkles size={18} />}
        title="Пояснение риска"
        subtitle="Система показывает, какие признаки повлияли на итоговую оценку"
      />

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
              <div
                key={reason}
                style={{
                  borderRadius: 16,
                  padding: "12px 14px",
                  background: "rgba(15,23,42,0.88)",
                  border: "1px solid rgba(148,163,184,0.12)",
                  color: "#cbd5e1",
                }}
              >
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
        <div className="info-box" style={{ marginTop: 18 }}>
          Для просмотра объяснения выбери строку в таблице.
        </div>
      )}
    </div>
  );
}

