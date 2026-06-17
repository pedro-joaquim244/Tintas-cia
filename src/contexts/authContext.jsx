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
            const resposta = await api.post(
                "/usuarios/login",
                { email, senha }
            );

            const { usuario, token } = resposta.data;

            localStorage.setItem(
                "usuario",
                JSON.stringify(usuario)
            );

            localStorage.setItem("token", token);

            setUsuario(usuario);

            return {
                sucesso: true,
            };

        } catch (error) {

            console.log(error.response?.data);

            return {
                sucesso: false,
                mensagem:
                    error.response?.data?.erro ||
                    "Erro ao fazer login",
            };
        }
    }

    async function cadastrar(nome, email, senha) {
        try {

            await api.post("/usuarios", {
                nome,
                email,
                senha
            });

            return {
                sucesso: true,
            };

        } catch (error) {

            console.log(error.response?.data);

            return {
                sucesso: false,
                mensagem:
                    error.response?.data?.erro ||
                    "Erro ao cadastrar",
            };
        }
    }

    async function logout() {
        localStorage.removeItem("usuario");
        setUsuario(null);
    }

    async function cadastrar(nome, email, senha) {
        try {
            await api.post("/cadastro", { nome, email, senha });

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