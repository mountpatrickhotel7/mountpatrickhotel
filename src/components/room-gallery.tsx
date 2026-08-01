"use client";

import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { resolveImageUrl } from "@/lib/images";

export function RoomGallery({
  paths,
  alt,
}: {
  paths: string[];
  alt: string;
}) {
  const images = paths.length ? paths : [""];
  const [active, setActive] = React.useState(0);

  return (
    <div className="space-y-3">
      <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-muted shadow-soft">
        <Image
          src={resolveImageUrl(images[active])}
          alt={alt}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 66vw"
          className="object-cover"
        />
      </div>
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-3 sm:grid-cols-5">
          {images.map((p, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={cn(
                "relative aspect-[4/3] overflow-hidden rounded-lg",
                active === i
                  ? "ring-2 ring-gold ring-offset-2 ring-offset-background"
                  : "opacity-80 hover:opacity-100"
              )}
            >
              <Image
                src={resolveImageUrl(p)}
                alt={`${alt} ${i + 1}`}
                fill
                sizes="20vw"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
