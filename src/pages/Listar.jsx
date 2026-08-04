import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { api } from "../services/api.js";

import styles from "../styles/Listar.module.css";

import Cabecalho from "../components/Cabeçalho-ADM/Cabecalho.jsx";

import { FiTrash2, FiX } from "react-icons/fi";


export default function Listar() {


  const [itens, setItens] = useState([]);

  const [erro, setErro] = useState("");

  const [busca, setBusca] = useState("");

  const [statusFiltro, setStatusFiltro] = useState("");

  const [modalExcluir, setModalExcluir] = useState(false);
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);





  useEffect(() => {

    carregarItens();

  }, []);


  function abrirModalExcluir(item) {
    setProdutoSelecionado(item);
    setModalExcluir(true);
  }

  async function excluirProduto() {
    if (!produtoSelecionado) return;

    try {
      await api.delete(`/itens/${produtoSelecionado.id}`);

      setItens((lista) =>
        lista.filter(
          (item) => item.id !== produtoSelecionado.id
        )
      );

      setModalExcluir(false);
      setProdutoSelecionado(null);

    } catch (error) {
      console.error(error);
      alert("Erro ao excluir produto.");
    }
  }





  async function carregarItens() {

    try {

      const resposta = await api.get("/itens");

      setItens(resposta.data);


    } catch (error) {

      console.error(error);

      setErro(
        "Erro ao carregar itens."
      );

    }

  }








  const itensFiltrados = useMemo(() => {


    return itens.filter((item) => {


      const nomeValido =
        item.nome
          .toLowerCase()
          .includes(
            busca.toLowerCase()
          );



      const statusValido =
        statusFiltro === ""
          ? true
          : item.status === statusFiltro;



      return nomeValido && statusValido;


    });



  }, [
    itens,
    busca,
    statusFiltro
  ]);








  return (

    <div className={styles.container}>


      <Cabecalho />



      <main className={styles.content}>




        {/* ================= TOPBAR ================= */}


        <div className={styles.topbar}>


          <div>


            <h1 id={styles.title}>

              Produtos

            </h1>



            <p>

              Gerencie todos os produtos da sua loja.

            </p>



          </div>



        </div>
        {/* ================= CARDS ================= */}


        <div className={styles.cards}>


          <div className={styles.card}>


            <span>
              Total de Produtos
            </span>


            <h2>
              {itens.length}
            </h2>


          </div>





          <div className={styles.card}>


            <span>
              Produtos Ativos
            </span>


            <h2>

              {
                itens.filter(
                  (item) =>
                    item.status === "Ativo"
                ).length
              }

            </h2>


          </div>





          <div className={styles.card}>


            <span>
              Baixo Estoque
            </span>


            <h2>

              {
                itens.filter(
                  (item) =>
                    item.quantidade < 5 &&
                    item.status === "Ativo"
                ).length
              }

            </h2>


          </div>





          <div className={styles.card}>


            <span>
              Esgotados
            </span>


            <h2>

              {
                itens.filter(
                  (item) =>
                    item.status === "Esgotado"
                ).length
              }

            </h2>


          </div>



        </div>









        {/* ================= BUSCA ================= */}


        <div className={styles.searchArea}>


          <div className={styles.searchTop}>


            <input

              type="text"

              placeholder="Buscar produto..."

              className={styles.searchInput}

              value={busca}

              onChange={(e) =>
                setBusca(e.target.value)
              }

            />





            <Link

              to="/admin/produtos/novo"

              className={styles.btnNovo}

            >

              + Novo Produto

            </Link>



          </div>









          <div className={styles.filters}>


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



          </div>



        </div>

        {/* ================= TABELA ================= */}


        <div className={styles.tableContainer}>


          <div className={styles.tableHeader}>


            <span>

              Total: {itensFiltrados.length} produtos

            </span>


          </div>





          {erro && (

            <div className={styles.empty}>

              {erro}

            </div>

          )}






          {!erro && itensFiltrados.length === 0 && (

            <div className={styles.empty}>

              Nenhum produto encontrado.

            </div>

          )}







          {itensFiltrados.length > 0 && (


            <table className={styles.table}>


              <thead>


                <tr>


                  <th>
                    Produto
                  </th>


                  <th>
                    Preço
                  </th>


                  <th>
                    Estoque
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

                  itensFiltrados.map((item) => (


                    <tr key={item.id}>



                      <td>


                        <div className={styles.product}>


                          {

                            item.foto ? (


                              <img

                                src={`http://localhost:3333/${item.foto}`}

                                alt={item.nome}

                                className={styles.productImage}

                              />


                            ) : (


                              <div className={styles.productImage}>

                                Sem foto

                              </div>


                            )

                          }





                          <div>


                            <strong>

                              {item.nome}

                            </strong>



                            <span>

                              SKU: #{item.id}

                            </span>



                          </div>



                        </div>


                      </td>






                      <td>

                        R$ {item.preco}

                      </td>






                      <td>

                        {item.quantidade} un.

                      </td>






                      <td>


                        <span

                          className={`
                          ${styles.status}

                          ${item.status === "Ativo"
                              ? styles.ativo
                              :
                              item.status === "Inativo"
                                ? styles.inativo
                                :
                                styles.esgotado
                            }

                        `}

                        >

                          {item.status}

                        </span>



                      </td>







                      <td>


                        <div className={styles.actions}>


                          <Link

                            to={`/admin/produtos/${item.id}/editar`}

                            className={styles.btnEditar}

                          >

                            Editar

                          </Link>




                          <button
                            className={styles.btnExcluir}
                            onClick={() => abrirModalExcluir(item)}
                          >
                            Excluir
                          </button>

                          {modalExcluir && (
                            <div className={styles.modalOverlay}>
                              <div className={styles.modal}>

                                <button
                                  className={styles.closeModal}
                                  onClick={() => {
                                    setModalExcluir(false);
                                    setProdutoSelecionado(null);
                                  }}
                                >
                                  <FiX />
                                </button>

                                <div className={styles.modalDelete}>
                                  <FiTrash2 className={styles.modalIcon}/>
                                </div>

                                <h2>Excluir produto?</h2>

                                <p>
                                  Tem certeza que deseja excluir{" "}
                                  <strong>{produtoSelecionado?.nome}</strong>?
                                  <br />
                                  <br />
                                  Esta ação não poderá ser desfeita.
                                </p>

                                <div className={styles.modalButtons}>

                                  <button
                                    type="button"
                                    className={styles.btnModal}
                                    onClick={() => {
                                      setModalExcluir(false);
                                      setProdutoSelecionado(null);
                                    }}
                                  >
                                    Cancelar
                                  </button>

                                  <button
                                    type="button"
                                    className={styles.btnDanger}
                                    onClick={excluirProduto}
                                  >
                                    Excluir
                                  </button>

                                </div>

                              </div>
                            </div>
                          )}


                        </div>



                      </td>




                    </tr>



                  ))

                }



              </tbody>





            </table>






          )}





        </div>




      </main>



    </div>


  );


}