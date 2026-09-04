import {
  useEffect,
  useMemo,
  useState
} from "react";

import {
  Link
} from "react-router-dom";

import {
  api,
  urlArquivo
} from "../services/api.js";

import styles from "../styles/Listar.module.css";

import Cabecalho from "../components/Cabeçalho-ADM/Cabecalho.jsx";

import {
  FiTrash2,
  FiX,
  FiSearch,
  FiPlus,
  FiAlertTriangle,
  FiGrid,
  FiTag,
  FiDroplet,
  FiCheckCircle,
  FiAlertCircle,
} from "react-icons/fi";


export default function Listar() {

  // =====================================================
  // PRODUTOS
  // =====================================================

  const [
    itens,
    setItens
  ] = useState([]);


  const [
    erro,
    setErro
  ] = useState("");


  const [
    busca,
    setBusca
  ] = useState("");


  const [
    statusFiltro,
    setStatusFiltro
  ] = useState("");


  const [
    categoriaFiltro,
    setCategoriaFiltro
  ] = useState("");


  // =====================================================
  // EXCLUSÃO DE PRODUTO
  // =====================================================

  const [
    modalExcluir,
    setModalExcluir
  ] = useState(false);


  const [
    produtoSelecionado,
    setProdutoSelecionado
  ] = useState(null);


  const [
    erroExclusao,
    setErroExclusao
  ] = useState("");


  // =====================================================
  // CATÁLOGO
  // =====================================================

  const [
    catalogo,
    setCatalogo
  ] = useState({

    categorias: [],
    marcas: [],
    cores: []

  });


  const [
    carregandoCatalogo,
    setCarregandoCatalogo
  ] = useState(true);


  // =====================================================
  // NOVA CATEGORIA
  // =====================================================

  const [
    novaCategoria,
    setNovaCategoria
  ] = useState("");


  // =====================================================
  // NOVA MARCA
  // =====================================================

  const [
    novaMarca,
    setNovaMarca
  ] = useState("");


  // =====================================================
  // NOVA COR
  // =====================================================

  const [
    novaCorNome,
    setNovaCorNome
  ] = useState("");


  const [
    novaCorHex,
    setNovaCorHex
  ] = useState("#3264C8");


  // =====================================================
  // ESTADOS DO CADASTRO DO CATÁLOGO
  // =====================================================

  const [
    salvandoCatalogo,
    setSalvandoCatalogo
  ] = useState("");


  const [
    feedbackCatalogo,
    setFeedbackCatalogo
  ] = useState(null);


  // =====================================================
  // CARREGAR PRODUTOS
  // =====================================================

  async function carregarItens() {

    try {

      setErro("");


      const resposta =
        await api.get(
          "/itens"
        );


      setItens(
        Array.isArray(
          resposta.data
        )
          ? resposta.data
          : []
      );


    } catch (error) {

      console.error(
        "Erro ao carregar produtos:",
        error
      );


      setErro(
        "Erro ao carregar produtos."
      );

    }

  }


  // =====================================================
  // CARREGAR CATÁLOGO
  // =====================================================

  async function carregarCatalogo() {

    try {

      setCarregandoCatalogo(
        true
      );


      const resposta =
        await api.get(
          "/catalogo-opcoes"
        );


      setCatalogo({

        categorias:
          Array.isArray(
            resposta.data?.categorias
          )
            ? resposta.data.categorias
            : [],

        marcas:
          Array.isArray(
            resposta.data?.marcas
          )
            ? resposta.data.marcas
            : [],

        cores:
          Array.isArray(
            resposta.data?.cores
          )
            ? resposta.data.cores
            : []

      });


    } catch (error) {

      console.error(
        "Erro ao carregar catálogo:",
        error
      );


      setFeedbackCatalogo({

        tipo:
          "erro",

        mensagem:
          error.response?.data?.erro ||
          "Não foi possível carregar categorias, marcas e cores."

      });


    } finally {

      setCarregandoCatalogo(
        false
      );

    }

  }


  // =====================================================
  // CARREGAR TELA
  // =====================================================

  useEffect(() => {

    function atualizarAoEntrarNaTela() {

      carregarItens();

      carregarCatalogo();

    }


    atualizarAoEntrarNaTela();


    window.addEventListener(
      "focus",
      atualizarAoEntrarNaTela
    );


    const intervalo =
      window.setInterval(

        atualizarAoEntrarNaTela,

        10000

      );


    return () => {

      window.removeEventListener(
        "focus",
        atualizarAoEntrarNaTela
      );


      window.clearInterval(
        intervalo
      );

    };

  }, []);


  // =====================================================
  // FEEDBACK CATÁLOGO
  // =====================================================

  function mostrarFeedbackCatalogo(
    tipo,
    mensagem
  ) {

    setFeedbackCatalogo({

      tipo,
      mensagem

    });


    window.setTimeout(
      () => {

        setFeedbackCatalogo(
          null
        );

      },
      4000
    );

  }


  // =====================================================
  // CADASTRAR CATEGORIA
  // =====================================================

  async function cadastrarCategoria(
    event
  ) {

    event.preventDefault();


    const nome =
      novaCategoria.trim();


    if (!nome) {

      mostrarFeedbackCatalogo(
        "erro",
        "Informe o nome da categoria."
      );

      return;

    }


    try {

      setSalvandoCatalogo(
        "categoria"
      );


      const resposta =
        await api.post(

          "/catalogo-opcoes/categorias",

          {
            nome
          }

        );


      setNovaCategoria(
        ""
      );


      mostrarFeedbackCatalogo(

        "sucesso",

        resposta.data?.mensagem ||
        "Categoria cadastrada com sucesso."

      );


      await carregarCatalogo();


    } catch (error) {

      console.error(
        "Erro ao cadastrar categoria:",
        error
      );


      mostrarFeedbackCatalogo(

        "erro",

        error.response?.data?.erro ||
        "Não foi possível cadastrar a categoria."

      );


    } finally {

      setSalvandoCatalogo(
        ""
      );

    }

  }


  // =====================================================
  // CADASTRAR MARCA
  // =====================================================

  async function cadastrarMarca(
    event
  ) {

    event.preventDefault();


    const nome =
      novaMarca
        .trim()
        .toUpperCase();


    if (!nome) {

      mostrarFeedbackCatalogo(
        "erro",
        "Informe o nome da marca."
      );

      return;

    }


    try {

      setSalvandoCatalogo(
        "marca"
      );


      const resposta =
        await api.post(

          "/catalogo-opcoes/marcas",

          {
            nome
          }

        );


      setNovaMarca(
        ""
      );


      mostrarFeedbackCatalogo(

        "sucesso",

        resposta.data?.mensagem ||
        "Marca cadastrada com sucesso."

      );


      await carregarCatalogo();


    } catch (error) {

      console.error(
        "Erro ao cadastrar marca:",
        error
      );


      mostrarFeedbackCatalogo(

        "erro",

        error.response?.data?.erro ||
        "Não foi possível cadastrar a marca."

      );


    } finally {

      setSalvandoCatalogo(
        ""
      );

    }

  }


  // =====================================================
  // NORMALIZAR HEXADECIMAL
  // =====================================================

  function normalizarHex(
    valor
  ) {

    let hexadecimal =
      String(
        valor || ""
      )
        .trim()
        .toUpperCase();


    if (
      hexadecimal &&
      !hexadecimal.startsWith("#")
    ) {

      hexadecimal =
        `#${hexadecimal}`;

    }


    return hexadecimal;

  }


  // =====================================================
  // CADASTRAR COR
  // =====================================================

  async function cadastrarCor(
    event
  ) {

    event.preventDefault();


    const nome =
      novaCorNome.trim();


    const hexadecimal =
      normalizarHex(
        novaCorHex
      );


    if (!nome) {

      mostrarFeedbackCatalogo(
        "erro",
        "Informe o nome da cor."
      );

      return;

    }


    const regexHex =
      /^#[0-9A-F]{6}$/i;


    if (
      !regexHex.test(
        hexadecimal
      )
    ) {

      mostrarFeedbackCatalogo(

        "erro",

        "Informe um hexadecimal válido. Ex.: #FFFFFF"

      );

      return;

    }


    try {

      setSalvandoCatalogo(
        "cor"
      );


      const resposta =
        await api.post(

          "/catalogo-opcoes/cores",

          {
            nome,
            hexadecimal
          }

        );


      setNovaCorNome(
        ""
      );


      setNovaCorHex(
        "#3264C8"
      );


      mostrarFeedbackCatalogo(

        "sucesso",

        resposta.data?.mensagem ||
        "Cor cadastrada com sucesso."

      );


      await carregarCatalogo();


    } catch (error) {

      console.error(
        "Erro ao cadastrar cor:",
        error
      );


      mostrarFeedbackCatalogo(

        "erro",

        error.response?.data?.erro ||
        "Não foi possível cadastrar a cor."

      );


    } finally {

      setSalvandoCatalogo(
        ""
      );

    }

  }


  // =====================================================
  // ABRIR MODAL DE EXCLUSÃO DO PRODUTO
  // =====================================================

  function abrirModalExcluir(
    item
  ) {

    setProdutoSelecionado(
      item
    );


    setErroExclusao(
      ""
    );


    setModalExcluir(
      true
    );

  }


  // =====================================================
  // FECHAR MODAL
  // =====================================================

  function fecharModalExcluir() {

    setModalExcluir(
      false
    );


    setProdutoSelecionado(
      null
    );


    setErroExclusao(
      ""
    );

  }


  // =====================================================
  // EXCLUIR PRODUTO
  // =====================================================

  async function excluirProduto() {

    if (
      !produtoSelecionado
    ) {

      return;

    }


    try {

      await api.delete(
        `/itens/${produtoSelecionado.id}`
      );


      setItens(
        (lista) =>

          lista.filter(
            (item) =>
              item.id !==
              produtoSelecionado.id
          )

      );


      fecharModalExcluir();


    } catch (error) {

      console.error(
        "Erro ao excluir produto:",
        error
      );


      setErroExclusao(

        error.response?.data?.erro ||

        "Não foi possível excluir o produto. Tente novamente."

      );

    }

  }


  // =====================================================
  // FILTROS
  // =====================================================

  const itensFiltrados =
    useMemo(
      () => {

        return itens.filter(
          (item) => {

            const nomeProduto =
              String(
                item.nome ||
                ""
              )
                .toLowerCase();


            const marcaProduto =
              String(
                item.marca ||
                ""
              )
                .toLowerCase();


            const corProduto =
              String(
                item.cor ||
                ""
              )
                .toLowerCase();


            const textoBusca =
              busca
                .toLowerCase()
                .trim();


            const buscaValida =
              nomeProduto.includes(
                textoBusca
              ) ||

              marcaProduto.includes(
                textoBusca
              ) ||

              corProduto.includes(
                textoBusca
              );


            const statusValido =
              statusFiltro === ""

                ? true

                : item.status ===
                  statusFiltro;


            const categoriaValida =
              categoriaFiltro === ""

                ? true

                : item.categoria ===
                  categoriaFiltro;


            return (

              buscaValida &&

              statusValido &&

              categoriaValida

            );

          }
        );

      },
      [
        itens,
        busca,
        statusFiltro,
        categoriaFiltro
      ]
    );


  // =====================================================
  // CONTADORES
  // =====================================================

  const totalProdutos =
    itens.length;


  const produtosAtivos =
    itens.filter(
      (item) =>
        item.status ===
        "Ativo"
    ).length;


  const baixoEstoque =
    itens.filter(
      (item) =>

        Number(
          item.quantidade
        ) < 5 &&

        item.status ===
        "Ativo"

    ).length;


  const esgotados =
    itens.filter(
      (item) =>
        item.status ===
        "Esgotado"
    ).length;


  // =====================================================
  // TOTAL OPÇÕES CATÁLOGO
  // =====================================================

  const totalOpcoesCatalogo =
    catalogo.categorias.length +
    catalogo.marcas.length +
    catalogo.cores.length;


  // =====================================================
  // FORMATAR PREÇO
  // =====================================================

  function formatarPreco(
    preco
  ) {

    const valor =
      Number(
        preco
      );


    if (
      Number.isNaN(
        valor
      )
    ) {

      return "0,00";

    }


    return valor.toLocaleString(

      "pt-BR",

      {

        minimumFractionDigits:
          2,

        maximumFractionDigits:
          2

      }

    );

  }


  // =====================================================
  // RENDER
  // =====================================================

  return (

    <div
      className={
        styles.container
      }
    >

      <Cabecalho />


      <main
        className={
          styles.content
        }
      >

        {/* =================================================
            TOPO
        ================================================= */}

        <div
          className={
            styles.topbar
          }
        >

          <div>

            <span
              className={
                styles.badge
              }
            >
              Administração
            </span>


            <h1
              className={
                styles.title
              }
            >
              Produtos
            </h1>


            <p>
              Gerencie produtos, categorias,
              marcas e cores da sua loja.
            </p>

          </div>

        </div>


        {/* =================================================
            CARDS
        ================================================= */}

        <div
          className={
            styles.cards
          }
        >

          <div
            className={
              styles.card
            }
          >

            <span>
              Total de Produtos
            </span>

            <h2>
              {totalProdutos}
            </h2>

          </div>


          <div
            className={
              styles.card
            }
          >

            <span>
              Produtos Ativos
            </span>

            <h2>
              {produtosAtivos}
            </h2>

          </div>


          <div
            className={
              styles.card
            }
          >

            <span>
              Baixo Estoque
            </span>

            <h2>
              {baixoEstoque}
            </h2>

          </div>


          <div
            className={
              styles.card
            }
          >

            <span>
              Esgotados
            </span>

            <h2>
              {esgotados}
            </h2>

          </div>

        </div>


        {/* =================================================
            GERENCIAR CATÁLOGO
        ================================================= */}

        <section
          className={
            styles.catalogoSection
          }
        >

          {/* ===============================================
              CABEÇALHO CATÁLOGO
          =============================================== */}

          <div
            className={
              styles.catalogoSectionHeader
            }
          >

            <div>

              <span>
                CONFIGURAÇÕES DO CATÁLOGO
              </span>


              <h2>
                Categorias, marcas e cores
              </h2>


              <p>
                Adicione novas opções que poderão
                ser utilizadas no cadastro dos produtos.
              </p>

            </div>


            <div
              className={
                styles.catalogoTotal
              }
            >

              <strong>

                {
                  carregandoCatalogo
                    ? "..."
                    : totalOpcoesCatalogo
                }

              </strong>

              <span>
                opções cadastradas
              </span>

            </div>

          </div>


          {/* ===============================================
              FEEDBACK
          =============================================== */}

          {
            feedbackCatalogo && (

              <div
                className={`
                  ${styles.catalogoFeedback}

                  ${
                    feedbackCatalogo.tipo ===
                    "sucesso"

                      ? styles.catalogoFeedbackSucesso

                      : styles.catalogoFeedbackErro
                  }
                `}
              >

                {
                  feedbackCatalogo.tipo ===
                  "sucesso"

                    ? (
                      <FiCheckCircle />
                    )

                    : (
                      <FiAlertCircle />
                    )
                }


                <span>
                  {
                    feedbackCatalogo.mensagem
                  }
                </span>

              </div>

            )
          }


          {/* ===============================================
              CARDS CATÁLOGO
          =============================================== */}

          <div
            className={
              styles.catalogoGrid
            }
          >

            {/* =============================================
                CATEGORIAS
            ============================================= */}

            <article
              className={
                styles.catalogoCard
              }
            >

              <header
                className={
                  styles.catalogoCardHeader
                }
              >

                <div
                  className={
                    styles.catalogoCardIcon
                  }
                >
                  <FiGrid />
                </div>


                <div>

                  <span>
                    ORGANIZAÇÃO
                  </span>

                  <h3>
                    Categorias
                  </h3>

                </div>


                <strong
                  className={
                    styles.catalogoQuantidade
                  }
                >

                  {
                    catalogo
                      .categorias
                      .length
                  }

                </strong>

              </header>


              <p
                className={
                  styles.catalogoDescricao
                }
              >
                Crie novas categorias para
                organizar os produtos.
              </p>


              <form
                className={
                  styles.catalogoForm
                }
                onSubmit={
                  cadastrarCategoria
                }
              >

                <input
                  type="text"
                  maxLength={120}
                  placeholder="Ex.: Tintas automotivas"
                  value={
                    novaCategoria
                  }
                  onChange={
                    (event) =>
                      setNovaCategoria(
                        event.target.value
                      )
                  }
                />


                <button
                  type="submit"
                  title="Cadastrar categoria"
                  disabled={
                    salvandoCatalogo ===
                    "categoria"
                  }
                >

                  <FiPlus />

                </button>

              </form>


              <div
                className={
                  styles.catalogoLista
                }
              >

                {
                  carregandoCatalogo ? (

                    <p
                      className={
                        styles.catalogoVazio
                      }
                    >
                      Carregando...
                    </p>

                  ) : catalogo
                      .categorias
                      .length === 0 ? (

                    <p
                      className={
                        styles.catalogoVazio
                      }
                    >
                      Nenhuma categoria cadastrada.
                    </p>

                  ) : (

                    catalogo
                      .categorias
                      .map(
                        (categoria) => (

                          <div
                            key={
                              categoria.id
                            }
                            className={
                              styles.catalogoItem
                            }
                          >

                            <FiGrid />


                            <span>
                              {categoria.nome}
                            </span>

                          </div>

                        )
                      )

                  )
                }

              </div>

            </article>


            {/* =============================================
                MARCAS
            ============================================= */}

            <article
              className={
                styles.catalogoCard
              }
            >

              <header
                className={
                  styles.catalogoCardHeader
                }
              >

                <div
                  className={
                    styles.catalogoCardIcon
                  }
                >

                  <FiTag />

                </div>


                <div>

                  <span>
                    FABRICANTES
                  </span>

                  <h3>
                    Marcas
                  </h3>

                </div>


                <strong
                  className={
                    styles.catalogoQuantidade
                  }
                >

                  {
                    catalogo
                      .marcas
                      .length
                  }

                </strong>

              </header>


              <p
                className={
                  styles.catalogoDescricao
                }
              >
                Cadastre novas marcas disponíveis
                para venda na loja.
              </p>


              <form
                className={
                  styles.catalogoForm
                }
                onSubmit={
                  cadastrarMarca
                }
              >

                <input
                  type="text"
                  maxLength={120}
                  placeholder="Ex.: SUVINIL"
                  value={
                    novaMarca
                  }
                  onChange={
                    (event) =>
                      setNovaMarca(
                        event.target.value
                      )
                  }
                />


                <button
                  type="submit"
                  title="Cadastrar marca"
                  disabled={
                    salvandoCatalogo ===
                    "marca"
                  }
                >

                  <FiPlus />

                </button>

              </form>


              <div
                className={
                  styles.catalogoLista
                }
              >

                {
                  carregandoCatalogo ? (

                    <p
                      className={
                        styles.catalogoVazio
                      }
                    >
                      Carregando...
                    </p>

                  ) : catalogo
                      .marcas
                      .length === 0 ? (

                    <p
                      className={
                        styles.catalogoVazio
                      }
                    >
                      Nenhuma marca cadastrada.
                    </p>

                  ) : (

                    catalogo
                      .marcas
                      .map(
                        (marca) => (

                          <div
                            key={
                              marca.id
                            }
                            className={
                              styles.catalogoItem
                            }
                          >

                            <FiTag />


                            <span>
                              {marca.nome}
                            </span>

                          </div>

                        )
                      )

                  )
                }

              </div>

            </article>


            {/* =============================================
                CORES
            ============================================= */}

            <article
              className={
                styles.catalogoCard
              }
            >

              <header
                className={
                  styles.catalogoCardHeader
                }
              >

                <div
                  className={
                    styles.catalogoCardIcon
                  }
                >

                  <FiDroplet />

                </div>


                <div>

                  <span>
                    PALETA
                  </span>

                  <h3>
                    Cores
                  </h3>

                </div>


                <strong
                  className={
                    styles.catalogoQuantidade
                  }
                >

                  {
                    catalogo
                      .cores
                      .length
                  }

                </strong>

              </header>


              <p
                className={
                  styles.catalogoDescricao
                }
              >
                Cadastre o nome e o hexadecimal
                de uma nova cor.
              </p>


              <form
                className={
                  styles.catalogoFormCor
                }
                onSubmit={
                  cadastrarCor
                }
              >

                <input
                  type="text"
                  maxLength={120}
                  className={
                    styles.catalogoCorNome
                  }
                  placeholder="Nome da cor"
                  value={
                    novaCorNome
                  }
                  onChange={
                    (event) =>
                      setNovaCorNome(
                        event.target.value
                      )
                  }
                />


                <div
                  className={
                    styles.catalogoColorPicker
                  }
                >

                  <input
                    type="color"
                    value={
                      /^#[0-9A-F]{6}$/i.test(
                        novaCorHex
                      )
                        ? novaCorHex
                        : "#3264C8"
                    }
                    onChange={
                      (event) =>
                        setNovaCorHex(
                          event.target.value
                            .toUpperCase()
                        )
                    }
                  />

                </div>


                <input
                  type="text"
                  maxLength={7}
                  className={
                    styles.catalogoHex
                  }
                  placeholder="#FFFFFF"
                  value={
                    novaCorHex
                  }
                  onChange={
                    (event) =>
                      setNovaCorHex(
                        event.target.value
                          .toUpperCase()
                      )
                  }
                />


                <button
                  type="submit"
                  className={
                    styles.catalogoAddCor
                  }
                  disabled={
                    salvandoCatalogo ===
                    "cor"
                  }
                  title="Cadastrar cor"
                >

                  <FiPlus />

                </button>

              </form>


              <div
                className={`
                  ${styles.catalogoLista}
                  ${styles.catalogoListaCores}
                `}
              >

                {
                  carregandoCatalogo ? (

                    <p
                      className={
                        styles.catalogoVazio
                      }
                    >
                      Carregando...
                    </p>

                  ) : catalogo
                      .cores
                      .length === 0 ? (

                    <p
                      className={
                        styles.catalogoVazio
                      }
                    >
                      Nenhuma cor cadastrada.
                    </p>

                  ) : (

                    catalogo
                      .cores
                      .map(
                        (cor) => (

                          <div
                            key={
                              cor.id
                            }
                            className={
                              styles.catalogoCorItem
                            }
                          >

                            <span
                              className={
                                styles.catalogoAmostra
                              }
                              style={{
                                backgroundColor:
                                  cor.hexadecimal
                              }}
                            />


                            <div>

                              <strong>
                                {cor.nome}
                              </strong>

                              <small>
                                {cor.hexadecimal}
                              </small>

                            </div>

                          </div>

                        )
                      )

                  )
                }

              </div>

            </article>

          </div>

        </section>


        {/* =================================================
            BUSCA E FILTROS
        ================================================= */}

        <div
          className={
            styles.searchArea
          }
        >

          <div
            className={
              styles.searchTop
            }
          >

            <div
              className={
                styles.searchWrapper
              }
            >

              <FiSearch
                className={
                  styles.searchIcon
                }
              />


              <input
                type="text"
                placeholder="Buscar por produto, marca ou cor..."
                className={
                  styles.searchInput
                }
                value={
                  busca
                }
                onChange={
                  (event) =>
                    setBusca(
                      event.target.value
                    )
                }
              />

            </div>


            <Link
              to="/admin/produtos/novo"
              className={
                styles.btnNovo
              }
            >

              <FiPlus />

              Novo Produto

            </Link>

          </div>


          <div
            className={
              styles.filters
            }
          >

            {/* STATUS */}

            <select
              className={
                styles.select
              }
              value={
                statusFiltro
              }
              onChange={
                (event) =>
                  setStatusFiltro(
                    event.target.value
                  )
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
              className={
                styles.select
              }
              value={
                categoriaFiltro
              }
              onChange={
                (event) =>
                  setCategoriaFiltro(
                    event.target.value
                  )
              }
            >

              <option value="">
                Todas as categorias
              </option>


              {
                catalogo
                  .categorias
                  .map(
                    (categoria) => (

                      <option
                        key={
                          categoria.id
                        }
                        value={
                          categoria.nome
                        }
                      >

                        {categoria.nome}

                      </option>

                    )
                  )
              }

            </select>

          </div>

        </div>


        {/* =================================================
            TABELA
        ================================================= */}

        <div
          className={
            styles.tableContainer
          }
        >

          <div
            className={
              styles.tableHeader
            }
          >

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

          {
            erro && (

              <div
                className={
                  styles.empty
                }
              >

                <h3>
                  Ocorreu um erro
                </h3>

                <p>
                  {erro}
                </p>

              </div>

            )
          }


          {/* NENHUM PRODUTO */}

          {
            !erro &&
            itensFiltrados.length === 0 && (

              <div
                className={
                  styles.empty
                }
              >

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

          {
            !erro &&
            itensFiltrados.length > 0 && (

              <div
                className={
                  styles.tableWrapper
                }
              >

                <table
                  className={
                    styles.table
                  }
                >

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

                    {
                      itensFiltrados.map(
                        (item) => (

                          <tr
                            key={
                              item.id
                            }
                          >

                            {/* PRODUTO */}

                            <td>

                              <div
                                className={
                                  styles.product
                                }
                              >

                                {
                                  item.foto ? (

                                    <img
                                      src={
                                        urlArquivo(
                                          item.foto
                                        )
                                      }
                                      alt={
                                        item.nome
                                      }
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

                                  )
                                }


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

                              {
                                item.categoria ? (

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

                                )
                              }

                            </td>


                            {/* PREÇO */}

                            <td>

                              <strong
                                className={
                                  styles.preco
                                }
                              >

                                R${" "}

                                {
                                  formatarPreco(
                                    item.preco
                                  )
                                }

                              </strong>

                            </td>


                            {/* ESTOQUE */}

                            <td>

                              <span
                                className={
                                  Number(
                                    item.quantidade
                                  ) < 5

                                    ? styles.estoqueBaixo

                                    : styles.estoque
                                }
                              >

                                {
                                  item.quantidade ||
                                  0
                                }

                                {" "}un.

                              </span>

                            </td>


                            {/* PEDIDOS */}

                            <td>

                              <span
                                className={
                                  styles.quantidadePedidos
                                }
                              >

                                {
                                  item.quantidade_pedidos ||
                                  0
                                }

                              </span>

                            </td>


                            {/* STATUS */}

                            <td>

                              <span
                                className={`
                                  ${styles.status}

                                  ${
                                    item.status ===
                                    "Ativo"

                                      ? styles.ativo

                                      : item.status ===
                                        "Inativo"

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
                                  onClick={
                                    () =>
                                      abrirModalExcluir(
                                        item
                                      )
                                  }
                                >
                                  Excluir
                                </button>

                              </div>

                            </td>

                          </tr>

                        )
                      )
                    }

                  </tbody>

                </table>

              </div>

            )
          }

        </div>

      </main>


      {/* ===================================================
          MODAL EXCLUIR PRODUTO
      =================================================== */}

      {
        modalExcluir && (

          <div
            className={
              styles.modalOverlay
            }
            onClick={
              fecharModalExcluir
            }
          >

            <div
              className={
                styles.modal
              }
              onClick={
                (event) =>
                  event.stopPropagation()
              }
            >

              <button
                type="button"
                className={
                  styles.closeModal
                }
                onClick={
                  fecharModalExcluir
                }
              >

                <FiX />

              </button>


              {
                erroExclusao ? (

                  <>

                    <div
                      className={
                        styles.modalError
                      }
                    >

                      <FiAlertTriangle />

                    </div>


                    <h2>
                      Não foi possível excluir
                    </h2>


                    <p
                      className={
                        styles.modalErrorText
                      }
                    >

                      {erroExclusao}

                    </p>


                    <div
                      className={
                        styles.modalButtons
                      }
                    >

                      <button
                        type="button"
                        className={
                          styles.btnError
                        }
                        onClick={
                          fecharModalExcluir
                        }
                      >
                        Entendi
                      </button>

                    </div>

                  </>

                ) : (

                  <>

                    <div
                      className={
                        styles.modalDelete
                      }
                    >

                      <FiTrash2 />

                    </div>


                    <h2>
                      Excluir produto?
                    </h2>


                    <p>

                      Tem certeza que deseja excluir{" "}

                      <strong>
                        {
                          produtoSelecionado
                            ?.nome
                        }
                      </strong>

                      ?

                      <br />
                      <br />

                      Esta ação não poderá ser desfeita.

                    </p>


                    <div
                      className={
                        styles.modalButtons
                      }
                    >

                      <button
                        type="button"
                        className={
                          styles.btnModal
                        }
                        onClick={
                          fecharModalExcluir
                        }
                      >
                        Cancelar
                      </button>


                      <button
                        type="button"
                        className={
                          styles.btnDanger
                        }
                        onClick={
                          excluirProduto
                        }
                      >

                        <FiTrash2 />

                        Excluir

                      </button>

                    </div>

                  </>

                )
              }

            </div>

          </div>

        )
      }

    </div>

  );

}