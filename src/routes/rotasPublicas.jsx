import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/authContext.jsx";

export default function RotasPublicas() {
    const { estaLogado, carregando } = useAuth();

    if (carregando) {
        return <p>carregando...</p>;
    }

    if (estaLogado) {
        return <Navigate to="/dashboard" />;
    }

    return <Outlet />;
}