import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    FiUser,
    FiMail,
    FiEdit2,
    FiSave,
    FiCamera,
    FiShield,
    FiCalendar,
    FiLogOut,
    FiPackage,
    FiX,
    FiCreditCard,
    FiClock
} from "react-icons/fi";

import Cabecalho from "../components/Cabeçalho-ADM/Cabecalho.jsx";
import HeaderUser from "../components/Cabeçalho-Users/index.jsx";

import { useAuth } from "../contexts/authContext";
import { api } from "../services/api.js";

import styles from "../styles/Perfil.module.css";

export default function Perfil() {

    const navigate = useNavigate();

    const {
        usuario,
        atualizarPerfil,
        logout
    } = useAuth();

    // =====================================================
    // ESTADOS
    // =====================================================

    const [editando, setEditando] = useState(false);

    const [form, setForm] = useState({
        nome: "",
        email: "",
        senha: ""
    });

    // =====================================================
    // HISTÓRICO DE PEDIDOS
    // =====================================================

    const [modalPedidos, setModalPedidos] = useState(false);

    const [pedidos, setPedidos] = useState([]);

    const [carregandoPedidos, setCarregandoPedidos] =
        useState(false);

    const [erroPedidos, setErroPedidos] = useState("");

    // =====================================================
    // ATUALIZAR FORMULÁRIO
    // =====================================================

    useEffect(() => {

        if (!usuario) {
            return;
        }

        setForm({
            nome: usuario.nome || "",
            email: usuario.email || "",
            senha: ""
        });

    }, [usuario]);

    // =====================================================
    // BUSCAR PEDIDOS
    // =====================================================

    async function buscarPedidos() {

        /*
         * Tenta encontrar o ID do usuário.
         *
         * Normalmente será:
         * usuario.id
         *
         * Mas deixamos usuario_id como alternativa.
         */

        const usuarioId =
            usuario?.id ??
            usuario?.usuario_id;

        console.log(
            "======================================"
        );

        console.log(
            "BUSCANDO HISTÓRICO"
        );

        console.log(
            "Usuário:",
            usuario
        );

        console.log(
            "ID do usuário:",
            usuarioId
        );

        console.log(
            "======================================"
        );

        if (!usuarioId) {

            console.error(
                "Não foi possível encontrar o ID do usuário."
            );

            setPedidos([]);

            setErroPedidos(
                "Não foi possível identificar o usuário."
            );

            return;

        }

        try {

            setCarregandoPedidos(true);

            setErroPedidos("");

            /*
             * Endpoint:
             *
             * GET /pedidos/usuario/:usuario_id
             */

            const endpoint =
                `/pedidos/usuario/${usuarioId}`;

            console.log(
                "Fazendo requisição:",
                endpoint
            );

            const resposta =
                await api.get(endpoint);

            console.log(
                "Status da API:",
                resposta.status
            );

            console.log(
                "Resposta da API:",
                resposta.data
            );

            let dados = resposta.data;

            // =================================================
            // CASO A API RETORNE DIRETAMENTE UM ARRAY
            // =================================================

            if (Array.isArray(dados)) {

                setPedidos(dados);

                console.log(
                    "Pedidos encontrados:",
                    dados.length
                );

                return;

            }

            // =================================================
            // CASO A API RETORNE:
            //
            // {
            //     pedidos: [...]
            // }
            // =================================================

            if (
                dados &&
                Array.isArray(dados.pedidos)
            ) {

                setPedidos(
                    dados.pedidos
                );

                console.log(
                    "Pedidos encontrados:",
                    dados.pedidos.length
                );

                return;

            }

            // =================================================
            // FORMATO INVÁLIDO
            // =================================================

            console.error(
                "Formato de resposta inválido:",
                dados
            );

            setPedidos([]);

            setErroPedidos(
                "A API retornou um formato inválido."
            );

        } catch (error) {

            console.error(
                "======================================"
            );

            console.error(
                "ERRO AO BUSCAR PEDIDOS"
            );

            console.error(
                error
            );

            console.error(
                "Status:",
                error.response?.status
            );

            console.error(
                "Resposta:",
                error.response?.data
            );

            console.error(
                "======================================"
            );

            setPedidos([]);

            setErroPedidos(

                error.response?.data?.erro ||

                error.response?.data?.message ||

                "Não foi possível carregar seus pedidos."

            );

        } finally {

            setCarregandoPedidos(false);

        }

    }

    // =====================================================
    // ABRIR HISTÓRICO
    // =====================================================

    async function abrirHistorico() {

        console.log(
            "Abrindo histórico de pedidos..."
        );

        setModalPedidos(true);

        /*
         * Limpa o estado anterior.
         */

        setPedidos([]);

        setErroPedidos("");

        /*
         * Busca novamente no banco.
         */

        await buscarPedidos();

    }

    // =====================================================
    // FECHAR HISTÓRICO
    // =====================================================

    function fecharHistorico() {

        setModalPedidos(false);

    }

    // =====================================================
    // SALVAR PERFIL
    // =====================================================

    async function salvarPerfil() {

        try {

            const resultado =
                await atualizarPerfil({

                    nome: form.nome,

                    email: form.email,

                    ...(form.senha && {
                        senha: form.senha
                    })

                });

            if (resultado?.sucesso) {

                setEditando(false);

                setForm(prev => ({

                    ...prev,

                    senha: ""

                }));

            }

        } catch (error) {

            console.error(
                "Erro ao atualizar perfil:",
                error
            );

        }

    }

    // =====================================================
    // ALTERAÇÃO DOS INPUTS
    // =====================================================

    function handleChange(e) {

        const {
            name,
            value
        } = e.target;

        setForm(prev => ({

            ...prev,

            [name]: value

        }));

    }

    // =====================================================
    // SAIR
    // =====================================================

    function sairConta() {

        logout();

        navigate("/login");

    }

    // =====================================================
    // FORMATAR DATA
    // =====================================================

    function formatarData(data) {

        if (!data) {
            return "-";
        }

        const dataConvertida =
            new Date(data);

        if (
            Number.isNaN(
                dataConvertida.getTime()
            )
        ) {

            return "-";

        }

        return dataConvertida.toLocaleDateString(
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

    // =====================================================
    // FORMATAR DINHEIRO
    // =====================================================

    function formatarPreco(valor) {

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
    // STATUS
    // =====================================================

    function classeStatus(status) {

        if (!status) {

            return styles.status;

        }

        const normalizado =
            String(status)
                .toLowerCase()
                .normalize("NFD")
                .replace(
                    /[\u0300-\u036f]/g,
                    ""
                );

        if (
            normalizado.includes("process") ||
            normalizado.includes("pend")
        ) {

            return `${styles.status} ${styles.pendente}`;

        }

        if (
            normalizado.includes("pago") ||
            normalizado.includes("aprov")
        ) {

            return `${styles.status} ${styles.pago}`;

        }

        if (
            normalizado.includes("enviado")
        ) {

            return `${styles.status} ${styles.enviado}`;

        }

        if (
            normalizado.includes("entreg")
        ) {

            return `${styles.status} ${styles.entregue}`;

        }

        if (
            normalizado.includes("cancel")
        ) {

            return `${styles.status} ${styles.cancelado}`;

        }

        return styles.status;

    }

    // =====================================================
    // HEADER
    // =====================================================

    const header =
        usuario?.tipo === "admin"
            ? <Cabecalho />
            : <HeaderUser />;

    // =====================================================
    // RENDER
    // =====================================================

    return (

        <div className={styles.page}>

            {header}

            <main className={styles.content}>

                {/* ==================================================
                    TOPO
                ================================================== */}

                <div className={styles.topo}>

                    <h1>
                        Meu perfil
                    </h1>

                    <p>
                        Gerencie suas informações pessoais e de acesso.
                    </p>

                </div>


                {/* ==================================================
                    CONTAINER
                ================================================== */}

                <div className={styles.container}>

                    {/* ==================================================
                        ESQUERDA
                    ================================================== */}

                    <section className={styles.leftCard}>

                        {/* AVATAR */}

                        <div className={styles.avatarBox}>

                            <div className={styles.avatar}>

                                {usuario?.nome
                                    ?.charAt(0)
                                    ?.toUpperCase() || "U"}

                            </div>

                            <button
                                className={styles.camera}
                                type="button"
                                title="Alterar foto"
                            >

                                <FiCamera />

                            </button>

                        </div>


                        {/* NOME */}

                        <h2
                            className={
                                styles.nomeUsuario
                            }
                        >

                            {usuario?.nome ||
                                "Usuário"}

                        </h2>


                        {/* EMAIL */}

                        <p
                            className={
                                styles.emailUsuario
                            }
                        >

                            {usuario?.email ||
                                "Sem e-mail"}

                        </p>


                        {/* FOTO */}

                        <button
                            className={
                                styles.photoBtn
                            }
                            type="button"
                        >

                            <FiCamera />

                            Alterar foto

                        </button>


                        <small>
                            PNG ou JPG. Tamanho máximo: 2MB.
                        </small>


                        {/* ==================================================
                            INFORMAÇÕES DA CONTA
                        ================================================== */}

                        <div
                            className={
                                styles.account
                            }
                        >

                            <h3>
                                Informações da conta
                            </h3>


                            {/* TIPO */}

                            <div
                                className={
                                    styles.row
                                }
                            >

                                <FiShield />

                                <div>

                                    <span>
                                        Tipo de conta
                                    </span>

                                    <strong
                                        className={
                                            styles.badge
                                        }
                                    >

                                        {usuario?.tipo ||
                                            "cliente"}

                                    </strong>

                                </div>

                            </div>


                            {/* ANO */}

                            <div
                                className={
                                    styles.row
                                }
                            >

                                <FiCalendar />

                                <div>

                                    <span>
                                        Ano
                                    </span>

                                    <strong>
                                        {
                                            new Date()
                                                .getFullYear()
                                        }
                                    </strong>

                                </div>

                            </div>


                            {/* PEDIDOS */}

                            <div
                                className={
                                    styles.row
                                }
                            >

                                <FiPackage />

                                <div>

                                    <span>
                                        Pedidos realizados
                                    </span>

                                    <strong>
                                        {pedidos.length}
                                    </strong>

                                </div>

                            </div>

                        </div>


                        {/* ==================================================
                            HISTÓRICO
                        ================================================== */}

                        <button
                            className={
                                styles.historyBtn
                            }
                            type="button"
                            onClick={
                                abrirHistorico
                            }
                        >

                            <FiPackage />

                            Histórico de pedidos

                        </button>


                        {/* ==================================================
                            LOGOUT
                        ================================================== */}

                        <button
                            className={
                                styles.logout
                            }
                            type="button"
                            onClick={
                                sairConta
                            }
                        >

                            <FiLogOut />

                            Sair da conta

                        </button>

                    </section>


                    {/* ==================================================
                        DIREITA
                    ================================================== */}

                    <section
                        className={
                            styles.rightCard
                        }
                    >

                        <div
                            className={
                                styles.titleEdit
                            }
                        >

                            <div>

                                <h3>
                                    Informações pessoais
                                </h3>

                                <p>
                                    Atualize seus dados pessoais.
                                </p>

                            </div>


                            <button
                                type="button"
                                onClick={

                                    editando

                                        ? salvarPerfil

                                        : () =>
                                            setEditando(
                                                true
                                            )

                                }
                            >

                                {editando ? (

                                    <>

                                        <FiSave />

                                        Salvar

                                    </>

                                ) : (

                                    <>

                                        <FiEdit2 />

                                        Editar

                                    </>

                                )}

                            </button>

                        </div>


                        {/* NOME */}

                        <label>
                            Nome completo
                        </label>

                        <div
                            className={
                                styles.inputBox
                            }
                        >

                            <FiUser />

                            <input
                                disabled={
                                    !editando
                                }
                                name="nome"
                                value={
                                    form.nome
                                }
                                onChange={
                                    handleChange
                                }
                            />

                        </div>


                        {/* EMAIL */}

                        <label>
                            E-mail
                        </label>

                        <div
                            className={
                                styles.inputBox
                            }
                        >

                            <FiMail />

                            <input
                                disabled={
                                    !editando
                                }
                                type="email"
                                name="email"
                                value={
                                    form.email
                                }
                                onChange={
                                    handleChange
                                }
                            />

                        </div>


                        {/* SENHA */}

                        {editando && (

                            <>

                                <label>
                                    Nova senha
                                </label>

                                <div
                                    className={
                                        styles.inputBox
                                    }
                                >

                                    <FiShield />

                                    <input
                                        type="password"
                                        name="senha"
                                        value={
                                            form.senha
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Digite uma nova senha"
                                    />

                                </div>

                            </>

                        )}

                    </section>

                </div>

            </main>


            {/* ==========================================================
                MODAL HISTÓRICO
            ========================================================== */}

            {modalPedidos && (

                <div
                    className={
                        styles.modalOverlay
                    }
                    onClick={
                        fecharHistorico
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

                        {/* ==================================================
                            HEADER
                        ================================================== */}

                        <div
                            className={
                                styles.modalHeader
                            }
                        >

                            <div>

                                <h2>
                                    Histórico de pedidos
                                </h2>

                                <p>
                                    Todos os seus pedidos realizados
                                </p>

                            </div>


                            <button
                                className={
                                    styles.closeModal
                                }
                                type="button"
                                onClick={
                                    fecharHistorico
                                }
                                aria-label="Fechar histórico"
                            >

                                <FiX />

                            </button>

                        </div>


                        {/* ==================================================
                            CONTEÚDO
                        ================================================== */}

                        <div
                            className={
                                styles.modalContent
                            }
                        >

                            {/* ==================================================
                                CARREGANDO
                            ================================================== */}

                            {carregandoPedidos && (

                                <div
                                    className={
                                        styles.estadoPedidos
                                    }
                                >

                                    <div
                                        className={
                                            styles.spinner
                                        }
                                    />

                                    <p>
                                        Carregando seus pedidos...
                                    </p>

                                </div>

                            )}


                            {/* ==================================================
                                ERRO
                            ================================================== */}

                            {!carregandoPedidos &&
                                erroPedidos && (

                                    <div
                                        className={
                                            styles.erroPedidos
                                        }
                                    >

                                        <FiPackage />

                                        <h3>
                                            Não foi possível carregar
                                        </h3>

                                        <p>
                                            {erroPedidos}
                                        </p>

                                        <button
                                            type="button"
                                            onClick={
                                                buscarPedidos
                                            }
                                        >

                                            Tentar novamente

                                        </button>

                                    </div>

                                )}


                            {/* ==================================================
                                NENHUM PEDIDO
                            ================================================== */}

                            {!carregandoPedidos &&
                                !erroPedidos &&
                                pedidos.length === 0 && (

                                    <div
                                        className={
                                            styles.semPedidos
                                        }
                                    >

                                        <FiPackage />

                                        <h3>
                                            Nenhum pedido encontrado
                                        </h3>

                                        <p>
                                            Você ainda não realizou nenhuma compra.
                                        </p>

                                        <button
                                            type="button"
                                            onClick={() => {

                                                fecharHistorico();

                                                navigate(
                                                    "/cliente/cores"
                                                );

                                            }}
                                        >

                                            Começar a comprar

                                        </button>

                                    </div>

                                )}


                            {/* ==================================================
                                PEDIDOS
                            ================================================== */}

                            {!carregandoPedidos &&
                                !erroPedidos &&
                                pedidos.length > 0 && (

                                    <div
                                        className={
                                            styles.listaPedidos
                                        }
                                    >

                                        {pedidos.map(
                                            pedido => (

                                                <div
                                                    className={
                                                        styles.pedido
                                                    }
                                                    key={
                                                        pedido.id
                                                    }
                                                >

                                                    {/* ==================================================
                                                        CABEÇALHO PEDIDO
                                                    ================================================== */}

                                                    <div
                                                        className={
                                                            styles.pedidoHeader
                                                        }
                                                    >

                                                        <div>

                                                            <div
                                                                className={
                                                                    styles.pedidoNumero
                                                                }
                                                            >

                                                                <FiPackage />

                                                                <strong>
                                                                    Pedido #
                                                                    {pedido.id}
                                                                </strong>

                                                            </div>


                                                            <span
                                                                className={
                                                                    styles.dataPedido
                                                                }
                                                            >

                                                                <FiClock />

                                                                {formatarData(
                                                                    pedido.criado_em
                                                                )}

                                                            </span>

                                                        </div>


                                                        <span
                                                            className={
                                                                classeStatus(
                                                                    pedido.status
                                                                )
                                                            }
                                                        >

                                                            {pedido.status ||
                                                                "Processando"}

                                                        </span>

                                                    </div>


                                                    {/* ==================================================
                                                        ITENS
                                                    ================================================== */}

                                                    <div
                                                        className={
                                                            styles.itensPedido
                                                        }
                                                    >

                                                        {Array.isArray(
                                                            pedido.itens
                                                        ) &&
                                                        pedido.itens.length > 0 ? (

                                                            pedido.itens.map(
                                                                item => (

                                                                    <div
                                                                        className={
                                                                            styles.itemPedido
                                                                        }
                                                                        key={
                                                                            item.id
                                                                        }
                                                                    >

                                                                        {/* IMAGEM */}

                                                                        <div
                                                                            className={
                                                                                styles.produtoImagem
                                                                            }
                                                                        >

                                                                            {item.foto ? (

                                                                                <img
                                                                                    src={`http://localhost:3333/uploads/${item.foto}`}
                                                                                    alt={
                                                                                        item.nome ||
                                                                                        "Produto"
                                                                                    }
                                                                                    onError={
                                                                                        e => {

                                                                                            e.currentTarget.style.display =
                                                                                                "none";

                                                                                        }
                                                                                    }
                                                                                />

                                                                            ) : (

                                                                                <FiPackage />

                                                                            )}

                                                                        </div>


                                                                        {/* INFORMAÇÕES */}

                                                                        <div
                                                                            className={
                                                                                styles.produtoInfo
                                                                            }
                                                                        >

                                                                            <strong>

                                                                                {item.nome ||
                                                                                    "Produto não encontrado"}

                                                                            </strong>

                                                                            <span>

                                                                                {Number(
                                                                                    item.quantidade ||
                                                                                    0
                                                                                )}

                                                                                x{" "}

                                                                                {formatarPreco(
                                                                                    item.preco
                                                                                )}

                                                                            </span>

                                                                        </div>


                                                                        {/* SUBTOTAL */}

                                                                        <strong
                                                                            className={
                                                                                styles.subtotal
                                                                            }
                                                                        >

                                                                            {formatarPreco(
                                                                                item.subtotal
                                                                            )}

                                                                        </strong>

                                                                    </div>

                                                                )

                                                            )

                                                        ) : (

                                                            <div
                                                                className={
                                                                    styles.semItens
                                                                }
                                                            >

                                                                <FiPackage />

                                                                <span>
                                                                    Nenhum item encontrado neste pedido.
                                                                </span>

                                                            </div>

                                                        )}

                                                    </div>


                                                    {/* ==================================================
                                                        RODAPÉ
                                                    ================================================== */}

                                                    <div
                                                        className={
                                                            styles.pedidoFooter
                                                        }
                                                    >

                                                        {/* PAGAMENTO */}

                                                        <div
                                                            className={
                                                                styles.pagamento
                                                            }
                                                        >

                                                            <FiCreditCard />

                                                            <span>
                                                                Pagamento:
                                                            </span>

                                                            <strong>

                                                                {pedido.metodo_pagamento ||
                                                                    "Não informado"}

                                                            </strong>

                                                        </div>


                                                        {/* TOTAL */}

                                                        <div
                                                            className={
                                                                styles.totalPedido
                                                            }
                                                        >

                                                            <span>
                                                                Total
                                                            </span>

                                                            <strong>

                                                                {formatarPreco(
                                                                    pedido.total
                                                                )}

                                                            </strong>

                                                        </div>

                                                    </div>

                                                </div>

                                            )
                                        )}

                                    </div>

                                )}

                        </div>

                    </div>

                </div>

            )}

        </div>

    );

}