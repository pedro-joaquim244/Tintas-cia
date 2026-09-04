import { useEffect, useMemo, useState } from "react";
import style from "../styles/compra.module.css";

import { api } from "../services/api";
import { useAuth } from "../contexts/authContext";
import { useLocation, useNavigate } from "react-router-dom";
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
    FiChevronDown,
    FiCopy,
    FiRefreshCw,
    FiClock,
    FiExternalLink,
    FiDownload,
    FiX,
    FiTruck,
    FiPackage,
    FiMapPin,
    FiAlertCircle
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

function normalizarFretePersistido(dados) {
    if (!dados || typeof dados !== "object") {
        return null;
    }

    const tipoEntrega = String(
        dados.tipo_entrega || (dados.retirada ? "RETIRADA" : "ENTREGA")
    )
        .trim()
        .toUpperCase();

    if (tipoEntrega !== "ENTREGA" && tipoEntrega !== "RETIRADA") {
        return null;
    }

    const subtotalReferencia = Number(
        dados.subtotal_calculado ?? dados.subtotal_referencia
    );

    if (!Number.isFinite(subtotalReferencia) || subtotalReferencia < 0) {
        return null;
    }

    return {
        ...dados,
        disponivel: dados.disponivel !== false,
        tipo_entrega: tipoEntrega,
        retirada: tipoEntrega === "RETIRADA",
        subtotal_calculado: subtotalReferencia,
        subtotal_referencia: subtotalReferencia,
        valor_frete: Number(dados.valor_frete || 0)
    };
}

