import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../services/api.js";
import styles from "../styles/Editar.module.css";

export default function Editar() {
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [preco, setPreco] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [erro, setErro] = useState("");

  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    async function carregarItem() {
      try {
        setErro("");

        const resposta = await api.get(`/itens/${id}`);
        const item = resposta.data;

        setNome(item.nome || "");
        setDescricao(item.descricao || "");
        setPreco(item.preco || "");
        setQuantidade(item.quantidade || "");
      } catch (erro) {
        setErro("Erro ao carregar item");
        console.error(erro);
      }
    }

    carregarItem();
  }, [id]);

  async function editarItem(event) {
    event.preventDefault();

    try {
      setErro("");

      const dados = {
        nome,
        descricao,
        preco: Number(preco),
        quantidade: Number(quantidade),
      };

      await api.put(`/itens/${id}`, dados);

      navigate("/");
    } catch (erro) {
      setErro("Erro ao editar o item");
      console.error(erro);
    }
  }

  async function excluirItem() {
    const confirmar = window.confirm(
      "Tem certeza que deseja excluir este item?"
    );

    if (!confirmar) return;

    try {
      await api.delete(`/itens/${id}`);
      navigate("/");
    } catch (erro) {
      setErro("Erro ao excluir item");
      console.error(erro);
    }
  }

  return (
    <div className={styles.content}>
      <div className={styles.card}>
        <h1 className={styles.sectionTitle}>
          Editar Produto
        </h1>

        {erro && (
          <p className={styles.error}>
            {erro}
          </p>
        )}

        <form
          className={styles.form}
          onSubmit={editarItem}
        >
          <div className={styles.grid2}>

            <div className={styles.inputGroup}>
              <label>Nome</label>

              <input
                value={nome}
                onChange={(event) =>
                  setNome(event.target.value)
                }
                type="text"
                placeholder="Digite o nome do item"
              />
            </div>

            <div className={styles.inputGroup}>
              <label>Preço</label>

              <input
                value={preco}
                onChange={(event) =>
                  setPreco(event.target.value)
                }
                type="number"
                placeholder="Digite o preço"
              />
            </div>

          </div>

          <div className={styles.grid2}>

            <div className={styles.inputGroup}>
              <label>Descrição</label>

              <textarea
                value={descricao}
                onChange={(event) =>
                  setDescricao(event.target.value)
                }
                placeholder="Digite a descrição"
              />
            </div>

            <div className={styles.inputGroup}>
              <label>Quantidade</label>

              <input
                value={quantidade}
                onChange={(event) =>
                  setQuantidade(event.target.value)
                }
                type="number"
                placeholder="Digite a quantidade"
              />
            </div>

          </div>

          <div className={styles.buttons}>

            <button
              className={`${styles.btn} ${styles.btnPrimary}`}
              type="submit"
            >
              Salvar
            </button>

            <button
              type="button"
              className={`${styles.btn} ${styles.btnSecondary}`}
              onClick={() => navigate("/")}
            >
              Voltar
            </button>

          </div>
        </form>

        <button
          type="button"
          className={`${styles.btn} ${styles.btnDanger}`}
          onClick={excluirItem}
        >
          Excluir item
        </button>
      </div>
    </div>
  );
}