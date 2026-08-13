import { useEffect, useState } from "react";
import style from "../styles/Usuarios.module.css";

import { api } from "../services/api";

import {
    FaUsers,
    FaUser,
    FaUserShield,
    FaSearch,
    FaTrash,
    FaEye,
    FaPhone,
    FaEnvelope,
    FaMapMarkerAlt,
    FaCalendarAlt,
    FaTimes,
    FaUserTie
} from "react-icons/fa";
import Cabecalho from "../components/Cabeçalho-ADM/Cabecalho";

export default function Usuarios() {

    const [usuarios, setUsuarios] = useState([]);

    const [busca, setBusca] = useState("");
    const [filtroTipo, setFiltroTipo] = useState("todos");

    const [carregando, setCarregando] = useState(true);

    const [erro, setErro] = useState("");

    const [usuarioSelecionado, setUsuarioSelecionado] =
        useState(null);


    // =====================================================
    // BUSCAR USUÁRIOS
    // =====================================================

    async function buscarUsuarios() {

        try {

            setCarregando(true);
            setErro("");

            const resposta = await api.get("/usuarios");

            setUsuarios(resposta.data);

        } catch (error) {

            console.error(
                "Erro ao buscar usuários:",
                error
            );

            setErro(
                error.response?.data?.erro ||
                "Não foi possível carregar os usuários."
            );

        } finally {

            setCarregando(false);

        }

    }


    // =====================================================
    // CARREGAR AO ABRIR
    // =====================================================

    useEffect(() => {

        buscarUsuarios();

    }, []);


    // =====================================================
    // FILTRAR USUÁRIOS
    // =====================================================

    const usuariosFiltrados = usuarios.filter((usuario) => {

        const texto = busca
            .toLowerCase()
            .trim();

        const correspondeBusca =
            !texto ||
            usuario.nome
                ?.toLowerCase()
                .includes(texto) ||
            usuario.email
                ?.toLowerCase()
                .includes(texto) ||
            String(usuario.id)
                .includes(texto) ||
            usuario.telefone
                ?.toLowerCase()
                .includes(texto);

        const correspondeTipo =
            filtroTipo === "todos" ||
            usuario.tipo === filtroTipo;

        return (
            correspondeBusca &&
            correspondeTipo
        );

    });


    // =====================================================
    // ESTATÍSTICAS
    // =====================================================

    const totalUsuarios =
        usuarios.length;

    const totalClientes =
        usuarios.filter(
            (usuario) =>
                usuario.tipo === "cliente"
        ).length;

    const totalAdmins =
        usuarios.filter(
            (usuario) =>
                usuario.tipo === "admin"
        ).length;


    // =====================================================
    // EXCLUIR USUÁRIO
    // =====================================================

    async function excluirUsuario(usuario) {

        const confirmar = window.confirm(
            `Tem certeza que deseja excluir o usuário "${usuario.nome}"?`
        );

        if (!confirmar) {
            return;
        }

        try {

            await api.delete(
                `/usuarios/${usuario.id}`
            );

            setUsuarios((lista) =>
                lista.filter(
                    (item) =>
                        item.id !== usuario.id
                )
            );

            if (
                usuarioSelecionado?.id ===
                usuario.id
            ) {
                setUsuarioSelecionado(null);
            }

        } catch (error) {

            console.error(
                "Erro ao excluir usuário:",
                error
            );

            alert(
                error.response?.data?.erro ||
                "Não foi possível excluir o usuário."
            );

        }

    }


    // =====================================================
    // FORMATAR DATA
    // =====================================================

    function formatarData(data) {

        if (!data) {
            return "Não informado";
        }

        const dataFormatada =
            new Date(data);

        if (
            Number.isNaN(
                dataFormatada.getTime()
            )
        ) {
            return "Não informado";
        }

        return dataFormatada.toLocaleDateString(
            "pt-BR"
        );

    }


    // =====================================================
    // FORMATAR DATA E HORA
    // =====================================================

    function formatarDataHora(data) {

        if (!data) {
            return "Não informado";
        }

        const dataFormatada =
            new Date(data);

        if (
            Number.isNaN(
                dataFormatada.getTime()
            )
        ) {
            return "Não informado";
        }

        return dataFormatada.toLocaleString(
            "pt-BR"
        );

    }


    // =====================================================
    // JSX
    // =====================================================

    return (

        <main className={style.container}>

            <Cabecalho/>

            <div className={style.header}>

                <div className={style.headerLeft}>

                    <div className={style.headerIcon}>
                        <FaUsers />
                    </div>

                    <div>

                        <h1>
                            Usuários
                        </h1>

                        <p>
                            Gerencie todos os usuários
                            cadastrados no site.
                        </p>

                    </div>

                </div>

                <div className={style.headerTotal}>

                    <FaUsers />

                    <div>

                        <strong>
                            {totalUsuarios}
                        </strong>

                        <span>
                            usuários
                        </span>

                    </div>

                </div>

            </div>


            {/* =================================================
                ESTATÍSTICAS
            ================================================= */}

            <div className={style.stats}>

                <div className={style.statCard}>

                    <div
                        className={`${style.statIcon} ${style.blue}`}
                    >
                        <FaUsers />
                    </div>

                    <div>

                        <span>
                            Total de usuários
                        </span>

                        <strong>
                            {totalUsuarios}
                        </strong>

                    </div>

                </div>


                <div className={style.statCard}>

                    <div
                        className={`${style.statIcon} ${style.green}`}
                    >
                        <FaUser />
                    </div>

                    <div>

                        <span>
                            Clientes
                        </span>

                        <strong>
                            {totalClientes}
                        </strong>

                    </div>

                </div>


                <div className={style.statCard}>

                    <div
                        className={`${style.statIcon} ${style.purple}`}
                    >
                        <FaUserShield />
                    </div>

                    <div>

                        <span>
                            Administradores
                        </span>

                        <strong>
                            {totalAdmins}
                        </strong>

                    </div>

                </div>

            </div>


            {/* =================================================
                CONTEÚDO
            ================================================= */}

            <section className={style.card}>

                {/* =================================================
                    BARRA DE CONTROLES
                ================================================= */}

                <div className={style.controls}>

                    <div>

                        <h2>
                            Usuários cadastrados
                        </h2>

                        <p>
                            {usuariosFiltrados.length}{" "}
                            resultado
                            {usuariosFiltrados.length !== 1
                                ? "s"
                                : ""
                            }
                        </p>

                    </div>


                    <div className={style.filters}>

                        <div
                            className={
                                style.search
                            }
                        >

                            <FaSearch />

                            <input
                                type="text"
                                placeholder="Buscar usuário..."
                                value={busca}
                                onChange={(event) =>
                                    setBusca(
                                        event.target.value
                                    )
                                }
                            />

                        </div>


                        <select
                            value={filtroTipo}
                            onChange={(event) =>
                                setFiltroTipo(
                                    event.target.value
                                )
                            }
                        >

                            <option value="todos">
                                Todos
                            </option>

                            <option value="cliente">
                                Clientes
                            </option>

                            <option value="admin">
                                Administradores
                            </option>

                        </select>

                    </div>

                </div>


                {/* =================================================
                    ERRO
                ================================================= */}

                {erro && (

                    <div className={style.error}>
                        {erro}
                    </div>

                )}


                {/* =================================================
                    CARREGANDO
                ================================================= */}

                {carregando ? (

                    <div className={style.loading}>

                        <div
                            className={
                                style.spinner
                            }
                        />

                        <p>
                            Carregando usuários...
                        </p>

                    </div>

                ) : usuariosFiltrados.length === 0 ? (

                    /* =================================================
                        VAZIO
                    ================================================= */

                    <div className={style.empty}>

                        <div
                            className={
                                style.emptyIcon
                            }
                        >
                            <FaUsers />
                        </div>

                        <h3>
                            Nenhum usuário encontrado
                        </h3>

                        <p>
                            Tente alterar os filtros
                            ou realizar uma nova busca.
                        </p>

                    </div>

                ) : (

                    /* =================================================
                        TABELA
                    ================================================= */

                    <div className={style.tableWrapper}>

                        <table>

                            <thead>

                                <tr>

                                    <th>
                                        Usuário
                                    </th>

                                    <th>
                                        Contato
                                    </th>

                                    <th>
                                        Tipo
                                    </th>

                                    <th>
                                        Cidade
                                    </th>

                                    <th>
                                        Cadastro
                                    </th>

                                    <th>
                                        Ações
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {usuariosFiltrados.map(
                                    (usuario) => (

                                        <tr
                                            key={
                                                usuario.id
                                            }
                                        >

                                            {/* USUÁRIO */}

                                            <td>

                                                <div
                                                    className={
                                                        style.userInfo
                                                    }
                                                >

                                                    <div
                                                        className={
                                                            style.avatar
                                                        }
                                                    >

                                                        {usuario.tipo ===
                                                        "admin"
                                                            ? <FaUserShield />
                                                            : <FaUser />
                                                        }

                                                    </div>


                                                    <div>

                                                        <strong>
                                                            {
                                                                usuario.nome
                                                            }
                                                        </strong>

                                                        <span>
                                                            ID #
                                                            {
                                                                usuario.id
                                                            }
                                                        </span>

                                                    </div>

                                                </div>

                                            </td>


                                            {/* CONTATO */}

                                            <td>

                                                <div
                                                    className={
                                                        style.contact
                                                    }
                                                >

                                                    <span>

                                                        <FaEnvelope />

                                                        {
                                                            usuario.email
                                                        }

                                                    </span>


                                                    {usuario.telefone && (

                                                        <span>

                                                            <FaPhone />

                                                            {
                                                                usuario.telefone
                                                            }

                                                        </span>

                                                    )}

                                                </div>

                                            </td>


                                            {/* TIPO */}

                                            <td>

                                                <span
                                                    className={
                                                        usuario.tipo ===
                                                        "admin"
                                                            ? style.adminBadge
                                                            : style.clientBadge
                                                    }
                                                >

                                                    {usuario.tipo ===
                                                    "admin"
                                                        ? (
                                                            <>
                                                                <FaUserShield />
                                                                Administrador
                                                            </>
                                                        )
                                                        : (
                                                            <>
                                                                <FaUser />
                                                                Cliente
                                                            </>
                                                        )
                                                    }

                                                </span>

                                            </td>


                                            {/* CIDADE */}

                                            <td>

                                                <div
                                                    className={
                                                        style.location
                                                    }
                                                >

                                                    <FaMapMarkerAlt />

                                                    <span>

                                                        {usuario.cidade ||
                                                        usuario.estado
                                                            ? `${usuario.cidade || "Não informado"}${usuario.estado ? ` - ${usuario.estado}` : ""}`
                                                            : "Não informado"}

                                                    </span>

                                                </div>

                                            </td>


                                            {/* DATA */}

                                            <td>

                                                <div
                                                    className={
                                                        style.date
                                                    }
                                                >

                                                    <FaCalendarAlt />

                                                    <span>
                                                        {
                                                            formatarData(
                                                                usuario.criado_em
                                                            )
                                                        }
                                                    </span>

                                                </div>

                                            </td>


                                            {/* AÇÕES */}

                                            <td>

                                                <div
                                                    className={
                                                        style.actions
                                                    }
                                                >

                                                    <button
                                                        type="button"
                                                        className={
                                                            style.viewButton
                                                        }
                                                        title="Ver detalhes"
                                                        onClick={() =>
                                                            setUsuarioSelecionado(
                                                                usuario
                                                            )
                                                        }
                                                    >
                                                        <FaEye />
                                                    </button>


                                                    <button
                                                        type="button"
                                                        className={
                                                            style.deleteButton
                                                        }
                                                        title="Excluir usuário"
                                                        onClick={() =>
                                                            excluirUsuario(
                                                                usuario
                                                            )
                                                        }
                                                        disabled={
                                                            usuario.tipo ===
                                                            "admin"
                                                        }
                                                    >
                                                        <FaTrash />
                                                    </button>

                                                </div>

                                            </td>

                                        </tr>

                                    )
                                )}

                            </tbody>

                        </table>

                    </div>

                )}

            </section>


            {/* =================================================
                MODAL DE DETALHES
            ================================================= */}

            {usuarioSelecionado && (

                <div
                    className={
                        style.overlay
                    }
                    onClick={() =>
                        setUsuarioSelecionado(
                            null
                        )
                    }
                >

                    <div
                        className={
                            style.modal
                        }
                        onClick={(event) =>
                            event.stopPropagation()
                        }
                    >

                        <button
                            type="button"
                            className={
                                style.closeButton
                            }
                            onClick={() =>
                                setUsuarioSelecionado(
                                    null
                                )
                            }
                        >
                            <FaTimes />
                        </button>


                        {/* CABEÇALHO MODAL */}

                        <div
                            className={
                                style.modalHeader
                            }
                        >

                            <div
                                className={
                                    style.modalAvatar
                                }
                            >

                                {usuarioSelecionado.tipo ===
                                "admin"
                                    ? <FaUserShield />
                                    : <FaUser />
                                }

                            </div>


                            <div>

                                <h2>
                                    {
                                        usuarioSelecionado.nome
                                    }
                                </h2>

                                <span>
                                    ID #
                                    {
                                        usuarioSelecionado.id
                                    }
                                </span>

                            </div>

                        </div>


                        {/* TIPO */}

                        <div
                            className={
                                style.modalType
                            }
                        >

                            {usuarioSelecionado.tipo ===
                            "admin"
                                ? (
                                    <>
                                        <FaUserShield />
                                        Administrador
                                    </>
                                )
                                : (
                                    <>
                                        <FaUser />
                                        Cliente
                                    </>
                                )
                            }

                        </div>


                        {/* INFORMAÇÕES */}

                        <div
                            className={
                                style.details
                            }
                        >

                            <div
                                className={
                                    style.detailItem
                                }
                            >

                                <FaEnvelope />

                                <div>

                                    <span>
                                        E-mail
                                    </span>

                                    <strong>
                                        {
                                            usuarioSelecionado.email ||
                                            "Não informado"
                                        }
                                    </strong>

                                </div>

                            </div>


                            <div
                                className={
                                    style.detailItem
                                }
                            >

                                <FaPhone />

                                <div>

                                    <span>
                                        Telefone
                                    </span>

                                    <strong>
                                        {
                                            usuarioSelecionado.telefone ||
                                            "Não informado"
                                        }
                                    </strong>

                                </div>

                            </div>


                            <div
                                className={
                                    style.detailItem
                                }
                            >

                                <FaCalendarAlt />

                                <div>

                                    <span>
                                        Data de nascimento
                                    </span>

                                    <strong>
                                        {
                                            formatarData(
                                                usuarioSelecionado.data_nascimento
                                            )
                                        }
                                    </strong>

                                </div>

                            </div>


                            <div
                                className={
                                    style.detailItem
                                }
                            >

                                <FaMapMarkerAlt />

                                <div>

                                    <span>
                                        Endereço
                                    </span>

                                    <strong>

                                        {usuarioSelecionado.endereco
                                            ? `${usuarioSelecionado.endereco}${usuarioSelecionado.numero ? `, ${usuarioSelecionado.numero}` : ""}`
                                            : "Não informado"}

                                    </strong>

                                    {usuarioSelecionado.complemento && (

                                        <small>
                                            {
                                                usuarioSelecionado.complemento
                                            }
                                        </small>

                                    )}

                                </div>

                            </div>


                            <div
                                className={
                                    style.detailItem
                                }
                            >

                                <FaMapMarkerAlt />

                                <div>

                                    <span>
                                        Localização
                                    </span>

                                    <strong>

                                        {usuarioSelecionado.bairro ||
                                        usuarioSelecionado.cidade ||
                                        usuarioSelecionado.estado
                                            ? `${usuarioSelecionado.bairro || ""}${usuarioSelecionado.bairro && usuarioSelecionado.cidade ? ", " : ""}${usuarioSelecionado.cidade || ""}${usuarioSelecionado.estado ? ` - ${usuarioSelecionado.estado}` : ""}`
                                            : "Não informado"}

                                    </strong>

                                    {usuarioSelecionado.cep && (

                                        <small>
                                            CEP:{" "}
                                            {
                                                usuarioSelecionado.cep
                                            }
                                        </small>

                                    )}

                                </div>

                            </div>

                        </div>


                        {/* DATAS */}

                        <div
                            className={
                                style.accountInfo
                            }
                        >

                            <div>

                                <span>
                                    Criado em
                                </span>

                                <strong>
                                    {
                                        formatarDataHora(
                                            usuarioSelecionado.criado_em
                                        )
                                    }
                                </strong>

                            </div>


                            <div>

                                <span>
                                    Última atualização
                                </span>

                                <strong>
                                    {
                                        formatarDataHora(
                                            usuarioSelecionado.atualizado_em
                                        )
                                    }
                                </strong>

                            </div>

                        </div>


                        {/* RODAPÉ */}

                        <div
                            className={
                                style.modalFooter
                            }
                        >

                            <button
                                type="button"
                                onClick={() =>
                                    setUsuarioSelecionado(
                                        null
                                    )
                                }
                            >
                                Fechar
                            </button>


                            {usuarioSelecionado.tipo !==
                            "admin" && (

                                <button
                                    type="button"
                                    className={
                                        style.modalDelete
                                    }
                                    onClick={() =>
                                        excluirUsuario(
                                            usuarioSelecionado
                                        )
                                    }
                                >

                                    <FaTrash />

                                    Excluir usuário

                                </button>

                            )}

                        </div>

                    </div>

                </div>

            )}

        </main>

    );

}