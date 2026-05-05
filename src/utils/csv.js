export function parseCsv(text) {
  const lines = text.trim().split("\n");
  return lines.slice(1).map((line) => {
    const [client_id, timestamp, amount, frequency, channel, category] = line.split(",");
    return {
      client_id: (client_id || "").trim(),
      timestamp: (timestamp || "").trim(),
      amount: Number(amount),
      frequency: Number(frequency),
      channel: (channel || "").trim(),
      category: (category || "").trim(),
    };
  });
}

