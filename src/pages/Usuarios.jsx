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
    FaExclamationTriangle
} from "react-icons/fa";

import Cabecalho from "../components/Cabeçalho-ADM/Cabecalho";

export default function Usuarios() {

    const [usuarios, setUsuarios] = useState([]);

    const [busca, setBusca] = useState("");

    const [filtroTipo, setFiltroTipo] =
        useState("todos");

    const [carregando, setCarregando] =
        useState(true);

    const [erro, setErro] =
        useState("");

    const [usuarioSelecionado, setUsuarioSelecionado] =
        useState(null);

    const [usuarioParaExcluir, setUsuarioParaExcluir] =
        useState(null);

    const [excluindoUsuario, setExcluindoUsuario] =
        useState(false);

    const [erroExclusao, setErroExclusao] =
        useState("");

    // =====================================================
    // BUSCAR USUÁRIOS
    // =====================================================

    async function buscarUsuarios() {

        try {

            setCarregando(true);
            setErro("");

            const resposta =
                await api.get("/usuarios");

            const dados = resposta.data;

            // A rota atual retorna um array, mas mantemos compatibilidade
            // com respostas encapsuladas para não ocultar os usuários.
            const listaUsuarios = Array.isArray(dados)
                ? dados
                : Array.isArray(dados?.usuarios)
                    ? dados.usuarios
                    : Array.isArray(dados?.users)
                        ? dados.users
                        : Array.isArray(dados?.data)
                            ? dados.data
                            : [];

            if (!Array.isArray(listaUsuarios)) {
                throw new Error(
                    "A API não retornou uma lista de usuários."
                );
            }

            setUsuarios(listaUsuarios);

        } catch (error) {

            console.error(
                "Erro ao buscar usuários:",
                error
            );

            const mensagem =
                error.response?.data?.erro ||
                error.response?.data?.message ||
                error.message ||
                "Não foi possível carregar os usuários.";

            setErro(mensagem);

            setUsuarios([]);

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

    const usuariosFiltrados =
        usuarios.filter((usuario) => {

            const texto =
                busca
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
                String(usuario.telefone || "")
                    .toLowerCase()
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

    function abrirConfirmacaoExclusao(usuario) {

        setErroExclusao("");
        setUsuarioParaExcluir(usuario);
    }

    function fecharConfirmacaoExclusao() {

        if (excluindoUsuario) {
            return;
        }

        setErroExclusao("");
        setUsuarioParaExcluir(null);
    }

    async function excluirUsuario() {

        if (!usuarioParaExcluir || excluindoUsuario) {
            return;
        }

        const usuario = usuarioParaExcluir;

        try {

            setExcluindoUsuario(true);
            setErroExclusao("");

            await api.delete(
                `/usuarios/${usuario.id}`
            );

            setUsuarios(
                (lista) =>
                    lista.filter(
                        (item) =>
                            item.id !== usuario.id
                    )
            );

            if (
                usuarioSelecionado?.id ===
                usuario.id
            ) {

                setUsuarioSelecionado(
                    null
                );
            }

            setUsuarioParaExcluir(null);

        } catch (error) {

            console.error(
                "Erro ao excluir usuário:",
                error
            );

            setErroExclusao(
                error.response?.data?.erro ||
                error.response?.data?.message ||
                "Não foi possível excluir o usuário."
            );

        } finally {

            setExcluindoUsuario(false);
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
    // FOTO DO USUÁRIO
    // =====================================================

    function obterFoto(foto) {

        if (!foto) {
            return null;
        }

        if (
            foto.startsWith("http://") ||
            foto.startsWith("https://")
        ) {

            return foto;
        }

        const baseURL =
            api.defaults.baseURL
                ?.replace(/\/$/, "");

        if (!baseURL) {
            return null;
        }

        return `${baseURL}/uploads/${foto}`;
    }

    // =====================================================
    // JSX
    // =====================================================

    return (

        <main className={style.container}>

            <Cabecalho />

            {/* =================================================
                CABEÇALHO
            ================================================= */}
<div className={style.topbar}>

          <div>

            <span className={style.badge}>
              Administração
            </span>

            <h1 className={style.title}>
              Usuarios
            </h1>

            <p>
              Gerencie todos os usuaios da sua loja.
            </p>

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
                    CONTROLES
                ================================================= */}

                <div className={style.controls}>

                    <div>

                        <h2>
                            Usuários cadastrados
                        </h2>

                        <p>

                            {usuariosFiltrados.length}

                            {" "}

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

                    <div className={style.empty}>

                        <div
                            className={
                                style.emptyIcon
                            }
                        >
                            <FaUsers />
                        </div>

                        <h3>
                            {erro
                                ? "Não foi possível carregar os usuários"
                                : "Nenhum usuário encontrado"
                            }
                        </h3>

                        <p>

                            {erro
                                ? "Verifique sua sessão e o servidor."
                                : "Tente alterar os filtros ou realizar uma nova busca."
                            }

                        </p>

                        {erro && (

                            <button
                                type="button"
                                onClick={buscarUsuarios}
                            >
                                Tentar novamente
                            </button>

                        )}

                    </div>

                ) : (

                    <div
                        className={
                            style.tableWrapper
                        }
                    >

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
                                    (usuario) => {

                                        const foto =
                                            obterFoto(
                                                usuario.foto
                                            );

                                        return (

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

                                                            {foto ? (

                                                                <img
                                                                    src={foto}
                                                                    alt={
                                                                        usuario.nome
                                                                    }
                                                                    onError={(
                                                                        event
                                                                    ) => {

                                                                        event.currentTarget.style.display =
                                                                            "none";
                                                                    }}
                                                                />

                                                            ) : usuario.tipo ===
                                                                "admin"
                                                                ? (
                                                                    <FaUserShield />
                                                                )
                                                                : (
                                                                    <FaUser />
                                                                )}

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
                                                            )}

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
                                                                ? `${usuario.cidade || "Não informado"}${usuario.estado
                                                                    ? ` - ${usuario.estado}`
                                                                    : ""
                                                                }`
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

                                                            {formatarData(
                                                                usuario.criado_em
                                                            )}

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
                                                            title={
                                                                usuario.tipo ===
                                                                "admin"
                                                                    ? "Administrador não pode ser excluído"
                                                                    : "Excluir usuário"
                                                            }
                                                            onClick={() =>
                                                                abrirConfirmacaoExclusao(
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

                                        );
                                    }
                                )}

                            </tbody>

                        </table>

                    </div>

                )}

            </section>

            {/* =================================================
                MODAL
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

                        {/* CABEÇALHO */}

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

                                {obterFoto(
                                    usuarioSelecionado.foto
                                ) ? (

                                    <img
                                        src={
                                            obterFoto(
                                                usuarioSelecionado.foto
                                            )
                                        }
                                        alt={
                                            usuarioSelecionado.nome
                                        }
                                    />

                                ) : usuarioSelecionado.tipo ===
                                    "admin"
                                    ? (
                                        <FaUserShield />
                                    )
                                    : (
                                        <FaUser />
                                    )}

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
                                )}

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

                                        {formatarData(
                                            usuarioSelecionado.data_nascimento
                                        )}

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
                                            ? `${usuarioSelecionado.endereco}${
                                                usuarioSelecionado.numero
                                                    ? `, ${usuarioSelecionado.numero}`
                                                    : ""
                                            }`
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
                                            ? `${usuarioSelecionado.bairro || ""}${
                                                usuarioSelecionado.bairro &&
                                                usuarioSelecionado.cidade
                                                    ? ", "
                                                    : ""
                                            }${
                                                usuarioSelecionado.cidade ||
                                                ""
                                            }${
                                                usuarioSelecionado.estado
                                                    ? ` - ${usuarioSelecionado.estado}`
                                                    : ""
                                            }`
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

                                    {formatarDataHora(
                                        usuarioSelecionado.criado_em
                                    )}

                                </strong>

                            </div>

                            <div>

                                <span>
                                    Última atualização
                                </span>

                                <strong>

                                    {formatarDataHora(
                                        usuarioSelecionado.atualizado_em
                                    )}

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
                                        abrirConfirmacaoExclusao(
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

            {usuarioParaExcluir && (

                <div
                    className={style.confirmOverlay}
                    onClick={fecharConfirmacaoExclusao}
                >

                    <div
                        className={style.confirmModal}
                        role="alertdialog"
                        aria-modal="true"
                        aria-labelledby="titulo-confirmar-exclusao"
                        aria-describedby="descricao-confirmar-exclusao"
                        onClick={(event) =>
                            event.stopPropagation()
                        }
                    >

                        <div className={style.confirmIcon}>
                            <FaExclamationTriangle />
                        </div>

                        <h2 id="titulo-confirmar-exclusao">
                            Excluir usuário?
                        </h2>

                        <p id="descricao-confirmar-exclusao">
                            Você está prestes a excluir permanentemente o usuário <strong>{usuarioParaExcluir.nome}</strong>. Esta ação não poderá ser desfeita.
                        </p>

                        {erroExclusao && (
                            <div
                                className={style.confirmError}
                                role="alert"
                            >
                                {erroExclusao}
                            </div>
                        )}

                        <div className={style.confirmActions}>

                            <button
                                type="button"
                                className={style.cancelDeleteButton}
                                onClick={fecharConfirmacaoExclusao}
                                disabled={excluindoUsuario}
                            >
                                Cancelar
                            </button>

                            <button
                                type="button"
                                className={style.confirmDeleteButton}
                                onClick={excluirUsuario}
                                disabled={excluindoUsuario}
                            >
                                <FaTrash />
                                {excluindoUsuario
                                    ? "Excluindo..."
                                    : "Sim, excluir usuário"}
                            </button>

                        </div>

                    </div>

                </div>

            )}

        </main>
    );
}
