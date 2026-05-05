import React from "react";

export default function RiskBadge({ level }) {
  const styles = {
    Низкий: "badge success",
    Средний: "badge warning",
    Высокий: "badge danger",
  };
  return <span className={styles[level]}>{level}</span>;
}

