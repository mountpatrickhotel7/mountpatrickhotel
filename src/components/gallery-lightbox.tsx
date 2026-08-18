"use client";

import * as React from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface GalleryPhoto {
  src: string;
  alt: string;
  span?: string;
  label?: string;
}

export function GalleryLightbox({
  photos,
  gridClassName = "grid auto-rows-[220px] grid-flow-row-dense grid-cols-2 gap-4 md:grid-cols-4",
}: {
  photos: GalleryPhoto[];
  gridClassName?: string;
}) {
  const [activeIndex, setActiveIndex] = React.useState<number | null>(null);
  const open = activeIndex !== null;

  const show = React.useCallback(
    (delta: number) => {
      setActiveIndex((current) => {
        if (current === null) return current;
        return (current + delta + photos.length) % photos.length;
      });
    },
    [photos.length]
  );

  React.useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "ArrowRight") show(1);
      if (event.key === "ArrowLeft") show(-1);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, show]);

  const active = activeIndex !== null ? photos[activeIndex] : null;

  return (
    <>
      <div className={gridClassName}>
        {photos.map((photo, index) => (
          <button
            key={photo.src}
            type="button"
            onClick={() => setActiveIndex(index)}
            aria-label={`View larger photo: ${photo.alt}`}
            className={cn(
              "group relative overflow-hidden rounded-2xl shadow-soft outline-none focus-visible:ring-2 focus-visible:ring-gold",
              photo.span
            )}
          >
            <Image
              src={photo.src}
              alt={photo.alt}
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            {photo.label && (
              <>
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
                <span className="absolute bottom-4 left-4 font-heading text-lg font-semibold text-white drop-shadow">
                  {photo.label}
                </span>
              </>
            )}
          </button>
        ))}
      </div>

      <Dialog open={open} onOpenChange={(isOpen) => !isOpen && setActiveIndex(null)}>
        <DialogContent
          showCloseButton
          className="max-w-4xl border-none bg-transparent p-0 shadow-none ring-0 sm:max-w-4xl"
        >
          <DialogTitle className="sr-only">{active?.alt}</DialogTitle>
          {active && (
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-black">
              <Image src={active.src} alt={active.alt} fill sizes="90vw" className="object-contain" priority />
            </div>
          )}
          <Button type="button" variant="secondary" size="icon" onClick={() => show(-1)} aria-label="Previous photo" className="absolute top-1/2 left-2 -translate-y-1/2 rounded-full">
            <ChevronLeft className="size-5" />
          </Button>
          <Button type="button" variant="secondary" size="icon" onClick={() => show(1)} aria-label="Next photo" className="absolute top-1/2 right-2 -translate-y-1/2 rounded-full">
            <ChevronRight className="size-5" />
          </Button>
          {active && activeIndex !== null && (
            <p className="pt-2 text-center text-sm text-white/90">
              {active.alt} · {activeIndex + 1} / {photos.length}
            </p>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
