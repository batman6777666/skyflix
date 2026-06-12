import { useState, useEffect } from "react";
import { Search as SearchIcon } from "lucide-react";
import { searchContent, fetchMovies, fetchSeries } from "../services/api";
import ContentGrid from "../components/ContentGrid";
import { useOutletContext, useSearchParams } from "react-router-dom";

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQuery);
  const [searchResults, setSearchResults] = useState([]);
  const [topSearches, setTopSearches] = useState<any[]>([]);
  const { onMovieClick } = useOutletContext<any>();

  useEffect(() => {
    const loadTopSearches = async () => {
      try {
        const moviesRes = await fetchMovies(1, 20);
        const seriesRes = await fetchSeries(1, 20);

        const movies = moviesRes.data || [];
        const series = seriesRes.data || [];

        const allContent = [...movies, ...series];

        if (allContent.length > 0) {
          const shuffled = allContent.sort(() => 0.5 - Math.random());
          setTopSearches(shuffled.slice(0, 10));
        }
      } catch (error) {
        console.error("Failed to load top searches", error);
      }
    };
    loadTopSearches();
  }, []);

  useEffect(() => {
    if (query.trim().length === 0) {
      setSearchResults([]);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      if (query.length > 0) {
        const data = await searchContent(query);
        setSearchResults(data);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    if (val.trim()) {
      setSearchParams({ q: val.trim() });
    } else {
      setSearchParams({});
    }
  };

  const displayData = query.trim().length > 0 ? searchResults : topSearches;
  const displayTitle = query.trim().length > 0 ? `Results for "${query}"` : "Top Searches";

  return (
    <div className="min-h-screen bg-[#0f1014] text-white pt-24 px-4 md:px-6 pb-28 md:pb-20">
      <div className="relative max-w-2xl mx-auto mb-6 md:mb-8">
        <SearchIcon className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          placeholder="Search movies, shows, genres..."
          className="w-full bg-[#16181f] border border-white/10 rounded-lg py-3 md:py-4 pl-10 md:pl-12 text-sm md:text-base text-white focus:outline-none focus:border-blue-500 transition-colors"
          value={query}
          onChange={handleQueryChange}
          autoFocus
        />
      </div>

      <ContentGrid
        title={displayTitle}
        data={displayData}
        onMovieClick={onMovieClick}
      />
    </div>
  );
}