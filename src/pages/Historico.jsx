import {
    useEffect,
    useMemo,
    useState
} from "react";

import {
    FiActivity,
    FiArrowUpRight,
    FiBox,
    FiClock,
    FiDollarSign,
    FiEye,
    FiFileText,
    FiRefreshCw,
    FiShoppingBag,
    FiTag,
    FiTrendingUp,
    FiUsers
} from "react-icons/fi";

import Cabecalho from "../components/Cabeçalho-ADM/Cabecalho.jsx";

import { api } from "../services/api.js";

import styles from "../styles/Historico.module.css";


const PERIODOS = [
    {
        valor: "7",
        label: "7 dias"
    },
    {
        valor: "30",
        label: "30 dias"
    },
    {
        valor: "90",
        label: "90 dias"
    },
    {
        valor: "365",
        label: "1 ano"
    },
    {
        valor: "todos",
        label: "Todo período"
    }
];


const TIPOS_ATIVIDADE = {
    pedido: {
        label: "Pedido",
        icone: FiShoppingBag
    },

    produto: {
        label: "Produto",
        icone: FiBox
    },

    estoque: {
        label: "Estoque",
        icone: FiBox
    },

    cupom: {
        label: "Cupom",
        icone: FiTag
    },

    usuario: {
        label: "Usuário",
        icone: FiUsers
    },

    orcamento: {
        label: "Orçamento",
        icone: FiFileText
    },

    fidelidade: {
        label: "Fidelidade",
        icone: FiTrendingUp
    },

    feedback: {
        label: "Feedback",
        icone: FiActivity
    },

    sistema: {
        label: "Sistema",
        icone: FiActivity
    }
};


