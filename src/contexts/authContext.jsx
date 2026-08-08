
/* eslint-disable react-refresh/only-export-components */

import {
    createContext,
    useContext,
    useEffect,
    useState
} from "react";

import { api } from "../services/api";


// =====================================================
// CONTEXT
// =====================================================

const AuthContext = createContext(null);


// =====================================================
// TIPOS VÁLIDOS
// =====================================================

const TIPOS_VALIDOS = [
    "admin",
    "cliente"
];


// =====================================================
// PROVIDER
// =====================================================

export function AuthProvider({ children }) {

    const [usuario, setUsuario] =
        useState(null);

    const [carregando, setCarregando] =
        useState(true);


    // =================================================
    // LIMPAR SESSÃO
    // =================================================

    function limparSessao() {

        localStorage.removeItem("usuario");

        localStorage.removeItem("token");

        setUsuario(null);

    }


    // =================================================
    // SALVAR USUÁRIO
    // =================================================

    function salvarUsuario(novoUsuario) {

        if (
            !novoUsuario ||
            !TIPOS_VALIDOS.includes(
                novoUsuario.tipo
            )
        ) {

            limparSessao();

            return false;

        }

        localStorage.setItem(
            "usuario",
            JSON.stringify(novoUsuario)
        );

        setUsuario(novoUsuario);

        return true;

    }


    // =================================================
    // RESTAURAR SESSÃO
    // =================================================

    useEffect(() => {

        async function restaurarSessao() {

            const token =
                localStorage.getItem("token");


            // -----------------------------------------
            // NÃO TEM TOKEN
            // -----------------------------------------

            if (!token) {

                setCarregando(false);

                return;

            }


            // -----------------------------------------
            // BUSCAR USUÁRIO
            // -----------------------------------------

            try {

                const resposta =
                    await api.get(
                        "/usuarios/me"
                    );


                if (
                    !resposta.data ||
                    !TIPOS_VALIDOS.includes(
                        resposta.data.tipo
                    )
                ) {

                    throw new Error(
                        "Sessao invalida"
                    );

                }


                localStorage.setItem(
                    "usuario",
                    JSON.stringify(
                        resposta.data
                    )
                );


                setUsuario(
                    resposta.data
                );

            } catch (error) {

                console.error(
                    "Erro ao restaurar sessão:",
                    error
                );

                limparSessao();

            } finally {

                setCarregando(false);

            }

        }


        restaurarSessao();

    }, []);


    // =================================================
    // LOGIN
    // =================================================

    async function login(
        email,
        senha
    ) {

        try {

            const resposta =
                await api.post(
                    "/usuarios/login",
                    {
                        email,
                        senha
                    }
                );


            const {
                usuario:
                    usuarioAutenticado,
                token
            } = resposta.data;


            // -----------------------------------------
            // VALIDAR RESPOSTA
            // -----------------------------------------

            if (
                !token ||
                !usuarioAutenticado ||
                !TIPOS_VALIDOS.includes(
                    usuarioAutenticado.tipo
                )
            ) {

                return {
                    sucesso: false,
                    mensagem:
                        "Resposta de autenticação inválida."
                };

            }


            // -----------------------------------------
            // SALVAR TOKEN
            // -----------------------------------------

            localStorage.setItem(
                "token",
                token
            );


            // -----------------------------------------
            // SALVAR USUÁRIO
            // -----------------------------------------

            const usuarioSalvo =
                salvarUsuario(
                    usuarioAutenticado
                );


            if (!usuarioSalvo) {

                localStorage.removeItem(
                    "token"
                );

                return {
                    sucesso: false,
                    mensagem:
                        "Não foi possível salvar a sessão."
                };

            }


            return {
                sucesso: true,
                usuario:
                    usuarioAutenticado
            };

        } catch (error) {

            console.error(
                "Erro ao fazer login:",
                error
            );

            return {

                sucesso: false,

                mensagem:
                    error.response?.data?.erro ||
                    "Erro ao fazer login."

            };

        }

    }


    // =================================================
    // CADASTRAR USUÁRIO
    // =================================================

    async function cadastrar(dados) {

        try {

            // -----------------------------------------
            // VALIDAR OBJETO
            // -----------------------------------------

            if (
                !dados ||
                typeof dados !== "object"
            ) {

                return {

                    sucesso: false,

                    mensagem:
                        "Dados de cadastro inválidos."

                };

            }


            // -----------------------------------------
            // ENVIAR PARA API
            // -----------------------------------------

            const resposta =
                await api.post(
                    "/usuarios",
                    {

                        nome:
                            dados.nome,

                        email:
                            dados.email,

                        senha:
                            dados.senha,

                        telefone:
                            dados.telefone || "",

                        data_nascimento:
                            dados.data_nascimento || null,

                        endereco:
                            dados.endereco || "",

                        numero:
                            dados.numero || "",

                        complemento:
                            dados.complemento || "",

                        bairro:
                            dados.bairro || "",

                        cidade:
                            dados.cidade || "",

                        estado:
                            dados.estado || "",

                        cep:
                            dados.cep || ""

                    }
                );


            // -----------------------------------------
            // SUCESSO
            // -----------------------------------------

            return {

                sucesso: true,

                usuario:
                    resposta.data

            };

        } catch (error) {

            console.error(
                "Erro ao cadastrar usuário:",
                error
            );

            return {

                sucesso: false,

                mensagem:
                    error.response?.data?.erro ||
                    "Erro ao cadastrar usuário."

            };

        }

    }


    // =================================================
    // ATUALIZAR PERFIL
    // =================================================

    async function atualizarPerfil(
        dados
    ) {

        try {

            if (!usuario?.id) {

                return {

                    sucesso: false,

                    mensagem:
                        "Usuário não encontrado."

                };

            }


            const resposta =
                await api.put(
                    `/usuarios/${usuario.id}`,
                    dados
                );


            // -----------------------------------------
            // ATUALIZAR SESSÃO
            // -----------------------------------------

            const usuarioAtualizado =
                salvarUsuario(
                    resposta.data
                );


            if (!usuarioAtualizado) {

                return {

                    sucesso: false,

                    mensagem:
                        "Não foi possível atualizar a sessão."

                };

            }


            return {

                sucesso: true,

                usuario:
                    resposta.data

            };

        } catch (error) {

            console.error(
                "Erro ao atualizar perfil:",
                error
            );

            return {

                sucesso: false,

                mensagem:
                    error.response?.data?.erro ||
                    "Erro ao atualizar perfil."

            };

        }

    }


    // =================================================
    // LOGOUT
    // =================================================

    function logout() {

        limparSessao();

    }


    // =================================================
    // VALORES DO CONTEXT
    // =================================================

    const value = {

        // ---------------------------------------------
        // USUÁRIO
        // ---------------------------------------------

        usuario,

        // ---------------------------------------------
        // AUTENTICAÇÃO
        // ---------------------------------------------

        login,

        cadastrar,

        atualizarPerfil,

        logout,

        // ---------------------------------------------
        // ESTADOS
        // ---------------------------------------------

        carregando,

        estaLogado:
            usuario !== null,

        // ---------------------------------------------
        // TIPOS
        // ---------------------------------------------

        ehAdmin:
            usuario?.tipo === "admin",

        ehCliente:
            usuario?.tipo === "cliente"

    };


    // =================================================
    // PROVIDER
    // =================================================

    return (

        <AuthContext.Provider
            value={value}
        >

            {children}

        </AuthContext.Provider>

    );

}


// =====================================================
// HOOK
// =====================================================

export function useAuth() {

    const contexto =
        useContext(
            AuthContext
        );


    if (!contexto) {

        throw new Error(
            "useAuth deve ser usado dentro de AuthProvider"
        );

    }


    return contexto;

}

