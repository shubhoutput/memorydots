export default function Home() {
  return (
    <main className="mx-auto flex min-h-full w-full max-w-5xl flex-col justify-center px-6 py-20 sm:px-10">
      <p className="mb-5 text-sm font-semibold tracking-[0.2em] text-blue-400 uppercase">
        A memory and focus game
      </p>
      <h1 className="text-5xl font-semibold tracking-tight text-white sm:text-7xl">
        memorydots
      </h1>
      <p className="mt-6 max-w-xl text-lg leading-8 text-zinc-300 sm:text-xl">
        Two players. One growing sequence. Take turns remembering the dots and
        adding one more.
      </p>
    </main>
  );
}
