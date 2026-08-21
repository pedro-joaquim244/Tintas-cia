import { useEffect, useMemo, useState } from "react";

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
    FaGem
} from "react-icons/fa";

import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { useAuth } from "../contexts/authContext";

export default function Produtos() {
    const { usuario } = useAuth();
    const navigate = useNavigate();

    // =====================================================
    // ESTADOS
    // =====================================================

    const [produtos, setProdutos] = useState([]);
    const [busca, setBusca] = useState("");
    const [categoriaSelecionada, setCategoriaSelecionada] =
        useState("Todos");
    const [modalCarrinho, setModalCarrinho] = useState(false);
    const [slideAtual, setSlideAtual] = useState(0);

    const [categoriasAbertas, setCategoriasAbertas] = useState({
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
    // BANNERS
    // =====================================================

    const banners = [
        {
            imagem: "/img/banner.png",
            titulo: "Transforme",
            destaque: "seu mundo",
            descricao:
                "As melhores tintas e ferramentas para dar vida às suas ideias."
        },
        {
            imagem: "/img/banner.png",
            titulo: "Dê vida",
            destaque: "às suas ideias",
            descricao:
                "Encontre tudo o que precisa para transformar seus ambientes."
        },
        {
            imagem: "/img/banner.png",
            titulo: "Sua casa",
            destaque: "com novas cores",
            descricao:
                "Qualidade e variedade para deixar cada espaço do seu jeito."
        }
    ];

    // =====================================================
    // BUSCAR PRODUTOS DO BANCO
    // =====================================================

    useEffect(() => {
        async function carregarProdutos() {
            try {
                const resposta = await api.get("/itens");

                console.log(
                    "RESPOSTA DOS PRODUTOS:",
                    resposta.data
                );

                const dados = resposta.data;

                let listaProdutos = [];

                if (Array.isArray(dados)) {
                    listaProdutos = dados;
                } else if (Array.isArray(dados?.itens)) {
                    listaProdutos = dados.itens;
                } else if (Array.isArray(dados?.produtos)) {
                    listaProdutos = dados.produtos;
                } else if (Array.isArray(dados?.data)) {
                    listaProdutos = dados.data;
                }

                console.log(
                    "PRODUTOS ENCONTRADOS:",
                    listaProdutos
                );

                // =================================================
                // MOSTRAR SOMENTE PRODUTOS ATIVOS
                // =================================================

                const produtosAtivos = listaProdutos.filter((produto) => {
                    const status = String(produto?.status || "")
                        .trim()
                        .toLowerCase();

                    return status === "ativo";
                });

                console.log(
                    "PRODUTOS ATIVOS:",
                    produtosAtivos
                );

                setProdutos(produtosAtivos);

            } catch (error) {
                console.error(
                    "ERRO AO BUSCAR PRODUTOS:",
                    error.response?.data || error
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
        const intervalo = setInterval(() => {
            setSlideAtual((atual) =>
                atual === banners.length - 1
                    ? 0
                    : atual + 1
            );
        }, 5000);

        return () => clearInterval(intervalo);
    }, [banners.length]);

    // =====================================================
    // CARROSSEL
    // =====================================================

    function proximoSlide() {
        setSlideAtual((atual) =>
            atual === banners.length - 1
                ? 0
                : atual + 1
        );
    }

    function slideAnterior() {
        setSlideAtual((atual) =>
            atual === 0
                ? banners.length - 1
                : atual - 1
        );
    }

    // =====================================================
    // ABRIR / FECHAR CATEGORIA
    // =====================================================

    function abrirCategoria(nome) {
        setCategoriasAbertas((anterior) => ({
            ...anterior,
            [nome]: !anterior[nome]
        }));
    }

    // =====================================================
    // TEXTO DO PRODUTO
    // =====================================================

    function textoProduto(produto) {
        return `
            ${produto?.nome || ""}
            ${produto?.descricao || ""}
            ${produto?.categoria || ""}
            ${produto?.categoria_nome || ""}
            ${produto?.categoriaNome || ""}
            ${produto?.tipo || ""}
            ${produto?.marca || ""}
        `
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase();
    }

    // =====================================================
    // DESCOBRIR CATEGORIA
    // =====================================================

    function descobrirCategoria(produto) {
        const texto = textoProduto(produto);

        // =================================================
        // SE O BANCO JÁ POSSUI UMA CATEGORIA,
        // TENTA USAR PRIMEIRO
        // =================================================

        const categoriaBanco =
            produto?.categoria ||
            produto?.categoria_nome ||
            produto?.categoriaNome ||
            produto?.tipo;

        if (categoriaBanco) {
            const categoriaNormalizada =
                String(categoriaBanco)
                    .normalize("NFD")
                    .replace(/[\u0300-\u036f]/g, "")
                    .toLowerCase()
                    .trim();

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

            if (categoriasBanco[categoriaNormalizada]) {
                return categoriasBanco[categoriaNormalizada];
            }
        }

        // =================================================
        // TINTAS PARA ÁREA EXTERNA
        // =================================================

        if (
            texto.includes("area externa") ||
            texto.includes("externa") ||
            texto.includes("exterior") ||
            texto.includes("fachada")
        ) {
            return "Tintas para Área Externa";
        }

        // =================================================
        // TINTAS PARA MADEIRA
        // =================================================

        if (
            texto.includes("madeira") ||
            texto.includes("verniz") ||
            texto.includes("stain")
        ) {
            return "Tintas para Madeira";
        }

        // =================================================
        // TINTAS PARA METAL
        // =================================================

        if (
            texto.includes("metal") ||
            texto.includes("ferro") ||
            texto.includes("esmalte")
        ) {
            return "Tintas para Metal";
        }

        // =================================================
        // EFEITOS E ACABAMENTOS
        // =================================================

        if (
            texto.includes("efeito") ||
            texto.includes("textura") ||
            texto.includes("acabamento") ||
            texto.includes("brilho") ||
            texto.includes("fosco")
        ) {
            return "Efeitos e Acabamentos";
        }

        // =================================================
        // PROTEÇÃO E SEGURANÇA
        // =================================================

        if (
            texto.includes("protecao") ||
            texto.includes("impermeabilizante") ||
            texto.includes("antimofo") ||
            texto.includes("anti mofo") ||
            texto.includes("seguranca")
        ) {
            return "Proteção e Segurança";
        }

        // =================================================
        // PINCÉIS E ACESSÓRIOS
        // =================================================

        if (
            texto.includes("pincel") ||
            texto.includes("pinceis") ||
            texto.includes("rolo") ||
            texto.includes("fita") ||
            texto.includes("acessorio") ||
            texto.includes("bandeja") ||
            texto.includes("trincha")
        ) {
            return "Pincéis e Acessórios";
        }

        // =================================================
        // FERRAMENTAS
        // =================================================

        if (
            texto.includes("ferramenta") ||
            texto.includes("espatula") ||
            texto.includes("lixa") ||
            texto.includes("desempenadeira") ||
            texto.includes("trinca") ||
            texto.includes("cacamba") ||
            texto.includes("martelo") ||
            texto.includes("chave") ||
            texto.includes("serrote")
        ) {
            return "Ferramentas";
        }

        // =================================================
        // PREPARAÇÃO DE SUPERFÍCIE
        // =================================================

        if (
            texto.includes("massa") ||
            texto.includes("selador") ||
            texto.includes("fundo") ||
            texto.includes("cal") ||
            texto.includes("removedor") ||
            texto.includes("preparacao")
        ) {
            return "Preparação de Superfície";
        }

        // =================================================
        // COMPLEMENTOS
        // =================================================

        if (
            texto.includes("complemento") ||
            texto.includes("diluente") ||
            texto.includes("thinner") ||
            texto.includes("solvente") ||
            texto.includes("aguarras") ||
            texto.includes("cola")
        ) {
            return "Complementos";
        }

        // =================================================
        // TINTAS PARA PAREDE
        // =================================================

        if (
            texto.includes("tinta") ||
            texto.includes("latex") ||
            texto.includes("pva") ||
            texto.includes("acrilica")
        ) {
            return "Tintas para Parede";
        }

        // =================================================
        // OUTROS
        // =================================================

        return "Outros";
    }

    // =====================================================
    // CATEGORIAS
    // =====================================================

    const categorias = useMemo(() => {
        const nomesCategorias = [
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

        return nomesCategorias.map((nome) => {
            const produtosCategoria =
                produtos.filter(
                    (produto) =>
                        descobrirCategoria(produto) === nome
                );

            return {
                nome,
                produtos: produtosCategoria
            };
        });
    }, [produtos]);

    // =====================================================
    // FILTRO DOS PRODUTOS
    // =====================================================

    const produtosFiltrados = useMemo(() => {
        const pesquisa =
            busca
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .toLowerCase()
                .trim();

        return produtos.filter((produto) => {

            // =================================================
            // SEGURANÇA:
            // NUNCA MOSTRAR INATIVOS OU ESGOTADOS
            // =================================================

            const status = String(produto?.status || "")
                .trim()
                .toLowerCase();

            if (status !== "ativo") {
                return false;
            }

            const texto = textoProduto(produto);

            const correspondePesquisa =
                texto.includes(pesquisa);

            const correspondeCategoria =
                categoriaSelecionada === "Todos" ||
                descobrirCategoria(produto) ===
                    categoriaSelecionada;

            return (
                correspondePesquisa &&
                correspondeCategoria
            );
        });
    }, [
        produtos,
        busca,
        categoriaSelecionada
    ]);

    // =====================================================
    // PRODUTOS DE UMA CATEGORIA
    // =====================================================

    function produtosDaCategoria(nomeCategoria) {
        return produtosFiltrados.filter(
            (produto) =>
                descobrirCategoria(produto) ===
                nomeCategoria
        );
    }

    // =====================================================
    // IMAGEM DO PRODUTO
    // =====================================================

    function imagemProduto(produto) {
        if (!produto?.foto) {
            return "/img/tinta.png";
        }

        if (
            produto.foto.startsWith("http://") ||
            produto.foto.startsWith("https://")
        ) {
            return produto.foto;
        }

        return `http://localhost:3333/${produto.foto}`;
    }

    // =====================================================
    // ADICIONAR AO CARRINHO
    // =====================================================

    async function adicionarCarrinho(produto) {
        try {
            if (!usuario) {
                alert(
                    "Faça login para adicionar produtos"
                );

                navigate("/login");
                return;
            }

            // Segurança adicional:
            // impede adicionar produto que não esteja ativo
            const status = String(produto?.status || "")
                .trim()
                .toLowerCase();

            if (status !== "ativo") {
                alert(
                    "Este produto não está disponível."
                );

                return;
            }

            await api.post(
                "/carrinho",
                {
                    usuario_id: usuario.id,
                    produto_id: produto.id,
                    quantidade: 1
                }
            );

            setModalCarrinho(true);

        } catch (error) {
            console.error(
                "Erro ao adicionar:",
                error.response?.data || error
            );

            alert(
                "Erro ao adicionar produto"
            );
        }
    }

    // =====================================================
    // RENDER
    // =====================================================

    return (
        <>
            <Cabecalho />

            <main className={style.page}>

                {/* =================================================
                    CARROSSEL
                ================================================= */}

                <section className={style.banner}>

                    <button
                        className={`${style.setaBanner} ${style.esquerda}`}
                        onClick={slideAnterior}
                        aria-label="Banner anterior"
                    >
                        <FaChevronLeft />
                    </button>

                    <div className={style.bannerConteudo}>

                        <div className={style.bannerTexto}>

                            <h1>
                                {banners[slideAtual].titulo}
                                <br />

                                <strong>
                                    {banners[slideAtual].destaque}
                                </strong>
                            </h1>

                            <p>
                                {banners[slideAtual].descricao}
                            </p>

                            <button
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
                                Ver produtos
                            </button>

                        </div>

                        <img
                            src={
                                banners[
                                    slideAtual
                                ].imagem
                            }
                            alt="Produtos"
                            className={
                                style.bannerImagem
                            }
                        />

                    </div>

                    <button
                        className={`${style.setaBanner} ${style.direita}`}
                        onClick={proximoSlide}
                        aria-label="Próximo banner"
                    >
                        <FaChevronRight />
                    </button>

                    <div className={style.indicadores}>

                        {banners.map(
                            (_, index) => (
                                <button
                                    key={index}
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
                    PESQUISA E CATEGORIAS
                ================================================= */}

                <section
                    className={style.filtros}
                >

                    <div
                        className={style.pesquisa}
                    >
                        <FaSearch />

                        <input
                            type="text"
                            placeholder="Buscar por produtos, marcas ou categorias..."
                            value={busca}
                            onChange={(e) =>
                                setBusca(
                                    e.target.value
                                )
                            }
                        />
                    </div>

                    <div
                        className={
                            style.categoriasMenu
                        }
                    >

                        <button
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
                            (categoria) => (
                                <button
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
                    LISTA DE PRODUTOS
                ================================================= */}

                <section
                    className={style.lista}
                    id="produtos"
                >

                    {categorias.map(
                        (categoria) => {

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

                            return (
                                <section
                                    className={
                                        style.categoria
                                    }
                                    key={
                                        categoria.nome
                                    }
                                >

                                    {/* TÍTULO DA CATEGORIA */}

                                    <div
                                        className={
                                            style.tituloCategoria
                                        }
                                    >

                                        <h2>
                                            {
                                                categoria.nome
                                            }
                                        </h2>

                                        <button
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

                                    {/* PRODUTOS */}

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
                                                            {
                                                                busca
                                                                    ? "Nenhum produto encontrado."
                                                                    : "Nenhum produto cadastrado nesta categoria."
                                                            }
                                                        </div>

                                                    ) : (

                                                        produtosCategoria.map(
                                                            (
                                                                produto
                                                            ) => (

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

                                                                    {/* INFORMAÇÕES */}

                                                                    <div
                                                                        className={
                                                                            style.produtoInfo
                                                                        }
                                                                    >

                                                                        <h3>
                                                                            {
                                                                                produto.nome ||
                                                                                "Produto sem nome"
                                                                            }
                                                                        </h3>

                                                                        <div
                                                                            className={
                                                                                style.produtoRodape
                                                                            }
                                                                        >

                                                                            <strong>
                                                                                R${" "}
                                                                                {
                                                                                    Number(
                                                                                        produto.preco ||
                                                                                        0
                                                                                    )
                                                                                        .toFixed(
                                                                                            2
                                                                                        )
                                                                                        .replace(
                                                                                            ".",
                                                                                            ","
                                                                                        )
                                                                                }
                                                                            </strong>

                                                                            <button
                                                                                className={
                                                                                    style.carrinho
                                                                                }
                                                                                onClick={() =>
                                                                                    adicionarCarrinho(
                                                                                        produto
                                                                                    )
                                                                                }
                                                                                aria-label="Adicionar ao carrinho"
                                                                            >
                                                                                <FaShoppingCart />
                                                                            </button>

                                                                        </div>

                                                                    </div>

                                                                </article>

                                                            )
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
                        NENHUM PRODUTO ATIVO
                    ================================================= */}

                    {produtos.length === 0 && (

                        <div
                            className={
                                style.semProdutos
                            }
                        >
                            Nenhum produto disponível no momento.
                        </div>

                    )}

                </section>

            </main>

            {/* =================================================
                BENEFÍCIOS
            ================================================= */}

            <section
                className={style.beneficios}
            >

                <div
                    className={style.beneficio}
                >
                    <FaShieldAlt />

                    <div>
                        <strong>
                            Pagamento seguro
                        </strong>

                        <span>
                            Ambiente 100% seguro
                        </span>
                    </div>
                </div>

                <div
                    className={style.beneficio}
                >
                    <FaCreditCard />

                    <div>
                        <strong>
                            Parcela em até 12x
                        </strong>

                        <span>
                            No cartão de crédito
                        </span>
                    </div>
                </div>

                <div
                    className={style.beneficio}
                >
                    <FaGem />

                    <div>
                        <strong>
                            5% de desconto no PIX
                        </strong>

                        <span>
                            Aproveite!
                        </span>
                    </div>
                </div>

                <div
                    className={style.beneficio}
                >
                    <FaShieldAlt />

                    <div>
                        <strong>
                            Compra garantida
                        </strong>

                        <span>
                            Receba ou devolvemos seu dinheiro!
                        </span>
                    </div>
                </div>

            </section>

            {/* =================================================
                MODAL DO CARRINHO
            ================================================= */}

            {modalCarrinho && (

                <div
                    className={style.overlay}
                    onClick={() =>
                        setModalCarrinho(false)
                    }
                >

                    <div
                        className={
                            style.modalCarrinho
                        }
                        onClick={(e) =>
                            e.stopPropagation()
                        }
                    >

                        <div
                            className={
                                style.icone
                            }
                        >
                            <FaShoppingCart />
                        </div>

                        <h2>
                            Produto adicionado!
                        </h2>

                        <p>
                            O produto foi colocado
                            no seu carrinho.
                        </p>

                        <div
                            className={
                                style.botoesModal
                            }
                        >

                            <button
                                onClick={() =>
                                    setModalCarrinho(
                                        false
                                    )
                                }
                            >
                                Continuar comprando
                            </button>

                            <button
                                onClick={() =>
                                    navigate(
                                        "/cliente/carrinho"
                                    )
                                }
                            >
                                Ir para carrinho
                            </button>

                        </div>

                    </div>

                </div>

            )}

        </>
    );
}