import React from "react";
import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";

import SectionTitle from "./SectionTitle.jsx";
import RiskBadge from "./RiskBadge.jsx";

function Th({ children }) {
  return <th>{children}</th>;
}

function Td({ children, className = "", style }) {
  return (
    <td className={className} style={style}>
      {children}
    </td>
  );
}

export default function OperationsTable({ search, onSearchChange, filteredRows, selectedRow, onSelectIndex }) {
  return (
    <motion.section
      className="card table-card"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.15 }}
    >
      <SectionTitle
        icon={<ShieldCheck size={18} />}
        title="Реестр операций"
        subtitle="Список транзакций с рассчитанным уровнем риска"
      />

      <div className="table-toolbar">
        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Поиск по клиенту, каналу, категории или риску"
          className="search"
        />
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <Th>Клиент</Th>
              <Th>Время</Th>
              <Th>Сумма</Th>
              <Th>Частота</Th>
              <Th>Канал</Th>
              <Th>Категория</Th>
              <Th>Оценка</Th>
              <Th>Уровень</Th>
              <Th>Статус</Th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((row, index) => {
              const isSelected =
                selectedRow && row.client_id === selectedRow.client_id && row.timestamp === selectedRow.timestamp;
              return (
                <tr
                  key={`${row.client_id}-${row.timestamp}`}
                  onClick={() => onSelectIndex(index)}
                  style={{
                    cursor: "pointer",
                    background: isSelected ? "rgba(34, 211, 238, 0.08)" : "transparent",
                  }}
                >
                  <Td className="font-medium text-slate-100">{row.client_id}</Td>
                  <Td>{row.timestamp}</Td>
                  <Td>{row.amount.toLocaleString("ru-RU")} ₽</Td>
                  <Td>{row.frequency}</Td>
                  <Td>{row.channel}</Td>
                  <Td>{row.category}</Td>
                  <Td>
                    <span className="score-pill">{row.anomalyScore}</span>
                  </Td>
                  <Td>
                    <RiskBadge level={row.riskLevel} />
                  </Td>
                  <Td className="text-slate-300">{row.flag}</Td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </motion.section>
  );
}

