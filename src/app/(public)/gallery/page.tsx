import { PageHeader } from "@/components/page-header";
import { GalleryLightbox } from "@/components/gallery-lightbox";

export const metadata = { title: "Gallery" };

const PHOTOS = [
  { src: "/images/gallery/exterior.jpg", span: "md:col-span-2 md:row-span-2", alt: "Mount Patrick Hotel facade" },
  { src: "/images/gallery/pool.jpg", span: "", alt: "Swimming pool" },
  { src: "/images/gallery/room-executive.jpg", span: "", alt: "Executive room" },
  { src: "/images/gallery/lounge.jpg", span: "md:col-span-2", alt: "Rooftop lounge" },
  { src: "/images/gallery/reception.jpg", span: "", alt: "Reception" },
  { src: "/images/gallery/room-deluxe.jpg", span: "", alt: "Deluxe room" },
  { src: "/images/gallery/terrace.jpg", span: "md:col-span-2", alt: "Garden terrace" },
  { src: "/images/gallery/bar.jpg", span: "", alt: "Bar and games" },
  { src: "/images/gallery/room-standard.jpg", span: "", alt: "Standard room" },
  { src: "/images/gallery/poolside.jpg", span: "", alt: "Poolside deck" },
  { src: "/images/gallery/balcony.jpg", span: "", alt: "Private balcony view" },
  { src: "/images/gallery/courtyard.jpg", span: "md:col-span-2", alt: "Hotel courtyard" },
];

export default function GalleryPage() {
  return (
    <>
      <PageHeader
        eyebrow="A Visual Tour"
        title="Hotel Gallery"
        description="A glimpse into the spaces, light, and details that make Mount Patrick a sanctuary."
      />
      <section className="container-page py-16">
        <GalleryLightbox photos={PHOTOS} />
      </section>
    </>
  );
}
