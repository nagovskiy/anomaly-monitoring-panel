export function getRiskReasons(row) {
  const reasons = [];
  if (row.amount >= 50000) reasons.push("высокая сумма операции");
  if (row.frequency >= 10) reasons.push("повышенная частота транзакций");
  if (row.channel === "online") reasons.push("использование онлайн-канала");
  if (row.category === "withdrawal" || row.category === "cashout") {
    reasons.push("операция относится к риск-категории");
  }
  if (reasons.length === 0) reasons.push("поведение близко к нормальному профилю");
  return reasons;
}

export function getRecommendedAction(row) {
  if (row.riskLevel === "Высокий") return "Передать операцию на дополнительную проверку и ручной контроль.";
  if (row.riskLevel === "Средний") return "Оставить операцию под наблюдением и проверить контекст клиента.";
  return "Операция соответствует ожидаемому профилю поведения.";
}

export function toFrontendRows(results) {
  return results.map((row) => ({
    client_id: row.client_id,
    timestamp: row.timestamp,
    amount: row.amount,
    frequency: row.frequency,
    channel: row.channel,
    category: row.category,
    anomalyScore: row.anomaly_score,
    riskLevel: row.risk_level,
    flag: row.flag,
  }));
}

