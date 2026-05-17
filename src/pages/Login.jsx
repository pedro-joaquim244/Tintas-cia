import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/authContext.jsx";
import styles from "../styles/Login.module.css";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");

  const { login } = useAuth();

  /* FRASES */

  const frases = [
  "Cor que Fica",
  "Sua Cor Ideal",
  "Mais Cor Viva",
  "Pinte Seu Lar",
  "Cor e Luz"
];

  const [fraseAtual, setFraseAtual] = useState(0);

  const [fade, setFade] = useState(false);

  /* TROCA A FRASE COM ANIMAÇÃO */

  useEffect(() => {

    const intervalo = setInterval(() => {

      /* COMEÇA O FADE */

      setFade(true);

      /* TROCA A FRASE */

      setTimeout(() => {

        setFraseAtual((prev) =>
          prev === frases.length - 1
            ? 0
            : prev + 1
        );

        setFade(false);

      }, 500);

    }, 3000);

    return () => clearInterval(intervalo);

  }, []);

  async function Entrar(event) {
    event.preventDefault();

    setErro("");

    const resultado = await login(email, senha);

    if (resultado.sucesso) {
      navigate("/dashboard");
    } else {
      setErro(resultado.mensagem);
    }
  }

  return (
    <div className={styles.container}>

      {/* LADO ESQUERDO */}

      <div className={styles.left}>

        <div className={styles.paint1}></div>
        <div className={styles.paint2}></div>
        <div className={styles.paint3}></div>
        <div className={styles.paint4}></div>

        <div className={styles.overlay}>

          <div className={styles.brand}>
            tinta<span>+</span>
          </div>

          <h2
            className={`${styles.changingText} ${
              fade ? styles.fadeOut : ""
            }`}
          >
            {frases[fraseAtual]}
          </h2>

          <p>
            Gerencie produtos, estoque e vendas
            da sua loja de tintas com uma
            plataforma moderna e intuitiva.
          </p>

        </div>
      </div>

      {/* LADO DIREITO */}

      <div className={styles.right}>

        <div className={styles.card}>

          <div className={styles.top}>

            <h1>Entrar</h1>

            <p>
              Faça login para acessar
              o painel administrativo.
            </p>

          </div>

          {erro && (
            <div className={styles.erro}>
              {erro}
            </div>
          )}

          <form
            onSubmit={Entrar}
            className={styles.form}
          >

            <div className={styles.inputGroup}>

              <label>Email</label>

              <input
                type="email"
                required
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                placeholder="Digite seu email"
              />

            </div>

            <div className={styles.inputGroup}>

              <label>Senha</label>

              <input
                type="password"
                required
                value={senha}
                onChange={(event) =>
                  setSenha(event.target.value)
                }
                placeholder="Digite sua senha"
              />

            </div>

            <button
              type="submit"
              className={styles.button}
            >
              Entrar
            </button>

          </form>

          <div className={styles.footer}>
            tinta+ © 2026
          </div>

        </div>
      </div>
    </div>
  );
}