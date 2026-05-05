export const SAMPLE_DATA = `client_id,timestamp,amount,frequency,channel,category
C001,2026-04-01 09:15,12000,3,online,transfer
C002,2026-04-01 10:20,95000,12,online,cashout
C003,2026-04-01 11:00,2400,2,mobile,payment
C004,2026-04-01 11:30,180000,20,online,transfer
C005,2026-04-01 12:10,4500,1,branch,payment
C006,2026-04-01 13:45,72000,8,online,transfer
C007,2026-04-01 14:30,5600,2,mobile,topup
C008,2026-04-01 15:00,210000,25,online,withdrawal
C009,2026-04-01 15:30,8800,4,branch,transfer
C010,2026-04-01 16:10,150000,18,online,transfer`;

export const NORMAL_TEST_DATA = `client_id,timestamp,amount,frequency,channel,category
N001,2026-04-02 09:10,5200,2,branch,payment
N002,2026-04-02 10:05,7800,3,mobile,transfer
N003,2026-04-02 11:20,6400,2,branch,topup
N004,2026-04-02 12:15,9100,3,mobile,payment
N005,2026-04-02 13:30,7000,2,branch,transfer`;

export const ANOMALY_TEST_DATA = `client_id,timestamp,amount,frequency,channel,category
A001,2026-04-02 09:10,98000,14,online,cashout
A002,2026-04-02 10:05,145000,19,online,withdrawal
A003,2026-04-02 11:20,187000,24,online,transfer
A004,2026-04-02 12:15,164000,21,online,cashout
A005,2026-04-02 13:30,203000,27,online,withdrawal`;

export const COLORS = ["#22c55e", "#f59e0b", "#ef4444"];

export const featureInfluence = [
  { name: "Сумма", value: 40 },
  { name: "Частота", value: 25 },
  { name: "Канал", value: 20 },
  { name: "Категория", value: 15 },
];