export default function Historico() {

    // =====================================================
    // ESTADOS
    // =====================================================

    const [
        periodo,
        setPeriodo
    ] = useState("30");

    const [
        dados,
        setDados
    ] = useState(null);

    const [
        carregando,
        setCarregando
    ] = useState(true);

    const [
        atualizando,
        setAtualizando
    ] = useState(false);

    const [
        erro,
        setErro
    ] = useState("");


    // =====================================================
    // CARREGAR PAINEL
    // =====================================================

    async function carregarHistorico(
        mostrarLoading = false
    ) {

        try {

            if (
                mostrarLoading ||
                !dados
            ) {

                setCarregando(true);

            } else {

                setAtualizando(true);

            }


            setErro("");


            const resposta =
                await api.get(
                    "/historico/painel",
                    {
                        params: {
                            periodo
                        }
                    }
                );


            setDados(
                resposta.data ||
                {}
            );

        } catch (error) {

            console.error(
                "Erro ao carregar histórico:",
                error.response?.data ||
                error
            );


            setErro(
                error.response?.data?.erro ||
                error.response?.data?.message ||
                "Não foi possível carregar o histórico."
            );

        } finally {

            setCarregando(false);

            setAtualizando(false);

        }

    }


    // =====================================================
    // CARREGAR AO ALTERAR PERÍODO
    // =====================================================

    useEffect(() => {

        carregarHistorico(true);

    }, [periodo]);


    // =====================================================
    // FORMATAÇÕES
    // =====================================================

    function formatarMoeda(
        valor
    ) {

        return Number(
            valor ||
            0
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


    function formatarNumero(
        valor
    ) {

        return Number(
            valor ||
            0
        ).toLocaleString(
            "pt-BR"
        );

    }


    function formatarPercentual(
        valor
    ) {

        return `${Number(
            valor ||
            0
        ).toLocaleString(
            "pt-BR",
            {
                minimumFractionDigits: 1,
                maximumFractionDigits: 1
            }
        )}%`;

    }


    function formatarDataHora(
        data
    ) {

        if (!data) {
            return "-";
        }


        const valor =
            new Date(
                data
            );


        if (
            Number.isNaN(
                valor.getTime()
            )
        ) {

            return "-";

        }


        return valor.toLocaleString(
            "pt-BR",
            {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            }
        );

    }


    function obterImagemProduto(
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


        const caminho =
            String(
                produto.foto
            )
                .replace(
                    /\\/g,
                    "/"
                )
                .replace(
                    /^\/+/,
                    ""
                );


        return `http://localhost:3333/${caminho}`;

    }


    // =====================================================
    // DADOS
    // =====================================================

    const resumo =
        dados?.resumo ||
        {};

    const orcamentos =
        dados?.orcamentos ||
        {};

    const maisVendidos =
        Array.isArray(
            dados?.mais_vendidos
        )
            ? dados.mais_vendidos
            : [];

    const maisVisualizados =
        Array.isArray(
            dados?.mais_visualizados
        )
            ? dados.mais_visualizados
            : [];

    const atividades =
        Array.isArray(
            dados?.atividades
        )
            ? dados.atividades
            : [];


    // =====================================================
    // MAIORES VALORES PARA AS BARRAS
    // =====================================================

    const maiorVenda =
        useMemo(
            () =>
                Math.max(
                    ...maisVendidos.map(
                        produto =>
                            Number(
                                produto.unidades_vendidas ||
                                0
                            )
                    ),
                    1
                ),
            [maisVendidos]
        );


    const maiorVisualizacao =
        useMemo(
            () =>
                Math.max(
                    ...maisVisualizados.map(
                        produto =>
                            Number(
                                produto.visualizacoes ||
                                0
                            )
                    ),
                    1
                ),
            [maisVisualizados]
        );


    // =====================================================
    // CARDS
    // =====================================================

    const cardsResumo = [

        {
            titulo:
                "Faturamento",

            valor:
                formatarMoeda(
                    resumo.faturamento
                ),

            detalhe:
                `${formatarNumero(
                    resumo.pedidos
                )} pedidos no período`,

            icone:
                FiDollarSign
        },

        {
            titulo:
                "Pedidos",

            valor:
                formatarNumero(
                    resumo.pedidos
                ),

            detalhe:
                `Ticket médio ${formatarMoeda(
                    resumo.ticket_medio
                )}`,

            icone:
                FiShoppingBag
        },

        {
            titulo:
                "Orçamentos",

            valor:
                formatarNumero(
                    orcamentos.total
                ),

            detalhe:
                `${formatarNumero(
                    orcamentos.convertidos
                )} convertidos em pedido`,

            icone:
                FiFileText
        },

        {
            titulo:
                "Visualizações",

            valor:
                formatarNumero(
                    resumo.visualizacoes
                ),

            detalhe:
                `${formatarNumero(
                    resumo.produtos_visualizados
                )} produtos visualizados`,

            icone:
                FiEye
        },

        {
            titulo:
                "Clientes",

            valor:
                formatarNumero(
                    resumo.clientes
                ),

            detalhe:
                "Clientes cadastrados",

            icone:
                FiUsers
        },

        {
            titulo:
                "Conversão de orçamento",

            valor:
                formatarPercentual(
                    orcamentos.taxa_conversao
                ),

            detalhe:
                `${formatarNumero(
                    orcamentos.abertos
                )} ainda em aberto`,

            icone:
                FiTrendingUp
        }

    ];


    // =====================================================
    // LOADING INICIAL
    // =====================================================

    if (
        carregando &&
        !dados
    ) {

        return (

            <div
                className={
                    styles.container
                }
            >

                <Cabecalho />


                <main
                    className={
                        styles.content
                    }
                >

                    <div
                        className={
                            styles.loading
                        }
                    >

                        <div
                            className={
                                styles.loadingIcone
                            }
                        >
                            <FiActivity />
                        </div>


                        <span>
                            Histórico & desempenho
                        </span>


                        <h1>
                            Preparando os dados
                            <em>
                                {" "}do sistema.
                            </em>
                        </h1>


                        <div
                            className={
                                styles.spinner
                            }
                        />

                    </div>

                </main>

            </div>

        );

    }


    // =====================================================
    // RENDER
    // =====================================================

    return (

        <div
            className={
                styles.container
            }
        >

            <Cabecalho />


            <main
                className={
                    styles.content
                }
            >

                {/* =================================================
                    HERO
                ================================================= */}

                <section
                    className={
                        styles.hero
                    }
                >

                    <div
                        className={
                            styles.heroTexto
                        }
                    >

                        <span
                            className={
                                styles.eyebrow
                            }
                        >
                            CENTRAL DE ANÁLISE
                        </span>


                        <h1>
                            Histórico & desempenho
                        </h1>


                        <p>
                            Acompanhe vendas, produtos em destaque,
                            comportamento dos clientes, orçamentos
                            e as principais movimentações da Pixel Color.
                        </p>

                    </div>


                    <div
                        className={
                            styles.heroAcoes
                        }
                    >

                        <div
                            className={
                                styles.periodos
                            }
                        >

                            {PERIODOS.map(
                                item => (

                                    <button
                                        type="button"
                                        key={
                                            item.valor
                                        }
                                        className={
                                            periodo ===
                                            item.valor
                                                ? styles.periodoAtivo
                                                : styles.periodoBotao
                                        }
                                        onClick={() =>
                                            setPeriodo(
                                                item.valor
                                            )
                                        }
                                    >
                                        {
                                            item.label
                                        }
                                    </button>

                                )
                            )}

                        </div>


                        <button
                            type="button"
                            className={
                                styles.atualizarBtn
                            }
                            onClick={() =>
                                carregarHistorico(
                                    false
                                )
                            }
                            disabled={
                                atualizando ||
                                carregando
                            }
                        >

                            <FiRefreshCw
                                className={
                                    atualizando
                                        ? styles.girando
                                        : ""
                                }
                            />

                            {
                                atualizando
                                    ? "Atualizando..."
                                    : "Atualizar"
                            }

                        </button>

                    </div>

                </section>


                {/* =================================================
                    ERRO
                ================================================= */}

                {erro && (

                    <div
                        className={
                            styles.erro
                        }
                    >

                        <div>
                            <FiActivity />

                            <span>
                                {
                                    erro
                                }
                            </span>
                        </div>


                        <button
                            type="button"
                            onClick={() =>
                                carregarHistorico(
                                    true
                                )
                            }
                        >
                            Tentar novamente
                        </button>

                    </div>

                )}


                {/* =================================================
                    CARDS
                ================================================= */}

                <section
                    className={
                        styles.cards
                    }
                >

                    {cardsResumo.map(
                        (
                            card,
                            index
                        ) => {

                            const Icone =
                                card.icone;


                            return (

                                <article
                                    className={
                                        styles.card
                                    }
                                    key={
                                        card.titulo
                                    }
                                >

                                    <div
                                        className={
                                            styles.cardTopo
                                        }
                                    >

                                        <span>
                                            {String(
                                                index + 1
                                            ).padStart(
                                                2,
                                                "0"
                                            )}
                                        </span>

                                        <Icone />

                                    </div>


                                    <strong>
                                        {
                                            card.valor
                                        }
                                    </strong>


                                    <div
                                        className={
                                            styles.cardRodape
                                        }
                                    >

                                        <h3>
                                            {
                                                card.titulo
                                            }
                                        </h3>

                                        <p>
                                            {
                                                card.detalhe
                                            }
                                        </p>

                                    </div>

                                </article>

                            );

                        }
                    )}

                </section>


                {/* =================================================
                    DESTAQUES
                ================================================= */}

                <section
                    className={
                        styles.destaquesGrid
                    }
                >

                    {/* =============================================
                        MAIS VENDIDOS
                    ============================================= */}

                    <article
                        className={
                            styles.painel
                        }
                    >

                        <div
                            className={
                                styles.painelCabecalho
                            }
                        >

                            <div>

                                <span>
                                    VENDAS
                                </span>

                                <h2>
                                    Produtos
                                    <em>
                                        {" "}mais vendidos.
                                    </em>
                                </h2>

                            </div>


                            <div
                                className={
                                    styles.painelIcone
                                }
                            >
                                <FiTrendingUp />
                            </div>

                        </div>


                        <div
                            className={
                                styles.ranking
                            }
                        >

                            {maisVendidos.length ===
                            0 ? (

                                <div
                                    className={
                                        styles.vazio
                                    }
                                >
                                    Nenhuma venda encontrada
                                    neste período.
                                </div>

                            ) : (

                                maisVendidos.map(
                                    (
                                        produto,
                                        index
                                    ) => {

                                        const percentual =
                                            Math.max(
                                                (
                                                    Number(
                                                        produto.unidades_vendidas ||
                                                        0
                                                    ) /
                                                    maiorVenda
                                                ) *
                                                100,
                                                4
                                            );


                                        return (

                                            <div
                                                className={
                                                    styles.rankingItem
                                                }
                                                key={
                                                    produto.id
                                                }
                                            >

                                                <span
                                                    className={
                                                        styles.rankingNumero
                                                    }
                                                >
                                                    {
                                                        String(
                                                            index +
                                                            1
                                                        ).padStart(
                                                            2,
                                                            "0"
                                                        )
                                                    }
                                                </span>


                                                <div
                                                    className={
                                                        styles.produtoImagem
                                                    }
                                                >

                                                    <img
                                                        src={
                                                            obterImagemProduto(
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


                                                <div
                                                    className={
                                                        styles.rankingConteudo
                                                    }
                                                >

                                                    <div
                                                        className={
                                                            styles.rankingTexto
                                                        }
                                                    >

                                                        <div>

                                                            <span>
                                                                {
                                                                    produto.marca ||
                                                                    "PIXEL COLOR"
                                                                }
                                                            </span>

                                                            <strong>
                                                                {
                                                                    produto.nome ||
                                                                    "Produto"
                                                                }
                                                            </strong>

                                                            <small>
                                                                {
                                                                    produto.cor ||
                                                                    "Cor não informada"
                                                                }
                                                            </small>

                                                        </div>


                                                        <div
                                                            className={
                                                                styles.rankingValor
                                                            }
                                                        >

                                                            <strong>
                                                                {
                                                                    formatarNumero(
                                                                        produto.unidades_vendidas
                                                                    )
                                                                }
                                                            </strong>

                                                            <span>
                                                                unidades
                                                            </span>

                                                        </div>

                                                    </div>


                                                    <div
                                                        className={
                                                            styles.barra
                                                        }
                                                    >

                                                        <span
                                                            style={{
                                                                width:
                                                                    `${percentual}%`
                                                            }}
                                                        />

                                                    </div>


                                                    <div
                                                        className={
                                                            styles.rankingMeta
                                                        }
                                                    >

                                                        <span>
                                                            Faturamento
                                                        </span>

                                                        <strong>
                                                            {
                                                                formatarMoeda(
                                                                    produto.faturamento
                                                                )
                                                            }
                                                        </strong>

                                                    </div>

                                                </div>

                                            </div>

                                        );

                                    }
                                )

                            )}

                        </div>

                    </article>


                    {/* =============================================
                        MAIS VISUALIZADOS
                    ============================================= */}

                    <article
                        className={
                            styles.painel
                        }
                    >

                        <div
                            className={
                                styles.painelCabecalho
                            }
                        >

                            <div>

                                <span>
                                    INTERESSE
                                </span>

                                <h2>
                                    Produtos
                                    <em>
                                        {" "}mais visualizados.
                                    </em>
                                </h2>

                            </div>


                            <div
                                className={
                                    styles.painelIcone
                                }
                            >
                                <FiEye />
                            </div>

                        </div>


                        <div
                            className={
                                styles.ranking
                            }
                        >

                            {maisVisualizados.length ===
                            0 ? (

                                <div
                                    className={
                                        styles.vazio
                                    }
                                >
                                    Ainda não há visualizações
                                    registradas neste período.
                                </div>

                            ) : (

                                maisVisualizados.map(
                                    (
                                        produto,
                                        index
                                    ) => {

                                        const percentual =
                                            Math.max(
                                                (
                                                    Number(
                                                        produto.visualizacoes ||
                                                        0
                                                    ) /
                                                    maiorVisualizacao
                                                ) *
                                                100,
                                                4
                                            );


                                        return (

                                            <div
                                                className={
                                                    styles.rankingItem
                                                }
                                                key={
                                                    produto.id
                                                }
                                            >

                                                <span
                                                    className={
                                                        styles.rankingNumero
                                                    }
                                                >
                                                    {
                                                        String(
                                                            index +
                                                            1
                                                        ).padStart(
                                                            2,
                                                            "0"
                                                        )
                                                    }
                                                </span>


                                                <div
                                                    className={
                                                        styles.produtoImagem
                                                    }
                                                >

                                                    <img
                                                        src={
                                                            obterImagemProduto(
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


                                                <div
                                                    className={
                                                        styles.rankingConteudo
                                                    }
                                                >

                                                    <div
                                                        className={
                                                            styles.rankingTexto
                                                        }
                                                    >

                                                        <div>

                                                            <span>
                                                                {
                                                                    produto.marca ||
                                                                    "PIXEL COLOR"
                                                                }
                                                            </span>

                                                            <strong>
                                                                {
                                                                    produto.nome ||
                                                                    "Produto"
                                                                }
                                                            </strong>

                                                            <small>
                                                                {
                                                                    produto.cor ||
                                                                    "Cor não informada"
                                                                }
                                                            </small>

                                                        </div>


                                                        <div
                                                            className={
                                                                styles.rankingValor
                                                            }
                                                        >

                                                            <strong>
                                                                {
                                                                    formatarNumero(
                                                                        produto.visualizacoes
                                                                    )
                                                                }
                                                            </strong>

                                                            <span>
                                                                visualizações
                                                            </span>

                                                        </div>

                                                    </div>


                                                    <div
                                                        className={
                                                            styles.barra
                                                        }
                                                    >

                                                        <span
                                                            style={{
                                                                width:
                                                                    `${percentual}%`
                                                            }}
                                                        />

                                                    </div>


                                                    <div
                                                        className={
                                                            styles.rankingMeta
                                                        }
                                                    >

                                                        <span>
                                                            Usuários únicos
                                                        </span>

                                                        <strong>
                                                            {
                                                                formatarNumero(
                                                                    produto.usuarios_unicos
                                                                )
                                                            }
                                                        </strong>

                                                    </div>

                                                </div>

                                            </div>

                                        );

                                    }
                                )

                            )}

                        </div>

                    </article>

                </section>


                {/* =================================================
                    ORÇAMENTOS + ATIVIDADE
                ================================================= */}

                <section
                    className={
                        styles.inferiorGrid
                    }
                >

                    {/* =============================================
                        ORÇAMENTOS
                    ============================================= */}

                    <article
                        className={
                            styles.orcamentoPainel
                        }
                    >

                        <div
                            className={
                                styles.orcamentoTopo
                            }
                        >

                            <span>
                                ORÇAMENTOS
                            </span>

                            <FiFileText />

                        </div>


                        <h2>
                            Conversão
                            <em>
                                {" "}comercial.
                            </em>
                        </h2>


                        <p>
                            Veja quantos orçamentos avançaram
                            para uma compra e quais ainda aguardam
                            uma decisão do cliente.
                        </p>


                        <div
                            className={
                                styles.conversao
                            }
                        >

                            <strong>
                                {
                                    formatarPercentual(
                                        orcamentos.taxa_conversao
                                    )
                                }
                            </strong>

                            <span>
                                taxa de conversão
                            </span>

                        </div>


                        <div
                            className={
                                styles.orcamentoStats
                            }
                        >

                            <div>
                                <span>
                                    Total
                                </span>

                                <strong>
                                    {
                                        formatarNumero(
                                            orcamentos.total
                                        )
                                    }
                                </strong>
                            </div>


                            <div>
                                <span>
                                    Abertos
                                </span>

                                <strong>
                                    {
                                        formatarNumero(
                                            orcamentos.abertos
                                        )
                                    }
                                </strong>
                            </div>


                            <div>
                                <span>
                                    Convertidos
                                </span>

                                <strong>
                                    {
                                        formatarNumero(
                                            orcamentos.convertidos
                                        )
                                    }
                                </strong>
                            </div>


                            <div>
                                <span>
                                    Expirados
                                </span>

                                <strong>
                                    {
                                        formatarNumero(
                                            orcamentos.expirados
                                        )
                                    }
                                </strong>
                            </div>

                        </div>


                        <div
                            className={
                                styles.orcamentoValor
                            }
                        >

                            <span>
                                Valor total orçado
                            </span>

                            <strong>
                                {
                                    formatarMoeda(
                                        orcamentos.valor_total
                                    )
                                }
                            </strong>

                        </div>

                    </article>


                    {/* =============================================
                        ATIVIDADES
                    ============================================= */}

                    <article
                        className={
                            styles.atividadePainel
                        }
                    >

                        <div
                            className={
                                styles.atividadeCabecalho
                            }
                        >

                            <div>

                                <span>
                                    MOVIMENTAÇÃO
                                </span>

                                <h2>
                                    Atividade
                                    <em>
                                        {" "}recente.
                                    </em>
                                </h2>

                            </div>


                            <FiClock />

                        </div>


                        <div
                            className={
                                styles.timeline
                            }
                        >

                            {atividades.length ===
                            0 ? (

                                <div
                                    className={
                                        styles.vazio
                                    }
                                >
                                    Nenhuma atividade registrada
                                    neste período.
                                </div>

                            ) : (

                                atividades.map(
                                    atividade => {

                                        const configuracao =
                                            TIPOS_ATIVIDADE[
                                                atividade.tipo
                                            ] ||
                                            TIPOS_ATIVIDADE.sistema;

                                        const Icone =
                                            configuracao.icone;


                                        return (

                                            <div
                                                className={
                                                    styles.timelineItem
                                                }
                                                key={
                                                    atividade.id
                                                }
                                            >

                                                <div
                                                    className={
                                                        styles.timelineIcone
                                                    }
                                                >
                                                    <Icone />
                                                </div>


                                                <div
                                                    className={
                                                        styles.timelineConteudo
                                                    }
                                                >

                                                    <div
                                                        className={
                                                            styles.timelineTopo
                                                        }
                                                    >

                                                        <span>
                                                            {
                                                                configuracao.label
                                                            }
                                                        </span>

                                                        <time>
                                                            {
                                                                formatarDataHora(
                                                                    atividade.criado_em
                                                                )
                                                            }
                                                        </time>

                                                    </div>


                                                    <strong>
                                                        {
                                                            atividade.titulo ||
                                                            atividade.acao ||
                                                            "Atividade do sistema"
                                                        }
                                                    </strong>


                                                    {atividade.descricao && (

                                                        <p>
                                                            {
                                                                atividade.descricao
                                                            }
                                                        </p>

                                                    )}


                                                    {(
                                                        atividade.valor_anterior !==
                                                            null &&
                                                        atividade.valor_anterior !==
                                                            undefined
                                                    ) &&
                                                    (
                                                        atividade.valor_novo !==
                                                            null &&
                                                        atividade.valor_novo !==
                                                            undefined
                                                    ) && (

                                                        <div
                                                            className={
                                                                styles.alteracao
                                                            }
                                                        >

                                                            <span>
                                                                {
                                                                    atividade.valor_anterior
                                                                }
                                                            </span>

                                                            <FiArrowUpRight />

                                                            <strong>
                                                                {
                                                                    atividade.valor_novo
                                                                }
                                                            </strong>

                                                        </div>

                                                    )}


                                                    <div
                                                        className={
                                                            styles.timelineRodape
                                                        }
                                                    >

                                                        <span>
                                                            {atividade.usuario_nome
                                                                ? `Por ${atividade.usuario_nome}`
                                                                : "Ação automática do sistema"
                                                            }
                                                        </span>


                                                        {atividade.referencia_id && (

                                                            <small>
                                                                Ref. #
                                                                {
                                                                    atividade.referencia_id
                                                                }
                                                            </small>

                                                        )}

                                                    </div>

                                                </div>

                                            </div>

                                        );

                                    }
                                )

                            )}

                        </div>

                    </article>

                </section>

            </main>

        </div>

    );

}
