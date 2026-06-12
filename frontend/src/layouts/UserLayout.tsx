import { useCallback } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import MobileTopBar from "../components/MobileTopBar";
import Footer from "../components/Footer";
import MobileNav from "../components/MobileNav";
import ScrollToTopButton from "../components/ScrollToTopButton";

export default function UserLayout() {
  const navigate = useNavigate();

  const onMovieClick = useCallback((movie: any) => {
    const type = movie.type === "Series" ? "tv" : "movie";
    const id = movie.id || movie._id;
    navigate(`/detail/${type}/${id}`, { state: { movie } });
  }, [navigate]);

  return (
    <>
      <Navbar />
      <MobileTopBar />
      <main className="ml-0 md:ml-20 flex flex-col min-h-screen transition-all duration-300">
        <Outlet context={{ onMovieClick }} />
        <Footer />
      </main>
      <MobileNav />
      <ScrollToTopButton />
    </>
  );
}
