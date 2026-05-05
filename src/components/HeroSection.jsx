import React from "react";
import { motion } from "framer-motion";
import { Sparkles, Database, AlertTriangle, TrendingUp, ShieldCheck } from "lucide-react";

import StatCard from "./StatCard.jsx";

export default function HeroSection({ stats }) {
  return (
    <motion.section
      className="hero"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
    >
      <div className="hero-top">
        <div className="hero-text">
          <div className="pill">
            <Sparkles size={14} />
            Нейросетевая система финансового мониторинга
          </div>
          <h1>Выявление аномального стиля поведения клиентов</h1>
          <p>
            Веб-панель для демонстрации логики анализа транзакций: загрузка данных, расчёт риска, визуализация аномалий
            и просмотр подозрительных операций в удобном интерфейсе.
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
  );
}

