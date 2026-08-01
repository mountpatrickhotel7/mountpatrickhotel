const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";

export const PLACEHOLDER_ROOM =
  "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80";

/**
 * Resolve a room_images.storage_path to a usable URL.
 * Absolute URLs (seed data) pass through; storage keys resolve to the public bucket URL.
 */
export function resolveImageUrl(
  path: string | null | undefined,
  bucket = "room-images"
): string {
  if (!path) return PLACEHOLDER_ROOM;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`;
}
