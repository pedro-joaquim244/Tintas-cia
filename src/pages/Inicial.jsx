import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";

import {
    FiShoppingCart,
    FiDroplet,
    FiShield,
    FiAward,
    FiStar,
    FiTruck,
    FiMessageSquare,
    FiChevronLeft,
    FiChevronRight,
    FiHeadphones,
    FiUsers,
    FiPackage,
    FiX,
    FiCopy,
    FiCheck,
    FiGift
} from "react-icons/fi";

import Header from "../components/Cabeçalho-Users";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import styles from "../styles/Inicial.module.css";

/* =========================================================
   CUPONS DA ROLETA
========================================================= */

const CUPONS_ROLETA = {
    5: "tintas5",
    10: "tintas10",
    20: "tintas20",
    30: "tintas30"
};

const API_URL =
    import.meta.env.VITE_API_URL ||
    "http://localhost:3333";

/* =========================================================
   URL DA FOTO
========================================================= */

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

    if (
        caminho.startsWith("http://") ||
        caminho.startsWith("https://") ||
        caminho.startsWith("data:")
    ) {
        return caminho;
    }

    caminho = caminho.replace(/^\.?\//, "");

    if (caminho.startsWith("uploads/")) {
        return `${API_URL}/${caminho}`;
    }

    return `${API_URL}/uploads/${caminho}`;
}

/* =========================================================
   COMPONENTE
========================================================= */

