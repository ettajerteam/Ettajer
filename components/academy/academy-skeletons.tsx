import { cn } from "@/lib/utils";

function Bone({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-md bg-neutral-200/70 motion-safe:animate-pulse",
        className,
      )}
    />
  );
}

export function AcademyHomeSkeleton() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <div className="mx-auto max-w-2xl space-y-4 text-center">
        <Bone className="mx-auto h-3 w-28" />
        <Bone className="mx-auto h-10 w-40" />
        <Bone className="mx-auto h-10 w-36" />
        <Bone className="mx-auto h-10 w-32" />
        <Bone className="mx-auto mt-2 h-4 w-64 max-w-full" />
        <div className="flex justify-center gap-3 pt-4">
          <Bone className="h-11 w-36 rounded-full" />
          <Bone className="h-11 w-36 rounded-full" />
        </div>
      </div>

      <div className="mx-auto mt-14 max-w-2xl">
        <Bone className="h-36 w-full rounded-2xl" />
      </div>

      <div className="mt-16 space-y-3">
        <Bone className="h-4 w-40" />
        <Bone className="h-3 w-56" />
        <div className="grid gap-4 pt-4 md:grid-cols-2">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={cn(
                "space-y-4 rounded-2xl border border-black/[0.06] bg-white p-6 sm:p-8",
                i === 0 && "md:col-span-2",
              )}
            >
              <Bone className="h-3 w-20" />
              <Bone className="h-7 w-3/4" />
              <Bone className="h-4 w-full" />
              <Bone className="h-4 w-5/6" />
            </div>
          ))}
        </div>
      </div>

      <div className="mt-16 space-y-4">
        <Bone className="h-4 w-28" />
        <div className="flex gap-4">
          {[0, 1, 2, 3, 4].map((i) => (
            <Bone key={i} className="h-8 w-8 rounded-full" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function AcademySubjectSkeleton() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:py-16">
      <Bone className="h-3 w-24" />
      <Bone className="mt-4 h-10 w-full max-w-md" />
      <Bone className="mt-2 h-10 w-full max-w-sm" />
      <Bone className="mt-4 h-4 w-full max-w-lg" />
      <Bone className="mt-8 h-10 w-36 rounded-full" />
      <div className="mt-14 space-y-4">
        <Bone className="h-3 w-28" />
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="flex gap-4 border-t border-black/[0.06] py-5">
            <Bone className="h-8 w-8 shrink-0 rounded-full" />
            <div className="flex-1 space-y-2">
              <Bone className="h-3 w-20" />
              <Bone className="h-5 w-48" />
              <Bone className="h-3 w-64 max-w-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AcademyLessonSkeleton() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <Bone className="h-3 w-40" />
      <Bone className="mt-4 h-9 w-full max-w-lg" />
      <Bone className="mt-8 aspect-video w-full rounded-2xl" />
      <div className="mt-8 space-y-3">
        <Bone className="h-4 w-full" />
        <Bone className="h-4 w-full" />
        <Bone className="h-4 w-5/6" />
      </div>
    </div>
  );
}

export function AcademyLearningSkeleton() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:py-16">
      <Bone className="h-8 w-40" />
      <Bone className="mt-2 h-4 w-56" />
      <div className="mt-10 space-y-3">
        <Bone className="h-3 w-32" />
        <Bone className="h-24 w-full rounded-2xl" />
      </div>
      <div className="mt-10 space-y-4">
        <Bone className="h-3 w-36" />
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="space-y-2 py-3">
            <div className="flex justify-between">
              <Bone className="h-4 w-32" />
              <Bone className="h-4 w-10" />
            </div>
            <Bone className="h-1.5 w-full rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
