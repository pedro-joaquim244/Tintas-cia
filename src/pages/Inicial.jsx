import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";

import {
    FiShoppingCart,
    FiDroplet,
    FiShield,
    FiAward,
    FiStar,
    FiTruck,
    FiArrowRight,
    FiMessageSquare,
    FiActivity,
    FiSend,
    FiUser,
    FiCheckCircle,
    FiAlertCircle,
    FiChevronLeft,
    FiChevronRight,
    FiHeadphones,
    FiLock,
    FiUsers,
    FiPackage,
} from "react-icons/fi";

import HeaderUser from "../components/Cabeçalho-Users/index.jsx";
import RodapeUser from "../components/Rodape-User/index.jsx";
import style from "../styles/Inicial.module.css";

import { api } from "../services/api.js";
import { useAuth } from "../contexts/AuthContext.jsx";


export default function LojaTintas() {

    const { usuario } = useAuth();

    const tituloRef = useRef(null);
    const introContainerRef = useRef(null);
    const rollerRef = useRef(null);
    const svgPathRef = useRef(null);
    const brandNameRef = useRef(null);
    const carouselRef = useRef(null);

    const [feedbacks, setFeedbacks] = useState([]);
    const [comentario, setComentario] = useState("");
    const [nota, setNota] = useState(0);
    const [notaHover, setNotaHover] = useState(0);
    const [carregandoFeedbacks, setCarregandoFeedbacks] = useState(true);
    const [enviandoFeedback, setEnviandoFeedback] = useState(false);
    const [mensagemFeedback, setMensagemFeedback] = useState("");
    const [tipoMensagem, setTipoMensagem] = useState("");

    const API_URL = "http://localhost:3333";


    const getFotoUrl = (foto) => {

        if (!foto) return null;

        let caminho = String(foto)
            .trim()
            .replace(/\\/g, "/");

        if (!caminho) return null;

        if (
            caminho.startsWith("http://") ||
            caminho.startsWith("https://") ||
            caminho.startsWith("data:")
        ) {
            return caminho;
        }

        caminho = caminho.replace(/^\.\//, "");
        caminho = caminho.replace(/^\//, "");

        if (caminho.startsWith("uploads/")) {
            return `${API_URL}/${caminho}`;
        }

        return `${API_URL}/uploads/${caminho}`;
    };


    const carregarFeedbacks = async () => {

        try {

            setCarregandoFeedbacks(true);

            const response = await api.get("/feedbacks");

            if (Array.isArray(response.data)) {
                setFeedbacks(response.data);
            } else {
                setFeedbacks([]);
            }

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


    useEffect(() => {
        carregarFeedbacks();
    }, []);


    const enviarFeedback = async (e) => {

        e.preventDefault();

        setMensagemFeedback("");
        setTipoMensagem("");


        if (!usuario?.id) {

            setTipoMensagem("erro");

            setMensagemFeedback(
                "Você precisa estar logado para enviar um feedback."
            );

            return;
        }


        if (!nota || nota < 1 || nota > 5) {

            setTipoMensagem("erro");

            setMensagemFeedback(
                "Selecione uma avaliação de 1 a 5 estrelas."
            );

            return;
        }


        if (!comentario.trim()) {

            setTipoMensagem("erro");

            setMensagemFeedback(
                "Digite um comentário antes de enviar."
            );

            return;
        }


        if (comentario.trim().length < 5) {

            setTipoMensagem("erro");

            setMensagemFeedback(
                "Seu comentário precisa ter pelo menos 5 caracteres."
            );

            return;
        }


        if (comentario.trim().length > 500) {

            setTipoMensagem("erro");

            setMensagemFeedback(
                "Seu comentário deve possuir no máximo 500 caracteres."
            );

            return;
        }


        try {

            setEnviandoFeedback(true);

            await api.post(
                "/feedbacks",
                {
                    usuario_id: usuario.id,
                    comentario: comentario.trim(),
                    nota: nota
                }
            );

            setComentario("");
            setNota(0);
            setNotaHover(0);

            setTipoMensagem("sucesso");

            setMensagemFeedback(
                "Sua avaliação foi enviada com sucesso!"
            );

            await carregarFeedbacks();

        } catch (error) {

            console.error(
                "Erro ao enviar feedback:",
                error
            );

            setTipoMensagem("erro");

            setMensagemFeedback(
                error?.response?.data?.erro ||
                error?.response?.data?.mensagem ||
                error?.response?.data?.message ||
                "Não foi possível enviar seu feedback."
            );

        } finally {

            setEnviandoFeedback(false);

        }
    };


    const moverCarrossel = (direcao) => {

        if (!carouselRef.current) return;

        const carousel = carouselRef.current;

        const card = carousel.querySelector(
            `.${style.testimonialCard}`
        );

        if (!card) return;

        const distancia = card.offsetWidth + 24;

        carousel.scrollBy({
            left: direcao * distancia,
            behavior: "smooth"
        });
    };


    const calcularMedia = () => {

        if (!feedbacks.length) {
            return "0.0";
        }

        const total = feedbacks.reduce(
            (soma, feedback) =>
                soma + Number(feedback.nota || 0),
            0
        );

        return (
            total / feedbacks.length
        ).toFixed(1);
    };


    useEffect(() => {

        if (!introContainerRef.current) return;

        gsap.set(
            introContainerRef.current,
            {
                visibility: "visible"
            }
        );

        gsap.set(
            brandNameRef.current,
            {
                opacity: 0,
                y: 30,
                scale: 0.85
            }
        );

        const tlGlobal = gsap.timeline({

            onComplete: () => {

                gsap.set(
                    introContainerRef.current,
                    {
                        display: "none",
                        pointerEvents: "none"
                    }
                );
            }
        });


        tlGlobal

            .to(
                brandNameRef.current,
                {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    duration: 0.45,
                    ease: "back.out(1.5)"
                }
            )

            .to(
                {},
                {
                    duration: 0.55
                }
            )

            .to(
                brandNameRef.current,
                {
                    opacity: 0,
                    y: -40,
                    duration: 0.25,
                    ease: "power2.in"
                }
            )

            .fromTo(
                rollerRef.current,
                {
                    y: "105vh"
                },
                {
                    y: "-100vh",
                    duration: 1.27,
                    ease: "power2.inOut"
                },
                "-=0.1"
            )

            .to(
                svgPathRef.current,
                {
                    attr: {
                        d:
                            "M 0 0 V 0 Q 50 0 100 0 V 0 Z"
                    },
                    duration: 1.1,
                    ease: "power2.inOut"
                },
                "-=1.1"
            )

            .fromTo(
                tituloRef.current,
                {
                    opacity: 0,
                    y: 20
                },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.5,
                    ease: "power3.out"
                },
                "-=0.4"
            );


        gsap.to(
            `.${style.paintCan}`,
            {
                y: -12,
                duration: 2.5,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut"
            }
        );


        return () => {

            tlGlobal.kill();

            gsap.killTweensOf(
                `.${style.paintCan}`
            );

        };

    }, []);


    const formatarData = (data) => {

        if (!data) return "";

        try {

            return new Date(data).toLocaleDateString(
                "pt-BR",
                {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric"
                }
            );

        } catch {

            return "";

        }
    };


    const getNomeUsuario = (feedback) => {

        return (
            feedback.usuario_nome ||
            feedback.nome_usuario ||
            feedback.usuario?.nome ||
            "Usuário"
        );
    };


    const getFotoUsuario = (feedback) => {

        return (
            feedback.usuario_foto ||
            feedback.foto_usuario ||
            feedback.usuario?.foto ||
            null
        );
    };


    return (

        <div className={style.container}>

            <HeaderUser />


            {/* =================================================
                INTRO
            ================================================= */}

            <div
                ref={introContainerRef}
                className={style.introContainer}
            >

                <h1
                    ref={brandNameRef}
                    className={style.initialBrandName}
                >
                    Pixel Color
                </h1>

                <svg
                    className={style.paintSvg}
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                >

                    <defs>

                        <filter id="paint-edge">

                            <feTurbulence
                                type="fractalNoise"
                                baseFrequency="0.04"
                                numOctaves="3"
                                result="noise"
                            />

                            <feDisplacementMap
                                in="SourceGraphic"
                                in2="noise"
                                scale="5"
                                xChannelSelector="R"
                                yChannelSelector="G"
                            />

                        </filter>

                    </defs>

                    <path
                        ref={svgPathRef}
                        fill="#1554c7"
                        filter="url(#paint-edge)"
                        d="M 0 0 V 100 Q 50 100 100 100 V 0 Z"
                    />

                </svg>


                <div
                    ref={rollerRef}
                    className={style.realRoller}
                >

                    <svg
                        viewBox="0 0 300 400"
                        className={style.rollerSvgGraphic}
                    >

                        <ellipse
                            cx="150"
                            cy="110"
                            rx="110"
                            ry="15"
                            fill="rgba(0,0,0,0.2)"
                            filter="blur(6px)"
                        />

                        <path
                            d="M 250 100 L 270 100 L 270 170 L 175 220 L 175 260"
                            fill="none"
                            stroke="#94a3b8"
                            strokeWidth="10"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />

                        <path
                            d="M 250 100 L 270 100 L 270 170 L 175 220 L 175 260"
                            fill="none"
                            stroke="#cbd5e1"
                            strokeWidth="4"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />

                        <rect
                            x="160"
                            y="260"
                            width="30"
                            height="110"
                            rx="8"
                            fill="#f4b400"
                        />

                        <rect
                            x="163"
                            y="260"
                            width="8"
                            height="110"
                            rx="2"
                            fill="#ffd54f"
                            opacity="0.5"
                        />

                        <rect
                            x="34"
                            y="88"
                            width="12"
                            height="24"
                            rx="3"
                            fill="#b45309"
                        />

                        <rect
                            x="254"
                            y="88"
                            width="12"
                            height="24"
                            rx="3"
                            fill="#b45309"
                        />

                        <rect
                            x="40"
                            y="80"
                            width="220"
                            height="40"
                            rx="12"
                            fill="#3b82f6"
                            stroke="#2563eb"
                            strokeWidth="2"
                        />

                        <path
                            d="M 50 85 Q 70 115 90 90 Q 120 120 150 95 Q 180 115 210 85 Q 230 115 250 95"
                            fill="none"
                            stroke="#1d4ed8"
                            strokeWidth="4"
                            strokeLinecap="round"
                        />

                    </svg>

                </div>

            </div>


            {/* =================================================
                HERO
            ================================================= */}

            <section className={style.hero}>

                <div className={style.heroText}>

                    <h1 ref={tituloRef}>
                        Dê vida
                        <br />
                        às suas <span>cores</span>
                    </h1>

                    <p>
                        As melhores tintas, as melhores marcas
                        <br />
                        e as melhores condições você encontra aqui!
                    </p>

                    <div className={style.heroButtons}>

                        <button className={style.primaryButton}>
                            Ver produtos
                        </button>

                        <button className={style.secondaryButton}>
                            <FiMessageSquare />
                            Falar com especialista
                        </button>

                    </div>


                    <div className={style.heroBenefits}>

                        <div>
                            <FiTruck />

                            <div>
                                <strong>Entrega rápida</strong>
                                <span>Para todo o Brasil</span>
                            </div>
                        </div>

                        <div>
                            <FiPackage />

                            <div>
                                <strong>Parcelamento</strong>
                                <span>Em até 12x sem juros</span>
                            </div>
                        </div>

                        <div>
                            <FiLock />

                            <div>
                                <strong>Compra segura</strong>
                                <span>Seus dados protegidos</span>
                            </div>
                        </div>

                    </div>

                </div>


                <div className={style.heroImage}>

                    <div className={style.paintArtwork}>

                        <div className={style.paintCan}>

                            <div className={style.paintCanTop} />

                            <div className={style.paintCanBody}>

                                <div className={style.paintDrips}>
                                    <i />
                                    <i />
                                    <i />
                                    <i />
                                </div>

                                <div className={style.paintCanLabel}>
                                    <strong>PIXEL</strong>
                                    <span>COLOR</span>
                                </div>

                            </div>

                        </div>


                        <div className={style.paintRoller}>

                            <div className={style.rollerHandle} />

                            <div className={style.rollerGrip}>
                                <span />
                            </div>

                        </div>


                        <div className={style.paintSheets}>
                            <i />
                            <i />
                            <i />
                            <i />
                        </div>

                    </div>

                </div>

            </section>


            {/* =================================================
                ESTATÍSTICAS + RODA
            ================================================= */}

            <section className={style.statsDiscount}>

                <div className={style.statsCard}>

                    <div className={style.statItem}>
                        <div className={style.statIcon}>
                            <FiShoppingCart />
                        </div>

                        <strong>3.245+</strong>
                        <span>Latas de tinta<br />vendidas</span>
                    </div>


                    <div className={style.statItem}>
                        <div className={style.statIcon}>
                            <FiUsers />
                        </div>

                        <strong>8.960+</strong>
                        <span>Clientes<br />satisfeitos</span>
                    </div>


                    <div className={style.statItem}>
                        <div className={style.statIcon}>
                            <FiStar />
                        </div>

                        <strong>98%</strong>
                        <span>Avaliação<br />positiva</span>
                    </div>


                    <div className={style.statItem}>
                        <div className={style.statIcon}>
                            <FiAward />
                        </div>

                        <strong>7</strong>
                        <span>Anos de<br />mercado</span>
                    </div>

                </div>


                <div className={style.discountCard}>

                    <div className={style.discountText}>

                        <h3>
                            Gire e ganhe seu desconto!
                        </h3>

                        <p>
                            Tente a sorte e ganhe até 30% OFF
                            <br />
                            na sua próxima compra.
                        </p>

                        <button>
                            Girar a roleta
                        </button>

                        <small>
                            *Desconto válido por 24h após o giro.
                        </small>

                    </div>


                    <div className={style.discountWheel}>

                        <div className={style.wheelPointer}>
                            <span>5%</span>
                            <small>OFF</small>
                        </div>

                        <div className={style.wheelCenter}>
                            <FiDroplet />
                        </div>

                        <div className={`${style.wheelText} ${style.wheelTextOne}`}>
                            20%<br />OFF
                        </div>

                        <div className={`${style.wheelText} ${style.wheelTextTwo}`}>
                            10%<br />OFF
                        </div>

                        <div className={`${style.wheelText} ${style.wheelTextThree}`}>
                            5%<br />OFF
                        </div>

                        <div className={`${style.wheelText} ${style.wheelTextFour}`}>
                            30%<br />OFF
                        </div>

                    </div>

                </div>

            </section>


            {/* =================================================
                SOBRE NÓS
            ================================================= */}

            <section className={style.about}>

                <div className={style.aboutHeader}>

                    <span>SOBRE NÓS</span>

                    <h2>
                        Muito mais que uma loja de tintas
                    </h2>

                    <p>
                        A Pixel Color nasceu para transformar ambientes
                        e facilitar sua vida.
                        <br />
                        Oferecemos qualidade, variedade e atendimento especializado
                        <br />
                        para você realizar seus projetos com as melhores cores.
                    </p>

                </div>


                <div className={style.aboutGrid}>

                    <div className={style.aboutCard}>

                        <div className={style.aboutIcon}>
                            <FiAward />
                        </div>

                        <h3>Qualidade</h3>

                        <p>
                            Trabalhamos apenas com produtos de alta
                            qualidade das melhores marcas.
                        </p>

                    </div>


                    <div className={style.aboutCard}>

                        <div className={style.aboutIcon}>
                            <FiHeadphones />
                        </div>

                        <h3>Atendimento</h3>

                        <p>
                            Especialistas prontos para te ajudar a
                            escolher a melhor solução.
                        </p>

                    </div>


                    <div className={style.aboutCard}>

                        <div className={style.aboutIcon}>
                            <FiTruck />
                        </div>

                        <h3>Entrega Rápida</h3>

                        <p>
                            Entregamos para todo o Brasil com
                            agilidade e segurança.
                        </p>

                    </div>


                    <div className={style.aboutCard}>

                        <div className={style.aboutIcon}>
                            <FiShield />
                        </div>

                        <h3>Compra Segura</h3>

                        <p>
                            Ambiente 100% seguro para você comprar
                            com tranquilidade.
                        </p>

                    </div>

                </div>

            </section>


            {/* =================================================
                MARCAS
            ================================================= */}

            <section className={style.brands}>

                <h2>
                    As <span>melhores marcas</span> você encontra aqui
                </h2>

                <div className={style.brandsSlider}>

                    <button className={style.brandArrow}>
                        <FiChevronLeft />
                    </button>

                    <div className={style.brandList}>

                        <div className={`${style.brandCard} ${style.suvinil}`}>
                            Suvinil
                        </div>

                        <div className={`${style.brandCard} ${style.coral}`}>
                            <strong>Coral</strong>
                            <small>tudo de cor para você</small>
                        </div>

                        <div className={`${style.brandCard} ${style.sherwin}`}>
                            SHERWIN
                            <strong>WILLIAMS</strong>
                        </div>

                        <div className={`${style.brandCard} ${style.eucatex}`}>
                            eucatex
                        </div>

                        <div className={`${style.brandCard} ${style.iquine}`}>
                            Iquine
                        </div>

                        <div className={`${style.brandCard} ${style.lukscolor}`}>
                            LUKSCOLOR
                            <small>TINTAS</small>
                        </div>

                    </div>

                    <button className={style.brandArrow}>
                        <FiChevronRight />
                    </button>

                </div>


                <div className={style.brandDots}>
                    <i className={style.active} />
                    <i />
                    <i />
                    <i />
                    <i />
                </div>

            </section>


            {/* =================================================
                FEEDBACKS PÚBLICOS
            ================================================= */}

            <section className={style.testimonials}>

                <div className={style.feedbackSectionHeader}>

                    <div className={style.feedbackIntro}>
                        <span>Avaliações dos clientes</span>

                        <h2>
                            Experiências que
                            <strong> falam por nós.</strong>
                        </h2>

                        <p>
                            Veja o que nossos clientes estão achando
                            da experiência Pixel Colors.
                        </p>
                    </div>

                    <div className={style.feedbackScoreCard}>
                        <div className={style.feedbackScoreNumber}>
                            {calcularMedia()}
                        </div>

                        <div>
                            <div className={style.feedbackScoreStars}>
                                {[1, 2, 3, 4, 5].map((estrela) => (
                                    <FiStar
                                        key={estrela}
                                        className={style.starActive}
                                    />
                                ))}
                            </div>

                            <span>
                                {feedbacks.length}{" "}
                                {feedbacks.length === 1
                                    ? "avaliação"
                                    : "avaliações"}
                            </span>
                        </div>
                    </div>
                </div>

                {!carregandoFeedbacks && feedbacks.length > 0 && (
                    <div className={style.carouselWrapper}>

                        <button
                            type="button"
                            className={`${style.carouselButton} ${style.carouselButtonLeft}`}
                            onClick={() => moverCarrossel(-1)}
                            aria-label="Feedback anterior"
                        >
                            <FiChevronLeft />
                        </button>

                        <div
                            ref={carouselRef}
                            className={style.testimonialsGrid}
                        >
                            {feedbacks.map((feedback) => {
                                const nome = getNomeUsuario(feedback);
                                const foto = getFotoUsuario(feedback);
                                const fotoUrl = getFotoUrl(foto);
                                const notaFeedback = Number(feedback.nota || 0);

                                return (
                                    <article
                                        className={style.testimonialCard}
                                        key={feedback.id}
                                    >
                                        <div className={style.testimonialTop}>
                                            <div className={style.testiIconWrapper}>
                                                <FiMessageSquare className={style.testiIcon} />
                                            </div>

                                            <div className={style.feedbackRating}>
                                                {[1, 2, 3, 4, 5].map((estrela) => (
                                                    <FiStar
                                                        key={estrela}
                                                        className={
                                                            estrela <= notaFeedback
                                                                ? style.starActive
                                                                : style.starInactive
                                                        }
                                                    />
                                                ))}
                                            </div>
                                        </div>

                                        <div className={style.feedbackCardScore}>
                                            <strong>{notaFeedback.toFixed(1)}</strong>
                                            <span>/ 5</span>
                                        </div>

                                        <p className={style.testimonialComment}>
                                            “{feedback.comentario}”
                                        </p>

                                        <div className={style.userAuthor}>
                                            {fotoUrl ? (
                                                <img
                                                    src={fotoUrl}
                                                    alt={nome}
                                                    className={style.feedbackAvatar}
                                                    onError={(e) => {
                                                        e.currentTarget.style.display = "none";
                                                        if (e.currentTarget.nextElementSibling) {
                                                            e.currentTarget.nextElementSibling.style.display = "flex";
                                                        }
                                                    }}
                                                />
                                            ) : null}

                                            <div
                                                className={style.feedbackAvatarInitial}
                                                style={{ display: fotoUrl ? "none" : "flex" }}
                                            >
                                                {nome?.charAt(0)?.toUpperCase()}
                                            </div>

                                            <div>
                                                <strong>{nome}</strong>
                                                <span>Cliente Pixel Colors</span>
                                                {feedback.criado_em && (
                                                    <small>
                                                        {formatarData(feedback.criado_em)}
                                                    </small>
                                                )}
                                            </div>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>

                        <button
                            type="button"
                            className={`${style.carouselButton} ${style.carouselButtonRight}`}
                            onClick={() => moverCarrossel(1)}
                            aria-label="Próximo feedback"
                        >
                            <FiChevronRight />
                        </button>
                    </div>
                )}

                {carregandoFeedbacks && (
                    <div className={style.feedbackLoading}>
                        <div className={style.loadingSpinner} />
                        <p>Carregando avaliações...</p>
                    </div>
                )}

                {!carregandoFeedbacks && feedbacks.length === 0 && (
                    <div className={style.feedbackEmpty}>
                        <FiMessageSquare />
                        <h3>Ainda não temos avaliações</h3>
                        <p>Seja o primeiro cliente a deixar sua opinião!</p>
                    </div>
                )}

            </section>

            <footer className={style.footer}>

                <p>
                    © 2026 Pixel Colors. Todos os direitos reservados.
                </p>

            </footer>

            <>RodapeUser</>

        </div>
    );
}