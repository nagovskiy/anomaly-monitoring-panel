import React from "react";
import { motion } from "framer-motion";
import { FileUp } from "lucide-react";

import SectionTitle from "./SectionTitle.jsx";

export default function DataSourcePanel({ onFile, onLoadSample, onLoadTestScenario }) {
  return (
    <motion.aside
      className="card"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.05 }}
    >
      <SectionTitle
        icon={<FileUp size={18} />}
        title="Источник данных"
        subtitle="Загрузка CSV-файла или использование демонстрационного набора"
      />

      <label className="upload-box">
        <FileUp size={28} />
        <span>Загрузить CSV</span>
        <small>client_id,timestamp,amount,frequency,channel,category</small>
        <input
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={(e) => onFile(e.target.files?.[0] || null)}
        />
      </label>

      <button onClick={onLoadSample} className="button">
        Вернуть демонстрационные данные
      </button>

      <div style={{ display: "grid", gap: "10px", marginTop: "12px" }}>
        <button className="button" onClick={() => onLoadTestScenario("normal")}>
          Проверить нормальный сценарий
        </button>
        <button className="button" onClick={() => onLoadTestScenario("anomaly")}>
          Проверить аномальный сценарий
        </button>
      </div>

      <div className="info-box">
        <strong>Что делает эта версия</strong>
        <p>
          Панель показывает основу будущего проекта: загрузку транзакций, оценку риска, выделение аномалий и
          визуализацию результата.
        </p>
      </div>
    </motion.aside>
  );
}

