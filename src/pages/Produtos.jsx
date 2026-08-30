import {
    useEffect,
    useMemo,
    useState
} from "react";

import Cabecalho from "../components/Cabeçalho-Users";

import style from "../styles/Cores.module.css";

import {
    FaChevronLeft,
    FaChevronRight,
    FaChevronDown,
    FaShoppingCart,
    FaSearch,
    FaShieldAlt,
    FaCreditCard,
    FaGem,
    FaArrowRight,
    FaPaintRoller,
    FaBoxOpen
} from "react-icons/fa";

import {
    useNavigate
} from "react-router-dom";

import {
    api
} from "../services/api";

import {
    useAuth
} from "../contexts/authContext";


// =====================================================
// BANNERS
// =====================================================

import Banner1 from "../assets/imagens/banner1.png";
import Banner2 from "../assets/imagens/banner2.png";
import Banner3 from "../assets/imagens/banner3.png";


export default function Produtos() {

    const {
        usuario
    } = useAuth();

    const navigate =
        useNavigate();


    // =====================================================
    // ESTADOS
    // =====================================================

    const [
        produtos,
        setProdutos
    ] = useState([]);

    const [
        busca,
        setBusca
    ] = useState("");

    const [
        categoriaSelecionada,
        setCategoriaSelecionada
    ] = useState("Todos");

    const [
        modalCarrinho,
        setModalCarrinho
    ] = useState(false);

    const [
        slideAtual,
        setSlideAtual
    ] = useState(0);


    const [
        categoriasAbertas,
        setCategoriasAbertas
    ] = useState({

        "Tintas para Parede": true,

        "Tintas para Área Externa": true,

        "Tintas para Madeira": true,

        "Tintas para Metal": true,

        "Efeitos e Acabamentos": true,

        "Proteção e Segurança": true,

        "Pincéis e Acessórios": true,

        "Ferramentas": true,

        "Preparação de Superfície": true,

        "Complementos": true,

        "Outros": true

    });


    // =====================================================
    // CONTEÚDO DOS BANNERS
    // =====================================================

    const banners = useMemo(
        () => [

            {
                imagem:
                    Banner1,

                subtitulo:
                    "PIXEL COLOR",

                titulo:
                    "Cores para",

                destaque:
                    "transformar espaços.",

                descricao:
                    "Tintas, acabamentos e ferramentas selecionadas para dar vida aos seus projetos."
            },

            {
                imagem:
                    Banner2,

                subtitulo:
                    "ENCONTRE SUA COR",

                titulo:
                    "Seu projeto.",

                destaque:
                    "Seu estilo.",

                descricao:
                    "Explore diferentes tonalidades, marcas e acabamentos para encontrar a combinação ideal."
            },

            {
                imagem:
                    Banner3,

                subtitulo:
                    "QUALIDADE EM CADA DETALHE",

                titulo:
                    "Tudo para",

                destaque:
                    "a sua transformação.",

                descricao:
                    "Do preparo da superfície ao acabamento final, encontre tudo em um só lugar."
            }

        ],
        []
    );


    // =====================================================
    // BUSCAR PRODUTOS
    // =====================================================

    useEffect(() => {

        async function carregarProdutos() {

            try {

                const resposta =
                    await api.get(
                        "/itens"
                    );


                const dados =
                    resposta.data;


                let listaProdutos =
                    [];


                if (
                    Array.isArray(
                        dados
                    )
                ) {

                    listaProdutos =
                        dados;

                } else if (
                    Array.isArray(
                        dados?.itens
                    )
                ) {

                    listaProdutos =
                        dados.itens;

                } else if (
                    Array.isArray(
                        dados?.produtos
                    )
                ) {

                    listaProdutos =
                        dados.produtos;

                } else if (
                    Array.isArray(
                        dados?.data
                    )
                ) {

                    listaProdutos =
                        dados.data;

                }


                // =========================================
                // SOMENTE ATIVOS E COM ESTOQUE
                // =========================================

                const produtosAtivos =
                    listaProdutos.filter(
                        (produto) => {

                            const status =
                                String(
                                    produto?.status ||
                                    ""
                                )
                                    .trim()
                                    .toLowerCase();


                            return (
                                status ===
                                    "ativo" &&
                                Number(
                                    produto?.quantidade
                                ) > 0
                            );

                        }
                    );


                setProdutos(
                    produtosAtivos
                );

            } catch (
                error
            ) {

                console.error(
                    "ERRO AO BUSCAR PRODUTOS:",
                    error.response?.data ||
                    error
                );


                setProdutos([]);

            }

        }


        carregarProdutos();

    }, []);


    // =====================================================
    // CARROSSEL AUTOMÁTICO
    // =====================================================

    useEffect(() => {

        const intervalo =
            setInterval(
                () => {

                    setSlideAtual(
                        (atual) =>
                            atual ===
                            banners.length - 1
                                ? 0
                                : atual + 1
                    );

                },
                5000
            );


        return () =>
            clearInterval(
                intervalo
            );

    }, [banners.length]);


    // =====================================================
    // PRÓXIMO SLIDE
    // =====================================================

    function proximoSlide() {

        setSlideAtual(
            (atual) =>
                atual ===
                banners.length - 1
                    ? 0
                    : atual + 1
        );

    }


    // =====================================================
    // SLIDE ANTERIOR
    // =====================================================

    function slideAnterior() {

        setSlideAtual(
            (atual) =>
                atual === 0
                    ? banners.length - 1
                    : atual - 1
        );

    }


    // =====================================================
    // ABRIR / FECHAR CATEGORIA
    // =====================================================

    function abrirCategoria(
        nome
    ) {

        setCategoriasAbertas(
            (anterior) => ({

                ...anterior,

                [nome]:
                    !anterior[
                        nome
                    ]

            })
        );

    }


    // =====================================================
    // NORMALIZAR TEXTO
    // =====================================================

    function normalizarTexto(
        texto
    ) {

        return String(
            texto || ""
        )
            .normalize("NFD")
            .replace(
                /[\u0300-\u036f]/g,
                ""
            )
            .toLowerCase()
            .trim();

    }


    // =====================================================
    // TEXTO COMPLETO DO PRODUTO
    // =====================================================

    function textoProduto(
        produto
    ) {

        return normalizarTexto(
            `
                ${produto?.nome || ""}
                ${produto?.descricao || ""}
                ${produto?.categoria || ""}
                ${produto?.categoria_nome || ""}
                ${produto?.categoriaNome || ""}
                ${produto?.tipo || ""}
                ${produto?.marca || ""}
                ${produto?.cor || ""}
            `
        );

    }


    // =====================================================
    // DESCOBRIR CATEGORIA
    // =====================================================

    function descobrirCategoria(
        produto
    ) {

        const texto =
            textoProduto(
                produto
            );


        const categoriaBanco =
            produto?.categoria ||
            produto?.categoria_nome ||
            produto?.categoriaNome ||
            produto?.tipo;


        if (
            categoriaBanco
        ) {

            const categoriaNormalizada =
                normalizarTexto(
                    categoriaBanco
                );


            const categoriasBanco = {

                "tintas para parede":
                    "Tintas para Parede",

                "tinta para parede":
                    "Tintas para Parede",

                "tintas para area externa":
                    "Tintas para Área Externa",

                "tinta para area externa":
                    "Tintas para Área Externa",

                "tintas para madeira":
                    "Tintas para Madeira",

                "tinta para madeira":
                    "Tintas para Madeira",

                "tintas para metal":
                    "Tintas para Metal",

                "tinta para metal":
                    "Tintas para Metal",

                "efeitos e acabamentos":
                    "Efeitos e Acabamentos",

                "efeitos":
                    "Efeitos e Acabamentos",

                "acabamentos":
                    "Efeitos e Acabamentos",

                "protecao e seguranca":
                    "Proteção e Segurança",

                "protecao":
                    "Proteção e Segurança",

                "pinceis e acessorios":
                    "Pincéis e Acessórios",

                "pinceis":
                    "Pincéis e Acessórios",

                "acessorios":
                    "Pincéis e Acessórios",

                "ferramentas":
                    "Ferramentas",

                "preparacao de superficie":
                    "Preparação de Superfície",

                "preparacao":
                    "Preparação de Superfície",

                "complementos":
                    "Complementos",

                "outros":
                    "Outros"

            };


            if (
                categoriasBanco[
                    categoriaNormalizada
                ]
            ) {

                return categoriasBanco[
                    categoriaNormalizada
                ];

            }

        }


        if (
            texto.includes(
                "area externa"
            ) ||
            texto.includes(
                "externa"
            ) ||
            texto.includes(
                "exterior"
            ) ||
            texto.includes(
                "fachada"
            )
        ) {

            return "Tintas para Área Externa";

        }


        if (
            texto.includes(
                "madeira"
            ) ||
            texto.includes(
                "verniz"
            ) ||
            texto.includes(
                "stain"
            )
        ) {

            return "Tintas para Madeira";

        }


        if (
            texto.includes(
                "metal"
            ) ||
            texto.includes(
                "ferro"
            ) ||
            texto.includes(
                "esmalte"
            )
        ) {

            return "Tintas para Metal";

        }


        if (
            texto.includes(
                "efeito"
            ) ||
            texto.includes(
                "textura"
            ) ||
            texto.includes(
                "acabamento"
            ) ||
            texto.includes(
                "brilho"
            ) ||
            texto.includes(
                "fosco"
            )
        ) {

            return "Efeitos e Acabamentos";

        }


        if (
            texto.includes(
                "protecao"
            ) ||
            texto.includes(
                "impermeabilizante"
            ) ||
            texto.includes(
                "antimofo"
            ) ||
            texto.includes(
                "anti mofo"
            ) ||
            texto.includes(
                "seguranca"
            )
        ) {

            return "Proteção e Segurança";

        }


        if (
            texto.includes(
                "pincel"
            ) ||
            texto.includes(
                "pinceis"
            ) ||
            texto.includes(
                "rolo"
            ) ||
            texto.includes(
                "fita"
            ) ||
            texto.includes(
                "acessorio"
            ) ||
            texto.includes(
                "bandeja"
            ) ||
            texto.includes(
                "trincha"
            )
        ) {

            return "Pincéis e Acessórios";

        }


        if (
            texto.includes(
                "ferramenta"
            ) ||
            texto.includes(
                "espatula"
            ) ||
            texto.includes(
                "lixa"
            ) ||
            texto.includes(
                "desempenadeira"
            ) ||
            texto.includes(
                "trinca"
            ) ||
            texto.includes(
                "cacamba"
            ) ||
            texto.includes(
                "martelo"
            ) ||
            texto.includes(
                "chave"
            ) ||
            texto.includes(
                "serrote"
            )
        ) {

            return "Ferramentas";

        }


        if (
            texto.includes(
                "massa"
            ) ||
            texto.includes(
                "selador"
            ) ||
            texto.includes(
                "fundo"
            ) ||
            texto.includes(
                "cal"
            ) ||
            texto.includes(
                "removedor"
            ) ||
            texto.includes(
                "preparacao"
            )
        ) {

            return "Preparação de Superfície";

        }


        if (
            texto.includes(
                "complemento"
            ) ||
            texto.includes(
                "diluente"
            ) ||
            texto.includes(
                "thinner"
            ) ||
            texto.includes(
                "solvente"
            ) ||
            texto.includes(
                "aguarras"
            ) ||
            texto.includes(
                "cola"
            )
        ) {

            return "Complementos";

        }


        if (
            texto.includes(
                "tinta"
            ) ||
            texto.includes(
                "latex"
            ) ||
            texto.includes(
                "pva"
            ) ||
            texto.includes(
                "acrilica"
            )
        ) {

            return "Tintas para Parede";

        }


        return "Outros";

    }


    // =====================================================
    // CATEGORIAS
    // =====================================================

    const categorias =
        useMemo(
            () => {

                const nomesCategorias =
                    [

                        "Tintas para Parede",

                        "Tintas para Área Externa",

                        "Tintas para Madeira",

                        "Tintas para Metal",

                        "Efeitos e Acabamentos",

                        "Proteção e Segurança",

                        "Pincéis e Acessórios",

                        "Ferramentas",

                        "Preparação de Superfície",

                        "Complementos",

                        "Outros"

                    ];


                return nomesCategorias.map(
                    (nome) => {

                        const produtosCategoria =
                            produtos.filter(
                                (produto) =>
                                    descobrirCategoria(
                                        produto
                                    ) ===
                                    nome
                            );


                        return {

                            nome,

                            produtos:
                                produtosCategoria

                        };

                    }
                );

            },
            [produtos]
        );


    // =====================================================
    // FILTRAR PRODUTOS
    // =====================================================

    const produtosFiltrados =
        useMemo(
            () => {

                const pesquisa =
                    normalizarTexto(
                        busca
                    );


                return produtos.filter(
                    (produto) => {

                        const status =
                            normalizarTexto(
                                produto?.status
                            );


                        if (
                            status !==
                                "ativo" ||
                            Number(
                                produto?.quantidade
                            ) <= 0
                        ) {

                            return false;

                        }


                        const texto =
                            textoProduto(
                                produto
                            );


                        const correspondePesquisa =
                            texto.includes(
                                pesquisa
                            );


                        const correspondeCategoria =
                            categoriaSelecionada ===
                                "Todos" ||
                            descobrirCategoria(
                                produto
                            ) ===
                                categoriaSelecionada;


                        return (
                            correspondePesquisa &&
                            correspondeCategoria
                        );

                    }
                );

            },
            [
                produtos,
                busca,
                categoriaSelecionada
            ]
        );


    // =====================================================
    // PRODUTOS DA CATEGORIA
    // =====================================================

    function produtosDaCategoria(
        nomeCategoria
    ) {

        return produtosFiltrados.filter(
            (produto) =>
                descobrirCategoria(
                    produto
                ) ===
                nomeCategoria
        );

    }


    // =====================================================
    // IMAGEM PRODUTO
    // =====================================================

    function imagemProduto(
        produto
    ) {

        if (
            !produto?.foto
        ) {

            return "/img/tinta.png";

        }


        if (
            produto.foto.startsWith(
                "http://"
            ) ||
            produto.foto.startsWith(
                "https://"
            )
        ) {

            return produto.foto;

        }


        return `http://localhost:3333/${produto.foto}`;

    }


    // =====================================================
    // PREÇO
    // =====================================================

    function formatarPreco(
        preco
    ) {

        return Number(
            preco || 0
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
    // COR
    // =====================================================

    function obterCorProduto(
        produto
    ) {

        return (
            produto?.cor ||
            produto?.cor_nome ||
            produto?.nome_cor ||
            ""
        );

    }


    // =====================================================
    // MARCA
    // =====================================================

    function obterMarcaProduto(
        produto
    ) {

        return (
            produto?.marca ||
            ""
        );

    }


    // =====================================================
    // CARRINHO
    // =====================================================

    async function adicionarCarrinho(
        produto
    ) {

        try {

            if (
                !usuario
            ) {

                alert(
                    "Faça login para adicionar produtos"
                );


                navigate(
                    "/login"
                );


                return;

            }


            const status =
                normalizarTexto(
                    produto?.status
                );


            if (
                status !==
                    "ativo" ||
                Number(
                    produto?.quantidade
                ) <= 0
            ) {

                alert(
                    "Este produto não está disponível."
                );


                return;

            }


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


            setModalCarrinho(
                true
            );

        } catch (
            error
        ) {

            console.error(
                "Erro ao adicionar:",
                error.response?.data ||
                error
            );


            alert(
                error.response?.data?.erro ||
                "Erro ao adicionar produto"
            );

        }

    }


    // =====================================================
    // QUANTIDADE ENCONTRADA
    // =====================================================

    const quantidadeEncontrada =
        produtosFiltrados.length;


    // =====================================================
    // RENDER
    // =====================================================

    return (

        <>

            <Cabecalho />


            <main
                className={
                    style.page
                }
            >


                {/* =================================================
                    HERO
                ================================================= */}

                <section
                    className={
                        style.banner
                    }
                >

                    {/* =============================================
                        IMAGEM DO BANNER
                    ============================================= */}

                    <img
                        key={
                            slideAtual
                        }
                        src={
                            banners[
                                slideAtual
                            ].imagem
                        }
                        alt=""
                        className={
                            style.bannerImagemFundo
                        }
                    />


                    {/* =============================================
                        LEVE SOMBRA SOMENTE NO LADO DO TEXTO
                    ============================================= */}

                    <div
                        className={
                            style.bannerOverlay
                        }
                    />


                    {/* =============================================
                        CONTEÚDO ESQUERDO
                    ============================================= */}

                    <div
                        className={
                            style.bannerConteudo
                        }
                        key={
                            `texto-${slideAtual}`
                        }
                    >

                        <span
                            className={
                                style.bannerEyebrow
                            }
                        >

                            {
                                banners[
                                    slideAtual
                                ].subtitulo
                            }

                        </span>


                        <h1>

                            {
                                banners[
                                    slideAtual
                                ].titulo
                            }

                            <br />


                            <em>

                                {
                                    banners[
                                        slideAtual
                                    ].destaque
                                }

                            </em>

                        </h1>


                        <p>

                            {
                                banners[
                                    slideAtual
                                ].descricao
                            }

                        </p>


                        <button
                            type="button"
                            className={
                                style.botaoBanner
                            }
                            onClick={() =>
                                document
                                    .getElementById(
                                        "produtos"
                                    )
                                    ?.scrollIntoView({
                                        behavior:
                                            "smooth"
                                    })
                            }
                        >

                            Explorar produtos

                            <FaArrowRight />

                        </button>

                    </div>


                    {/* =============================================
                        SETA ESQUERDA
                    ============================================= */}

                    <button
                        type="button"
                        className={
                            `${style.setaBanner} ${style.esquerda}`
                        }
                        onClick={
                            slideAnterior
                        }
                        aria-label="Banner anterior"
                    >

                        <FaChevronLeft />

                    </button>


                    {/* =============================================
                        SETA DIREITA
                    ============================================= */}

                    <button
                        type="button"
                        className={
                            `${style.setaBanner} ${style.direita}`
                        }
                        onClick={
                            proximoSlide
                        }
                        aria-label="Próximo banner"
                    >

                        <FaChevronRight />

                    </button>


                    {/* =============================================
                        INDICADORES
                    ============================================= */}

                    <div
                        className={
                            style.indicadores
                        }
                    >

                        {banners.map(
                            (
                                _,
                                index
                            ) => (

                                <button
                                    type="button"
                                    key={
                                        index
                                    }
                                    className={
                                        index ===
                                        slideAtual
                                            ? style.indicadorAtivo
                                            : style.indicador
                                    }
                                    onClick={() =>
                                        setSlideAtual(
                                            index
                                        )
                                    }
                                    aria-label={
                                        `Ir para slide ${
                                            index + 1
                                        }`
                                    }
                                />

                            )
                        )}

                    </div>

                </section>


                {/* =================================================
                    INTRO CATÁLOGO
                ================================================= */}

                <section
                    className={
                        style.catalogoIntro
                    }
                >

                    <div>

                        <span
                            className={
                                style.sectionLabel
                            }
                        >
                            NOSSO CATÁLOGO
                        </span>


                        <h2>

                            Encontre o produto

                            <br />

                            <em>
                                ideal para seu projeto.
                            </em>

                        </h2>

                    </div>


                    <p>

                        Explore nossa seleção de
                        tintas, acabamentos,
                        ferramentas e acessórios
                        para cada etapa da sua
                        transformação.

                    </p>

                </section>


                {/* =================================================
                    PESQUISA E FILTROS
                ================================================= */}

                <section
                    className={
                        style.filtros
                    }
                >

                    <div
                        className={
                            style.filtrosTopo
                        }
                    >

                        <div
                            className={
                                style.pesquisa
                            }
                        >

                            <FaSearch />


                            <input
                                type="text"
                                placeholder="Buscar produtos, marcas, cores ou categorias..."
                                value={
                                    busca
                                }
                                onChange={(
                                    event
                                ) =>
                                    setBusca(
                                        event.target.value
                                    )
                                }
                            />


                            {busca && (

                                <button
                                    type="button"
                                    className={
                                        style.limparBusca
                                    }
                                    onClick={() =>
                                        setBusca("")
                                    }
                                >

                                    Limpar

                                </button>

                            )}

                        </div>


                        <div
                            className={
                                style.resultadoBusca
                            }
                        >

                            <strong>
                                {
                                    quantidadeEncontrada
                                }
                            </strong>


                            <span>

                                {
                                    quantidadeEncontrada ===
                                    1
                                        ? "produto"
                                        : "produtos"
                                }

                            </span>

                        </div>

                    </div>


                    {/* =============================================
                        CATEGORIAS
                    ============================================= */}

                    <div
                        className={
                            style.categoriasMenu
                        }
                    >

                        <button
                            type="button"
                            className={
                                categoriaSelecionada ===
                                "Todos"
                                    ? style.categoriaAtiva
                                    : style.categoriaBotao
                            }
                            onClick={() =>
                                setCategoriaSelecionada(
                                    "Todos"
                                )
                            }
                        >

                            Todos

                        </button>


                        {categorias.map(
                            (
                                categoria
                            ) => (

                                <button
                                    type="button"
                                    key={
                                        categoria.nome
                                    }
                                    className={
                                        categoriaSelecionada ===
                                        categoria.nome
                                            ? style.categoriaAtiva
                                            : style.categoriaBotao
                                    }
                                    onClick={() =>
                                        setCategoriaSelecionada(
                                            categoria.nome
                                        )
                                    }
                                >

                                    {
                                        categoria.nome
                                    }

                                </button>

                            )
                        )}

                    </div>

                </section>


                {/* =================================================
                    LISTA PRODUTOS
                ================================================= */}

                <section
                    id="produtos"
                    className={
                        style.lista
                    }
                >

                    {categorias.map(
                        (
                            categoria,
                            categoriaIndex
                        ) => {

                            if (
                                categoriaSelecionada !==
                                    "Todos" &&
                                categoriaSelecionada !==
                                    categoria.nome
                            ) {

                                return null;

                            }


                            const produtosCategoria =
                                produtosDaCategoria(
                                    categoria.nome
                                );


                            if (
                                produtosCategoria.length ===
                                    0 &&
                                !busca
                            ) {

                                return null;

                            }


                            return (

                                <section
                                    className={
                                        style.categoria
                                    }
                                    key={
                                        categoria.nome
                                    }
                                >

                                    {/* =================================
                                        CABEÇALHO
                                    ================================= */}

                                    <div
                                        className={
                                            style.tituloCategoria
                                        }
                                    >

                                        <div
                                            className={
                                                style.tituloCategoriaTexto
                                            }
                                        >

                                            <span>

                                                {
                                                    String(
                                                        categoriaIndex +
                                                        1
                                                    ).padStart(
                                                        2,
                                                        "0"
                                                    )
                                                }

                                                {" — "}

                                                CATEGORIA

                                            </span>


                                            <h2>

                                                {
                                                    categoria.nome
                                                }

                                            </h2>

                                        </div>


                                        <div
                                            className={
                                                style.categoriaDireita
                                            }
                                        >

                                            <span>

                                                {
                                                    produtosCategoria.length
                                                }

                                                {" "}

                                                {
                                                    produtosCategoria.length ===
                                                    1
                                                        ? "produto"
                                                        : "produtos"
                                                }

                                            </span>


                                            <button
                                                type="button"
                                                className={
                                                    style.botaoCategoria
                                                }
                                                onClick={() =>
                                                    abrirCategoria(
                                                        categoria.nome
                                                    )
                                                }
                                                aria-label={
                                                    categoriasAbertas[
                                                        categoria.nome
                                                    ]
                                                        ? "Fechar categoria"
                                                        : "Abrir categoria"
                                                }
                                            >

                                                {
                                                    categoriasAbertas[
                                                        categoria.nome
                                                    ]
                                                        ? (
                                                            <FaChevronDown />
                                                        )
                                                        : (
                                                            <FaChevronRight />
                                                        )
                                                }

                                            </button>

                                        </div>

                                    </div>


                                    {/* =================================
                                        PRODUTOS
                                    ================================= */}

                                    {
                                        categoriasAbertas[
                                            categoria.nome
                                        ] && (

                                            <div
                                                className={
                                                    style.produtosGrid
                                                }
                                            >

                                                {
                                                    produtosCategoria.length ===
                                                    0 ? (

                                                        <div
                                                            className={
                                                                style.semProdutos
                                                            }
                                                        >

                                                            <FaBoxOpen />


                                                            <strong>
                                                                Nenhum produto encontrado
                                                            </strong>


                                                            <p>

                                                                Tente buscar por outro
                                                                nome, marca ou categoria.

                                                            </p>

                                                        </div>

                                                    ) : (

                                                        produtosCategoria.map(
                                                            (
                                                                produto
                                                            ) => {

                                                                const marca =
                                                                    obterMarcaProduto(
                                                                        produto
                                                                    );


                                                                const cor =
                                                                    obterCorProduto(
                                                                        produto
                                                                    );


                                                                return (

                                                                    <article
                                                                        className={
                                                                            style.produto
                                                                        }
                                                                        key={
                                                                            produto.id
                                                                        }
                                                                    >

                                                                        {/* IMAGEM */}

                                                                        <div
                                                                            className={
                                                                                style.imagemProdutoBox
                                                                            }
                                                                        >

                                                                            {
                                                                                marca && (

                                                                                    <span
                                                                                        className={
                                                                                            style.marcaImagem
                                                                                        }
                                                                                    >

                                                                                        {
                                                                                            marca
                                                                                        }

                                                                                    </span>

                                                                                )
                                                                            }


                                                                            <img
                                                                                src={
                                                                                    imagemProduto(
                                                                                        produto
                                                                                    )
                                                                                }
                                                                                alt={
                                                                                    produto.nome ||
                                                                                    "Produto"
                                                                                }
                                                                                onError={(
                                                                                    event
                                                                                ) => {

                                                                                    event.currentTarget.src =
                                                                                        "/img/tinta.png";

                                                                                }}
                                                                            />

                                                                        </div>


                                                                        {/* INFO */}

                                                                        <div
                                                                            className={
                                                                                style.produtoInfo
                                                                            }
                                                                        >

                                                                            <div
                                                                                className={
                                                                                    style.produtoMeta
                                                                                }
                                                                            >

                                                                                <span>

                                                                                    {
                                                                                        marca ||
                                                                                        descobrirCategoria(
                                                                                            produto
                                                                                        )
                                                                                    }

                                                                                </span>

                                                                            </div>


                                                                            <h3>

                                                                                {
                                                                                    produto.nome ||
                                                                                    "Produto sem nome"
                                                                                }

                                                                            </h3>


                                                                            {
                                                                                cor && (

                                                                                    <div
                                                                                        className={
                                                                                            style.corProduto
                                                                                        }
                                                                                    >

                                                                                        <span
                                                                                            className={
                                                                                                style.corBolinha
                                                                                            }
                                                                                        />

                                                                                        {
                                                                                            cor
                                                                                        }

                                                                                    </div>

                                                                                )
                                                                            }


                                                                            <span
                                                                                className={
                                                                                    style.estoqueDisponivel
                                                                                }
                                                                            >

                                                                                Em estoque

                                                                                <small>

                                                                                    {
                                                                                        produto.quantidade
                                                                                    }

                                                                                    {" "}

                                                                                    unidade(s)

                                                                                </small>

                                                                            </span>


                                                                            <div
                                                                                className={
                                                                                    style.produtoRodape
                                                                                }
                                                                            >

                                                                                <div
                                                                                    className={
                                                                                        style.precoBox
                                                                                    }
                                                                                >

                                                                                    <span>
                                                                                        A partir de
                                                                                    </span>


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
                                                                                        style.carrinho
                                                                                    }
                                                                                    onClick={() =>
                                                                                        adicionarCarrinho(
                                                                                            produto
                                                                                        )
                                                                                    }
                                                                                    aria-label={
                                                                                        `Adicionar ${
                                                                                            produto.nome ||
                                                                                            "produto"
                                                                                        } ao carrinho`
                                                                                    }
                                                                                >

                                                                                    <FaShoppingCart />

                                                                                </button>

                                                                            </div>

                                                                        </div>

                                                                    </article>

                                                                );

                                                            }
                                                        )

                                                    )
                                                }

                                            </div>

                                        )
                                    }

                                </section>

                            );

                        }
                    )}


                    {/* =================================================
                        NENHUM PRODUTO
                    ================================================= */}

                    {
                        produtos.length ===
                        0 && (

                            <div
                                className={
                                    style.semProdutosGeral
                                }
                            >

                                <div>
                                    <FaPaintRoller />
                                </div>


                                <span>
                                    CATÁLOGO
                                </span>


                                <h2>
                                    Nenhum produto disponível.
                                </h2>


                                <p>

                                    No momento não temos
                                    produtos ativos com
                                    estoque disponível.

                                </p>

                            </div>

                        )
                    }

                </section>

            </main>


            {/* =====================================================
                BENEFÍCIOS
            ===================================================== */}

            <section
                className={
                    style.beneficios
                }
            >

                <div
                    className={
                        style.beneficiosConteudo
                    }
                >

                    <div
                        className={
                            style.beneficio
                        }
                    >

                        <FaShieldAlt />

                        <div>

                            <strong>
                                Pagamento seguro
                            </strong>

                            <span>
                                Ambiente protegido
                                para suas compras
                            </span>

                        </div>

                    </div>


                    <div
                        className={
                            style.beneficio
                        }
                    >

                        <FaCreditCard />

                        <div>

                            <strong>
                                Até 12x no cartão
                            </strong>

                            <span>
                                Mais facilidade para
                                seu projeto
                            </span>

                        </div>

                    </div>


                    <div
                        className={
                            style.beneficio
                        }
                    >

                        <FaGem />

                        <div>

                            <strong>
                                5% no PIX
                            </strong>

                            <span>
                                Economize no pagamento
                                à vista
                            </span>

                        </div>

                    </div>


                    <div
                        className={
                            style.beneficio
                        }
                    >

                        <FaShieldAlt />

                        <div>

                            <strong>
                                Compra garantida
                            </strong>

                            <span>
                                Segurança em cada pedido
                            </span>

                        </div>

                    </div>

                </div>

            </section>


            {/* =====================================================
                MODAL CARRINHO
            ===================================================== */}

            {
                modalCarrinho && (

                    <div
                        className={
                            style.overlay
                        }
                        onClick={() =>
                            setModalCarrinho(
                                false
                            )
                        }
                    >

                        <div
                            className={
                                style.modalCarrinho
                            }
                            onClick={(
                                event
                            ) =>
                                event.stopPropagation()
                            }
                        >

                            <span
                                className={
                                    style.modalLabel
                                }
                            >
                                CARRINHO
                            </span>


                            <div
                                className={
                                    style.icone
                                }
                            >

                                <FaShoppingCart />

                            </div>


                            <h2>

                                Produto

                                <br />

                                <em>
                                    adicionado.
                                </em>

                            </h2>


                            <p>

                                O item foi colocado
                                no seu carrinho com
                                sucesso.

                            </p>


                            <div
                                className={
                                    style.botoesModal
                                }
                            >

                                <button
                                    type="button"
                                    onClick={() =>
                                        setModalCarrinho(
                                            false
                                        )
                                    }
                                >

                                    Continuar comprando

                                </button>


                                <button
                                    type="button"
                                    onClick={() =>
                                        navigate(
                                            "/cliente/carrinho"
                                        )
                                    }
                                >

                                    Ir para carrinho

                                    <FaArrowRight />

                                </button>

                            </div>

                        </div>

                    </div>

                )
            }

        </>

    );

}
