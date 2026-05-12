import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api.js";
import styles from "../styles/Cadrastar.module.css";
import {
  FiSave,
  FiArrowLeft,
  FiTrash2,
  FiBox,
  FiGrid,
  FiUsers,
  FiSettings,
  FiLogOut,
  FiUpload
} from "react-icons/fi";

export default function Cadastrar() {
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [preco, setPreco] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [erro, setErro] = useState("");

  const navigate = useNavigate();

  async function cadastrarItens(event) {
    event.preventDefault();

    try {
      setErro("");

      const dados = {
        nome,
        descricao,
        preco: Number(preco),
        quantidade: Number(quantidade),
      };

      await api.post("/itens", dados);

      navigate("/");
    } catch (erro) {
      setErro("Erro ao cadastrar o item");
      console.error(erro);
    }
  }

  return (
  <div className={styles.content}>

    {/* ===== SIDEBAR ===== */}
    <aside className={styles.sidebar}>

      <div>

        <h1 className={styles.logo}>
          Tintas<span>Fácil</span>
        </h1>

        <div className={styles.menu}>

          <div className={styles.menuItem}>
            <FiGrid />
            Painel
          </div>

          <div className={`${styles.menuItem} ${styles.active}`}>
            <FiBox />
            Produtos
          </div>

          <div className={styles.menuItem}>
            <FiUsers />
            Clientes
          </div>

          <div className={styles.menuItem}>
            <FiSettings />
            Configurações
          </div>

        </div>

      </div>

      <div className={`${styles.menuItem} ${styles.logout}`}>
        <FiLogOut />
        Sair
      </div>

    </aside>

    {/* ===== MAIN ===== */}
    <main className={styles.main}>

      <div className={styles.top}>
        <h1 className={styles.sectionTitle}>
          Cadastrar Produto
        </h1>

        <p className={styles.subtitle}>
          Preencha as informações abaixo para cadastrar um novo produto.
        </p>
      </div>

      {erro && (
        <p className={styles.error}>
          {erro}
        </p>
      )}

      <form
        className={styles.form}
        onSubmit={cadastrarItens}
      >

        {/* ===== LEFT ===== */}
        <div className={styles.leftSide}>

          <div className={styles.box}>

            <div className={styles.boxHeader}>
              Informações básicas
            </div>

            <div className={styles.boxContent}>

              <div className={styles.inputGroup}>
                <label>Nome do produto *</label>

                <input
                  value={nome}
                  onChange={(event) =>
                    setNome(event.target.value)
                  }
                  type="text"
                  placeholder="Ex.: Tinta Acrílica Premium Fosca Branca 18L"
                />
              </div>

              <div className={styles.grid2}>

                <div className={styles.inputGroup}>
                  <label>Preço *</label>

                  <input
                    value={preco}
                    onChange={(event) =>
                      setPreco(event.target.value)
                    }
                    type="number"
                    placeholder="Ex.: 259,90"
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label>Quantidade *</label>

                  <input
                    value={quantidade}
                    onChange={(event) =>
                      setQuantidade(event.target.value)
                    }
                    type="number"
                    placeholder="Ex.: 25"
                  />
                </div>

              </div>

            </div>

          </div>

          <div className={styles.box}>

            <div className={styles.boxHeader}>
              Descrição
            </div>

            <div className={styles.boxContent}>

              <div className={styles.inputGroup}>
                <label>Descrição completa</label>

                <textarea
                  value={descricao}
                  onChange={(event) =>
                    setDescricao(event.target.value)
                  }
                  placeholder="Detalhes do produto, características, indicações de uso..."
                />
              </div>

            </div>

          </div>

        </div>

        {/* ===== RIGHT ===== */}
        <div className={styles.rightSide}>

          <div className={styles.box}>

            <div className={styles.boxHeader}>
              Imagem do produto
            </div>

            <div className={styles.boxContent}>

              <div className={styles.uploadBox}>

                <FiUpload className={styles.uploadIcon} />

                <p>
                  Clique para enviar ou arraste a imagem até aqui
                </p>

                <small>
                  PNG, JPG ou WEBP até 5MB
                </small>

              </div>

            </div>

          </div>

          <div className={styles.box}>

            <div className={styles.boxHeader}>
              Ações
            </div>

            <div className={styles.boxContent}>

              <div className={styles.buttons}>

                <button
                  type="button"
                  className={`${styles.btn} ${styles.btnSecondary}`}
                  onClick={() => navigate("/")}
                >
                  <FiArrowLeft />
                  Cancelar
                </button>

                <button
                  className={`${styles.btn} ${styles.btnPrimary}`}
                  type="submit"
                >
                  <FiSave />
                  Salvar produto
                </button>

              </div>

            </div>

          </div>

        </div>

      </form>

    </main>

  </div>
);}