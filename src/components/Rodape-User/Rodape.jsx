import {
    ArrowUpRight,
    Mail,
    MessageCircle
} from "lucide-react";

import { Link } from "react-router-dom";

import styles from "./Rodape.module.css";

import logo from "../../assets/imagens/logo.jfif";


export default function Rodape() {

    const anoAtual =
        new Date().getFullYear();


    return (

        <footer className={styles.rodape}>

            {/* =====================================================
                ÁREA PRINCIPAL
            ===================================================== */}

            <div className={styles.conteudo}>


                {/* =================================================
                    MARCA
                ================================================= */}

                <div className={styles.colunaMarca}>

                    <div className={styles.logo}>

                        <div className={styles.logoImagemBox}>

                            <img
                                src={logo}
                                alt="Pixel Color"
                                className={styles.logoImagem}
                            />

                        </div>

                        <div className={styles.logoLegenda}>

                            <span>
                                PIXEL COLOR
                            </span>

                            <small>
                                TINTAS • CORES • AMBIENTES
                            </small>

                        </div>

                    </div>


                    <h2 className={styles.frasePrincipal}>
                        Cores que
                        <br />
                        transformam
                        <em> histórias.</em>
                    </h2>


                    <p className={styles.descricao}>
                        Muito além de pintar paredes.
                        Criamos possibilidades para
                        transformar ambientes, sensações
                        e novos momentos.
                    </p>


                    {/* =============================================
                        REDES
                    ============================================= */}

                    <div className={styles.redes}>

                        <a
                            href="#"
                            aria-label="Instagram"
                            title="Instagram"
                        >
                            <svg
                                viewBox="0 0 24 24"
                                width="18"
                                height="18"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <rect
                                    x="3"
                                    y="3"
                                    width="18"
                                    height="18"
                                    rx="5"
                                />

                                <circle
                                    cx="12"
                                    cy="12"
                                    r="4"
                                />

                                <circle
                                    cx="17.5"
                                    cy="6.5"
                                    r="1"
                                    fill="currentColor"
                                    stroke="none"
                                />
                            </svg>
                        </a>


                        <a
                            href="#"
                            aria-label="Facebook"
                            title="Facebook"
                        >
                            <svg
                                viewBox="0 0 24 24"
                                width="18"
                                height="18"
                                fill="currentColor"
                            >
                                <path d="M14 8h3V4h-3c-3.31 0-5 1.69-5 5v3H6v4h3v8h4v-8h3.5l.5-4H13V9c0-.66.34-1 1-1z" />
                            </svg>
                        </a>


                        <a
                            href="#"
                            aria-label="WhatsApp"
                            title="WhatsApp"
                        >
                            <MessageCircle size={18} />
                        </a>


                        <a
                            href="#"
                            aria-label="YouTube"
                            title="YouTube"
                        >
                            <svg
                                viewBox="0 0 24 24"
                                width="19"
                                height="19"
                                fill="currentColor"
                            >
                                <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31.7 31.7 0 0 0 0 12a31.7 31.7 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31.7 31.7 0 0 0 24 12a31.7 31.7 0 0 0-.5-5.8zM9.6 15.6V8.4l6.3 3.6-6.3 3.6z" />
                            </svg>
                        </a>

                    </div>

                </div>



                {/* =================================================
                    LINKS
                ================================================= */}

                <div className={styles.areaLinks}>


                    {/* =============================================
                        INSTITUCIONAL
                    ============================================= */}

                    <div className={styles.coluna}>

                        <span className={styles.numeroColuna}>
                            01
                        </span>

                        <h3>
                            Institucional
                        </h3>


                        <Link to="/sobre-nos">
                            <span>
                                Sobre Nós
                            </span>

                            <ArrowUpRight size={14} />
                        </Link>


                        <Link to="/nossas-lojas">
                            <span>
                                Nossas Lojas
                            </span>

                            <ArrowUpRight size={14} />
                        </Link>


                        <Link to="/politica-privacidade">
                            <span>
                                Política de Privacidade
                            </span>

                            <ArrowUpRight size={14} />
                        </Link>


                        <Link to="/termos-de-uso">
                            <span>
                                Termos de Uso
                            </span>

                            <ArrowUpRight size={14} />
                        </Link>


                        <Link to="/trabalhe-conosco">
                            <span>
                                Trabalhe Conosco
                            </span>

                            <ArrowUpRight size={14} />
                        </Link>

                    </div>



                    {/* =============================================
                        AJUDA
                    ============================================= */}

                    <div className={styles.coluna}>

                        <span className={styles.numeroColuna}>
                            02
                        </span>

                        <h3>
                            Ajuda
                        </h3>


                        <Link to="/central-ajuda">
                            <span>
                                Central de Ajuda
                            </span>

                            <ArrowUpRight size={14} />
                        </Link>


                        <Link to="/trocas-devolucoes">
                            <span>
                                Trocas e Devoluções
                            </span>

                            <ArrowUpRight size={14} />
                        </Link>


                        <Link to="/formas-pagamento">
                            <span>
                                Formas de Pagamento
                            </span>

                            <ArrowUpRight size={14} />
                        </Link>


                        <Link to="/prazos-entrega">
                            <span>
                                Prazos de Entrega
                            </span>

                            <ArrowUpRight size={14} />
                        </Link>


                        <Link to="/como-comprar">
                            <span>
                                Como Comprar
                            </span>

                            <ArrowUpRight size={14} />
                        </Link>

                    </div>

                </div>



                {/* =================================================
                    NEWSLETTER
                ================================================= */}

                <div className={styles.colunaNewsletter}>

                    <span className={styles.numeroColuna}>
                        03
                    </span>


                    <span className={styles.newsletterLabel}>
                        NEWSLETTER
                    </span>


                    <h3>
                        Inspire-se
                        <br />
                        com novas
                        <em> cores.</em>
                    </h3>


                    <p>
                        Receba novidades, tendências,
                        lançamentos e ofertas exclusivas
                        diretamente no seu e-mail.
                    </p>


                    <div className={styles.formNewsletter}>

                        <div className={styles.emailBox}>

                            <Mail
                                size={18}
                                strokeWidth={1.6}
                            />

                            <input
                                type="email"
                                placeholder="Digite seu melhor e-mail"
                            />

                        </div>


                        <button
                            type="button"
                            className={styles.botaoNewsletter}
                        >
                            <span>
                                Inscrever-se
                            </span>

                            <ArrowUpRight size={17} />
                        </button>

                    </div>

                </div>

            </div>



            {/* =====================================================
                DIVISÓRIA
            ===================================================== */}

            <div className={styles.divisoria} />



            {/* =====================================================
                ASSINATURA GRANDE
            ===================================================== */}

            <div className={styles.assinatura}>

                <span>
                    PIXEL
                </span>

                <em>
                    COLOR
                </em>

            </div>



            {/* =====================================================
                PARTE INFERIOR
            ===================================================== */}

            <div className={styles.linhaInferior}>

                <div className={styles.copyright}>

                    <p>
                        © {anoAtual} Pixel Color Tintas.
                        Todos os direitos reservados.
                    </p>


                    <span>
                        Transformando ambientes através da cor.
                    </span>

                </div>


                {/* =============================================
                    PAGAMENTOS
                ============================================= */}

                <div className={styles.areaPagamentos}>

                    <span className={styles.pagamentosTitulo}>
                        Pagamento seguro
                    </span>


                    <div className={styles.pagamentos}>

                        <div className={styles.pagamento}>

                            <span className={styles.visa}>
                                VISA
                            </span>

                        </div>


                        <div className={styles.pagamento}>

                            <span className={styles.mastercard}>
                                <i />
                                <i />
                            </span>

                        </div>


                        <div className={styles.pagamento}>

                            <span className={styles.elo}>
                                elo
                            </span>

                        </div>


                        <div className={styles.pagamento}>

                            <span className={styles.pix}>
                                ✥ pix
                            </span>

                        </div>


                        <div className={styles.pagamentoBoleto}>

                            <span>
                                Boleto
                            </span>

                        </div>

                    </div>

                </div>

            </div>

        </footer>

    );

}