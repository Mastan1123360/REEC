import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-6 py-32 text-center">
      <h1 className="text-4xl font-bold tracking-tight">404</h1>
      <p className="mt-3 text-muted-foreground">
        This lesson doesn&rsquo;t exist yet — or the slug doesn&rsquo;t match anything
        under <code className="rounded bg-muted px-1.5 py-0.5">/content</code>.
      </p>
      <Link href="/" className="mt-6 text-sm font-medium text-primary underline underline-offset-4">
        Back to the dashboard
      </Link>
    </div>
  );
}
