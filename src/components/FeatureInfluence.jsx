import React from "react";
import { Layers3 } from "lucide-react";

import SectionTitle from "./SectionTitle.jsx";

export default function FeatureInfluence({ items }) {
  return (
    <div className="card" style={{ marginBottom: 24 }}>
      <SectionTitle
        icon={<Layers3 size={18} />}
        title="Влияние признаков на риск"
        subtitle="Показывает, какие характеристики сильнее всего влияют на итоговую оценку"
      />
      <div style={{ marginTop: 18, display: "grid", gap: 12 }}>
        {items.map((item) => (
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
  );
}

