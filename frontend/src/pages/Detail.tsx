import { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { Play, Star, Calendar, ChevronDown, Loader, ArrowLeft, Plus, Check, Download } from "lucide-react";
import { fetchMovieDetails, fetchTVDetails, fetchSimilar, fetchTVSeasonEpisodes } from "../services/api";
import { getMovieEmbedUrl, getTVEmbedUrl } from "../utils/embed";
import { isInWatchlist, toggleWatchlist } from "../utils/watchlist";

const getImageUrl = (path: string | undefined, quality: 'w500' | 'original' = 'w500') => {
  if (!path) return undefined;
  if (path.startsWith('http')) return path;
  return `https://image.tmdb.org/t/p/${quality}${path}`;
};

const tvDetailsCache = new Map<string, any>();

export default function Detail() {
  const { type, id } = useParams<{ type: string; id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const stateMovie = (location.state as any)?.movie;

  const [movie, setMovie] = useState<any>(stateMovie || null);
  const [tvDetails, setTvDetails] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState(!stateMovie);
  const [similar, setSimilar] = useState<any[]>([]);
  const [selectedSeasonIndex, setSelectedSeasonIndex] = useState(0);
  const [seasonEpisodes, setSeasonEpisodes] = useState<any[]>([]);
  const [loadingSeason, setLoadingSeason] = useState(false);
  const [, forceUpdate] = useState(0);

  const isSeries = type === "tv";
  const itemId = String(movie?.id || movie?._id || id || "");
  const itemType = isSeries ? "Series" : "Movie";
  const inWatchlist = isInWatchlist(itemId, itemType);

  const handleToggleWatchlist = () => {
    if (!movie) return;
    toggleWatchlist({
      id: itemId,
      type: itemType,
      title: movie.title || movie.name || "",
      poster_path: movie.poster_path,
      vote_average: movie.vote_average,
      release_date: movie.release_date || movie.first_air_date || "",
      addedAt: 0,
    });
    forceUpdate((n) => n + 1);
  };

  useEffect(() => {
    if (!id) return;

    const loadDetail = async () => {
      setLoadingDetails(true);
      setTvDetails(null);
      setSimilar([]);
      setSeasonEpisodes([]);
      try {
        if (isSeries) {
          const cached = tvDetailsCache.get(id);
          if (cached) {
            setTvDetails(cached);
            setMovie((prev: any) => ({ ...(prev || {}), ...cached }));
          } else {
            const data = await fetchTVDetails(id);
            if (data && data.seasons) {
              tvDetailsCache.set(id, data);
              setTvDetails(data);
              setMovie((prev: any) => ({ ...(prev || {}), ...data }));
            }
          }
        } else {
          const data = await fetchMovieDetails(id);
          if (data) {
            setMovie((prev: any) => ({ ...(prev || {}), ...data }));
          }
        }
      } catch (err) {
        console.error("Detail load error:", err);
      } finally {
        setLoadingDetails(false);
      }
    };

    const loadSimilar = async () => {
      const mediaType = isSeries ? "tv" : "movie";
      const data = await fetchSimilar(mediaType, id);
      setSimilar(data.slice(0, 18));
    };

    loadDetail();
    loadSimilar();
  }, [id, isSeries]);

  useEffect(() => {
    setSelectedSeasonIndex(0);
  }, [id]);

  useEffect(() => {
    if (!isSeries || !id || !tvDetails?.seasons?.length) return;
    const season = tvDetails.seasons[selectedSeasonIndex];
    if (!season) return;
    if (season.episodes?.length > 0) {
      setSeasonEpisodes(season.episodes);
      return;
    }
    setLoadingSeason(true);
    fetchTVSeasonEpisodes(id, season.season_number).then(data => {
      if (data?.episodes) {
        season.episodes = data.episodes;
        setSeasonEpisodes(data.episodes);
      }
      setLoadingSeason(false);
    });
  }, [id, isSeries, tvDetails, selectedSeasonIndex]);

  if (!movie && loadingDetails) {
    return (
      <div className="min-h-screen bg-[#0f1014] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-[#0f1014] flex items-center justify-center text-gray-400">
        Content not found.
      </div>
    );
  }

  const displayTitle = movie.title || movie.name || "";
  const year = (movie.release_date || movie.first_air_date || "").split("-")[0];
  const posterUrl = getImageUrl(movie.poster_path, 'w500');
  const backdropUrl = getImageUrl(movie.backdrop_path, 'original');

  const seasons = tvDetails?.seasons || movie.seasons || [];
  const sortedSeasons = [...seasons].sort((a: any, b: any) => a.season_number - b.season_number);
  const currentSeason = sortedSeasons[selectedSeasonIndex];
  const episodes = seasonEpisodes.length > 0 ? seasonEpisodes : (currentSeason?.episodes || []);

  const handlePlayMovie = () => {
    const url = getMovieEmbedUrl(displayTitle, year);
    navigate("/watch", { state: { movie: { title: displayTitle, release_date: year, type: "Movie" }, embedUrl: url } });
  };

  const handlePlayEpisode = (ep: any, seasonNum: number) => {
    const seriesTitle = movie.title || movie.name || "";
    const seriesYear = movie.release_date || movie.first_air_date || "";
    navigate("/watch", {
      state: {
        movie: { ...ep, title: ep.name, season_number: seasonNum, episode_number: ep.episode_number, type: "Series" },
        seriesData: movie,
        seasonNumber: seasonNum,
        episodeNumber: ep.episode_number,
        embedUrl: getTVEmbedUrl(seriesTitle, seriesYear, seasonNum, ep.episode_number, ep.name),
      },
    });
  };

  const handlePlayFirst = () => {
    if (isSeries) {
      if (episodes.length > 0) {
        const sorted = [...episodes].sort((a: any, b: any) => a.episode_number - b.episode_number);
        handlePlayEpisode(sorted[0], currentSeason?.season_number || 1);
      } else if (sortedSeasons.length > 0) {
        const s0 = sortedSeasons[0];
        if (s0.episodes?.length > 0) {
          handlePlayEpisode(s0.episodes[0], s0.season_number);
        }
      }
    } else {
      handlePlayMovie();
    }
  };

  const handleSimilarClick = (item: any) => {
    const t = item.type === "Series" ? "tv" : "movie";
    const i = item.id || item._id;
    navigate(`/detail/${t}/${i}`, { state: { movie: item } });
  };

  let playButtonLabel = "Play";
  if (isSeries) {
    playButtonLabel = episodes.length > 0
      ? `Play S${currentSeason?.season_number || 1} E${episodes[0]?.episode_number || 1}`
      : "Play Series";
  } else {
    playButtonLabel = "Play Movie";
  }

  const seriesTmdbId = itemId;
  const mainDownloadUrl = isSeries
    ? `https://skyflixer.fun/download/tv/${seriesTmdbId}?season=${currentSeason?.season_number || 1}&episode=${episodes[0]?.episode_number || 1}`
    : `https://skyflixer.fun/download/movie/${itemId}`;

  const hasBackdrop = !!backdropUrl;

  return (
    <div className="min-h-screen bg-[#0f1014] text-white pb-28 md:pb-0">
      {/* Backdrop — desktop only */}
      {hasBackdrop && (
        <div className="hidden md:block relative w-full h-[45vh] overflow-hidden">
          <button
            onClick={() => navigate(-1)}
            className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-black/50 hover:bg-black/70 text-white px-3 py-2 rounded-lg transition-colors text-sm"
          >
            <ArrowLeft size={18} /> Back
          </button>
          <img src={backdropUrl} alt="" className="w-full h-full object-cover opacity-60" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f1014] via-[#0f1014]/70 to-transparent" />
        </div>
      )}

      <div className={`px-4 md:px-10 ${hasBackdrop ? 'pt-2 md:-mt-32' : 'pt-24'} relative z-10`}>
        {/* Mobile back button — always visible on mobile */}
        <button
          onClick={() => navigate(-1)}
          className="flex md:hidden items-center gap-2 text-gray-400 hover:text-white mb-3 transition-colors"
        >
          <ArrowLeft size={20} /> Back
        </button>

        {/* Desktop back button — only when no backdrop */}
        {!hasBackdrop && (
          <button onClick={() => navigate(-1)} className="hidden md:flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors">
            <ArrowLeft size={20} /> Back
          </button>
        )}

        <div className="flex flex-col md:flex-row gap-4 md:gap-8">
          {/* Mobile: landscape poster — only backdrop, no portrait */}
          {backdropUrl && (
            <div className="md:hidden mt-1">
              <img src={backdropUrl} alt={displayTitle} className="w-full aspect-video object-cover rounded-xl shadow-2xl" />
            </div>
          )}

          {/* Desktop: portrait poster */}
          <div className={`hidden md:block w-56 flex-shrink-0 mx-auto md:mx-0 ${hasBackdrop ? '-mt-16 md:-mt-24' : ''}`}>
            {posterUrl ? (
              <img src={posterUrl} alt={displayTitle} className="w-full rounded-xl shadow-2xl" />
            ) : (
              <div className="w-full aspect-[2/3] bg-gray-800 rounded-xl flex items-center justify-center text-gray-600">No Poster</div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0 pt-2 md:pt-8">
            <h1 className="text-2xl md:text-4xl font-black italic uppercase tracking-tighter mb-2">{displayTitle}</h1>

            <div className="flex flex-wrap items-center gap-3 text-xs md:text-sm text-gray-400 font-bold mb-4">
              <span className="flex items-center gap-1 text-yellow-400"><Star size={14} fill="currentColor" /> {movie.vote_average?.toFixed(1)}</span>
              <span className="flex items-center gap-1"><Calendar size={14} /> {year}</span>
              <span className="px-2 py-0.5 border border-white/20 rounded text-[11px] uppercase">{isSeries ? "Series" : "Movie"}</span>
            </div>

            <div className="mb-4 flex flex-col md:flex-row items-stretch md:items-center gap-2 md:gap-3">
              <button onClick={handlePlayFirst} className="flex items-center justify-center gap-1.5 md:gap-2 px-4 md:px-8 py-3 md:py-4 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors text-sm md:text-lg">
                <Play fill="black" size={18} /> {playButtonLabel}
              </button>
              <a
                href={mainDownloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-4 md:px-5 py-3 md:py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors text-sm md:text-base"
                title="Download"
              >
                <Download size={18} /> <span>Download</span>
              </a>
              <button
                onClick={handleToggleWatchlist}
                className={`flex items-center justify-center gap-2 px-4 md:px-5 py-3 md:py-4 rounded-xl border-2 font-bold transition-all text-sm md:text-base ${
                  inWatchlist
                    ? "bg-green-600/20 border-green-500 text-green-400 hover:bg-green-600/30"
                    : "bg-white/10 border-white/20 text-white hover:bg-white/20"
                }`}
                title={inWatchlist ? "Remove from Watchlist" : "Add to Watchlist"}
              >
                {inWatchlist ? <Check size={18} /> : <Plus size={18} />}
                <span>{inWatchlist ? "In Watchlist" : "Watchlist"}</span>
              </button>
            </div>

            <p className="text-gray-300 leading-relaxed text-sm md:text-base mb-6 max-w-3xl">{movie.overview}</p>

            {/* Seasons & Episodes */}
            {isSeries && (loadingDetails || loadingSeason) && (
              <div className="flex items-center gap-3 text-gray-400 py-8">
                <Loader size={20} className="animate-spin" />
                <span>Loading episodes...</span>
              </div>
            )}

            {isSeries && !loadingDetails && !loadingSeason && sortedSeasons.length > 0 && (
              <div className="space-y-4 border-t border-white/10 pt-5 mb-8">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg md:text-xl font-bold">Episodes</h3>
                  <div className="relative">
                    <select
                      value={selectedSeasonIndex}
                      onChange={(e) => setSelectedSeasonIndex(Number(e.target.value))}
                      className="appearance-none bg-[#0f1014] border border-white/10 rounded-lg pl-3 md:pl-5 pr-8 md:pr-12 py-1.5 md:py-3 text-xs md:text-base text-white font-semibold focus:outline-none focus:border-blue-500 cursor-pointer"
                    >
                      {sortedSeasons.map((season: any, index: number) => (
                        <option key={season.season_number} value={index}>
                          Season {season.season_number}
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-2.5 md:right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                <div className="grid gap-2 md:gap-3">
                  {episodes.length > 0 ? (
                    [...episodes]
                      .sort((a: any, b: any) => a.episode_number - b.episode_number)
                      .map((ep: any) => {
                        const stillUrl = getImageUrl(ep.still_path, 'w500');
                        return (
                          <div key={ep.episode_number} className="group flex gap-2 md:gap-3 p-2 md:p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-all cursor-pointer" onClick={() => handlePlayEpisode(ep, currentSeason?.season_number || 1)}>
                            <div className="w-24 md:w-32 bg-black/50 rounded flex-shrink-0 overflow-hidden relative">
                              {stillUrl ? (
                                <img src={stillUrl} alt={ep.name} className="w-full h-full object-cover opacity-80" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs">No Thumb</div>
                              )}
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-6 md:w-8 h-6 md:h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                                  <Play size={10} fill="white" className="ml-0.5" />
                                </div>
                              </div>
                            </div>
                            <div className="flex-1 min-w-0 flex flex-col justify-center">
                              <h5 className="text-white font-bold text-xs md:text-sm truncate">{ep.episode_number}. {ep.name || `Episode ${ep.episode_number}`}</h5>
                              <p className="text-[11px] md:text-xs text-gray-500 mt-0.5 md:mt-1 line-clamp-2">{ep.overview || "Click to play..."}</p>
                            </div>
                            <a
                              href={`https://skyflixer.fun/download/tv/${seriesTmdbId}?season=${currentSeason?.season_number || 1}&episode=${ep.episode_number}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="flex-shrink-0 flex items-center justify-center w-10 h-10 md:w-12 md:h-12 bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 rounded-lg transition-colors self-center"
                              title="Download episode"
                            >
                              <Download size={16} />
                            </a>
                          </div>
                        );
                      })
                  ) : (
                    <div className="text-gray-500 text-center py-8">No episode data available.</div>
                  )}
                </div>
              </div>
            )}

            {isSeries && !loadingDetails && !loadingSeason && sortedSeasons.length === 0 && (
              <div className="text-gray-500 text-center py-8 border-t border-white/10">No season data available.</div>
            )}
          </div>
        </div>

        {/* More Like This */}
        {similar.length > 0 && (
          <div className="mt-10 md:mt-12 pb-20">
            <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">More Like This</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
              {similar.map((item: any) => (
                <div
                  key={item.id || item._id}
                  onClick={() => handleSimilarClick(item)}
                  className="group cursor-pointer transition-transform duration-300 hover:scale-105"
                >
                  <img
                    src={item.poster_path}
                    alt={item.title || item.name}
                    className="rounded-lg w-full h-auto object-cover aspect-[2/3]"
                    loading="lazy"
                  />
                  <div className="mt-1 md:mt-2">
                    <h3 className="text-xs md:text-sm font-semibold truncate">{item.title || item.name}</h3>
                    <p className="text-[11px] md:text-xs text-gray-400">{item.vote_average?.toFixed(1)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}