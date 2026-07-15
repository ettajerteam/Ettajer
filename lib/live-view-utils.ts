export function percentChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

export function formatPercentChange(value: number): string {
  if (!Number.isFinite(value) || value === 0) return "0%";
  const prefix = value > 0 ? "+" : "";
  return `${prefix}${Math.round(value)}%`;
}

export function buildHourlyTrend(
  orders: { createdAt: Date; total: number }[],
  range: 1 | 24 | 168,
  now = new Date()
): { label: string; orders: number; revenue: number }[] {
  if (range === 168) {
    const points = Array.from({ length: 7 }, (_, index) => {
      const day = new Date(now);
      day.setDate(day.getDate() - (6 - index));
      const label = day.toLocaleDateString(undefined, { weekday: "short" });
      return { label, orders: 0, revenue: 0, day: day.toDateString() };
    });

    for (const order of orders) {
      const key = order.createdAt.toDateString();
      const bucket = points.find((point) => point.day === key);
      if (!bucket) continue;
      bucket.orders += 1;
      bucket.revenue += order.total;
    }

    return points.map(({ label, orders: count, revenue }) => ({
      label,
      orders: count,
      revenue,
    }));
  }

  const bucketCount = range === 1 ? 12 : 24;
  const bucketMs = (range * 60 * 60 * 1000) / bucketCount;
  const rangeStart = now.getTime() - range * 60 * 60 * 1000;

  const points = Array.from({ length: bucketCount }, (_, index) => {
    const start = rangeStart + index * bucketMs;
    const date = new Date(start);
    const label =
      range === 1
        ? date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })
        : date.toLocaleTimeString(undefined, { hour: "numeric" });
    return { label, orders: 0, revenue: 0, start, end: start + bucketMs };
  });

  for (const order of orders) {
    const time = order.createdAt.getTime();
    const bucket = points.find((point) => time >= point.start && time < point.end);
    if (!bucket) continue;
    bucket.orders += 1;
    bucket.revenue += order.total;
  }

  return points.map(({ label, orders: count, revenue }) => ({ label, orders: count, revenue }));
}

export function exportRegionsCsv(
  countries: {
    code: string;
    name: string;
    visitors: number;
    orders: number;
    revenue: number;
  }[],
  currency: string
) {
  const lines = [
    "Country Code,Country,Visitors,Orders,Revenue",
    ...countries.map(
      (country) =>
        `${country.code},"${country.name}",${country.visitors},${country.orders},${country.revenue}`
    ),
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `live-regions-${currency}-${Date.now()}.csv`;
  anchor.click();
  URL.revokeObjectURL(url);
}
