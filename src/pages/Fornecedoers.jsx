import {
    useEffect,
    useMemo,
    useState
} from "react";

import {
    FiAlertCircle,
    FiBriefcase,
    FiCheckCircle,
    FiChevronRight,
    FiEye,
    FiMail,
    FiMapPin,
    FiPhone,
    FiRefreshCw,
    FiSearch,
    FiTag,
    FiTrash2,
    FiUser,
    FiX,
    FiXCircle
} from "react-icons/fi";

import Cabecalho
    from "../components/Cabeçalho-ADM/Cabecalho.jsx";

import { api }
    from "../services/api.js";

import styles
    from "../styles/Fornecedoers.module.css";


export default function Fornecedores() {

    // =====================================================
    // ESTADOS
    // =====================================================

    const [
        fornecedores,
        setFornecedores
    ] = useState([]);


    const [
        carregando,
        setCarregando
    ] = useState(true);


    const [
        erro,
        setErro
    ] = useState("");


    const [
        sucesso,
        setSucesso
    ] = useState("");


    const [
        busca,
        setBusca
    ] = useState("");


    const [
        filtro,
        setFiltro
    ] = useState("todos");


    const [
        fornecedorSelecionado,
        setFornecedorSelecionado
    ] = useState(null);


    const [
        processandoId,
        setProcessandoId
    ] = useState(null);


    // =====================================================
    // CARREGAR
    // =====================================================

    useEffect(() => {

        carregarFornecedores();

    }, []);


    // =====================================================
    // BUSCAR FORNECEDORES
    // =====================================================

    async function carregarFornecedores() {

        try {

            setCarregando(true);

            setErro("");


            const resposta =
                await api.get(
                    "/fornecedores"
                );


            setFornecedores(
                Array.isArray(resposta.data)
                    ? resposta.data
                    : []
            );


        } catch (error) {

            console.error(
                "Erro ao carregar fornecedores:",
                error
            );


            setErro(
                error.response?.data?.erro ||
                "Não foi possível carregar os fornecedores."
            );


        } finally {

            setCarregando(false);

        }

    }


    // =====================================================
    // ATIVOS
    // =====================================================

    function fornecedorAtivo(fornecedor) {

        return (
            fornecedor.ativo === true ||
            Number(fornecedor.ativo) === 1
        );

    }


    // =====================================================
    // RESUMO
    // =====================================================

    const resumo = useMemo(() => {

        const ativos =
            fornecedores.filter(
                fornecedorAtivo
            ).length;


        const inativos =
            fornecedores.length -
            ativos;


        const marcas = new Set();


        fornecedores.forEach(
            fornecedor => {

                fornecedor.marcas
                    ?.forEach(
                        marca => {

                            if (marca?.id) {

                                marcas.add(
                                    marca.id
                                );

                            }

                        }
                    );

            }
        );


        return {
            total:
                fornecedores.length,

            ativos,

            inativos,

            marcas:
                marcas.size
        };

    }, [fornecedores]);


    // =====================================================
    // FILTRAR
    // =====================================================

    const fornecedoresFiltrados =
        useMemo(() => {

            const termo =
                busca
                    .trim()
                    .toLowerCase();


            return fornecedores.filter(
                fornecedor => {

                    const ativo =
                        fornecedorAtivo(
                            fornecedor
                        );


                    if (
                        filtro === "ativos" &&
                        !ativo
                    ) {

                        return false;

                    }


                    if (
                        filtro === "inativos" &&
                        ativo
                    ) {

                        return false;

                    }


                    if (!termo) {

                        return true;

                    }


                    const marcas =
                        fornecedor.marcas
                            ?.map(
                                marca =>
                                    marca.nome
                            )
                            .join(" ") ||
                        "";


                    const texto = `
                        ${fornecedor.nome || ""}
                        ${fornecedor.cnpj || ""}
                        ${fornecedor.contato_nome || ""}
                        ${fornecedor.email || ""}
                        ${fornecedor.telefone || ""}
                        ${fornecedor.cidade || ""}
                        ${fornecedor.estado || ""}
                        ${marcas}
                    `
                        .toLowerCase();


                    return texto.includes(
                        termo
                    );

                }
            );

        }, [
            fornecedores,
            busca,
            filtro
        ]);


    // =====================================================
    // ALTERAR STATUS
    // =====================================================

    async function alterarStatus(
        fornecedor
    ) {

        try {

            setProcessandoId(
                fornecedor.id
            );

            setErro("");

            setSucesso("");


            const novoStatus =
                !fornecedorAtivo(
                    fornecedor
                );


            const resposta =
                await api.patch(
                    `/fornecedores/${fornecedor.id}/status`,
                    {
                        ativo:
                            novoStatus
                    }
                );


            setFornecedores(
                atuais =>
                    atuais.map(
                        item =>
                            item.id ===
                            fornecedor.id

                                ? {
                                    ...item,
                                    ativo:
                                        novoStatus
                                            ? 1
                                            : 0
                                }

                                : item
                    )
            );


            setSucesso(
                resposta.data?.mensagem ||
                "Status alterado com sucesso."
            );


            if (
                fornecedorSelecionado?.id ===
                fornecedor.id
            ) {

                setFornecedorSelecionado(
                    atual => ({
                        ...atual,
                        ativo:
                            novoStatus
                                ? 1
                                : 0
                    })
                );

            }


        } catch (error) {

            console.error(
                "Erro ao alterar fornecedor:",
                error
            );


            setErro(
                error.response?.data?.erro ||
                "Não foi possível alterar o status."
            );


        } finally {

            setProcessandoId(null);

        }

    }


    // =====================================================
    // EXCLUIR
    // =====================================================

    async function excluirFornecedor(
        fornecedor
    ) {

        const confirmar =
            window.confirm(
                `Deseja realmente excluir o fornecedor "${fornecedor.nome}"?`
            );


        if (!confirmar) {

            return;

        }


        try {

            setProcessandoId(
                fornecedor.id
            );

            setErro("");

            setSucesso("");


            const resposta =
                await api.delete(
                    `/fornecedores/${fornecedor.id}`
                );


            setFornecedores(
                atuais =>
                    atuais.filter(
                        item =>
                            item.id !==
                            fornecedor.id
                    )
            );


            if (
                fornecedorSelecionado?.id ===
                fornecedor.id
            ) {

                setFornecedorSelecionado(
                    null
                );

            }


            setSucesso(
                resposta.data?.mensagem ||
                "Fornecedor excluído com sucesso."
            );


        } catch (error) {

            console.error(
                "Erro ao excluir fornecedor:",
                error
            );


            setErro(
                error.response?.data?.erro ||
                "Não foi possível excluir o fornecedor."
            );


        } finally {

            setProcessandoId(null);

        }

    }


    // =====================================================
    // ENDEREÇO
    // =====================================================

    function montarEndereco(
        fornecedor
    ) {

        const primeiraLinha = [

            fornecedor.endereco,

            fornecedor.numero

        ]
            .filter(Boolean)
            .join(", ");


        const segundaLinha = [

            fornecedor.bairro,

            fornecedor.cidade,

            fornecedor.estado

        ]
            .filter(Boolean)
            .join(" - ");


        return {

            primeiraLinha:
                primeiraLinha ||
                "Não informado",

            segundaLinha,

            cep:
                fornecedor.cep ||
                ""

        };

    }


    // =====================================================
    // RENDER
    // =====================================================

    return (

        <div className={styles.container}>

            <Cabecalho />


            <main className={styles.main}>


                {/* =================================================
                    CABEÇALHO
                ================================================= */}

                <header className={styles.topo}>

                    <div>

                        <span className={styles.eyebrow}>
                            GESTÃO COMERCIAL
                        </span>


                        <h1>
                            Fornecedores
                            <em>.</em>
                        </h1>


                        <p>
                            Visualize fornecedores,
                            contatos e as marcas
                            comercializadas pela
                            Pixel Color.
                        </p>

                    </div>


                    <div
                        className={styles.iconeTopo}
                        aria-hidden="true"
                    >

                        <FiBriefcase />

                    </div>

                </header>


                {/* =================================================
                    ALERTAS
                ================================================= */}

                {
                    erro && (

                        <div
                            className={
                                styles.alertaErro
                            }
                            role="alert"
                        >

                            <FiAlertCircle />

                            <span>
                                {erro}
                            </span>

                        </div>

                    )
                }


                {
                    sucesso && (

                        <div
                            className={
                                styles.alertaSucesso
                            }
                            role="status"
                        >

                            <FiCheckCircle />

                            <span>
                                {sucesso}
                            </span>

                        </div>

                    )
                }


                {/* =================================================
                    RESUMO
                ================================================= */}

                <section
                    className={
                        styles.resumo
                    }
                >

                    <article
                        className={
                            styles.cardResumo
                        }
                    >

                        <span>
                            Total de fornecedores
                        </span>

                        <div>

                            <strong>
                                {resumo.total}
                            </strong>

                            <FiBriefcase />

                        </div>

                    </article>


                    <article
                        className={
                            styles.cardResumo
                        }
                    >

                        <span>
                            Fornecedores ativos
                        </span>

                        <div>

                            <strong>
                                {resumo.ativos}
                            </strong>

                            <FiCheckCircle />

                        </div>

                    </article>


                    <article
                        className={
                            styles.cardResumo
                        }
                    >

                        <span>
                            Fornecedores inativos
                        </span>

                        <div>

                            <strong>
                                {resumo.inativos}
                            </strong>

                            <FiXCircle />

                        </div>

                    </article>


                    <article
                        className={
                            styles.cardResumo
                        }
                    >

                        <span>
                            Marcas atendidas
                        </span>

                        <div>

                            <strong>
                                {resumo.marcas}
                            </strong>

                            <FiTag />

                        </div>

                    </article>

                </section>


                {/* =================================================
                    BARRA DE CONTROLE
                ================================================= */}

                <section
                    className={
                        styles.controles
                    }
                >

                    <label
                        className={
                            styles.busca
                        }
                    >

                        <FiSearch />

                        <input
                            type="search"
                            value={busca}
                            onChange={
                                event =>
                                    setBusca(
                                        event.target.value
                                    )
                            }
                            placeholder="Buscar fornecedor, CNPJ, marca ou cidade..."
                        />

                    </label>


                    <div
                        className={
                            styles.filtros
                        }
                    >

                        <button
                            type="button"
                            className={
                                filtro === "todos"
                                    ? styles.filtroAtivo
                                    : ""
                            }
                            onClick={() =>
                                setFiltro("todos")
                            }
                        >
                            Todos
                        </button>


                        <button
                            type="button"
                            className={
                                filtro === "ativos"
                                    ? styles.filtroAtivo
                                    : ""
                            }
                            onClick={() =>
                                setFiltro("ativos")
                            }
                        >
                            Ativos
                        </button>


                        <button
                            type="button"
                            className={
                                filtro === "inativos"
                                    ? styles.filtroAtivo
                                    : ""
                            }
                            onClick={() =>
                                setFiltro("inativos")
                            }
                        >
                            Inativos
                        </button>

                    </div>


                    <button
                        type="button"
                        className={
                            styles.atualizar
                        }
                        onClick={
                            carregarFornecedores
                        }
                    >

                        <FiRefreshCw />

                        Atualizar

                    </button>

                </section>


                {/* =================================================
                    LISTAGEM
                ================================================= */}

                <section
                    className={
                        styles.painel
                    }
                >

                    <div
                        className={
                            styles.painelTopo
                        }
                    >

                        <div>

                            <span>
                                FORNECEDORES
                            </span>

                            <h2>
                                Lista de fornecedores
                            </h2>

                        </div>


                        <span
                            className={
                                styles.quantidade
                            }
                        >

                            {
                                fornecedoresFiltrados.length
                            }

                            {" "}

                            resultado{
                                fornecedoresFiltrados.length ===
                                1
                                    ? ""
                                    : "s"
                            }

                        </span>

                    </div>


                    {
                        carregando ? (

                            <div
                                className={
                                    styles.estadoVazio
                                }
                            >

                                <FiRefreshCw
                                    className={
                                        styles.girando
                                    }
                                />

                                <strong>
                                    Carregando fornecedores...
                                </strong>

                            </div>

                        ) : fornecedoresFiltrados.length ===
                        0 ? (

                            <div
                                className={
                                    styles.estadoVazio
                                }
                            >

                                <FiBriefcase />

                                <strong>
                                    Nenhum fornecedor encontrado.
                                </strong>

                                <span>
                                    Tente alterar os filtros
                                    ou a busca.
                                </span>

                            </div>

                        ) : (

                            <div
                                className={
                                    styles.tabelaWrapper
                                }
                            >

                                <table
                                    className={
                                        styles.tabela
                                    }
                                >

                                    <thead>

                                        <tr>

                                            <th>
                                                Fornecedor
                                            </th>

                                            <th>
                                                Marcas
                                            </th>

                                            <th>
                                                Contato
                                            </th>

                                            <th>
                                                Localização
                                            </th>

                                            <th>
                                                Status
                                            </th>

                                            <th>
                                                Ações
                                            </th>

                                        </tr>

                                    </thead>


                                    <tbody>

                                        {
                                            fornecedoresFiltrados.map(
                                                fornecedor => (

                                                    <tr
                                                        key={
                                                            fornecedor.id
                                                        }
                                                    >

                                                        <td>

                                                            <div
                                                                className={
                                                                    styles.fornecedorPrincipal
                                                                }
                                                            >

                                                                <div
                                                                    className={
                                                                        styles.avatarFornecedor
                                                                    }
                                                                >

                                                                    {
                                                                        fornecedor.nome
                                                                            ?.charAt(0)
                                                                            .toUpperCase() ||
                                                                        "F"
                                                                    }

                                                                </div>


                                                                <div>

                                                                    <strong>
                                                                        {
                                                                            fornecedor.nome
                                                                        }
                                                                    </strong>

                                                                    <span>
                                                                        {
                                                                            fornecedor.cnpj ||
                                                                            "CNPJ não informado"
                                                                        }
                                                                    </span>

                                                                </div>

                                                            </div>

                                                        </td>


                                                        <td>

                                                            <div
                                                                className={
                                                                    styles.marcas
                                                                }
                                                            >

                                                                {
                                                                    fornecedor.marcas
                                                                        ?.length >
                                                                    0
                                                                        ? fornecedor.marcas.map(
                                                                            marca => (

                                                                                <span
                                                                                    key={
                                                                                        marca.id
                                                                                    }
                                                                                >
                                                                                    {
                                                                                        marca.nome
                                                                                    }
                                                                                </span>

                                                                            )
                                                                        )

                                                                        : (
                                                                            <small>
                                                                                Nenhuma marca
                                                                            </small>
                                                                        )
                                                                }

                                                            </div>

                                                        </td>


                                                        <td>

                                                            <div
                                                                className={
                                                                    styles.contato
                                                                }
                                                            >

                                                                <strong>
                                                                    {
                                                                        fornecedor.contato_nome ||
                                                                        "Não informado"
                                                                    }
                                                                </strong>

                                                                {
                                                                    fornecedor.email && (

                                                                        <span>
                                                                            {
                                                                                fornecedor.email
                                                                            }
                                                                        </span>

                                                                    )
                                                                }

                                                                {
                                                                    fornecedor.telefone && (

                                                                        <span>
                                                                            {
                                                                                fornecedor.telefone
                                                                            }
                                                                        </span>

                                                                    )
                                                                }

                                                            </div>

                                                        </td>


                                                        <td>

                                                            <div
                                                                className={
                                                                    styles.localizacao
                                                                }
                                                            >

                                                                <FiMapPin />

                                                                <span>

                                                                    {
                                                                        fornecedor.cidade
                                                                            ? `${fornecedor.cidade}${fornecedor.estado ? ` - ${fornecedor.estado}` : ""}`
                                                                            : "Não informado"
                                                                    }

                                                                </span>

                                                            </div>

                                                        </td>


                                                        <td>

                                                            <span
                                                                className={
                                                                    fornecedorAtivo(
                                                                        fornecedor
                                                                    )
                                                                        ? styles.statusAtivo
                                                                        : styles.statusInativo
                                                                }
                                                            >

                                                                <i />

                                                                {
                                                                    fornecedorAtivo(
                                                                        fornecedor
                                                                    )
                                                                        ? "Ativo"
                                                                        : "Inativo"
                                                                }

                                                            </span>

                                                        </td>


                                                        <td>

                                                            <div
                                                                className={
                                                                    styles.acoes
                                                                }
                                                            >

                                                                <button
                                                                    type="button"
                                                                    title="Ver detalhes"
                                                                    onClick={() =>
                                                                        setFornecedorSelecionado(
                                                                            fornecedor
                                                                        )
                                                                    }
                                                                >

                                                                    <FiEye />

                                                                </button>


                                                                <button
                                                                    type="button"
                                                                    title={
                                                                        fornecedorAtivo(
                                                                            fornecedor
                                                                        )
                                                                            ? "Desativar"
                                                                            : "Ativar"
                                                                    }
                                                                    disabled={
                                                                        processandoId ===
                                                                        fornecedor.id
                                                                    }
                                                                    onClick={() =>
                                                                        alterarStatus(
                                                                            fornecedor
                                                                        )
                                                                    }
                                                                >

                                                                    {
                                                                        fornecedorAtivo(
                                                                            fornecedor
                                                                        )
                                                                            ? (
                                                                                <FiXCircle />
                                                                            )
                                                                            : (
                                                                                <FiCheckCircle />
                                                                            )
                                                                    }

                                                                </button>


                                                                <button
                                                                    type="button"
                                                                    title="Excluir"
                                                                    className={
                                                                        styles.botaoExcluir
                                                                    }
                                                                    disabled={
                                                                        processandoId ===
                                                                        fornecedor.id
                                                                    }
                                                                    onClick={() =>
                                                                        excluirFornecedor(
                                                                            fornecedor
                                                                        )
                                                                    }
                                                                >

                                                                    <FiTrash2 />

                                                                </button>

                                                            </div>

                                                        </td>

                                                    </tr>

                                                )
                                            )
                                        }

                                    </tbody>

                                </table>

                            </div>

                        )
                    }

                </section>

            </main>


            {/* =====================================================
                MODAL DETALHES
            ===================================================== */}

            {
                fornecedorSelecionado && (

                    <div
                        className={
                            styles.modalOverlay
                        }
                        onMouseDown={
                            event => {

                                if (
                                    event.target ===
                                    event.currentTarget
                                ) {

                                    setFornecedorSelecionado(
                                        null
                                    );

                                }

                            }
                        }
                    >

                        <section
                            className={
                                styles.modal
                            }
                            role="dialog"
                            aria-modal="true"
                        >

                            <button
                                type="button"
                                className={
                                    styles.fecharModal
                                }
                                onClick={() =>
                                    setFornecedorSelecionado(
                                        null
                                    )
                                }
                            >

                                <FiX />

                            </button>


                            <div
                                className={
                                    styles.modalCabecalho
                                }
                            >

                                <div
                                    className={
                                        styles.modalIcone
                                    }
                                >

                                    <FiBriefcase />

                                </div>


                                <div>

                                    <span>
                                        FORNECEDOR
                                    </span>

                                    <h2>
                                        {
                                            fornecedorSelecionado.nome
                                        }
                                    </h2>

                                    <p>
                                        {
                                            fornecedorSelecionado.cnpj ||
                                            "CNPJ não informado"
                                        }
                                    </p>

                                </div>

                            </div>


                            <div
                                className={
                                    styles.modalStatus
                                }
                            >

                                <span>
                                    Status atual
                                </span>

                                <strong
                                    className={
                                        fornecedorAtivo(
                                            fornecedorSelecionado
                                        )
                                            ? styles.textoAtivo
                                            : styles.textoInativo
                                    }
                                >

                                    {
                                        fornecedorAtivo(
                                            fornecedorSelecionado
                                        )
                                            ? "Ativo"
                                            : "Inativo"
                                    }

                                </strong>

                            </div>


                            <div
                                className={
                                    styles.modalGrid
                                }
                            >

                                <div
                                    className={
                                        styles.blocoDetalhe
                                    }
                                >

                                    <div
                                        className={
                                            styles.tituloDetalhe
                                        }
                                    >

                                        <FiUser />

                                        <span>
                                            Contato
                                        </span>

                                    </div>


                                    <strong>
                                        {
                                            fornecedorSelecionado.contato_nome ||
                                            "Não informado"
                                        }
                                    </strong>


                                    <p>

                                        <FiMail />

                                        {
                                            fornecedorSelecionado.email ||
                                            "E-mail não informado"
                                        }

                                    </p>


                                    <p>

                                        <FiPhone />

                                        {
                                            fornecedorSelecionado.telefone ||
                                            "Telefone não informado"
                                        }

                                    </p>

                                </div>


                                <div
                                    className={
                                        styles.blocoDetalhe
                                    }
                                >

                                    <div
                                        className={
                                            styles.tituloDetalhe
                                        }
                                    >

                                        <FiMapPin />

                                        <span>
                                            Endereço
                                        </span>

                                    </div>


                                    <strong>
                                        {
                                            montarEndereco(
                                                fornecedorSelecionado
                                            ).primeiraLinha
                                        }
                                    </strong>


                                    {
                                        montarEndereco(
                                            fornecedorSelecionado
                                        ).segundaLinha && (

                                            <p>
                                                {
                                                    montarEndereco(
                                                        fornecedorSelecionado
                                                    ).segundaLinha
                                                }
                                            </p>

                                        )
                                    }


                                    {
                                        fornecedorSelecionado.complemento && (

                                            <p>
                                                {
                                                    fornecedorSelecionado.complemento
                                                }
                                            </p>

                                        )
                                    }


                                    {
                                        montarEndereco(
                                            fornecedorSelecionado
                                        ).cep && (

                                            <p>
                                                CEP{" "}
                                                {
                                                    montarEndereco(
                                                        fornecedorSelecionado
                                                    ).cep
                                                }
                                            </p>

                                        )
                                    }

                                </div>

                            </div>


                            <div
                                className={
                                    styles.blocoMarcasModal
                                }
                            >

                                <div
                                    className={
                                        styles.tituloDetalhe
                                    }
                                >

                                    <FiTag />

                                    <span>
                                        Marcas fornecidas
                                    </span>

                                </div>


                                <div
                                    className={
                                        styles.marcasModal
                                    }
                                >

                                    {
                                        fornecedorSelecionado.marcas
                                            ?.length >
                                        0
                                            ? fornecedorSelecionado.marcas.map(
                                                marca => (

                                                    <span
                                                        key={
                                                            marca.id
                                                        }
                                                    >

                                                        {
                                                            marca.nome
                                                        }

                                                    </span>

                                                )
                                            )

                                            : (
                                                <p>
                                                    Nenhuma marca vinculada.
                                                </p>
                                            )
                                    }

                                </div>

                            </div>


                            <div
                                className={
                                    styles.modalAcoes
                                }
                            >

                                <button
                                    type="button"
                                    onClick={() =>
                                        alterarStatus(
                                            fornecedorSelecionado
                                        )
                                    }
                                    disabled={
                                        processandoId ===
                                        fornecedorSelecionado.id
                                    }
                                >

                                    {
                                        fornecedorAtivo(
                                            fornecedorSelecionado
                                        )
                                            ? (
                                                <>
                                                    <FiXCircle />
                                                    Desativar fornecedor
                                                </>
                                            )
                                            : (
                                                <>
                                                    <FiCheckCircle />
                                                    Ativar fornecedor
                                                </>
                                            )
                                    }

                                </button>


                                <button
                                    type="button"
                                    className={
                                        styles.modalExcluir
                                    }
                                    onClick={() =>
                                        excluirFornecedor(
                                            fornecedorSelecionado
                                        )
                                    }
                                    disabled={
                                        processandoId ===
                                        fornecedorSelecionado.id
                                    }
                                >

                                    <FiTrash2 />

                                    Excluir

                                </button>


                                <button
                                    type="button"
                                    className={
                                        styles.modalFechar
                                    }
                                    onClick={() =>
                                        setFornecedorSelecionado(
                                            null
                                        )
                                    }
                                >

                                    Fechar

                                    <FiChevronRight />

                                </button>

                            </div>

                        </section>

                    </div>

                )
            }

        </div>

    );

}