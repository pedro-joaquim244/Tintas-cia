import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/authContext";
import styles from "../styles/Cadastro.module.css";

export default function Cadastro() {
  const { cadastrar } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ nome: "", email: "", senha: "" });
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [carregando, setCarregando] = useState(false);

  function alterarCampo(event) {
    setForm((atual) => ({ ...atual, [event.target.name]: event.target.value }));
  }

  async function enviar(event) {
    event.preventDefault();
    setErro("");
    setSucesso("");
    setCarregando(true);

    const resultado = await cadastrar(form.nome, form.email, form.senha);
    setCarregando(false);

    if (!resultado.sucesso) {
      setErro(resultado.mensagem);
      return;
    }

    setSucesso("Conta de cliente criada com sucesso.");
    setTimeout(() => navigate("/login", { replace: true }), 1000);
  }

  return (
    <div className={styles.container}>
      <div className={styles.left}>
        <img src="/logo.png" alt="Pixel Colors" className={styles.logo} />
        <h1>TRANSFORME SEU LAR</h1>
        <p>Crie sua conta para acessar a experiência Pixel Colors.</p>
      </div>

      <div className={styles.right}>
        <form onSubmit={enviar} className={styles.form}>
          <h1>Criar conta</h1>
          {erro && <div className={styles.erro}>{erro}</div>}
          {sucesso && <div className={styles.sucesso}>{sucesso}</div>}
          <input name="nome" type="text" placeholder="Nome" value={form.nome} onChange={alterarCampo} required />
          <input name="email" type="email" placeholder="Email" value={form.email} onChange={alterarCampo} required />
          <input name="senha" type="password" placeholder="Senha" value={form.senha} onChange={alterarCampo} required minLength={6} />
          <button type="submit" disabled={carregando}>
            {carregando ? "Cadastrando..." : "Criar conta"}
          </button>
          <a className={styles.link} href="/login">Já tem uma conta ?</a>
        </form>
      </div>
    </div>
  );
}
