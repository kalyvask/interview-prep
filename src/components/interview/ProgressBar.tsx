export default function ProgressBar({
  current,
  total,
}: {
  current: number;
  total: number;
}) {
  const progress = ((current + 1) / total) * 100;

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-slate-600">
          Question {current + 1} of {total}
        </span>
        <span className="text-sm text-slate-400">{Math.round(progress)}%</span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-indigo-600 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
