import React from "react";
import { Brain, Eye, FileUp, Layers3, ShieldCheck } from "lucide-react";

import SectionTitle from "./SectionTitle.jsx";

export default function SystemLogic() {
  return (
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
          <div
            key={step.title}
            style={{
              borderRadius: 20,
              padding: 16,
              background: "rgba(2,6,23,0.72)",
              border: "1px solid rgba(148,163,184,0.14)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#67e8f9", marginBottom: 10 }}>
              {step.icon}
              <strong style={{ color: "#f8fafc" }}>{step.title}</strong>
            </div>
            <div style={{ color: "#cbd5e1", fontSize: 14, lineHeight: 1.6 }}>{step.text}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

