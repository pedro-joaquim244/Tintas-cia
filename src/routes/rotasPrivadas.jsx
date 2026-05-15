import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/authContext.jsx";

export default function RotasPrivadas() {
    const { estaLogado, carregando } = useAuth();

    if (carregando) {
        return <p>carregando...</p>;
    }

    if (!estaLogado) {
        return <Navigate to="/login" />;
    }

    return <Outlet />;
}