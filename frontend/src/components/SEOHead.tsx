import { useEffect } from "react";

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
  releaseDate?: string;
  rating?: number;
}

export default function SEOHead({ title, description, image, url, releaseDate }: SEOProps) {
  useEffect(() => {
    const siteName = "Skyflix";
    const fullTitle = title ? `${title} | ${siteName}` : `${siteName} — Free Movies & TV Series Streaming`;
    const desc = description || "Stream the latest movies and TV series for free.";

    document.title = fullTitle;

    setMeta("description", desc);
    setMeta("og:title", fullTitle);
    setMeta("og:description", desc);
    setMeta("twitter:title", fullTitle);
    setMeta("twitter:description", desc);
    if (image) {
      setMeta("og:image", image);
      setMeta("twitter:image", image);
    }
    if (url) setMeta("og:url", url);
    if (releaseDate) setMeta("article:published_time", releaseDate);
  }, [title, description, image, url, releaseDate]);

  return null;
}

function setMeta(name: string, content: string) {
  let el = document.querySelector(`meta[name="${name}"], meta[property="${name}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement("meta");
    if (name.startsWith("og") || name.startsWith("article") || name.startsWith("twitter")) {
      el.setAttribute("property", name);
    } else {
      el.setAttribute("name", name);
    }
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}
