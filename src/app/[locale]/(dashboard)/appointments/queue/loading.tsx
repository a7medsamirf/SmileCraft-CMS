export default function AppointmentsQueueLoading() {
  return (
    <div className="space-y-6" dir="rtl">
      <div className="h-8 w-64 animate-pulse rounded-xl bg-slate-200/70 dark:bg-slate-800/70" />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="glass-card rounded-2xl p-4">
            <div className="h-4 w-20 animate-pulse rounded bg-slate-200/70 dark:bg-slate-800/70" />
            <div className="mt-3 h-8 w-12 animate-pulse rounded bg-slate-200/70 dark:bg-slate-800/70" />
          </div>
        ))}
      </div>
      <div className="glass-card rounded-3xl p-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="my-2 h-12 animate-pulse rounded-xl bg-slate-200/70 dark:bg-slate-800/70"
          />
        ))}
      </div>
    </div>
  );
}
