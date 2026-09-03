import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import {
    FiArrowRight,
    FiArrowUpRight,
    FiChevronDown,
    FiDroplet,
    FiShoppingBag,
    FiUsers,
    FiStar
} from "react-icons/fi";

import Header from "../components/Cabeçalho-Users";
import CarrosselComentarios from "../components/CarrosselComentarios.jsx";
import LojadeTinta from "../assets/imagens/casadeTinta.png";
import styles from "../styles/Inicial.module.css";
import { api } from "../services/api";

gsap.registerPlugin(ScrollTrigger);

const marcasParceiras = [
    "SUVINIL",
    "CORAL",
    "SHERWIN-WILLIAMS",
    "EUCATEX",
    "ANJO"
];

const marcasLoop = Array.from(
    { length: 4 },
    () => marcasParceiras
).flat();


export default function Inicial() {

    const navigate = useNavigate();

    const heroRef = useRef(null);
    const heroImagemRef = useRef(null);
    const heroTextoRef = useRef(null);

    const introContainerRef = useRef(null);
    const introPaintRef = useRef(null);
    const introRollerRef = useRef(null);
    const introBrandRef = useRef(null);

    const manifestoRef = useRef(null);

    const visualRef = useRef(null);
    const visualImagemRef = useRef(null);
    const visualTextoRef = useRef(null);

    const categoriasRef = useRef(null);
    const paletaRef = useRef(null);

    const [corAtiva, setCorAtiva] = useState("#1f4ed8");
    const [indicadores, setIndicadores] = useState({
        clientes: 0,
        pedidos: 0,
        produtos: 0,
        avaliacao: null
    });
    const [carregandoIndicadores, setCarregandoIndicadores] = useState(true);

    const cores = [
        {
            nome: "Azul Profundo",
            hexadecimal: "#244a7c"
        },
        {
            nome: "Terracota",
            hexadecimal: "#b96548"
        },
        {
            nome: "Verde Oliva",
            hexadecimal: "#68745a"
        },
        {
            nome: "Areia",
            hexadecimal: "#d8c5aa"
        },
        {
            nome: "Cinza Urbano",
            hexadecimal: "#747b83"
        },
        {
            nome: "Vinho",
            hexadecimal: "#6f343d"
        }
    ];

    useEffect(() => {
        let ativo = true;

        async function carregarIndicadores() {
            const [dashboardResultado, feedbacksResultado] =
                await Promise.allSettled([
                    api.get("/dashboard"),
                    api.get("/feedbacks")
                ]);

            if (!ativo) return;

            const resumo =
                dashboardResultado.status === "fulfilled"
                    ? dashboardResultado.value.data?.resumo || {}
                    : {};

            const feedbacks =
                feedbacksResultado.status === "fulfilled" &&
                Array.isArray(feedbacksResultado.value.data)
                    ? feedbacksResultado.value.data
                    : [];

            const notasValidas = feedbacks
                .map((feedback) => Number(feedback.nota))
                .filter((nota) => Number.isFinite(nota) && nota > 0);

            const mediaAvaliacao = notasValidas.length
                ? notasValidas.reduce((total, nota) => total + nota, 0) /
                  notasValidas.length
                : null;

            setIndicadores({
                clientes: Number(resumo.clientes) || 0,
                pedidos: Number(resumo.pedidos) || 0,
                produtos: Number(resumo.produtos) || 0,
                avaliacao: mediaAvaliacao
            });
            setCarregandoIndicadores(false);
        }

        carregarIndicadores();

        return () => {
            ativo = false;
        };
    }, []);

    const formatarQuantidade = (valor) =>
        new Intl.NumberFormat("pt-BR").format(valor);


    useEffect(() => {

        const contexto = gsap.context(() => {

            /* =====================================================
               ABERTURA COM TINTA + HERO
            ===================================================== */

            const body = document.body;

            body.style.overflow = "hidden";

            const alturaRolo =
                introRollerRef.current.getBoundingClientRect().height;

            const posicaoInicialRolo = alturaRolo * 0.32 + 16;

            const distanciaSaida =
                -(window.innerHeight + alturaRolo + 24);

            gsap.set(
                heroImagemRef.current,
                {
                    scale: 1.12,
                    force3D: true
                }
            );

            gsap.set(
                heroTextoRef.current.children,
                {
                    y: 60,
                    opacity: 0
                }
            );

            gsap.set(
                introBrandRef.current,
                {
                    y: 16,
                    opacity: 0
                }
            );

            /*
             * O rolo começa inteiro abaixo da viewport. A distância usa
             * a altura real do SVG para funcionar também em telas menores.
             */
            gsap.set(
                introRollerRef.current,
                {
                    y: posicaoInicialRolo,
                    force3D: true
                }
            );

            const tlAbertura = gsap.timeline({
                defaults: {
                    ease: "power3.inOut"
                },
                onComplete: () => {
                    body.style.overflow = "";
                }
            });

            tlAbertura
                .to(
                    introBrandRef.current,
                    {
                        y: 0,
                        opacity: 1,
                        duration: 0.42,
                        ease: "power2.out"
                    }
                )
                .to(
                    introBrandRef.current,
                    {
                        y: -12,
                        opacity: 0,
                        duration: 0.24,
                        ease: "power2.in"
                    },
                    "+=0.06"
                )

                .to(
                    introRollerRef.current,
                    {
                        y: 0,
                        duration: 0.56,
                        ease: "power3.out",
                        force3D: true
                    },
                    "-=0.08"
                )

                /*
                 * AQUI ESTÁ A CORREÇÃO PRINCIPAL:
                 *
                 * não animamos mais o rolo e a tinta separadamente.
                 * O SVG azul + o rolo pertencem ao mesmo container,
                 * então os dois sobem EXATAMENTE juntos.
                 */
                .fromTo(
                    introContainerRef.current,
                    {
                        y: 0
                    },
                    {
                        y: distanciaSaida,
                        duration: 2.35,
                        ease: "power2.inOut",
                        force3D: true
                    },
                    "-=0.02"
                )

                /*
                 * Pequena inclinação visual do rolo durante a subida.
                 * Não existe movimento vertical aqui, portanto ele
                 * continua preso à borda da tinta.
                 */
                .to(
                    introRollerRef.current,
                    {
                        rotation: -0.7,
                        duration: 0.55,
                        ease: "sine.inOut",
                        force3D: true
                    },
                    "<"
                )
                .to(
                    introRollerRef.current,
                    {
                        rotation: 0.45,
                        duration: 0.75,
                        ease: "sine.inOut"
                    },
                    ">-0.08"
                )
                .to(
                    introRollerRef.current,
                    {
                        rotation: 0,
                        duration: 0.6,
                        ease: "sine.inOut"
                    },
                    ">-0.08"
                )
                .set(
                    introContainerRef.current,
                    {
                        display: "none"
                    }
                )
                .to(
                    heroImagemRef.current,
                    {
                        scale: 1,
                        duration: 1.35,
                        ease: "power3.out"
                    },
                    "-=0.08"
                )
                .to(
                    heroTextoRef.current.children,
                    {
                        y: 0,
                        opacity: 1,
                        duration: 0.9,
                        stagger: 0.11,
                        ease: "power3.out"
                    },
                    "-=1.0"
                );

            gsap.to(
                heroImagemRef.current,
                {
                    yPercent: 15,

                    scrollTrigger: {
                        trigger: heroRef.current,
                        start: "top top",
                        end: "bottom top",
                        scrub: true
                    }
                }
            );


            /* =====================================================
               SEÇÃO VISUAL
            ===================================================== */

            gsap.fromTo(
                visualImagemRef.current,
                {
                    scale: 1.22
                },
                {
                    scale: 1,

                    scrollTrigger: {
                        trigger: visualRef.current,
                        start: "top bottom",
                        end: "bottom top",
                        scrub: 1.2
                    }
                }
            );


            gsap.fromTo(
                visualTextoRef.current,
                {
                    opacity: 0,
                    y: 70
                },
                {
                    opacity: 1,
                    y: 0,

                    scrollTrigger: {
                        trigger: visualRef.current,
                        start: "top 60%",
                        end: "top 30%",
                        scrub: 1
                    }
                }
            );


            /* =====================================================
               MANIFESTO
            ===================================================== */

            gsap.fromTo(
                manifestoRef.current.children,
                {
                    opacity: 0,
                    y: 80
                },
                {
                    opacity: 1,
                    y: 0,
                    stagger: 0.18,
                    duration: 1,

                    scrollTrigger: {
                        trigger: manifestoRef.current,
                        start: "top 78%"
                    }
                }
            );


            /* =====================================================
               CATEGORIAS
            ===================================================== */

            gsap.fromTo(
                `.${styles.categoriaCard}`,
                {
                    opacity: 0,
                    y: 100
                },
                {
                    opacity: 1,
                    y: 0,
                    stagger: 0.15,
                    duration: 1,

                    scrollTrigger: {
                        trigger: categoriasRef.current,
                        start: "top 75%"
                    }
                }
            );


            /* =====================================================
               PALETA
            ===================================================== */

            gsap.fromTo(
                paletaRef.current,
                {
                    opacity: 0,
                    y: 70
                },
                {
                    opacity: 1,
                    y: 0,
                    duration: 1,

                    scrollTrigger: {
                        trigger: paletaRef.current,
                        start: "top 80%"
                    }
                }
            );

        });


        return () => {
            document.body.style.overflow = "";
            contexto.revert();
        };

    }, []);


    return (
        <div className={styles.page}>

            {/* =====================================================
                ABERTURA — EFEITO DE TINTA
            ===================================================== */}

            <div
                ref={introContainerRef}
                className={styles.introPaint}
                aria-hidden="true"
            >

                <div
                    ref={introBrandRef}
                    className={styles.introBrand}
                >
                    <div className={styles.introBrandMark}>
                        <span />
                        <span />
                        <span />
                        <span />
                    </div>

                    <div className={styles.introBrandText}>
                        <strong>PIXEL COLOR</strong>
                        <span>COR • ESPAÇO • ATMOSFERA</span>
                    </div>
                </div>


                <svg
                    className={styles.introPaintSvg}
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                >
                    <defs>
                        <filter
                            id="paint-edge-home"
                            x="-20%"
                            y="-20%"
                            width="140%"
                            height="140%"
                        >
                            <feTurbulence
                                type="fractalNoise"
                                baseFrequency="0.018 0.07"
                                numOctaves="2"
                                seed="8"
                                result="noise"
                            />

                            <feDisplacementMap
                                in="SourceGraphic"
                                in2="noise"
                                scale="1.8"
                                xChannelSelector="R"
                                yChannelSelector="G"
                            />
                        </filter>
                    </defs>

                    <path
                        ref={introPaintRef}
                        className={styles.introPaintPath}
                        d="M 0 0 V 100 Q 14 98 28 100 Q 43 102 57 99 Q 72 97 86 100 Q 94 101 100 100 V 0 Z"
                    />
                </svg>


                <div
                    ref={introRollerRef}
                    className={styles.introRoller}
                >
                    <svg
                        viewBox="0 0 300 400"
                        className={styles.introRollerSvg}
                    >
                        <ellipse
                            cx="150"
                            cy="112"
                            rx="108"
                            ry="13"
                            fill="rgba(7, 13, 24, 0.20)"
                            filter="blur(7px)"
                        />

                        <path
                            d="M 250 100 L 270 100 L 270 171 L 175 220 L 175 261"
                            fill="none"
                            stroke="#8f9baa"
                            strokeWidth="10"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />

                        <path
                            d="M 250 100 L 270 100 L 270 171 L 175 220 L 175 261"
                            fill="none"
                            stroke="#d8dde4"
                            strokeWidth="4"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />

                        <rect
                            x="159"
                            y="260"
                            width="32"
                            height="112"
                            rx="10"
                            fill="#172033"
                        />

                        <rect
                            x="164"
                            y="266"
                            width="7"
                            height="98"
                            rx="3"
                            fill="rgba(255,255,255,0.16)"
                        />

                        <circle
                            cx="175"
                            cy="351"
                            r="4"
                            fill="#0b1220"
                        />

                        <rect
                            x="34"
                            y="88"
                            width="12"
                            height="24"
                            rx="3"
                            fill="#cbd3dc"
                        />

                        <rect
                            x="254"
                            y="88"
                            width="12"
                            height="24"
                            rx="3"
                            fill="#cbd3dc"
                        />

                        <rect
                            x="40"
                            y="80"
                            width="220"
                            height="40"
                            rx="11"
                            fill="#f4f1e9"
                            stroke="#d9d5ca"
                            strokeWidth="2"
                        />

                        <path
                            d="M 48 88 Q 70 113 91 90 Q 119 116 149 94 Q 180 116 209 87 Q 232 112 252 95"
                            fill="none"
                            stroke="#d7d3c8"
                            strokeWidth="4"
                            strokeLinecap="round"
                            opacity="0.82"
                        />

                        <path
                            d="M 55 114 Q 87 88 121 109 Q 160 86 191 113 Q 220 91 246 109"
                            fill="none"
                            stroke="#ece8df"
                            strokeWidth="3"
                            strokeLinecap="round"
                            opacity="0.95"
                        />

                        <path
                            d="M 45 100 L 255 100"
                            fill="none"
                            stroke="#ffffff"
                            strokeWidth="2"
                            strokeDasharray="5 8"
                            opacity="0.72"
                        />
                    </svg>
                </div>


                <span className={styles.introEdition}>
                    01 — ABERTURA
                </span>

            </div>

            <Header />


            {/* =====================================================
                HERO
            ===================================================== */}

            <section
                ref={heroRef}
                className={styles.hero}
            >

                <div
                    ref={heroImagemRef}
                    className={styles.heroImagem}
                />


                <div className={styles.heroOverlay} />


                <div
                    ref={heroTextoRef}
                    className={styles.heroConteudo}
                >

                    <span className={styles.heroEyebrow}>
                        Tintas & Cia
                    </span>


                    <h1>
                        Sua casa,
                        <br />
                        <em>do seu jeito.</em>
                    </h1>


                    <p>
                        Descubra cores que transformam
                        ambientes, despertam sensações
                        e contam novas histórias.
                    </p>


                    <div className={styles.heroAcoes}>

                        <button
                            onClick={() =>
                                navigate("/cliente/produtos")
                            }
                        >
                            Explorar produtos

                            <FiArrowRight />
                        </button>


                        <button
                            className={styles.botaoTransparente}
                            onClick={() =>
                                document
                                    .getElementById("categorias")
                                    ?.scrollIntoView({
                                        behavior: "smooth"
                                    })
                            }
                        >
                            Descobrir cores
                        </button>

                    </div>

                </div>


                <div className={styles.scrollIndicador}>

                    <span>Explore</span>

                    <FiChevronDown />

                </div>

            </section>



            {/* =====================================================
                TEXTO INTRODUTÓRIO
            ===================================================== */}

            <section className={styles.intro}>

                <span>
                    Uma nova forma de enxergar sua casa
                </span>


                <h2>
                    Não é apenas tinta.
                    <br />
                    É a atmosfera que você cria.
                </h2>

            </section>



            {/* =====================================================
                VISUAL CINEMATOGRÁFICO
            ===================================================== */}

            <section
                ref={visualRef}
                className={styles.visualSection}
            >

                <div className={styles.visualFrame}>

                    <div
                        ref={visualImagemRef}
                        className={styles.visualImagem}
                    />


                    <div className={styles.visualOverlay} />


                    <div
                        ref={visualTextoRef}
                        className={styles.visualTexto}
                    >

                        <span>
                            Experimente
                        </span>

                        <h2>
                            Veja além
                            <br />
                            <em>da cor.</em>
                        </h2>

                        <p>
                            Textura, luz e personalidade
                            em cada detalhe.
                        </p>

                    </div>

                </div>

            </section>



            {/* =====================================================
                MANIFESTO
            ===================================================== */}

            <section
                ref={manifestoRef}
                className={styles.manifesto}
            >

                <span className={styles.sectionNumber}>
                    01 — NOSSA ESSÊNCIA
                </span>


                <h2>
                    Transformamos paredes
                    <br />
                    em <em>possibilidades.</em>
                </h2>


                <div className={styles.manifestoTexto}>

                    <p>
                        Cada ambiente tem uma história.
                        A cor certa pode mudar completamente
                        a forma como você sente e vive um espaço.
                    </p>


                    <button
                        onClick={() =>
                            navigate("/cliente/sobre")
                        }
                    >
                        Conheça nossa história

                        <FiArrowUpRight />
                    </button>

                </div>

            </section>



            {/* =====================================================
                FACHADA DA LOJA
            ===================================================== */}

            <section className={styles.fachadaLoja}>

                <img
                    src={LojadeTinta}
                    alt="Fachada da nossa loja Pixel Color"
                    className={styles.fachadaImagem}
                />

            </section>



            {/* =====================================================
                CATEGORIAS
            ===================================================== */}

            <section
                id="categorias"
                ref={categoriasRef}
                className={styles.categorias}
            >

                <div className={styles.sectionHeader}>

                    <div>

                        <span className={styles.sectionNumber}>
                            02 — COLEÇÕES
                        </span>

                        <h2>
                            Encontre
                            <br />
                            <em>seu estilo.</em>
                        </h2>

                    </div>


                    <p>
                        Escolha o ambiente e descubra
                        tintas pensadas para cada necessidade.
                    </p>

                </div>


                <div className={styles.categoriasGrid}>


                    <article
                        className={styles.categoriaCard}
                        onClick={() =>
                            navigate("/cliente/produtos")
                        }
                    >

                        <img
                            src="https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=90"
                            alt="Ambiente interno"
                        />

                        <div className={styles.categoriaOverlay} />


                        <div className={styles.categoriaConteudo}>

                            <span>01</span>

                            <h3>
                                Ambientes
                                <br />
                                internos
                            </h3>

                            <p>
                                Conforto, personalidade
                                e acabamento perfeito.
                            </p>

                            <FiArrowUpRight />

                        </div>

                    </article>



                    <article
                        className={styles.categoriaCard}
                        onClick={() =>
                            navigate("/cliente/produtos")
                        }
                    >

                        <img
                            src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=90"
                            alt="Área externa"
                        />

                        <div className={styles.categoriaOverlay} />


                        <div className={styles.categoriaConteudo}>

                            <span>02</span>

                            <h3>
                                Áreas
                                <br />
                                externas
                            </h3>

                            <p>
                                Proteção e resistência
                                sem abrir mão do design.
                            </p>

                            <FiArrowUpRight />

                        </div>

                    </article>



                    <article
                        className={styles.categoriaCard}
                        onClick={() =>
                            navigate("/cliente/produtos")
                        }
                    >

                        <img
                            src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=90"
                            alt="Madeira e acabamento"
                        />

                        <div className={styles.categoriaOverlay} />


                        <div className={styles.categoriaConteudo}>

                            <span>03</span>

                            <h3>
                                Acabamentos
                                <br />
                                especiais
                            </h3>

                            <p>
                                Detalhes que elevam
                                qualquer projeto.
                            </p>

                            <FiArrowUpRight />

                        </div>

                    </article>


                </div>

            </section>



            {/* =====================================================
                PALETA
            ===================================================== */}

            <section
                ref={paletaRef}
                className={styles.paleta}
                style={{
                    "--cor-ativa": corAtiva
                }}
            >

                <div className={styles.paletaBackground} />


                <div className={styles.paletaConteudo}>

                    <span className={styles.sectionNumber}>
                        03 — EXPLORE
                    </span>


                    <h2>
                        Qual cor combina
                        <br />
                        <em>com você?</em>
                    </h2>


                    <p>
                        Passe pelas cores e encontre
                        uma nova inspiração para seu ambiente.
                    </p>


                    <div className={styles.cores}>

                        {cores.map((cor) => (

                            <button
                                key={cor.hexadecimal}
                                className={
                                    corAtiva === cor.hexadecimal
                                        ? styles.corAtiva
                                        : ""
                                }
                                onMouseEnter={() =>
                                    setCorAtiva(
                                        cor.hexadecimal
                                    )
                                }
                                onClick={() =>
                                    setCorAtiva(
                                        cor.hexadecimal
                                    )
                                }
                            >

                                <span
                                    style={{
                                        background:
                                            cor.hexadecimal
                                    }}
                                />

                                <small>
                                    {cor.nome}
                                </small>

                            </button>

                        ))}

                    </div>

                </div>


                <div className={styles.paletaCodigo}>

                    <span>
                        COR SELECIONADA
                    </span>

                    <strong>
                        {corAtiva}
                    </strong>

                </div>

            </section>



            {/* =====================================================
                NÚMEROS
            ===================================================== */}

            <section className={styles.numeros} aria-live="polite">

                <div>

                    <FiUsers />

                    <strong>
                        {carregandoIndicadores
                            ? "—"
                            : formatarQuantidade(indicadores.clientes)}
                    </strong>

                    <span>
                        clientes
                    </span>

                </div>


                <div>

                    <FiShoppingBag />

                    <strong>
                        {carregandoIndicadores
                            ? "—"
                            : formatarQuantidade(indicadores.pedidos)}
                    </strong>

                    <span>
                        pedidos
                    </span>

                </div>


                <div>

                    <FiDroplet />

                    <strong>
                        {carregandoIndicadores
                            ? "—"
                            : formatarQuantidade(indicadores.produtos)}
                    </strong>

                    <span>
                        produtos
                    </span>

                </div>


                <div>

                    <FiStar />

                    <strong>
                        {carregandoIndicadores
                            ? "—"
                            : indicadores.avaliacao === null
                              ? "—"
                              : indicadores.avaliacao
                                    .toLocaleString("pt-BR", {
                                        minimumFractionDigits: 1,
                                        maximumFractionDigits: 1
                                    })}
                    </strong>

                    <span>
                        avaliação
                    </span>

                </div>

            </section>



            {/* =====================================================
                MARCAS
            ===================================================== */}

            <section className={styles.marcas}>

                <div className={styles.marcasCabecalho}>
                    <div>
                        <span className={styles.sectionNumber}>
                            04 — NOSSAS MARCAS
                        </span>

                        <h2>
                            Qualidade que você
                            <br />
                            <em>já conhece.</em>
                        </h2>
                    </div>

                    <p>
                        Trabalhamos com marcas reconhecidas para garantir
                        acabamento, durabilidade e a cor certa para cada projeto.
                    </p>
                </div>


                <div
                    className={styles.marcasTrack}
                    aria-label="Marcas disponíveis"
                >

                    <div className={styles.marcasLinha}>

                        <div className={styles.marcasGrupo} aria-hidden="true">
                            {marcasLoop.map((marca, index) => (
                                <span key={`marca-a-${marca}-${index}`}>
                                    {marca}
                                </span>
                            ))}
                        </div>

                        <div className={styles.marcasGrupo} aria-hidden="true">
                            {marcasLoop.map((marca, index) => (
                                <span key={`marca-b-${marca}-${index}`}>
                                    {marca}
                                </span>
                            ))}
                        </div>

                    </div>

                </div>

            </section>



            {/* =====================================================
                CTA FINAL
            ===================================================== */}

            <section className={styles.ctaFinal}>

                <div className={styles.ctaImagem} />


                <div className={styles.ctaOverlay} />


                <div className={styles.ctaConteudo}>

                    <span>
                        Seu próximo ambiente começa aqui.
                    </span>


                    <h2>
                        Pronto para
                        <br />
                        <em>mudar tudo?</em>
                    </h2>


                    <button
                        onClick={() =>
                            navigate("/cliente/produtos")
                        }
                    >
                        Ver todas as tintas

                        <FiArrowRight />
                    </button>

                </div>

            </section>



            {/* =====================================================
                CARROSSEL DE COMENTÁRIOS
            ===================================================== */}

            <CarrosselComentarios />


        </div>
    );
}
