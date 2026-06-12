export interface Movie {
  id: number;
  title: string;
  name?: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  release_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids: string[];
  popularity: number;
  type: "Movie";
  fileCode?: string;
  embedCode?: string;
  downloadLink?: string;
  seasons?: Season[];
  episodePoster?: string;
  displaySubtitle?: string;
  progress?: number;
  duration?: number;
}

export interface Series {
  id: number;
  name: string;
  title: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  first_air_date: string;
  vote_average: number;
  genre_ids: string[];
  type: "Series";
  seasons: Season[];
}

export interface Season {
  season_number: number;
  name: string;
  overview: string;
  poster_path: string;
  episode_count: number;
  episodes: Episode[];
}

export interface Episode {
  episode_number: number;
  name: string;
  overview: string;
  still_path: string;
  vote_average: number;
  fileCode: string;
  embedCode: string;
  downloadLink: string;
}

export interface WatchHistoryItem {
  contentId: string;
  title: string;
  episodeTitle?: string;
  poster_path: string;
  episodePoster?: string;
  vote_average: number;
  onModel: "Movie" | "Series";
  progress: number;
  duration: number;
  season?: number;
  episode?: number;
  lastWatched: string;
  displaySubtitle?: string;
}

export interface WatchlistItem {
  id: string;
  type: "Movie" | "Series";
  title: string;
  poster_path: string;
  vote_average: number;
  release_date: string;
  addedAt: number;
}

export interface User {
  _id: string;
  username: string;
  email: string;
  avatar: string;
  role: "user" | "admin";
  watchHistory: WatchHistoryItem[];
  watchlist: WatchlistItem[];
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
}
