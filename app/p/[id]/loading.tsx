export default function PublicProofLoading() {
  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="space-y-3 border-b border-zinc-200 pb-8">
          <div className="h-3 w-24 animate-shimmer rounded-sm" />
          <div className="h-3 w-48 animate-shimmer rounded-sm" />
          <div className="h-3 w-32 animate-shimmer rounded-sm" />
        </div>
        <div className="mt-10 space-y-4">
          <div className="h-3 w-20 animate-shimmer rounded-sm" />
          <div className="h-10 w-full max-w-xl animate-shimmer rounded-sm" />
          <div className="h-10 w-2/3 animate-shimmer rounded-sm" />
        </div>
        <div className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="space-y-2">
              <div className="h-2 w-16 animate-shimmer rounded-sm" />
              <div className="h-4 w-24 animate-shimmer rounded-sm" />
            </div>
          ))}
        </div>
        <div className="mt-14 space-y-3">
          <div className="h-3 w-28 animate-shimmer rounded-sm" />
          <div className="h-4 w-full animate-shimmer rounded-sm" />
          <div className="h-4 w-11/12 animate-shimmer rounded-sm" />
          <div className="h-4 w-4/5 animate-shimmer rounded-sm" />
        </div>
      </div>
    </div>
  );
}
