import { useEffect, useMemo, useState } from "react";
import style from "../styles/Compra.module.css";

import { api } from "../services/api";
import { useAuth } from "../contexts/authContext";
import { useNavigate } from "react-router-dom";
import {
    FiArrowLeft,
    FiCreditCard,
    FiLock,
    FiShield,
    FiCheckCircle,
    FiEye,
    FiEyeOff,
    FiTrash2,
    FiPlus,
    FiZap,
    FiFileText,
    FiChevronDown
} from "react-icons/fi";
import Cabecalho from "../components/Cabeçalho-Users/index.jsx";

const CARTAO_VAZIO = {
    numero: "",
    nome: "",
    validade: "",
    cvv: "",
    cpf: "",
    parcelas: "1"
};

export default function Compra() {
    const { usuario } = useAuth();
    const navigate = useNavigate();

    const [produtos, setProdutos] = useState([]);
    const [pagamento, setPagamento] = useState("PIX");

    const [modal, setModal] = useState(false);
    const [modalSucesso, setModalSucesso] = useState(false);
    const [fidelidadeCompra, setFidelidadeCompra] = useState(null);
    const [salvandoCupom, setSalvandoCupom] = useState(false);
    const [cupomGuardado, setCupomGuardado] = useState(false);
    const [finalizando, setFinalizando] = useState(false);

    // =====================================================
    // CUPOM
    // =====================================================

    const [codigoCupom, setCodigoCupom] = useState("");
    const [cupom, setCupom] = useState(null);
    const [carregandoCupom, setCarregandoCupom] = useState(false);
    const [mensagemCupom, setMensagemCupom] = useState("");
    const [erroCupom, setErroCupom] = useState("");

    // =====================================================
    // CARTÃO
    // =====================================================

    const [cartao, setCartao] = useState(CARTAO_VAZIO);
    const [cartoesSalvos, setCartoesSalvos] = useState([]);
    const [cartaoSelecionado, setCartaoSelecionado] = useState(null);
    const [usarNovoCartao, setUsarNovoCartao] = useState(true);
    const [salvarCartao, setSalvarCartao] = useState(true);
    const [mostrarCvv, setMostrarCvv] = useState(false);
    const [cartaoVirado, setCartaoVirado] = useState(false);
    const [erroCartao, setErroCartao] = useState("");
    const [carregandoCartoes, setCarregandoCartoes] = useState(false);

    // =====================================================
    // BUSCAR CARRINHO
    // =====================================================

    async function buscarCarrinho() {
        if (!usuario?.id) return;

        try {
            const resposta = await api.get(`/carrinho/${usuario.id}`);
            setProdutos(resposta.data);
        } catch (error) {
            console.error("Erro ao buscar carrinho:", error);
        }
    }

    // =====================================================
    // BUSCAR CARTÕES SALVOS
    // =====================================================

    async function buscarCartoesSalvos() {
        if (!usuario?.id) return;

        try {
            setCarregandoCartoes(true);

            const resposta = await api.get(
                `/cartoes/usuario/${usuario.id}`
            );

            const lista = Array.isArray(resposta.data)
                ? resposta.data
                : [];

            setCartoesSalvos(lista);

            const principal =
                lista.find((item) => Boolean(item.principal)) ||
                lista[0];

            if (principal) {
                setCartaoSelecionado(principal);
                setUsarNovoCartao(false);
            }
        } catch (error) {
            console.error("Erro ao buscar cartões salvos:", error);
        } finally {
            setCarregandoCartoes(false);
        }
    }

    useEffect(() => {
        if (!usuario?.id) return;

        buscarCarrinho();
        buscarCartoesSalvos();
    }, [usuario?.id]);

    // =====================================================
    // CÁLCULOS
    // =====================================================

    const subtotal = useMemo(() => {
        return produtos.reduce((totalAtual, item) => {
            return (
                totalAtual +
                Number(item.preco) * Number(item.quantidade)
            );
        }, 0);
    }, [produtos]);

    const frete = subtotal > 0 ? 29.9 : 0;

    let desconto = 0;

    if (cupom) {
        if (
            cupom.tipo === "percentual" ||
            cupom.tipo === "porcentagem"
        ) {
            desconto = subtotal * (Number(cupom.valor) / 100);
        } else {
            desconto = Number(cupom.valor);
        }

        if (desconto > subtotal) {
            desconto = subtotal;
        }
    }

    const total = Math.max(subtotal + frete - desconto, 0);

    const valorParcela =
        Number(cartao.parcelas) > 0
            ? total / Number(cartao.parcelas)
            : total;

    // =====================================================
    // FORMATAÇÃO
    // =====================================================

    function formatarMoeda(valor) {
        return Number(valor).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });
    }

    function formatarNumeroCartao(valor) {
        const numeros = valor.replace(/\D/g, "").slice(0, 16);

        return numeros
            .replace(/(\d{4})(?=\d)/g, "$1 ")
            .trim();
    }

    function formatarValidade(valor) {
        const numeros = valor.replace(/\D/g, "").slice(0, 4);

        if (numeros.length <= 2) {
            return numeros;
        }

        return `${numeros.slice(0, 2)}/${numeros.slice(2)}`;
    }

    function formatarCpf(valor) {
        const numeros = valor.replace(/\D/g, "").slice(0, 11);

        return numeros
            .replace(/(\d{3})(\d)/, "$1.$2")
            .replace(/(\d{3})(\d)/, "$1.$2")
            .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    }

    function descobrirBandeira(numero) {
        const numeros = String(numero).replace(/\D/g, "");

        if (/^4/.test(numeros)) return "VISA";
        if (/^(5[1-5]|2[2-7])/.test(numeros)) return "MASTERCARD";
        if (/^3[47]/.test(numeros)) return "AMEX";
        if (/^(4011|4312|4389|4514|4576|5041|5066|5067|509|6277|6362|6363|650|6516|6550)/.test(numeros)) {
            return "ELO";
        }

        return "CARD";
    }

    function ultimosQuatro(numero) {
        return String(numero).replace(/\D/g, "").slice(-4);
    }

    // =====================================================
    // ALTERAR CARTÃO
    // =====================================================

    function alterarCartao(campo, valor) {
        setErroCartao("");

        let novoValor = valor;

        if (campo === "numero") {
            novoValor = formatarNumeroCartao(valor);
        }

        if (campo === "validade") {
            novoValor = formatarValidade(valor);
        }

        if (campo === "cvv") {
            novoValor = valor.replace(/\D/g, "").slice(0, 4);
        }

        if (campo === "cpf") {
            novoValor = formatarCpf(valor);
        }

        if (campo === "nome") {
            novoValor = valor.toUpperCase().slice(0, 30);
        }

        setCartao((anterior) => ({
            ...anterior,
            [campo]: novoValor
        }));
    }

    // =====================================================
    // VALIDAR CARTÃO
    // =====================================================

    function validarCartao() {
        if (cartaoSelecionado && !usarNovoCartao) {
            return true;
        }

        const numero = cartao.numero.replace(/\D/g, "");
        const cpf = cartao.cpf.replace(/\D/g, "");
        const [mesTexto, anoTexto] = cartao.validade.split("/");

        if (numero.length < 13) {
            setErroCartao("Digite um número de cartão válido.");
            return false;
        }

        if (cartao.nome.trim().length < 3) {
            setErroCartao("Digite o nome do titular do cartão.");
            return false;
        }

        if (!mesTexto || !anoTexto) {
            setErroCartao("Digite uma validade no formato MM/AA.");
            return false;
        }

        const mes = Number(mesTexto);
        const ano = 2000 + Number(anoTexto);
        const hoje = new Date();
        const ultimoDiaDoMes = new Date(ano, mes, 0, 23, 59, 59);

        if (mes < 1 || mes > 12 || ultimoDiaDoMes < hoje) {
            setErroCartao("A validade informada é inválida.");
            return false;
        }

        if (cartao.cvv.length < 3) {
            setErroCartao("Digite um CVV válido.");
            return false;
        }

        if (cpf.length !== 11) {
            setErroCartao("Digite um CPF válido para o titular.");
            return false;
        }

        setErroCartao("");
        return true;
    }

    // =====================================================
    // CUPOM
    // =====================================================

    async function aplicarCupom() {
        const codigo = codigoCupom.trim().toUpperCase();

        if (!codigo) {
            setErroCupom("Digite o código do cupom.");
            setMensagemCupom("");
            return;
        }

        try {
            setCarregandoCupom(true);
            setErroCupom("");
            setMensagemCupom("");
            setCupom(null);

            const resposta = await api.get(
                `/cupons/validar/${codigo}`
            );

            setCupom(resposta.data);
            setCodigoCupom(resposta.data.codigo);
            setMensagemCupom("Cupom aplicado com sucesso!");
        } catch (error) {
            console.error("Erro ao validar cupom:", error);

            setCupom(null);
            setErroCupom(
                error.response?.data?.mensagem ||
                    "Cupom inválido ou indisponível."
            );
        } finally {
            setCarregandoCupom(false);
        }
    }

    function removerCupom() {
        setCupom(null);
        setCodigoCupom("");
        setMensagemCupom("");
        setErroCupom("");
    }

    // =====================================================
    // SELECIONAR FORMA DE PAGAMENTO
    // =====================================================

    function escolherPagamento(tipo) {
        setPagamento(tipo);

        if (tipo !== "Cartão") {
            setCartaoVirado(false);
            setErroCartao("");
        }
    }

    // =====================================================
    // EXCLUIR CARTÃO SALVO
    // =====================================================

    async function excluirCartaoSalvo(id) {
        if (!usuario?.id) return;

        const confirmar = window.confirm(
            "Deseja remover este cartão salvo?"
        );

        if (!confirmar) return;

        try {
            await api.delete(`/cartoes/${id}`, {
                data: {
                    usuario_id: usuario.id
                }
            });

            const novaLista = cartoesSalvos.filter(
                (item) => item.id !== id
            );

            setCartoesSalvos(novaLista);

            if (cartaoSelecionado?.id === id) {
                const novoPrincipal = novaLista[0] || null;
                setCartaoSelecionado(novoPrincipal);
                setUsarNovoCartao(!novoPrincipal);
            }
        } catch (error) {
            console.error("Erro ao excluir cartão:", error);
            alert(
                error.response?.data?.erro ||
                    "Não foi possível remover o cartão."
            );
        }
    }

    // =====================================================
    // CONFIRMAR COMPRA
    // =====================================================

    function confirmarCompra() {
        if (produtos.length === 0) return;

        if (pagamento === "Cartão" && !validarCartao()) {
            document
                .getElementById("secao-cartao")
                ?.scrollIntoView({ behavior: "smooth", block: "center" });
            return;
        }

        setModal(true);
    }

    // =====================================================
    // SALVAR NOVO CARTÃO
    // =====================================================

    async function salvarNovoCartao() {
        if (!usuario?.id || !salvarCartao || !usarNovoCartao) {
            return null;
        }

        const numeroLimpo = cartao.numero.replace(/\D/g, "");
        const [mes, ano] = cartao.validade.split("/");

        // IMPORTANTE:
        // Em produção, troque este token temporário pelo token retornado
        // pelo SDK do seu gateway (Mercado Pago, Pagar.me, Stripe etc.).
        // Número completo e CVV NÃO são enviados para /cartoes.
        const tokenTemporario = `dev_card_${usuario.id}_${Date.now()}`;

        const resposta = await api.post("/cartoes", {
            usuario_id: usuario.id,
            token: tokenTemporario,
            bandeira: descobrirBandeira(numeroLimpo),
            ultimos_digitos: ultimosQuatro(numeroLimpo),
            nome_titular: cartao.nome.trim(),
            mes_validade: Number(mes),
            ano_validade: 2000 + Number(ano),
            principal: cartoesSalvos.length === 0
        });

        return resposta.data?.cartao || null;
    }

    // =====================================================
    // FINALIZAR COMPRA
    // =====================================================

    async function finalizar() {
        if (!usuario?.id) {
            setModal(false);
            alert("Usuário não identificado.");
            return;
        }

        if (pagamento === "Cartão" && !validarCartao()) {
            setModal(false);
            return;
        }

        try {
            setFinalizando(true);

            let cartaoUsadoId = cartaoSelecionado?.id || null;

            if (
                pagamento === "Cartão" &&
                usarNovoCartao &&
                salvarCartao
            ) {
                const salvo = await salvarNovoCartao();
                cartaoUsadoId = salvo?.id || null;
            }

            const chaveOrcamento =
                `orcamento_pendente_${usuario.id}`;
            const orcamentoPendente =
                Number(localStorage.getItem(chaveOrcamento));

            const resposta = await api.post("/pedidos", {
                usuario_id: usuario.id,
                metodo_pagamento: pagamento,
                cupom_id: cupom ? cupom.id : null,
                orcamento_id:
                    Number.isInteger(orcamentoPendente) &&
                    orcamentoPendente > 0
                        ? orcamentoPendente
                        : null,

                // Estes campos são opcionais para o seu backend atual.
                // Podem ser usados quando você integrar o gateway real.
                cartao_id:
                    pagamento === "Cartão"
                        ? cartaoUsadoId
                        : null,
                parcelas:
                    pagamento === "Cartão"
                        ? Number(cartao.parcelas)
                        : null
            });

            setFidelidadeCompra(
                resposta.data?.fidelidade || null
            );

            if (resposta.data?.orcamento?.convertido) {
                localStorage.removeItem(chaveOrcamento);
            }

            setModal(false);
            setModalSucesso(true);
        } catch (error) {
            console.error("Erro ao finalizar compra:", error);

            alert(
                error.response?.data?.mensagem ||
                    error.response?.data?.erro ||
                    "Erro ao finalizar compra."
            );
        } finally {
            setFinalizando(false);
        }
    }

    async function guardarCupomNoPerfil() {
        const cupomFidelidade = fidelidadeCompra?.cupom;

        if (!usuario?.id || !cupomFidelidade?.id) return;

        try {
            setSalvandoCupom(true);

            await api.post("/fidelidade/cupons/salvar", {
                usuario_id: usuario.id,
                cupom_id: cupomFidelidade.id
            });

            setCupomGuardado(true);
        } catch (error) {
            console.error("Erro ao guardar cupom:", error);
            alert(
                error.response?.data?.erro ||
                    "Não foi possível guardar o cupom."
            );
        } finally {
            setSalvandoCupom(false);
        }
    }

    // =====================================================
    // DADOS DA PRÉVIA DO CARTÃO
    // =====================================================

    const numeroPreview =
        cartao.numero || "•••• •••• •••• ••••";

    const nomePreview =
        cartao.nome.trim() || "NOME DO TITULAR";

    const validadePreview =
        cartao.validade || "MM/AA";

    const cvvPreview = cartao.cvv || "•••";

    const bandeiraPreview = descobrirBandeira(cartao.numero);

    return (
        <>
            <Cabecalho />

            <main className={style.container}>
                <div className={style.checkoutShell}>
                    <div className={style.pageHeader}>
                        <button
                            type="button"
                            className={style.backButton}
                            onClick={() => navigate(-1)}
                        >
                            <FiArrowLeft />
                            Voltar
                        </button>

                        <div className={style.titleGroup}>
                            <span className={style.eyebrow}>
                                Checkout seguro
                            </span>
                            <h1>Finalizar compra</h1>
                            <p>
                                Revise seu pedido e escolha a melhor forma de pagamento.
                            </p>
                        </div>

                        <div className={style.secureBadge}>
                            <FiShield />
                            Ambiente protegido
                        </div>
                    </div>

                    <div className={style.conteudo}>
                        <div className={style.colunaPrincipal}>
                            {/* PRODUTOS */}
                            <section className={style.cardSection}>
                                <div className={style.sectionHeader}>
                                    <div>
                                        <span className={style.sectionStep}>01</span>
                                        <h2>Seu pedido</h2>
                                    </div>
                                    <span className={style.itemCount}>
                                        {produtos.length} {produtos.length === 1 ? "item" : "itens"}
                                    </span>
                                </div>

                                {produtos.length === 0 ? (
                                    <div className={style.vazio}>
                                        Seu carrinho está vazio.
                                    </div>
                                ) : (
                                    <div className={style.listaProdutos}>
                                        {produtos.map((item) => (
                                            <div
                                                key={item.id}
                                                className={style.produto}
                                            >
                                                <img
                                                    src={`http://localhost:3333/${item.foto}`}
                                                    alt={item.nome}
                                                />

                                                <div className={style.produtoInfo}>
                                                    <h3>{item.nome}</h3>
                                                    <p>
                                                        Quantidade: {item.quantidade}
                                                    </p>
                                                </div>

                                                <strong>
                                                    {formatarMoeda(
                                                        Number(item.preco) *
                                                            Number(item.quantidade)
                                                    )}
                                                </strong>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </section>

                            {/* PAGAMENTO */}
                            <section
                                className={style.cardSection}
                                id="secao-cartao"
                            >
                                <div className={style.sectionHeader}>
                                    <div>
                                        <span className={style.sectionStep}>03</span>
                                        <h2>Forma de pagamento</h2>
                                    </div>
                                    <span className={style.securityText}>
                                        <FiLock /> Dados protegidos
                                    </span>
                                </div>

                                <div className={style.paymentGrid}>
                                    <button
                                        type="button"
                                        className={`${style.paymentOption} ${
                                            pagamento === "PIX"
                                                ? style.paymentOptionActive
                                                : ""
                                        }`}
                                        onClick={() => escolherPagamento("PIX")}
                                    >
                                        <span className={style.paymentIcon}>
                                            <FiZap />
                                        </span>
                                        <span>
                                            <strong>PIX</strong>
                                            <small>Aprovação imediata</small>
                                        </span>
                                        <span className={style.radioFake} />
                                    </button>

                                    <button
                                        type="button"
                                        className={`${style.paymentOption} ${
                                            pagamento === "Cartão"
                                                ? style.paymentOptionActive
                                                : ""
                                        }`}
                                        onClick={() => escolherPagamento("Cartão")}
                                    >
                                        <span className={style.paymentIcon}>
                                            <FiCreditCard />
                                        </span>
                                        <span>
                                            <strong>Cartão de crédito</strong>
                                            <small>Parcele sua compra</small>
                                        </span>
                                        <span className={style.radioFake} />
                                    </button>

                                    <button
                                        type="button"
                                        className={`${style.paymentOption} ${
                                            pagamento === "Boleto"
                                                ? style.paymentOptionActive
                                                : ""
                                        }`}
                                        onClick={() => escolherPagamento("Boleto")}
                                    >
                                        <span className={style.paymentIcon}>
                                            <FiFileText />
                                        </span>
                                        <span>
                                            <strong>Boleto</strong>
                                            <small>Até 3 dias úteis</small>
                                        </span>
                                        <span className={style.radioFake} />
                                    </button>
                                </div>

                                {pagamento === "PIX" && (
                                    <div className={style.infoPagamento}>
                                        <FiZap />
                                        <div>
                                            <strong>Pagamento por PIX</strong>
                                            <span>
                                                Após confirmar o pedido, você poderá exibir o QR Code do PIX.
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {pagamento === "Boleto" && (
                                    <div className={style.infoPagamento}>
                                        <FiFileText />
                                        <div>
                                            <strong>Pagamento por boleto</strong>
                                            <span>
                                                A confirmação pode levar até 3 dias úteis após o pagamento.
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {pagamento === "Cartão" && (
                                    <div className={style.creditArea}>
                                        {cartoesSalvos.length > 0 && (
                                            <div className={style.savedCardsBox}>
                                                <div className={style.savedCardsHeader}>
                                                    <div>
                                                        <strong>Cartões salvos</strong>
                                                        <span>
                                                            Escolha um cartão ou cadastre outro.
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className={style.savedCardsList}>
                                                    {cartoesSalvos.map((item) => (
                                                        <button
                                                            key={item.id}
                                                            type="button"
                                                            className={`${style.savedCard} ${
                                                                !usarNovoCartao &&
                                                                cartaoSelecionado?.id === item.id
                                                                    ? style.savedCardActive
                                                                    : ""
                                                            }`}
                                                            onClick={() => {
                                                                setCartaoSelecionado(item);
                                                                setUsarNovoCartao(false);
                                                                setErroCartao("");
                                                            }}
                                                        >
                                                            <span className={style.savedCardBrand}>
                                                                <FiCreditCard />
                                                            </span>

                                                            <span className={style.savedCardInfo}>
                                                                <strong>
                                                                    {item.bandeira || "Cartão"} •••• {item.ultimos_digitos}
                                                                </strong>
                                                                <small>
                                                                    Validade {String(item.mes_validade).padStart(2, "0")}/{String(item.ano_validade).slice(-2)}
                                                                </small>
                                                            </span>

                                                            {Boolean(item.principal) && (
                                                                <span className={style.principalBadge}>
                                                                    Principal
                                                                </span>
                                                            )}

                                                            <span
                                                                role="button"
                                                                tabIndex={0}
                                                                className={style.deleteCard}
                                                                onClick={(event) => {
                                                                    event.stopPropagation();
                                                                    excluirCartaoSalvo(item.id);
                                                                }}
                                                                onKeyDown={(event) => {
                                                                    if (event.key === "Enter") {
                                                                        event.stopPropagation();
                                                                        excluirCartaoSalvo(item.id);
                                                                    }
                                                                }}
                                                            >
                                                                <FiTrash2 />
                                                            </span>
                                                        </button>
                                                    ))}

                                                    <button
                                                        type="button"
                                                        className={`${style.savedCard} ${style.newCardButton} ${
                                                            usarNovoCartao
                                                                ? style.savedCardActive
                                                                : ""
                                                        }`}
                                                        onClick={() => {
                                                            setUsarNovoCartao(true);
                                                            setCartaoSelecionado(null);
                                                        }}
                                                    >
                                                        <span className={style.savedCardBrand}>
                                                            <FiPlus />
                                                        </span>
                                                        <span className={style.savedCardInfo}>
                                                            <strong>Usar outro cartão</strong>
                                                            <small>Adicionar um novo cartão</small>
                                                        </span>
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {carregandoCartoes && (
                                            <div className={style.loadingCards}>
                                                Carregando cartões salvos...
                                            </div>
                                        )}

                                        {usarNovoCartao ? (
                                            <div className={style.creditContent}>
                                                {/* PRÉVIA ANIMADA */}
                                                <div className={style.cardPreviewColumn}>
                                                    <div
                                                        className={`${style.creditCardScene} ${
                                                            cartaoVirado
                                                                ? style.creditCardSceneFlipped
                                                                : ""
                                                        }`}
                                                    >
                                                        <div className={style.creditCard3d}>
                                                            <div className={`${style.creditCardFace} ${style.creditCardFront}`}>
                                                                <div className={style.cardGlow} />

                                                                <div className={style.cardTop}>
                                                                    <span className={style.cardChip}>
                                                                        <span />
                                                                        <span />
                                                                        <span />
                                                                    </span>

                                                                    <span className={style.cardBrand}>
                                                                        {bandeiraPreview}
                                                                    </span>
                                                                </div>

                                                                <div className={style.cardNumber}>
                                                                    {numeroPreview}
                                                                </div>

                                                                <div className={style.cardBottom}>
                                                                    <div>
                                                                        <span>Titular</span>
                                                                        <strong>{nomePreview}</strong>
                                                                    </div>
                                                                    <div>
                                                                        <span>Validade</span>
                                                                        <strong>{validadePreview}</strong>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className={`${style.creditCardFace} ${style.creditCardBack}`}>
                                                                <div className={style.magneticStripe} />

                                                                <div className={style.cvvArea}>
                                                                    <span>CVV</span>
                                                                    <div>{cvvPreview}</div>
                                                                </div>

                                                                <div className={style.backBrand}>
                                                                    {bandeiraPreview}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className={style.previewHint}>
                                                        <FiShield />
                                                        A prévia acompanha os dados digitados em tempo real.
                                                    </div>
                                                </div>

                                                {/* FORMULÁRIO */}
                                                <div className={style.cardForm}>
                                                    <div className={style.formIntro}>
                                                        <div>
                                                            <span>Novo cartão</span>
                                                            <h3>Dados do cartão</h3>
                                                        </div>
                                                        <FiLock />
                                                    </div>

                                                    <div className={style.formGroup}>
                                                        <label htmlFor="numero-cartao">
                                                            Número do cartão
                                                        </label>
                                                        <div className={style.inputWithIcon}>
                                                            <FiCreditCard />
                                                            <input
                                                                id="numero-cartao"
                                                                type="text"
                                                                inputMode="numeric"
                                                                autoComplete="cc-number"
                                                                placeholder="0000 0000 0000 0000"
                                                                value={cartao.numero}
                                                                onChange={(event) =>
                                                                    alterarCartao("numero", event.target.value)
                                                                }
                                                                onFocus={() => setCartaoVirado(false)}
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className={style.formGroup}>
                                                        <label htmlFor="nome-cartao">
                                                            Nome impresso no cartão
                                                        </label>
                                                        <input
                                                            id="nome-cartao"
                                                            type="text"
                                                            autoComplete="cc-name"
                                                            placeholder="NOME DO TITULAR"
                                                            value={cartao.nome}
                                                            onChange={(event) =>
                                                                alterarCartao("nome", event.target.value)
                                                            }
                                                            onFocus={() => setCartaoVirado(false)}
                                                        />
                                                    </div>

                                                    <div className={style.formRow}>
                                                        <div className={style.formGroup}>
                                                            <label htmlFor="validade-cartao">
                                                                Validade
                                                            </label>
                                                            <input
                                                                id="validade-cartao"
                                                                type="text"
                                                                inputMode="numeric"
                                                                autoComplete="cc-exp"
                                                                placeholder="MM/AA"
                                                                value={cartao.validade}
                                                                onChange={(event) =>
                                                                    alterarCartao("validade", event.target.value)
                                                                }
                                                                onFocus={() => setCartaoVirado(false)}
                                                            />
                                                        </div>

                                                        <div className={style.formGroup}>
                                                            <label htmlFor="cvv-cartao">
                                                                CVV
                                                            </label>
                                                            <div className={style.passwordInput}>
                                                                <input
                                                                    id="cvv-cartao"
                                                                    type={mostrarCvv ? "text" : "password"}
                                                                    inputMode="numeric"
                                                                    autoComplete="cc-csc"
                                                                    placeholder="123"
                                                                    value={cartao.cvv}
                                                                    onChange={(event) =>
                                                                        alterarCartao("cvv", event.target.value)
                                                                    }
                                                                    onFocus={() => setCartaoVirado(true)}
                                                                    onBlur={() => setCartaoVirado(false)}
                                                                />
                                                                <button
                                                                    type="button"
                                                                    onMouseDown={(event) => event.preventDefault()}
                                                                    onClick={() => setMostrarCvv((valor) => !valor)}
                                                                    aria-label={mostrarCvv ? "Ocultar CVV" : "Mostrar CVV"}
                                                                >
                                                                    {mostrarCvv ? <FiEyeOff /> : <FiEye />}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className={style.formGroup}>
                                                        <label htmlFor="cpf-cartao">
                                                            CPF do titular
                                                        </label>
                                                        <input
                                                            id="cpf-cartao"
                                                            type="text"
                                                            inputMode="numeric"
                                                            placeholder="000.000.000-00"
                                                            value={cartao.cpf}
                                                            onChange={(event) =>
                                                                alterarCartao("cpf", event.target.value)
                                                            }
                                                            onFocus={() => setCartaoVirado(false)}
                                                        />
                                                    </div>

                                                    <div className={style.formGroup}>
                                                        <label htmlFor="parcelas-cartao">
                                                            Parcelamento
                                                        </label>
                                                        <div className={style.selectWrap}>
                                                            <select
                                                                id="parcelas-cartao"
                                                                value={cartao.parcelas}
                                                                onChange={(event) =>
                                                                    alterarCartao("parcelas", event.target.value)
                                                                }
                                                            >
                                                                {Array.from({ length: 12 }, (_, index) => index + 1).map((quantidade) => (
                                                                    <option
                                                                        key={quantidade}
                                                                        value={quantidade}
                                                                    >
                                                                        {quantidade}x de {formatarMoeda(total / quantidade)} sem juros
                                                                    </option>
                                                                ))}
                                                            </select>
                                                            <FiChevronDown />
                                                        </div>
                                                    </div>

                                                    <label className={style.saveCardCheck}>
                                                        <input
                                                            type="checkbox"
                                                            checked={salvarCartao}
                                                            onChange={(event) =>
                                                                setSalvarCartao(event.target.checked)
                                                            }
                                                        />
                                                        <span className={style.checkVisual}>
                                                            <FiCheckCircle />
                                                        </span>
                                                        <span>
                                                            <strong>Salvar cartão para próximas compras</strong>
                                                            <small>
                                                                Serão armazenados apenas dados seguros e o token do gateway. O CVV não é salvo.
                                                            </small>
                                                        </span>
                                                    </label>

                                                    {erroCartao && (
                                                        <div className={style.cardError}>
                                                            {erroCartao}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ) : (
                                            cartaoSelecionado && (
                                                <div className={style.selectedSavedCard}>
                                                    <div className={style.savedSelectedIcon}>
                                                        <FiCreditCard />
                                                    </div>
                                                    <div>
                                                        <span>Cartão selecionado</span>
                                                        <strong>
                                                            {cartaoSelecionado.bandeira || "Cartão"} •••• {cartaoSelecionado.ultimos_digitos}
                                                        </strong>
                                                        <small>
                                                            Validade {String(cartaoSelecionado.mes_validade).padStart(2, "0")}/{String(cartaoSelecionado.ano_validade).slice(-2)}
                                                        </small>
                                                    </div>
                                                    <FiCheckCircle className={style.selectedCheck} />
                                                </div>
                                            )
                                        )}
                                    </div>
                                )}
                            </section>
                        </div>

                        {/* CUPOM E RESUMO */}
                        <aside className={style.colunaResumo}>
                            <section className={`${style.cardSection} ${style.cupomResumo}`}>
                                <div className={style.sectionHeader}>
                                    <div>
                                        <span className={style.sectionStep}>02</span>
                                        <h2>Cupom de desconto</h2>
                                    </div>
                                </div>

                                {!cupom ? (
                                    <>
                                        <div className={style.cupomInput}>
                                            <input
                                                type="text"
                                                placeholder="Digite seu cupom"
                                                value={codigoCupom}
                                                onChange={(event) =>
                                                    setCodigoCupom(event.target.value)
                                                }
                                                onKeyDown={(event) => {
                                                    if (event.key === "Enter") {
                                                        aplicarCupom();
                                                    }
                                                }}
                                            />

                                            <button
                                                type="button"
                                                onClick={aplicarCupom}
                                                disabled={carregandoCupom}
                                            >
                                                {carregandoCupom
                                                    ? "Verificando..."
                                                    : "Aplicar"}
                                            </button>
                                        </div>

                                        {mensagemCupom && (
                                            <p className={style.sucesso}>{mensagemCupom}</p>
                                        )}

                                        {erroCupom && (
                                            <p className={style.erro}>{erroCupom}</p>
                                        )}
                                    </>
                                ) : (
                                    <div className={style.cupomAplicado}>
                                        <div>
                                            <FiCheckCircle />
                                            <span>
                                                <strong>{cupom.codigo}</strong>
                                                Cupom aplicado com sucesso
                                            </span>
                                        </div>

                                        <button type="button" onClick={removerCupom}>
                                            Remover
                                        </button>
                                    </div>
                                )}
                            </section>

                            <section className={style.resumo}>
                            <div className={style.summaryTop}>
                                <span>Resumo</span>
                                <FiLock />
                            </div>

                            <h2>Resumo da compra</h2>

                            <div className={style.summaryLine}>
                                <span>Subtotal</span>
                                <strong>{formatarMoeda(subtotal)}</strong>
                            </div>

                            <div className={style.summaryLine}>
                                <span>Frete</span>
                                <strong>{formatarMoeda(frete)}</strong>
                            </div>

                            {cupom && (
                                <div className={`${style.summaryLine} ${style.desconto}`}>
                                    <span>Desconto ({cupom.codigo})</span>
                                    <strong>-{formatarMoeda(desconto)}</strong>
                                </div>
                            )}

                            {pagamento === "Cartão" && (
                                <div className={style.installmentSummary}>
                                    <span>Parcelamento</span>
                                    <strong>
                                        {cartao.parcelas}x de {formatarMoeda(valorParcela)}
                                    </strong>
                                </div>
                            )}

                            <hr />

                            <div className={style.total}>
                                <span>Total</span>
                                <strong>{formatarMoeda(total)}</strong>
                            </div>

                            <button
                                type="button"
                                className={style.finalizar}
                                onClick={confirmarCompra}
                                disabled={produtos.length === 0}
                            >
                                <FiLock />
                                Finalizar compra
                            </button>

                            <div className={style.secureFooter}>
                                <FiShield />
                                <span>
                                    Seus dados são protegidos durante todo o checkout.
                                </span>
                            </div>
                            </section>
                        </aside>
                    </div>
                </div>

                {/* MODAL CONFIRMAR */}
                {modal && (
                    <div className={style.modalOverlay}>
                        <div className={style.modal}>
                            <div className={style.modalIcon}>
                                <FiShield />
                            </div>

                            <h2>Confirmar compra</h2>
                            <p>
                                Confira os dados antes de finalizar seu pedido.
                            </p>

                            <div className={style.modalData}>
                                <span>Forma de pagamento</span>
                                <strong>{pagamento}</strong>
                            </div>

                            {pagamento === "Cartão" && (
                                <div className={style.modalData}>
                                    <span>Cartão</span>
                                    <strong>
                                        {!usarNovoCartao && cartaoSelecionado
                                            ? `${cartaoSelecionado.bandeira || "Cartão"} •••• ${cartaoSelecionado.ultimos_digitos}`
                                            : `${bandeiraPreview} •••• ${ultimosQuatro(cartao.numero) || "----"}`}
                                    </strong>
                                </div>
                            )}

                            {pagamento === "Cartão" && (
                                <div className={style.modalData}>
                                    <span>Parcelas</span>
                                    <strong>
                                        {cartao.parcelas}x de {formatarMoeda(valorParcela)}
                                    </strong>
                                </div>
                            )}

                            {cupom && (
                                <div className={style.modalData}>
                                    <span>Cupom</span>
                                    <strong>{cupom.codigo}</strong>
                                </div>
                            )}

                            <div className={style.modalData}>
                                <span>Total</span>
                                <strong>{formatarMoeda(total)}</strong>
                            </div>

                            <div className={style.modalActions}>
                                <button
                                    type="button"
                                    onClick={() => setModal(false)}
                                    disabled={finalizando}
                                >
                                    Voltar
                                </button>

                                <button
                                    type="button"
                                    onClick={finalizar}
                                    disabled={finalizando}
                                >
                                    {finalizando
                                        ? "Processando..."
                                        : "Confirmar compra"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* MODAL SUCESSO */}
                {modalSucesso && (
                    <div className={style.modalSucessoOverlay}>
                        <div className={style.modalSucesso}>
                            <div className={style.iconeSucesso}>✓</div>

                            <h2>Compra realizada!</h2>
                            <p>
                                Seu pedido foi realizado com sucesso. Obrigado pela sua compra!
                            </p>

                            <div className={style.resumoSucesso}>
                                <div>
                                    <span>Forma de pagamento</span>
                                    <strong>{pagamento}</strong>
                                </div>

                                {pagamento === "Cartão" && (
                                    <div>
                                        <span>Parcelamento</span>
                                        <strong>{cartao.parcelas}x</strong>
                                    </div>
                                )}

                                <div>
                                    <span>Total</span>
                                    <strong>{formatarMoeda(total)}</strong>
                                </div>

                                {fidelidadeCompra && (
                                    <div>
                                        <span>Pontos recebidos</span>
                                        <strong>
                                            +{fidelidadeCompra.pontos_ganhos}
                                        </strong>
                                    </div>
                                )}

                                {fidelidadeCompra?.cupom && (
                                    <div>
                                        <span>
                                            Cupom {fidelidadeCompra.cupom.rank}
                                        </span>
                                        <strong>
                                            {fidelidadeCompra.cupom.codigo}
                                        </strong>
                                    </div>
                                )}
                            </div>

                            {fidelidadeCompra?.cupom && (
                                <button
                                    type="button"
                                    className={style.botaoGuardarCupom}
                                    onClick={guardarCupomNoPerfil}
                                    disabled={salvandoCupom || cupomGuardado}
                                >
                                    {cupomGuardado
                                        ? "Cupom guardado no perfil"
                                        : salvandoCupom
                                          ? "Guardando..."
                                          : "Guardar cupom no perfil"}
                                </button>
                            )}

                            <button
                                type="button"
                                className={style.botaoSucesso}
                                onClick={() => navigate("/cliente/inicio")}
                            >
                                Continuar
                            </button>
                        </div>
                    </div>
                )}
            </main>
        </>
    );
}
