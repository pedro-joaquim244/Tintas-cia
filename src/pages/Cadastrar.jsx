import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { api } from "../services/api.js";

import styles from "../styles/Cadastrar.module.css";

import {
    FiSave,
    FiArrowLeft,
    FiUpload,
    FiCheckCircle,
    FiX
} from "react-icons/fi";

import Cabecalho from "../components/Cabeçalho-ADM/Cabecalho.jsx";


export default function Cadastrar() {

    const navigate = useNavigate();


    // =====================================================
    // ESTADOS
    // =====================================================

    const [nome, setNome] = useState("");

    const [descricao, setDescricao] = useState("");

    const [preco, setPreco] = useState("");

    const [quantidade, setQuantidade] = useState("");

    const [categoria, setCategoria] = useState("");

    const [marca, setMarca] = useState("");

    const [cor, setCor] = useState("");

    const [foto, setFoto] = useState(null);

    const [preview, setPreview] = useState(null);

    const [erro, setErro] = useState("");

    const [loading, setLoading] = useState(false);

    const [modal, setModal] = useState(false);


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

        "Outros"

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

        "PIXEL COLOR"

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

                {
                    nome: "Incolor",
                    cor: "#F8FAFC"
                }

            ]

        },

        {
            titulo: "Brancos",

            descricao:
                "Tons claros e delicados para ambientes leves e elegantes.",

            cores: [

                {
                    nome: "Gelo",
                    cor: "#F2F0E9"
                },

                {
                    nome: "Branco Neve",
                    cor: "#FFFFFF"
                },

                {
                    nome: "Algodão",
                    cor: "#F7F5ED"
                },

                {
                    nome: "Marfim",
                    cor: "#EFE6D0"
                },

                {
                    nome: "Pérola",
                    cor: "#E8E1D5"
                },

                {
                    nome: "Off White",
                    cor: "#F4F1E8"
                },

                {
                    nome: "Palha",
                    cor: "#E7D8B5"
                },

                {
                    nome: "Areia",
                    cor: "#DCC9AA"
                },

                {
                    nome: "Baunilha",
                    cor: "#F1E2B8"
                },

                {
                    nome: "Branco Antigo",
                    cor: "#EDE7D9"
                }

            ]

        },


        {
            titulo: "Neutros",

            descricao:
                "Cores versáteis que combinam com diferentes estilos.",

            cores: [

                {
                    nome: "Cinza Claro",
                    cor: "#D6D6D2"
                },

                {
                    nome: "Cinza Médio",
                    cor: "#A8A9A4"
                },

                {
                    nome: "Chumbo",
                    cor: "#55585C"
                },

                {
                    nome: "Grafite",
                    cor: "#383B3D"
                },

                {
                    nome: "Taupe",
                    cor: "#8B8178"
                },

                {
                    nome: "Fendi",
                    cor: "#B9A99A"
                },

                {
                    nome: "Cappuccino",
                    cor: "#B89B7A"
                },

                {
                    nome: "Caramelo",
                    cor: "#B87941"
                },

                {
                    nome: "Café",
                    cor: "#6F4E37"
                },

                {
                    nome: "Chocolate",
                    cor: "#4B3025"
                }

            ]

        },


        {
            titulo: "Vermelhos",

            descricao:
                "Tons marcantes para criar ambientes cheios de personalidade.",

            cores: [

                {
                    nome: "Vermelho Vivo",
                    cor: "#D71920"
                },

                {
                    nome: "Vermelho Paixão",
                    cor: "#C1121F"
                },

                {
                    nome: "Cereja",
                    cor: "#A4161A"
                },

                {
                    nome: "Marsala",
                    cor: "#8E3B46"
                },

                {
                    nome: "Bordô",
                    cor: "#6D071A"
                },

                {
                    nome: "Terracota",
                    cor: "#C45A3C"
                },

                {
                    nome: "Coral",
                    cor: "#F0806A"
                },

                {
                    nome: "Rubi",
                    cor: "#9B111E"
                },

                {
                    nome: "Rosé",
                    cor: "#D98C8C"
                },

                {
                    nome: "Vinho",
                    cor: "#722F37"
                }

            ]

        },


        {
            titulo: "Amarelos",

            descricao:
                "Tons quentes e alegres para iluminar seus espaços.",

            cores: [

                {
                    nome: "Amarelo Sol",
                    cor: "#FFD21F"
                },

                {
                    nome: "Dourado",
                    cor: "#E5A900"
                },

                {
                    nome: "Mostarda",
                    cor: "#C9A227"
                },

                {
                    nome: "Manteiga",
                    cor: "#F4D77D"
                },

                {
                    nome: "Milho",
                    cor: "#F5C400"
                },

                {
                    nome: "Canário",
                    cor: "#FFDF00"
                },

                {
                    nome: "Mel",
                    cor: "#D9A441"
                },

                {
                    nome: "Limão",
                    cor: "#D9E44B"
                },

                {
                    nome: "Champagne",
                    cor: "#E8D9A8"
                },

                {
                    nome: "Âmbar",
                    cor: "#D68B00"
                }

            ]

        },


        {
            titulo: "Azuis",

            descricao:
                "Tons que transmitem tranquilidade, frescor e sofisticação.",

            cores: [

                {
                    nome: "Azul Céu",
                    cor: "#72B7E6"
                },

                {
                    nome: "Azul Bebê",
                    cor: "#A9D6F5"
                },

                {
                    nome: "Azul Royal",
                    cor: "#2855B5"
                },

                {
                    nome: "Azul Marinho",
                    cor: "#102A56"
                },

                {
                    nome: "Azul Turquesa",
                    cor: "#21B6C7"
                },

                {
                    nome: "Azul Piscina",
                    cor: "#55C6D8"
                },

                {
                    nome: "Azul Petróleo",
                    cor: "#176B78"
                },

                {
                    nome: "Azul Serenity",
                    cor: "#91A8D0"
                },

                {
                    nome: "Azul Jeans",
                    cor: "#496A91"
                },

                {
                    nome: "Azul Profundo",
                    cor: "#183B70"
                }

            ]

        },


        {
            titulo: "Verdes",

            descricao:
                "Tons inspirados na natureza para trazer equilíbrio.",

            cores: [

                {
                    nome: "Verde Folha",
                    cor: "#5B8C51"
                },

                {
                    nome: "Verde Musgo",
                    cor: "#687B3E"
                },

                {
                    nome: "Verde Oliva",
                    cor: "#7B7F32"
                },

                {
                    nome: "Verde Menta",
                    cor: "#9AD9C2"
                },

                {
                    nome: "Verde Água",
                    cor: "#65C8B5"
                },

                {
                    nome: "Verde Esmeralda",
                    cor: "#188A63"
                },

                {
                    nome: "Verde Floresta",
                    cor: "#245B3A"
                },

                {
                    nome: "Verde Sálvia",
                    cor: "#A8B89F"
                },

                {
                    nome: "Verde Pistache",
                    cor: "#B5C96B"
                },

                {
                    nome: "Verde Militar",
                    cor: "#596B4B"
                }

            ]

        },


        {
            titulo: "Roxos & Lilases",

            descricao:
                "Tons delicados e sofisticados para ambientes modernos.",

            cores: [

                {
                    nome: "Lavanda",
                    cor: "#B9A3D9"
                },

                {
                    nome: "Lilás",
                    cor: "#C8A2C8"
                },

                {
                    nome: "Violeta",
                    cor: "#7952A8"
                },

                {
                    nome: "Roxo",
                    cor: "#633A8A"
                },

                {
                    nome: "Ametista",
                    cor: "#9966CC"
                },

                {
                    nome: "Orquídea",
                    cor: "#BA55D3"
                },

                {
                    nome: "Uva",
                    cor: "#5F2A72"
                },

                {
                    nome: "Malva",
                    cor: "#B784A7"
                },

                {
                    nome: "Íris",
                    cor: "#6F5AA8"
                },

                {
                    nome: "Roxo Profundo",
                    cor: "#43245F"
                }

            ]

        },


        {
            titulo: "Rosas",

            descricao:
                "Tons românticos e modernos para deixar o ambiente acolhedor.",

            cores: [

                {
                    nome: "Rosa Bebê",
                    cor: "#F4C2C2"
                },

                {
                    nome: "Rosa Claro",
                    cor: "#F1A7B8"
                },

                {
                    nome: "Rosa Chá",
                    cor: "#DFA0A9"
                },

                {
                    nome: "Rosa Antigo",
                    cor: "#C08081"
                },

                {
                    nome: "Rosa Pink",
                    cor: "#E83E8C"
                },

                {
                    nome: "Fúcsia",
                    cor: "#C2185B"
                },

                {
                    nome: "Rosa Coral",
                    cor: "#F88379"
                },

                {
                    nome: "Blush",
                    cor: "#E8B4B8"
                },

                {
                    nome: "Rosa Goiaba",
                    cor: "#D96C75"
                },

                {
                    nome: "Rosa Nude",
                    cor: "#D8A7A7"
                }

            ]

        }

    ];


    // =====================================================
    // BUSCAR INFORMAÇÕES DA COR SELECIONADA
    // =====================================================

    const corSelecionada = gruposCores
        .flatMap((grupo) => grupo.cores)
        .find((item) => item.nome === cor);


    // =====================================================
    // SELECIONAR IMAGEM
    // =====================================================

    function selecionarImagem(event) {

        const arquivo =
            event.target.files[0];


        if (!arquivo) {
            return;
        }


        const tiposPermitidos = [

            "image/png",

            "image/jpeg",

            "image/webp"

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

        setFoto(arquivo);


        const imagemUrl =
            URL.createObjectURL(
                arquivo
            );


        setPreview(
            imagemUrl
        );

    }


    // =====================================================
    // CADASTRAR
    // =====================================================

    async function cadastrarItens(event) {

        event.preventDefault();


        try {

            setErro("");


            // =================================================
            // VALIDAÇÕES
            // =================================================

            if (!nome.trim()) {

                setErro(
                    "Digite o nome do produto."
                );

                return;

            }


            if (!categoria) {

                setErro(
                    "Selecione uma categoria para o produto."
                );

                return;

            }


            if (!marca) {

                setErro(
                    "Selecione a marca da tinta."
                );

                return;

            }


            if (!cor) {

                setErro(
                    "Selecione a cor da tinta."
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


            setLoading(true);


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
                "categoria",
                categoria
            );


            // =================================================
            // MARCA
            // =================================================

            dados.append(
                "marca",
                marca
            );


            // =================================================
            // COR
            // =================================================

            dados.append(
                "cor",
                cor
            );


            dados.append(
                "status",
                "Ativo"
            );


            if (foto) {

                dados.append(
                    "foto",
                    foto
                );

            }


            await api.post(
                "/itens",
                dados,
                {
                    headers: {

                        "Content-Type":
                            "multipart/form-data"

                    }
                }
            );


            setModal(true);


        } catch (error) {

            console.error(
                "ERRO AO CADASTRAR:",
                error.response?.data ||
                error
            );


            setErro(
                error.response?.data?.erro ||
                "Erro ao cadastrar o item."
            );


        } finally {

            setLoading(false);

        }

    }


    // =====================================================
    // LIMPAR FORMULÁRIO
    // =====================================================

    function limparFormulario() {

        setNome("");

        setDescricao("");

        setPreco("");

        setQuantidade("");

        setCategoria("");

        setMarca("");

        setCor("");

        setFoto(null);

        setPreview(null);

        setErro("");

        setModal(false);

    }


    // =====================================================
    // RENDER
    // =====================================================

    return (

        <div className={styles.content}>

            <Cabecalho />


            <main className={styles.main}>


                {/* =================================================
                    TOPO
                ================================================= */}

                <div className={styles.top}>

                    <h1 className={styles.sectionTitle}>
                        Cadastrar Produto
                    </h1>


                    <p className={styles.subtitle}>
                        Preencha as informações abaixo para cadastrar um novo produto.
                    </p>

                </div>


                {/* =================================================
                    ERRO
                ================================================= */}

                {erro && (

                    <p className={styles.error}>
                        {erro}
                    </p>

                )}


                {/* =================================================
                    FORMULÁRIO
                ================================================= */}

                <form
                    className={styles.form}
                    onSubmit={cadastrarItens}
                >


                    {/* =================================================
                        LADO ESQUERDO
                    ================================================= */}

                    <div className={styles.leftSide}>


                        {/* =================================================
                            INFORMAÇÕES BÁSICAS
                        ================================================= */}

                        <div className={styles.box}>

                            <div className={styles.boxHeader}>
                                Informações básicas
                            </div>


                            <div className={styles.boxContent}>


                                {/* =================================================
                                    NOME
                                ================================================= */}

                                <div className={styles.inputGroup}>

                                    <label>
                                        Nome do produto *
                                    </label>


                                    <input
                                        value={nome}
                                        onChange={(e) =>
                                            setNome(
                                                e.target.value
                                            )
                                        }
                                        type="text"
                                        placeholder="Ex.: Tinta Acrílica Premium Fosca Branca 18L"
                                    />

                                </div>


                                {/* =================================================
                                    CATEGORIA
                                ================================================= */}

                                <div className={styles.inputGroup}>

                                    <label>
                                        Categoria *
                                    </label>


                                    <select
                                        value={categoria}
                                        onChange={(e) =>
                                            setCategoria(
                                                e.target.value
                                            )
                                        }
                                    >

                                        <option value="">
                                            Selecione uma categoria
                                        </option>


                                        {categorias.map(
                                            (item) => (

                                                <option
                                                    key={item}
                                                    value={item}
                                                >
                                                    {item}
                                                </option>

                                            )
                                        )}

                                    </select>

                                </div>


                                {/* =================================================
                                    MARCA E COR
                                ================================================= */}

                                <div className={styles.grid2}>


                                    {/* =============================================
                                        MARCA
                                    ============================================= */}

                                    <div className={styles.inputGroup}>

                                        <label>
                                            Marca da tinta *
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
                                                (item) => (

                                                    <option
                                                        key={item}
                                                        value={item}
                                                    >
                                                        {item}
                                                    </option>

                                                )
                                            )}

                                        </select>

                                    </div>


                                    {/* =============================================
                                        COR
                                    ============================================= */}

                                    <div className={styles.inputGroup}>

                                        <label>
                                            Cor da tinta *
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

                                </div>


                                {/* =================================================
                                    PRÉVIA DA COR SELECIONADA
                                ================================================= */}

                                {corSelecionada && (

                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "12px",
                                            marginTop: "4px",
                                            padding: "12px 14px",
                                            border: "1px solid #e5e7eb",
                                            borderRadius: "10px",
                                            background: "#fafafa"
                                        }}
                                    >

                                        <div
                                            style={{
                                                width: "34px",
                                                height: "34px",
                                                flexShrink: 0,
                                                borderRadius: "50%",
                                                background:
                                                    corSelecionada.cor,
                                                border:
                                                    "1px solid rgba(15, 23, 42, 0.12)",
                                                boxShadow:
                                                    "0 2px 7px rgba(15, 23, 42, 0.08)"
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
                                                {corSelecionada.nome}
                                            </strong>


                                            <span
                                                style={{
                                                    color: "#76808f",
                                                    fontSize: "11px"
                                                }}
                                            >
                                                {corSelecionada.cor}
                                            </span>

                                        </div>

                                    </div>

                                )}


                                {/* =================================================
                                    PREÇO E QUANTIDADE
                                ================================================= */}

                                <div className={styles.grid2}>

                                    <div className={styles.inputGroup}>

                                        <label>
                                            Preço *
                                        </label>


                                        <input
                                            value={preco}
                                            onChange={(e) =>
                                                setPreco(
                                                    e.target.value
                                                )
                                            }
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            placeholder="Ex.: 259.90"
                                        />

                                    </div>


                                    <div className={styles.inputGroup}>

                                        <label>
                                            Quantidade *
                                        </label>


                                        <input
                                            value={
                                                quantidade
                                            }
                                            onChange={(e) =>
                                                setQuantidade(
                                                    e.target.value
                                                )
                                            }
                                            type="number"
                                            min="0"
                                            placeholder="Ex.: 25"
                                        />

                                    </div>

                                </div>

                            </div>

                        </div>


                        {/* =================================================
                            DESCRIÇÃO
                        ================================================= */}

                        <div className={styles.box}>

                            <div className={styles.boxHeader}>
                                Descrição
                            </div>


                            <div className={styles.boxContent}>

                                <div className={styles.inputGroup}>

                                    <label>
                                        Descrição completa
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
                                        placeholder="Detalhes do produto, características, indicações de uso..."
                                    />

                                </div>

                            </div>

                        </div>

                    </div>


                    {/* =================================================
                        LADO DIREITO
                    ================================================= */}

                    <div className={styles.rightSide}>


                        {/* =================================================
                            IMAGEM
                        ================================================= */}

                        <div className={styles.box}>

                            <div className={styles.boxHeader}>
                                Imagem do produto
                            </div>


                            <div className={styles.boxContent}>

                                <label
                                    className={
                                        styles.uploadBox
                                    }
                                >

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
                                            className={
                                                styles.previewImage
                                            }
                                            alt="Preview"
                                        />

                                    ) : (

                                        <>

                                            <FiUpload
                                                className={
                                                    styles.uploadIcon
                                                }
                                            />


                                            <p>
                                                Clique para enviar uma imagem
                                            </p>


                                            <small>
                                                PNG, JPG ou WEBP até 5MB
                                            </small>

                                        </>

                                    )}

                                </label>

                            </div>

                        </div>


                        {/* =================================================
                            AÇÕES
                        ================================================= */}

                        <div className={styles.box}>

                            <div className={styles.boxHeader}>
                                Ações
                            </div>


                            <div className={styles.boxContent}>

                                <div className={styles.buttons}>


                                    <button
                                        type="button"
                                        className={`
                                            ${styles.btn}
                                            ${styles.btnSecondary}
                                        `}
                                        onClick={() =>
                                            navigate(
                                                "/admin/produtos"
                                            )
                                        }
                                    >

                                        <FiArrowLeft
                                            className={
                                                styles.svg1
                                            }
                                        />

                                        Cancelar

                                    </button>


                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className={`
                                            ${styles.btn}
                                            ${styles.btnPrimary}
                                        `}
                                    >

                                        <FiSave
                                            className={
                                                styles.svg2
                                            }
                                        />


                                        {loading
                                            ? "Salvando..."
                                            : "Salvar"
                                        }

                                    </button>

                                </div>

                            </div>

                        </div>

                    </div>

                </form>


                {/* =================================================
                    MODAL
                ================================================= */}

                {modal && (

                    <div className={styles.modalOverlay}>

                        <div className={styles.modal}>


                            <button
                                type="button"
                                className={
                                    styles.closeModal
                                }
                                onClick={() =>
                                    setModal(false)
                                }
                            >

                                <FiX />

                            </button>


                            <FiCheckCircle
                                className={
                                    styles.successIcon
                                }
                            />


                            <h2>
                                Produto cadastrado!
                            </h2>


                            <p>
                                O produto foi salvo com sucesso
                                no sistema.
                            </p>


                            <div className={styles.modalButtons}>

                                <button
                                    type="button"
                                    className={`
                                        ${styles.btn}
                                        ${styles.btnSecondary}
                                    `}
                                    onClick={
                                        limparFormulario
                                    }
                                >
                                    Continuar cadastrando
                                </button>


                                <button
                                    type="button"
                                    className={`
                                        ${styles.btn}
                                        ${styles.btnPrimary}
                                    `}
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

            </main>

        </div>

    );

}