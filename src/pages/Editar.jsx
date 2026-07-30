import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { api } from "../services/api.js";

import {
  FiSave,
  FiArrowLeft,
  FiTrash2,
  FiUpload,
  FiCheckCircle,
  FiX,
} from "react-icons/fi";

import styles from "../styles/Editar.module.css";

import Cabecalho from "../components/Cabeçalho-ADM/Cabecalho.jsx";

export default function Editar() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [preco, setPreco] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [status, setStatus] = useState("Ativo");

  const [novaFoto, setNovaFoto] = useState(null);
  const [preview, setPreview] = useState("");

  const [erro, setErro] = useState("");

  const [modalSucesso, setModalSucesso] = useState(false);
  const [modalExcluir, setModalExcluir] = useState(false);

  useEffect(() => {
    carregarItem();
  }, [id]);

  async function carregarItem() {
    try {
      const resposta = await api.get(`/itens/${id}`);

      const item = resposta.data;

      setNome(item.nome || "");
      setDescricao(item.descricao || "");
      setPreco(item.preco || "");
      setQuantidade(item.quantidade || "");
      setStatus(item.status || "Ativo");

      if (item.foto) {
        setPreview(`http://localhost:3333/${item.foto}`);
      }
    } catch (error) {
      console.error(error);
      setErro("Erro ao carregar produto.");
    }
  }

  function selecionarImagem(e) {
    const arquivo = e.target.files[0];

    if (!arquivo) return;

    const tiposPermitidos = [
      "image/png",
      "image/jpeg",
      "image/webp",
    ];

    if (!tiposPermitidos.includes(arquivo.type)) {
      setErro("Formato inválido. Use PNG, JPG ou WEBP.");
      return;
    }

    if (arquivo.size > 5 * 1024 * 1024) {
      setErro("A imagem deve ter no máximo 5MB.");
      return;
    }

    setErro("");
    setNovaFoto(arquivo);
    setPreview(URL.createObjectURL(arquivo));
  }

  async function editarItem(e) {
    e.preventDefault();

    try {
      setErro("");

      const dados = new FormData();

      dados.append("nome", nome);
      dados.append("descricao", descricao);
      dados.append("preco", Number(preco));
      dados.append("quantidade", Number(quantidade));
      dados.append("status", status);

      if (novaFoto) {
        dados.append("foto", novaFoto);
      }

      await api.put(`/itens/${id}`, dados, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setModalSucesso(true);
    } catch (error) {
      console.error(error);
      setErro("Erro ao atualizar produto.");
    }
  }

  async function excluirProduto() {
    try {
      await api.delete(`/itens/${id}`);

      navigate("/admin/produtos");
    } catch (error) {
      console.error(error);
      setErro("Erro ao excluir produto.");
    }
  }

  return (
    <div className={styles.container}>
      <Cabecalho />

      <main className={styles.main}>
        <div className={styles.top}>
          <div className={styles.titleArea}>
            <span className={styles.badge}>
              Editar Produto
            </span>

            <h1>Editar Produto</h1>

            <p>
              Atualize as informações e a imagem do produto.
            </p>
          </div>

          <div className={styles.actions}>
            <button
              className={`${styles.btn} ${styles.btnCancel}`}
              onClick={() => navigate("/admin/produtos")}
            >
              <FiArrowLeft />
              Voltar
            </button>

            <button
              form="formEditar"
              type="submit"
              className={`${styles.btn} ${styles.btnSave}`}
            >
              <FiSave />
              Salvar
            </button>
          </div>
        </div>

        {erro && (
          <div className={styles.error}>
            {erro}
          </div>
        )}

        <div className={styles.card}>
          <form
            id="formEditar"
            onSubmit={editarItem}
          >
            <div className={styles.grid}>
                            {/* ================= IMAGEM ================= */}

              <div className={styles.imageArea}>

                <div className={styles.sectionHeader}>
                  <h2>Imagem</h2>
                  <span>Clique para trocar.</span>
                </div>

                <label className={styles.preview}>

                  <input
                    type="file"
                    hidden
                    accept="image/png,image/jpeg,image/webp"
                    onChange={selecionarImagem}
                  />

                  {preview ? (

                    <img
                      src={preview}
                      alt={nome}
                    />

                  ) : (

                    <div className={styles.semImagem}>
                      <FiUpload size={60} />
                      <p>Clique para escolher uma imagem</p>
                    </div>

                  )}

                </label>

                {novaFoto && (

                  <div className={styles.fileInfo}>
                    {novaFoto.name}
                  </div>

                )}

                <label className={styles.uploadBtn}>

                  <FiUpload />

                  Escolher outra imagem

                  <input
                    hidden
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={selecionarImagem}
                  />

                </label>

              </div>

              {/* ================= FORM ================= */}

              <div className={styles.formArea}>

                <div className={styles.sectionHeader}>
                  <h2>Informações</h2>
                  <span>Atualize os dados do produto.</span>
                </div>

                <div className={styles.formGrid}>

                  <div className={styles.inputGroup}>

                    <label>Nome</label>

                    <input
                      type="text"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                    />

                  </div>

                  <div className={styles.inputGroup}>

                    <label>Preço</label>

                    <input
                      type="number"
                      step="0.01"
                      value={preco}
                      onChange={(e) => setPreco(e.target.value)}
                    />

                  </div>

                  <div className={styles.inputGroup}>

                    <label>Quantidade</label>

                    <input
                      type="number"
                      value={quantidade}
                      onChange={(e) => setQuantidade(e.target.value)}
                    />

                  </div>

                  <div className={styles.inputGroup}>

                    <label>Status</label>

                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className={styles.selectStatus}
                    >

                      <option value="Ativo">
                        Ativo
                      </option>

                      <option value="Esgotado">
                        Esgotado
                      </option>

                      <option value="Inativo">
                        Inativo
                      </option>

                    </select>

                  </div>

                  <div
                    className={`${styles.inputGroup} ${styles.fullWidth}`}
                  >

                    <label>Descrição</label>

                    <textarea
                      value={descricao}
                      onChange={(e) => setDescricao(e.target.value)}
                    />

                  </div>

                </div>

              </div>

            </div>

          </form>

          <div className={styles.deleteArea}>

            <button
              className={styles.btnDanger}
              onClick={() => setModalExcluir(true)}
            >

              <FiTrash2 />

              Excluir Produto

            </button>

          </div>

        </div>
                {/* ================= MODAL SUCESSO ================= */}

        {modalSucesso && (

          <div className={styles.modalOverlay}>

            <div className={styles.modal}>

              <button
                className={styles.closeModal}
                onClick={() => setModalSucesso(false)}
              >
                <FiX />
              </button>

              <FiCheckCircle
                className={styles.modalIcon}
              />

              <h2>Produto atualizado!</h2>

              <p>
                As alterações foram salvas com sucesso.
              </p>

              <div className={styles.modalButtons}>

                <button
                  className={styles.btnModal}
                  onClick={() => setModalSucesso(false)}
                >
                  Continuar editando
                </button>

                <button
                  className={styles.btnModalPrimary}
                  onClick={() => navigate("/admin/produtos")}
                >
                  Ir para Produtos
                </button>

              </div>

            </div>

          </div>

        )}

        {/* ================= MODAL EXCLUIR ================= */}

        {modalExcluir && (

          <div className={styles.modalOverlay}>

            <div className={styles.modal}>

              <button
                className={styles.closeModal}
                onClick={() => setModalExcluir(false)}
              >
                <FiX />
              </button>

              <FiTrash2
                className={styles.modalDelete}
              />

              <h2>Excluir produto?</h2>

              <p>
                Esta ação não poderá ser desfeita.
              </p>

              <div className={styles.modalButtons}>

                <button
                  className={styles.btnModal}
                  onClick={() => setModalExcluir(false)}
                >
                  Cancelar
                </button>

                <button
                  className={styles.btnDanger}
                  onClick={excluirProduto}
                >
                  Excluir
                </button>

              </div>

            </div>

          </div>

        )}

      </main>

    </div>

  );

}