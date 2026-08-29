// Loading skeleton shown instantly while dashboard data is being fetched
// This makes the page feel fast even if the DB query takes a moment
export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-12 px-4 sm:px-6">
      {/* Hero skeleton */}
      <div className="max-w-6xl w-full">
        <div className="bg-blue-600/20 rounded-[2rem] h-36 mb-10 animate-pulse" />

        {/* Section heading skeleton */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-slate-200 animate-pulse" />
          <div className="h-7 w-56 bg-slate-200 rounded-lg animate-pulse" />
        </div>

        {/* Cards skeleton */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white p-6 rounded-3xl border border-slate-100 space-y-4 animate-pulse"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="flex justify-between">
                <div className="h-6 w-24 bg-slate-200 rounded-md" />
                <div className="h-6 w-16 bg-slate-200 rounded-md" />
              </div>
              <div className="h-7 w-3/4 bg-slate-200 rounded-md" />
              <div className="h-4 w-1/2 bg-slate-200 rounded-md" />
              <div className="bg-slate-100 rounded-2xl p-4 space-y-3">
                <div className="h-4 w-full bg-slate-200 rounded" />
                <div className="h-px bg-slate-200" />
                <div className="h-4 w-2/3 bg-slate-200 rounded" />
              </div>
              <div className="h-12 bg-slate-200 rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
