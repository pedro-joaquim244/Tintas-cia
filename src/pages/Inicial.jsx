import { useAuth } from '../contexts/authContext.jsx'


export default function Inicial() {
    const { estaLogado } = useAuth();


    return (
        <div>
            <h1>Página Inicial</h1>
            <p>Essa página pode ser acessada sem login.</p>
            {estaLogado ? (
                <a href="/dashboard">Ir para Dashboard</a>
            ) : (
                <a href="/login">Entrar no sistema</a>
            )}


        </div>
    );
}