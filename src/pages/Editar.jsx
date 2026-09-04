import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { api } from "../services/api.js";

import {
    FiSave,
    FiArrowLeft,
    FiTrash2,
    FiUpload,
    FiCheckCircle,
    FiX,
} from "react-icons/fi";

import styles from "../styles/Editar.module.css";

import Cabecalho from "../components/Cabeçalho-ADM/Cabecalho.jsx";


export default function Editar() {

    const navigate = useNavigate();

    const { id } = useParams();


    // =====================================================
    // ESTADOS
    // =====================================================

    const [nome, setNome] = useState("");

    const [descricao, setDescricao] = useState("");

    const [preco, setPreco] = useState("");

    const [quantidade, setQuantidade] = useState("");

    const [status, setStatus] = useState("Ativo");

    const [categoria, setCategoria] = useState("");

    const [marca, setMarca] = useState("");

    const [cor, setCor] = useState("");

    const [novaFoto, setNovaFoto] = useState(null);

    const [preview, setPreview] = useState("");

    const [erro, setErro] = useState("");

    const [modalSucesso, setModalSucesso] = useState(false);

    const [modalExcluir, setModalExcluir] = useState(false);


    // =====================================================
    // CATEGORIAS
    // =====================================================

    const categorias = [

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

        "Outros",

    ];


    // =====================================================
    // MARCAS
    // =====================================================

    const marcas = [

        "SUVINIL",

        "CORAL",

        "SHERWIN-WILLIAMS",

        "EUCATEX",

        "ANJO",

        "PIXEL COLOR",

    ];


    // =====================================================
    // CORES
    // =====================================================

    const gruposCores = [

        {

            titulo: "Sem pigmentação",

            descricao:
                "Produtos sem cor, como pincéis, rolos e acessórios.",

            cores: [

                { nome: "Incolor", cor: "#F8FAFC" },

            ],

        },

        {
            titulo: "Brancos",

            descricao:
                "Tons claros e delicados para ambientes leves e elegantes.",

            cores: [

                { nome: "Gelo", cor: "#F2F0E9" },

                { nome: "Branco Neve", cor: "#FFFFFF" },

                { nome: "Algodão", cor: "#F7F5ED" },

                { nome: "Marfim", cor: "#EFE6D0" },

                { nome: "Pérola", cor: "#E8E1D5" },

                { nome: "Off White", cor: "#F4F1E8" },

                { nome: "Palha", cor: "#E7D8B5" },

                { nome: "Areia", cor: "#DCC9AA" },

                { nome: "Baunilha", cor: "#F1E2B8" },

                { nome: "Branco Antigo", cor: "#EDE7D9" },

            ],

        },


        {
            titulo: "Neutros",

            descricao:
                "Cores versáteis que combinam com diferentes estilos.",

            cores: [

                { nome: "Cinza Claro", cor: "#D6D6D2" },

                { nome: "Cinza Médio", cor: "#A8A9A4" },

                { nome: "Chumbo", cor: "#55585C" },

                { nome: "Grafite", cor: "#383B3D" },

                { nome: "Taupe", cor: "#8B8178" },

                { nome: "Fendi", cor: "#B9A99A" },

                { nome: "Cappuccino", cor: "#B89B7A" },

                { nome: "Caramelo", cor: "#B87941" },

                { nome: "Café", cor: "#6F4E37" },

                { nome: "Chocolate", cor: "#4B3025" },

            ],

        },


        {
            titulo: "Vermelhos",

            descricao:
                "Tons marcantes para criar ambientes cheios de personalidade.",

            cores: [

                { nome: "Vermelho Vivo", cor: "#D71920" },

                { nome: "Vermelho Paixão", cor: "#C1121F" },

                { nome: "Cereja", cor: "#A4161A" },

                { nome: "Marsala", cor: "#8E3B46" },

                { nome: "Bordô", cor: "#6D071A" },

                { nome: "Terracota", cor: "#C45A3C" },

                { nome: "Coral", cor: "#F0806A" },

                { nome: "Rubi", cor: "#9B111E" },

                { nome: "Rosé", cor: "#D98C8C" },

                { nome: "Vinho", cor: "#722F37" },

            ],

        },


        {
            titulo: "Amarelos",

            descricao:
                "Tons quentes e alegres para iluminar seus espaços.",

            cores: [

                { nome: "Amarelo Sol", cor: "#FFD21F" },

                { nome: "Dourado", cor: "#E5A900" },

                { nome: "Mostarda", cor: "#C9A227" },

                { nome: "Manteiga", cor: "#F4D77D" },

                { nome: "Milho", cor: "#F5C400" },

                { nome: "Canário", cor: "#FFDF00" },

                { nome: "Mel", cor: "#D9A441" },

                { nome: "Limão", cor: "#D9E44B" },

                { nome: "Champagne", cor: "#E8D9A8" },

                { nome: "Âmbar", cor: "#D68B00" },

            ],

        },


        {
            titulo: "Azuis",

            descricao:
                "Tons que transmitem tranquilidade, frescor e sofisticação.",

            cores: [

                { nome: "Azul Céu", cor: "#72B7E6" },

                { nome: "Azul Bebê", cor: "#A9D6F5" },

                { nome: "Azul Royal", cor: "#2855B5" },

                { nome: "Azul Marinho", cor: "#102A56" },

                { nome: "Azul Turquesa", cor: "#21B6C7" },

                { nome: "Azul Piscina", cor: "#55C6D8" },

                { nome: "Azul Petróleo", cor: "#176B78" },

                { nome: "Azul Serenity", cor: "#91A8D0" },

                { nome: "Azul Jeans", cor: "#496A91" },

                { nome: "Azul Profundo", cor: "#183B70" },

            ],

        },


        {
            titulo: "Verdes",

            descricao:
                "Tons inspirados na natureza para trazer equilíbrio.",

            cores: [

                { nome: "Verde Folha", cor: "#5B8C51" },

                { nome: "Verde Musgo", cor: "#687B3E" },

                { nome: "Verde Oliva", cor: "#7B7F32" },

                { nome: "Verde Menta", cor: "#9AD9C2" },

                { nome: "Verde Água", cor: "#65C8B5" },

                { nome: "Verde Esmeralda", cor: "#188A63" },

                { nome: "Verde Floresta", cor: "#245B3A" },

                { nome: "Verde Sálvia", cor: "#A8B89F" },

                { nome: "Verde Pistache", cor: "#B5C96B" },

                { nome: "Verde Militar", cor: "#596B4B" },

            ],

        },


        {
            titulo: "Roxos & Lilases",

            descricao:
                "Tons delicados e sofisticados para ambientes modernos.",

            cores: [

                { nome: "Lavanda", cor: "#B9A3D9" },

                { nome: "Lilás", cor: "#C8A2C8" },

                { nome: "Violeta", cor: "#7952A8" },

                { nome: "Roxo", cor: "#633A8A" },

                { nome: "Ametista", cor: "#9966CC" },

                { nome: "Orquídea", cor: "#BA55D3" },

                { nome: "Uva", cor: "#5F2A72" },

                { nome: "Malva", cor: "#B784A7" },

                { nome: "Íris", cor: "#6F5AA8" },

                { nome: "Roxo Profundo", cor: "#43245F" },

            ],

        },


        {
            titulo: "Rosas",

            descricao:
                "Tons românticos e modernos para deixar o ambiente acolhedor.",

            cores: [

                { nome: "Rosa Bebê", cor: "#F4C2C2" },

                { nome: "Rosa Claro", cor: "#F1A7B8" },

                { nome: "Rosa Chá", cor: "#DFA0A9" },

                { nome: "Rosa Antigo", cor: "#C08081" },

                { nome: "Rosa Pink", cor: "#E83E8C" },

                { nome: "Fúcsia", cor: "#C2185B" },

                { nome: "Rosa Coral", cor: "#F88379" },

                { nome: "Blush", cor: "#E8B4B8" },

                { nome: "Rosa Goiaba", cor: "#D96C75" },

                { nome: "Rosa Nude", cor: "#D8A7A7" },

            ],

        },

    ];


    // =====================================================
    // COR SELECIONADA
    // =====================================================

    const corSelecionada = gruposCores
        .flatMap((grupo) => grupo.cores)
        .find((item) => item.nome === cor);


    // =====================================================
    // CARREGAR PRODUTO
    // =====================================================

    useEffect(() => {

        carregarItem();

    }, [id]);


    async function carregarItem() {

        try {

            setErro("");


            const resposta =
                await api.get(`/itens/${id}`);


            const item =
                resposta.data;


            setNome(
                item.nome || ""
            );


            setDescricao(
                item.descricao || ""
            );


            setPreco(
                item.preco ?? ""
            );


            setQuantidade(
                item.quantidade ?? ""
            );


            setStatus(
                item.status || "Ativo"
            );


            setCategoria(
                item.categoria || ""
            );


            // =================================================
            // MARCA
            // =================================================

            setMarca(
                item.marca || ""
            );


            // =================================================
            // COR
            // =================================================

            setCor(
                item.cor || ""
            );


            // =================================================
            // FOTO
            // =================================================

            if (item.foto) {

                if (
                    item.foto.startsWith("http://") ||
                    item.foto.startsWith("https://")
                ) {

                    setPreview(
                        item.foto
                    );

                } else {

                    setPreview(
                        `http://localhost:3333/${item.foto}`
                    );

                }

            } else {

                setPreview("");

            }


        } catch (error) {

            console.error(error);


            setErro(
                "Erro ao carregar produto."
            );

        }

    }


    // =====================================================
    // SELECIONAR IMAGEM
    // =====================================================

    function selecionarImagem(e) {

        const arquivo =
            e.target.files[0];


        if (!arquivo) {
            return;
        }


        const tiposPermitidos = [

            "image/png",

            "image/jpeg",

            "image/webp",

        ];


        if (
            !tiposPermitidos.includes(
                arquivo.type
            )
        ) {

            setErro(
                "Formato inválido. Use PNG, JPG ou WEBP."
            );

            return;

        }


        if (
            arquivo.size >
            5 * 1024 * 1024
        ) {

            setErro(
                "A imagem deve ter no máximo 5MB."
            );

            return;

        }


        setErro("");

        setNovaFoto(
            arquivo
        );

        setPreview(
            URL.createObjectURL(
                arquivo
            )
        );

    }


    // =====================================================
    // EDITAR PRODUTO
    // =====================================================

    async function editarItem(e) {

        e.preventDefault();


        try {

            setErro("");


            // =================================================
            // VALIDAÇÕES
            // =================================================

            if (!nome.trim()) {

                setErro(
                    "Informe o nome do produto."
                );

                return;

            }


            if (
                preco === "" ||
                Number(preco) < 0
            ) {

                setErro(
                    "Informe um preço válido."
                );

                return;

            }


            if (
                quantidade === "" ||
                Number(quantidade) < 0
            ) {

                setErro(
                    "Informe uma quantidade válida."
                );

                return;

            }


            if (!categoria) {

                setErro(
                    "Selecione uma categoria."
                );

                return;

            }


            if (!marca) {

                setErro(
                    "Selecione uma marca."
                );

                return;

            }


            if (!cor) {

                setErro(
                    "Selecione uma cor."
                );

                return;

            }


            // =================================================
            // FORM DATA
            // =================================================

            const dados =
                new FormData();


            dados.append(
                "nome",
                nome.trim()
            );


            dados.append(
                "descricao",
                descricao.trim()
            );


            dados.append(
                "preco",
                Number(preco)
            );


            dados.append(
                "quantidade",
                Number(quantidade)
            );


            dados.append(
                "status",
                status
            );


            dados.append(
                "categoria",
                categoria
            );


            dados.append(
                "marca",
                marca
            );


            dados.append(
                "cor",
                cor
            );


            if (novaFoto) {

                dados.append(
                    "foto",
                    novaFoto
                );

            }


            await api.put(
                `/itens/${id}`,
                dados,
                {

                    headers: {

                        "Content-Type":
                            "multipart/form-data",

                    },

                }
            );


            setModalSucesso(true);


        } catch (error) {

            console.error(
                "ERRO AO ATUALIZAR:",
                error.response?.data ||
                error
            );


            setErro(
                error.response?.data?.erro ||
                "Erro ao atualizar produto."
            );

        }

    }


    // =====================================================
    // EXCLUIR
    // =====================================================

    async function excluirProduto() {

        try {

            await api.delete(
                `/itens/${id}`
            );


            navigate(
                "/admin/produtos"
            );


        } catch (error) {

            console.error(error);


            setErro(
                "Erro ao excluir produto."
            );


            setModalExcluir(
                false
            );

        }

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

                <div className={styles.top}>


                    <div className={styles.titleArea}>

                        <span className={styles.badge}>
                            Administração
                        </span>


                        <h1>
                            Editar Produto
                        </h1>


                        <p>
                            Atualize as informações, categoria,
                            marca, cor e imagem do produto.
                        </p>

                    </div>


                    <div className={styles.actions}>


                        <button
                            type="button"
                            className={`
                                ${styles.btn}
                                ${styles.btnCancel}
                            `}
                            onClick={() =>
                                navigate(
                                    "/admin/produtos"
                                )
                            }
                        >

                            <FiArrowLeft />

                            Voltar

                        </button>


                        <button
                            form="formEditar"
                            type="submit"
                            className={`
                                ${styles.btn}
                                ${styles.btnSave}
                            `}
                        >

                            <FiSave />

                            Salvar

                        </button>

                    </div>

                </div>


                {/* =================================================
                    ERRO
                ================================================= */}

                {erro && (

                    <div className={styles.error}>
                        {erro}
                    </div>

                )}


                {/* =================================================
                    CARD
                ================================================= */}

                <div className={styles.card}>


                    <form
                        id="formEditar"
                        onSubmit={editarItem}
                    >

                        <div className={styles.grid}>


                            {/* =================================================
                                IMAGEM
                            ================================================= */}

                            <div className={styles.imageArea}>


                                <div className={styles.sectionHeader}>

                                    <h2>
                                        Imagem
                                    </h2>

                                    <span>
                                        Clique para trocar.
                                    </span>

                                </div>


                                <label className={styles.preview}>

                                    <input
                                        type="file"
                                        hidden
                                        accept="image/png,image/jpeg,image/webp"
                                        onChange={
                                            selecionarImagem
                                        }
                                    />


                                    {preview ? (

                                        <img
                                            src={preview}
                                            alt={
                                                nome ||
                                                "Produto"
                                            }
                                            onError={(e) => {

                                                e.currentTarget.style.display =
                                                    "none";

                                            }}
                                        />

                                    ) : (

                                        <div
                                            className={
                                                styles.semImagem
                                            }
                                        >

                                            <FiUpload
                                                size={60}
                                            />


                                            <p>
                                                Clique para escolher uma imagem
                                            </p>

                                        </div>

                                    )}

                                </label>


                                {novaFoto && (

                                    <div
                                        className={
                                            styles.fileInfo
                                        }
                                    >

                                        {novaFoto.name}

                                    </div>

                                )}


                                <label
                                    className={
                                        styles.uploadBtn
                                    }
                                >

                                    <FiUpload />

                                    Escolher outra imagem


                                    <input
                                        hidden
                                        type="file"
                                        accept="image/png,image/jpeg,image/webp"
                                        onChange={
                                            selecionarImagem
                                        }
                                    />

                                </label>

                            </div>


                            {/* =================================================
                                FORMULÁRIO
                            ================================================= */}

                            <div className={styles.formArea}>


                                <div className={styles.sectionHeader}>

                                    <h2>
                                        Informações
                                    </h2>

                                    <span>
                                        Atualize os dados do produto.
                                    </span>

                                </div>


                                <div className={styles.formGrid}>


                                    {/* =================================================
                                        NOME
                                    ================================================= */}

                                    <div className={styles.inputGroup}>

                                        <label>
                                            Nome
                                        </label>


                                        <input
                                            type="text"
                                            value={nome}
                                            onChange={(e) =>
                                                setNome(
                                                    e.target.value
                                                )
                                            }
                                            placeholder="Nome do produto"
                                        />

                                    </div>


                                    {/* =================================================
                                        PREÇO
                                    ================================================= */}

                                    <div className={styles.inputGroup}>

                                        <label>
                                            Preço
                                        </label>


                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={preco}
                                            onChange={(e) =>
                                                setPreco(
                                                    e.target.value
                                                )
                                            }
                                            placeholder="Ex.: 259.90"
                                        />

                                    </div>


                                    {/* =================================================
                                        QUANTIDADE
                                    ================================================= */}

                                    <div className={styles.inputGroup}>

                                        <label>
                                            Quantidade
                                        </label>


                                        <input
                                            type="number"
                                            min="0"
                                            value={
                                                quantidade
                                            }
                                            onChange={(e) =>
                                                setQuantidade(
                                                    e.target.value
                                                )
                                            }
                                            placeholder="Quantidade em estoque"
                                        />

                                    </div>


                                    {/* =================================================
                                        STATUS
                                    ================================================= */}

                                    <div className={styles.inputGroup}>

                                        <label>
                                            Status
                                        </label>


                                        <select
                                            value={status}
                                            onChange={(e) =>
                                                setStatus(
                                                    e.target.value
                                                )
                                            }
                                            className={
                                                styles.selectStatus
                                            }
                                        >

                                            <option value="Ativo">
                                                Ativo
                                            </option>


                                            <option value="Esgotado">
                                                Esgotado
                                            </option>


                                            <option value="Inativo">
                                                Inativo
                                            </option>

                                        </select>

                                    </div>


                                    {/* =================================================
                                        MARCA
                                    ================================================= */}

                                    <div className={styles.inputGroup}>

                                        <label>
                                            Marca *
                                        </label>


                                        <select
                                            value={marca}
                                            onChange={(e) =>
                                                setMarca(
                                                    e.target.value
                                                )
                                            }
                                        >

                                            <option value="">
                                                Selecione uma marca
                                            </option>


                                            {marcas.map(
                                                (nomeMarca) => (

                                                    <option
                                                        key={nomeMarca}
                                                        value={nomeMarca}
                                                    >
                                                        {nomeMarca}
                                                    </option>

                                                )
                                            )}

                                        </select>

                                    </div>


                                    {/* =================================================
                                        COR
                                    ================================================= */}

                                    <div className={styles.inputGroup}>

                                        <label>
                                            Cor *
                                        </label>


                                        <select
                                            value={cor}
                                            onChange={(e) =>
                                                setCor(
                                                    e.target.value
                                                )
                                            }
                                        >

                                            <option value="">
                                                Selecione uma cor
                                            </option>


                                            {gruposCores.map(
                                                (grupo) => (

                                                    <optgroup
                                                        key={
                                                            grupo.titulo
                                                        }
                                                        label={
                                                            grupo.titulo
                                                        }
                                                    >

                                                        {grupo.cores.map(
                                                            (item) => (

                                                                <option
                                                                    key={
                                                                        item.nome
                                                                    }
                                                                    value={
                                                                        item.nome
                                                                    }
                                                                >
                                                                    {
                                                                        item.nome
                                                                    }
                                                                </option>

                                                            )
                                                        )}

                                                    </optgroup>

                                                )
                                            )}

                                        </select>

                                    </div>


                                    {/* =================================================
                                        PRÉVIA DA COR
                                    ================================================= */}

                                    {corSelecionada && (

                                        <div
                                            className={`${styles.inputGroup} ${styles.fullWidth}`}
                                        >

                                            <label>
                                                Cor selecionada
                                            </label>


                                            <div
                                                style={{
                                                    minHeight: "58px",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: "13px",
                                                    padding: "10px 14px",
                                                    border: "1px solid #e2e7ee",
                                                    borderRadius: "10px",
                                                    background: "#fafbfc"
                                                }}
                                            >

                                                <div
                                                    style={{
                                                        width: "36px",
                                                        height: "36px",
                                                        flexShrink: 0,
                                                        borderRadius: "50%",
                                                        background:
                                                            corSelecionada.cor,
                                                        border:
                                                            "1px solid rgba(15,23,42,.12)",
                                                        boxShadow:
                                                            "0 2px 8px rgba(15,23,42,.08)"
                                                    }}
                                                />


                                                <div>

                                                    <strong
                                                        style={{
                                                            display: "block",
                                                            color: "#172033",
                                                            fontSize: "13px",
                                                            fontWeight: "600"
                                                        }}
                                                    >
                                                        {
                                                            corSelecionada.nome
                                                        }
                                                    </strong>


                                                    <span
                                                        style={{
                                                            color: "#7b8491",
                                                            fontSize: "11px"
                                                        }}
                                                    >
                                                        {
                                                            corSelecionada.cor
                                                        }
                                                    </span>

                                                </div>

                                            </div>

                                        </div>

                                    )}


                                    {/* =================================================
                                        CATEGORIA
                                    ================================================= */}

                                    <div
                                        className={`
                                            ${styles.inputGroup}
                                            ${styles.categoriaGroup}
                                        `}
                                    >

                                        <label>
                                            Categoria
                                        </label>


                                        <select
                                            value={categoria}
                                            onChange={(e) =>
                                                setCategoria(
                                                    e.target.value
                                                )
                                            }
                                            className={
                                                styles.selectCategoria
                                            }
                                        >

                                            <option value="">
                                                Selecione uma categoria
                                            </option>


                                            {categorias.map(
                                                (
                                                    nomeCategoria
                                                ) => (

                                                    <option
                                                        key={
                                                            nomeCategoria
                                                        }
                                                        value={
                                                            nomeCategoria
                                                        }
                                                    >
                                                        {
                                                            nomeCategoria
                                                        }
                                                    </option>

                                                )
                                            )}

                                        </select>


                                        <small>
                                            A categoria define em qual seção o
                                            produto aparecerá na loja.
                                        </small>

                                    </div>


                                    {/* =================================================
                                        DESCRIÇÃO
                                    ================================================= */}

                                    <div
                                        className={`
                                            ${styles.inputGroup}
                                            ${styles.fullWidth}
                                        `}
                                    >

                                        <label>
                                            Descrição
                                        </label>


                                        <textarea
                                            value={
                                                descricao
                                            }
                                            onChange={(e) =>
                                                setDescricao(
                                                    e.target.value
                                                )
                                            }
                                            placeholder="Descrição completa do produto..."
                                        />

                                    </div>

                                </div>

                            </div>

                        </div>

                    </form>


                    {/* =================================================
                        EXCLUIR
                    ================================================= */}

                    <div className={styles.deleteArea}>

                        <button
                            type="button"
                            className={styles.btnDanger}
                            onClick={() =>
                                setModalExcluir(
                                    true
                                )
                            }
                        >

                            <FiTrash2 />

                            Excluir Produto

                        </button>

                    </div>

                </div>


                {/* =================================================
                    MODAL SUCESSO
                ================================================= */}

                {modalSucesso && (

                    <div className={styles.modalOverlay}>

                        <div className={styles.modal}>


                            <button
                                className={
                                    styles.closeModal
                                }
                                onClick={() =>
                                    setModalSucesso(
                                        false
                                    )
                                }
                            >

                                <FiX />

                            </button>


                            <FiCheckCircle
                                className={
                                    styles.modalIcon
                                }
                            />


                            <h2>
                                Produto atualizado!
                            </h2>


                            <p>
                                As alterações, incluindo categoria,
                                marca e cor, foram salvas com sucesso.
                            </p>


                            <div className={styles.modalButtons}>

                                <button
                                    className={
                                        styles.btnModal
                                    }
                                    onClick={() =>
                                        setModalSucesso(
                                            false
                                        )
                                    }
                                >
                                    Continuar editando
                                </button>


                                <button
                                    className={
                                        styles.btnModalPrimary
                                    }
                                    onClick={() =>
                                        navigate(
                                            "/admin/produtos"
                                        )
                                    }
                                >
                                    Ir para Produtos
                                </button>

                            </div>

                        </div>

                    </div>

                )}


                {/* =================================================
                    MODAL EXCLUIR
                ================================================= */}

                {modalExcluir && (

                    <div className={styles.modalOverlay}>

                        <div className={styles.modal}>


                            <button
                                className={
                                    styles.closeModal
                                }
                                onClick={() =>
                                    setModalExcluir(
                                        false
                                    )
                                }
                            >

                                <FiX />

                            </button>


                            <FiTrash2
                                className={
                                    styles.modalDelete
                                }
                            />


                            <h2>
                                Excluir produto?
                            </h2>


                            <p>
                                Esta ação não poderá ser desfeita.
                            </p>


                            <div className={styles.modalButtons}>

                                <button
                                    className={
                                        styles.btnModal
                                    }
                                    onClick={() =>
                                        setModalExcluir(
                                            false
                                        )
                                    }
                                >
                                    Cancelar
                                </button>


                                <button
                                    className={
                                        styles.btnDanger
                                    }
                                    onClick={
                                        excluirProduto
                                    }
                                >
                                    Excluir
                                </button>

                            </div>

                        </div>

                    </div>

                )}

            </main>

        </div>

    );

}