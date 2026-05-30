import "./styles/App.css";
import { useEffect, useState } from "react";

import { AppRoutes } from "./routes";
import Loading from "./components/Loading/index.jsx";

function App() {
  const [loading, setLoading] = useState(false);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    const alreadyVisited = localStorage.getItem("tintas_loading");

    if (!alreadyVisited) {
      setLoading(true);

      const startClosing = setTimeout(() => {
        setClosing(true);
      }, 5000);

      const finishLoading = setTimeout(() => {
        setLoading(false);
        localStorage.setItem("tintas_loading", "true");
      }, 5700);

      return () => {
        clearTimeout(startClosing);
        clearTimeout(finishLoading);
      };
    }
  }, []);

  if (loading) {
    return <Loading closing={closing} />;
  }

  return <AppRoutes />;
}

export default App;