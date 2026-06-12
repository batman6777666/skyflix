export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function getMovieEmbedUrl(title: string, year: string): string {
  const slug = slugify(title);
  const y = year.split("-")[0] || year;
  return `https://skyflixer.fun/movie/${slug}-${y}?play=true`;
}

export function getTVEmbedUrl(title: string, year: string, season: number, episode: number, episodeName?: string): string {
  const slug = slugify(title);
  const y = year.split("-")[0] || year;
  const epSlug = episodeName ? slugify(episodeName) : `episode-${episode}`;
  return `https://skyflixer.fun/tv-shows/${slug}-${y}-${epSlug}`;
}
