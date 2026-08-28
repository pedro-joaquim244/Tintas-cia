import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { api } from "../services/api.js";

import styles from "../styles/Listar.module.css";

import Cabecalho from "../components/Cabeçalho-ADM/Cabecalho.jsx";

import {
  FiTrash2,
  FiX,
  FiSearch,
  FiPlus,
} from "react-icons/fi";


export default function Listar() {

  // =====================================================
  // ESTADOS
  // =====================================================

  const [itens, setItens] = useState([]);

  const [erro, setErro] = useState("");

  const [busca, setBusca] = useState("");

  const [statusFiltro, setStatusFiltro] = useState("");

  const [categoriaFiltro, setCategoriaFiltro] = useState("");

  const [modalExcluir, setModalExcluir] = useState(false);

  const [produtoSelecionado, setProdutoSelecionado] = useState(null);


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
    "Outros",
  ];


  // =====================================================
  // CARREGAR PRODUTOS
  // =====================================================

  async function carregarItens() {

    try {

      setErro("");

      const resposta = await api.get("/itens");

      setItens(resposta.data);

    } catch (error) {

      console.error(error);

      setErro("Erro ao carregar produtos.");

    }

  }


  useEffect(() => {
    function atualizarAoEntrarNaTela() {
      carregarItens();
    }

    atualizarAoEntrarNaTela();
    window.addEventListener("focus", atualizarAoEntrarNaTela);

    const intervalo = window.setInterval(
      atualizarAoEntrarNaTela,
      10000
    );

    return () => {
      window.removeEventListener("focus", atualizarAoEntrarNaTela);
      window.clearInterval(intervalo);
    };
  }, []);


  // =====================================================
  // ABRIR MODAL DE EXCLUSÃO
  // =====================================================

  function abrirModalExcluir(item) {

    setProdutoSelecionado(item);

    setModalExcluir(true);

  }


  // =====================================================
  // FECHAR MODAL
  // =====================================================

  function fecharModalExcluir() {

    setModalExcluir(false);

    setProdutoSelecionado(null);

  }


  // =====================================================
  // EXCLUIR PRODUTO
  // =====================================================

  async function excluirProduto() {

    if (!produtoSelecionado) return;

    try {

      await api.delete(
        `/itens/${produtoSelecionado.id}`
      );


      setItens((lista) =>
        lista.filter(
          (item) =>
            item.id !== produtoSelecionado.id
        )
      );


      fecharModalExcluir();


    } catch (error) {

      console.error(error);

      alert("Erro ao excluir produto.");

    }

  }


  // =====================================================
  // FILTROS
  // =====================================================

  const itensFiltrados = useMemo(() => {

    return itens.filter((item) => {

      const nomeProduto =
        String(item.nome || "")
          .toLowerCase();


      const textoBusca =
        busca
          .toLowerCase()
          .trim();


      const nomeValido =
        nomeProduto.includes(textoBusca);


      const statusValido =
        statusFiltro === ""
          ? true
          : item.status === statusFiltro;


      const categoriaValida =
        categoriaFiltro === ""
          ? true
          : item.categoria === categoriaFiltro;


      return (
        nomeValido &&
        statusValido &&
        categoriaValida
      );

    });

  }, [
    itens,
    busca,
    statusFiltro,
    categoriaFiltro,
  ]);


  // =====================================================
  // CONTADORES
  // =====================================================

  const totalProdutos = itens.length;


  const produtosAtivos =
    itens.filter(
      (item) =>
        item.status === "Ativo"
    ).length;


  const baixoEstoque =
    itens.filter(
      (item) =>
        Number(item.quantidade) < 5 &&
        item.status === "Ativo"
    ).length;


  const esgotados =
    itens.filter(
      (item) =>
        item.status === "Esgotado"
    ).length;


  // =====================================================
  // FORMATAR PREÇO
  // =====================================================

  function formatarPreco(preco) {

    const valor = Number(preco);

    if (Number.isNaN(valor)) {
      return "0,00";
    }

    return valor.toLocaleString(
      "pt-BR",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    );

  }


  // =====================================================
  // RENDER
  // =====================================================

  return (

    <div className={styles.container}>

      <Cabecalho />


      <main className={styles.content}>


        {/* =================================================
            TOPO
        ================================================= */}

        <div className={styles.topbar}>

          <div>

            <span className={styles.badge}>
              Administração
            </span>

            <h1 className={styles.title}>
              Produtos
            </h1>

            <p>
              Gerencie todos os produtos da sua loja.
            </p>

          </div>

        </div>


        {/* =================================================
            CARDS
        ================================================= */}

        <div className={styles.cards}>


          <div className={styles.card}>

            <span>
              Total de Produtos
            </span>

            <h2>
              {totalProdutos}
            </h2>

          </div>


          <div className={styles.card}>

            <span>
              Produtos Ativos
            </span>

            <h2>
              {produtosAtivos}
            </h2>

          </div>


          <div className={styles.card}>

            <span>
              Baixo Estoque
            </span>

            <h2>
              {baixoEstoque}
            </h2>

          </div>


          <div className={styles.card}>

            <span>
              Esgotados
            </span>

            <h2>
              {esgotados}
            </h2>

          </div>


        </div>


        {/* =================================================
            BUSCA E FILTROS
        ================================================= */}

        <div className={styles.searchArea}>


          <div className={styles.searchTop}>


            <div className={styles.searchWrapper}>

              <FiSearch
                className={styles.searchIcon}
              />

              <input
                type="text"
                placeholder="Buscar produto..."
                className={styles.searchInput}
                value={busca}
                onChange={(e) =>
                  setBusca(e.target.value)
                }
              />

            </div>


            <Link
              to="/admin/produtos/novo"
              className={styles.btnNovo}
            >

              <FiPlus />

              Novo Produto

            </Link>


          </div>


          <div className={styles.filters}>


            {/* STATUS */}

            <select
              className={styles.select}
              value={statusFiltro}
              onChange={(e) =>
                setStatusFiltro(e.target.value)
              }
            >

              <option value="">
                Todos os status
              </option>

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


            {/* CATEGORIA */}

            <select
              className={styles.select}
              value={categoriaFiltro}
              onChange={(e) =>
                setCategoriaFiltro(e.target.value)
              }
            >

              <option value="">
                Todas as categorias
              </option>

              {categorias.map(
                (categoria) => (

                  <option
                    key={categoria}
                    value={categoria}
                  >
                    {categoria}
                  </option>

                )
              )}

            </select>


          </div>

        </div>


        {/* =================================================
            TABELA
        ================================================= */}

        <div className={styles.tableContainer}>


          <div className={styles.tableHeader}>

            <div>

              <strong>
                Produtos cadastrados
              </strong>

              <span>
                Total: {itensFiltrados.length} produtos
              </span>

            </div>

          </div>


          {/* ERRO */}

          {erro && (

            <div className={styles.empty}>

              <h3>
                Ocorreu um erro
              </h3>

              <p>
                {erro}
              </p>

            </div>

          )}


          {/* NENHUM PRODUTO */}

          {!erro &&
            itensFiltrados.length === 0 && (

              <div className={styles.empty}>

                <h3>
                  Nenhum produto encontrado
                </h3>

                <p>
                  Tente alterar os filtros ou
                  cadastrar um novo produto.
                </p>

              </div>

            )
          }


          {/* TABELA */}

          {!erro &&
            itensFiltrados.length > 0 && (

              <div className={styles.tableWrapper}>

                <table className={styles.table}>


                  <thead>

                    <tr>

                      <th>
                        Produto
                      </th>

                      <th>
                        Categoria
                      </th>

                      <th>
                        Preço
                      </th>

                      <th>
                        Estoque
                      </th>

                      <th>
                        Pedidos
                      </th>

                      <th>
                        Status
                      </th>

                      <th>
                        Ações
                      </th>

                    </tr>

                  </thead>


                  <tbody>

                    {itensFiltrados.map(
                      (item) => (

                        <tr key={item.id}>


                          {/* PRODUTO */}

                          <td>

                            <div
                              className={
                                styles.product
                              }
                            >


                              {item.foto ? (

                                <img
                                  src={
                                    item.foto.startsWith(
                                      "http"
                                    )
                                      ? item.foto
                                      : `http://localhost:3333/${item.foto}`
                                  }
                                  alt={item.nome}
                                  className={
                                    styles.productImage
                                  }
                                />

                              ) : (

                                <div
                                  className={
                                    styles.productImage
                                  }
                                >
                                  Sem foto
                                </div>

                              )}


                              <div
                                className={
                                  styles.productInfo
                                }
                              >

                                <strong>
                                  {item.nome}
                                </strong>

                                <span>
                                  SKU: #{item.id}
                                </span>

                              </div>

                            </div>

                          </td>


                          {/* CATEGORIA */}

                          <td>

                            {item.categoria ? (

                              <span
                                className={
                                  styles.categoria
                                }
                              >
                                {item.categoria}
                              </span>

                            ) : (

                              <span
                                className={
                                  styles.semCategoria
                                }
                              >
                                Sem categoria
                              </span>

                            )}

                          </td>


                          {/* PREÇO */}

                          <td>

                            <strong
                              className={
                                styles.preco
                              }
                            >
                              R$ {formatarPreco(item.preco)}
                            </strong>

                          </td>


                          {/* ESTOQUE */}

                          <td>

                            <span
                              className={
                                Number(item.quantidade) < 5
                                  ? styles.estoqueBaixo
                                  : styles.estoque
                              }
                            >

                              {item.quantidade || 0}

                              {" "}un.

                            </span>

                          </td>


                          {/* PEDIDOS */}

                          <td>

                            <span className={styles.quantidadePedidos}>
                              {item.quantidade_pedidos || 0}
                            </span>

                          </td>


                          {/* STATUS */}

                          <td>

                            <span
                              className={`
                                ${styles.status}

                                ${
                                  item.status === "Ativo"
                                    ? styles.ativo
                                    : item.status === "Inativo"
                                      ? styles.inativo
                                      : styles.esgotado
                                }
                              `}
                            >

                              {item.status}

                            </span>

                          </td>


                          {/* AÇÕES */}

                          <td>

                            <div
                              className={
                                styles.actions
                              }
                            >

                              <Link
                                to={`/admin/produtos/${item.id}/editar`}
                                className={
                                  styles.btnEditar
                                }
                              >
                                Editar
                              </Link>


                              <button
                                type="button"
                                className={
                                  styles.btnExcluir
                                }
                                onClick={() =>
                                  abrirModalExcluir(item)
                                }
                              >
                                Excluir
                              </button>

                            </div>

                          </td>


                        </tr>

                      )
                    )}

                  </tbody>


                </table>

              </div>

            )
          }


        </div>


      </main>


      {/* ===================================================
          MODAL EXCLUIR
      =================================================== */}

      {modalExcluir && (

        <div
          className={styles.modalOverlay}
          onClick={fecharModalExcluir}
        >

          <div
            className={styles.modal}
            onClick={(e) =>
              e.stopPropagation()
            }
          >


            <button
              type="button"
              className={styles.closeModal}
              onClick={fecharModalExcluir}
            >
              <FiX />
            </button>


            <div className={styles.modalDelete}>

              <FiTrash2 />

            </div>


            <h2>
              Excluir produto?
            </h2>


            <p>

              Tem certeza que deseja excluir{" "}

              <strong>
                {produtoSelecionado?.nome}
              </strong>

              ?

              <br />

              <br />

              Esta ação não poderá ser desfeita.

            </p>


            <div
              className={styles.modalButtons}
            >

              <button
                type="button"
                className={styles.btnModal}
                onClick={fecharModalExcluir}
              >
                Cancelar
              </button>


              <button
                type="button"
                className={styles.btnDanger}
                onClick={excluirProduto}
              >

                <FiTrash2 />

                Excluir

              </button>

            </div>


          </div>

        </div>

      )}

    </div>

  );

}