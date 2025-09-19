from pathlib import Path

path = Path(r'frontend/src/pages/PublicStatusPage.jsx')
text = path.read_text()
start_marker = "            {nextRunLoading ? ("
start = text.find(start_marker)
if start == -1:
    raise SystemExit('start marker not found')
end_marker = "          </Card>\n        </section>"
end = text.find(end_marker, start)
if end == -1:
    raise SystemExit('end marker not found')
old_block = text[start:end]
new_block = "            {nextRunLoading ? (\n              <div className=\"space-y-4 rounded-2xl border border-white/10 bg-slate-950/70 p-5\">\n                <Skeleton className=\"h-3 w-32\" />\n                <Skeleton className=\"h-8 w-44\" />\n                <Skeleton className=\"h-3 w-28\" />\n                <Skeleton className=\"h-16 w-full\" />\n              </div>\n            ) : nextRun?.timestamp ? (\n              <div className=\"space-y-5 rounded-2xl border border-white/10 bg-slate-950/70 p-5\">\n                <div className=\"space-y-1\">\n                  <p className=\"text-xs uppercase tracking-wide text-slate-400\">Waktu pengiriman</p>\n                  <p className=\"mt-1 text-2xl font-semibold text-white\">{nextRun.formatted}</p>\n                  <p className=\"text-sm text-slate-400\">{nextRun.timezone}</p>\n                </div>\n                <div className=\"flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wide\">\n                  <span className=\"rounded-full bg-primary-500/15 px-3 py-1 text-primary-200\">\n                    {nextRun.override ? 'Override manual' : 'Jadwal default'}\n                  </span>\n                  {schedule?.timezone ? (\n                    <span className=\"rounded-full bg-slate-800/70 px-3 py-1 text-slate-300\">\n                      Zona waktu {schedule.timezone}\n                    </span>\n                  ) : null}\n                </div>\n                {nextRun.override ? (\n                  <div className=\"rounded-xl border border-amber-400/30 bg-amber-500/15 p-4 text-sm text-amber-100\">\n                    <p className=\"font-semibold\">Override aktif</p>\n                    <p>\n                      {nextRun.override.date} pukul {nextRun.override.time}\n                      {nextRun.override.note ? ' - ' + nextRun.override.note : ''}\n                    </p>\n                  </div>\n                ) : (\n                  <p className=\"rounded-xl border border-white/10 bg-slate-950/80 p-4 text-sm text-slate-300\">\n                    Pengiriman akan mengikuti jadwal default harian.\n                  </p>\n                )}\n              </div>\n            ) : (\n              <DataPlaceholder\n                title=\"Belum ada jadwal berikutnya\"\n                description=\"Hubungi administrator untuk mengatur jadwal pengiriman yang baru.\"\n                icon={null}\n              />\n            )}\n"
new_text = text[:start] + new_block + text[end:]
path.write_text(new_text)
