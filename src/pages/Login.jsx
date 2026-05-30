import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/authContext.jsx";
import styles from "../styles/Login.module.css";

import logo from "../assets/imagens/logo.png";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");

  const frases = [
    "Transforme seu lar",
    "Cores Que Inspiram",
    "Sua Casa, Seu Estilo",
    "Pinte Novas Histórias",
    "Pixel Color"
  ];

  const [fraseAtual, setFraseAtual] = useState(0);
  const [fade, setFade] = useState(false);

  useEffect(() => {
    const intervalo = setInterval(() => {
      setFade(true);

      setTimeout(() => {
        setFraseAtual((prev) =>
          prev === frases.length - 1 ? 0 : prev + 1
        );

        setFade(false);
      }, 500);
    }, 3000);

    return () => clearInterval(intervalo);
  }, []);

  async function entrar(event) {
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
            <img
              src={logo}
              alt="Pixel Color"
              className={styles.logo}
            />
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
            da sua loja com uma plataforma
            moderna, rápida e intuitiva.
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
            onSubmit={entrar}
            className={styles.form}
          >
            <div className={styles.inputGroup}>
              <label>Email</label>

              <input
                type="email"
                required
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
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
                onChange={(e) =>
                  setSenha(e.target.value)
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
            Pixel Color © 2026
          </div>
        </div>
      </div>
    </div>
  );
}