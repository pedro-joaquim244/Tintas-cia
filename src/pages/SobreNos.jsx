import {
    useEffect,
    useRef,
    useState
} from "react";

import { gsap } from "gsap";

import { ScrollTrigger } from "gsap/ScrollTrigger";

import {
    Target,
    Eye,
    Heart,
    Store,
    MapPin,
    Clock3,
    Phone,
    X,
    Star,
    ArrowRight,
    ArrowUpRight,
    ChevronDown,
    Palette,
    ShieldCheck,
    Brush,
    Sparkles
} from "lucide-react";


// =========================================================
// IMAGENS
// =========================================================

import CatalogoTinta from "../assets/imagens/CatalogoTinta.jfif";
import LojadeTinta from "../assets/imagens/casadeTinta.png";
import ObraArte from "../assets/imagens/ObraArte.jfif";
import Pintor from "../assets/imagens/Pintor.jfif";


// =========================================================
// COMPONENTES
// =========================================================

import HeaderUser from "../components/Cabeçalho-Users/index.jsx";

import style from "../styles/SobreNos.module.css";


gsap.registerPlugin(ScrollTrigger);


// =========================================================
// LOJAS
// =========================================================

const lojas = [

    {
        id: 1,
        nome: "Tintas & Cia Campinas",
        endereco: "Av. Brasil, 1200",
        horario: "08h às 18h",
        telefone: "(19) 99999-9999",
        avaliacao: "4.9"
    },

    {
        id: 2,
        nome: "Tintas & Cia Ribeirão Preto",
        endereco: "Av. Independência, 850",
        horario: "08h às 18h",
        telefone: "(16) 99999-9999",
        avaliacao: "4.9"
    },

    {
        id: 3,
        nome: "Tintas & Cia Jaboticabal",
        endereco: "Av. Principal, 450",
        horario: "08h às 18h",
        telefone: "(16) 99999-9999",
        avaliacao: "5.0"
    }

];


// =========================================================
// DIFERENCIAIS
// =========================================================

const diferenciais = [

    {
        id: 1,
        numero: "01",
        titulo: "Milhares de cores",
        descricao:
            "Uma seleção completa de tonalidades para você encontrar exatamente a cor que imaginou.",
        Icone: Palette
    },

    {
        id: 2,
        numero: "02",
        titulo: "Marcas selecionadas",
        descricao:
            "Trabalhamos com marcas reconhecidas para oferecer qualidade, acabamento e durabilidade.",
        Icone: ShieldCheck
    },

    {
        id: 3,
        numero: "03",
        titulo: "Para todo projeto",
        descricao:
            "Soluções para reformas, construções, decoração e aplicações profissionais.",
        Icone: Brush
    },

    {
        id: 4,
        numero: "04",
        titulo: "Experiência completa",
        descricao:
            "Mais do que vender tintas, queremos tornar cada escolha mais simples e inspiradora.",
        Icone: Sparkles
    }

];


// =========================================================
// COMPONENTE
// =========================================================

