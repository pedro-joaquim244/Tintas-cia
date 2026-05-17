import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { api } from "../services/api.js";

import {
  FiSave,
  FiArrowLeft,
  FiTrash2,
  FiUpload,
} from "react-icons/fi";

import styles from "../styles/Editar.module.css";

import Cabecalho from "../components/Cabecalho.jsx";

export default function Editar() {

  /* ===== STATES ===== */

  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [preco, setPreco] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [erro, setErro] = useState("");

  const navigate = useNavigate();

  const { id } = useParams();

  /* ===== CARREGAR ITEM ===== */

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

  /* ===== EDITAR ITEM ===== */

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

  /* ===== EXCLUIR ITEM ===== */

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

    <div className={styles.container}>

      {/* SIDEBAR */}

      <Cabecalho />

      {/* MAIN */}

      <main className={styles.main}>

        {/* HEADER */}

        <div className={styles.top}>

          <div className={styles.titleArea}>

            <span className={styles.badge}>
              Edição de Produto
            </span>

            <h1>
              Editar Produto
            </h1>

            <p>
              Atualize informações, estoque e imagem do produto.
            </p>

          </div>

          <div className={styles.actions}>

            <button
              type="button"
              className={`${styles.btn} ${styles.btnCancel}`}
              onClick={() => navigate("/")}
            >

              <FiArrowLeft />

              Voltar

            </button>

            <button
              type="submit"
              form="formEditar"
              className={`${styles.btn} ${styles.btnSave}`}
            >

              <FiSave />

              Salvar

            </button>

          </div>

        </div>

        {/* ERROR */}

        {erro && (
          <div className={styles.error}>
            {erro}
          </div>
        )}

        {/* CARD */}

        <div className={styles.card}>

          <form
            id="formEditar"
            onSubmit={editarItem}
          >

            <div className={styles.grid}>

              {/* IMAGE */}

              <div className={styles.imageArea}>

                <div className={styles.sectionHeader}>

                  <h2>
                    Imagem do Produto
                  </h2>

                  <span>
                    Atualize a foto principal
                  </span>

                </div>

                <div className={styles.preview}>

                  <img
                    src="https://images.tcdn.com.br/img/img_prod/1203392/tinta_coral_renova_fosco_18l_1109_1_0d85e4eb7c6fbb3d7e57f09f73887dfd.jpg"
                    alt="Produto"
                  />

                </div>

                <button
                  type="button"
                  className={styles.uploadBtn}
                >

                  <FiUpload />

                  Trocar imagem

                </button>

              </div>

              {/* FORM */}

              <div className={styles.formArea}>

                <div className={styles.sectionHeader}>

                  <h2>
                    Informações
                  </h2>

                  <span>
                    Dados principais do produto
                  </span>

                </div>

                <div className={styles.formGrid}>

                  <div className={styles.inputGroup}>

                    <label>
                      Nome do produto
                    </label>

                    <input
                      type="text"
                      value={nome}
                      onChange={(event) =>
                        setNome(event.target.value)
                      }
                      placeholder="Digite o nome do produto"
                    />

                  </div>

                  <div className={styles.inputGroup}>

                    <label>
                      Preço
                    </label>

                    <input
                      type="number"
                      value={preco}
                      onChange={(event) =>
                        setPreco(event.target.value)
                      }
                      placeholder="Digite o preço"
                    />

                  </div>

                  <div className={styles.inputGroup}>

                    <label>
                      Quantidade
                    </label>

                    <input
                      type="number"
                      value={quantidade}
                      onChange={(event) =>
                        setQuantidade(event.target.value)
                      }
                      placeholder="Digite a quantidade"
                    />

                  </div>

                  <div className={`${styles.inputGroup} ${styles.fullWidth}`}>

                    <label>
                      Descrição
                    </label>

                    <textarea
                      value={descricao}
                      onChange={(event) =>
                        setDescricao(event.target.value)
                      }
                      placeholder="Digite a descrição do produto"
                    />

                  </div>

                </div>

              </div>

            </div>

          </form>

          {/* DELETE */}

          <div className={styles.deleteArea}>

            <button
              type="button"
              className={styles.btnDanger}
              onClick={excluirItem}
            >

              <FiTrash2 />

              Excluir produto

            </button>

          </div>

        </div>

      </main>

    </div>
  );
}