export default function Compra() {
    const { usuario } = useAuth();
    const location = useLocation();
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
    // PIX / MERCADO PAGO
    // =====================================================

    const [pix, setPix] = useState(null);
    const [modalPix, setModalPix] = useState(false);
    const [copiadoPix, setCopiadoPix] = useState(false);
    const [verificandoPix, setVerificandoPix] = useState(false);

    // =====================================================
    // BOLETO / MERCADO PAGO
    // =====================================================

    const [boleto, setBoleto] = useState(null);
    const [modalBoleto, setModalBoleto] = useState(false);
    const [copiadoBoleto, setCopiadoBoleto] = useState(false);
    const [cpfBoleto, setCpfBoleto] = useState("");
    const [cepBoleto, setCepBoleto] = useState("");
    const [erroBoleto, setErroBoleto] = useState("");

    // =====================================================
    // CUPOM
    // =====================================================

    const [codigoCupom, setCodigoCupom] = useState("");
    const [cupom, setCupom] = useState(null);
    const [carregandoCupom, setCarregandoCupom] = useState(false);
    const [mensagemCupom, setMensagemCupom] = useState("");
    const [erroCupom, setErroCupom] = useState("");

    // =====================================================
    // FRETE
    // =====================================================

    const [tipoEntrega, setTipoEntrega] = useState("ENTREGA");
    const [ruaFrete, setRuaFrete] = useState("");
    const [numeroFrete, setNumeroFrete] = useState("");
    const [bairroFrete, setBairroFrete] = useState("");
    const [cidadeFrete, setCidadeFrete] = useState("");
    const [estadoFrete, setEstadoFrete] = useState("");
    const [freteResultado, setFreteResultado] = useState(null);
    const [calculandoFrete, setCalculandoFrete] = useState(false);
    const [erroFrete, setErroFrete] = useState("");
    const [totalPedidoConfirmado, setTotalPedidoConfirmado] = useState(null);

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
            const dados = resposta.data;

            if (Array.isArray(dados)) {
                setProdutos(dados);
            } else if (Array.isArray(dados?.itens)) {
                setProdutos(dados.itens);
            } else if (Array.isArray(dados?.produtos)) {
                setProdutos(dados.produtos);
            } else {
                setProdutos([]);
            }
        } catch (error) {
            console.error("Erro ao buscar carrinho:", error);
            setProdutos([]);
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

    useEffect(() => {
        if (!usuario?.cep) return;

        setCepBoleto((valorAtual) =>
            valorAtual || String(usuario.cep).replace(/\D/g, "").slice(0, 8)
        );
    }, [usuario?.cep]);

    // =====================================================
    // RECUPERAR O FRETE ESCOLHIDO NO CARRINHO
    // =====================================================

    useEffect(() => {
        if (!usuario?.id) return;

        let dadosFrete = null;

        try {
            const salvo = localStorage.getItem(
                `frete_checkout_${usuario.id}`
            );

            dadosFrete = salvo ? JSON.parse(salvo) : null;
        } catch (error) {
            console.error("Erro ao recuperar frete do carrinho:", error);
            localStorage.removeItem(`frete_checkout_${usuario.id}`);
        }

        dadosFrete = dadosFrete || location.state?.frete || null;

        const freteSalvo = normalizarFretePersistido(dadosFrete);

        if (freteSalvo) {
            setTipoEntrega(freteSalvo.tipo_entrega);
            setRuaFrete(
                String(
                    freteSalvo.rua ||
                        freteSalvo.endereco ||
                        usuario.endereco ||
                        ""
                ).trim()
            );
            setNumeroFrete(
                String(freteSalvo.numero || usuario.numero || "").trim()
            );
            setBairroFrete(
                String(freteSalvo.bairro || usuario.bairro || "").trim()
            );
            setCidadeFrete(
                freteSalvo.tipo_entrega === "ENTREGA"
                    ? String(freteSalvo.cidade || usuario.cidade || "").trim()
                    : String(usuario.cidade || "").trim()
            );
            setEstadoFrete(
                freteSalvo.tipo_entrega === "ENTREGA"
                    ? String(freteSalvo.estado || usuario.estado || "")
                          .trim()
                          .toUpperCase()
                    : String(usuario.estado || "").trim().toUpperCase()
            );
            setFreteResultado(freteSalvo);
            setErroFrete("");
            return;
        }

        setRuaFrete((valorAtual) =>
            valorAtual || String(usuario.endereco || "").trim()
        );
        setNumeroFrete((valorAtual) =>
            valorAtual || String(usuario.numero || "").trim()
        );
        setBairroFrete((valorAtual) =>
            valorAtual || String(usuario.bairro || "").trim()
        );
        setCidadeFrete((valorAtual) =>
            valorAtual || String(usuario.cidade || "").trim()
        );
        setEstadoFrete((valorAtual) =>
            valorAtual || String(usuario.estado || "").trim().toUpperCase()
        );
    }, [
        usuario?.id,
        usuario?.endereco,
        usuario?.numero,
        usuario?.bairro,
        usuario?.cidade,
        usuario?.estado,
        location.state
    ]);

    // =====================================================
    // VERIFICAR PIX AUTOMATICAMENTE
    // =====================================================

    useEffect(() => {
        if (!modalPix || !pix?.order_id) return;

        const intervalo = window.setInterval(() => {
            verificarPagamentoPix(false);
        }, 7000);

        return () => {
            window.clearInterval(intervalo);
        };
    }, [modalPix, pix?.order_id]);

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

    const subtotalFrete = Number(
        freteResultado?.subtotal_calculado ??
            freteResultado?.subtotal_referencia
    );

    const valorFreteCalculado = Number(freteResultado?.valor_frete || 0);

    const enderecoEntregaCompleto =
        tipoEntrega === "RETIRADA" ||
        Boolean(
            ruaFrete.trim() &&
                numeroFrete.trim() &&
                bairroFrete.trim() &&
                cidadeFrete.trim() &&
                estadoFrete.trim().length === 2
        );

    const fretePronto =
        Boolean(freteResultado?.disponivel) &&
        enderecoEntregaCompleto &&
        Number.isFinite(subtotalFrete) &&
        Math.round(subtotalFrete * 100) === Math.round(subtotal * 100) &&
        Number.isFinite(valorFreteCalculado) &&
        valorFreteCalculado >= 0;

    const frete = fretePronto ? valorFreteCalculado : 0;

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

    function formatarCep(valor) {
        const numeros = String(valor || "")
            .replace(/\D/g, "")
            .slice(0, 8);

        return numeros.replace(/(\d{5})(\d)/, "$1-$2");
    }

    function formatarVencimentoBoleto(valor) {
        if (!valor) return "Não informado";

        const data = new Date(valor);

        if (Number.isNaN(data.getTime())) {
            return "Não informado";
        }

        return data.toLocaleDateString("pt-BR");
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
    // FRETE
    // =====================================================

    function formatarPrazoFrete(resultado) {
        if (!resultado) return "";

        if (
            resultado.retirada ||
            resultado.tipo_entrega === "RETIRADA"
        ) {
            return "Retirada disponível em até 1 dia útil.";
        }

        const prazoMin = Number(resultado.prazo_min || 0);
        const prazoMax = Number(resultado.prazo_max || prazoMin);

        if (prazoMin <= 0 && prazoMax <= 0) return "";

        if (prazoMin === prazoMax) {
            return prazoMin === 1 ? "1 dia útil" : `${prazoMin} dias úteis`;
        }

        return `${prazoMin} a ${prazoMax} dias úteis`;
    }

    function salvarFreteCheckout(resultado) {
        if (!usuario?.id || !resultado) return null;

        const tipoResultado = String(
            resultado.tipo_entrega || tipoEntrega
        )
            .trim()
            .toUpperCase();

        const dadosFrete = {
            disponivel: true,
            tipo_entrega: tipoResultado,
            retirada: tipoResultado === "RETIRADA",
            rua:
                tipoResultado === "ENTREGA" ? ruaFrete.trim() : null,
            endereco:
                tipoResultado === "ENTREGA" ? ruaFrete.trim() : null,
            numero:
                tipoResultado === "ENTREGA" ? numeroFrete.trim() : null,
            bairro:
                tipoResultado === "ENTREGA" ? bairroFrete.trim() : null,
            cidade:
                tipoResultado === "ENTREGA"
                    ? String(resultado.cidade || cidadeFrete).trim()
                    : null,
            estado:
                tipoResultado === "ENTREGA"
                    ? String(resultado.estado || estadoFrete)
                          .trim()
                          .toUpperCase()
                    : null,
            valor_original: Number(resultado.valor_original || 0),
            valor_frete: Number(resultado.valor_frete || 0),
            frete_gratis: Boolean(resultado.frete_gratis),
            frete_gratis_acima:
                resultado.frete_gratis_acima ?? null,
            falta_para_frete_gratis:
                resultado.falta_para_frete_gratis ?? null,
            prazo_min: Number(resultado.prazo_min || 0),
            prazo_max: Number(resultado.prazo_max || 0),
            prazo_texto: formatarPrazoFrete(resultado),
            subtotal_calculado: Number(subtotal || 0),
            subtotal_referencia: Number(subtotal || 0)
        };

        localStorage.setItem(
            `frete_checkout_${usuario.id}`,
            JSON.stringify(dadosFrete)
        );

        return dadosFrete;
    }

    function limparFreteCalculado() {
        setFreteResultado(null);
        setErroFrete("");

        if (usuario?.id) {
            localStorage.removeItem(`frete_checkout_${usuario.id}`);
        }
    }

    async function calcularFrete(tipo = tipoEntrega, silencioso = false) {
        if (produtos.length === 0 || subtotal <= 0) return null;

        const tipoNormalizado = String(tipo || "ENTREGA")
            .trim()
            .toUpperCase();
        const endereco = ruaFrete.trim();
        const numero = numeroFrete.trim();
        const bairro = bairroFrete.trim();
        const cidade = cidadeFrete.trim();
        const estado = estadoFrete.trim().toUpperCase();

        if (
            tipoNormalizado === "ENTREGA" &&
            (!endereco || !numero || !bairro || !cidade || !estado)
        ) {
            setErroFrete(
                "Informe rua, número, bairro, cidade e UF para calcular o frete."
            );
            setFreteResultado(null);
            return null;
        }

        if (tipoNormalizado === "ENTREGA" && estado.length !== 2) {
            setErroFrete("Informe uma UF válida. Ex.: SP.");
            setFreteResultado(null);
            return null;
        }

        try {
            if (!silencioso) setCalculandoFrete(true);

            setErroFrete("");

            const payload = {
                tipo_entrega: tipoNormalizado,
                subtotal: Number(subtotal)
            };

            if (tipoNormalizado === "ENTREGA") {
                payload.cidade = cidade;
                payload.estado = estado;
            }

            const resposta = await api.post("/frete/calcular", payload);
            const resultado = resposta.data;

            if (!resultado?.disponivel) {
                setFreteResultado(null);
                setErroFrete(
                    resultado?.erro ||
                        "Não foi possível calcular o frete para este endereço."
                );
                return null;
            }

            const resultadoComSubtotal = {
                ...resultado,
                subtotal_calculado: Number(subtotal),
                subtotal_referencia: Number(subtotal)
            };

            setFreteResultado(resultadoComSubtotal);
            salvarFreteCheckout(resultadoComSubtotal);

            return resultadoComSubtotal;
        } catch (error) {
            console.error(
                "Erro ao calcular frete:",
                error.response?.data || error
            );

            setFreteResultado(null);
            setErroFrete(
                error.response?.data?.erro ||
                    "Não foi possível calcular o frete para este endereço."
            );

            if (usuario?.id) {
                localStorage.removeItem(`frete_checkout_${usuario.id}`);
            }

            return null;
        } finally {
            if (!silencioso) setCalculandoFrete(false);
        }
    }

    async function selecionarTipoEntrega(novoTipo) {
        const tipo = String(novoTipo || "ENTREGA")
            .trim()
            .toUpperCase();

        if (tipo === tipoEntrega && fretePronto) return;

        setTipoEntrega(tipo);
        limparFreteCalculado();

        if (tipo === "RETIRADA") {
            await calcularFrete("RETIRADA");
        }
    }

    useEffect(() => {
        if (!freteResultado?.disponivel || subtotal <= 0) return;

        const subtotalAnterior = Number(
            freteResultado.subtotal_calculado ??
                freteResultado.subtotal_referencia
        );

        if (
            Number.isFinite(subtotalAnterior) &&
            Math.round(subtotalAnterior * 100) === Math.round(subtotal * 100)
        ) {
            return;
        }

        const temporizador = window.setTimeout(() => {
            calcularFrete(tipoEntrega, true);
        }, 300);

        return () => window.clearTimeout(temporizador);
    }, [subtotal]);

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
                `/cupons/validar/${codigo}`,
                {
                    params: {
                        usuario_id: usuario?.id
                    }
                }
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

        if (tipo !== "Boleto") {
            setErroBoleto("");
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

        if (!fretePronto) {
            setErroFrete(
                tipoEntrega === "RETIRADA"
                    ? "Selecione novamente a retirada na loja."
                    : "Calcule o frete antes de finalizar a compra."
            );
            document
                .getElementById("secao-frete")
                ?.scrollIntoView({ behavior: "smooth", block: "center" });
            return;
        }

        if (pagamento === "Cartão" && !validarCartao()) {
            document
                .getElementById("secao-cartao")
                ?.scrollIntoView({ behavior: "smooth", block: "center" });
            return;
        }

        if (pagamento === "Boleto") {
            const cpfLimpo = cpfBoleto.replace(/\D/g, "");
            const cepLimpo = cepBoleto.replace(/\D/g, "");

            const enderecoBoleto =
                ruaFrete.trim() || String(usuario?.endereco || "").trim();
            const numeroBoleto =
                numeroFrete.trim() || String(usuario?.numero || "").trim();
            const bairroBoleto =
                bairroFrete.trim() || String(usuario?.bairro || "").trim();
            const cidadeBoleto =
                cidadeFrete.trim() || String(usuario?.cidade || "").trim();
            const estadoBoleto =
                estadoFrete.trim().toUpperCase() ||
                String(usuario?.estado || "").trim().toUpperCase();

            if (cpfLimpo.length !== 11) {
                setErroBoleto("Digite um CPF válido para gerar o boleto.");
                document
                    .getElementById("secao-boleto")
                    ?.scrollIntoView({ behavior: "smooth", block: "center" });
                return;
            }

            if (cepLimpo.length !== 8) {
                setErroBoleto("Digite um CEP válido para gerar o boleto.");
                document
                    .getElementById("secao-boleto")
                    ?.scrollIntoView({ behavior: "smooth", block: "center" });
                return;
            }

            if (
                !enderecoBoleto ||
                !numeroBoleto ||
                !bairroBoleto ||
                !cidadeBoleto ||
                estadoBoleto.length !== 2
            ) {
                setErroBoleto(
                    "Complete o endereço de entrega ou o endereço do seu perfil para gerar o boleto."
                );
                document
                    .getElementById("secao-boleto")
                    ?.scrollIntoView({ behavior: "smooth", block: "center" });
                return;
            }

            setErroBoleto("");
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
    // PIX - COPIAR CÓDIGO
    // =====================================================

    async function copiarCodigoPix() {
        if (!pix?.qr_code) return;

        try {
            await navigator.clipboard.writeText(pix.qr_code);

            setCopiadoPix(true);

            window.setTimeout(() => {
                setCopiadoPix(false);
            }, 2500);
        } catch (error) {
            console.error("Erro ao copiar PIX:", error);

            const campoTemporario = document.createElement("textarea");
            campoTemporario.value = pix.qr_code;
            document.body.appendChild(campoTemporario);
            campoTemporario.select();
            document.execCommand("copy");
            document.body.removeChild(campoTemporario);

            setCopiadoPix(true);

            window.setTimeout(() => {
                setCopiadoPix(false);
            }, 2500);
        }
    }

    // =====================================================
    // BOLETO - COPIAR LINHA DIGITÁVEL
    // =====================================================

    async function copiarLinhaBoleto() {
        if (!boleto?.linha_digitavel) return;

        try {
            await navigator.clipboard.writeText(
                boleto.linha_digitavel
            );

            setCopiadoBoleto(true);

            window.setTimeout(() => {
                setCopiadoBoleto(false);
            }, 2500);
        } catch (error) {
            console.error("Erro ao copiar linha digitável:", error);

            const campoTemporario = document.createElement("textarea");
            campoTemporario.value = boleto.linha_digitavel;
            document.body.appendChild(campoTemporario);
            campoTemporario.select();
            document.execCommand("copy");
            document.body.removeChild(campoTemporario);

            setCopiadoBoleto(true);

            window.setTimeout(() => {
                setCopiadoBoleto(false);
            }, 2500);
        }
    }

    // =====================================================
    // BOLETO - BAIXAR PDF
    // =====================================================

    function baixarBoletoPdf() {
        if (!boleto) return;

        const pagamentoBoleto =
            boleto?.dados?.transactions?.payments?.[0] || {};

        const valorBoleto = formatarMoeda(
            Number(
                boleto?.valor ||
                    totalPedidoConfirmado ||
                    total ||
                    0
            )
        );

        const vencimentoBoleto =
            formatarVencimentoBoleto(
                pagamentoBoleto?.date_of_expiration
            );

        const referenciaBoleto =
            boleto?.external_reference ||
            boleto?.order_id ||
            "boleto";

        const linhaDigitavel =
            boleto?.linha_digitavel ||
            pagamentoBoleto?.payment_method?.digitable_line ||
            "Não informada";

        const codigoBarras =
            boleto?.codigo_barras ||
            pagamentoBoleto?.payment_method?.barcode_content ||
            "Não informado";

        const boletoUrl =
            boleto?.boleto_url ||
            boleto?.ticket_url ||
            "";

        function normalizarTextoPdf(valor) {
            return String(valor ?? "")
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .replace(/[^\x20-\x7E]/g, " ")
                .replace(/\s+/g, " ")
                .trim();
        }

        function escaparTextoPdf(valor) {
            return normalizarTextoPdf(valor)
                .replace(/\\/g, "\\\\")
                .replace(/\(/g, "\\(")
                .replace(/\)/g, "\\)");
        }

        function quebrarTextoPdf(valor, limite = 78) {
            const texto = normalizarTextoPdf(valor);

            if (!texto) {
                return [""];
            }

            const palavras = texto.split(" ");
            const linhas = [];
            let atual = "";

            for (const palavraOriginal of palavras) {
                let palavra = palavraOriginal;

                while (palavra.length > limite) {
                    if (atual) {
                        linhas.push(atual);
                        atual = "";
                    }

                    linhas.push(
                        palavra.slice(0, limite)
                    );

                    palavra =
                        palavra.slice(limite);
                }

                const tentativa =
                    atual
                        ? `${atual} ${palavra}`
                        : palavra;

                if (
                    tentativa.length >
                    limite
                ) {
                    if (atual) {
                        linhas.push(atual);
                    }

                    atual = palavra;
                } else {
                    atual = tentativa;
                }
            }

            if (atual) {
                linhas.push(atual);
            }

            return linhas.length
                ? linhas
                : [""];
        }

        const linhasPdf = [
            {
                texto: "PIXEL COLOR",
                tamanho: 20,
                espaco: 30
            },
            {
                texto: "BOLETO BANCARIO",
                tamanho: 15,
                espaco: 25
            },
            {
                texto: "Dados de pagamento emitidos pelo Mercado Pago",
                tamanho: 10,
                espaco: 28
            },
            {
                texto: `Referencia: ${referenciaBoleto}`,
                tamanho: 11,
                espaco: 19
            },
            {
                texto: `Status: Aguardando pagamento`,
                tamanho: 11,
                espaco: 19
            },
            {
                texto: `Valor: ${valorBoleto}`,
                tamanho: 12,
                espaco: 21
            },
            {
                texto: `Vencimento: ${vencimentoBoleto}`,
                tamanho: 11,
                espaco: 28
            },
            {
                texto: "Linha digitavel:",
                tamanho: 11,
                espaco: 18
            },
            ...quebrarTextoPdf(
                linhaDigitavel,
                72
            ).map((linha) => ({
                texto: linha,
                tamanho: 10,
                espaco: 17
            })),
            {
                texto: "",
                tamanho: 10,
                espaco: 8
            },
            {
                texto: "Codigo de barras:",
                tamanho: 11,
                espaco: 18
            },
            ...quebrarTextoPdf(
                codigoBarras,
                72
            ).map((linha) => ({
                texto: linha,
                tamanho: 10,
                espaco: 17
            })),
            {
                texto: "",
                tamanho: 10,
                espaco: 12
            },
            {
                texto: "Link oficial do boleto:",
                tamanho: 11,
                espaco: 18
            },
            ...quebrarTextoPdf(
                boletoUrl ||
                    "Nao informado",
                72
            ).map((linha) => ({
                texto: linha,
                tamanho: 8,
                espaco: 14
            })),
            {
                texto: "",
                tamanho: 10,
                espaco: 16
            },
            {
                texto: "Utilize a linha digitavel ou abra o boleto oficial para realizar o pagamento.",
                tamanho: 9,
                espaco: 15
            }
        ];

        let posicaoY = 800;

        const comandos = [
            "BT"
        ];

        for (
            const linha
            of linhasPdf
        ) {
            if (
                posicaoY < 55
            ) {
                break;
            }

            comandos.push(
                `/F1 ${linha.tamanho} Tf`
            );

            comandos.push(
                `1 0 0 1 48 ${posicaoY} Tm`
            );

            comandos.push(
                `(${escaparTextoPdf(linha.texto)}) Tj`
            );

            posicaoY -=
                linha.espaco;
        }

        comandos.push("ET");

        const conteudo =
            comandos.join("\n");

        const encoder =
            new TextEncoder();

        const objetos = [
            `1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
`,
            `2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
`,
            `3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>
endobj
`,
            `4 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
`,
            `5 0 obj
<< /Length ${encoder.encode(conteudo).length} >>
stream
${conteudo}
endstream
endobj
`
        ];

        let pdf =
            "%PDF-1.4\n";

        const offsets =
            [0];

        for (
            const objeto
            of objetos
        ) {
            offsets.push(
                encoder.encode(pdf).length
            );

            pdf +=
                objeto;
        }

        const inicioXref =
            encoder.encode(pdf).length;

        pdf +=
            `xref
0 ${objetos.length + 1}
0000000000 65535 f 
`;

        for (
            let indice = 1;
            indice <= objetos.length;
            indice += 1
        ) {
            pdf +=
                `${String(offsets[indice]).padStart(10, "0")} 00000 n 
`;
        }

        pdf +=
            `trailer
<< /Size ${objetos.length + 1} /Root 1 0 R >>
startxref
${inicioXref}
%%EOF`;

        const blob =
            new Blob(
                [
                    encoder.encode(pdf)
                ],
                {
                    type:
                        "application/pdf"
                }
            );

        const url =
            URL.createObjectURL(
                blob
            );

        const link =
            document.createElement(
                "a"
            );

        const nomeArquivo =
            String(
                referenciaBoleto
            )
                .replace(
                    /[^a-zA-Z0-9_-]/g,
                    "-"
                )
                .replace(
                    /-+/g,
                    "-"
                );

        link.href =
            url;

        link.download =
            `boleto-${nomeArquivo}.pdf`;

        document.body.appendChild(
            link
        );

        link.click();

        document.body.removeChild(
            link
        );

        window.setTimeout(
            () => {
                URL.revokeObjectURL(
                    url
                );
            },
            1000
        );
    }

    // =====================================================
    // PIX - VERIFICAR PAGAMENTO
    // =====================================================

    async function verificarPagamentoPix(mostrarErro = true) {
        if (!pix?.order_id || verificandoPix) return;

        try {
            setVerificandoPix(true);

            const resposta = await api.get(
                `/api/mercado-pago/order/${pix.order_id}`
            );

            const dadosAtualizados = resposta.data || {};

            setPix((anterior) => ({
                ...anterior,
                ...dadosAtualizados
            }));

            const statusOrder = String(
                dadosAtualizados.status || ""
            ).toLowerCase();

            const detalheOrder = String(
                dadosAtualizados.status_detail || ""
            ).toLowerCase();

            const pagamentoAtualizado =
                dadosAtualizados?.dados?.transactions?.payments?.[0] || {};

            const statusPagamento = String(
                pagamentoAtualizado.status || ""
            ).toLowerCase();

            const detalhePagamento = String(
                pagamentoAtualizado.status_detail || ""
            ).toLowerCase();

            // Só considera pago quando o Mercado Pago informa que o valor
            // foi realmente processado e creditado.
            const pagamentoConfirmado =
                (statusOrder === "processed" && detalheOrder === "accredited") ||
                (statusPagamento === "processed" &&
                    detalhePagamento === "accredited");

            // Orders de teste do Mercado Pago podem ser aprovadas
            // automaticamente pelo sandbox. Elas não devem fechar o modal
            // sozinhas, pois não houve um PIX real.
            const orderDeTeste = String(
                dadosAtualizados.order_id ||
                    dadosAtualizados.id ||
                    pix?.order_id ||
                    ""
            )
                .toUpperCase()
                .includes("TST");

            if (pagamentoConfirmado && !orderDeTeste) {
                setModalPix(false);
                setModalSucesso(true);
            }
        } catch (error) {
            console.error("Erro ao verificar PIX:", error);

            if (mostrarErro) {
                alert(
                    error.response?.data?.erro ||
                        "Não foi possível verificar o pagamento agora."
                );
            }
        } finally {
            setVerificandoPix(false);
        }
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

        if (!fretePronto || !freteResultado) {
            setModal(false);
            setErroFrete("Calcule o frete novamente antes de continuar.");
            document
                .getElementById("secao-frete")
                ?.scrollIntoView({ behavior: "smooth", block: "center" });
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
                        : null,
                tipo_entrega: freteResultado.tipo_entrega,
                rua:
                    freteResultado.tipo_entrega === "ENTREGA"
                        ? ruaFrete.trim()
                        : null,
                endereco:
                    freteResultado.tipo_entrega === "ENTREGA"
                        ? ruaFrete.trim()
                        : null,
                numero:
                    freteResultado.tipo_entrega === "ENTREGA"
                        ? numeroFrete.trim()
                        : null,
                bairro:
                    freteResultado.tipo_entrega === "ENTREGA"
                        ? bairroFrete.trim()
                        : null,
                cidade:
                    freteResultado.tipo_entrega === "ENTREGA"
                        ? freteResultado.cidade || cidadeFrete.trim()
                        : null,
                estado:
                    freteResultado.tipo_entrega === "ENTREGA"
                        ? String(
                              freteResultado.estado || estadoFrete
                          ).toUpperCase()
                        : null
            });

            const totalRetornado = Number(resposta.data?.pedido?.total);
            const totalConfirmado = Number.isFinite(totalRetornado)
                ? totalRetornado
                : total;

            setTotalPedidoConfirmado(totalConfirmado);
            localStorage.removeItem(`frete_checkout_${usuario.id}`);

            if (cupom) {
                setCupom(null);
                setCodigoCupom("");
                setMensagemCupom("");
                setErroCupom("");
            }

            setFidelidadeCompra(
                resposta.data?.fidelidade || null
            );

            if (resposta.data?.orcamento?.convertido) {
                localStorage.removeItem(chaveOrcamento);
            }

            // =================================================
            // PIX REAL - MERCADO PAGO
            // =================================================

            if (pagamento === "PIX") {
                const pedidoId =
                    resposta.data?.pedido?.id ||
                    resposta.data?.pedido_id ||
                    resposta.data?.id;

                if (!pedidoId) {
                    throw new Error(
                        "O pedido foi criado, mas o backend não retornou o ID do pedido."
                    );
                }

                const respostaPix = await api.post(
                    "/api/mercado-pago/pix",
                    {
                        valor: Number(totalConfirmado.toFixed(2)),

                        // Credenciais de teste: usamos somente o e-mail
                        // de teste. Não enviamos nome "APRO", pois esse
                        // cenário é aprovado automaticamente pelo sandbox.
                        email:
                            "test_user_br@testuser.com",

                        pedido_id:
                            pedidoId
                    }
                );

                setPix(respostaPix.data);
                setCopiadoPix(false);
                setModal(false);
                setModalPix(true);

                return;
            }

            // =================================================
            // BOLETO REAL - MERCADO PAGO
            // =================================================

            if (pagamento === "Boleto") {
                const pedidoId =
                    resposta.data?.pedido?.id ||
                    resposta.data?.pedido_id ||
                    resposta.data?.id;

                if (!pedidoId) {
                    throw new Error(
                        "O pedido foi criado, mas o backend não retornou o ID do pedido."
                    );
                }

                const enderecoBoleto =
                    ruaFrete.trim() || String(usuario?.endereco || "").trim();
                const numeroBoleto =
                    numeroFrete.trim() || String(usuario?.numero || "").trim();
                const bairroBoleto =
                    bairroFrete.trim() || String(usuario?.bairro || "").trim();
                const cidadeBoleto =
                    cidadeFrete.trim() || String(usuario?.cidade || "").trim();
                const estadoBoleto =
                    estadoFrete.trim().toUpperCase() ||
                    String(usuario?.estado || "").trim().toUpperCase();

                const respostaBoleto = await api.post(
                    "/api/mercado-pago/boleto",
                    {
                        valor: Number(totalConfirmado.toFixed(2)),
                        pedido_id: pedidoId,
                        nome: usuario?.nome || "Cliente Pixel Color",
                        email: import.meta.env.DEV
                            ? "test_user_br@testuser.com"
                            : usuario?.email,
                        cpf: cpfBoleto.replace(/\D/g, ""),
                        cep: cepBoleto.replace(/\D/g, ""),
                        endereco: enderecoBoleto,
                        numero: numeroBoleto,
                        bairro: bairroBoleto,
                        cidade: cidadeBoleto,
                        estado: estadoBoleto
                    }
                );

                setBoleto(respostaBoleto.data);
                setCopiadoBoleto(false);
                setModal(false);
                setModalBoleto(true);

                return;
            }

            setModal(false);
            setModalSucesso(true);
        } catch (error) {
            console.error("Erro ao finalizar compra:", error);
            console.error("STATUS DO BACKEND:", error.response?.status);
            console.error("RESPOSTA DO BACKEND:", error.response?.data);

            const respostaBackend = error.response?.data;

            const mensagemErro =
                respostaBackend?.mensagem ||
                respostaBackend?.erro ||
                respostaBackend?.detalhe?.message ||
                respostaBackend?.detalhe ||
                error.message ||
                "Erro ao finalizar compra.";

            alert(
                typeof mensagemErro === "string"
                    ? mensagemErro
                    : JSON.stringify(mensagemErro)
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

                            {/* ENTREGA */}
                            <section
                                className={`${style.cardSection} ${style.freteSection}`}
                                id="secao-frete"
                            >
                                <div className={style.sectionHeader}>
                                    <div>
                                        <span className={style.sectionStep}>02</span>
                                        <h2>Entrega</h2>
                                    </div>

                                    <span
                                        className={
                                            fretePronto
                                                ? style.freteConcluido
                                                : style.fretePendente
                                        }
                                    >
                                        {fretePronto ? (
                                            <>
                                                <FiCheckCircle /> Calculado
                                            </>
                                        ) : (
                                            "Escolha uma opção"
                                        )}
                                    </span>
                                </div>

                                <div className={style.tipoEntregaGrid}>
                                    <button
                                        type="button"
                                        className={`${style.entregaOpcao} ${
                                            tipoEntrega === "ENTREGA"
                                                ? style.entregaOpcaoAtiva
                                                : ""
                                        }`}
                                        onClick={() =>
                                            selecionarTipoEntrega("ENTREGA")
                                        }
                                        disabled={
                                            calculandoFrete ||
                                            produtos.length === 0
                                        }
                                        aria-pressed={tipoEntrega === "ENTREGA"}
                                    >
                                        <span className={style.entregaIcone}>
                                            <FiTruck />
                                        </span>
                                        <span className={style.entregaTexto}>
                                            <strong>Receber no endereço</strong>
                                            <small>
                                                Valor e prazo conforme sua região
                                            </small>
                                        </span>
                                        <span className={style.entregaRadio} />
                                    </button>

                                    <button
                                        type="button"
                                        className={`${style.entregaOpcao} ${
                                            tipoEntrega === "RETIRADA"
                                                ? style.entregaOpcaoAtiva
                                                : ""
                                        }`}
                                        onClick={() =>
                                            selecionarTipoEntrega("RETIRADA")
                                        }
                                        disabled={
                                            calculandoFrete ||
                                            produtos.length === 0
                                        }
                                        aria-pressed={tipoEntrega === "RETIRADA"}
                                    >
                                        <span className={style.entregaIcone}>
                                            <FiPackage />
                                        </span>
                                        <span className={style.entregaTexto}>
                                            <strong>Retirar na loja</strong>
                                            <small>Sem custo de frete</small>
                                        </span>
                                        <span className={style.entregaRadio} />
                                    </button>
                                </div>

                                {tipoEntrega === "ENTREGA" && (
                                    <form
                                        className={style.freteForm}
                                        onSubmit={(event) => {
                                            event.preventDefault();
                                            calcularFrete("ENTREGA");
                                        }}
                                    >
                                        <div
                                            className={`${style.freteCampo} ${style.freteRua}`}
                                        >
                                            <label htmlFor="checkout-frete-rua">
                                                Rua / Avenida
                                            </label>
                                            <div>
                                                <FiMapPin />
                                                <input
                                                    id="checkout-frete-rua"
                                                    type="text"
                                                    value={ruaFrete}
                                                    onChange={(event) => {
                                                        setRuaFrete(
                                                            event.target.value
                                                        );
                                                        limparFreteCalculado();
                                                    }}
                                                    placeholder="Nome da rua ou avenida"
                                                    autoComplete="address-line1"
                                                    maxLength={255}
                                                />
                                            </div>
                                        </div>

                                        <div
                                            className={`${style.freteCampo} ${style.freteNumero}`}
                                        >
                                            <label htmlFor="checkout-frete-numero">
                                                Número
                                            </label>
                                            <input
                                                id="checkout-frete-numero"
                                                type="text"
                                                value={numeroFrete}
                                                onChange={(event) => {
                                                    setNumeroFrete(
                                                        event.target.value
                                                    );
                                                    limparFreteCalculado();
                                                }}
                                                placeholder="Nº"
                                                autoComplete="address-line2"
                                                maxLength={20}
                                            />
                                        </div>

                                        <div
                                            className={`${style.freteCampo} ${style.freteBairro}`}
                                        >
                                            <label htmlFor="checkout-frete-bairro">
                                                Bairro
                                            </label>
                                            <input
                                                id="checkout-frete-bairro"
                                                type="text"
                                                value={bairroFrete}
                                                onChange={(event) => {
                                                    setBairroFrete(
                                                        event.target.value
                                                    );
                                                    limparFreteCalculado();
                                                }}
                                                placeholder="Seu bairro"
                                                autoComplete="address-level3"
                                                maxLength={100}
                                            />
                                        </div>

                                        <div
                                            className={`${style.freteCampo} ${style.freteCidade}`}
                                        >
                                            <label htmlFor="checkout-frete-cidade">
                                                Cidade
                                            </label>
                                            <div>
                                                <FiMapPin />
                                                <input
                                                    id="checkout-frete-cidade"
                                                    type="text"
                                                    value={cidadeFrete}
                                                    onChange={(event) => {
                                                        setCidadeFrete(
                                                            event.target.value
                                                        );
                                                        limparFreteCalculado();
                                                    }}
                                                    placeholder="Sua cidade"
                                                    autoComplete="address-level2"
                                                    maxLength={80}
                                                />
                                            </div>
                                        </div>

                                        <div
                                            className={`${style.freteCampo} ${style.freteUf}`}
                                        >
                                            <label htmlFor="checkout-frete-estado">
                                                UF
                                            </label>
                                            <input
                                                id="checkout-frete-estado"
                                                type="text"
                                                value={estadoFrete}
                                                onChange={(event) => {
                                                    setEstadoFrete(
                                                        event.target.value
                                                            .replace(
                                                                /[^a-zA-Z]/g,
                                                                ""
                                                            )
                                                            .slice(0, 2)
                                                            .toUpperCase()
                                                    );
                                                    limparFreteCalculado();
                                                }}
                                                placeholder="SP"
                                                autoComplete="address-level1"
                                                maxLength={2}
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            className={style.calcularFrete}
                                            disabled={
                                                calculandoFrete ||
                                                produtos.length === 0
                                            }
                                        >
                                            <FiRefreshCw
                                                className={
                                                    calculandoFrete
                                                        ? style.freteSpin
                                                        : ""
                                                }
                                            />
                                            {calculandoFrete
                                                ? "Calculando..."
                                                : fretePronto
                                                  ? "Recalcular"
                                                  : "Calcular frete"}
                                        </button>
                                    </form>
                                )}

                                {tipoEntrega === "RETIRADA" &&
                                    !fretePronto &&
                                    !erroFrete && (
                                        <div className={style.retiradaCarregando}>
                                            <FiRefreshCw
                                                className={style.freteSpin}
                                            />
                                            Preparando a retirada grátis...
                                        </div>
                                    )}

                                {erroFrete && (
                                    <div
                                        className={style.freteErro}
                                        role="alert"
                                    >
                                        <FiAlertCircle />
                                        <span>{erroFrete}</span>
                                    </div>
                                )}

                                {fretePronto && freteResultado && (
                                    <div className={style.freteResultado}>
                                        <div className={style.freteResultadoTopo}>
                                            <div className={style.freteResultadoTitulo}>
                                                <span className={style.freteResultadoIcone}>
                                                    {freteResultado.retirada ? (
                                                        <FiPackage />
                                                    ) : (
                                                        <FiTruck />
                                                    )}
                                                </span>
                                                <div>
                                                    <span>
                                                        {freteResultado.retirada
                                                            ? "RETIRADA CONFIRMADA"
                                                            : "ENTREGA DISPONÍVEL"}
                                                    </span>
                                                    <strong>
                                                        {freteResultado.retirada
                                                            ? "Loja Pixel Color"
                                                            : `${ruaFrete}, ${numeroFrete}`}
                                                    </strong>
                                                    {!freteResultado.retirada && (
                                                        <small>
                                                            {bairroFrete} •{" "}
                                                            {freteResultado.cidade ||
                                                                cidadeFrete}{" "}
                                                            -{" "}
                                                            {freteResultado.estado ||
                                                                estadoFrete}
                                                        </small>
                                                    )}
                                                </div>
                                            </div>

                                            <strong
                                                className={style.freteResultadoValor}
                                            >
                                                {frete === 0
                                                    ? "Grátis"
                                                    : formatarMoeda(frete)}
                                            </strong>
                                        </div>

                                        <div className={style.fretePrazo}>
                                            <FiClock />
                                            <span>
                                                {formatarPrazoFrete(
                                                    freteResultado
                                                )}
                                            </span>
                                        </div>

                                        {!freteResultado.frete_gratis &&
                                            Number(
                                                freteResultado.frete_gratis_acima ||
                                                    0
                                            ) > 0 &&
                                            Number(
                                                freteResultado.falta_para_frete_gratis ||
                                                    0
                                            ) > 0 && (
                                                <div
                                                    className={
                                                        style.freteGratisProgresso
                                                    }
                                                >
                                                    <p>
                                                        Faltam{" "}
                                                        <strong>
                                                            {formatarMoeda(
                                                                freteResultado.falta_para_frete_gratis
                                                            )}
                                                        </strong>{" "}
                                                        para ganhar frete grátis.
                                                    </p>
                                                    <div>
                                                        <span
                                                            style={{
                                                                width: `${Math.min(
                                                                    100,
                                                                    Math.max(
                                                                        0,
                                                                        (subtotal /
                                                                            Number(
                                                                                freteResultado.frete_gratis_acima ||
                                                                                    1
                                                                            )) *
                                                                            100
                                                                    )
                                                                )}%`
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            )}

                                        {freteResultado.frete_gratis &&
                                            !freteResultado.retirada && (
                                                <p
                                                    className={
                                                        style.freteGratisMensagem
                                                    }
                                                >
                                                    Você atingiu o valor mínimo e
                                                    ganhou frete grátis.
                                                </p>
                                            )}
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
                                    <div id="secao-boleto" className={style.boletoArea}>
                                        <div className={style.infoPagamento}>
                                            <FiFileText />
                                            <div>
                                                <strong>Pagamento por boleto</strong>
                                                <span>
                                                    A confirmação pode levar até 3 dias úteis após o pagamento.
                                                </span>
                                            </div>
                                        </div>

                                        <div className={style.boletoForm}>
                                            <div className={style.formGroup}>
                                                <label htmlFor="cpf-boleto">
                                                    CPF do pagador
                                                </label>
                                                <input
                                                    id="cpf-boleto"
                                                    type="text"
                                                    inputMode="numeric"
                                                    placeholder="000.000.000-00"
                                                    value={cpfBoleto}
                                                    onChange={(event) => {
                                                        setCpfBoleto(
                                                            formatarCpf(event.target.value)
                                                        );
                                                        setErroBoleto("");
                                                    }}
                                                />
                                            </div>

                                            <div className={style.formGroup}>
                                                <label htmlFor="cep-boleto">
                                                    CEP do pagador
                                                </label>
                                                <input
                                                    id="cep-boleto"
                                                    type="text"
                                                    inputMode="numeric"
                                                    placeholder="00000-000"
                                                    value={formatarCep(cepBoleto)}
                                                    onChange={(event) => {
                                                        setCepBoleto(
                                                            event.target.value
                                                                .replace(/\D/g, "")
                                                                .slice(0, 8)
                                                        );
                                                        setErroBoleto("");
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        <p className={style.boletoEnderecoAviso}>
                                            O boleto usará o endereço informado na entrega ou, se necessário, o endereço salvo no seu perfil.
                                        </p>

                                        {erroBoleto && (
                                            <div className={style.cardError}>
                                                {erroBoleto}
                                            </div>
                                        )}
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
                                <strong
                                    className={
                                        fretePronto && frete === 0
                                            ? style.freteGratisResumo
                                            : ""
                                    }
                                >
                                    {!fretePronto
                                        ? "A calcular"
                                        : frete === 0
                                          ? "Grátis"
                                          : formatarMoeda(frete)}
                                </strong>
                            </div>

                            {fretePronto && (
                                <div className={style.resumoEntregaDetalhe}>
                                    {freteResultado?.retirada ? (
                                        <FiPackage />
                                    ) : (
                                        <FiTruck />
                                    )}
                                    <span>
                                        {freteResultado?.retirada
                                            ? "Retirada na loja"
                                            : `${ruaFrete}, ${numeroFrete} • ${bairroFrete} • ${freteResultado?.cidade || cidadeFrete} - ${freteResultado?.estado || estadoFrete}`}
                                    </span>
                                </div>
                            )}

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

                            {!fretePronto && (
                                <p className={style.freteResumoAviso}>
                                    Frete ainda não incluído no total.
                                </p>
                            )}

                            <button
                                type="button"
                                className={style.finalizar}
                                onClick={confirmarCompra}
                                disabled={
                                    produtos.length === 0 ||
                                    !fretePronto ||
                                    calculandoFrete ||
                                    finalizando
                                }
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

                            <div className={style.modalData}>
                                <span>
                                    {freteResultado?.retirada
                                        ? "Retirada"
                                        : "Entrega"}
                                </span>
                                <strong>
                                    {freteResultado?.retirada
                                        ? "Loja Pixel Color"
                                        : `${ruaFrete}, ${numeroFrete} • ${bairroFrete} • ${freteResultado?.cidade || cidadeFrete} - ${freteResultado?.estado || estadoFrete}`}
                                </strong>
                            </div>

                            <div className={style.modalData}>
                                <span>Frete</span>
                                <strong>
                                    {frete === 0
                                        ? "Grátis"
                                        : formatarMoeda(frete)}
                                </strong>
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

                {/* MODAL PIX */}
                {modalPix && pix && (
                    <div className={style.modalPixOverlay}>
                        <div className={style.modalPix}>
                            <div className={style.pixModalHeader}>
                                <button
                                    type="button"
                                    className={style.pixCloseButton}
                                    onClick={() => setModalPix(false)}
                                    aria-label="Fechar tela do PIX"
                                    title="Fechar"
                                >
                                    <FiX />
                                </button>

                                <div className={style.pixModalIcon}>
                                    <FiZap />
                                </div>

                                <span className={style.pixStatusBadge}>
                                    Aguardando pagamento
                                </span>

                                <h2>Finalize o pagamento com PIX</h2>

                                <p>
                                    Escaneie o QR Code pelo aplicativo do seu banco
                                    ou use o código copia e cola.
                                </p>
                            </div>

                            <div className={style.pixModalContent}>
                                <div className={style.pixQrColumn}>
                                    <div className={style.pixQrBox}>
                                        {pix.qr_code_base64 ? (
                                            <img
                                                src={`data:image/png;base64,${pix.qr_code_base64}`}
                                                alt="QR Code PIX"
                                            />
                                        ) : (
                                            <div className={style.pixQrFallback}>
                                                QR Code indisponível
                                            </div>
                                        )}
                                    </div>

                                    <span className={style.pixQrHint}>
                                        Aponte a câmera do seu banco para o QR Code
                                    </span>
                                </div>

                                <div className={style.pixInfoColumn}>
                                    <div className={style.pixOrderInfo}>
                                        <div>
                                            <span>Total do pedido</span>
                                            <strong>
                                                {formatarMoeda(
                                                    Number(
                                                        pix.valor ||
                                                            totalPedidoConfirmado ||
                                                            total
                                                    )
                                                )}
                                            </strong>
                                        </div>

                                        <div>
                                            <span>Status</span>
                                            <strong>Aguardando PIX</strong>
                                        </div>
                                    </div>

                                    <div className={style.pixCodeArea}>
                                        <label htmlFor="codigo-pix">
                                            PIX copia e cola
                                        </label>

                                        <div className={style.pixCopyBox}>
                                            <input
                                                id="codigo-pix"
                                                type="text"
                                                readOnly
                                                value={pix.qr_code || ""}
                                            />

                                            <button
                                                type="button"
                                                onClick={copiarCodigoPix}
                                                disabled={!pix.qr_code}
                                            >
                                                <FiCopy />
                                                {copiadoPix
                                                    ? "Copiado"
                                                    : "Copiar"}
                                            </button>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        className={style.pixVerifyButton}
                                        onClick={() =>
                                            verificarPagamentoPix(true)
                                        }
                                        disabled={verificandoPix}
                                    >
                                        <FiRefreshCw
                                            className={
                                                verificandoPix
                                                    ? style.pixSpin
                                                    : ""
                                            }
                                        />

                                        {verificandoPix
                                            ? "Verificando..."
                                            : "Já paguei — verificar pagamento"}
                                    </button>

                                    {pix.ticket_url && (
                                        <a
                                            className={style.pixTicketLink}
                                            href={pix.ticket_url}
                                            target="_blank"
                                            rel="noreferrer"
                                        >
                                            <FiExternalLink />
                                            Abrir página do pagamento
                                        </a>
                                    )}
                                </div>
                            </div>

                            <div className={style.pixWaitingNotice}>
                                <FiClock />
                                <span>
                                    Assim que o Mercado Pago confirmar o pagamento,
                                    esta tela será atualizada automaticamente.
                                </span>
                            </div>

                        </div>
                    </div>
                )}

                {/* MODAL BOLETO */}
                {modalBoleto && boleto && (
                    <div className={style.modalBoletoOverlay}>
                        <div className={style.modalBoleto}>
                            <div className={style.boletoModalHeader}>
                                <button
                                    type="button"
                                    className={style.boletoCloseButton}
                                    onClick={() => setModalBoleto(false)}
                                    aria-label="Fechar boleto"
                                    title="Fechar"
                                >
                                    <FiX />
                                </button>

                                <div className={style.boletoModalIcon}>
                                    <FiFileText />
                                </div>

                                <span className={style.boletoStatusBadge}>
                                    Aguardando pagamento
                                </span>

                                <h2>Boleto gerado com sucesso</h2>

                                <p>
                                    Abra o boleto para pagamento ou copie a linha digitável abaixo.
                                </p>
                            </div>

                            <div className={style.boletoModalContent}>
                                <div className={style.boletoOrderInfo}>
                                    <div>
                                        <span>Total do pedido</span>
                                        <strong>
                                            {formatarMoeda(
                                                Number(
                                                    boleto.valor ||
                                                        totalPedidoConfirmado ||
                                                        total
                                                )
                                            )}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>Vencimento</span>
                                        <strong>
                                            {formatarVencimentoBoleto(
                                                boleto?.dados?.transactions?.payments?.[0]
                                                    ?.date_of_expiration
                                            )}
                                        </strong>
                                    </div>
                                </div>

                                <div className={style.boletoCodeArea}>
                                    <label htmlFor="linha-digitavel-boleto">
                                        Linha digitável
                                    </label>

                                    <div className={style.boletoCopyBox}>
                                        <input
                                            id="linha-digitavel-boleto"
                                            type="text"
                                            readOnly
                                            value={boleto.linha_digitavel || ""}
                                        />

                                        <button
                                            type="button"
                                            onClick={copiarLinhaBoleto}
                                            disabled={!boleto.linha_digitavel}
                                        >
                                            <FiCopy />
                                            {copiadoBoleto ? "Copiado" : "Copiar"}
                                        </button>
                                    </div>
                                </div>

                                <div className={style.boletoActions}>
                                    {(boleto.boleto_url || boleto.ticket_url) && (
                                        <a
                                            className={style.boletoAbrirButton}
                                            href={boleto.boleto_url || boleto.ticket_url}
                                            target="_blank"
                                            rel="noreferrer"
                                        >
                                            <FiExternalLink />
                                            Abrir boleto
                                        </a>
                                    )}

                                    <button
                                        type="button"
                                        className={style.boletoDownloadButton}
                                        onClick={baixarBoletoPdf}
                                    >
                                        <FiDownload />
                                        Baixar PDF
                                    </button>
                                </div>

                                <div className={style.boletoWaitingNotice}>
                                    <FiClock />
                                    <span>
                                        O pedido ficará aguardando o pagamento do boleto até a confirmação do Mercado Pago.
                                    </span>
                                </div>
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
                                    <span>Entrega</span>
                                    <strong>
                                        {freteResultado?.retirada
                                            ? "Retirada na loja"
                                            : "Entrega no endereço"}
                                    </strong>
                                </div>

                                <div>
                                    <span>Total</span>
                                    <strong>
                                        {formatarMoeda(
                                            totalPedidoConfirmado ?? total
                                        )}
                                    </strong>
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