export default function SobreNos() {

    // =====================================================
    // ESTADOS
    // =====================================================

    const [abrirModal, setAbrirModal] =
        useState(false);


    // =====================================================
    // REFS
    // =====================================================

    const heroRef =
        useRef(null);

    const heroImagemRef =
        useRef(null);

    const heroConteudoRef =
        useRef(null);

    const introRef =
        useRef(null);

    const historiaRef =
        useRef(null);

    const historiaImagemRef =
        useRef(null);

    const historiaTextoRef =
        useRef(null);

    const manifestoRef =
        useRef(null);

    const manifestoImagemRef =
        useRef(null);

    const manifestoTextoRef =
        useRef(null);

    const propositoRef =
        useRef(null);

    const diferenciaisRef =
        useRef(null);

    const experienciaRef =
        useRef(null);

    const experienciaImagemRef =
        useRef(null);

    const experienciaTextoRef =
        useRef(null);


    // =====================================================
    // ANIMAÇÕES
    // =====================================================

    useEffect(() => {

        const contexto =
            gsap.context(() => {

                // =========================================
                // HERO
                // =========================================

                gsap.fromTo(
                    heroImagemRef.current,
                    {
                        scale: 1.17
                    },
                    {
                        scale: 1,
                        duration: 1.8,
                        ease: "power3.out"
                    }
                );


                if (
                    heroConteudoRef.current?.children
                ) {

                    gsap.fromTo(
                        heroConteudoRef.current.children,
                        {
                            opacity: 0,
                            y: 70
                        },
                        {
                            opacity: 1,
                            y: 0,
                            duration: 1,
                            stagger: 0.13,
                            ease: "power3.out",
                            delay: 0.2
                        }
                    );

                }


                gsap.to(
                    heroImagemRef.current,
                    {
                        yPercent: 12,

                        scrollTrigger: {
                            trigger: heroRef.current,
                            start: "top top",
                            end: "bottom top",
                            scrub: true
                        }
                    }
                );


                // =========================================
                // INTRO
                // =========================================

                if (
                    introRef.current?.children
                ) {

                    gsap.fromTo(
                        introRef.current.children,
                        {
                            opacity: 0,
                            y: 60
                        },
                        {
                            opacity: 1,
                            y: 0,
                            duration: 1,
                            stagger: 0.15,
                            ease: "power3.out",

                            scrollTrigger: {
                                trigger: introRef.current,
                                start: "top 78%"
                            }
                        }
                    );

                }


                // =========================================
                // HISTÓRIA
                // =========================================

                gsap.fromTo(
                    historiaImagemRef.current,
                    {
                        scale: 1.15
                    },
                    {
                        scale: 1,

                        scrollTrigger: {
                            trigger: historiaRef.current,
                            start: "top bottom",
                            end: "bottom top",
                            scrub: 1
                        }
                    }
                );


                gsap.fromTo(
                    historiaTextoRef.current,
                    {
                        opacity: 0,
                        y: 70
                    },
                    {
                        opacity: 1,
                        y: 0,
                        duration: 1,
                        ease: "power3.out",

                        scrollTrigger: {
                            trigger: historiaRef.current,
                            start: "top 72%"
                        }
                    }
                );


                // =========================================
                // MANIFESTO
                // =========================================

                gsap.to(
                    manifestoImagemRef.current,
                    {
                        scale: 1.12,

                        scrollTrigger: {
                            trigger: manifestoRef.current,
                            start: "top bottom",
                            end: "bottom top",
                            scrub: 1
                        }
                    }
                );


                gsap.fromTo(
                    manifestoTextoRef.current,
                    {
                        opacity: 0,
                        y: 70
                    },
                    {
                        opacity: 1,
                        y: 0,

                        scrollTrigger: {
                            trigger: manifestoRef.current,
                            start: "top 65%",
                            end: "top 35%",
                            scrub: 1
                        }
                    }
                );


                // =========================================
                // PROPÓSITO
                // =========================================

                gsap.fromTo(
                    `.${style.propositoCard}`,
                    {
                        opacity: 0,
                        y: 60
                    },
                    {
                        opacity: 1,
                        y: 0,
                        duration: 0.9,
                        stagger: 0.14,

                        scrollTrigger: {
                            trigger: propositoRef.current,
                            start: "top 72%"
                        }
                    }
                );


                // =========================================
                // DIFERENCIAIS
                // =========================================

                gsap.fromTo(
                    `.${style.diferencialCard}`,
                    {
                        opacity: 0,
                        y: 60
                    },
                    {
                        opacity: 1,
                        y: 0,
                        duration: 0.9,
                        stagger: 0.12,

                        scrollTrigger: {
                            trigger: diferenciaisRef.current,
                            start: "top 76%"
                        }
                    }
                );


                // =========================================
                // EXPERIÊNCIA
                // =========================================

                gsap.fromTo(
                    experienciaImagemRef.current,
                    {
                        scale: 1.14
                    },
                    {
                        scale: 1,

                        scrollTrigger: {
                            trigger: experienciaRef.current,
                            start: "top bottom",
                            end: "bottom top",
                            scrub: 1
                        }
                    }
                );


                gsap.fromTo(
                    experienciaTextoRef.current,
                    {
                        opacity: 0,
                        y: 70
                    },
                    {
                        opacity: 1,
                        y: 0,
                        duration: 1,

                        scrollTrigger: {
                            trigger: experienciaRef.current,
                            start: "top 72%"
                        }
                    }
                );

            });


        return () => {

            contexto.revert();

        };

    }, []);


    // =====================================================
    // BLOQUEAR SCROLL DO MODAL
    // =====================================================

    useEffect(() => {

        if (abrirModal) {

            document.body.style.overflow =
                "hidden";

        } else {

            document.body.style.overflow =
                "";

        }


        return () => {

            document.body.style.overflow =
                "";

        };

    }, [abrirModal]);


    // =====================================================
    // FECHAR MODAL COM ESC
    // =====================================================

    useEffect(() => {

        function fecharComEsc(event) {

            if (
                event.key === "Escape"
            ) {

                setAbrirModal(false);

            }

        }


        window.addEventListener(
            "keydown",
            fecharComEsc
        );


        return () => {

            window.removeEventListener(
                "keydown",
                fecharComEsc
            );

        };

    }, []);


    // =====================================================
    // RENDER
    // =====================================================

    return (

        <div className={style.page}>

            <HeaderUser />


            <main>


                {/* =================================================
                    HERO
                ================================================= */}

                <section
                    ref={heroRef}
                    className={style.hero}
                >

                    <img
                        ref={heroImagemRef}
                        src={CatalogoTinta}
                        alt="Catálogo e exposição de tintas"
                        className={
                            style.heroImagem
                        }
                    />


                    <div
                        className={
                            style.heroOverlay
                        }
                    />


                    <div
                        ref={heroConteudoRef}
                        className={
                            style.heroConteudo
                        }
                    >

                        <span
                            className={
                                style.heroEyebrow
                            }
                        >
                            SOBRE NÓS
                        </span>


                        <h1>

                            Cores que
                            <br />

                            <em>
                                contam histórias.
                            </em>

                        </h1>


                        <p>

                            Acreditamos que uma cor
                            pode transformar muito
                            mais do que uma parede.
                            Ela muda sensações,
                            ambientes e a forma como
                            vivemos cada espaço.

                        </p>


                        <button
                            type="button"
                            className={
                                style.heroBotao
                            }
                            onClick={() => {

                                document
                                    .getElementById(
                                        "nossa-historia"
                                    )
                                    ?.scrollIntoView({
                                        behavior:
                                            "smooth"
                                    });

                            }}
                        >

                            Nossa história

                            <ArrowRight
                                size={17}
                            />

                        </button>

                    </div>


                    <div
                        className={
                            style.scrollIndicador
                        }
                    >

                        <span>
                            Explore
                        </span>

                        <ChevronDown
                            size={18}
                        />

                    </div>

                </section>


                {/* =================================================
                    INTRO
                ================================================= */}

                <section
                    ref={introRef}
                    className={
                        style.intro
                    }
                >

                    <span
                        className={
                            style.sectionLabel
                        }
                    >
                        NOSSA ESSÊNCIA
                    </span>


                    <h2>

                        Não vendemos apenas tinta.

                        <br />

                        Criamos espaço para
                        <em>
                            {" "}novas histórias.
                        </em>

                    </h2>

                </section>


                {/* =================================================
                    NOSSA HISTÓRIA
                ================================================= */}

                <section
                    id="nossa-historia"
                    ref={historiaRef}
                    className={
                        style.historia
                    }
                >

                    <div
                        className={
                            style.historiaImagemWrapper
                        }
                    >

                        <img
                            ref={
                                historiaImagemRef
                            }
                            src={LojadeTinta}
                            alt="Fachada da nossa loja"
                        />


                        <div
                            className={
                                style.historiaImagemOverlay
                            }
                        />


                        <div
                            className={
                                style.imagemLegenda
                            }
                        >

                            <span>
                                NOSSA CASA
                            </span>

                            <strong>
                                Tintas & Cia
                            </strong>

                        </div>

                    </div>


                    <div
                        ref={
                            historiaTextoRef
                        }
                        className={
                            style.historiaConteudo
                        }
                    >

                        <span
                            className={
                                style.sectionNumber
                            }
                        >
                            01 — NOSSA HISTÓRIA
                        </span>


                        <h2>

                            Tudo começa
                            <br />

                            com uma
                            <em>
                                {" "}cor.
                            </em>

                        </h2>


                        <div
                            className={
                                style.historiaLinha
                            }
                        />


                        <p>

                            A Tintas & Cia nasceu
                            com o propósito de
                            aproximar pessoas das
                            cores capazes de
                            transformar ambientes.

                        </p>


                        <p>

                            Mais do que oferecer
                            produtos, buscamos tornar
                            cada escolha simples,
                            inspiradora e especial,
                            ajudando nossos clientes
                            a encontrar a solução
                            ideal para cada projeto.

                        </p>


                        <p>

                            Da escolha da tonalidade
                            ao acabamento final,
                            queremos participar de
                            cada etapa dessa
                            transformação.

                        </p>


                        <div
                            className={
                                style.assinatura
                            }
                        >

                            <span>
                                NOSSA ESSÊNCIA
                            </span>

                            <strong>
                                Transformar através
                                da cor.
                            </strong>

                        </div>

                    </div>

                </section>


                {/* =================================================
                    MANIFESTO
                ================================================= */}

                <section
                    ref={manifestoRef}
                    className={
                        style.manifesto
                    }
                >

                    <img
                        ref={manifestoImagemRef}
                        src={ObraArte}
                        alt="Ambiente artístico e colorido"
                        className={
                            style.manifestoImagem
                        }
                    />


                    <div
                        className={
                            style.manifestoOverlay
                        }
                    />


                    <div
                        ref={manifestoTextoRef}
                        className={
                            style.manifestoConteudo
                        }
                    >

                        <span>
                            NOSSO JEITO DE VER
                            O MUNDO
                        </span>


                        <h2>

                            Uma parede
                            <br />

                            nunca é apenas
                            <em>
                                {" "}uma parede.
                            </em>

                        </h2>


                        <p>

                            É onde a personalidade
                            aparece, os momentos
                            acontecem e novas
                            histórias começam.

                        </p>

                    </div>

                </section>


                {/* =================================================
                    MISSÃO / VISÃO / VALORES
                ================================================= */}

                <section
                    ref={propositoRef}
                    className={
                        style.proposito
                    }
                >

                    <div
                        className={
                            style.propositoCabecalho
                        }
                    >

                        <span
                            className={
                                style.sectionNumber
                            }
                        >
                            02 — NOSSO PROPÓSITO
                        </span>


                        <h2>

                            O que nos move

                            <br />

                            <em>
                                todos os dias.
                            </em>

                        </h2>

                    </div>


                    <div
                        className={
                            style.propositoGrid
                        }
                    >


                        {/* MISSÃO */}

                        <article
                            className={
                                style.propositoCard
                            }
                        >

                            <div
                                className={
                                    style.propositoTopo
                                }
                            >

                                <span>
                                    01
                                </span>

                                <Target
                                    size={29}
                                />

                            </div>


                            <h3>
                                Missão
                            </h3>


                            <p>

                                Oferecer tintas,
                                ferramentas e soluções
                                de qualidade que ajudem
                                nossos clientes a
                                transformar seus
                                ambientes.

                            </p>

                        </article>


                        {/* VISÃO */}

                        <article
                            className={
                                style.propositoCard
                            }
                        >

                            <div
                                className={
                                    style.propositoTopo
                                }
                            >

                                <span>
                                    02
                                </span>

                                <Eye
                                    size={29}
                                />

                            </div>


                            <h3>
                                Visão
                            </h3>


                            <p>

                                Ser referência no
                                segmento de tintas,
                                oferecendo variedade,
                                confiança e uma
                                experiência cada vez
                                mais completa.

                            </p>

                        </article>


                        {/* VALORES */}

                        <article
                            className={
                                style.propositoCard
                            }
                        >

                            <div
                                className={
                                    style.propositoTopo
                                }
                            >

                                <span>
                                    03
                                </span>

                                <Heart
                                    size={29}
                                />

                            </div>


                            <h3>
                                Valores
                            </h3>


                            <div
                                className={
                                    style.valores
                                }
                            >

                                <span>
                                    Qualidade
                                </span>

                                <span>
                                    Confiança
                                </span>

                                <span>
                                    Inovação
                                </span>

                                <span>
                                    Compromisso
                                </span>

                                <span>
                                    Respeito
                                </span>

                            </div>

                        </article>

                    </div>

                </section>


                {/* =================================================
                    DIFERENCIAIS
                ================================================= */}

                <section
                    ref={
                        diferenciaisRef
                    }
                    className={
                        style.diferenciais
                    }
                >

                    <div
                        className={
                            style.diferenciaisCabecalho
                        }
                    >

                        <div>

                            <span
                                className={
                                    style.sectionNumberClaro
                                }
                            >
                                03 — NOSSA EXPERIÊNCIA
                            </span>


                            <h2>

                                Tudo para
                                transformar

                                <br />

                                <em>
                                    o seu espaço.
                                </em>

                            </h2>

                        </div>


                        <p>

                            Da escolha da primeira
                            cor ao acabamento final,
                            oferecemos soluções para
                            tornar cada projeto mais
                            simples e completo.

                        </p>

                    </div>


                    <div
                        className={
                            style.diferenciaisGrid
                        }
                    >

                        {diferenciais.map(
                            ({
                                id,
                                numero,
                                titulo,
                                descricao,
                                Icone
                            }) => (

                                <article
                                    key={id}
                                    className={
                                        style.diferencialCard
                                    }
                                >

                                    <div
                                        className={
                                            style.diferencialTopo
                                        }
                                    >

                                        <span>
                                            {numero}
                                        </span>

                                        <Icone
                                            size={27}
                                        />

                                    </div>


                                    <div
                                        className={
                                            style.diferencialConteudo
                                        }
                                    >

                                        <h3>
                                            {titulo}
                                        </h3>


                                        <p>
                                            {descricao}
                                        </p>

                                    </div>

                                </article>

                            )
                        )}

                    </div>

                </section>


                {/* =================================================
                    MARCAS
                ================================================= */}

                <section
                    className={
                        style.marcas
                    }
                >

                    <span
                        className={
                            style.marcasTitulo
                        }
                    >

                        GRANDES MARCAS,
                        GRANDES RESULTADOS

                    </span>


                    <div
                        className={
                            style.marcasLista
                        }
                    >

                        <strong>
                            SUVINIL
                        </strong>

                        <i />

                        <strong>
                            CORAL
                        </strong>

                        <i />

                        <strong>
                            SHERWIN-WILLIAMS
                        </strong>

                        <i />

                        <strong>
                            EUCATEX
                        </strong>

                        <i />

                        <strong>
                            ANJO
                        </strong>

                    </div>

                </section>


                {/* =================================================
                    EXPERIÊNCIA / PINTOR
                ================================================= */}

                <section
                    ref={
                        experienciaRef
                    }
                    className={
                        style.experiencia
                    }
                >

                    <div
                        className={
                            style.experienciaConteudo
                        }
                        ref={
                            experienciaTextoRef
                        }
                    >

                        <span
                            className={
                                style.sectionNumber
                            }
                        >
                            04 — DO PROJETO À REALIDADE
                        </span>


                        <h2>

                            A escolha certa

                            <br />

                            faz toda
                            <em>
                                {" "}diferença.
                            </em>

                        </h2>


                        <p>

                            Cada projeto possui suas
                            próprias necessidades.
                            Por isso, buscamos reunir
                            produtos, ferramentas e
                            opções que atendam desde
                            pequenas reformas até
                            trabalhos profissionais.

                        </p>


                        <div
                            className={
                                style.experienciaDetalhe
                            }
                        >

                            <span />

                            <p>

                                Cor, acabamento
                                e qualidade em
                                cada detalhe.

                            </p>

                        </div>

                    </div>


                    <div
                        className={
                            style.experienciaImagem
                        }
                    >

                        <img
                            ref={
                                experienciaImagemRef
                            }
                            src={Pintor}
                            alt="Profissional realizando pintura"
                        />

                    </div>

                </section>


                {/* =================================================
                    LOJAS CTA
                ================================================= */}

                <section
                    className={
                        style.lojasCta
                    }
                >

                    <div
                        className={
                            style.lojasCtaIcone
                        }
                    >

                        <Store
                            size={26}
                        />

                    </div>


                    <div
                        className={
                            style.lojasCtaTexto
                        }
                    >

                        <span>
                            NOSSAS UNIDADES
                        </span>


                        <h2>
                            Venha conhecer
                            a Tintas & Cia.
                        </h2>


                        <p>

                            Encontre a unidade
                            mais próxima e descubra
                            de perto nossas cores,
                            produtos e soluções.

                        </p>

                    </div>


                    <button
                        type="button"
                        onClick={() =>
                            setAbrirModal(true)
                        }
                    >

                        Ver nossas lojas

                        <ArrowUpRight
                            size={17}
                        />

                    </button>

                </section>


            </main>


            {/* =====================================================
                MODAL LOJAS
            ===================================================== */}

            {abrirModal && (

                <div
                    className={
                        style.modalOverlay
                    }
                    onMouseDown={(event) => {

                        if (
                            event.target ===
                            event.currentTarget
                        ) {

                            setAbrirModal(false);

                        }

                    }}
                >

                    <div
                        className={
                            style.modal
                        }
                    >

                        <div
                            className={
                                style.modalTopo
                            }
                        >

                            <div>

                                <span
                                    className={
                                        style.modalSubtitulo
                                    }
                                >
                                    NOSSAS UNIDADES
                                </span>


                                <h2>

                                    Encontre sua

                                    <br />

                                    <em>
                                        Tintas & Cia.
                                    </em>

                                </h2>

                            </div>


                            <button
                                type="button"
                                aria-label="Fechar modal"
                                className={
                                    style.fecharModal
                                }
                                onClick={() =>
                                    setAbrirModal(false)
                                }
                            >

                                <X
                                    size={20}
                                />

                            </button>

                        </div>


                        <div
                            className={
                                style.lojasGrid
                            }
                        >

                            {lojas.map(
                                (loja) => (

                                    <article
                                        key={
                                            loja.id
                                        }
                                        className={
                                            style.lojaCard
                                        }
                                    >

                                        <div
                                            className={
                                                style.lojaTop
                                            }
                                        >

                                            <div
                                                className={
                                                    style.lojaIcone
                                                }
                                            >

                                                <Store
                                                    size={22}
                                                />

                                            </div>


                                            <div
                                                className={
                                                    style.avaliacao
                                                }
                                            >

                                                <Star
                                                    size={14}
                                                    fill="currentColor"
                                                />

                                                {
                                                    loja.avaliacao
                                                }

                                            </div>

                                        </div>


                                        <span
                                            className={
                                                style.lojaNumero
                                            }
                                        >

                                            UNIDADE 0
                                            {loja.id}

                                        </span>


                                        <h3>
                                            {
                                                loja.nome
                                            }
                                        </h3>


                                        <div
                                            className={
                                                style.infoLoja
                                            }
                                        >

                                            <div
                                                className={
                                                    style.infoLinha
                                                }
                                            >

                                                <MapPin
                                                    size={17}
                                                />

                                                <span>
                                                    {
                                                        loja.endereco
                                                    }
                                                </span>

                                            </div>


                                            <div
                                                className={
                                                    style.infoLinha
                                                }
                                            >

                                                <Clock3
                                                    size={17}
                                                />

                                                <span>
                                                    {
                                                        loja.horario
                                                    }
                                                </span>

                                            </div>


                                            <div
                                                className={
                                                    style.infoLinha
                                                }
                                            >

                                                <Phone
                                                    size={17}
                                                />

                                                <span>
                                                    {
                                                        loja.telefone
                                                    }
                                                </span>

                                            </div>

                                        </div>


                                        <button
                                            type="button"
                                            className={
                                                style.botaoRota
                                            }
                                        >

                                            Ver rota

                                            <ArrowUpRight
                                                size={16}
                                            />

                                        </button>

                                    </article>

                                )
                            )}

                        </div>

                    </div>

                </div>

            )}

        </div>

    );

}