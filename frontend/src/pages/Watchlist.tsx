import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { Bookmark, Film, Tv, Trash2 } from "lucide-react";
import { getWatchlist, removeFromWatchlist } from "../utils/watchlist";

type Filter = "all" | "Movie" | "Series";

export default function Watchlist() {
  const [items, setItems] = useState<any[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [version, setVersion] = useState(0);
  const context = useOutletContext<any>();
  const onMovieClick = context?.onMovieClick || (() => {});

  useEffect(() => {
    try {
      setItems(getWatchlist());
    } catch {
      setItems([]);
    }
    const handle = (e: StorageEvent) => {
      if (e.key === "skyflix_watchlist") setVersion((v) => v + 1);
    };
    window.addEventListener("storage", handle);
    return () => window.removeEventListener("storage", handle);
  }, []);

  useEffect(() => {
    try {
      setItems(getWatchlist());
    } catch {
      setItems([]);
    }
  }, [version]);

  const filtered = filter === "all" ? items : items.filter((i: any) => i.type === filter);

  const handleCardClick = (item: any) => {
    if (onMovieClick) {
      onMovieClick({ ...item, type: item.type === "Series" ? "Series" : "Movie" });
    }
  };

  const handleRemove = (e: React.MouseEvent, item: any) => {
    e.stopPropagation();
    try {
      removeFromWatchlist(item.id, item.type);
      setVersion((v) => v + 1);
    } catch {}
  };

  const handleClearAll = () => {
    try {
      localStorage.removeItem("skyflix_watchlist");
      setVersion((v) => v + 1);
    } catch {}
  };

  return (
    <div className="min-h-screen bg-[#0f1014] text-white pt-24 px-4 md:px-6 pb-28 md:pb-20">
      <div className="flex items-start justify-between mb-4 md:mb-6 gap-4">
        <h1 className="text-xl md:text-3xl font-black italic flex items-center gap-2 md:gap-3 flex-wrap">
          <Bookmark size={20} className="text-sky-400 flex-shrink-0" /> <span>My Watchlist</span>
          <span className="text-sm md:text-base font-normal text-gray-500 not-italic normal-case">
            ({filtered.length} {filter === "all" ? "items" : filter.toLowerCase()})
          </span>
        </h1>
        {items.length > 0 && (
          <button onClick={handleClearAll} className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm text-red-400 hover:text-red-300 transition-colors flex-shrink-0">
            <Trash2 size={14} /> Clear All
          </button>
        )}
      </div>

      <div className="flex gap-1.5 md:gap-2 mb-6 md:mb-8 flex-wrap">
        {(["all", "Movie", "Series"] as const).map((key) => {
          const labels: Record<string, string> = { all: "All", Movie: "Movies", Series: "Series" };
          const icons: Record<string, any> = { all: Bookmark, Movie: Film, Series: Tv };
          const Icon = icons[key];
          return (
            <button
              key={key}
              onClick={() => setFilter(key as Filter)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                filter === key
                  ? "bg-sky-500/20 text-sky-400 border border-sky-500/30"
                  : "bg-white/5 text-gray-400 hover:text-white border border-transparent"
              }`}
            >
              <Icon size={16} /> {labels[key]}
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="text-gray-500 text-center mt-20">
          {items.length === 0
            ? "Your watchlist is empty. Browse movies and series and tap the + icon to add them."
            : "No items match this filter."}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
          {filtered.map((item: any) => (
            <div
              key={String(item.id) + String(item.type)}
              className="relative group cursor-pointer transition-transform duration-300 hover:scale-105"
              onClick={() => handleCardClick(item)}
            >
              {item.poster_path ? (
                <img src={item.poster_path} alt={item.title || ""} className="rounded-lg w-full h-auto object-cover aspect-[2/3]" />
              ) : (
                <div className="rounded-lg w-full aspect-[2/3] bg-gray-800 flex items-center justify-center text-gray-600 text-xs">No Image</div>
              )}
              <div className="absolute top-2 right-2 z-10">
                <button onClick={(e) => handleRemove(e, item)} className="p-1.5 rounded-full bg-red-600/80 hover:bg-red-600 transition-all" title="Remove">
                  <Trash2 size={14} className="text-white" />
                </button>
              </div>
              <div className="mt-2 px-1">
                <h3 className="text-sm font-semibold truncate">{item.title || "Untitled"}</h3>
                <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${item.type === "Series" ? "text-blue-400 bg-blue-400/10" : "text-green-400 bg-green-400/10"}`}>
                    {item.type === "Series" ? "TV" : "Movie"}
                  </span>
                  <span>{item.release_date ? String(item.release_date).split("-")[0] : ""}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}