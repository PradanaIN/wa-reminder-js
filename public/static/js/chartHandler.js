let chartInstance = null;

export async function renderCharts() {
  try {
    const res = await fetch("/stats");
    const data = await res.json();

    const labels = Object.keys(data.messagesPerDay).sort();
    const messages = labels.map((d) => data.messagesPerDay[d] || 0);
    const errors = labels.map((d) => data.errorsPerDay[d] || 0);
    const uptime = labels.map((d) => data.uptimePerDay[d] || 0);

    const isDark = document.body.classList.contains("dark");
    const gridColor = isDark ? "#4b5563" : "#e5e7eb";
    const textColor = isDark ? "#f3f4f6" : "#1f2937";
    const tooltipBg = isDark ? "#1f2937" : "#ffffff";

    const canvas = document.getElementById("messagesChart");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    if (chartInstance) {
      chartInstance.destroy();
    }

    chartInstance = new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "Pesan Terkirim",
            data: messages,
            borderColor: "#22c55e",
            fill: false,
          },
          {
            label: "Error",
            data: errors,
            borderColor: "#ef4444",
            fill: false,
          },
          {
            label: "Uptime Log (💓)",
            data: uptime,
            borderColor: "#3b82f6",
            fill: false,
          },
        ],
      },
      options: {
        scales: {
          x: {
            grid: { color: gridColor },
            ticks: { color: textColor },
          },
          y: {
            grid: { color: gridColor },
            ticks: { color: textColor },
          },
        },
        plugins: {
          legend: {
            labels: { color: textColor },
          },
          tooltip: {
            backgroundColor: tooltipBg,
            titleColor: textColor,
            bodyColor: textColor,
          },
        },
      },
    });
  } catch (e) {
    console.error("[Chart] Gagal render chart:", e);
  }
}
