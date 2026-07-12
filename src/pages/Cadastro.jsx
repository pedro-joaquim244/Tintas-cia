import { useState } from "react";
import axios from "axios";
import styles from "../styles/Cadastro.module.css";

export default function Cadastro() {

    const [nome, setNome] = useState("");
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");

    const [erro, setErro] = useState("");
    const [sucesso, setSucesso] = useState("");
    const [carregando, setCarregando] = useState(false);

    async function cadastrar(e) {

        e.preventDefault();

        setErro("");
        setSucesso("");
        setCarregando(true);

        try {

            const resposta = await axios.post(
                "http://localhost:3333/usuarios",
                {
                    nome,
                    email,
                    senha
                }
            );

            console.log("Resposta da API:", resposta.data);

            setSucesso(
                `Usuário ${resposta.data.nome} cadastrado com sucesso!`
            );

            setNome("");
            setEmail("");
            setSenha("");

        } catch (err) {

            console.error(err);

            if (err.response) {

                setErro(
                    err.response.data.erro ||
                    "Erro ao cadastrar usuário."
                );

            } else {

                setErro(
                    "Não foi possível conectar ao servidor."
                );

            }

        } finally {

            setCarregando(false);

        }

    }

    return (

        <div className={styles.container}>

            <div className={styles.left}>

                <img
                    src="/logo.png"
                    alt="Logo"
                    className={styles.logo}
                />

                <h1>TRANSFORME SEU LAR</h1>

                <p>
                    Gerencie produtos, estoque e vendas da sua loja.
                </p>

            </div>

            <div className={styles.right}>

                <form
                    onSubmit={cadastrar}
                    className={styles.form}
                >

                    <h1>Cadastrar</h1>

                    {erro && (
                        <div className={styles.erro}>
                            {erro}
                        </div>
                    )}

                    {sucesso && (
                        <div className={styles.sucesso}>
                            {sucesso}
                        </div>
                    )}

                    <input
                        type="text"
                        placeholder="Nome"
                        value={nome}
                        onChange={(e) =>
                            setNome(e.target.value)
                        }
                        required
                    />

                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) =>
                            setEmail(e.target.value)
                        }
                        required
                    />

                    <input
                        type="password"
                        placeholder="Senha"
                        value={senha}
                        onChange={(e) =>
                            setSenha(e.target.value)
                        }
                        required
                    />

                    <button
                        type="submit"
                        disabled={carregando}
                    >
                        {carregando
                            ? "Cadastrando..."
                            : "Criar Conta"}
                    </button>

                </form>

            </div>

        </div>

    );

}