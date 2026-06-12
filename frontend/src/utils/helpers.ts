export function getImageUrl(path: string | undefined | null, quality: "w500" | "original" = "w500"): string | undefined {
  if (!path) return undefined;
  if (path.startsWith("http")) return path;
  return `https://image.tmdb.org/t/p/${quality}${path}`;
}

export function getYear(dateStr: string | undefined): string {
  if (!dateStr) return "";
  return dateStr.split("-")[0];
}
