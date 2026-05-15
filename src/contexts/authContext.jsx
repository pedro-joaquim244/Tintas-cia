import { useState, useEffect, useContext, createContext } from "react";
import { api } from "../services/api";

const authContext = createContext();

export function AuthProvider({ children }) {
    const [usuario, setUsuario] = useState(null);
    const [carregando, setCarregando] = useState(true);

    useEffect(() => {
        const usuarioSalvo = localStorage.getItem("usuario");

        if (usuarioSalvo) {
            setUsuario(JSON.parse(usuarioSalvo));
        }

        setCarregando(false);
    }, []);

    async function login(email, senha) {
        try {
            const resposta = await api.post("/auth/login", { email, senha });

            const usuarioLogado = resposta.data.usuario;

            localStorage.setItem("usuario", JSON.stringify(usuarioLogado));

            setUsuario(usuarioLogado);

            return {
                sucesso: true,
            };
        } catch (error) {
            return {
                sucesso: false,
                mensagem: "erro ao fazer login",
            };
        }
    }

    async function logout() {
        localStorage.removeItem("usuario");
        setUsuario(null);
    }

    async function cadastrar(nome, email, senha) {
        try {
            await api.post("/auth", { nome, email, senha });

            return {
                sucesso: true,
            };
        } catch (error) {
            return {
                sucesso: false,
                mensagem: "erro ao cadastrar",
            };
        }
    }

    const estaLogado = usuario !== null;

    return (
        <authContext.Provider
            value={{
                usuario,
                login,
                logout,
                carregando,
                cadastrar,
                estaLogado,
            }}
        >
            {children}
        </authContext.Provider>
    );
}

export function useAuth() {
    return useContext(authContext);
}