import { useEffect, useState, useRef, useCallback } from "react";
import { fetchMovies } from "../services/api";
import ContentGrid from "../components/ContentGrid";
import { useOutletContext } from "react-router-dom";

export default function Movies() {
  const [movies, setMovies] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const { onMovieClick } = useOutletContext<any>();
  const observerRef = useRef<HTMLDivElement>(null);

  const loadMovies = useCallback(async (pageNum: number) => {
    if (loading) return;
    setLoading(true);

    try {
      const res = await fetchMovies(pageNum, 20, "latest");
      const newMovies = res.data || [];

      if (pageNum === 1) {
        setMovies(newMovies);
      } else {
        setMovies(prev => [...prev, ...newMovies]);
      }
      setHasMore(pageNum < (res.totalPages || 1));
      setPage(pageNum);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [loading]);

  useEffect(() => {
    loadMovies(1);
  }, []);

  useEffect(() => {
    if (!observerRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadMovies(page + 1);
        }
      },
      { rootMargin: "300px" }
    );
    observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [hasMore, loading, page, loadMovies]);

  return (
    <>
      <ContentGrid title="All Movies" data={movies} onMovieClick={onMovieClick} />
      {loading && (
        <div className="flex justify-center pb-20 bg-[#0f1014]">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      <div ref={observerRef} className="h-10" />
    </>
  );
}