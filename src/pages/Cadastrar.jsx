import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { api } from "../services/api.js";

import styles from "../styles/Cadastrar.module.css";

import {
  FiSave,
  FiArrowLeft,
  FiUpload,
  FiCheckCircle,
  FiX
} from "react-icons/fi";

import Cabecalho from "../components/Cabeçalho-ADM/Cabecalho.jsx";

export default function Cadastrar() {

  const navigate = useNavigate();

  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [preco, setPreco] = useState("");
  const [quantidade, setQuantidade] = useState("");

  // NOVO
  const [categoria, setCategoria] = useState("");

  const [foto, setFoto] = useState(null);
  const [preview, setPreview] = useState(null);

  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState(false);

  // =====================================================
  // CATEGORIAS
  // =====================================================

  const categorias = [
    "Tintas para Parede",
    "Tintas para Área Externa",
    "Tintas para Madeira",
    "Tintas para Metal",
    "Efeitos e Acabamentos",
    "Proteção e Segurança",
    "Pincéis e Acessórios",
    "Ferramentas",
    "Preparação de Superfície",
    "Complementos",
    "Outros"
  ];

  // =====================================================
  // SELECIONAR IMAGEM
  // =====================================================

  function selecionarImagem(event) {

    const arquivo = event.target.files[0];

    if (!arquivo) return;

    const tiposPermitidos = [
      "image/png",
      "image/jpeg",
      "image/webp"
    ];

    if (!tiposPermitidos.includes(arquivo.type)) {

      setErro(
        "Formato inválido. Use PNG, JPG ou WEBP."
      );

      return;
    }

    if (arquivo.size > 5 * 1024 * 1024) {

      setErro(
        "A imagem deve ter no máximo 5MB."
      );

      return;
    }

    setErro("");

    setFoto(arquivo);

    const imagemUrl = URL.createObjectURL(arquivo);

    setPreview(imagemUrl);
  }

  // =====================================================
  // CADASTRAR
  // =====================================================

  async function cadastrarItens(event) {

    event.preventDefault();

    try {

      setErro("");

      // Validações
      if (!nome.trim()) {
        setErro("Digite o nome do produto.");
        return;
      }

      if (!categoria) {
        setErro("Selecione uma categoria para o produto.");
        return;
      }

      if (preco === "" || Number(preco) < 0) {
        setErro("Informe um preço válido.");
        return;
      }

      if (quantidade === "" || Number(quantidade) < 0) {
        setErro("Informe uma quantidade válida.");
        return;
      }

      setLoading(true);

      const dados = new FormData();

      dados.append(
        "nome",
        nome.trim()
      );

      dados.append(
        "descricao",
        descricao.trim()
      );

      dados.append(
        "preco",
        Number(preco)
      );

      dados.append(
        "quantidade",
        Number(quantidade)
      );

      // NOVO
      dados.append(
        "categoria",
        categoria
      );

      dados.append(
        "status",
        "Ativo"
      );

      if (foto) {

        dados.append(
          "foto",
          foto
        );

      }

      await api.post(
        "/itens",
        dados,
        {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        }
      );

      setModal(true);

    } catch (error) {

      console.error(
        "ERRO AO CADASTRAR:",
        error.response?.data || error
      );

      setErro(
        error.response?.data?.erro ||
        "Erro ao cadastrar o item."
      );

    } finally {

      setLoading(false);

    }
  }

  // =====================================================
  // LIMPAR FORMULÁRIO
  // =====================================================

  function limparFormulario() {

    setNome("");
    setDescricao("");
    setPreco("");
    setQuantidade("");
    setCategoria("");

    setFoto(null);
    setPreview(null);

    setErro("");
    setModal(false);
  }

  // =====================================================
  // RENDER
  // =====================================================

  return (

    <div className={styles.content}>

      <Cabecalho />

      <main className={styles.main}>

        {/* =================================================
            TOPO
        ================================================= */}

        <div className={styles.top}>

          <h1 className={styles.sectionTitle}>
            Cadastrar Produto
          </h1>

          <p className={styles.subtitle}>
            Preencha as informações abaixo para cadastrar um novo produto.
          </p>

        </div>

        {/* =================================================
            ERRO
        ================================================= */}

        {erro && (

          <p className={styles.error}>
            {erro}
          </p>

        )}

        {/* =================================================
            FORMULÁRIO
        ================================================= */}

        <form
          className={styles.form}
          onSubmit={cadastrarItens}
        >

          {/* =================================================
              LADO ESQUERDO
          ================================================= */}

          <div className={styles.leftSide}>

            {/* INFORMAÇÕES BÁSICAS */}

            <div className={styles.box}>

              <div className={styles.boxHeader}>
                Informações básicas
              </div>

              <div className={styles.boxContent}>

                {/* NOME */}

                <div className={styles.inputGroup}>

                  <label>
                    Nome do produto *
                  </label>

                  <input
                    value={nome}
                    onChange={(e) =>
                      setNome(e.target.value)
                    }
                    type="text"
                    placeholder="Ex.: Tinta Acrílica Premium Fosca Branca 18L"
                  />

                </div>

                {/* CATEGORIA */}

                <div className={styles.inputGroup}>

                  <label>
                    Categoria *
                  </label>

                  <select
                    value={categoria}
                    onChange={(e) =>
                      setCategoria(e.target.value)
                    }
                  >

                    <option value="">
                      Selecione uma categoria
                    </option>

                    {categorias.map((item) => (

                      <option
                        key={item}
                        value={item}
                      >
                        {item}
                      </option>

                    ))}

                  </select>

                </div>

                {/* PREÇO E QUANTIDADE */}

                <div className={styles.grid2}>

                  <div className={styles.inputGroup}>

                    <label>
                      Preço *
                    </label>

                    <input
                      value={preco}
                      onChange={(e) =>
                        setPreco(e.target.value)
                      }
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="Ex.: 259.90"
                    />

                  </div>

                  <div className={styles.inputGroup}>

                    <label>
                      Quantidade *
                    </label>

                    <input
                      value={quantidade}
                      onChange={(e) =>
                        setQuantidade(e.target.value)
                      }
                      type="number"
                      min="0"
                      placeholder="Ex.: 25"
                    />

                  </div>

                </div>

              </div>

            </div>

            {/* DESCRIÇÃO */}

            <div className={styles.box}>

              <div className={styles.boxHeader}>
                Descrição
              </div>

              <div className={styles.boxContent}>

                <div className={styles.inputGroup}>

                  <label>
                    Descrição completa
                  </label>

                  <textarea
                    value={descricao}
                    onChange={(e) =>
                      setDescricao(e.target.value)
                    }
                    placeholder="Detalhes do produto, características, indicações de uso..."
                  />

                </div>

              </div>

            </div>

          </div>

          {/* =================================================
              LADO DIREITO
          ================================================= */}

          <div className={styles.rightSide}>

            {/* IMAGEM */}

            <div className={styles.box}>

              <div className={styles.boxHeader}>
                Imagem do produto
              </div>

              <div className={styles.boxContent}>

                <label className={styles.uploadBox}>

                  <input
                    type="file"
                    hidden
                    accept="image/png,image/jpeg,image/webp"
                    onChange={selecionarImagem}
                  />

                  {preview ? (

                    <img
                      src={preview}
                      className={styles.previewImage}
                      alt="Preview"
                    />

                  ) : (

                    <>

                      <FiUpload
                        className={styles.uploadIcon}
                      />

                      <p>
                        Clique para enviar uma imagem
                      </p>

                      <small>
                        PNG, JPG ou WEBP até 5MB
                      </small>

                    </>

                  )}

                </label>

              </div>

            </div>

            {/* AÇÕES */}

            <div className={styles.box}>

              <div className={styles.boxHeader}>
                Ações
              </div>

              <div className={styles.boxContent}>

                <div className={styles.buttons}>

                  <button
                    type="button"
                    className={`${styles.btn} ${styles.btnSecondary}`}
                    onClick={() =>
                      navigate("/admin/produtos")
                    }
                  >

                    <FiArrowLeft
                      className={styles.svg1}
                    />

                    Cancelar

                  </button>

                  <button
                    type="submit"
                    disabled={loading}
                    className={`${styles.btn} ${styles.btnPrimary}`}
                  >

                    <FiSave
                      className={styles.svg2}
                    />

                    {loading
                      ? "Salvando..."
                      : "Salvar"
                    }

                  </button>

                </div>

              </div>

            </div>

          </div>

        </form>

        {/* =================================================
            MODAL
        ================================================= */}

        {modal && (

          <div className={styles.modalOverlay}>

            <div className={styles.modal}>

              <button
                className={styles.closeModal}
                onClick={() =>
                  setModal(false)
                }
              >

                <FiX />

              </button>

              <FiCheckCircle
                className={styles.successIcon}
              />

              <h2>
                Produto cadastrado!
              </h2>

              <p>
                O produto foi salvo com sucesso
                no sistema.
              </p>

              <div className={styles.modalButtons}>

                <button
                  className={`${styles.btn} ${styles.btnSecondary}`}
                  onClick={limparFormulario}
                >
                  Continuar cadastrando
                </button>

                <button
                  className={`${styles.btn} ${styles.btnPrimary}`}
                  onClick={() =>
                    navigate("/admin/produtos")
                  }
                >
                  Ir para Produtos
                </button>

              </div>

            </div>

          </div>

        )}

      </main>

    </div>

  );
}