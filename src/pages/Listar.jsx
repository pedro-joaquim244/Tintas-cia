import { useEffect, useState } from "react";
import { api } from "../services/api.js";
import styles from "../styles/Listar.module.css";
import Cabeçalho from "../components/Cabeçalho-ADM/Cabecalho.jsx";

export default function Listar() {

  const [itens, setItens] = useState([]);
  const [erro, setErro] = useState("");



  useEffect(() => {

    api.get("/itens")
      .then((resposta) => {

        setItens(resposta.data);

      })
      .catch(() => {

        setErro("Erro ao carregar itens.");

      });

  }, []);



  return (

    <div className={styles.container}>


      {/* SIDEBAR */}

      <Cabeçalho />



      {/* CONTENT */}

      <main className={styles.content}>


        {/* TOPBAR */}

        <div className={styles.topbar}>


          <div>

            <h1 id={styles.title}>
              Produtos
            </h1>


            <p>
              Gerencie todos os produtos da sua loja
            </p>


          </div>


        </div>





        {/* CARDS */}

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
              Baixo Estoque
            </span>

            <h2>
              {
                itens.filter(
                  item => item.quantidade < 5
                ).length
              }
            </h2>

          </div>




          <div className={styles.card}>

            <span>
              Produtos Ativos
            </span>

            <h2>
              {itens.length}
            </h2>

          </div>




          <div className={styles.card}>

            <span>
              Categorias
            </span>

            <h2>
              12
            </h2>

          </div>


        </div>






        {/* SEARCH */}

        <div className={styles.searchArea}>


          <div className={styles.searchTop}>


            <input

              type="text"

              placeholder="Buscar por nome, marca, SKU ou código..."

              className={styles.searchInput}

            />



            <a

              href="/admin/produtos/novo"

              className={styles.btnNovo}

            >

              + Novo Produto

            </a>


          </div>





          <div className={styles.filters}>


            <select className={styles.select}>

              <option>
                Todas as categorias
              </option>

            </select>



            <select className={styles.select}>

              <option>
                Todas as marcas
              </option>

            </select>



            <select className={styles.select}>

              <option>
                Todos os tipos
              </option>

            </select>



            <select className={styles.select}>

              <option>
                Todos os status
              </option>

            </select>



          </div>


        </div>






        {/* TABLE */}


        <div className={styles.tableContainer}>


          <div className={styles.tableHeader}>


            <span>

              Total: {itens.length} produtos

            </span>


          </div>





          {erro && (

            <div className={styles.empty}>

              {erro}

            </div>

          )}







          {itens.length === 0 && !erro && (

            <div className={styles.empty}>

              Nenhum item cadastrado.

            </div>

          )}







          {itens.length > 0 && (


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
                    Marca
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
                  itens.map((item)=>(



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

                        Tintas Internas

                      </td>





                      <td>

                        Coral

                      </td>





                      <td>

                        R$ {item.preco}

                      </td>





                      <td>

                        {item.quantidade} un.

                      </td>







                      <td>


                        <span

                          className={

                            `${styles.status} ${
                              item.quantidade < 5
                              ? styles.low
                              : ""
                            }`

                          }

                        >


                          {

                            item.quantidade < 5

                            ? "Baixo estoque"

                            : "Ativo"

                          }


                        </span>



                      </td>








                      <td>



                        <div className={styles.actions}>


                          <a

                            href={`/admin/produtos/${item.id}/editar`}

                            className={styles.btnEditar}

                          >

                            Editar

                          </a>





                          <button

                            className={styles.btnExcluir}

                          >

                            Excluir

                          </button>



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