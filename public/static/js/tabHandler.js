import { renderCharts } from "./chartHandler.js";

let chartRendered = false;

export function initTabs() {
  const tabLogBtn = document.getElementById("tabLog");
  const tabChartBtn = document.getElementById("tabChart");
  const tabContentLog = document.getElementById("tabContentLog");
  const tabContentChart = document.getElementById("tabContentChart");

  function showTab(tabName) {
    const isChart = tabName === "chart";

    tabChartBtn.classList.toggle("active", isChart);
    tabLogBtn.classList.toggle("active", !isChart);

    tabContentChart.classList.toggle("hidden", !isChart);
    tabContentLog.classList.toggle("hidden", isChart);

    // Render chart hanya sekali saat tab chart pertama kali dibuka
    if (isChart && !chartRendered) {
      renderCharts();
      chartRendered = true;
    }

    localStorage.setItem("lastTab", tabName);
  }

  tabLogBtn?.addEventListener("click", () => showTab("log"));
  tabChartBtn?.addEventListener("click", () => showTab("chart"));

  // Saat halaman pertama kali dimuat
  const savedTab = localStorage.getItem("lastTab") || "log";
  showTab(savedTab);
}
