import { useEffect, useState } from "react";

import styles from "../styles/Dashboard.module.css";

import {
  FiTrendingUp,
  FiBox,
  FiUsers,
  FiShoppingCart,
  FiAlertCircle,
  FiDollarSign,
  FiLogOut,
  FiPlus,
  FiArrowUpRight,
  FiClock,
  FiTag,
  FiX,
} from "react-icons/fi";

import { api } from "../services/api.js";

import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/authContext.jsx";

import Cabecalho from "../components/Cabeçalho-ADM/Cabecalho.jsx";


export default function Dashboard() {

  const navigate = useNavigate();

  const { usuario, logout } = useAuth();

  // =====================================================
  // ESTADOS
  // =====================================================

  const [dashboard, setDashboard] = useState(null);

  const [carregando, setCarregando] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);


  // =====================================================
  // SAIR
  // =====================================================

  function sair() {

    logout();

    navigate("/login");

  }


  // =====================================================
  // CARREGAR DASHBOARD
  // =====================================================

  useEffect(() => {

    carregarDashboard();

  }, []);


  async function carregarDashboard() {

    try {

      setCarregando(true);

      const resposta =
        await api.get("/dashboard");

      setDashboard(resposta.data);

    } catch (error) {

      console.error(
        "Erro ao carregar dashboard:",
        error
      );

    } finally {

      setCarregando(false);

    }

  }


  // =====================================================
  // LOADING
  // =====================================================

  if (carregando || !dashboard) {

    return (

      <div className={styles.container}>

        <Cabecalho />

        <div className={styles.rightArea}>

          <main className={styles.content}>

            <div className={styles.loading}>

              Carregando dashboard...

            </div>

          </main>

        </div>

      </div>

    );

  }


  // =====================================================
  // DADOS
  // =====================================================

  const resumo =
    dashboard.resumo || {};

  const vendasRecentes =
    dashboard.vendasRecentes || [];

  const vendasSemana =
    dashboard.vendasSemana || [];

  const estoqueBaixo =
    dashboard.estoqueBaixo || [];


  // =====================================================
  // ÚLTIMOS 7 DIAS
  // =====================================================

  const hoje = new Date();

  const ultimos7Dias = Array.from(
    { length: 7 },
    (_, index) => {

      const data = new Date();

      data.setHours(12, 0, 0, 0);

      data.setDate(
        hoje.getDate() - (6 - index)
      );

      const ano =
        data.getFullYear();

      const mes =
        String(
          data.getMonth() + 1
        ).padStart(2, "0");

      const dia =
        String(
          data.getDate()
        ).padStart(2, "0");

      const dataISO =
        `${ano}-${mes}-${dia}`;


      const venda =
        vendasSemana.find(
          item => {

            const dataVenda =
              String(item.data)
                .substring(0, 10);

            return (
              dataVenda ===
              dataISO
            );

          }
        );


      return {

        data: dataISO,

        dia:
          data
            .toLocaleDateString(
              "pt-BR",
              {
                weekday: "short"
              }
            )
            .replace(".", "")
            .replace(
              /^./,
              letra =>
                letra.toUpperCase()
            ),

        faturamento:
          venda
            ? Number(
                venda.faturamento
              )
            : 0,

        pedidos:
          venda
            ? Number(
                venda.pedidos
              )
            : 0

      };

    }
  );


  // =====================================================
  // MAIOR VENDA DO GRÁFICO
  // =====================================================

  const maiorVenda =
    Math.max(
      ...ultimos7Dias.map(
        item =>
          item.faturamento
      ),
      1
    );


  // =====================================================
  // FORMATAÇÃO DE MOEDA
  // =====================================================

  function formatarMoeda(valor) {

    return Number(valor || 0)
      .toLocaleString(
        "pt-BR",
        {
          style: "currency",
          currency: "BRL"
        }
      );

  }


  // =====================================================
  // FORMATAÇÃO DE DATA
  // =====================================================

  function formatarData(data) {

    if (!data) {
      return "";
    }

    return new Date(data)
      .toLocaleString(
        "pt-BR",
        {
          day: "2-digit",
          month: "2-digit",
          hour: "2-digit",
          minute: "2-digit"
        }
      );

  }


  // =====================================================
  // RENDER
  // =====================================================

  return (

    <div className={styles.container}>

      {/* =================================================
          CABEÇALHO / SIDEBAR
      ================================================= */}

      <Cabecalho />


      {/* =================================================
          ÁREA DIREITA
      ================================================= */}

      <div className={styles.rightArea}>

        <main className={styles.content}>


          {/* =================================================
              HERO
          ================================================= */}

          <section className={styles.hero}>

            <div>

              <span className={styles.badge}>

                Painel Administrativo

              </span>


              <h1>

                Bem-vindo,{" "}

                {usuario?.nome || "Administrador"}

              </h1>


              <p>

                Gerencie produtos, pedidos, estoque e
                clientes da sua loja de tintas em um
                único painel.

              </p>

            </div>


            <button
              className={styles.logoutBtn}
              onClick={sair}
            >

              <FiLogOut />

              Sair

            </button>

          </section>



          {/* =================================================
              CARDS
          ================================================= */}

          <section className={styles.cards}>


            {/* PRODUTOS */}

            <div className={styles.card}>

              <div className={styles.cardTop}>

                <span>
                  Total de Produtos
                </span>

                <FiBox />

              </div>


              <h2>

                {resumo.produtos || 0}

              </h2>


              <p>

                Produtos cadastrados

              </p>

            </div>



            {/* PEDIDOS */}

            <div className={styles.card}>

              <div className={styles.cardTop}>

                <span>
                  Pedidos
                </span>

                <FiShoppingCart />

              </div>


              <h2>

                {resumo.pedidos || 0}

              </h2>


              <p>

                {resumo.pedidos_pendentes || 0}
                {" "}
                pendentes

              </p>

            </div>



            {/* CLIENTES */}

            <div className={styles.card}>

              <div className={styles.cardTop}>

                <span>
                  Clientes
                </span>

                <FiUsers />

              </div>


              <h2>

                {resumo.clientes || 0}

              </h2>


              <p>

                Clientes cadastrados

              </p>

            </div>



            {/* FATURAMENTO */}

            <div className={styles.card}>

              <div className={styles.cardTop}>

                <span>
                  Faturamento
                </span>

                <FiDollarSign />

              </div>


              <h2>

                {formatarMoeda(
                  resumo.faturamento
                )}

              </h2>


              <p>

                Faturamento total

              </p>

            </div>

          </section>



          {/* =================================================
              GRÁFICO
          ================================================= */}

          <section className={styles.chartSection}>


            <div className={styles.chartHeader}>

              <div>

                <h3>
                  Vendas da Semana
                </h3>


                <p>
                  Faturamento dos últimos 7 dias
                </p>

              </div>


              <span
                className={styles.chartBadge}
              >

                {resumo.pedidos_semana || 0}
                {" "}
                pedidos

              </span>

            </div>



            <div className={styles.chart}>

              {ultimos7Dias.map(
                (item) => {

                  const altura =
                    item.faturamento === 0

                      ? 5

                      : Math.max(
                          20,
                          (
                            item.faturamento /
                            maiorVenda
                          ) * 200
                        );


                  return (

                    <div
                      className={
                        styles.barGroup
                      }
                      key={item.data}
                    >

                      <span
                        className={
                          styles.day
                        }
                      >

                        {item.dia}

                      </span>


                      <div
                        className={
                          styles.bar
                        }
                        style={{
                          height:
                            `${altura}px`
                        }}
                        title={
                          `${formatarMoeda(
                            item.faturamento
                          )} — ${
                            item.pedidos
                          } pedido(s)`
                        }
                      />


                      <strong>

                        {item.faturamento > 0

                          ? item.faturamento
                              .toLocaleString(
                                "pt-BR",
                                {
                                  style:
                                    "currency",
                                  currency:
                                    "BRL",
                                  maximumFractionDigits:
                                    0
                                }
                              )

                          : "R$ 0"

                        }

                      </strong>

                    </div>

                  );

                }
              )}

            </div>

          </section>



          {/* =================================================
              GRID
          ================================================= */}

          <section className={styles.grid}>


            {/* =================================================
                VENDAS RECENTES
            ================================================= */}

            <div className={styles.panel}>


              <div
                className={
                  styles.panelHeader
                }
              >

                <h3>
                  Vendas Recentes
                </h3>


                <button
                  onClick={() =>
                    setModalOpen(true)
                  }
                >

                  Ver tudo

                </button>

              </div>



              <div className={styles.sales}>


                {vendasRecentes.length === 0 ? (

                  <div
                    className={
                      styles.empty
                    }
                  >

                    Nenhuma venda encontrada.

                  </div>

                ) : (

                  vendasRecentes
                    .slice(0, 5)
                    .map(
                      (venda) => (

                        <div
                          className={
                            styles.saleItem
                          }
                          key={venda.id}
                        >

                          <div>

                            <strong>

                              {venda.produto}

                            </strong>


                            <span>

                              Pedido #{venda.id}

                              {" • "}

                              {venda.cliente}

                            </span>

                          </div>


                          <b>

                            {formatarMoeda(
                              venda.total
                            )}

                          </b>

                        </div>

                      )
                    )

                )}

              </div>

            </div>



            {/* =================================================
                ATIVIDADE / ESTOQUE
            ================================================= */}

            <div className={styles.panel}>


              <div
                className={
                  styles.panelHeader
                }
              >

                <h3>
                  Estoque
                </h3>

              </div>



              <div
                className={
                  styles.activity
                }
              >


                {estoqueBaixo.length === 0 ? (

                  <div
                    className={
                      styles.activityItem
                    }
                  >

                    <FiBox />

                    <div>

                      <strong>
                        Estoque normal
                      </strong>

                      <span>
                        Nenhum produto com estoque baixo
                      </span>

                    </div>

                  </div>

                ) : (

                  estoqueBaixo
                    .slice(0, 4)
                    .map(
                      (item) => (

                        <div
                          className={
                            styles.activityItem
                          }
                          key={item.id}
                        >

                          <FiAlertCircle />


                          <div>

                            <strong>

                              {item.nome}

                            </strong>


                            <span>

                              Apenas{" "}
                              {item.quantidade}
                              {" "}
                              unidade(s)
                              {" "}
                              disponível(is)

                            </span>

                          </div>

                        </div>

                      )
                    )

                )}

              </div>

            </div>

          </section>



          {/* =================================================
              QUICK ACTIONS
          ================================================= */}

          <section className={styles.quick}>


            {/* ADICIONAR PRODUTO */}

            <div
              className={
                styles.quickCard
              }
              onClick={() =>
                navigate(
                  "/admin/produtos/novo"
                )
              }
            >

              <div>

                <h3>
                  Adicionar Produto
                </h3>


                <p>
                  Cadastre novos itens rapidamente.
                </p>

              </div>


              <FiArrowUpRight />

            </div>



            {/* VER PEDIDOS */}

            <div
              className={
                styles.quickCard
              }
              onClick={() =>
                navigate(
                  "/admin/pedidos"
                )
              }
            >

              <div>

                <h3>
                  Ver Pedidos
                </h3>


                <p>
                  Gerencie pedidos em andamento.
                </p>

              </div>


              <FiArrowUpRight />

            </div>



            {/* HISTÓRICO */}

            <div
              className={
                styles.quickCard
              }
              onClick={() =>
                navigate(
                  "/admin/cupons"
                )
              }
            >

              <div>

                <h3>
                  Adicionar cupom de desconto
                </h3>


                <p>
                  adicione cupons de desconto para promoções.
                </p>

              </div>


              <FiTag />

            </div>

          </section>

        </main>

      </div>



      {/* =====================================================
          MODAL - VENDAS DA SEMANA
      ===================================================== */}

      {modalOpen && (

        <div
          className={
            styles.modalOverlay
          }
          onClick={() =>
            setModalOpen(false)
          }
        >

          <div
            className={
              styles.modal
            }
            onClick={(event) =>
              event.stopPropagation()
            }
          >


            {/* HEADER */}

            <div
              className={
                styles.modalHeader
              }
            >

              <div>

                <h2>
                  Vendas Recentes
                </h2>


                <p>

                  Pedidos realizados
                  recentemente

                </p>

              </div>


              <button
                className={
                  styles.closeBtn
                }
                onClick={() =>
                  setModalOpen(false)
                }
              >

                <FiX />

              </button>

            </div>



            {/* CONTEÚDO */}

            <div
              className={
                styles.modalContent
              }
            >


              {vendasRecentes.length === 0 ? (

                <div
                  className={
                    styles.empty
                  }
                >

                  Nenhuma venda encontrada.

                </div>

              ) : (

                vendasRecentes.map(
                  (compra) => (

                    <div
                      key={compra.id}
                      className={
                        styles.purchaseItem
                      }
                    >


                      <div>

                        <strong>

                          {compra.produto}

                        </strong>


                        <span>

                          Pedido #{compra.id}

                          {" • "}

                          {compra.cliente}

                        </span>

                      </div>



                      <div
                        className={
                          styles.purchaseRight
                        }
                      >

                        <b>

                          {formatarMoeda(
                            compra.total
                          )}

                        </b>


                        <small>

                          {formatarData(
                            compra.criado_em
                          )}

                        </small>

                      </div>

                    </div>

                  )
                )

              )}

            </div>

          </div>

        </div>

      )}

    </div>

  );

}