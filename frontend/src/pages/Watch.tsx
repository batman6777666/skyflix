import { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { X, ExternalLink } from "lucide-react";
import { getMovieEmbedUrl, getTVEmbedUrl } from "../utils/embed";

const WATCH_STATE_KEY = "skyflix_watch_state";

const loaderStyles = `
.dots-container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
}
.dot {
  height: 20px;
  width: 20px;
  margin-right: 10px;
  border-radius: 10px;
  background-color: #b3d4fc;
  animation: pulse 1.5s infinite ease-in-out;
}
.dot:last-child { margin-right: 0; }
.dot:nth-child(1) { animation-delay: -0.3s; }
.dot:nth-child(2) { animation-delay: -0.1s; }
.dot:nth-child(3) { animation-delay: 0.1s; }
@keyframes pulse {
  0% { transform: scale(0.8); background-color: #b3d4fc; box-shadow: 0 0 0 0 rgba(178, 212, 252, 0.7); }
  50% { transform: scale(1.2); background-color: #6793fb; box-shadow: 0 0 0 10px rgba(178, 212, 252, 0); }
  100% { transform: scale(0.8); background-color: #b3d4fc; box-shadow: 0 0 0 0 rgba(178, 212, 252, 0.7); }
}
`;

export default function Watch() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [loadError, setLoadError] = useState(false);
  const [showLoader, setShowLoader] = useState(true);
  const [embedUrl, setEmbedUrl] = useState("");
  const iframeLoaded = useRef(false);
  const timerDone = useRef(false);

  const state = location.state as any;

  const hideLoader = () => {
    if (iframeLoaded.current && timerDone.current) {
      setShowLoader(false);
    }
  };

  useEffect(() => {
    let watchState = state;

    if (!watchState) {
      const saved = localStorage.getItem(WATCH_STATE_KEY);
      if (saved) {
        try {
          watchState = JSON.parse(saved);
        } catch {}
      }
    }

    if (!watchState || !watchState.movie) {
      const urlEmbed = searchParams.get("embed");
      const urlTitle = searchParams.get("title");
      if (urlEmbed && urlTitle) {
        watchState = {
          movie: { title: urlTitle, type: searchParams.get("type") || "Movie" },
          embedUrl: urlEmbed,
        };
      }
    }

    if (!watchState || !watchState.movie) {
      navigate("/", { replace: true });
      return;
    }

    localStorage.setItem(WATCH_STATE_KEY, JSON.stringify(watchState));

    const { movie, seriesData, seasonNumber, episodeNumber } = watchState;
    if (!movie) {
      navigate("/", { replace: true });
      return;
    }

    if (watchState.embedUrl) {
      setEmbedUrl(watchState.embedUrl);
    } else {
      const title = movie.title || movie.name || "";
      const year = movie.release_date || movie.first_air_date || "";

      if (seriesData || movie.type === "Series") {
        const sNum = seasonNumber || movie.season_number || 1;
        const eNum = episodeNumber || movie.episode_number || 1;
        const seriesTitle = seriesData?.title || seriesData?.name || title;
        const seriesYear = seriesData?.release_date || seriesData?.first_air_date || year;
        const episodeName = movie.title || movie.name || undefined;
        setEmbedUrl(getTVEmbedUrl(seriesTitle, seriesYear, sNum, eNum, episodeName));
      } else {
        setEmbedUrl(getMovieEmbedUrl(title, year));
      }
    }

    const timer = setTimeout(() => {
      timerDone.current = true;
      hideLoader();
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center overflow-hidden cursor-auto">
      <style>{loaderStyles}</style>

      <button
        onClick={() => navigate(-1)}
        className="absolute top-4 right-4 z-50 p-3 bg-red-600 hover:bg-red-700 rounded-full text-white shadow-lg transition-transform hover:scale-110"
      >
        <X size={24} />
      </button>

      {embedUrl && !loadError && (
        <div className="relative w-full h-full">
          {showLoader && (
            <div className="absolute inset-0 z-10 bg-black">
              <div className="dots-container">
                <div className="dot"></div>
                <div className="dot"></div>
                <div className="dot"></div>
              </div>
            </div>
          )}
          <iframe
            src={embedUrl}
            className="w-full h-full border-0"
            allowFullScreen
            allow="autoplay; fullscreen"
            onLoad={() => { iframeLoaded.current = true; hideLoader(); }}
            onError={() => setLoadError(true)}
          />
        </div>
      )}

      {loadError && (
        <div className="text-white text-center flex flex-col items-center gap-4">
          <ExternalLink size={48} className="text-gray-500" />
          <span className="text-xl font-bold">Player Error</span>
          <span className="text-sm text-gray-500">Could not load the video player.</span>
          <a
            href={embedUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition"
          >
            Open in New Tab
          </a>
        </div>
      )}
    </div>
  );
}