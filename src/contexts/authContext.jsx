/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../services/api";

const AuthContext = createContext(null);
const TIPOS_VALIDOS = ["admin", "cliente"];

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(true);

  function limparSessao() {
    localStorage.removeItem("usuario");
    localStorage.removeItem("token");
    setUsuario(null);
  }

  function salvarUsuario(novoUsuario) {
    if (!novoUsuario || !TIPOS_VALIDOS.includes(novoUsuario.tipo)) {
      limparSessao();
      return false;
    }

    localStorage.setItem("usuario", JSON.stringify(novoUsuario));
    setUsuario(novoUsuario);
    return true;
  }

  useEffect(() => {
    async function restaurarSessao() {
      const token = localStorage.getItem("token");

      if (!token) {
        setCarregando(false);
        return;
      }

      try {
        const resposta = await api.get("/usuarios/me");
        if (!resposta.data || !TIPOS_VALIDOS.includes(resposta.data.tipo)) {
          throw new Error("Sessao invalida");
        }
        localStorage.setItem("usuario", JSON.stringify(resposta.data));
        setUsuario(resposta.data);
      } catch {
        limparSessao();
      } finally {
        setCarregando(false);
      }
    }

    restaurarSessao();
  }, []);

  async function login(email, senha) {
    try {
      const resposta = await api.post("/usuarios/login", { email, senha });
      const { usuario: usuarioAutenticado, token } = resposta.data;

      if (!token || !TIPOS_VALIDOS.includes(usuarioAutenticado?.tipo)) {
        return { sucesso: false, mensagem: "Resposta de autenticação inválida." };
      }

      localStorage.setItem("token", token);
      salvarUsuario(usuarioAutenticado);
      return { sucesso: true, usuario: usuarioAutenticado };
    } catch (error) {
      return {
        sucesso: false,
        mensagem: error.response?.data?.erro || "Erro ao fazer login",
      };
    }
  }

  async function cadastrar(nome, email, senha) {
    try {
      await api.post("/usuarios", { nome, email, senha });
      return { sucesso: true };
    } catch (error) {
      return {
        sucesso: false,
        mensagem: error.response?.data?.erro || "Erro ao cadastrar",
      };
    }
  }

  async function atualizarPerfil(dados) {
    try {
      const resposta = await api.put(`/usuarios/${usuario.id}`, dados);
      salvarUsuario(resposta.data);
      return { sucesso: true, usuario: resposta.data };
    } catch (error) {
      return {
        sucesso: false,
        mensagem: error.response?.data?.erro || "Erro ao atualizar perfil",
      };
    }
  }

  function logout() {
    limparSessao();
  }

  const value = {
    usuario,
    login,
    cadastrar,
    atualizarPerfil,
    logout,
    carregando,
    estaLogado: usuario !== null,
    ehAdmin: usuario?.tipo === "admin",
    ehCliente: usuario?.tipo === "cliente",
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const contexto = useContext(AuthContext);

  if (!contexto) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider");
  }

  return contexto;
}
