import {
    useEffect,
    useMemo,
    useState
} from "react";

import {
    FiArrowLeft,
    FiArrowRight,
    FiMinus,
    FiPlus,
    FiShoppingBag,
    FiTrash2,
    FiTruck,
    FiShield,
    FiCreditCard,
    FiPackage,
    FiCheck,
    FiAlertCircle,
    FiFileText,
    FiDownload,
    FiX
} from "react-icons/fi";

import style from "../styles/carrinho.module.css";

import { api } from "../services/api";

import { useAuth } from "../contexts/authContext";

import { useNavigate } from "react-router-dom";

import Cabecalho from "../components/Cabeçalho-Users/index.jsx";

import { jsPDF } from "jspdf";

import logoPdf from "../assets/imagens/logodois.png";


export default function Carrinho() {

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
        carregando,
        setCarregando
    ] = useState(true);

    const [
        atualizandoId,
        setAtualizandoId
    ] = useState(null);

    const [
        removendoId,
        setRemovendoId
    ] = useState(null);


    // =====================================================
    // ORÇAMENTO
    // =====================================================

    const [
        gerandoOrcamento,
        setGerandoOrcamento
    ] = useState(false);

    const [
        orcamentoGerado,
        setOrcamentoGerado
    ] = useState(null);


    // =====================================================
    // BUSCAR CARRINHO
    // =====================================================

    async function carregarCarrinho() {

        if (!usuario?.id) {

            setProdutos([]);

            setCarregando(false);

            return;

        }


        try {

            setCarregando(true);


            const resposta =
                await api.get(
                    `/carrinho/${usuario.id}`
                );


            const dados =
                resposta.data;


            if (
                Array.isArray(dados)
            ) {

                setProdutos(
                    dados
                );

            } else if (
                Array.isArray(
                    dados?.itens
                )
            ) {

                setProdutos(
                    dados.itens
                );

            } else if (
                Array.isArray(
                    dados?.produtos
                )
            ) {

                setProdutos(
                    dados.produtos
                );

            } else {

                setProdutos([]);

            }

        } catch (error) {

            console.error(
                "Erro ao carregar carrinho:",
                error.response?.data ||
                error
            );


            setProdutos([]);

        } finally {

            setCarregando(false);

        }

    }


    // =====================================================
    // CARREGAR QUANDO USUÁRIO ESTIVER DISPONÍVEL
    // =====================================================

    useEffect(() => {

        if (usuario) {

            carregarCarrinho();

        } else {

            setCarregando(false);

        }

    }, [usuario]);


    // =====================================================
    // ALTERAR QUANTIDADE
    // =====================================================

    async function alterarQuantidade(
        item,
        novaQuantidade
    ) {

        if (
            atualizandoId !== null
        ) {

            return;

        }


        if (
            novaQuantidade <= 0
        ) {

            return;

        }


        const estoque =
            Number(
                item?.estoque_disponivel ||
                item?.estoque ||
                item?.quantidade_estoque ||
                0
            );


        if (
            estoque > 0 &&
            novaQuantidade > estoque
        ) {

            alert(
                `Quantidade máxima disponível: ${estoque}`
            );

            return;

        }


        try {

            setAtualizandoId(
                item.id
            );


            await api.put(
                `/carrinho/${item.id}`,
                {
                    quantidade:
                        novaQuantidade
                }
            );


            // Atualiza visualmente sem esperar outra requisição
            setProdutos(
                (anteriores) =>
                    anteriores.map(
                        (produto) =>
                            produto.id ===
                            item.id
                                ? {
                                    ...produto,
                                    quantidade:
                                        novaQuantidade
                                }
                                : produto
                    )
            );

        } catch (error) {

            const mensagem =
                error.response?.data?.erro ||
                "Não foi possível alterar a quantidade.";


            console.error(
                "Erro ao alterar quantidade:",
                error.response?.data ||
                error
            );


            alert(
                mensagem
            );

        } finally {

            setAtualizandoId(
                null
            );

        }

    }


    // =====================================================
    // REMOVER PRODUTO
    // =====================================================

    async function removerProduto(
        id
    ) {

        if (
            removendoId !== null
        ) {

            return;

        }


        try {

            setRemovendoId(
                id
            );


            await api.delete(
                `/carrinho/${id}`
            );


            setProdutos(
                (anteriores) =>
                    anteriores.filter(
                        (produto) =>
                            produto.id !== id
                    )
            );

        } catch (error) {

            console.error(
                "Erro ao remover produto:",
                error.response?.data ||
                error
            );


            alert(
                error.response?.data?.erro ||
                "Não foi possível remover o produto."
            );

        } finally {

            setRemovendoId(
                null
            );

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
    // IMAGEM DO PRODUTO
    // =====================================================

    function obterImagem(
        item
    ) {

        if (
            !item?.foto
        ) {

            return "/img/tinta.png";

        }


        if (
            item.foto.startsWith(
                "http://"
            ) ||
            item.foto.startsWith(
                "https://"
            )
        ) {

            return item.foto;

        }


        return `http://localhost:3333/${item.foto}`;

    }


    // =====================================================
    // ID REAL DO PRODUTO
    // =====================================================

    function obterProdutoId(
        item
    ) {

        return Number(
            item?.produto_id ||
            item?.produtoId ||
            item?.produto?.id ||
            item?.item_id ||
            0
        );

    }


    // =====================================================
    // CONVERTER LOGO PARA DATA URL
    // =====================================================

    async function carregarLogoPdf() {

        try {

            const resposta =
                await fetch(
                    logoPdf
                );

            const blob =
                await resposta.blob();

            return await new Promise(
                (resolve, reject) => {

                    const leitor =
                        new FileReader();

                    leitor.onloadend = () =>
                        resolve(
                            leitor.result
                        );

                    leitor.onerror = reject;

                    leitor.readAsDataURL(
                        blob
                    );

                }
            );

        } catch (error) {

            console.error(
                "Erro ao carregar logo no PDF:",
                error
            );

            return null;

        }

    }


    // =====================================================
    // FORMATAR DATA DO ORÇAMENTO
    // =====================================================

    function formatarDataOrcamento(
        valor
    ) {

        if (!valor) {
            return "-";
        }

        const texto =
            String(valor);

        const data =
            texto.length === 10
                ? new Date(
                    `${texto}T12:00:00`
                )
                : new Date(
                    valor
                );

        if (
            Number.isNaN(
                data.getTime()
            )
        ) {
            return "-";
        }

        return data.toLocaleDateString(
            "pt-BR"
        );

    }


    // =====================================================
    // DESENHAR CABEÇALHO DO PDF
    // =====================================================

    async function desenharCabecalhoPdf(
        doc,
        orcamento
    ) {

        const larguraPagina =
            doc.internal.pageSize.getWidth();

        const logoDataUrl =
            await carregarLogoPdf();


        // Fundo navy
        doc.setFillColor(
            23,
            32,
            51
        );

        doc.rect(
            0,
            0,
            larguraPagina,
            42,
            "F"
        );


        // Detalhe azul
        doc.setFillColor(
            50,
            100,
            200
        );

        doc.rect(
            0,
            42,
            larguraPagina,
            2,
            "F"
        );


        // Logo
        if (logoDataUrl) {

            doc.setFillColor(
                255,
                255,
                255
            );

            doc.roundedRect(
                14,
                8,
                36,
                26,
                2,
                2,
                "F"
            );

            doc.addImage(
                logoDataUrl,
                "JPEG",
                17,
                10,
                30,
                22
            );

        }


        doc.setTextColor(
            255,
            255,
            255
        );

        doc.setFont(
            "times",
            "normal"
        );

        doc.setFontSize(20);

        doc.text(
            "Orçamento",
            58,
            18
        );


        doc.setFont(
            "helvetica",
            "normal"
        );

        doc.setFontSize(7);

        doc.setTextColor(
            183,
            194,
            215
        );

        doc.text(
            "PIXEL COLOR • TINTAS, CORES E AMBIENTES",
            58,
            25
        );


        doc.setFontSize(8);

        doc.setTextColor(
            255,
            255,
            255
        );

        doc.text(
            `Nº ${String(orcamento?.id || "-").padStart(4, "0")}`,
            larguraPagina - 14,
            17,
            {
                align: "right"
            }
        );

        doc.setTextColor(
            183,
            194,
            215
        );

        doc.text(
            `Validade: ${formatarDataOrcamento(orcamento?.validade)}`,
            larguraPagina - 14,
            25,
            {
                align: "right"
            }
        );

    }


    // =====================================================
    // GERAR E BAIXAR PDF
    // =====================================================

    async function baixarPdfOrcamento(
        orcamento
    ) {

        if (!orcamento) {
            return;
        }

        const doc =
            new jsPDF({
                orientation: "portrait",
                unit: "mm",
                format: "a4"
            });

        const larguraPagina =
            doc.internal.pageSize.getWidth();

        const alturaPagina =
            doc.internal.pageSize.getHeight();

        const margem = 14;

        const larguraConteudo =
            larguraPagina -
            margem * 2;


        await desenharCabecalhoPdf(
            doc,
            orcamento
        );


        let y = 55;


        // =================================================
        // IDENTIFICAÇÃO DO CLIENTE
        // =================================================

        doc.setTextColor(
            116,
            127,
            142
        );

        doc.setFont(
            "helvetica",
            "bold"
        );

        doc.setFontSize(7);

        doc.text(
            "CLIENTE",
            margem,
            y
        );

        doc.text(
            "EMISSÃO",
            larguraPagina - 62,
            y
        );


        y += 6;


        doc.setFont(
            "times",
            "normal"
        );

        doc.setTextColor(
            24,
            34,
            53
        );

        doc.setFontSize(13);

        doc.text(
            usuario?.nome ||
            "Cliente Pixel Color",
            margem,
            y
        );


        doc.setFont(
            "helvetica",
            "normal"
        );

        doc.setFontSize(8);

        doc.text(
            new Date().toLocaleDateString(
                "pt-BR"
            ),
            larguraPagina - 62,
            y
        );


        if (usuario?.email) {

            y += 5;

            doc.setTextColor(
                112,
                123,
                139
            );

            doc.setFontSize(7.5);

            doc.text(
                usuario.email,
                margem,
                y
            );

        }


        y += 11;


        // =================================================
        // INTRO
        // =================================================

        doc.setDrawColor(
            220,
            216,
            205
        );

        doc.line(
            margem,
            y,
            larguraPagina - margem,
            y
        );

        y += 9;


        doc.setFont(
            "times",
            "normal"
        );

        doc.setFontSize(16);

        doc.setTextColor(
            24,
            34,
            53
        );

        doc.text(
            "Produtos selecionados",
            margem,
            y
        );

        y += 8;


        // =================================================
        // CABEÇALHO DA TABELA
        // =================================================

        const colProduto = margem;
        const colQtd = 126;
        const colUnit = 143;
        const colSubtotal = 172;


        function desenharCabecalhoTabela() {

            doc.setFillColor(
                235,
                231,
                220
            );

            doc.rect(
                margem,
                y,
                larguraConteudo,
                9,
                "F"
            );

            doc.setFont(
                "helvetica",
                "bold"
            );

            doc.setFontSize(6.5);

            doc.setTextColor(
                94,
                105,
                120
            );

            doc.text(
                "PRODUTO",
                colProduto + 3,
                y + 5.8
            );

            doc.text(
                "QTD.",
                colQtd,
                y + 5.8,
                {
                    align: "center"
                }
            );

            doc.text(
                "UNITÁRIO",
                colUnit,
                y + 5.8
            );

            doc.text(
                "SUBTOTAL",
                larguraPagina - margem - 3,
                y + 5.8,
                {
                    align: "right"
                }
            );

            y += 9;

        }


        desenharCabecalhoTabela();


        const itensPdf =
            produtos.map(
                item => ({
                    ...item,
                    quantidadePdf:
                        Number(
                            item.quantidade ||
                            0
                        ),
                    precoPdf:
                        Number(
                            item.preco ||
                            0
                        )
                })
            );


        for (
            let indice = 0;
            indice < itensPdf.length;
            indice += 1
        ) {

            const item =
                itensPdf[indice];

            const nome =
                item.nome ||
                "Produto";

            const linhaExtra =
                [
                    item.marca,
                    item.cor
                ]
                    .filter(Boolean)
                    .join(" • ");

            const nomeQuebrado =
                doc.splitTextToSize(
                    nome,
                    90
                );

            const alturaLinha =
                Math.max(
                    15,
                    7 +
                    nomeQuebrado.length *
                    4.3
                );


            if (
                y + alturaLinha >
                alturaPagina - 35
            ) {

                doc.addPage();

                await desenharCabecalhoPdf(
                    doc,
                    orcamento
                );

                y = 54;

                desenharCabecalhoTabela();

            }


            if (
                indice % 2 === 0
            ) {

                doc.setFillColor(
                    249,
                    247,
                    241
                );

                doc.rect(
                    margem,
                    y,
                    larguraConteudo,
                    alturaLinha,
                    "F"
                );

            }


            doc.setFont(
                "helvetica",
                "bold"
            );

            doc.setFontSize(8);

            doc.setTextColor(
                24,
                34,
                53
            );

            doc.text(
                nomeQuebrado,
                colProduto + 3,
                y + 5.5
            );


            if (linhaExtra) {

                doc.setFont(
                    "helvetica",
                    "normal"
                );

                doc.setFontSize(6.5);

                doc.setTextColor(
                    125,
                    135,
                    148
                );

                doc.text(
                    linhaExtra,
                    colProduto + 3,
                    y + alturaLinha - 3.5
                );

            }


            doc.setFont(
                "helvetica",
                "normal"
            );

            doc.setFontSize(7.5);

            doc.setTextColor(
                70,
                80,
                94
            );

            doc.text(
                String(
                    item.quantidadePdf
                ),
                colQtd,
                y + 7,
                {
                    align: "center"
                }
            );

            doc.text(
                formatarPreco(
                    item.precoPdf
                ),
                colUnit,
                y + 7
            );

            doc.setFont(
                "helvetica",
                "bold"
            );

            doc.text(
                formatarPreco(
                    item.precoPdf *
                    item.quantidadePdf
                ),
                larguraPagina - margem - 3,
                y + 7,
                {
                    align: "right"
                }
            );


            doc.setDrawColor(
                229,
                225,
                216
            );

            doc.line(
                margem,
                y + alturaLinha,
                larguraPagina - margem,
                y + alturaLinha
            );

            y += alturaLinha;

        }


        // =================================================
        // RESUMO FINANCEIRO
        // =================================================

        if (
            y > alturaPagina - 82
        ) {

            doc.addPage();

            await desenharCabecalhoPdf(
                doc,
                orcamento
            );

            y = 55;

        } else {

            y += 10;

        }


        const caixaX = 105;
        const caixaLargura =
            larguraPagina -
            margem -
            caixaX;


        doc.setFillColor(
            23,
            32,
            51
        );

        doc.rect(
            caixaX,
            y,
            caixaLargura,
            44,
            "F"
        );


        doc.setFont(
            "helvetica",
            "normal"
        );

        doc.setFontSize(7);

        doc.setTextColor(
            178,
            190,
            211
        );

        doc.text(
            "SUBTOTAL DOS PRODUTOS",
            caixaX + 8,
            y + 10
        );

        doc.setTextColor(
            255,
            255,
            255
        );

        doc.text(
            formatarPreco(
                subtotal
            ),
            larguraPagina - margem - 8,
            y + 10,
            {
                align: "right"
            }
        );


        doc.setTextColor(
            178,
            190,
            211
        );

        doc.text(
            "FRETE",
            caixaX + 8,
            y + 19
        );

        doc.text(
            "Calculado na finalização da compra",
            larguraPagina - margem - 8,
            y + 19,
            {
                align: "right"
            }
        );


        doc.setDrawColor(
            61,
            74,
            98
        );

        doc.line(
            caixaX + 8,
            y + 25,
            larguraPagina - margem - 8,
            y + 25
        );


        doc.setFont(
            "times",
            "normal"
        );

        doc.setFontSize(13);

        doc.setTextColor(
            255,
            255,
            255
        );

        doc.text(
            "Valor do orçamento",
            caixaX + 8,
            y + 36
        );

        doc.setFont(
            "times",
            "bold"
        );

        doc.setFontSize(16);

        doc.text(
            formatarPreco(
                Number(
                    orcamento?.total ??
                    subtotal
                )
            ),
            larguraPagina - margem - 8,
            y + 36,
            {
                align: "right"
            }
        );


        y += 55;


        // =================================================
        // OBSERVAÇÕES
        // =================================================

        doc.setFont(
            "helvetica",
            "bold"
        );

        doc.setFontSize(7);

        doc.setTextColor(
            78,
            89,
            104
        );

        doc.text(
            "OBSERVAÇÕES",
            margem,
            y
        );

        y += 6;


        doc.setFont(
            "helvetica",
            "normal"
        );

        doc.setFontSize(7);

        doc.setTextColor(
            112,
            123,
            139
        );

        const observacoes = [
            `Este orçamento é válido até ${formatarDataOrcamento(orcamento?.validade)}.`,
            "Os preços apresentados correspondem aos valores registrados no momento da geração.",
            "O frete não está incluído neste orçamento e será calculado conforme o endereço de entrega.",
            "A disponibilidade dos produtos está sujeita ao estoque no momento da compra."
        ];

        observacoes.forEach(
            texto => {

                const linhas =
                    doc.splitTextToSize(
                        `• ${texto}`,
                        larguraConteudo
                    );

                doc.text(
                    linhas,
                    margem,
                    y
                );

                y +=
                    linhas.length *
                    4.2 +
                    1.5;

            }
        );


        // =================================================
        // RODAPÉ EM TODAS AS PÁGINAS
        // =================================================

        const totalPaginas =
            doc.getNumberOfPages();

        for (
            let pagina = 1;
            pagina <= totalPaginas;
            pagina += 1
        ) {

            doc.setPage(
                pagina
            );

            doc.setDrawColor(
                223,
                219,
                209
            );

            doc.line(
                margem,
                alturaPagina - 15,
                larguraPagina - margem,
                alturaPagina - 15
            );

            doc.setFont(
                "helvetica",
                "normal"
            );

            doc.setFontSize(6.5);

            doc.setTextColor(
                132,
                141,
                153
            );

            doc.text(
                "Pixel Color • Seu projeto começa pela cor certa.",
                margem,
                alturaPagina - 9
            );

            doc.text(
                `Página ${pagina} de ${totalPaginas}`,
                larguraPagina - margem,
                alturaPagina - 9,
                {
                    align: "right"
                }
            );

        }


        doc.save(
            `orcamento-pixel-color-${orcamento?.id || "novo"}.pdf`
        );

    }


    // =====================================================
    // GERAR ORÇAMENTO NA API + PDF
    // =====================================================

    async function gerarOrcamento() {

        if (
            !usuario?.id ||
            produtos.length === 0 ||
            gerandoOrcamento
        ) {
            return;
        }

        try {

            setGerandoOrcamento(
                true
            );


            const itens =
                produtos.map(
                    item => ({
                        produto_id:
                            obterProdutoId(
                                item
                            ),
                        quantidade:
                            Number(
                                item.quantidade ||
                                0
                            )
                    })
                );


            const itemInvalido =
                itens.find(
                    item =>
                        !item.produto_id ||
                        item.quantidade <= 0
                );


            if (itemInvalido) {

                throw new Error(
                    "O carrinho não retornou corretamente o produto_id de um dos itens. Verifique a rota GET /carrinho/:usuario_id."
                );

            }


            const resposta =
                await api.post(
                    "/orcamento",
                    {
                        usuario_id:
                            usuario.id,
                        itens
                    }
                );


            const orcamento =
                resposta.data?.orcamento ||
                resposta.data;


            if (!orcamento?.id) {

                throw new Error(
                    "A API criou o orçamento, mas não retornou o ID do orçamento."
                );

            }


            setOrcamentoGerado(
                orcamento
            );

            localStorage.setItem(
                `orcamento_pendente_${usuario.id}`,
                String(orcamento.id)
            );


            await baixarPdfOrcamento(
                orcamento
            );

        } catch (error) {

            console.error(
                "Erro ao gerar orçamento:",
                error.response?.data ||
                error
            );


            // =================================================
            // ROTA DE ORÇAMENTOS NÃO REGISTRADA NO BACKEND
            // =================================================

            if (
                error.response?.status === 404
            ) {

                alert(
                    "A rota /orcamento não foi encontrada no backend. " +
                    "O Carrinho está chamando a rota correta, mas o servidor precisa ter " +
                    'app.use("/orcamento", orcamentosRoutes) registrado antes da rota 404.'
                );

                return;

            }


            alert(
                error.response?.data?.erro ||
                error.response?.data?.mensagem ||
                error.message ||
                "Não foi possível gerar o orçamento."
            );

        } finally {

            setGerandoOrcamento(
                false
            );

        }

    }


    // =====================================================
    // TOTAIS
    // =====================================================

    const subtotal =
        useMemo(
            () => {

                return produtos.reduce(
                    (
                        total,
                        item
                    ) => {

                        return (
                            total +
                            Number(
                                item.preco ||
                                0
                            ) *
                            Number(
                                item.quantidade ||
                                0
                            )
                        );

                    },
                    0
                );

            },
            [produtos]
        );


    const frete =
        subtotal > 0
            ? 29.90
            : 0;


    const total =
        subtotal +
        frete;


    const totalItens =
        produtos.reduce(
            (
                total,
                item
            ) =>
                total +
                Number(
                    item.quantidade ||
                    0
                ),
            0
        );


    // =====================================================
    // USUÁRIO NÃO LOGADO
    // =====================================================

    if (!usuario) {

        return (

            <>

                <Cabecalho />


                <main
                    className={
                        style.estadoPagina
                    }
                >

                    <div
                        className={
                            style.estadoIcone
                        }
                    >

                        <FiShoppingBag />

                    </div>


                    <span>
                        CARRINHO
                    </span>


                    <h1>

                        Entre para acessar

                        <br />

                        <em>
                            suas escolhas.
                        </em>

                    </h1>


                    <p>

                        Faça login para visualizar
                        os produtos adicionados ao
                        seu carrinho.

                    </p>


                    <button
                        type="button"
                        onClick={() =>
                            navigate(
                                "/login"
                            )
                        }
                    >

                        Fazer login

                        <FiArrowRight />

                    </button>

                </main>

            </>

        );

    }


    // =====================================================
    // RENDER
    // =====================================================

    return (

        <>

            <Cabecalho />


            <main
                className={
                    style.container
                }
            >


                {/* =================================================
                    TOPO
                ================================================= */}

                <section
                    className={
                        style.topo
                    }
                >

                    <div
                        className={
                            style.topoEsquerda
                        }
                    >

                        <button
                            type="button"
                            className={
                                style.voltar
                            }
                            onClick={() =>
                                navigate(
                                    "/cliente/produtos"
                                )
                            }
                        >

                            <FiArrowLeft />

                            Continuar comprando

                        </button>


                        <span
                            className={
                                style.eyebrow
                            }
                        >
                            SUA SELEÇÃO
                        </span>


                        <h1>

                            Seu

                            <em>
                                {" "}carrinho.
                            </em>

                        </h1>

                    </div>


                    <div
                        className={
                            style.topoResumo
                        }
                    >

                        <span>
                            ITENS SELECIONADOS
                        </span>


                        <strong>

                            {
                                String(
                                    totalItens
                                ).padStart(
                                    2,
                                    "0"
                                )
                            }

                        </strong>

                    </div>

                </section>


                {/* =================================================
                    CONTEÚDO PRINCIPAL
                ================================================= */}

                <div
                    className={
                        style.content
                    }
                >


                    {/* =================================================
                        LISTA
                    ================================================= */}

                    <section
                        className={
                            style.listaWrapper
                        }
                    >

                        <div
                            className={
                                style.listaCabecalho
                            }
                        >

                            <div>

                                <span>
                                    PRODUTOS
                                </span>


                                <strong>

                                    {totalItens}

                                    {" "}

                                    {
                                        totalItens === 1
                                            ? "item"
                                            : "itens"
                                    }

                                </strong>

                            </div>


                            {
                                produtos.length >
                                0 && (

                                    <span
                                        className={
                                            style.statusSeguro
                                        }
                                    >

                                        <FiCheck />

                                        Estoque verificado

                                    </span>

                                )
                            }

                        </div>


                        {/* =============================================
                            CARREGANDO
                        ============================================= */}

                        {
                            carregando ? (

                                <div
                                    className={
                                        style.carregando
                                    }
                                >

                                    <div
                                        className={
                                            style.spinner
                                        }
                                    />


                                    <span>
                                        Carregando carrinho...
                                    </span>

                                </div>

                            ) : produtos.length ===
                              0 ? (


                                /* =====================================
                                    VAZIO
                                ===================================== */

                                <div
                                    className={
                                        style.carrinhoVazio
                                    }
                                >

                                    <div
                                        className={
                                            style.vazioIcone
                                        }
                                    >

                                        <FiShoppingBag />

                                    </div>


                                    <span>
                                        SEU CARRINHO
                                    </span>


                                    <h2>

                                        Ainda não há

                                        <br />

                                        <em>
                                            nada por aqui.
                                        </em>

                                    </h2>


                                    <p>

                                        Explore nosso catálogo
                                        e encontre tintas,
                                        acabamentos e ferramentas
                                        para transformar seu
                                        projeto.

                                    </p>


                                    <button
                                        type="button"
                                        onClick={() =>
                                            navigate(
                                                "/cliente/produtos"
                                            )
                                        }
                                    >

                                        Explorar produtos

                                        <FiArrowRight />

                                    </button>

                                </div>

                            ) : (

                                <div
                                    className={
                                        style.lista
                                    }
                                >

                                    {
                                        produtos.map(
                                            (
                                                item,
                                                index
                                            ) => {

                                                const estoque =
                                                    Number(
                                                        item?.estoque_disponivel ||
                                                        item?.estoque ||
                                                        item?.quantidade_estoque ||
                                                        0
                                                    );


                                                const subtotalItem =
                                                    Number(
                                                        item.preco ||
                                                        0
                                                    ) *
                                                    Number(
                                                        item.quantidade ||
                                                        0
                                                    );


                                                const aumentandoBloqueado =
                                                    atualizandoId ===
                                                        item.id ||
                                                    (
                                                        estoque >
                                                            0 &&
                                                        Number(
                                                            item.quantidade
                                                        ) >=
                                                            estoque
                                                    );


                                                return (

                                                    <article
                                                        className={
                                                            style.card
                                                        }
                                                        key={
                                                            item.id
                                                        }
                                                    >

                                                        {/* =====================
                                                            NÚMERO
                                                        ===================== */}

                                                        <span
                                                            className={
                                                                style.numeroItem
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


                                                        {/* =====================
                                                            IMAGEM
                                                        ===================== */}

                                                        <div
                                                            className={
                                                                style.imagemBox
                                                            }
                                                        >

                                                            {
                                                                item?.marca &&
                                                                (

                                                                    <span
                                                                        className={
                                                                            style.marca
                                                                        }
                                                                    >
                                                                        {
                                                                            item.marca
                                                                        }
                                                                    </span>

                                                                )
                                                            }


                                                            <img
                                                                src={
                                                                    obterImagem(
                                                                        item
                                                                    )
                                                                }
                                                                alt={
                                                                    item.nome ||
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


                                                        {/* =====================
                                                            INFO
                                                        ===================== */}

                                                        <div
                                                            className={
                                                                style.info
                                                            }
                                                        >

                                                            <span
                                                                className={
                                                                    style.produtoLabel
                                                                }
                                                            >

                                                                {
                                                                    item?.categoria ||
                                                                    "PRODUTO PIXEL COLOR"
                                                                }

                                                            </span>


                                                            <h3>
                                                                {
                                                                    item.nome
                                                                }
                                                            </h3>


                                                            {
                                                                item?.cor &&
                                                                (

                                                                    <div
                                                                        className={
                                                                            style.cor
                                                                        }
                                                                    >

                                                                        <span />

                                                                        {
                                                                            item.cor
                                                                        }

                                                                    </div>

                                                                )
                                                            }


                                                            {
                                                                item?.descricao &&
                                                                (

                                                                    <p
                                                                        className={
                                                                            style.descricao
                                                                        }
                                                                    >

                                                                        {
                                                                            item.descricao
                                                                        }

                                                                    </p>

                                                                )
                                                            }


                                                            <div
                                                                className={
                                                                    style.precoUnitario
                                                                }
                                                            >

                                                                <span>
                                                                    Preço unitário
                                                                </span>

                                                                <strong>

                                                                    {
                                                                        formatarPreco(
                                                                            item.preco
                                                                        )
                                                                    }

                                                                </strong>

                                                            </div>

                                                        </div>


                                                        {/* =====================
                                                            QUANTIDADE
                                                        ===================== */}

                                                        <div
                                                            className={
                                                                style.quantidadeArea
                                                            }
                                                        >

                                                            <span
                                                                className={
                                                                    style.quantidadeLabel
                                                                }
                                                            >
                                                                QUANTIDADE
                                                            </span>


                                                            <div
                                                                className={
                                                                    style.qtd
                                                                }
                                                            >

                                                                <button
                                                                    type="button"
                                                                    disabled={
                                                                        atualizandoId ===
                                                                            item.id ||
                                                                        Number(
                                                                            item.quantidade
                                                                        ) <=
                                                                            1
                                                                    }
                                                                    onClick={() =>
                                                                        alterarQuantidade(
                                                                            item,
                                                                            Number(
                                                                                item.quantidade
                                                                            ) -
                                                                                1
                                                                        )
                                                                    }
                                                                    aria-label="Diminuir quantidade"
                                                                >

                                                                    <FiMinus />

                                                                </button>


                                                                <span>

                                                                    {
                                                                        item.quantidade
                                                                    }

                                                                </span>


                                                                <button
                                                                    type="button"
                                                                    disabled={
                                                                        aumentandoBloqueado
                                                                    }
                                                                    onClick={() =>
                                                                        alterarQuantidade(
                                                                            item,
                                                                            Number(
                                                                                item.quantidade
                                                                            ) +
                                                                                1
                                                                        )
                                                                    }
                                                                    aria-label="Aumentar quantidade"
                                                                >

                                                                    <FiPlus />

                                                                </button>

                                                            </div>


                                                            {
                                                                estoque >
                                                                0 ? (

                                                                    <small
                                                                        className={
                                                                            style.estoque
                                                                        }
                                                                    >

                                                                        {
                                                                            estoque
                                                                        }

                                                                        {" "}

                                                                        disponíveis

                                                                    </small>

                                                                ) : (

                                                                    <small
                                                                        className={
                                                                            style.estoqueIndisponivel
                                                                        }
                                                                    >

                                                                        <FiAlertCircle />

                                                                        Verifique o estoque

                                                                    </small>

                                                                )
                                                            }

                                                        </div>


                                                        {/* =====================
                                                            SUBTOTAL
                                                        ===================== */}

                                                        <div
                                                            className={
                                                                style.preco
                                                            }
                                                        >

                                                            <span>
                                                                SUBTOTAL
                                                            </span>


                                                            <h2>

                                                                {
                                                                    formatarPreco(
                                                                        subtotalItem
                                                                    )
                                                                }

                                                            </h2>

                                                        </div>


                                                        {/* =====================
                                                            REMOVER
                                                        ===================== */}

                                                        <button
                                                            type="button"
                                                            className={
                                                                style.lixeira
                                                            }
                                                            disabled={
                                                                removendoId ===
                                                                item.id
                                                            }
                                                            onClick={() =>
                                                                removerProduto(
                                                                    item.id
                                                                )
                                                            }
                                                            aria-label={
                                                                `Remover ${item.nome}`
                                                            }
                                                        >

                                                            <FiTrash2 />

                                                        </button>

                                                    </article>

                                                );

                                            }
                                        )
                                    }

                                </div>

                            )
                        }

                    </section>


                    {/* =================================================
                        RESUMO
                    ================================================= */}

                    <aside
                        className={
                            style.resumo
                        }
                    >

                        <span
                            className={
                                style.resumoEyebrow
                            }
                        >
                            SEU PEDIDO
                        </span>


                        <h2>

                            Resumo da

                            <br />

                            <em>
                                compra.
                            </em>

                        </h2>


                        <div
                            className={
                                style.resumoDivisor
                            }
                        />


                        <div
                            className={
                                style.linha
                            }
                        >

                            <span>
                                Subtotal
                            </span>


                            <strong>

                                {
                                    formatarPreco(
                                        subtotal
                                    )
                                }

                            </strong>

                        </div>


                        <div
                            className={
                                style.linha
                            }
                        >

                            <span>
                                Frete
                            </span>


                            <strong>

                                {
                                    formatarPreco(
                                        frete
                                    )
                                }

                            </strong>

                        </div>


                        <div
                            className={
                                style.freteInfo
                            }
                        >

                            <FiTruck />


                            <p>

                                O valor final do frete
                                poderá ser atualizado
                                conforme o endereço da
                                entrega.

                            </p>

                        </div>


                        <div
                            className={
                                style.total
                            }
                        >

                            <div>

                                <span>
                                    TOTAL
                                </span>


                                <small>
                                    Impostos inclusos
                                </small>

                            </div>


                            <h2>

                                {
                                    formatarPreco(
                                        total
                                    )
                                }

                            </h2>

                        </div>


                        <button
                            type="button"
                            className={
                                style.finalizar
                            }
                            disabled={
                                produtos.length ===
                                    0 ||
                                carregando
                            }
                            onClick={() =>
                                navigate(
                                    "/cliente/compra"
                                )
                            }
                        >

                            Finalizar compra

                            <FiArrowRight />

                        </button>


                        <button
                            type="button"
                            className={
                                style.orcamentoBtn
                            }
                            disabled={
                                produtos.length === 0 ||
                                carregando ||
                                gerandoOrcamento
                            }
                            onClick={
                                gerarOrcamento
                            }
                        >

                            <span>

                                <FiFileText />

                                {gerandoOrcamento
                                    ? "Gerando orçamento..."
                                    : "Gerar orçamento em PDF"
                                }

                            </span>

                            <FiDownload />

                        </button>


                        <button
                            type="button"
                            className={
                                style.continuar
                            }
                            onClick={() =>
                                navigate(
                                    "/cliente/produtos"
                                )
                            }
                        >

                            Continuar comprando

                        </button>


                        <div
                            className={
                                style.seguranca
                            }
                        >

                            <FiShield />


                            <div>

                                <strong>
                                    Compra segura
                                </strong>

                                <span>
                                    Seus dados estão protegidos.
                                </span>

                            </div>

                        </div>

                    </aside>

                </div>


                {/* =================================================
                    MODAL — ORÇAMENTO GERADO
                ================================================= */}

                {orcamentoGerado && (

                    <div
                        className={
                            style.orcamentoOverlay
                        }
                        onClick={() =>
                            setOrcamentoGerado(
                                null
                            )
                        }
                    >

                        <section
                            className={
                                style.orcamentoModal
                            }
                            onClick={
                                event =>
                                    event.stopPropagation()
                            }
                        >

                            <button
                                type="button"
                                className={
                                    style.orcamentoFechar
                                }
                                onClick={() =>
                                    setOrcamentoGerado(
                                        null
                                    )
                                }
                                aria-label="Fechar"
                            >
                                <FiX />
                            </button>


                            <div
                                className={
                                    style.orcamentoModalTopo
                                }
                            >

                                <span>
                                    ORÇAMENTO PIXEL COLOR
                                </span>

                                <div
                                    className={
                                        style.orcamentoSucessoIcone
                                    }
                                >
                                    <FiCheck />
                                </div>

                                <h2>
                                    Orçamento
                                    <br />
                                    <em>
                                        criado com sucesso.
                                    </em>
                                </h2>

                                <p>
                                    O orçamento foi salvo no sistema
                                    e o PDF foi baixado automaticamente.
                                </p>

                            </div>


                            <div
                                className={
                                    style.orcamentoModalDados
                                }
                            >

                                <div>

                                    <span>
                                        Nº DO ORÇAMENTO
                                    </span>

                                    <strong>
                                        #{String(
                                            orcamentoGerado.id
                                        ).padStart(
                                            4,
                                            "0"
                                        )}
                                    </strong>

                                </div>

                                <div>

                                    <span>
                                        VALOR
                                    </span>

                                    <strong>
                                        {formatarPreco(
                                            orcamentoGerado.total ??
                                            subtotal
                                        )}
                                    </strong>

                                </div>

                                <div>

                                    <span>
                                        VALIDADE
                                    </span>

                                    <strong>
                                        {formatarDataOrcamento(
                                            orcamentoGerado.validade
                                        )}
                                    </strong>

                                </div>

                            </div>


                            <div
                                className={
                                    style.orcamentoModalAcoes
                                }
                            >

                                <button
                                    type="button"
                                    className={
                                        style.orcamentoBaixarNovamente
                                    }
                                    onClick={() =>
                                        baixarPdfOrcamento(
                                            orcamentoGerado
                                        )
                                    }
                                >

                                    <FiDownload />

                                    Baixar PDF novamente

                                </button>


                                <button
                                    type="button"
                                    className={
                                        style.orcamentoContinuar
                                    }
                                    onClick={() =>
                                        setOrcamentoGerado(
                                            null
                                        )
                                    }
                                >
                                    Continuar no carrinho
                                </button>

                            </div>

                        </section>

                    </div>

                )}


                {/* =================================================
                    BENEFÍCIOS
                ================================================= */}

                <section
                    className={
                        style.beneficios
                    }
                >

                    <article>

                        <span>
                            01
                        </span>


                        <FiShield />


                        <div>

                            <strong>
                                Compra segura
                            </strong>

                            <p>
                                Proteção durante todo
                                o processo de compra.
                            </p>

                        </div>

                    </article>


                    <article>

                        <span>
                            02
                        </span>


                        <FiCreditCard />


                        <div>

                            <strong>
                                Pagamento facilitado
                            </strong>

                            <p>
                                Escolha a opção que
                                melhor combina com você.
                            </p>

                        </div>

                    </article>


                    <article>

                        <span>
                            03
                        </span>


                        <FiTruck />


                        <div>

                            <strong>
                                Entrega
                            </strong>

                            <p>
                                Seus produtos com
                                cuidado até você.
                            </p>

                        </div>

                    </article>


                    <article>

                        <span>
                            04
                        </span>


                        <FiPackage />


                        <div>

                            <strong>
                                Produtos selecionados
                            </strong>

                            <p>
                                Qualidade para cada
                                etapa do seu projeto.
                            </p>

                        </div>

                    </article>

                </section>

            </main>

        </>

    );

}
