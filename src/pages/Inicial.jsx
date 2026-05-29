import { useEffect, useRef } from "react";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import {
  FiShoppingCart,
  FiDroplet,
  FiShield,
  FiAward,
  FiStar,
  FiTruck,
  FiArrowRight,
} from "react-icons/fi";

import style from "../styles/Inicial.module.css";

gsap.registerPlugin(ScrollTrigger);

export default function LojaTintas() {
  const latasRef = useRef([]);
  const cardsRef = useRef([]);
  const tituloRef = useRef(null);

  useEffect(() => {

    gsap.fromTo(
      tituloRef.current,
      {
        opacity: 0,
        y: 100,
      },
      {
        opacity: 1,
        y: 0,
        duration: 1.5,
        ease: "power4.out",
      }
    );

    /* HERO CINEMATIC */

    gsap.to(`.${style.paintCan}`, {
      rotate: 120,

      scrollTrigger: {
        trigger: `.${style.hero}`,
        start: "top top",
        end: "+=2200",
        scrub: 6,
      },
    });

    gsap.to(`.${style.paintCan}`, {
      y: -35,
      duration: 3,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });

    gsap.to(`.${style.heroImage}`, {
      y: 80,

      scrollTrigger: {
        trigger: `.${style.hero}`,
        start: "top top",
        end: "+=2200",
        scrub: 5,
      },
    });

    /* CARDS */

    latasRef.current.forEach((item, index) => {

      gsap.fromTo(
        item,
        {
          y: 180,
          opacity: 0,
          rotateY: 20,
          scale: .8,
        },
        {
          y: 0,
          opacity: 1,
          rotateY: 0,
          scale: 1,

          duration: 1.3,
          ease: "power4.out",

          scrollTrigger: {
            trigger: item,
            start: "top 85%",
            scrub: 1,
          },
        }
      );

    });

    /* BENEFITS */

    cardsRef.current.forEach((card) => {

      gsap.fromTo(
        card,
        {
          opacity: 0,
          y: 100,
        },
        {
          opacity: 1,
          y: 0,

          duration: 1,

          scrollTrigger: {
            trigger: card,
            start: "top 90%",
          },
        }
      );

    });

  }, []);

  return (
    <div className={style.container}>

      {/* GLOW */}

      <div className={`${style.glow} ${style.glow1}`}></div>
      <div className={`${style.glow} ${style.glow2}`}></div>

      {/* HEADER */}

      <header className={style.header}>

        <div className={style.logo}>
          <span>Tintas+</span>
        </div>

        <nav className={style.nav}>
          <a href="#">Início</a>
          <a href="#">Tintas</a>
          <a href="#">Coleções</a>
          <a href="#">Contato</a>
        </nav>

        <button className={style.btnHeader}>
          Comprar agora
        </button>

      </header>

      {/* HERO */}

      <section className={style.hero}>

        <div className={style.heroText}>

          <span className={style.badge}>
            Coleção Premium 2026
          </span>

          <h1 ref={tituloRef}>
            A nova geração
            <span> de tintas premium</span>
          </h1>

          <p>
            Design sofisticado, acabamento profissional
            e uma experiência visual inspirada nas
            landing pages modernas da Apple.
          </p>

          <div className={style.heroButtons}>

            <button className={style.primaryButton}>
              Explorar catálogo
            </button>

            <button className={style.secondaryButton}>
              Ver coleções
            </button>

          </div>

          <div className={style.heroStats}>

            <div>
              <strong>+12mil</strong>
              <span>Clientes</span>
            </div>

            <div>
              <strong>98%</strong>
              <span>Aprovação</span>
            </div>

            <div>
              <strong>+340</strong>
              <span>Cores</span>
            </div>

          </div>

        </div>

        {/* HERO IMAGE */}

        <div className={style.heroImage}>

          <div className={style.paintCan}>

            <img
              src="https://images.unsplash.com/photo-1562259949-e8e7689d7828?q=80&w=1200&auto=format&fit=crop"
              alt="Tinta"
            />

          </div>

          <div className={style.floatingCard}>

            <FiStar />

            <div>
              <strong>Premium Quality</strong>
              <span>Acabamento impecável</span>
            </div>

          </div>

        </div>

      </section>

      {/* BENEFÍCIOS */}

      <section className={style.benefits}>

        <div
          className={style.benefitCard}
          ref={(el) => (cardsRef.current[0] = el)}
        >

          <FiDroplet />

          <h3>Cores vibrantes</h3>

          <p>
            Pigmentação intensa e acabamento premium.
          </p>

        </div>

        <div
          className={style.benefitCard}
          ref={(el) => (cardsRef.current[1] = el)}
        >

          <FiShield />

          <h3>Alta resistência</h3>

          <p>
            Durabilidade extrema para qualquer ambiente.
          </p>

        </div>

        <div
          className={style.benefitCard}
          ref={(el) => (cardsRef.current[2] = el)}
        >

          <FiAward />

          <h3>Qualidade premium</h3>

          <p>
            Tecnologia avançada com acabamento impecável.
          </p>

        </div>

        <div
          className={style.benefitCard}
          ref={(el) => (cardsRef.current[3] = el)}
        >

          <FiTruck />

          <h3>Entrega rápida</h3>

          <p>
            Segurança e rapidez para todo o Brasil.
          </p>

        </div>

      </section>

      {/* PRODUCTS */}

      <section className={style.products}>

        <div className={style.sectionTop}>

          <span>Produtos Premium</span>

          <h2>
            As tintas mais desejadas
          </h2>

        </div>

        <div className={style.productGrid}>

          {/* CARD */}

          <div
            className={style.productCard}
            ref={(el) => (latasRef.current[0] = el)}
          >

            <div className={style.productImage}>

              <img
                src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=1200&auto=format&fit=crop"
                alt=""
              />

            </div>

            <div className={style.productInfo}>

              <h3>Azul Oceano</h3>

              <p>
                Elegância e sofisticação para interiores modernos.
              </p>

              <div className={style.priceRow}>

                <strong>R$ 149</strong>

                <button>
                  <FiShoppingCart />
                </button>

              </div>

            </div>

          </div>

          {/* CARD */}

          <div
            className={style.productCard}
            ref={(el) => (latasRef.current[1] = el)}
          >

            <div className={style.productImage}>

              <img
                src="https://images.unsplash.com/photo-1484154218962-a197022b5858?q=80&w=1200&auto=format&fit=crop"
                alt=""
              />

            </div>

            <div className={style.productInfo}>

              <h3>Minimal White</h3>

              <p>
                Estética clean e acabamento sofisticado.
              </p>

              <div className={style.priceRow}>

                <strong>R$ 189</strong>

                <button>
                  <FiShoppingCart />
                </button>

              </div>

            </div>

          </div>

          {/* CARD */}

          <div
            className={style.productCard}
            ref={(el) => (latasRef.current[2] = el)}
          >

            <div className={style.productImage}>

              <img
                src="https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=1200&auto=format&fit=crop"
                alt=""
              />

            </div>

            <div className={style.productInfo}>

              <h3>Nature Green</h3>

              <p>
                Sensação natural e aconchegante.
              </p>

              <div className={style.priceRow}>

                <strong>R$ 169</strong>

                <button>
                  <FiShoppingCart />
                </button>

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* SHOWCASE */}

      <section className={style.showcase}>

        <div className={style.showcaseContent}>

          <span>Nova experiência visual</span>

          <h2>
            Inspire-se em ambientes modernos
          </h2>

          <p>
            Descubra combinações sofisticadas para
            transformar qualquer ambiente.
          </p>

          <button className={style.showcaseButton}>

            Explorar ambientes

            <FiArrowRight />

          </button>

        </div>

      </section>

    </div>
  );
}