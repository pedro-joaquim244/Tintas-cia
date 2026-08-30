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
    FiAlertCircle
} from "react-icons/fi";

import style from "../styles/carrinho.module.css";

import { api } from "../services/api";

import { useAuth } from "../contexts/authContext";

import { useNavigate } from "react-router-dom";

import Cabecalho from "../components/Cabeçalho-Users/index.jsx";


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