import { Mail, PaintRoller, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";

import styles from "./Rodape.module.css";

export default function Rodape() {
  return (
    <footer className={styles.rodape}>
      <div className={styles.conteudo}>

        {/* LOGO E DESCRIÇÃO */}
        <div className={styles.colunaLogo}>
          <div className={styles.logo}>
            <PaintRoller size={30} strokeWidth={2} />

            <div>
              <span className={styles.logoNome}>
                Pixel<span>Color</span>
              </span>

              <small>TINTAS</small>
            </div>
          </div>

          <p className={styles.descricao}>
            Transformamos ambientes
            <br />
            com cores, qualidade e
            <br />
            atendimento que fazem
            <br />
            a diferença.
          </p>

          {/* REDES SOCIAIS */}
          <div className={styles.redes}>

            {/* Instagram */}
            <a href="#" aria-label="Instagram">
              <svg
                viewBox="0 0 24 24"
                width="18"
                height="18"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="3" y="3" width="18" height="18" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle
                  cx="17.5"
                  cy="6.5"
                  r="1"
                  fill="currentColor"
                  stroke="none"
                />
              </svg>
            </a>

            {/* Facebook */}
            <a href="#" aria-label="Facebook">
              <svg
                viewBox="0 0 24 24"
                width="18"
                height="18"
                fill="currentColor"
              >
                <path d="M14 8h3V4h-3c-3.31 0-5 1.69-5 5v3H6v4h3v8h4v-8h3.5l.5-4H13V9c0-.66.34-1 1-1z" />
              </svg>
            </a>

            {/* WhatsApp */}
            <a href="#" aria-label="WhatsApp">
              <MessageCircle size={18} />
            </a>

            {/* YouTube */}
            <a href="#" aria-label="YouTube">
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

        {/* INSTITUCIONAL */}
        <div className={styles.coluna}>
          <h3>Institucional</h3>

          <Link to="/sobre-nos">Sobre Nós</Link>
          <Link to="/nossas-lojas">Nossas Lojas</Link>
          <Link to="/politica-privacidade">
            Política de Privacidade
          </Link>
          <Link to="/termos-de-uso">
            Termos de Uso
          </Link>
          <Link to="/trabalhe-conosco">
            Trabalhe Conosco
          </Link>
        </div>

        {/* AJUDA */}
        <div className={styles.coluna}>
          <h3>Ajuda</h3>

          <Link to="/central-ajuda">
            Central de Ajuda
          </Link>

          <Link to="/trocas-devolucoes">
            Trocas e Devoluções
          </Link>

          <Link to="/formas-pagamento">
            Formas de Pagamento
          </Link>

          <Link to="/prazos-entrega">
            Prazos de Entrega
          </Link>

          <Link to="/como-comprar">
            Como Comprar
          </Link>
        </div>

        {/* NEWSLETTER */}
        <div className={styles.colunaNewsletter}>
          <h3>Newsletter</h3>

          <p>
            Receba ofertas exclusivas
            <br />
            e novidades por e-mail!
          </p>

          <div className={styles.emailBox}>
            <Mail size={16} />

            <input
              type="email"
              placeholder="Seu melhor e-mail"
            />
          </div>

          <button className={styles.botaoNewsletter}>
            Inscrever-se
          </button>
        </div>
      </div>

      {/* PARTE INFERIOR */}
      <div className={styles.linhaInferior}>

        <p>
          © 2024 Pixel Color Tintas. Todos os direitos reservados.
        </p>

        <div className={styles.pagamentos}>

          <div className={styles.pagamento}>
            <span className={styles.visa}>VISA</span>
          </div>

          <div className={styles.pagamento}>
            <span className={styles.mastercard}>
              <i></i>
              <i></i>
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

          <div className={styles.pagamento}>
            <span className={styles.boleto}>
              Boleto
            </span>
          </div>

        </div>
      </div>
    </footer>
  );
}