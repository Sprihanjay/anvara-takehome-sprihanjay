'use client';

export default function PublisherDashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="space-y-4">
      <div className="rounded border border-red-200 bg-red-50 p-4 text-red-600">
        {error.message || 'Something went wrong loading your ad slots.'}
      </div>
      <button
        onClick={reset}
        className="rounded-lg bg-[--color-primary] px-4 py-2 text-sm text-white hover:opacity-90"
      >
        Try again
      </button>
    </div>
  );
}
