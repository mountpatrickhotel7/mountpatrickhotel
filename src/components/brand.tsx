import Link from "next/link";
import { Mountain } from "lucide-react";
import { cn } from "@/lib/utils";
import { HOTEL } from "@/lib/constants";

export function Brand({
  className,
  href = "/",
  compact = false,
}: {
  className?: string;
  href?: string;
  compact?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn("group inline-flex items-center gap-2.5", className)}
    >
      <span className="grid size-9 place-items-center rounded-md bg-primary text-primary-foreground transition-transform group-hover:-rotate-6">
        <Mountain className="size-5" />
      </span>
      {!compact && (
        <span className="flex flex-col leading-none">
          <span className="font-heading text-lg font-semibold tracking-tight">
            {HOTEL.shortName}
          </span>
          <span className="text-[10px] uppercase tracking-[0.2em] text-gold">
            Hotel
          </span>
        </span>
      )}
    </Link>
  );
}
