import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import UserLayout from "../layouts/UserLayout";
import AdminLayout from "../layouts/AdminLayout";
import AdminGuard from "../components/admin/AdminGuard";

const Home = lazy(() => import("../pages/Home"));
const Search = lazy(() => import("../pages/Search"));
const Movies = lazy(() => import("../pages/Movies"));
const Series = lazy(() => import("../pages/Series"));
const Detail = lazy(() => import("../pages/Detail"));
const Watch = lazy(() => import("../pages/Watch"));
const Categories = lazy(() => import("../pages/Categories"));
const Watchlist = lazy(() => import("../pages/Watchlist"));
const Download = lazy(() => import("../pages/Download"));
const Login = lazy(() => import("../pages/Login"));
const Register = lazy(() => import("../pages/Register"));
const ManagePosts = lazy(() => import("../pages/admin/ManagePosts"));
const PostEditor = lazy(() => import("../pages/admin/PostEditor"));
const HomepageManager = lazy(() => import("../pages/admin/HomepageManager"));
const RenameTool = lazy(() => import("../pages/admin/RenameTool"));
const Duplicates = lazy(() => import("../pages/admin/Duplicates"));
const Requests = lazy(() => import("../pages/admin/Requests"));

function LazyFallback() {
  return (
    <div className="min-h-screen bg-[#0f1014] flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export default function AppRoutes() {
  return (
    <Suspense fallback={<LazyFallback />}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route element={<UserLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/movies" element={<Movies />} />
          <Route path="/tv" element={<Series />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/watchlist" element={<Watchlist />} />
          <Route path="/download" element={<Download />} />
          <Route path="/detail/:type/:id" element={<Detail />} />
        </Route>

        <Route path="/watch" element={<Watch />} />

        <Route path="/admin" element={<AdminGuard><AdminLayout /></AdminGuard>}>
          <Route index element={<Navigate to="/admin/posts" replace />} />
          <Route path="posts" element={<ManagePosts />} />
          <Route path="post-editor" element={<PostEditor />} />
          <Route path="homepage" element={<HomepageManager />} />
          <Route path="rename" element={<RenameTool />} />
          <Route path="duplicates" element={<Duplicates />} />
          <Route path="requests" element={<Requests />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
