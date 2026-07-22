import "./styles/App.css";
import { useEffect, useState } from "react";

import { AppRoutes } from "./routes";
import Loading from "./components/Loading/index.jsx";

function App() {
  const [loading, setLoading] = useState(
    () => !localStorage.getItem("tintas_loading")
  );
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    if (loading) {

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
  }, [loading]);

  if (loading) {
    return <Loading closing={closing} />;
  }

  return <AppRoutes />;
}

export default App;
