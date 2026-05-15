import { useNavigate } from "react-router-dom";
import {useAuth} from '../contexts/authContext.jsx'
export default function Dashboard() {
    const navigate = useNavigate();
    const {usuario, logout} = useAuth();
    function sair(){
        logout();
        navigate("/")
    }

    return (
        <div>
            <h1>Dashboard</h1>
            <p>Bem-vindo,{usuario.nome}</p>
            <p>E-mail:{usuario.email} </p>
            <button type="button"onClick={sair} >
                Sair
            </button>
        </div>
    );
}