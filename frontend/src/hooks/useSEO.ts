import { useEffect } from "react";

export function useSEO(props: { title?: string; description?: string }) {
  useEffect(() => {
    const base = "Skyflix";
    document.title = props.title
      ? `${props.title} | ${base}`
      : `${base} — Free Movies & TV Series Streaming`;
    const meta = document.querySelector('meta[name="description"]');
    if (meta && props.description) {
      meta.setAttribute("content", props.description);
    }
  }, [props.title, props.description]);
}
