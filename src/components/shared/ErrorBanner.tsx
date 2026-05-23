export default function ErrorBanner({
  message,
  onDismiss,
}: {
  message: string;
  onDismiss?: () => void;
}) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center justify-between">
      <p className="text-sm text-red-700">{message}</p>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-red-400 hover:text-red-600 text-lg leading-none"
        >
          &times;
        </button>
      )}
    </div>
  );
}
