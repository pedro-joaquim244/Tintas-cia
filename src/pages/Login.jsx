import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from '../contexts/authContext.jsx'


export default function Login() {

    const navegate = useNavigate();
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [erro, setErro] = useState("");

    const { login } = useAuth();

    async function Entrar(event) {
        event.preventDefault();
        setErro("");
        const resultado = await login(email, senha)
        if (resultado.sucesso) {
            navegate('/dashboard')

        }
        else {
            setErro(resultado.mensagem)
        }

    }
    return (
        <div>
            <h1>Login</h1>

            <form onSubmit={Entrar}>
                <div>
                    <label>Email</label>
                    <input
                        type="email"
                        required
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                    />
                </div>
                <div>
                    <label>Senha</label>
                    <input
                        type="password"
                        required
                        value={senha}
                        onChange={(event) => setSenha(event.target.value)}
                    />
                </div>
                <button type="submit">Entrar</button>
            </form>
        </div>
    );
}