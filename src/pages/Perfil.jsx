import { useEffect, useRef, useState } from "react";
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
    FiClock,
    FiPhone,
    FiMapPin,
    FiHome,
    FiHash,
    FiMap,
    FiStar,
    FiCopy,
    FiBell,
    FiCheck,
    FiTrash2,
    FiRefreshCw
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

    const inputFotoRef = useRef(null);


    // =====================================================
    // ESTADOS
    // =====================================================

    const [editando, setEditando] = useState(false);

    const [form, setForm] = useState({
        nome: "",
        email: "",
        telefone: "",
        data_nascimento: "",
        endereco: "",
        numero: "",
        complemento: "",
        bairro: "",
        cidade: "",
        estado: "",
        cep: "",
        senha: ""
    });

    const [modalPedidos, setModalPedidos] = useState(false);

    const [pedidos, setPedidos] = useState([]);

    const [carregandoPedidos, setCarregandoPedidos] =
        useState(false);

    const [erroPedidos, setErroPedidos] =
        useState("");

    const [enviandoFoto, setEnviandoFoto] =
        useState(false);

    const [erroFoto, setErroFoto] =
        useState("");

    const [fotoPreview, setFotoPreview] =
        useState(null);

    const [erroImagem, setErroImagem] =
        useState(false);

    const [comentarioFeedback, setComentarioFeedback] =
        useState("");

    const [notaFeedback, setNotaFeedback] =
        useState(0);

    const [enviandoFeedback, setEnviandoFeedback] =
        useState(false);

    const [mensagemFeedback, setMensagemFeedback] =
        useState("");

    const [tipoMensagemFeedback, setTipoMensagemFeedback] =
        useState("");

    const [modalFeedback, setModalFeedback] =
        useState(false);

    const [fidelidade, setFidelidade] =
        useState(null);

    const [carregandoFidelidade, setCarregandoFidelidade] =
        useState(false);

    const [erroFidelidade, setErroFidelidade] =
        useState("");

    const [cuponsSalvos, setCuponsSalvos] = useState([]);
    const [cupomCopiado, setCupomCopiado] = useState("");


    // =====================================================
    // NOTIFICAÇÕES
    // =====================================================

    const [notificacoes, setNotificacoes] =
        useState([]);

    const [carregandoNotificacoes, setCarregandoNotificacoes] =
        useState(false);

    const [erroNotificacoes, setErroNotificacoes] =
        useState("");

    const [mostrarTodasNotificacoes, setMostrarTodasNotificacoes] =
        useState(false);


    // =====================================================
    // URL DA FOTO
    // =====================================================

    function obterUrlFoto(foto) {

        if (!foto) {
            return null;
        }

        let caminho = String(foto)
            .trim()
            .replace(/\\/g, "/");

        if (!caminho) {
            return null;
        }

        // URL completa
        if (
            caminho.startsWith("http://") ||
            caminho.startsWith("https://")
        ) {
            return caminho;
        }

        // Remove ./ do começo
        caminho = caminho.replace(/^\.?\//, "");

        // Caso o banco tenha salvo:
        // uploads/usuarios/foto.jpg
        if (caminho.startsWith("uploads/")) {

            return `http://localhost:3333/${caminho}`;

        }

        // Caso o banco tenha salvo:
        // usuarios/foto.jpg
        return `http://localhost:3333/uploads/${caminho}`;
    }


    // =====================================================
    // CARREGAR USUÁRIO
    // =====================================================

    useEffect(() => {

        if (!usuario) {
            return;
        }

        setForm({
            nome: usuario.nome || "",
            email: usuario.email || "",
            telefone: usuario.telefone || "",

            data_nascimento:
                usuario.data_nascimento
                    ? String(
                        usuario.data_nascimento
                    ).substring(0, 10)
                    : "",

            endereco: usuario.endereco || "",
            numero: usuario.numero || "",
            complemento: usuario.complemento || "",
            bairro: usuario.bairro || "",
            cidade: usuario.cidade || "",
            estado: usuario.estado || "",
            cep: usuario.cep || "",
            senha: ""
        });

        setErroImagem(false);

        setFotoPreview(
            obterUrlFoto(usuario.foto)
        );

    }, [usuario]);


    // =====================================================
    // BUSCAR PEDIDOS
    // =====================================================

    async function buscarPedidos() {

        if (!usuario?.id) {

            setPedidos([]);

            setErroPedidos(
                "Usuário não encontrado."
            );

            return;
        }

        try {

            setCarregandoPedidos(true);

            setErroPedidos("");

            const resposta = await api.get(
                `/pedidos/usuario/${usuario.id}`
            );

            if (Array.isArray(resposta.data)) {

                setPedidos(resposta.data);

            } else {

                setPedidos([]);

                console.warn(
                    "A API de pedidos não retornou um array."
                );

            }

        } catch (error) {

            console.error(
                "ERRO AO BUSCAR PEDIDOS:",
                error
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
    // BUSCAR PEDIDOS AUTOMATICAMENTE
    // =====================================================

    useEffect(() => {

        if (!usuario?.id) {
            return;
        }

        buscarPedidos();

    }, [usuario?.id]);


    // =====================================================
    // BUSCAR FIDELIDADE
    // =====================================================

    async function buscarFidelidade() {

        if (!usuario?.id) {
            return;
        }

        try {

            setCarregandoFidelidade(true);
            setErroFidelidade("");

            const resposta = await api.get(
                `/fidelidade/${usuario.id}`
            );

            setFidelidade(resposta.data);

        } catch (error) {

            console.error(
                "ERRO AO BUSCAR FIDELIDADE:",
                error
            );

            setFidelidade(null);

            setErroFidelidade(
                error.response?.data?.erro ||
                error.response?.data?.message ||
                "Não foi possível carregar seus pontos."
            );

        } finally {

            setCarregandoFidelidade(false);

        }

    }

    async function buscarCuponsSalvos() {

        if (!usuario?.id) {
            return;
        }

        try {

            const resposta = await api.get(
                `/fidelidade/${usuario.id}/cupons`
            );

            const lista =
                Array.isArray(resposta.data)
                    ? resposta.data
                    : Array.isArray(resposta.data?.cupons)
                        ? resposta.data.cupons
                        : [];

            setCuponsSalvos(lista);

        } catch (error) {

            console.error(
                "Erro ao buscar cupons salvos:",
                error
            );

            setCuponsSalvos([]);

        }

    }


    async function copiarCupom(codigo) {

        if (!codigo) {
            return;
        }

        try {

            if (
                navigator.clipboard &&
                typeof navigator.clipboard.writeText === "function"
            ) {

                await navigator.clipboard.writeText(
                    codigo
                );

            } else {

                const campoTemporario =
                    document.createElement("textarea");

                campoTemporario.value = codigo;

                campoTemporario.setAttribute(
                    "readonly",
                    ""
                );

                campoTemporario.style.position =
                    "fixed";

                campoTemporario.style.opacity =
                    "0";

                document.body.appendChild(
                    campoTemporario
                );

                campoTemporario.select();

                document.execCommand(
                    "copy"
                );

                document.body.removeChild(
                    campoTemporario
                );

            }

            setCupomCopiado(codigo);

            window.setTimeout(
                () => setCupomCopiado(""),
                1800
            );

        } catch (error) {

            console.error(
                "Erro ao copiar cupom:",
                error
            );

        }

    }


    // =====================================================
    // BUSCAR NOTIFICAÇÕES
    // =====================================================

    async function buscarNotificacoes(
        mostrarCarregamento = true
    ) {

        if (!usuario?.id) {
            return;
        }

        try {

            if (mostrarCarregamento) {
                setCarregandoNotificacoes(true);
            }

            setErroNotificacoes("");

            const resposta = await api.get(
                `/notificacoes/usuario/${usuario.id}`
            );

            const lista =
                Array.isArray(resposta.data)
                    ? resposta.data
                    : Array.isArray(resposta.data?.notificacoes)
                        ? resposta.data.notificacoes
                        : [];

            setNotificacoes(
                lista.map(
                    notificacao => ({
                        ...notificacao,
                        lida: Boolean(notificacao.lida)
                    })
                )
            );

        } catch (error) {

            console.error(
                "Erro ao buscar notificações:",
                error
            );

            setErroNotificacoes(
                error.response?.data?.erro ||
                error.response?.data?.message ||
                "Não foi possível carregar suas notificações."
            );

        } finally {

            if (mostrarCarregamento) {
                setCarregandoNotificacoes(false);
            }

        }

    }


    // =====================================================
    // MARCAR UMA NOTIFICAÇÃO COMO LIDA
    // =====================================================

    async function marcarNotificacaoComoLida(
        notificacao
    ) {

        if (
            !notificacao?.id ||
            notificacao.lida
        ) {
            return;
        }

        // Atualização visual imediata
        setNotificacoes(prev =>
            prev.map(item =>
                item.id === notificacao.id
                    ? {
                        ...item,
                        lida: true
                    }
                    : item
            )
        );

        try {

            await api.patch(
                `/notificacoes/${notificacao.id}/lida`
            );

        } catch (error) {

            console.error(
                "Erro ao marcar notificação como lida:",
                error
            );

            // Desfaz caso a API falhe
            setNotificacoes(prev =>
                prev.map(item =>
                    item.id === notificacao.id
                        ? {
                            ...item,
                            lida: false
                        }
                        : item
                )
            );

        }

    }


    // =====================================================
    // MARCAR TODAS COMO LIDAS
    // =====================================================

    async function marcarTodasNotificacoesComoLidas() {

        if (
            !usuario?.id ||
            notificacoes.length === 0
        ) {
            return;
        }

        const estadoAnterior =
            notificacoes;

        setNotificacoes(prev =>
            prev.map(item => ({
                ...item,
                lida: true
            }))
        );

        try {

            await api.patch(
                `/notificacoes/usuario/${usuario.id}/ler-todas`
            );

        } catch (error) {

            console.error(
                "Erro ao marcar todas as notificações como lidas:",
                error
            );

            setNotificacoes(
                estadoAnterior
            );

        }

    }


    // =====================================================
    // EXCLUIR NOTIFICAÇÃO
    // =====================================================

    async function excluirNotificacao(
        notificacaoId
    ) {

        if (!notificacaoId) {
            return;
        }

        const estadoAnterior =
            notificacoes;

        setNotificacoes(prev =>
            prev.filter(
                item =>
                    item.id !== notificacaoId
            )
        );

        try {

            await api.delete(
                `/notificacoes/${notificacaoId}`
            );

        } catch (error) {

            console.error(
                "Erro ao excluir notificação:",
                error
            );

            setNotificacoes(
                estadoAnterior
            );

        }

    }


    // =====================================================
    // BUSCAR NOTIFICAÇÕES AUTOMATICAMENTE
    // =====================================================

    useEffect(() => {

        if (!usuario?.id) {
            return;
        }

        buscarNotificacoes();


        // Mantém a caixa atualizada enquanto o perfil estiver aberto.
        const intervalo =
            window.setInterval(
                () => {
                    buscarNotificacoes(false);
                },
                30000
            );


        return () => {
            window.clearInterval(
                intervalo
            );
        };

    }, [usuario?.id]);


    // =====================================================
    // BUSCAR FIDELIDADE AUTOMATICAMENTE
    // =====================================================

    useEffect(() => {

        if (!usuario?.id) {
            return;
        }

        buscarFidelidade();
        buscarCuponsSalvos();

    }, [usuario?.id]);


    // =====================================================
    // ABRIR HISTÓRICO
    // =====================================================

    async function abrirHistorico() {

        setModalPedidos(true);

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

            const dados = {

                nome: form.nome,
                email: form.email,
                telefone: form.telefone,

                data_nascimento:
                    form.data_nascimento || null,

                endereco: form.endereco,
                numero: form.numero,
                complemento: form.complemento,
                bairro: form.bairro,
                cidade: form.cidade,
                estado: form.estado,
                cep: form.cep
            };

            if (form.senha) {

                dados.senha = form.senha;

            }

            const resultado =
                await atualizarPerfil(dados);

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
    // ABRIR SELETOR
    // =====================================================

    function abrirSeletorFoto() {

        if (enviandoFoto) {
            return;
        }

        inputFotoRef.current?.click();

    }


    // =====================================================
    // ALTERAR FOTO
    // =====================================================

    async function handleFoto(event) {

        const arquivo =
            event.target.files?.[0];

        if (!arquivo) {
            return;
        }

        setErroFoto("");
        setErroImagem(false);


        // =================================================
        // VALIDAR TIPO
        // =================================================

        const tiposPermitidos = [
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/webp"
        ];

        if (
            !tiposPermitidos.includes(
                arquivo.type
            )
        ) {

            setErroFoto(
                "Formato inválido. Use JPG, JPEG, PNG ou WEBP."
            );

            event.target.value = "";

            return;

        }


        // =================================================
        // VALIDAR TAMANHO
        // =================================================

        const tamanhoMaximo =
            2 * 1024 * 1024;

        if (
            arquivo.size >
            tamanhoMaximo
        ) {

            setErroFoto(
                "A imagem deve ter no máximo 2MB."
            );

            event.target.value = "";

            return;

        }


        // =================================================
        // PREVIEW TEMPORÁRIO
        // =================================================

        const preview =
            URL.createObjectURL(
                arquivo
            );

        setFotoPreview(preview);


        // =================================================
        // FORMDATA
        // =================================================

        const dados =
            new FormData();

        dados.append(
            "foto",
            arquivo
        );


        try {

            setEnviandoFoto(true);


            console.log(
                "Enviando foto para:",
                `/usuarios/${usuario.id}/foto`
            );


            // =================================================
            // ENVIAR FOTO
            // =================================================

            const resposta =
                await api.put(
                    `/usuarios/${usuario.id}/foto`,
                    dados,
                    {
                        headers: {
                            "Content-Type":
                                "multipart/form-data"
                        }
                    }
                );


            console.log(
                "RESPOSTA FOTO:",
                resposta.data
            );


            // =================================================
            // USUÁRIO ATUALIZADO
            // =================================================

            const usuarioAtualizado =
                resposta.data?.usuario;


            if (!usuarioAtualizado) {

                throw new Error(
                    "A API não retornou o usuário atualizado."
                );

            }


            // =================================================
            // FOTO RETORNADA
            // =================================================

            const fotoSalva =
                usuarioAtualizado.foto;


            if (!fotoSalva) {

                throw new Error(
                    "A API não retornou o caminho da foto."
                );

            }


            console.log(
                "FOTO SALVA NO BANCO:",
                fotoSalva
            );


            // =================================================
            // MONTAR URL CORRETA
            // =================================================

            const urlFoto =
                obterUrlFoto(
                    fotoSalva
                );


            console.log(
                "URL FINAL DA FOTO:",
                urlFoto
            );


            // =================================================
            // LIMPAR PREVIEW ANTIGO
            // =================================================

            setErroImagem(false);


            // =================================================
            // EVITAR CACHE DO NAVEGADOR
            // =================================================

            setFotoPreview(
                `${urlFoto}?t=${Date.now()}`
            );


            // =================================================
            // ATUALIZAR CONTEXTO
            // =================================================

            if (
                typeof atualizarPerfil ===
                "function"
            ) {

                try {

                    await atualizarPerfil({

                        nome:
                            usuarioAtualizado.nome,

                        email:
                            usuarioAtualizado.email,

                        telefone:
                            usuarioAtualizado.telefone,

                        data_nascimento:
                            usuarioAtualizado.data_nascimento,

                        endereco:
                            usuarioAtualizado.endereco,

                        numero:
                            usuarioAtualizado.numero,

                        complemento:
                            usuarioAtualizado.complemento,

                        bairro:
                            usuarioAtualizado.bairro,

                        cidade:
                            usuarioAtualizado.cidade,

                        estado:
                            usuarioAtualizado.estado,

                        cep:
                            usuarioAtualizado.cep,

                        foto:
                            usuarioAtualizado.foto

                    });

                } catch (contextError) {

                    console.warn(
                        "Foto salva, mas houve erro ao atualizar o contexto:",
                        contextError
                    );

                }

            }


            setErroFoto("");


        } catch (error) {

            console.error(
                "ERRO AO ENVIAR FOTO:",
                error
            );

            console.error(
                "RESPOSTA DO SERVIDOR:",
                error.response?.data
            );


            // =================================================
            // VOLTAR PARA FOTO ANTERIOR
            // =================================================

            setErroImagem(false);

            setFotoPreview(
                obterUrlFoto(
                    usuario?.foto
                )
            );


            // =================================================
            // ERRO
            // =================================================

            setErroFoto(

                error.response?.data?.erro ||

                error.response?.data?.detalhes ||

                error.response?.data?.message ||

                error.message ||

                "Não foi possível alterar a foto."

            );

        } finally {

            setEnviandoFoto(false);

            event.target.value = "";

        }

    }


    // =====================================================
    // INPUT
    // =====================================================

    function handleChange(event) {

        const {
            name,
            value
        } = event.target;

        setForm(prev => ({
            ...prev,
            [name]: value
        }));

    }


    // =====================================================
    // TELEFONE
    // =====================================================

    function formatarTelefone(value) {

        return value
            .replace(/\D/g, "")
            .slice(0, 11)
            .replace(
                /^(\d{2})(\d)/,
                "($1) $2"
            )
            .replace(
                /(\d{5})(\d)/,
                "$1-$2"
            );

    }


    function handleTelefone(event) {

        setForm(prev => ({
            ...prev,
            telefone:
                formatarTelefone(
                    event.target.value
                )
        }));

    }


    // =====================================================
    // CEP
    // =====================================================

    function formatarCep(value) {

        return value
            .replace(/\D/g, "")
            .slice(0, 8)
            .replace(
                /^(\d{5})(\d)/,
                "$1-$2"
            );

    }


    function handleCep(event) {

        setForm(prev => ({
            ...prev,
            cep:
                formatarCep(
                    event.target.value
                )
        }));

    }


    // =====================================================
    // FEEDBACK
    // =====================================================

    async function enviarFeedback(event) {

        event.preventDefault();

        setMensagemFeedback("");
        setTipoMensagemFeedback("");

        const comentario = comentarioFeedback.trim();

        if (!notaFeedback) {
            setTipoMensagemFeedback("erro");
            setMensagemFeedback("Selecione uma avaliação de 1 a 5 estrelas.");
            return;
        }

        if (comentario.length < 5) {
            setTipoMensagemFeedback("erro");
            setMensagemFeedback("Seu comentário precisa ter pelo menos 5 caracteres.");
            return;
        }

        if (comentario.length > 500) {
            setTipoMensagemFeedback("erro");
            setMensagemFeedback("Seu comentário deve possuir no máximo 500 caracteres.");
            return;
        }

        try {
            setEnviandoFeedback(true);

            const resposta = await api.post("/feedbacks", {
                usuario_id: usuario.id,
                comentario,
                nota: notaFeedback
            });

            setComentarioFeedback("");
            setNotaFeedback(0);
            setTipoMensagemFeedback("sucesso");
            setMensagemFeedback(
                resposta.data?.mensagem ||
                "Feedback enviado com sucesso!"
            );
            setModalFeedback(true);
        } catch (error) {
            setTipoMensagemFeedback("erro");
            setMensagemFeedback(
                error.response?.data?.erro ||
                error.response?.data?.message ||
                "Não foi possível enviar seu feedback."
            );
        } finally {
            setEnviandoFeedback(false);
        }
    }


    // =====================================================
    // SAIR
    // =====================================================

    function sairConta() {

        logout();

        navigate("/login");

    }


    // =====================================================
    // DATA
    // =====================================================

    function formatarData(data) {

        if (!data) {
            return "-";
        }

        return new Date(data).toLocaleDateString(
            "pt-BR",
            {
                day: "2-digit",
                month: "2-digit",
                year: "numeric"
            }
        );

    }


    // =====================================================
    // DATA + HORA
    // =====================================================

    function formatarDataHora(data) {

        if (!data) {
            return "-";
        }

        return new Date(data).toLocaleDateString(
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
    // PREÇO
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
            status
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
    // FOTO ATUAL
    // =====================================================

    const fotoAtual =
        fotoPreview ||
        obterUrlFoto(
            usuario?.foto
        );


    // =====================================================
    // FIDELIDADE
    // =====================================================

    const pontosFidelidade =
        Number(fidelidade?.pontos || 0);

    const proximaRecompensa =
        Number(
            fidelidade?.proxima_recompensa ||
            pontosFidelidade ||
            1
        );

    const porcentagemFidelidade =
        fidelidade?.proxima_recompensa
            ? Math.min(
                (pontosFidelidade / proximaRecompensa) * 100,
                100
            )
            : 100;


    // =====================================================
    // NOTIFICAÇÕES — DADOS PARA O LAYOUT
    // =====================================================

    const notificacoesNaoLidas =
        notificacoes.filter(
            notificacao =>
                !notificacao.lida
        ).length;

    const notificacoesVisiveis =
        mostrarTodasNotificacoes
            ? notificacoes
            : notificacoes.slice(
                0,
                4
            );


    // =====================================================
    // RENDER
    // =====================================================

    return (

        <div className={styles.page}>

            {header}

            <main
                className={`${styles.content} ${
                    usuario?.tipo === "admin"
                        ? styles.contentAdmin
                        : styles.contentCliente
                }`}
            >

                <div className={styles.topo}>

                    <div className={styles.topoTexto}>
                        <span className={styles.topoTag}>
                            Minha conta
                        </span>

                        <h1>Meu perfil</h1>

                        <p>
                            Gerencie suas informações pessoais, endereço e acesso.
                        </p>
                    </div>

                </div>


                <div className={styles.container}>

                    {/* =================================================
                        CARD ESQUERDO
                    ================================================= */}

                    <section className={styles.leftCard}>

                        {/* AVATAR */}

                        <div className={styles.avatarBox}>

                            <div className={styles.avatar}>

                                {fotoAtual &&
                                !erroImagem ? (

                                    <img
                                        src={fotoAtual}
                                        alt={`Foto de ${
                                            usuario?.nome ||
                                            "usuário"
                                        }`}
                                        className={
                                            styles.avatarImage
                                        }
                                        onError={() => {

                                            console.error(
                                                "Não foi possível carregar:",
                                                fotoAtual
                                            );

                                            setErroImagem(true);

                                        }}
                                    />

                                ) : (

                                    usuario?.nome
                                        ?.charAt(0)
                                        ?.toUpperCase() ||
                                    "U"

                                )}

                            </div>


                            <button
                                className={
                                    styles.camera
                                }
                                type="button"
                                onClick={
                                    abrirSeletorFoto
                                }
                                disabled={
                                    enviandoFoto
                                }
                                title="Alterar foto"
                            >

                                {enviandoFoto
                                    ? "..."
                                    : <FiCamera />}

                            </button>


                            <input
                                ref={inputFotoRef}
                                type="file"
                                accept="image/png,image/jpeg,image/jpg,image/webp"
                                onChange={handleFoto}
                                style={{
                                    display: "none"
                                }}
                            />

                        </div>


                        <h2
                            className={
                                styles.nomeUsuario
                            }
                        >
                            {usuario?.nome ||
                                "Usuário"}
                        </h2>


                        <p
                            className={
                                styles.emailUsuario
                            }
                        >
                            {usuario?.email ||
                                "Sem e-mail"}
                        </p>


                        <button
                            className={
                                styles.photoBtn
                            }
                            type="button"
                            onClick={
                                abrirSeletorFoto
                            }
                            disabled={
                                enviandoFoto
                            }
                        >

                            <FiCamera />

                            {enviandoFoto
                                ? "Enviando..."
                                : "Alterar foto"}

                        </button>


                        <small>
                            PNG, JPG ou WEBP.
                            Tamanho máximo: 2MB.
                        </small>


                        {erroFoto && (

                            <p
                                style={{
                                    color: "#dc2626",
                                    fontSize: "13px",
                                    marginTop: "8px",
                                    textAlign: "center"
                                }}
                            >
                                {erroFoto}
                            </p>

                        )}


                        {/* CONTA */}

                        <div
                            className={
                                styles.account
                            }
                        >

                            <h3>
                                Informações da conta
                            </h3>


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


                            <div
                                className={
                                    styles.row
                                }
                            >

                                <FiCalendar />

                                <div>

                                    <span>
                                        Cadastro
                                    </span>

                                    <strong>
                                        {formatarData(
                                            usuario?.criado_em
                                        )}
                                    </strong>

                                </div>

                            </div>


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
                                        {carregandoPedidos
                                            ? "..."
                                            : pedidos.length}
                                    </strong>

                                </div>

                            </div>

                        </div>


                        {/* =================================================
                            FIDELIDADE
                        ================================================= */}

                        {usuario?.tipo !== "admin" && (

                            <div className={styles.fidelidadeCard}>

                                <div
                                    className={
                                        styles.fidelidadeHeader
                                    }
                                >

                                    <div>

                                        <span
                                            className={
                                                styles.fidelidadeLabel
                                            }
                                        >
                                            Clube de Fidelidade
                                        </span>

                                        <h3>
                                            Seus pontos
                                        </h3>

                                    </div>

                                    <div
                                        className={
                                            styles.fidelidadeNivel
                                        }
                                    >

                                        <FiStar />

                                        {carregandoFidelidade
                                            ? "..."
                                            : fidelidade?.nivel ||
                                              "Bronze"}

                                    </div>

                                </div>


                                {carregandoFidelidade ? (

                                    <div
                                        className={
                                            styles.fidelidadeLoading
                                        }
                                    >
                                        Carregando seus pontos...
                                    </div>

                                ) : erroFidelidade ? (

                                    <div
                                        className={
                                            styles.fidelidadeErro
                                        }
                                    >

                                        <span>
                                            {erroFidelidade}
                                        </span>

                                        <button
                                            type="button"
                                            onClick={
                                                buscarFidelidade
                                            }
                                        >
                                            Tentar novamente
                                        </button>

                                    </div>

                                ) : (

                                    <>

                                        <div
                                            className={
                                                styles.fidelidadePontos
                                            }
                                        >

                                            <strong>
                                                {pontosFidelidade}
                                            </strong>

                                            <span>
                                                pontos
                                            </span>

                                        </div>


                                        <div
                                            className={
                                                styles.fidelidadeBarra
                                            }
                                        >

                                            <div
                                                className={
                                                    styles.fidelidadeProgresso
                                                }
                                                style={{
                                                    width:
                                                        `${porcentagemFidelidade}%`
                                                }}
                                            />

                                        </div>


                                        <div
                                            className={
                                                styles.fidelidadeRodape
                                            }
                                        >

                                            {fidelidade?.proxima_recompensa ? (

                                                <>

                                                    <span>
                                                        {pontosFidelidade} /{" "}
                                                        {
                                                            fidelidade
                                                                .proxima_recompensa
                                                        } pontos
                                                    </span>

                                                    <strong>
                                                        Faltam{" "}
                                                        {
                                                            fidelidade
                                                                .faltam_pontos
                                                        } pontos para {" "}
                                                        {
                                                            fidelidade
                                                                .proximo_nivel
                                                        }
                                                    </strong>

                                                </>

                                            ) : (

                                                <strong>
                                                    Você alcançou todas as recompensas 
                                                </strong>

                                            )}

                                        </div>

                                    </>

                                )}


                                {/* =============================================
                                    CUPONS GUARDADOS
                                ============================================= */}

                                <div className={styles.cuponsSalvos}>

                                    <div
                                        className={
                                            styles.cuponsSalvosCabecalho
                                        }
                                    >

                                        <div>

                                            <span
                                                className={
                                                    styles.cuponsSalvosTitulo
                                                }
                                            >
                                                Cupons guardados
                                            </span>

                                            <p>
                                                Seus benefícios disponíveis
                                                ficam salvos aqui.
                                            </p>

                                        </div>


                                        <span
                                            className={
                                                styles.cuponsSalvosContador
                                            }
                                        >
                                            {cuponsSalvos.length}
                                        </span>

                                    </div>


                                    {cuponsSalvos.length > 0 ? (

                                        <div
                                            className={
                                                styles.cuponsSalvosLista
                                            }
                                        >

                                            {cuponsSalvos.map(
                                                (cupomSalvo) => (

                                                    <div
                                                        className={
                                                            styles.cupomSalvo
                                                        }
                                                        key={
                                                            cupomSalvo.id ||
                                                            cupomSalvo.codigo
                                                        }
                                                    >

                                                        <div
                                                            className={
                                                                styles.cupomSalvoInfo
                                                            }
                                                        >

                                                            <strong>
                                                                {
                                                                    cupomSalvo.codigo
                                                                }
                                                            </strong>

                                                            <span>

                                                                {String(
                                                                    cupomSalvo.tipo ||
                                                                    ""
                                                                ).toLowerCase() ===
                                                                "valor"
                                                                    ? `${formatarPreco(
                                                                        cupomSalvo.desconto ??
                                                                        cupomSalvo.valor
                                                                    )} de desconto`
                                                                    : `${Number(
                                                                        cupomSalvo.desconto ??
                                                                        cupomSalvo.valor ??
                                                                        0
                                                                    )}% de desconto`
                                                                }

                                                            </span>

                                                        </div>


                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                copiarCupom(
                                                                    cupomSalvo.codigo
                                                                )
                                                            }
                                                            title="Copiar cupom"
                                                            aria-label={
                                                                `Copiar cupom ${cupomSalvo.codigo}`
                                                            }
                                                            className={
                                                                cupomCopiado ===
                                                                cupomSalvo.codigo
                                                                    ? styles.cupomCopiado
                                                                    : ""
                                                            }
                                                        >

                                                            <FiCopy />

                                                            <span>
                                                                {cupomCopiado ===
                                                                cupomSalvo.codigo
                                                                    ? "Copiado"
                                                                    : "Copiar"}
                                                            </span>

                                                        </button>

                                                    </div>

                                                )
                                            )}

                                        </div>

                                    ) : (

                                        <div
                                            className={
                                                styles.cuponsSalvosVazio
                                            }
                                        >

                                            <FiCopy />

                                            <div>

                                                <strong>
                                                    Nenhum cupom guardado
                                                </strong>

                                                <span>
                                                    Quando você receber um
                                                    benefício de fidelidade,
                                                    ele aparecerá aqui.
                                                </span>

                                            </div>

                                        </div>

                                    )}

                                </div>

                            </div>

                        )}


                        {/* =================================================
                            NOTIFICAÇÕES
                        ================================================= */}

                        <section
                            className={
                                styles.notificacoesCard
                            }
                        >

                            <div
                                className={
                                    styles.notificacoesHeader
                                }
                            >

                                <div
                                    className={
                                        styles.notificacoesTituloArea
                                    }
                                >

                                    <div
                                        className={
                                            styles.notificacoesIcone
                                        }
                                    >
                                        <FiBell />
                                    </div>


                                    <div>

                                        <span
                                            className={
                                                styles.notificacoesLabel
                                            }
                                        >
                                            Central de notificações
                                        </span>

                                        <h3>
                                            Notificações
                                        </h3>

                                    </div>

                                </div>


                                <div
                                    className={
                                        styles.notificacoesHeaderAcoes
                                    }
                                >

                                    {notificacoesNaoLidas > 0 && (

                                        <span
                                            className={
                                                styles.notificacoesContador
                                            }
                                            title={
                                                `${notificacoesNaoLidas} notificações não lidas`
                                            }
                                        >
                                            {
                                                notificacoesNaoLidas
                                            }
                                        </span>

                                    )}


                                    <button
                                        type="button"
                                        className={
                                            styles.notificacoesAtualizar
                                        }
                                        onClick={() =>
                                            buscarNotificacoes()
                                        }
                                        disabled={
                                            carregandoNotificacoes
                                        }
                                        title="Atualizar notificações"
                                        aria-label="Atualizar notificações"
                                    >
                                        <FiRefreshCw />
                                    </button>

                                </div>

                            </div>


                            {carregandoNotificacoes ? (

                                <div
                                    className={
                                        styles.notificacoesEstado
                                    }
                                >

                                    <div
                                        className={
                                            styles.notificacoesSpinner
                                        }
                                    />

                                    <span>
                                        Carregando notificações...
                                    </span>

                                </div>

                            ) : erroNotificacoes ? (

                                <div
                                    className={
                                        styles.notificacoesErro
                                    }
                                >

                                    <FiBell />

                                    <div>

                                        <strong>
                                            Não foi possível carregar
                                        </strong>

                                        <span>
                                            {
                                                erroNotificacoes
                                            }
                                        </span>

                                    </div>


                                    <button
                                        type="button"
                                        onClick={() =>
                                            buscarNotificacoes()
                                        }
                                    >
                                        Tentar novamente
                                    </button>

                                </div>

                            ) : notificacoes.length === 0 ? (

                                <div
                                    className={
                                        styles.notificacoesVazio
                                    }
                                >

                                    <FiBell />

                                    <div>

                                        <strong>
                                            Tudo tranquilo por aqui
                                        </strong>

                                        <span>
                                            Quando houver novidades sobre
                                            pedidos, cupons ou fidelidade,
                                            elas aparecerão aqui.
                                        </span>

                                    </div>

                                </div>

                            ) : (

                                <>

                                    {notificacoesNaoLidas > 0 && (

                                        <div
                                            className={
                                                styles.notificacoesBarraAcoes
                                            }
                                        >

                                            <span>
                                                {notificacoesNaoLidas}{" "}
                                                {notificacoesNaoLidas === 1
                                                    ? "não lida"
                                                    : "não lidas"}
                                            </span>


                                            <button
                                                type="button"
                                                onClick={
                                                    marcarTodasNotificacoesComoLidas
                                                }
                                            >
                                                <FiCheck />

                                                Marcar todas como lidas
                                            </button>

                                        </div>

                                    )}


                                    <div
                                        className={
                                            styles.notificacoesLista
                                        }
                                    >

                                        {notificacoesVisiveis.map(
                                            notificacao => (

                                                <article
                                                    key={
                                                        notificacao.id
                                                    }
                                                    className={`${styles.notificacaoItem} ${
                                                        !notificacao.lida
                                                            ? styles.notificacaoNaoLida
                                                            : ""
                                                    }`}
                                                    onClick={() =>
                                                        marcarNotificacaoComoLida(
                                                            notificacao
                                                        )
                                                    }
                                                >

                                                    <div
                                                        className={
                                                            styles.notificacaoMarcador
                                                        }
                                                    />


                                                    <div
                                                        className={
                                                            styles.notificacaoConteudo
                                                        }
                                                    >

                                                        <div
                                                            className={
                                                                styles.notificacaoTopo
                                                            }
                                                        >

                                                            <span
                                                                className={
                                                                    styles.notificacaoTipo
                                                                }
                                                            >
                                                                {
                                                                    notificacao.tipo ||
                                                                    "sistema"
                                                                }
                                                            </span>

                                                            <time>
                                                                {
                                                                    formatarDataHora(
                                                                        notificacao.criado_em
                                                                    )
                                                                }
                                                            </time>

                                                        </div>


                                                        <strong>
                                                            {
                                                                notificacao.titulo
                                                            }
                                                        </strong>


                                                        <p>
                                                            {
                                                                notificacao.mensagem
                                                            }
                                                        </p>

                                                    </div>


                                                    <button
                                                        type="button"
                                                        className={
                                                            styles.notificacaoExcluir
                                                        }
                                                        onClick={
                                                            event => {

                                                                event.stopPropagation();

                                                                excluirNotificacao(
                                                                    notificacao.id
                                                                );

                                                            }
                                                        }
                                                        title="Excluir notificação"
                                                        aria-label={
                                                            `Excluir notificação ${notificacao.titulo}`
                                                        }
                                                    >
                                                        <FiTrash2 />
                                                    </button>

                                                </article>

                                            )
                                        )}

                                    </div>


                                    {notificacoes.length > 4 && (

                                        <button
                                            type="button"
                                            className={
                                                styles.notificacoesVerTodas
                                            }
                                            onClick={() =>
                                                setMostrarTodasNotificacoes(
                                                    prev => !prev
                                                )
                                            }
                                        >
                                            {mostrarTodasNotificacoes
                                                ? "Mostrar menos"
                                                : `Ver todas (${notificacoes.length})`}
                                        </button>

                                    )}

                                </>

                            )}

                        </section>


                        {/* HISTÓRICO */}

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


                        {/* SAIR */}

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


                    {/* =================================================
                        CARD DIREITO
                    ================================================= */}

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


                        <div
                            className={
                                styles.formGrid
                            }
                        >

                            {/* NOME */}

                            <div className={styles.field}>

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

                            </div>


                            {/* EMAIL */}

                            <div className={styles.field}>

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

                            </div>


                            {/* TELEFONE */}

                            <div className={styles.field}>

                                <label>
                                    Telefone
                                </label>

                                <div
                                    className={
                                        styles.inputBox
                                    }
                                >

                                    <FiPhone />

                                    <input
                                        disabled={
                                            !editando
                                        }
                                        name="telefone"
                                        value={
                                            form.telefone
                                        }
                                        onChange={
                                            handleTelefone
                                        }
                                        placeholder="(16) 99999-9999"
                                    />

                                </div>

                            </div>


                            {/* DATA */}

                            <div className={styles.field}>

                                <label>
                                    Data de nascimento
                                </label>

                                <div
                                    className={
                                        styles.inputBox
                                    }
                                >

                                    <FiCalendar />

                                    <input
                                        disabled={
                                            !editando
                                        }
                                        type="date"
                                        name="data_nascimento"
                                        value={
                                            form.data_nascimento
                                        }
                                        onChange={
                                            handleChange
                                        }
                                    />

                                </div>

                            </div>


                            {/* ENDEREÇO */}

                            <div className={styles.field}>

                                <label>
                                    Endereço
                                </label>

                                <div
                                    className={
                                        styles.inputBox
                                    }
                                >

                                    <FiHome />

                                    <input
                                        disabled={
                                            !editando
                                        }
                                        name="endereco"
                                        value={
                                            form.endereco
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Rua / Avenida"
                                    />

                                </div>

                            </div>


                            {/* NÚMERO */}

                            <div className={styles.field}>

                                <label>
                                    Número
                                </label>

                                <div
                                    className={
                                        styles.inputBox
                                    }
                                >

                                    <FiHash />

                                    <input
                                        disabled={
                                            !editando
                                        }
                                        name="numero"
                                        value={
                                            form.numero
                                        }
                                        onChange={
                                            handleChange
                                        }
                                    />

                                </div>

                            </div>


                            {/* COMPLEMENTO */}

                            <div className={styles.field}>

                                <label>
                                    Complemento
                                </label>

                                <div
                                    className={
                                        styles.inputBox
                                    }
                                >

                                    <FiHome />

                                    <input
                                        disabled={
                                            !editando
                                        }
                                        name="complemento"
                                        value={
                                            form.complemento
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Casa, apartamento..."
                                    />

                                </div>

                            </div>


                            {/* BAIRRO */}

                            <div className={styles.field}>

                                <label>
                                    Bairro
                                </label>

                                <div
                                    className={
                                        styles.inputBox
                                    }
                                >

                                    <FiMapPin />

                                    <input
                                        disabled={
                                            !editando
                                        }
                                        name="bairro"
                                        value={
                                            form.bairro
                                        }
                                        onChange={
                                            handleChange
                                        }
                                    />

                                </div>

                            </div>


                            {/* CIDADE */}

                            <div className={styles.field}>

                                <label>
                                    Cidade
                                </label>

                                <div
                                    className={
                                        styles.inputBox
                                    }
                                >

                                    <FiMap />

                                    <input
                                        disabled={
                                            !editando
                                        }
                                        name="cidade"
                                        value={
                                            form.cidade
                                        }
                                        onChange={
                                            handleChange
                                        }
                                    />

                                </div>

                            </div>


                            {/* ESTADO */}

                            <div className={styles.field}>

                                <label>
                                    Estado
                                </label>

                                <div
                                    className={
                                        styles.inputBox
                                    }
                                >

                                    <FiMap />

                                    <input
                                        disabled={
                                            !editando
                                        }
                                        name="estado"
                                        value={
                                            form.estado
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        maxLength={2}
                                        placeholder="SP"
                                    />

                                </div>

                            </div>


                            {/* CEP */}

                            <div className={styles.field}>

                                <label>
                                    CEP
                                </label>

                                <div
                                    className={
                                        styles.inputBox
                                    }
                                >

                                    <FiMapPin />

                                    <input
                                        disabled={
                                            !editando
                                        }
                                        name="cep"
                                        value={
                                            form.cep
                                        }
                                        onChange={
                                            handleCep
                                        }
                                        placeholder="00000-000"
                                    />

                                </div>

                            </div>


                            {/* SENHA */}

                            {editando && (

                                <div className={styles.field}>

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

                                </div>

                            )}

                        </div>


                        {/* INFORMAÇÕES DO SISTEMA */}

                        <div
                            className={
                                styles.systemInfo
                            }
                        >

                            <h3>
                                Informações da conta
                            </h3>

                            <div
                                className={
                                    styles.systemGrid
                                }
                            >

                                <div>

                                    <span>
                                        ID do usuário
                                    </span>

                                    <strong>
                                        #{usuario?.id || "-"}
                                    </strong>

                                </div>


                                <div>

                                    <span>
                                        Tipo
                                    </span>

                                    <strong>
                                        {usuario?.tipo || "-"}
                                    </strong>

                                </div>


                                <div>

                                    <span>
                                        Criado em
                                    </span>

                                    <strong>
                                        {formatarDataHora(
                                            usuario?.criado_em
                                        )}
                                    </strong>

                                </div>


                                <div>

                                    <span>
                                        Última atualização
                                    </span>

                                    <strong>
                                        {formatarDataHora(
                                            usuario?.atualizado_em
                                        )}
                                    </strong>

                                </div>

                            </div>

                        </div>


                        <form
                            className={styles.feedbackBox}
                            onSubmit={enviarFeedback}
                        >

                            <div className={styles.feedbackHeader}>
                                <div>
                                    <h3>Deixe seu feedback</h3>
                                    <p>Conte como foi sua experiência com a Tintas Cia.</p>
                                </div>
                               
                            </div>

                            <div className={styles.rating} aria-label="Avaliação de 1 a 5 estrelas">
                                {[1, 2, 3, 4, 5].map(valor => (
                                    <button
                                        key={valor}
                                        type="button"
                                        className={valor <= notaFeedback ? styles.starActive : styles.starInactive}
                                        onClick={() => setNotaFeedback(valor)}
                                        aria-label={`${valor} estrela${valor > 1 ? "s" : ""}`}
                                    >
                                        <FiStar />
                                    </button>
                                ))}
                            </div>

                            <textarea
                                value={comentarioFeedback}
                                onChange={event => setComentarioFeedback(event.target.value)}
                                placeholder="Escreva seu comentário"
                                maxLength={500}
                                disabled={enviandoFeedback}
                            />

                            <div className={styles.feedbackFooter}>
                                <span>{comentarioFeedback.length}/500</span>
                                <button type="submit" disabled={enviandoFeedback}>
                                    <FiSave />
                                    {enviandoFeedback ? "Enviando..." : "Enviar feedback"}
                                </button>
                            </div>

                            {mensagemFeedback && (
                                <p className={`${styles.feedbackMessage} ${styles[tipoMensagemFeedback]}`}>
                                    {mensagemFeedback}
                                </p>
                            )}

                        </form>

                    </section>

                </div>

            </main>


            {/* ==========================================================
                MODAL
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
                            event =>
                                event.stopPropagation()
                        }
                    >

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

                                    {carregandoPedidos
                                        ? "Carregando..."
                                        : `${pedidos.length} ${
                                            pedidos.length === 1
                                                ? "pedido realizado"
                                                : "pedidos realizados"
                                        }`
                                    }

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
                            >

                                <FiX />

                            </button>

                        </div>


                        <div
                            className={
                                styles.modalContent
                            }
                        >

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
                                            Você ainda não realizou
                                            nenhuma compra.
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
                                                                    Pedido #{pedido.id}
                                                                </strong>

                                                            </div>

                                                            <span
                                                                className={
                                                                    styles.dataPedido
                                                                }
                                                            >

                                                                <FiClock />

                                                                {
                                                                    formatarDataHora(
                                                                        pedido.criado_em
                                                                    )
                                                                }

                                                            </span>

                                                        </div>


                                                        <span
                                                            className={
                                                                classeStatus(
                                                                    pedido.status
                                                                )
                                                            }
                                                        >
                                                            {
                                                                pedido.status ||
                                                                "Pendente"
                                                            }
                                                        </span>

                                                    </div>


                                                    <div
                                                        className={
                                                            styles.itensPedido
                                                        }
                                                    >

                                                        {pedido.itens?.map(
                                                            item => (

                                                                <div
                                                                    className={
                                                                        styles.itemPedido
                                                                    }
                                                                    key={
                                                                        item.id
                                                                    }
                                                                >

                                                                    <div
                                                                        className={
                                                                            styles.produtoImagem
                                                                        }
                                                                    >

                                                                        {item.foto ? (

                                                                            <img
                                                                                src={
                                                                                    obterUrlFoto(
                                                                                        item.foto
                                                                                    )
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
                                                                            styles.produtoInfo
                                                                        }
                                                                    >

                                                                        <strong>
                                                                            {
                                                                                item.nome
                                                                            }
                                                                        </strong>

                                                                        <span>
                                                                            {
                                                                                item.quantidade
                                                                            }{" "}
                                                                            x{" "}
                                                                            {
                                                                                formatarPreco(
                                                                                    item.preco
                                                                                )
                                                                            }
                                                                        </span>

                                                                    </div>


                                                                    <strong
                                                                        className={
                                                                            styles.subtotal
                                                                        }
                                                                    >
                                                                        {
                                                                            formatarPreco(
                                                                                item.subtotal
                                                                            )
                                                                        }
                                                                    </strong>

                                                                </div>

                                                            )
                                                        )}

                                                    </div>


                                                    <div
                                                        className={
                                                            styles.pedidoFooter
                                                        }
                                                    >

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
                                                                {
                                                                    pedido.metodo_pagamento ||
                                                                    "-"
                                                                }
                                                            </strong>

                                                        </div>


                                                        <div
                                                            className={
                                                                styles.totalPedido
                                                            }
                                                        >

                                                            <span>
                                                                Total
                                                            </span>

                                                            <strong>
                                                                {
                                                                    formatarPreco(
                                                                        pedido.total
                                                                    )
                                                                }
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

            {modalFeedback && (

                <div className={styles.feedbackModalOverlay}>

                    <div className={styles.feedbackModal} role="dialog" aria-modal="true">

                        <p>Feedback enviado com sucesso !</p>

                        <button
                            type="button"
                            onClick={() => setModalFeedback(false)}
                        >
                            Continuar
                        </button>

                    </div>

                </div>

            )}

        </div>

    );

}
