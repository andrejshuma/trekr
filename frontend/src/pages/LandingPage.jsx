export default function LandingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="w-full max-w-md rounded-xl border p-6 text-center">
        <h1 className="text-2xl font-semibold">Landing Page</h1>
        <p className="mt-2 text-sm opacity-80">
          Tailwind is wired up — replace this with real content.
        </p>
        <div className="mt-6 grid grid-cols-2 gap-3">
          <div className="h-10 rounded-md bg-black/10" />
          <div className="h-10 rounded-md bg-black/10" />
        </div>
      </div>
    </div>
  );
}
