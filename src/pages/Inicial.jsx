import { useEffect, useRef } from "react";
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
} from "react-icons/fi";

import HeaderUser from "../components/Cabeçalho-Users/index.jsx";
import style from "../styles/Inicial.module.css";

export default function LojaTintas() {
  const tituloRef = useRef(null);
  const introContainerRef = useRef(null);
  const rollerRef = useRef(null);
  const svgPathRef = useRef(null);
  const brandNameRef = useRef(null);

  useEffect(() => {
    // 1. Configuração instantânea dos estados iniciais
    gsap.set(introContainerRef.current, { visibility: "visible" });
    gsap.set(brandNameRef.current, { opacity: 0, y: 30, scale: 0.85 });
    gsap.set([`.${style.benefitCard}`, `.${style.productCard}`], { opacity: 0, y: 30 });

    // 2. TIMELINE ULTRA RÁPIDA (Dispara imediatamente)
    const tlGlobal = gsap.timeline({
      onComplete: () => {
        gsap.set(introContainerRef.current, { display: "none", pointerEvents: "none" });
      }
    });

    tlGlobal
      // A escrita "Pixel Colors" surge de forma impactante no centro
      .to(brandNameRef.current, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.45,
        ease: "back.out(1.5)"
      })

      // Tempo curto para leitura rápida do nome da marca
      .to({}, { duration: 0.55 })

      // A escrita sobe sumindo para dar espaço à entrada do rolo
      .to(brandNameRef.current, {
        opacity: 0,
        y: -40,
        duration: 0.25,
        ease: "power2.in"
      })
      
      // O rolo de pintura sobe limpando a tela azul
      .fromTo(rollerRef.current, 
        { y: "105vh" }, 
        { y: "-45vh", duration: 1.1, ease: "power2.inOut" },
        "-=0.1"
      )
      // O corte do SVG revela o site acompanhando o rolo perfeitamente
      .to(svgPathRef.current, {
        attr: { d: "M 0 0 V 0 Q 50 0 100 0 V 0 Z" }, 
        duration: 1.1,
        ease: "power2.inOut"
      }, "-=1.1")
      
      // Surge o título da Hero Section do site principal
      .fromTo(tituloRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" },
        "-=0.4"
      )

      // Cards de benefícios e produtos surgem logo em sequência automática
      .to(`.${style.benefitCard}`, {
        opacity: 1,
        y: 0,
        duration: 0.4,
        stagger: 0.08,
        ease: "power2.out"
      }, "-=0.2")

      .to(`.${style.productCard}`, {
        opacity: 1,
        y: 0,
        duration: 0.5,
        stagger: 0.1,
        ease: "power3.out"
      }, "-=0.2");

    // Efeito de flutuação sutil infinito para a lata de tinta principal
    gsap.to(`.${style.paintCan}`, {
      y: -25,
      duration: 2.5,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });

  }, []);

  return (
    <div className={style.container}>
      <HeaderUser />
      
      {/* INTRODUÇÃO AUTOMÁTICA ULTRA RÁPIDA */}
      <div ref={introContainerRef} className={style.introContainer}>
        
        {/* Apenas a escrita centralizada na tela */}
        <h1 ref={brandNameRef} className={style.initialBrandName}>Pixel Colors</h1>

        <svg className={style.paintSvg} viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <filter id="paint-edge">
              <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" result="noise" />
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="5" xChannelSelector="R" yChannelSelector="G" />
            </filter>
          </defs>
          <path 
            ref={svgPathRef}
            fill="#2563eb" 
            filter="url(#paint-edge)"
            d="M 0 0 V 100 Q 50 100 100 100 V 0 Z"
          />
        </svg>
        
        <div ref={rollerRef} className={style.realRoller}>
          <svg viewBox="0 0 300 400" className={style.rollerSvgGraphic}>
            <ellipse cx="150" cy="110" rx="110" ry="15" fill="rgba(0,0,0,0.2)" filter="blur(6px)" />
            <path d="M 250 100 L 270 100 L 270 170 L 175 220 L 175 260" fill="none" stroke="#94a3b8" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M 250 100 L 270 100 L 270 170 L 175 220 L 175 260" fill="none" stroke="#cbd5e1" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            <rect x="160" y="260" width="30" height="110" rx="8" fill="#dc2626" />
            <rect x="163" y="260" width="8" height="110" rx="2" fill="#ef4444" opacity="0.4" />
            <circle cx="175" cy="350" r="4" fill="#0f172a" />
            <rect x="34" y="88" width="12" height="24" rx="3" fill="#b45309" />
            <rect x="254" y="88" width="12" height="24" rx="3" fill="#b45309" />
            <rect x="40" y="80" width="220" height="40" rx="12" fill="#3b82f6" stroke="#2563eb" strokeWidth="2" />
            <path d="M 50 85 Q 70 115 90 90 Q 120 120 150 95 Q 180 115 210 85 Q 230 115 250 95" fill="none" stroke="#1d4ed8" strokeWidth="4" strokeLinecap="round" opacity="0.8" />
            <path d="M 60 115 Q 90 85 120 110 Q 160 85 190 115 Q 220 90 245 110" fill="none" stroke="#1e40af" strokeWidth="3" strokeLinecap="round" opacity="0.7" />
            <path d="M 45 100 L 255 100" fill="none" stroke="#60a5fa" strokeWidth="2" strokeDasharray="4 8" opacity="0.6" />
          </svg>
        </div>
      </div>

      {/* GLOW BACKGROUND */}
      <div className={`${style.glow} ${style.glow1}`}></div>
      <div className={`${style.glow} ${style.glow2}`}></div>

      {/* HERO SECTION */}
      <section className={style.hero}>
        <div className={style.heroText}>
          <span className={style.badge}>Coleção Premium 2026</span>
          <h1 ref={tituloRef}>
            A nova geração <span>de tintas premium</span>
          </h1>
          <p>
            Design sofisticado, acabamento profissional e uma experiência visual
            inspirada nas landing pages modernas do mercado global.
          </p>
          <div className={style.heroButtons}>
            <button className={style.primaryButton}>Explorar catálogo</button>
            <button className={style.secondaryButton}>Ver coleções</button>
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

      {/* INTERACTIVE TECH SHOWCASE */}
      <section className={style.interactiveShowcase}>
        <div className={style.showcaseGrid}>
          <div className={style.showcaseText}>
            <span>Performance</span>
            <h2>Por que escolher nossa fórmula molecular?</h2>
            <p>
              Nossas tintas utilizam polímeros inteligentes que repelem sujeira,
              são 100% laváveis e cobrem imperfeições estruturais com apenas uma demão.
            </p>
          </div>
          <div className={style.techCards}>
            <div className={style.techCard}>
              <FiActivity />
              <h4>Filtro UV Ativo</h4>
              <p>Evita o desbotamento precoce causado pelos raios solares por anos.</p>
            </div>
          </div>
        </div>
      </section>

      {/* BENEFÍCIOS */}
      <section className={style.benefits}>
        <div className={style.benefitCard}>
          <FiDroplet />
          <h3>Cores vibrantes</h3>
          <p>Pigmentação intensa e acabamento premium durável.</p>
        </div>
        <div className={style.benefitCard}>
          <FiShield />
          <h3>Alta resistência</h3>
          <p>Durabilidade extrema desenvolvida para qualquer ambiente.</p>
        </div>
        <div className={style.benefitCard}>
          <FiAward />
          <h3>Qualidade premium</h3>
          <p>Tecnologia avançada que resulta em um reflexo impecável.</p>
        </div>
        <div className={style.benefitCard}>
          <FiTruck />
          <h3>Entrega rápida</h3>
          <p>Segurança logística garantida para todo o território.</p>
        </div>
      </section>

      {/* PRODUTOS */}
      <section className={style.products}>
        <div className={style.sectionTop}>
          <span>Produtos Premium</span>
          <h2>As tintas mais desejadas</h2>
        </div>
        <div className={style.productGrid}>
          <div className={style.productCard}>
            <div className={style.productImage}>
              <img src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=1200&auto=format&fit=crop" alt="Azul" />
            </div>
            <div className={style.productInfo}>
              <h3>Azul Oceano</h3>
              <p>Elegância e sofisticação para interiores modernos.</p>
              <div className={style.priceRow}>
                <strong>R$ 149</strong>
                <button><FiShoppingCart /></button>
              </div>
            </div>
          </div>

          <div className={style.productCard}>
            <div className={style.productImage}>
              <img src="https://images.unsplash.com/photo-1484154218962-a197022b5858?q=80&w=1200&auto=format&fit=crop" alt="Branco" />
            </div>
            <div className={style.productInfo}>
              <h3>Minimal White</h3>
              <p>Estética clean de altíssima refletividade.</p>
              <div className={style.priceRow}>
                <strong>R$ 189</strong>
                <button><FiShoppingCart /></button>
              </div>
            </div>
          </div>

          <div className={style.productCard}>
            <div className={style.productImage}>
              <img src="https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=1200&auto=format&fit=crop" alt="Verde" />
            </div>
            <div className={style.productInfo}>
              <h3>Nature Green</h3>
              <p>Conecte sua casa ao aconchego e equilíbrio botânico.</p>
              <div className={style.priceRow}>
                <strong>R$ 169</strong>
                <button><FiShoppingCart /></button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SHOWCASE AMBIENTE */}
      <section className={style.showcase}>
        <div className={style.showcaseContent}>
          <span>Nova experiência visual</span>
          <h2>Inspire-se em ambientes modernos</h2>
          <p>Descubra combinações sofisticadas para transformar qualquer ambiente.</p>
          <button className={style.showcaseButton}>
            Explorar ambientes <FiArrowRight />
          </button>
        </div>
      </section>

      {/* DEPOIMENTOS */}
      <section className={style.testimonials}>
        <div className={style.sectionTopCentred}>
          <span>Feedbacks</span>
          <h2>O que dizem os especialistas</h2>
        </div>
        <div className={style.testimonialsGrid}>
          <div className={style.testimonialCard}>
            <FiMessageSquare className={style.testiIcon} />
            <p>"A cobertura dessa tinta superou as expectativas em gesso cartonado. Toque de veludo puro."</p>
            <div className={style.userAuthor}>
              <strong>Amanda Silva</strong>
              <span>Arquiteta de Interiores</span>
            </div>
          </div>
          <div className={style.testimonialCard}>
            <FiMessageSquare className={style.testiIcon} />
            <p>"Duas demãos cobriram perfeitamente um fundo cinza chumbo sem deixar manchas de rolo."</p>
            <div className={style.userAuthor}>
              <strong>Marcos Souza</strong>
              <span>Pintor Profissional</span>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className={style.footer}>
        <p>© 2026 Pixel Colors. Todos os direitos reservados. Experiência de Interface Premium.</p>
      </footer>
    </div>
  );
}
