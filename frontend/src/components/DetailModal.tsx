import { useState, useEffect } from "react";
import { Dialog, DialogPanel, DialogBackdrop } from "@headlessui/react";
import { X, Play, Star, Calendar, ImageIcon, ChevronDown, Loader } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { fetchTVDetails, fetchTVSeasonEpisodes } from "../services/api";
import { getMovieEmbedUrl, getTVEmbedUrl, slugify } from "../utils/embed";

const getImageUrl = (path: string | undefined, quality: 'w500' | 'original' = 'w500') => {
  if (!path) return undefined;
  if (path.startsWith('http')) return path;
  return `https://image.tmdb.org/t/p/${quality}${path}`;
}

interface DetailModalProps {
  isOpen: boolean;
  movie: any;
  onClose: () => void;
}

export default function DetailModal({ isOpen, movie, onClose }: DetailModalProps) {
  const navigate = useNavigate();
  const [selectedSeasonIndex, setSelectedSeasonIndex] = useState(0);
  const [tvDetails, setTvDetails] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [seasonEpisodes, setSeasonEpisodes] = useState<any[]>([]);
  const [loadingSeason, setLoadingSeason] = useState(false);

  useEffect(() => {
    if (isOpen && movie) {
      setSelectedSeasonIndex(0);
      setTvDetails(null);
      setSeasonEpisodes([]);

      const isSeries = movie.type === "Series";
      if (isSeries && movie.id) {
        setLoadingDetails(true);
        fetchTVDetails(String(movie.id)).then((data) => {
          if (data && data.seasons) {
            setTvDetails(data);
          }
          setLoadingDetails(false);
        });
      }
    }
  }, [isOpen, movie]);

  useEffect(() => {
    if (!tvDetails?.seasons?.length || !movie?.id) return;
    const season = tvDetails.seasons[selectedSeasonIndex];
    if (!season) return;
    if (season.episodes?.length > 0) {
      setSeasonEpisodes(season.episodes);
      return;
    }
    setLoadingSeason(true);
    fetchTVSeasonEpisodes(String(movie.id), season.season_number).then(data => {
      if (data?.episodes) {
        season.episodes = data.episodes;
        setSeasonEpisodes(data.episodes);
      }
      setLoadingSeason(false);
    });
  }, [tvDetails, selectedSeasonIndex, movie?.id]);

  if (!movie) return null;

  const displayTitle = movie.title || movie.name || "";
  const isSeries = movie.type === "Series";
  const year = (movie.release_date || movie.first_air_date || "").split("-")[0];

  const posterUrl = getImageUrl(movie.poster_path, 'w500');

  const seasons = tvDetails?.seasons || movie.seasons || [];
  const sortedSeasons = [...seasons].sort((a: any, b: any) => a.season_number - b.season_number);
  const currentSeason = sortedSeasons[selectedSeasonIndex];
  const episodes = seasonEpisodes.length > 0 ? seasonEpisodes : (currentSeason?.episodes || []);

  const handlePlayMovie = () => {
    const url = getMovieEmbedUrl(displayTitle, year);
    navigate("/watch", { state: { movie: { title: displayTitle, release_date: year, type: "Movie" }, embedUrl: url } });
    onClose();
  };

  const handlePlayEpisode = (ep: any, seasonNum: number) => {
    const seriesTitle = movie.title || movie.name || "";
    const seriesYear = movie.release_date || movie.first_air_date || "";
    const url = getTVEmbedUrl(seriesTitle, seriesYear, seasonNum, ep.episode_number, ep.name);
    navigate("/watch", {
      state: {
        movie: { ...ep, title: ep.name, season_number: seasonNum, episode_number: ep.episode_number, type: "Series" },
        seriesData: movie,
        seasonNumber: seasonNum,
        episodeNumber: ep.episode_number,
        embedUrl: url,
      },
    });
    onClose();
  };

  const handlePlayFirst = () => {
    if (isSeries) {
      if (episodes.length > 0) {
        const firstEp = episodes.sort((a: any, b: any) => a.episode_number - b.episode_number)[0];
        handlePlayEpisode(firstEp, currentSeason?.season_number || 1);
      } else if (sortedSeasons.length > 0) {
        const firstSeason = sortedSeasons[0];
        if (firstSeason.episodes?.length > 0) {
          handlePlayEpisode(firstSeason.episodes[0], firstSeason.season_number);
        }
      }
    } else {
      handlePlayMovie();
    }
  };

  let playButtonLabel = "Play";
  if (isSeries) {
    playButtonLabel = episodes.length > 0
      ? `Play S${currentSeason?.season_number || 1} E${episodes[0]?.episode_number || 1}`
      : "Play Series";
  } else {
    playButtonLabel = "Play Movie";
  }

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-[100]">
      <DialogBackdrop transition className="fixed inset-0 bg-black/90 backdrop-blur-sm transition duration-300 data-[closed]:opacity-0" />
      <div className="fixed inset-0 flex items-end md:items-center justify-center p-0 md:p-4">
        <DialogPanel transition className="w-full bg-[#16181f] shadow-2xl border-t border-white/10 flex flex-col md:flex-row overflow-hidden transition duration-300 data-[closed]:translate-y-full md:data-[closed]:translate-y-0 md:data-[closed]:opacity-0 fixed bottom-0 h-[85vh] rounded-t-3xl md:relative md:bottom-auto md:h-[85vh] md:max-w-6xl md:rounded-2xl md:border">

          {/* Poster Side */}
          <div className="hidden md:block w-[350px] relative flex-shrink-0 bg-black">
            {posterUrl ? (
              <img src={posterUrl} alt={displayTitle} className="w-full h-full object-cover opacity-90" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-900 text-gray-700"><ImageIcon size={64} /></div>
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
          </div>

          {/* Content Area */}
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            <div className="md:hidden w-full flex justify-center pt-3 pb-1">
              <div className="w-12 h-1.5 bg-gray-700 rounded-full" />
            </div>

            <div className="flex-1 p-6 md:p-8 overflow-y-auto custom-scrollbar relative">
              <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-50">
                <X size={20} />
              </button>

              <h2 className="text-2xl md:text-4xl font-black italic uppercase tracking-tighter text-white mb-3 leading-tight pr-8">
                {displayTitle}
              </h2>

              <div className="flex flex-wrap items-center gap-3 text-xs md:text-sm text-gray-400 font-bold mb-6">
                <span className="flex items-center gap-1 text-yellow-400"><Star size={14} fill="currentColor" /> {movie.vote_average?.toFixed(1)}</span>
                <span className="flex items-center gap-1"><Calendar size={14} /> {year}</span>
                <span className="px-2 py-0.5 border border-white/20 rounded text-[10px] uppercase text-white tracking-wider">{isSeries ? "Series" : "Movie"}</span>
              </div>

              <div className="flex flex-col md:flex-row gap-3 mb-8">
                <button onClick={handlePlayFirst} className="flex items-center justify-center gap-2 px-6 py-3.5 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors w-full md:w-auto">
                  <Play fill="black" size={18} /> {playButtonLabel}
                </button>
              </div>

              <p className="text-gray-300 leading-relaxed text-sm md:text-lg mb-8 line-clamp-6 md:line-clamp-none">
                {movie.overview}
              </p>

              {isSeries && (loadingDetails || loadingSeason) && (
                <div className="flex items-center gap-3 text-gray-400 py-8">
                  <Loader size={20} className="animate-spin" />
                  <span>Loading episodes...</span>
                </div>
              )}

              {isSeries && !loadingDetails && !loadingSeason && sortedSeasons.length > 0 && (
                <div className="space-y-4 mt-8 border-t border-white/10 pt-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-white">Episodes</h3>
                    <div className="relative">
                      <select
                        value={selectedSeasonIndex}
                        onChange={(e) => setSelectedSeasonIndex(Number(e.target.value))}
                        className="appearance-none bg-[#0f1014] border border-white/10 rounded-lg pl-3 pr-8 py-1.5 text-xs text-white font-semibold focus:outline-none focus:border-blue-500 cursor-pointer"
                      >
                        {sortedSeasons.map((season: any, index: number) => (
                          <option key={season.season_number} value={index}>
                            Season {season.season_number}
                          </option>
                        ))}
                      </select>
                      <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  <div className="grid gap-3 pb-10">
                    {episodes.length > 0 ? (
                      [...episodes]
                        .sort((a: any, b: any) => a.episode_number - b.episode_number)
                        .map((ep: any) => {
                          const stillUrl = getImageUrl(ep.still_path, 'w500');
                          return (
                            <div key={ep.episode_number} className="group flex gap-3 p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-all active:scale-[0.98]">
                              <div
                                className="w-28 h-16 bg-black/50 rounded flex-shrink-0 overflow-hidden relative cursor-pointer"
                                onClick={() => handlePlayEpisode(ep, currentSeason?.season_number || 1)}
                              >
                                {stillUrl ? (
                                  <img src={stillUrl} alt={ep.name} className="w-full h-full object-cover opacity-80" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-gray-600"><ImageIcon size={16} /></div>
                                )}
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <div className="w-6 h-6 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                                    <Play size={8} fill="white" className="text-white ml-0.5" />
                                  </div>
                                </div>
                              </div>

                              <div
                                className="flex-1 min-w-0 flex flex-col justify-center cursor-pointer"
                                onClick={() => handlePlayEpisode(ep, currentSeason?.season_number || 1)}
                              >
                                <h5 className="text-white font-bold text-xs md:text-sm truncate">
                                  {ep.episode_number}. {ep.name || `Episode ${ep.episode_number}`}
                                </h5>
                                <p className="text-[10px] text-gray-500 mt-1 line-clamp-1">
                                  {ep.overview || "Click to play..."}
                                </p>
                              </div>
                            </div>
                          );
                        })
                    ) : (
                      <div className="text-gray-500 text-center py-8">
                        No episode data available from TMDB.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {isSeries && !loadingDetails && !loadingSeason && sortedSeasons.length === 0 && (
                <div className="text-gray-500 text-center py-8 border-t border-white/10 mt-8">
                  No season data available.
                </div>
              )}
            </div>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
