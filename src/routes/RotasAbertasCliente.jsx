import { Navigate, Outlet } from "react-router-dom";

import Rodape from "../components/Rodape-User/Rodape.jsx";
import { useAuth } from "../contexts/authContext";
import "../styles/clientTheme.css";

export default function RotasAbertasCliente() {
    const { usuario, carregando } = useAuth();

    if (carregando) {
        return <p>Carregando...</p>;
    }

    if (usuario?.tipo === "admin") {
        return <Navigate to="/admin/dashboard" replace />;
    }

    return (
        <div className="clientTheme">
            <Outlet />
            <Rodape />
        </div>
    );
}
