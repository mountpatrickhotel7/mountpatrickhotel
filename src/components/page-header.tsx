export function PageHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="border-b border-border bg-sidebar">
      <div className="container-page py-14 text-center md:py-20">
        {eyebrow && (
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">
            {eyebrow}
          </span>
        )}
        <h1 className="mt-3 font-heading text-4xl font-semibold md:text-5xl">
          {title}
        </h1>
        {description && (
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