export default function Inicial() {
    const navigate = useNavigate();

    const wheelRef = useRef(null);
    const testimonialsRef = useRef(null);

    const [usuario, setUsuario] = useState(null);

    const [girando, setGirando] = useState(false);
    const [resultadoRoleta, setResultadoRoleta] = useState(null);
    const [modalRoleta, setModalRoleta] = useState(false);
    const [codigoCopiado, setCodigoCopiado] = useState(false);

    const [feedbacks, setFeedbacks] = useState([]);
    const [carregandoFeedbacks, setCarregandoFeedbacks] =
        useState(true);

    const [estatisticas, setEstatisticas] = useState({
        clientes: 0,
        produtos: 0
    });

    const [paginaMarcas, setPaginaMarcas] = useState(0);

    /* =====================================================
       MARCAS
    ===================================================== */

    const marcas = [
        {
            nome: "Suvinil",
            descricao: "Qualidade e inovação",
            classe: "suvinil"
        },
        {
            nome: "Coral",
            descricao: "Cores que transformam",
            classe: "coral"
        },
        {
            nome: "Sherwin-Williams",
            descricao: "Tecnologia em pintura",
            classe: "sherwin"
        },
        {
            nome: "Eucatex",
            descricao: "Soluções para sua obra",
            classe: "eucatex"
        },
        {
            nome: "Iquine",
            descricao: "Pintura de qualidade",
            classe: "iquine"
        },
        {
            nome: "Lukscolor",
            descricao: "Cor e proteção",
            classe: "lukscolor"
        }
    ];

    /* =====================================================
       USUÁRIO
    ===================================================== */

    useEffect(() => {
        try {
            const usuarioSalvo =
                localStorage.getItem("usuario");

            if (usuarioSalvo) {
                const usuarioConvertido =
                    JSON.parse(usuarioSalvo);

                setUsuario(usuarioConvertido);
            }
        } catch (error) {
            console.error(
                "Erro ao carregar usuário:",
                error
            );
        }
    }, []);

    /* =====================================================
       VERIFICA SE JÁ RODOU A ROLETA
    ===================================================== */

    useEffect(() => {
        if (!usuario?.id) {
            return;
        }

        try {
            const resultadoSalvo =
                localStorage.getItem(
                    `roleta_${usuario.id}`
                );

            if (resultadoSalvo) {
                const resultado =
                    JSON.parse(resultadoSalvo);

                setResultadoRoleta(resultado);
            }
        } catch (error) {
            console.error(
                "Erro ao recuperar resultado da roleta:",
                error
            );
        }
    }, [usuario]);

    /* =====================================================
       BUSCAR FEEDBACKS
    ===================================================== */

    useEffect(() => {
        const buscarFeedbacks = async () => {
            try {
                setCarregandoFeedbacks(true);

                const response =
                    await api.get("/feedbacks");

                const dados =
                    Array.isArray(response.data)
                        ? response.data
                        : [];

                setFeedbacks(dados);
            } catch (error) {
                console.error(
                    "Erro ao carregar feedbacks:",
                    error
                );

                setFeedbacks([]);
            } finally {
                setCarregandoFeedbacks(false);
            }
        };

        buscarFeedbacks();
    }, []);

    /* =========================================================
       BUSCAR ESTATÍSTICAS
    ========================================================= */

    useEffect(() => {
        const buscarEstatisticas = async () => {
            try {
                const response =
                    await api.get("/dashboard");

                const resumo =
                    response.data?.resumo || {};

                setEstatisticas({
                    clientes: Number(
                        resumo.clientes || 0
                    ),
                    produtos: Number(
                        resumo.produtos || 0
                    )
                });
            } catch (error) {
                console.error(
                    "Erro ao carregar estatísticas:",
                    error
                );
            }
        };

        buscarEstatisticas();
    }, []);

    /* =========================================================
       ROLAR FEEDBACKS MANUALMENTE
    ========================================================= */

    const rolarFeedbacks = (direcao) => {
        if (!testimonialsRef.current) {
            return;
        }

        const container =
            testimonialsRef.current;

        const card =
            container.querySelector(
                `.${styles.testimonialCard}`
            );

        if (!card) {
            return;
        }

        const gap = 24;

        const quantidade =
            card.offsetWidth + gap;

        container.scrollBy({
            left:
                direcao === "left"
                    ? -quantidade
                    : quantidade,
            behavior: "smooth"
        });
    };

    /* =========================================================
       SORTEAR DESCONTO
    ========================================================= */

    const sortearDesconto = () => {
        const descontos = [5, 10, 20, 30];

        const indice = Math.floor(
            Math.random() * descontos.length
        );

        return descontos[indice];
    };

    /* =========================================================
       GIRAR ROLETA
    ========================================================= */

    const girarRoleta = () => {
        if (girando) {
            return;
        }

        if (!usuario?.id) {
            alert(
                "Faça login para participar da roleta de descontos."
            );

            navigate("/login");

            return;
        }

        if (resultadoRoleta) {
            setModalRoleta(true);
            return;
        }

        if (!wheelRef.current) {
            return;
        }

        setGirando(true);

        const desconto = sortearDesconto();

        const codigo =
            CUPONS_ROLETA[desconto];

        const angulos = {
            5: 315,
            10: 225,
            20: 135,
            30: 45
        };

        const anguloPremio =
            angulos[desconto];

        const voltas = 5;

        const rotacaoFinal =
            voltas * 360 + anguloPremio;

        gsap.to(wheelRef.current, {
            rotation: rotacaoFinal,
            duration: 5.2,
            ease: "power4.out",

            onComplete: () => {
                const resultado = {
                    desconto,
                    codigo
                };

                setResultadoRoleta(resultado);

                localStorage.setItem(
                    `roleta_${usuario.id}`,
                    JSON.stringify(resultado)
                );

                setGirando(false);

                setTimeout(() => {
                    setModalRoleta(true);
                }, 350);
            }
        });
    };

    /* =========================================================
       COPIAR CUPOM
    ========================================================= */

    const copiarCupom = async () => {
        if (!resultadoRoleta?.codigo) {
            return;
        }

        try {
            await navigator.clipboard.writeText(
                resultadoRoleta.codigo
            );

            setCodigoCopiado(true);

            setTimeout(() => {
                setCodigoCopiado(false);
            }, 2000);
        } catch (error) {
            console.error(
                "Erro ao copiar cupom:",
                error
            );
        }
    };

    /* =========================================================
       IR PARA CARRINHO
    ========================================================= */

    const irParaCarrinho = () => {
        setModalRoleta(false);
        navigate("/carrinho");
    };

    /* =========================================================
       FECHAR MODAL
    ========================================================= */

    const fecharModal = () => {
        setModalRoleta(false);
        setCodigoCopiado(false);
    };

    /* =========================================================
       MARCAS VISÍVEIS
    ========================================================= */

    const marcasPorPagina = 6;

    const totalPaginasMarcas =
        Math.ceil(
            marcas.length / marcasPorPagina
        );

    const marcasVisiveis = marcas.slice(
        paginaMarcas * marcasPorPagina,
        paginaMarcas * marcasPorPagina +
            marcasPorPagina
    );

    useEffect(() => {
        if (totalPaginasMarcas <= 1) {
            return;
        }

        const intervalo = setInterval(() => {
            setPaginaMarcas(paginaAtual =>
                (paginaAtual + 1) % totalPaginasMarcas
            );
        }, 4500);

        return () => clearInterval(intervalo);
    }, [totalPaginasMarcas]);

    /* =========================================================
       ESTATÍSTICAS
    ========================================================= */

    const quantidadeFeedbacks =
        feedbacks.length;

    const mediaNotas =
        feedbacks.length > 0
            ? (
                  feedbacks.reduce(
                      (total, feedback) =>
                          total +
                          Number(
                              feedback.nota || 0
                          ),
                      0
                  ) / feedbacks.length
              ).toFixed(1)
            : "5.0";

    const formatarEstatistica = (valor) =>
        Number(valor).toLocaleString("pt-BR");

    /* =========================================================
       JSX
    ========================================================= */

    return (
        <div className={styles.container}>
            <Header />

            {/* =================================================
                HERO
            ================================================= */}

            <section className={styles.hero}>
                <div className={styles.heroText}>
                    <h1>
                        Transforme
                        <br />
                        seus espaços
                        <br />
                        com <span>cor.</span>
                    </h1>

                    <p>
                        Encontre as melhores tintas,
                        ferramentas e soluções para
                        deixar cada ambiente exatamente
                        do seu jeito.
                    </p>

                    <div className={styles.heroButtons}>
                        <button
                            className={
                                styles.primaryButton
                            }
                            onClick={() =>
                                navigate(
                                    "/cliente/produtos"
                                )
                            }
                        >
                            <FiShoppingCart />
                            Ver produtos
                        </button>

                        <button
                            className={
                                styles.secondaryButton
                            }
                            onClick={() =>
                                document
                                    .getElementById(
                                        "sobre"
                                    )
                                    ?.scrollIntoView({
                                        behavior:
                                            "smooth"
                                    })
                            }
                        >
                            <FiDroplet />
                            Conheça nossa loja
                        </button>
                    </div>

                    <div
                        className={
                            styles.heroBenefits
                        }
                    >
                        <div>
                            <FiShield />

                            <div>
                                <strong>
                                    Compra segura
                                </strong>

                                <span>
                                    Seus dados protegidos
                                </span>
                            </div>
                        </div>

                        <div>
                            <FiTruck />

                            <div>
                                <strong>
                                    Entrega rápida
                                </strong>

                                <span>
                                    Receba onde estiver
                                </span>
                            </div>
                        </div>

                        <div>
                            <FiAward />

                            <div>
                                <strong>
                                    Qualidade garantida
                                </strong>

                                <span>
                                    Grandes marcas
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* =================================================
                    ILUSTRAÇÃO
                ================================================= */}

                <div className={styles.heroImage}>
                    <div
                        className={
                            styles.paintArtwork
                        }
                    >
                        <div
                            className={
                                styles.paintCan
                            }
                        >
                            <div
                                className={
                                    styles.paintCanTop
                                }
                            />

                            <div
                                className={
                                    styles.paintCanBody
                                }
                            >
                                <div
                                    className={
                                        styles.paintDrips
                                    }
                                >
                                    <i />
                                    <i />
                                    <i />
                                    <i />
                                </div>

                                <div
                                    className={
                                        styles.paintCanLabel
                                    }
                                >
                                    <strong>
                                        TINTAS+
                                    </strong>

                                    <span>
                                        PREMIUM
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div
                            className={
                                styles.paintRoller
                            }
                        >
                            <div
                                className={
                                    styles.rollerHandle
                                }
                            />

                            <div
                                className={
                                    styles.rollerGrip
                                }
                            >
                                <span />
                            </div>
                        </div>

                        <div
                            className={
                                styles.paintSheets
                            }
                        >
                            <i />
                            <i />
                            <i />
                            <i />
                        </div>
                    </div>
                </div>
            </section>

            {/* =================================================
                ESTATÍSTICAS + ROLETA
            ================================================= */}

            <section
                className={
                    styles.statsDiscount
                }
            >
                <div
                    className={
                        styles.statsCard
                    }
                >
                    <div
                        className={
                            styles.statItem
                        }
                    >
                        <div
                            className={
                                styles.statIcon
                            }
                        >
                            <FiUsers />
                        </div>

                        <strong>
                            +
                            {formatarEstatistica(
                                estatisticas.clientes
                            )}
                        </strong>

                        <span>
                            clientes satisfeitos
                        </span>
                    </div>

                    <div
                        className={
                            styles.statItem
                        }
                    >
                        <div
                            className={
                                styles.statIcon
                            }
                        >
                            <FiPackage />
                        </div>

                        <strong>
                            +
                            {formatarEstatistica(
                                estatisticas.produtos
                            )}
                        </strong>

                        <span>
                            produtos disponíveis
                        </span>
                    </div>

                    <div
                        className={
                            styles.statItem
                        }
                    >
                        <div
                            className={
                                styles.statIcon
                            }
                        >
                            <FiStar />
                        </div>

                        <strong>
                            {mediaNotas}
                        </strong>

                        <span>
                            média das avaliações
                        </span>
                    </div>

                    <div
                        className={
                            styles.statItem
                        }
                    >
                        <div
                            className={
                                styles.statIcon
                            }
                        >
                            <FiMessageSquare />
                        </div>

                        <strong>
                            {quantidadeFeedbacks > 0
                                ? quantidadeFeedbacks
                                : "+100"}
                        </strong>

                        <span>
                            avaliações recebidas
                        </span>
                    </div>
                </div>

                {/* =================================================
                    CARD DA ROLETA
                ================================================= */}

                <div
                    className={
                        styles.discountCard
                    }
                >
                    <div
                        className={
                            styles.discountText
                        }
                    >
                        <div
                            className={
                                styles.discountTitleIcon
                            }
                        >
                            <FiGift />
                        </div>

                        <h3>
                            Quer ganhar desconto?
                        </h3>

                        <p>
                            Gire a roleta e descubra
                            quantos % de desconto você
                            ganhou para sua próxima compra.
                        </p>

                        <button
                            onClick={girarRoleta}
                            disabled={girando}
                        >
                            {girando
                                ? "Girando..."
                                : resultadoRoleta
                                ? "Ver meu desconto"
                                : "Girar roleta"}
                        </button>

                        <small>
                            {resultadoRoleta
                                ? "Você já participou da roleta."
                                : "Disponível uma vez por usuário."}
                        </small>
                    </div>

                    <div
                        className={
                            styles.wheelArea
                        }
                    >
                        <div
                            className={
                                styles.wheelPointer
                            }
                        />

                        <div
                            ref={wheelRef}
                            className={
                                styles.discountWheel
                            }
                        >
                            <span
                                className={`${styles.wheelText} ${styles.wheelTextOne}`}
                            >
                                5%
                            </span>

                            <span
                                className={`${styles.wheelText} ${styles.wheelTextTwo}`}
                            >
                                10%
                            </span>

                            <span
                                className={`${styles.wheelText} ${styles.wheelTextThree}`}
                            >
                                20%
                            </span>

                            <span
                                className={`${styles.wheelText} ${styles.wheelTextFour}`}
                            >
                                30%
                            </span>

                            <div
                                className={
                                    styles.wheelCenter
                                }
                            >
                                <FiGift />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* =================================================
                SOBRE
            ================================================= */}

            <section
                id="sobre"
                className={styles.about}
            >
                <div
                    className={
                        styles.aboutHeader
                    }
                >
                    <span>
                        Por que escolher a Tintas+
                    </span>

                    <h2>
                        Tudo para sua pintura
                    </h2>

                    <p>
                        Trabalhamos para oferecer
                        produtos de qualidade, segurança
                        e praticidade para todos os tipos
                        de projetos.
                    </p>
                </div>

                <div
                    className={
                        styles.aboutGrid
                    }
                >
                    <div
                        className={
                            styles.aboutCard
                        }
                    >
                        <div
                            className={
                                styles.aboutIcon
                            }
                        >
                            <FiDroplet />
                        </div>

                        <h3>
                            Grande variedade
                        </h3>

                        <p>
                            Encontre tintas, ferramentas,
                            acessórios e tudo o que precisa
                            para sua pintura.
                        </p>
                    </div>

                    <div
                        className={
                            styles.aboutCard
                        }
                    >
                        <div
                            className={
                                styles.aboutIcon
                            }
                        >
                            <FiShield />
                        </div>

                        <h3>
                            Compra segura
                        </h3>

                        <p>
                            Seus dados e suas compras
                            protegidos do início ao fim.
                        </p>
                    </div>

                    <div
                        className={
                            styles.aboutCard
                        }
                    >
                        <div
                            className={
                                styles.aboutIcon
                            }
                        >
                            <FiAward />
                        </div>

                        <h3>
                            Grandes marcas
                        </h3>

                        <p>
                            Produtos das principais marcas
                            do mercado de tintas.
                        </p>
                    </div>

                    <div
                        className={
                            styles.aboutCard
                        }
                    >
                        <div
                            className={
                                styles.aboutIcon
                            }
                        >
                            <FiHeadphones />
                        </div>

                        <h3>
                            Atendimento
                        </h3>

                        <p>
                            Estamos sempre prontos para
                            ajudar você a encontrar a melhor
                            solução.
                        </p>
                    </div>
                </div>
            </section>

            {/* =================================================
                MARCAS
            ================================================= */}

            <section
                className={styles.brands}
            >
                <h2>
                    Trabalhamos com as{" "}
                    <span>
                        melhores marcas
                    </span>
                </h2>

                <div
                    className={
                        styles.brandsSlider
                    }
                >
                    <button
                        className={
                            styles.brandArrow
                        }
                        onClick={() =>
                            setPaginaMarcas(
                                Math.max(
                                    0,
                                    paginaMarcas - 1
                                )
                            )
                        }
                        disabled={
                            paginaMarcas === 0
                        }
                    >
                        <FiChevronLeft />
                    </button>

                    <div
                        key={paginaMarcas}
                        className={
                            styles.brandList
                        }
                    >
                        {marcasVisiveis.map(
                            (marca) => (
                                <div
                                    key={
                                        marca.nome
                                    }
                                    className={
                                        styles.brandCard
                                    }
                                >
                                    <strong
                                        className={
                                            styles[
                                                marca.classe
                                            ]
                                        }
                                    >
                                        {marca.nome}
                                    </strong>

                                    <small>
                                        {
                                            marca.descricao
                                        }
                                    </small>
                                </div>
                            )
                        )}
                    </div>

                    <button
                        className={
                            styles.brandArrow
                        }
                        onClick={() =>
                            setPaginaMarcas(
                                Math.min(
                                    totalPaginasMarcas -
                                        1,
                                    paginaMarcas + 1
                                )
                            )
                        }
                        disabled={
                            paginaMarcas >=
                            totalPaginasMarcas - 1
                        }
                    >
                        <FiChevronRight />
                    </button>
                </div>

                <div
                    className={
                        styles.brandDots
                    }
                >
                    {Array.from({
                        length: totalPaginasMarcas
                    }).map((_, index) => (
                        <i
                            key={index}
                            className={
                                paginaMarcas === index
                                    ? styles.active
                                    : ""
                            }
                        />
                    ))}
                </div>
            </section>

            {/* =================================================
                AVALIAÇÕES
            ================================================= */}

            <section
                className={
                    styles.testimonials
                }
            >
                <div
                    className={
                        styles.feedbackSectionHeader
                    }
                >
                    <div
                        className={
                            styles.feedbackIntro
                        }
                    >
                        <span>
                            O que nossos clientes dizem
                        </span>

                        <h2>
                            Experiências que
                            <strong>
                                {" "}
                                fazem a diferença.
                            </strong>
                        </h2>

                        <p>
                            Confira as avaliações de quem
                            já comprou com a Tintas+.
                        </p>
                    </div>

                    <div
                        className={
                            styles.feedbackScoreCard
                        }
                    >
                        <strong
                            className={
                                styles.feedbackScoreNumber
                            }
                        >
                            {mediaNotas}
                        </strong>

                        <div>
                            <div
                                className={
                                    styles.feedbackScoreStars
                                }
                            >
                                {[1, 2, 3, 4, 5].map(
                                    (star) => (
                                        <FiStar
                                            key={star}
                                            className={
                                                star <=
                                                Math.round(
                                                    Number(
                                                        mediaNotas
                                                    )
                                                )
                                                    ? styles.starActive
                                                    : styles.starInactive
                                            }
                                        />
                                    )
                                )}
                            </div>

                            <span>
                                Avaliação dos clientes
                            </span>
                        </div>
                    </div>
                </div>

                <div
                    className={
                        styles.carouselWrapper
                    }
                >
                    <button
                        className={`${styles.carouselButton} ${styles.carouselButtonLeft}`}
                        onClick={() =>
                            rolarFeedbacks("left")
                        }
                        aria-label="Avaliações anteriores"
                    >
                        <FiChevronLeft />
                    </button>

                    <div
                        ref={testimonialsRef}
                        className={
                            styles.testimonialsGrid
                        }
                    >
                        {carregandoFeedbacks ? (
                            <div
                                className={
                                    styles.feedbackLoading
                                }
                            >
                                <div
                                    className={
                                        styles.loadingSpinner
                                    }
                                />

                                <p>
                                    Carregando avaliações...
                                </p>
                            </div>
                        ) : feedbacks.length === 0 ? (
                            <div
                                className={
                                    styles.feedbackEmpty
                                }
                            >
                                <FiMessageSquare />

                                <h3>
                                    Ainda não há avaliações
                                </h3>

                                <p>
                                    Seja o primeiro a avaliar
                                    nossa loja.
                                </p>
                            </div>
                        ) : (
                            /*
                             * DUPLICAÇÃO DOS FEEDBACKS
                             *
                             * Isso cria a segunda sequência
                             * necessária para o carrossel infinito.
                             */
                            [...feedbacks, ...feedbacks].map(
                                (feedback, index) => {
                                    const nome =
                                        feedback.nome ||
                                        feedback.usuario_nome ||
                                        feedback.usuario?.nome ||
                                        "Cliente";

                                    const inicial =
                                        nome
                                            .charAt(0)
                                            .toUpperCase();

                                    const foto =
                                        feedback.foto ||
                                        feedback.usuario_foto;

                                    return (
                                        <article
                                            key={`${feedback.id}-${index}`}
                                            className={
                                                styles.testimonialCard
                                            }
                                        >
                                            <div
                                                className={
                                                    styles.testimonialTop
                                                }
                                            >
                                                <div
                                                    className={
                                                        styles.testiIconWrapper
                                                    }
                                                >
                                                    <FiMessageSquare
                                                        className={
                                                            styles.testiIcon
                                                        }
                                                    />
                                                </div>

                                                <div
                                                    className={
                                                        styles.feedbackRating
                                                    }
                                                >
                                                    {[1, 2, 3, 4, 5].map(
                                                        (
                                                            star
                                                        ) => (
                                                            <FiStar
                                                                key={
                                                                    star
                                                                }
                                                                className={
                                                                    star <=
                                                                    Number(
                                                                        feedback.nota ||
                                                                            0
                                                                    )
                                                                        ? styles.starActive
                                                                        : styles.starInactive
                                                                }
                                                            />
                                                        )
                                                    )}
                                                </div>
                                            </div>

                                            <div
                                                className={
                                                    styles.feedbackCardScore
                                                }
                                            >
                                                <strong>
                                                    {Number(
                                                        feedback.nota ||
                                                            0
                                                    ).toFixed(
                                                        1
                                                    )}
                                                </strong>

                                                <span>
                                                    / 5
                                                </span>
                                            </div>

                                            <p
                                                className={
                                                    styles.testimonialComment
                                                }
                                            >
                                                {feedback.comentario ||
                                                    "Excelente experiência!"}
                                            </p>

                                            <div
                                                className={
                                                    styles.userAuthor
                                                }
                                            >
                                                {foto ? (
                                                    <img
                                                        src={obterUrlFoto(
                                                            foto
                                                        )}
                                                        alt={
                                                            nome
                                                        }
                                                        className={
                                                            styles.feedbackAvatar
                                                        }
                                                        onError={(
                                                            event
                                                        ) => {
                                                            event.currentTarget.style.display =
                                                                "none";
                                                        }}
                                                    />
                                                ) : (
                                                    <div
                                                        className={
                                                            styles.feedbackAvatarInitial
                                                        }
                                                    >
                                                        {inicial}
                                                    </div>
                                                )}

                                                <div>
                                                    <strong>
                                                        {nome}
                                                    </strong>

                                                    <span>
                                                        Cliente
                                                        Tintas+
                                                    </span>

                                                    <small>
                                                        Avaliação
                                                        verificada
                                                    </small>
                                                </div>
                                            </div>
                                        </article>
                                    );
                                }
                            )
                        )}
                    </div>

                    <button
                        className={`${styles.carouselButton} ${styles.carouselButtonRight}`}
                        onClick={() =>
                            rolarFeedbacks("right")
                        }
                        aria-label="Próximas avaliações"
                    >
                        <FiChevronRight />
                    </button>
                </div>
            </section>

            {/* =================================================
                MODAL DA ROLETA
            ================================================= */}

            {modalRoleta &&
                resultadoRoleta && (
                    <div
                        className={
                            styles.modalOverlay
                        }
                        onClick={fecharModal}
                    >
                        <div
                            className={
                                styles.couponModal
                            }
                            onClick={(event) =>
                                event.stopPropagation()
                            }
                        >
                            <button
                                className={
                                    styles.modalClose
                                }
                                onClick={
                                    fecharModal
                                }
                                aria-label="Fechar"
                            >
                                <FiX />
                            </button>

                            <div
                                className={
                                    styles.modalIcon
                                }
                            >
                                <FiGift />
                            </div>

                            <span
                                className={
                                    styles.modalSmallTitle
                                }
                            >
                                PARABÉNS!
                            </span>

                            <h2>
                                Você ganhou
                            </h2>

                            <div
                                className={
                                    styles.modalDiscount
                                }
                            >
                                {resultadoRoleta.desconto}%

                                <span>
                                    OFF
                                </span>
                            </div>

                            <p
                                className={
                                    styles.modalDescription
                                }
                            >
                                Use seu cupom na próxima
                                compra e aproveite seu
                                desconto exclusivo.
                            </p>

                            <div
                                className={
                                    styles.couponBox
                                }
                            >
                                <div>
                                    <span>
                                        SEU CUPOM
                                    </span>

                                    <strong>
                                        {
                                            resultadoRoleta.codigo
                                        }
                                    </strong>
                                </div>

                                <button
                                    onClick={
                                        copiarCupom
                                    }
                                >
                                    {codigoCopiado ? (
                                        <>
                                            <FiCheck />
                                            Copiado
                                        </>
                                    ) : (
                                        <>
                                            <FiCopy />
                                            Copiar
                                        </>
                                    )}
                                </button>
                            </div>

                            <button
                                className={
                                    styles.continueCartButton
                                }
                                onClick={
                                    irParaCarrinho
                                }
                            >
                                <FiShoppingCart />
                                Ir para o carrinho
                            </button>

                            <button
                                className={
                                    styles.modalContinueShopping
                                }
                                onClick={
                                    fecharModal
                                }
                            >
                                Continuar comprando
                            </button>
                        </div>
                    </div>
                )}

            {/* =================================================
                FOOTER
            ================================================= */}

            <footer
                className={
                    styles.footer
                }
            >
                <p>
                    ©{" "}
                    {new Date().getFullYear()}{" "}
                    Tintas+ — Todos os direitos reservados.
                </p>
            </footer>
        </div>
    );
}