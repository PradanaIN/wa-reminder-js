const { DateTime } = require("luxon");

async function countdownTimer(targetTime) {
  const tz = "Asia/Makassar";
  let now = DateTime.now().setZone(tz);

  if (now > targetTime) {
    targetTime = targetTime.plus({ days: 1 });
  }

  let timeToWait = targetTime.diff(now, "seconds").seconds;

  while (timeToWait > 0) {
    const hours = Math.floor(timeToWait / 3600);
    const mins = Math.floor((timeToWait % 3600) / 60);
    const secs = Math.floor(timeToWait % 60);

    process.stdout.write(
      `Waktu sampai pengiriman berikutnya: ${hours} jam ${mins} menit ${secs} detik\r`
    );

    await new Promise((resolve) => setTimeout(resolve, 1000));
    timeToWait -= 1;
  }

  console.log("\n⏰ Waktu pengiriman tercapai.");
}

module.exports = { countdownTimer };
