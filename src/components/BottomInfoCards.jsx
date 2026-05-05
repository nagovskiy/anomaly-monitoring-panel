import React from "react";
import { ShieldCheck, Sparkles, TrendingUp } from "lucide-react";

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

export default function BottomInfoCards() {
  return (
    <div className="bottom-grid">
      <InfoCard
        icon={<TrendingUp size={20} />}
        title="Функциональное назначение интерфейса"
        text="Интерфейс обеспечивает прием транзакционных данных и отображение итогового уровня риска по каждому клиенту, что позволяет наглядно представить результаты анализа."
      />
      <InfoCard
        icon={<Sparkles size={20} />}
        title="Перспективы развития решения"
        text="Архитектура системы допускает расширение за счет более сложной нейросетевой модели, серверной обработки и хранения результатов в базе данных."
      />
      <InfoCard
        icon={<ShieldCheck size={20} />}
        title="Практическая значимость прототипа"
        text="Разработанный прототип реализует полный цикл автоматизированной обработки транзакционных данных: от загрузки и анализа до визуализации результатов и формирования итоговой оценки риска."
      />
    </div>
  );
}

