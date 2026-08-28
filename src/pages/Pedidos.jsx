import { useEffect, useMemo, useState } from "react";

import styles from "../styles/Pedidos.module.css";

import {
    FiSearch,
    FiTruck,
    FiCheckCircle,
    FiClock,
    FiShoppingCart,
    FiX,
    FiPackage,
    FiRefreshCw,
    FiSave,
    FiEdit3,
    FiLoader
} from "react-icons/fi";

import Cabecalho from "../components/Cabeçalho-ADM/Cabecalho.jsx";
import { api } from "../services/api.js";

export default function Pedidos() {

    // =====================================================
    // ESTADOS
    // =====================================================

    const [pedidos, setPedidos] = useState([]);

    const [usuarios, setUsuarios] = useState([]);

    const [busca, setBusca] = useState("");

    const [pedidoSelecionado, setPedidoSelecionado] =
        useState(null);

    const [carregando, setCarregando] =
        useState(true);

    const [carregandoPedido, setCarregandoPedido] =
        useState(false);

    const [salvandoStatus, setSalvandoStatus] =
        useState(false);

    const [novoStatus, setNovoStatus] =
        useState("");

    const [erro, setErro] =
        useState("");

    const [mensagem, setMensagem] =
        useState("");


    // =====================================================
    // STATUS
    // =====================================================

    const statusDisponiveis = [
        {
            valor: "pendente",
            texto: "Pendente"
        },
        {
            valor: "processando",
            texto: "Processando"
        },
        {
            valor: "em transporte",
            texto: "Em transporte"
        },
        {
            valor: "entregue",
            texto: "Entregue"
        },
        {
            valor: "cancelado",
            texto: "Cancelado"
        }
    ];


    // =====================================================
    // CARREGAR DADOS
    // =====================================================

    useEffect(() => {

        carregarDados();

    }, []);


    async function carregarDados() {

        try {

            setCarregando(true);

            setErro("");


            const respostaPedidos =
                await api.get("/pedidos");


            const dadosPedidos =
                Array.isArray(respostaPedidos.data)
                    ? respostaPedidos.data
                    : [];


            // =================================================
            // USUÁRIOS
            // =================================================

            let dadosUsuarios = [];


            try {

                const respostaUsuarios =
                    await api.get("/usuarios");


                if (
                    Array.isArray(
                        respostaUsuarios.data
                    )
                ) {

                    dadosUsuarios =
                        respostaUsuarios.data;

                } else if (
                    Array.isArray(
                        respostaUsuarios.data?.usuarios
                    )
                ) {

                    dadosUsuarios =
                        respostaUsuarios.data.usuarios;

                }

            } catch (error) {

                console.warn(
                    "Não foi possível carregar usuários.",
                    error
                );

            }


            // =================================================
            // RELACIONAR CLIENTE
            // =================================================

            const pedidosComCliente =
                dadosPedidos.map(pedido => {

                    const usuario =
                        dadosUsuarios.find(
                            usuario =>
                                Number(usuario.id) ===
                                Number(pedido.usuario_id)
                        );


                    return {

                        ...pedido,

                        cliente:
                            pedido.cliente ||
                            usuario?.nome ||
                            usuario?.nome_completo ||
                            usuario?.name ||
                            `Usuário #${pedido.usuario_id}`

                    };

                });


            setUsuarios(dadosUsuarios);

            setPedidos(pedidosComCliente);


        } catch (error) {

            console.error(
                "ERRO AO CARREGAR PEDIDOS:",
                error
            );


            console.error(
                "RESPOSTA:",
                error.response?.data
            );


            setErro(
                error.response?.data?.erro ||
                error.response?.data?.mensagem ||
                "Não foi possível carregar os pedidos."
            );

        } finally {

            setCarregando(false);

        }

    }


    // =====================================================
    // ABRIR MODAL
    // =====================================================

    async function abrirPedido(id) {

        try {

            setCarregandoPedido(true);

            setErro("");

            setMensagem("");


            const resposta =
                await api.get(
                    `/pedidos/${id}`
                );


            const pedido =
                resposta.data;


            const usuario =
                usuarios.find(
                    usuario =>
                        Number(usuario.id) ===
                        Number(pedido.usuario_id)
                );


            const pedidoComCliente = {

                ...pedido,

                cliente:
                    pedido.cliente ||
                    usuario?.nome ||
                    usuario?.nome_completo ||
                    usuario?.name ||
                    `Usuário #${pedido.usuario_id}`

            };


            setPedidoSelecionado(
                pedidoComCliente
            );


            setNovoStatus(
                normalizarStatus(
                    pedido.status
                )
            );


        } catch (error) {

            console.error(
                "ERRO AO BUSCAR PEDIDO:",
                error
            );


            setErro(
                error.response?.data?.erro ||
                error.response?.data?.mensagem ||
                "Não foi possível carregar o pedido."
            );

        } finally {

            setCarregandoPedido(false);

        }

    }


    // =====================================================
    // ALTERAR STATUS
    // =====================================================

    async function alterarStatus() {

        if (!pedidoSelecionado) {
            return;
        }


        if (!novoStatus) {

            setErro(
                "Selecione um status."
            );

            return;

        }


        const statusAtual =
            normalizarStatus(
                pedidoSelecionado.status
            );


        if (
            novoStatus === statusAtual
        ) {

            setErro(
                "O pedido já está com esse status."
            );

            return;

        }


        try {

            setSalvandoStatus(true);

            setErro("");

            setMensagem("");


            const resposta =
                await api.put(
                    `/pedidos/${pedidoSelecionado.id}/status`,
                    {
                        status: novoStatus
                    }
                );


            const pedidoAtualizado =
                resposta.data?.pedido;


            if (
                !pedidoAtualizado
            ) {

                throw new Error(
                    "A API não retornou o pedido atualizado."
                );

            }


            // =================================================
            // ATUALIZAR MODAL
            // =================================================

            setPedidoSelecionado(
                pedidoAnterior => ({

                    ...pedidoAnterior,

                    ...pedidoAtualizado

                })
            );


            // =================================================
            // ATUALIZAR TABELA
            // =================================================

            setPedidos(
                pedidosAnteriores =>

                    pedidosAnteriores.map(
                        pedido => {

                            if (
                                Number(pedido.id) !==
                                Number(
                                    pedidoAtualizado.id
                                )
                            ) {

                                return pedido;

                            }


                            return {

                                ...pedido,

                                ...pedidoAtualizado

                            };

                        }
                    )

            );


            setNovoStatus(
                normalizarStatus(
                    pedidoAtualizado.status
                )
            );


            setMensagem(
                "Status atualizado com sucesso!"
            );


        } catch (error) {

            console.error(
                "ERRO AO ALTERAR STATUS:",
                error
            );


            setErro(
                error.response?.data?.erro ||
                error.response?.data?.mensagem ||
                error.message ||
                "Não foi possível alterar o status."
            );

        } finally {

            setSalvandoStatus(false);

        }

    }


    // =====================================================
    // FECHAR MODAL
    // =====================================================

    function fecharModal() {

        if (salvandoStatus) {
            return;
        }


        setPedidoSelecionado(null);

        setNovoStatus("");

        setMensagem("");

        setErro("");

    }


    // =====================================================
    // DINHEIRO
    // =====================================================

    function formatarDinheiro(valor) {

        return Number(
            valor || 0
        ).toLocaleString(
            "pt-BR",
            {
                style: "currency",
                currency: "BRL"
            }
        );

    }


    // =====================================================
    // DATA
    // =====================================================

    function formatarData(data) {

        if (!data) {
            return "-";
        }


        const dataObj =
            new Date(data);


        if (
            Number.isNaN(
                dataObj.getTime()
            )
        ) {

            return "-";

        }


        return dataObj.toLocaleDateString(
            "pt-BR"
        );

    }


    // =====================================================
    // DATA + HORA
    // =====================================================

    function formatarDataHora(data) {

        if (!data) {
            return "-";
        }


        const dataObj =
            new Date(data);


        if (
            Number.isNaN(
                dataObj.getTime()
            )
        ) {

            return "-";

        }


        return dataObj.toLocaleString(
            "pt-BR",
            {
                dateStyle: "short",
                timeStyle: "short"
            }
        );

    }


    // =====================================================
    // NORMALIZAR STATUS
    // =====================================================

    function normalizarStatus(status) {

        return String(
            status || ""
        )
            .trim()
            .toLowerCase()
            .normalize("NFD")
            .replace(
                /[\u0300-\u036f]/g,
                ""
            );

    }


    // =====================================================
    // TEXTO STATUS
    // =====================================================

    function textoStatus(status) {

        const normalizado =
            normalizarStatus(status);


        switch (normalizado) {

            case "pendente":
                return "Pendente";

            case "processando":
                return "Processando";

            case "em transporte":
            case "transporte":
            case "enviado":
                return "Em transporte";

            case "entregue":
                return "Entregue";

            case "cancelado":
                return "Cancelado";

            default:
                return status || "Pendente";

        }

    }


    // =====================================================
    // CLASSE DO STATUS
    // =====================================================

    function classeStatus(status) {

        const normalizado =
            normalizarStatus(status);


        switch (normalizado) {

            case "pendente":
                return styles.statusPendente;

            case "processando":
                return styles.statusProcessando;

            case "em transporte":
            case "transporte":
            case "enviado":
                return styles.statusTransporte;

            case "entregue":
                return styles.statusEntregue;

            case "cancelado":
                return styles.statusCancelado;

            default:
                return styles.statusPendente;

        }

    }


    // =====================================================
    // FILTRO
    // =====================================================

    const pedidosFiltrados =
        useMemo(() => {

            const texto =
                busca
                    .toLowerCase()
                    .trim();


            if (!texto) {
                return pedidos;
            }


            return pedidos.filter(
                pedido => {

                    const id =
                        String(
                            pedido.id || ""
                        ).toLowerCase();


                    const usuario =
                        String(
                            pedido.usuario_id || ""
                        ).toLowerCase();


                    const cliente =
                        String(
                            pedido.cliente || ""
                        ).toLowerCase();


                    const status =
                        textoStatus(
                            pedido.status
                        ).toLowerCase();


                    const pagamento =
                        String(
                            pedido.metodo_pagamento || ""
                        ).toLowerCase();


                    return (

                        id.includes(texto) ||

                        usuario.includes(texto) ||

                        cliente.includes(texto) ||

                        status.includes(texto) ||

                        pagamento.includes(texto)

                    );

                }
            );

        }, [pedidos, busca]);


    // =====================================================
    // ESTATÍSTICAS
    // =====================================================

    const totalPedidos =
        pedidos.length;


    const pedidosTransporte =
        pedidos.filter(
            pedido =>
                normalizarStatus(
                    pedido.status
                ) === "em transporte"
        ).length;


    const pedidosEntregues =
        pedidos.filter(
            pedido =>
                normalizarStatus(
                    pedido.status
                ) === "entregue"
        ).length;


    const pedidosPendentes =
        pedidos.filter(
            pedido => {

                const status =
                    normalizarStatus(
                        pedido.status
                    );


                return (
                    status === "pendente" ||
                    status === "processando"
                );

            }
        ).length;


    // =====================================================
    // SUBTOTAL
    // =====================================================

    function calcularSubtotal(pedido) {

        if (
            !pedido ||
            !Array.isArray(
                pedido.itens
            )
        ) {

            return 0;

        }


        return pedido.itens.reduce(
            (
                total,
                item
            ) =>

                total +
                Number(
                    item.subtotal || 0
                ),

            0

        );

    }


    // =====================================================
    // RENDER
    // =====================================================

    return (

        <div className={styles.container}>

            <Cabecalho />



            

            <main className={styles.main}>

                {/* =================================================
                    TOPO
                ================================================= */}
<div className={styles.topbar}>

          <div>

            <span className={styles.badge}>
              Administração
            </span>

            <h1 className={styles.title}>
              Pedidos
            </h1>

            <p>
              Gerencie todos os pedidos da sua loja.
            </p>

          </div>

          <button
                        className={styles.newBtn}
                        onClick={carregarDados}
                        disabled={carregando}
                    >

                        <FiRefreshCw />

                        {carregando
                            ? "Atualizando..."
                            : "Atualizar pedidos"}

                    </button>

        </div>


                    



                {/* =================================================
                    ERRO
                ================================================= */}

                {erro &&
                    !pedidoSelecionado && (

                        <div
                            className={
                                styles.error
                            }
                        >
                            {erro}
                        </div>

                    )
                }


                {/* =================================================
                    CARDS
                ================================================= */}

                <div className={styles.cards}>

                    <div className={styles.card}>

                        <div>

                            <span>
                                Total pedidos
                            </span>

                            <strong>
                                {totalPedidos}
                            </strong>

                        </div>

                        <FiShoppingCart />

                    </div>


                    <div className={styles.card}>

                        <div>

                            <span>
                                Em transporte
                            </span>

                            <strong>
                                {pedidosTransporte}
                            </strong>

                        </div>

                        <FiTruck />

                    </div>


                    <div className={styles.card}>

                        <div>

                            <span>
                                Entregues
                            </span>

                            <strong>
                                {pedidosEntregues}
                            </strong>

                        </div>

                        <FiCheckCircle />

                    </div>


                    <div className={styles.card}>

                        <div>

                            <span>
                                Pendentes
                            </span>

                            <strong>
                                {pedidosPendentes}
                            </strong>

                        </div>

                        <FiClock />

                    </div>

                </div>


                {/* =================================================
                    TABELA
                ================================================= */}

                <div className={styles.tableBox}>

                    <div className={styles.tableTop}>

                        <div className={styles.search}>

                            <FiSearch />

                            <input
                                type="text"
                                placeholder="Buscar pedido ou cliente..."
                                value={busca}
                                onChange={
                                    e =>
                                        setBusca(
                                            e.target.value
                                        )
                                }
                            />

                        </div>

                    </div>


                    {carregando ? (

                        <div className={styles.empty}>

                            <FiLoader />

                            <p>
                                Carregando pedidos...
                            </p>

                        </div>

                    ) : pedidosFiltrados.length === 0 ? (

                        <div className={styles.empty}>

                            <FiPackage />

                            <p>
                                Nenhum pedido encontrado.
                            </p>

                        </div>

                    ) : (

                        <div
                            className={
                                styles.tableWrapper
                            }
                        >

                            <table
                                className={
                                    styles.table
                                }
                            >

                                <thead>

                                    <tr>

                                        <th>
                                            Pedido
                                        </th>

                                        <th>
                                            Cliente
                                        </th>

                                        <th>
                                            Status
                                        </th>

                                        <th>
                                            Valor
                                        </th>

                                        <th>
                                            Data
                                        </th>

                                        <th>
                                            Ações
                                        </th>

                                    </tr>

                                </thead>


                                <tbody>

                                    {pedidosFiltrados.map(
                                        pedido => (

                                            <tr
                                                key={
                                                    pedido.id
                                                }
                                            >

                                                <td>

                                                    <strong>
                                                        #{pedido.id}
                                                    </strong>

                                                </td>


                                                <td>

                                                    <strong>
                                                        {
                                                            pedido.cliente ||
                                                            `Usuário #${pedido.usuario_id}`
                                                        }
                                                    </strong>

                                                </td>


                                                <td>

                                                    <span
                                                        className={`
                                                            ${styles.status}
                                                            ${classeStatus(
                                                                pedido.status
                                                            )}
                                                        `}
                                                    >

                                                        {
                                                            textoStatus(
                                                                pedido.status
                                                            )
                                                        }

                                                    </span>

                                                </td>


                                                <td>

                                                    {
                                                        formatarDinheiro(
                                                            pedido.total
                                                        )
                                                    }

                                                </td>


                                                <td>

                                                    {
                                                        formatarData(
                                                            pedido.criado_em
                                                        )
                                                    }

                                                </td>


                                                <td>

                                                    <button
                                                        className={
                                                            styles.statusBtn
                                                        }
                                                        onClick={() =>
                                                            abrirPedido(
                                                                pedido.id
                                                            )
                                                        }
                                                        title="Alterar status"
                                                    >

                                                        <FiEdit3 />

                                                        <span>
                                                            Alterar status
                                                        </span>

                                                    </button>

                                                </td>

                                            </tr>

                                        )
                                    )}

                                </tbody>

                            </table>

                        </div>

                    )}

                </div>

            </main>


            {/* =====================================================
                MODAL
            ===================================================== */}

            {pedidoSelecionado && (

                <div
                    className={
                        styles.modalOverlay
                    }
                    onClick={
                        fecharModal
                    }
                >

                    <div
                        className={
                            styles.modal
                        }
                        onClick={
                            e =>
                                e.stopPropagation()
                        }
                    >

                        {/* =================================================
                            HEADER
                        ================================================= */}

                        <div
                            className={
                                styles.modalHeader
                            }
                        >

                            <div>

                                <span>
                                    Pedido
                                </span>

                                <h2>
                                    #{pedidoSelecionado.id}
                                </h2>

                            </div>


                            <button
                                className={
                                    styles.closeBtn
                                }
                                onClick={
                                    fecharModal
                                }
                                disabled={
                                    salvandoStatus
                                }
                            >

                                <FiX />

                            </button>

                        </div>


                        {carregandoPedido ? (

                            <div
                                className={
                                    styles.empty
                                }
                            >

                                <FiLoader />

                                <p>
                                    Carregando pedido...
                                </p>

                            </div>

                        ) : (

                            <>

                                {/* =================================================
                                    INFORMAÇÕES
                                ================================================= */}

                                <div
                                    className={
                                        styles.infoGrid
                                    }
                                >

                                    <div>

                                        <span>
                                            Cliente
                                        </span>

                                        <strong>
                                            {
                                                pedidoSelecionado.cliente ||
                                                `Usuário #${pedidoSelecionado.usuario_id}`
                                            }
                                        </strong>

                                    </div>


                                    <div>

                                        <span>
                                            Data
                                        </span>

                                        <strong>
                                            {
                                                formatarDataHora(
                                                    pedidoSelecionado.criado_em
                                                )
                                            }
                                        </strong>

                                    </div>


                                    <div>

                                        <span>
                                            Status atual
                                        </span>

                                        <strong>

                                            <span
                                                className={`
                                                    ${styles.status}
                                                    ${classeStatus(
                                                        pedidoSelecionado.status
                                                    )}
                                                `}
                                            >

                                                {
                                                    textoStatus(
                                                        pedidoSelecionado.status
                                                    )
                                                }

                                            </span>

                                        </strong>

                                    </div>


                                    <div>

                                        <span>
                                            Pagamento
                                        </span>

                                        <strong>
                                            {
                                                pedidoSelecionado.metodo_pagamento ||
                                                "-"
                                            }
                                        </strong>

                                    </div>

                                </div>


                                {/* =================================================
                                    STATUS
                                ================================================= */}

                                <div
                                    className={
                                        styles.statusControl
                                    }
                                >

                                    <div>

                                        <span>
                                            Alterar status do pedido
                                        </span>


                                        <select
                                            value={
                                                novoStatus
                                            }
                                            onChange={
                                                e =>
                                                    setNovoStatus(
                                                        e.target.value
                                                    )
                                            }
                                            disabled={
                                                salvandoStatus
                                            }
                                        >

                                            {statusDisponiveis.map(
                                                status => (

                                                    <option
                                                        key={
                                                            status.valor
                                                        }
                                                        value={
                                                            status.valor
                                                        }
                                                    >
                                                        {
                                                            status.texto
                                                        }
                                                    </option>

                                                )
                                            )}

                                        </select>

                                    </div>


                                    <button
                                        type="button"
                                        className={
                                            styles.saveStatusBtn
                                        }
                                        onClick={
                                            alterarStatus
                                        }
                                        disabled={
                                            salvandoStatus ||
                                            novoStatus ===
                                            normalizarStatus(
                                                pedidoSelecionado.status
                                            )
                                        }
                                    >

                                        <FiSave />

                                        {salvandoStatus
                                            ? "Salvando..."
                                            : "Salvar status"}

                                    </button>

                                </div>


                                {/* =================================================
                                    MENSAGEM
                                ================================================= */}

                                {mensagem && (

                                    <div
                                        className={
                                            styles.success
                                        }
                                    >
                                        {mensagem}
                                    </div>

                                )}


                                {erro && (

                                    <div
                                        className={
                                            styles.error
                                        }
                                    >
                                        {erro}
                                    </div>

                                )}


                                {/* =================================================
                                    PRODUTOS
                                ================================================= */}

                                <div
                                    className={
                                        styles.productsSection
                                    }
                                >

                                    <h3>
                                        Produtos
                                    </h3>


                                    {!Array.isArray(
                                        pedidoSelecionado.itens
                                    ) ||
                                    pedidoSelecionado.itens.length === 0 ? (

                                        <div
                                            className={
                                                styles.noItems
                                            }
                                        >
                                            Nenhum item encontrado.
                                        </div>

                                    ) : (

                                        <div
                                            className={
                                                styles.products
                                            }
                                        >

                                            {pedidoSelecionado.itens.map(
                                                item => (

                                                    <div
                                                        className={
                                                            styles.product
                                                        }
                                                        key={
                                                            item.id
                                                        }
                                                    >

                                                        <div
                                                            className={
                                                                styles.productImage
                                                            }
                                                        >

                                                            {item.foto ? (

                                                                <img
                                                                    src={
                                                                        item.foto.startsWith(
                                                                            "http"
                                                                        )
                                                                            ? item.foto
                                                                            : `http://localhost:3333/uploads/${item.foto}`
                                                                    }
                                                                    alt={
                                                                        item.nome
                                                                    }
                                                                />

                                                            ) : (

                                                                <FiPackage />

                                                            )}

                                                        </div>


                                                        <div
                                                            className={
                                                                styles.productInfo
                                                            }
                                                        >

                                                            <strong>
                                                                {
                                                                    item.nome
                                                                }
                                                            </strong>

                                                            <span>
                                                                Quantidade:{" "}
                                                                {
                                                                    item.quantidade
                                                                }
                                                            </span>

                                                        </div>


                                                        <div
                                                            className={
                                                                styles.productPrice
                                                            }
                                                        >

                                                            <span>
                                                                {
                                                                    formatarDinheiro(
                                                                        item.preco
                                                                    )
                                                                }{" "}
                                                                cada
                                                            </span>

                                                            <strong>
                                                                {
                                                                    formatarDinheiro(
                                                                        item.subtotal
                                                                    )
                                                                }
                                                            </strong>

                                                        </div>

                                                    </div>

                                                )
                                            )}

                                        </div>

                                    )}

                                </div>


                                {/* =================================================
                                    RESUMO
                                ================================================= */}

                                <div
                                    className={
                                        styles.summary
                                    }
                                >

                                    <div>

                                        <span>
                                            Subtotal
                                        </span>

                                        <strong>
                                            {
                                                formatarDinheiro(
                                                    calcularSubtotal(
                                                        pedidoSelecionado
                                                    )
                                                )
                                            }
                                        </strong>

                                    </div>


                                    <div>

                                        <span>
                                            Desconto
                                        </span>

                                        <strong>
                                            -{" "}
                                            {
                                                formatarDinheiro(
                                                    pedidoSelecionado.desconto
                                                )
                                            }
                                        </strong>

                                    </div>


                                    <div
                                        className={
                                            styles.total
                                        }
                                    >

                                        <span>
                                            Total
                                        </span>

                                        <strong>
                                            {
                                                formatarDinheiro(
                                                    pedidoSelecionado.total
                                                )
                                            }
                                        </strong>

                                    </div>

                                </div>


                                {/* =================================================
                                    CUPOM
                                ================================================= */}

                                {pedidoSelecionado.codigo_cupom && (

                                    <div
                                        className={
                                            styles.coupon
                                        }
                                    >

                                        Cupom utilizado:{" "}

                                        <strong>
                                            {
                                                pedidoSelecionado.codigo_cupom
                                            }
                                        </strong>

                                    </div>

                                )}

                            </>

                        )}

                    </div>

                </div>

            )}

        </div>

    );

}