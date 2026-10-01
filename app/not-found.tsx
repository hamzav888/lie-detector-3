import Link from "next/link";
import Wordmark from "@/components/Wordmark";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-sky px-4 text-center">
      <div className="card-pop max-w-md bg-white p-8">
        <Wordmark className="justify-center" />
        <p className="mt-6 font-display text-6xl font-extrabold leading-none text-magenta">404</p>
        <h1 className="mt-2 font-display text-2xl font-extrabold">That page is lying to you.</h1>
        <p className="mt-2 font-semibold text-ink/70">It doesn&apos;t exist. The needle is unimpressed.</p>
        <Link href="/" className="btn-pop mt-6 bg-lime text-ink">
          BACK TO SAFETY
        </Link>
      </div>
    </main>
  );
}
