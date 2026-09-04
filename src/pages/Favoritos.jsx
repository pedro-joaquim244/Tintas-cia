import {
    useEffect,
    useMemo,
    useState
} from "react";

import {
    FiArrowRight,
    FiCheck,
    FiHeart,
    FiSearch,
    FiShoppingBag,
    FiShoppingCart,
    FiTrash2,
    FiX
} from "react-icons/fi";

import {
    useNavigate
} from "react-router-dom";

import HeaderUser
    from "../components/Cabeçalho-Users/index.jsx";

import Rodape
    from "../components/Rodape-User/Rodape.jsx";

import { api }
    from "../services/api.js";

import { useAuth }
    from "../contexts/authContext.jsx";

import styles
    from "../styles/Favoritos.module.css";


const API_URL =
    import.meta.env.VITE_API_URL ||
    "http://localhost:3333";


export default function Favoritos() {

    const navigate =
        useNavigate();


    const {
        usuario
    } = useAuth();


    // =====================================================
    // ESTADOS
    // =====================================================

    const [
        favoritos,
        setFavoritos
    ] = useState([]);


    const [
        selecionados,
        setSelecionados
    ] = useState([]);


    const [
        carregando,
        setCarregando
    ] = useState(true);


    const [
        removendoId,
        setRemovendoId
    ] = useState(null);


    const [
        enviandoCompras,
        setEnviandoCompras
    ] = useState(false);


    const [
        busca,
        setBusca
    ] = useState("");


    const [
        erro,
        setErro
    ] = useState("");


    const [
        sucesso,
        setSucesso
    ] = useState("");


    // =====================================================
    // CARREGAR FAVORITOS
    // =====================================================

    useEffect(() => {

        carregarFavoritos();

    }, []);


    async function carregarFavoritos() {

        try {

            setCarregando(true);

            setErro("");


            const resposta =
                await api.get(
                    "/favoritos"
                );


            setFavoritos(
                Array.isArray(resposta.data)
                    ? resposta.data
                    : []
            );


        } catch (error) {

            console.error(
                "Erro ao carregar favoritos:",
                error
            );


            setErro(
                error.response?.data?.erro ||
                "Não foi possível carregar seus favoritos."
            );


        } finally {

            setCarregando(false);

        }

    }


    // =====================================================
    // VERIFICAR DISPONIBILIDADE
    // =====================================================

    function produtoDisponivel(
        produto
    ) {

        const status =
            String(
                produto.status || ""
            )
                .trim()
                .toLowerCase();


        const quantidade =
            Number(
                produto.quantidade || 0
            );


        return (
            status === "ativo" &&
            quantidade > 0
        );

    }


    // =====================================================
    // SELECIONAR PRODUTO
    // =====================================================

    function alternarSelecao(
        produto
    ) {

        if (
            !produtoDisponivel(
                produto
            )
        ) {

            return;

        }


        setSelecionados(
            atuais => {

                const existe =
                    atuais.includes(
                        produto.id
                    );


                if (existe) {

                    return atuais.filter(
                        id =>
                            id !== produto.id
                    );

                }


                return [
                    ...atuais,
                    produto.id
                ];

            }
        );

    }


    // =====================================================
    // REMOVER FAVORITO
    // =====================================================

    async function removerFavorito(
        itemId
    ) {

        try {

            setRemovendoId(
                itemId
            );

            setErro("");

            setSucesso("");


            await api.delete(
                `/favoritos/${itemId}`
            );


            setFavoritos(
                atuais =>
                    atuais.filter(
                        item =>
                            item.id !==
                            itemId
                    )
            );


            setSelecionados(
                atuais =>
                    atuais.filter(
                        id =>
                            id !==
                            itemId
                    )
            );


            setSucesso(
                "Produto removido da sua lista de desejos."
            );


            setTimeout(() => {

                setSucesso("");

            }, 3000);


        } catch (error) {

            console.error(
                "Erro ao remover favorito:",
                error
            );


            setErro(
                error.response?.data?.erro ||
                "Não foi possível remover o produto dos favoritos."
            );


        } finally {

            setRemovendoId(null);

        }

    }


    // =====================================================
    // FORMATAR PREÇO
    // =====================================================

    function formatarPreco(
        valor
    ) {

        return Number(
            valor || 0
        ).toLocaleString(
            "pt-BR",
            {
                style:
                    "currency",

                currency:
                    "BRL"
            }
        );

    }


    // =====================================================
    // IMAGEM
    // =====================================================

    function obterImagem(
        foto
    ) {

        if (!foto) {

            return null;

        }


        if (
            foto.startsWith(
                "http"
            )
        ) {

            return foto;

        }


        return `${API_URL}/${foto.replace(/^\/+/, "")}`;

    }


    // =====================================================
    // FILTRAR
    // =====================================================

    const favoritosFiltrados =
        useMemo(() => {

            const termo =
                busca
                    .trim()
                    .toLowerCase();


            if (!termo) {

                return favoritos;

            }


            return favoritos.filter(
                item => {

                    const texto = `
                        ${item.nome || ""}
                        ${item.marca || ""}
                        ${item.cor || ""}
                        ${item.descricao || ""}
                    `
                        .toLowerCase();


                    return texto.includes(
                        termo
                    );

                }
            );

        }, [
            favoritos,
            busca
        ]);


    // =====================================================
    // PRODUTOS SELECIONADOS
    // =====================================================

    const produtosSelecionados =
        useMemo(() => {

            return favoritos.filter(
                produto =>
                    selecionados.includes(
                        produto.id
                    )
            );

        }, [
            favoritos,
            selecionados
        ]);


    // =====================================================
    // TOTAL DOS SELECIONADOS
    // =====================================================

    const totalSelecionado =
        useMemo(() => {

            return produtosSelecionados
                .reduce(
                    (
                        total,
                        produto
                    ) =>
                        total +
                        Number(
                            produto.preco || 0
                        ),
                    0
                );

        }, [
            produtosSelecionados
        ]);


    // =====================================================
    // SELECIONAR TODOS VISÍVEIS
    // =====================================================

    const produtosDisponiveisVisiveis =
        useMemo(() => {

            return favoritosFiltrados.filter(
                produto =>
                    produtoDisponivel(
                        produto
                    )
            );

        }, [
            favoritosFiltrados
        ]);


    const todosSelecionados =
        produtosDisponiveisVisiveis.length >
            0 &&
        produtosDisponiveisVisiveis.every(
            produto =>
                selecionados.includes(
                    produto.id
                )
        );


    function alternarTodos() {

        const idsVisiveis =
            produtosDisponiveisVisiveis.map(
                produto =>
                    produto.id
            );


        if (todosSelecionados) {

            setSelecionados(
                atuais =>
                    atuais.filter(
                        id =>
                            !idsVisiveis.includes(
                                id
                            )
                    )
            );

            return;

        }


        setSelecionados(
            atuais => [
                ...new Set([
                    ...atuais,
                    ...idsVisiveis
                ])
            ]
        );

    }


    // =====================================================
    // ENVIAR PARA COMPRAS
    // =====================================================

    async function irParaCompras() {

        if (
            selecionados.length === 0
        ) {

            setErro(
                "Selecione pelo menos um produto."
            );

            return;

        }


        if (!usuario?.id) {

            setErro(
                "Não foi possível identificar o usuário."
            );

            return;

        }


        try {

            setEnviandoCompras(true);

            setErro("");

            setSucesso("");


            let adicionados = 0;

            let jaExistentes = 0;


            for (
                const produto
                of produtosSelecionados
            ) {

                try {

                    await api.post(
                        "/carrinho",
                        {
                            usuario_id:
                                usuario.id,

                            produto_id:
                                produto.id,

                            quantidade:
                                1
                        }
                    );


                    adicionados += 1;


                } catch (error) {

                    /*
                     * Caso o backend informe que o
                     * produto já está no carrinho,
                     * não precisamos bloquear a compra.
                     */

                    if (
                        error.response?.status ===
                        409
                    ) {

                        jaExistentes += 1;

                        continue;

                    }


                    throw error;

                }

            }


            if (
                adicionados === 0 &&
                jaExistentes === 0
            ) {

                throw new Error(
                    "Nenhum produto foi adicionado."
                );

            }


            navigate(
                "/cliente/compra"
            );


        } catch (error) {

            console.error(
                "Erro ao enviar favoritos para compras:",
                error
            );


            setErro(
                error.response?.data?.erro ||
                "Não foi possível adicionar os produtos às compras."
            );


        } finally {

            setEnviandoCompras(false);

        }

    }


    // =====================================================
    // RENDER
    // =====================================================

    return (

        <div
            className={
                styles.pagina
            }
        >

            <HeaderUser />


            <main
                className={
                    styles.main
                }
            >


                {/* =================================================
                    TOPO
                ================================================= */}

                <section
                    className={
                        styles.hero
                    }
                >

                    <div
                        className={
                            styles.heroDecoracao
                        }
                    />


                    <div
                        className={
                            styles.heroConteudo
                        }
                    >

                        <span
                            className={
                                styles.eyebrow
                            }
                        >

                            MINHA LISTA DE DESEJOS

                        </span>


                        <h1>

                            Produtos que você

                            <em>
                                {" "}quer guardar.
                            </em>

                        </h1>


                        <p>

                            Salve suas tintas favoritas,
                            escolha o que deseja comprar e
                            envie tudo para sua compra de
                            uma só vez.

                        </p>

                    </div>


                    <div
                        className={
                            styles.heroResumo
                        }
                    >

                        <div>

                            <span>
                                FAVORITOS
                            </span>

                            <strong>
                                {
                                    favoritos.length
                                        .toString()
                                        .padStart(
                                            2,
                                            "0"
                                        )
                                }
                            </strong>

                        </div>


                        <div
                            className={
                                styles.linhaHero
                            }
                        />


                        <div>

                            <span>
                                SELECIONADOS
                            </span>

                            <strong>
                                {
                                    selecionados.length
                                        .toString()
                                        .padStart(
                                            2,
                                            "0"
                                        )
                                }
                            </strong>

                        </div>

                    </div>

                </section>


                {/* =================================================
                    CABEÇALHO DA VITRINE
                ================================================= */}

                {
                    favoritos.length > 0 && (

                        <section
                            className={
                                styles.cabecalhoVitrine
                            }
                        >

                            <div
                                className={
                                    styles.tituloVitrine
                                }
                            >

                                <span>
                                    SUA COLEÇÃO
                                </span>

                                <h2>
                                    Lista de desejos
                                </h2>

                            </div>


                            <div
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
                                        placeholder="Buscar produto..."
                                    />

                                </label>


                                <button
                                    type="button"
                                    className={
                                        todosSelecionados
                                            ? styles.selecionarTodosAtivo
                                            : styles.selecionarTodos
                                    }
                                    onClick={
                                        alternarTodos
                                    }
                                >

                                    <span
                                        className={
                                            styles.checkboxPequeno
                                        }
                                    >

                                        {
                                            todosSelecionados &&
                                            <FiCheck />
                                        }

                                    </span>

                                    {
                                        todosSelecionados
                                            ? "Desmarcar todos"
                                            : "Selecionar todos"
                                    }

                                </button>

                            </div>

                        </section>

                    )
                }


                {/* =================================================
                    MENSAGENS
                ================================================= */}

                {
                    erro && (

                        <div
                            className={
                                styles.erro
                            }
                        >

                            <FiX />

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
                                styles.sucesso
                            }
                        >

                            <FiCheck />

                            <span>
                                {sucesso}
                            </span>

                        </div>

                    )
                }


                {/* =================================================
                    CARREGANDO
                ================================================= */}

                {
                    carregando && (

                        <section
                            className={
                                styles.estado
                            }
                        >

                            <div
                                className={
                                    styles.loader
                                }
                            />

                            <strong>
                                Carregando sua lista...
                            </strong>

                            <span>
                                Aguarde um instante.
                            </span>

                        </section>

                    )
                }


                {/* =================================================
                    LISTA VAZIA
                ================================================= */}

                {
                    !carregando &&
                    favoritos.length === 0 && (

                        <section
                            className={
                                styles.vazio
                            }
                        >

                            <div
                                className={
                                    styles.vazioIcone
                                }
                            >

                                <FiHeart />

                            </div>


                            <span>
                                SUA LISTA ESTÁ VAZIA
                            </span>


                            <h2>

                                Comece a montar sua

                                <em>
                                    {" "}lista de desejos.
                                </em>

                            </h2>


                            <p>

                                Explore nosso catálogo,
                                encontre suas tintas
                                favoritas e use o coração
                                para salvá-las aqui.

                            </p>


                            <button
                                type="button"
                                onClick={() =>
                                    navigate(
                                        "/cliente/produtos"
                                    )
                                }
                            >

                                Ver produtos

                                <FiArrowRight />

                            </button>

                        </section>

                    )
                }


                {/* =================================================
                    SEM RESULTADOS
                ================================================= */}

                {
                    !carregando &&
                    favoritos.length > 0 &&
                    favoritosFiltrados.length ===
                    0 && (

                        <section
                            className={
                                styles.estado
                            }
                        >

                            <FiSearch />

                            <strong>
                                Nenhum produto encontrado.
                            </strong>

                            <span>
                                Tente buscar por outro nome,
                                marca ou cor.
                            </span>

                        </section>

                    )
                }


                {/* =================================================
                    VITRINE
                ================================================= */}

                {
                    !carregando &&
                    favoritosFiltrados.length >
                    0 && (

                        <section
                            className={
                                styles.vitrine
                            }
                        >

                            {
                                favoritosFiltrados.map(
                                    produto => {

                                        const selecionado =
                                            selecionados.includes(
                                                produto.id
                                            );


                                        const disponivel =
                                            produtoDisponivel(
                                                produto
                                            );


                                        const imagem =
                                            obterImagem(
                                                produto.foto
                                            );


                                        return (

                                            <article
                                                key={
                                                    produto.id
                                                }
                                                className={
                                                    `
                                                        ${styles.card}
                                                        ${
                                                            selecionado
                                                                ? styles.cardSelecionado
                                                                : ""
                                                        }
                                                    `
                                                }
                                            >


                                                {/* =================================
                                                    IMAGEM
                                                ================================= */}

                                                <div
                                                    className={
                                                        styles.imagemArea
                                                    }
                                                >


                                                    {/* SELEÇÃO */}

                                                    <button
                                                        type="button"
                                                        className={
                                                            selecionado
                                                                ? styles.botaoSelecionarAtivo
                                                                : styles.botaoSelecionar
                                                        }
                                                        disabled={
                                                            !disponivel
                                                        }
                                                        aria-pressed={
                                                            selecionado
                                                        }
                                                        onClick={() =>
                                                            alternarSelecao(
                                                                produto
                                                            )
                                                        }
                                                    >

                                                        <span>

                                                            {
                                                                selecionado &&
                                                                <FiCheck />
                                                            }

                                                        </span>

                                                        {
                                                            disponivel
                                                                ? (
                                                                    selecionado
                                                                        ? "Selecionado"
                                                                        : "Selecionar"
                                                                )
                                                                : "Indisponível"
                                                        }

                                                    </button>


                                                    {/* FAVORITO */}

                                                    <button
                                                        type="button"
                                                        className={
                                                            styles.botaoFavorito
                                                        }
                                                        title="Remover dos favoritos"
                                                        disabled={
                                                            removendoId ===
                                                            produto.id
                                                        }
                                                        onClick={() =>
                                                            removerFavorito(
                                                                produto.id
                                                            )
                                                        }
                                                    >

                                                        <FiHeart />

                                                    </button>


                                                    {
                                                        imagem ? (

                                                            <img
                                                                src={
                                                                    imagem
                                                                }
                                                                alt={
                                                                    produto.nome
                                                                }
                                                            />

                                                        ) : (

                                                            <div
                                                                className={
                                                                    styles.semImagem
                                                                }
                                                            >

                                                                <FiShoppingBag />

                                                                <span>
                                                                    Pixel Color
                                                                </span>

                                                            </div>

                                                        )
                                                    }


                                                    <div
                                                        className={
                                                            styles.marcaImagem
                                                        }
                                                    >

                                                        {
                                                            produto.marca ||
                                                            "Pixel Color"
                                                        }

                                                    </div>

                                                </div>


                                                {/* =================================
                                                    INFORMAÇÕES
                                                ================================= */}

                                                <div
                                                    className={
                                                        styles.cardConteudo
                                                    }
                                                >

                                                    <div
                                                        className={
                                                            styles.cardTopo
                                                        }
                                                    >

                                                        <div
                                                            className={
                                                                styles.meta
                                                            }
                                                        >

                                                            {
                                                                produto.cor && (

                                                                    <span>
                                                                        {
                                                                            produto.cor
                                                                        }
                                                                    </span>

                                                                )
                                                            }


                                                            <span
                                                                className={
                                                                    disponivel
                                                                        ? styles.disponivel
                                                                        : styles.indisponivel
                                                                }
                                                            >

                                                                <i />

                                                                {
                                                                    disponivel
                                                                        ? "Disponível"
                                                                        : "Indisponível"
                                                                }

                                                            </span>

                                                        </div>


                                                        <h2>
                                                            {
                                                                produto.nome
                                                            }
                                                        </h2>


                                                        {
                                                            produto.descricao && (

                                                                <p>
                                                                    {
                                                                        produto.descricao
                                                                    }
                                                                </p>

                                                            )
                                                        }

                                                    </div>


                                                    <div
                                                        className={
                                                            styles.cardRodape
                                                        }
                                                    >

                                                        <div
                                                            className={
                                                                styles.preco
                                                            }
                                                        >

                                                            <small>
                                                                Por
                                                            </small>

                                                            <strong>
                                                                {
                                                                    formatarPreco(
                                                                        produto.preco
                                                                    )
                                                                }
                                                            </strong>

                                                        </div>


                                                        <button
                                                            type="button"
                                                            className={
                                                                styles.remover
                                                            }
                                                            disabled={
                                                                removendoId ===
                                                                produto.id
                                                            }
                                                            onClick={() =>
                                                                removerFavorito(
                                                                    produto.id
                                                                )
                                                            }
                                                        >

                                                            <FiTrash2 />

                                                        </button>

                                                    </div>

                                                </div>

                                            </article>

                                        );

                                    }
                                )
                            }

                        </section>

                    )
                }


                {/* =================================================
                    RODAPÉ DA VITRINE
                ================================================= */}

                {
                    !carregando &&
                    favoritos.length > 0 && (

                        <section
                            className={
                                styles.continuar
                            }
                        >

                            <div>

                                <span>
                                    AINDA PROCURANDO?
                                </span>

                                <h2>

                                    Explore mais

                                    <em>
                                        {" "}possibilidades.
                                    </em>

                                </h2>

                            </div>


                            <button
                                type="button"
                                onClick={() =>
                                    navigate(
                                        "/cliente/produtos"
                                    )
                                }
                            >

                                Continuar explorando

                                <FiArrowRight />

                            </button>

                        </section>

                    )
                }


            </main>


            {/* =====================================================
                BARRA DE SELEÇÃO
            ===================================================== */}

            {
                selecionados.length > 0 && (

                    <aside
                        className={
                            styles.barraCompras
                        }
                    >

                        <div
                            className={
                                styles.barraConteudo
                            }
                        >

                            <div
                                className={
                                    styles.resumoCompras
                                }
                            >

                                <div
                                    className={
                                        styles.iconeCarrinho
                                    }
                                >

                                    <FiShoppingCart />

                                </div>


                                <div>

                                    <span>
                                        SUA SELEÇÃO
                                    </span>

                                    <strong>

                                        {
                                            selecionados.length
                                        }

                                        {" "}

                                        {
                                            selecionados.length ===
                                            1
                                                ? "produto"
                                                : "produtos"
                                        }

                                    </strong>

                                </div>

                            </div>


                            <div
                                className={
                                    styles.totalCompras
                                }
                            >

                                <span>
                                    TOTAL
                                </span>

                                <strong>
                                    {
                                        formatarPreco(
                                            totalSelecionado
                                        )
                                    }
                                </strong>

                            </div>


                            <div
                                className={
                                    styles.acoesCompras
                                }
                            >

                                <button
                                    type="button"
                                    className={
                                        styles.limparSelecao
                                    }
                                    disabled={
                                        enviandoCompras
                                    }
                                    onClick={() =>
                                        setSelecionados(
                                            []
                                        )
                                    }
                                >

                                    Limpar

                                </button>


                                <button
                                    type="button"
                                    className={
                                        styles.irCompras
                                    }
                                    disabled={
                                        enviandoCompras
                                    }
                                    onClick={
                                        irParaCompras
                                    }
                                >

                                    {
                                        enviandoCompras
                                            ? (
                                                <>
                                                    <div
                                                        className={
                                                            styles.loaderBotao
                                                        }
                                                    />

                                                    Adicionando...
                                                </>
                                            )
                                            : (
                                                <>
                                                    Ir para compras

                                                    <FiArrowRight />
                                                </>
                                            )
                                    }

                                </button>

                            </div>

                        </div>

                    </aside>

                )
            }


            <Rodape />

        </div>

    );

}