import { BrowserRouter } from "react-router-dom";
import { useScrollRestoration } from "./hooks/useScrollRestoration";
import AppRoutes from "./routes";

function ScrollToTop() {
  useScrollRestoration();
  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <div className="bg-[#0f1014] min-h-screen font-sans selection:bg-blue-600 selection:text-white">
        <AppRoutes />
      </div>
    </BrowserRouter>
  );
}
