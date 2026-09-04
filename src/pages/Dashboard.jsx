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

  const [pontoAtivo, setPontoAtivo] = useState(null);


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
  // DADOS VISUAIS DO GRÁFICO
  // =====================================================

  const faturamentoSemana =
    ultimos7Dias.reduce(
      (total, item) =>
        total + Number(item.faturamento || 0),
      0
    );

  const mediaDiaria =
    faturamentoSemana / 7;

  const melhorDia =
    ultimos7Dias.reduce(
      (melhor, item) =>
        Number(item.faturamento || 0) >
        Number(melhor.faturamento || 0)
          ? item
          : melhor,
      ultimos7Dias[0] || {
        dia: "-",
        faturamento: 0,
        pedidos: 0
      }
    );

  /*
   * Usamos um pequeno espaço acima da maior venda
   * para a curva não ficar colada no topo do gráfico.
   */
  const limiteGrafico =
    Math.max(
      maiorVenda * 1.16,
      1
    );

  const larguraGrafico = 760;
  const topoGrafico = 18;
  const baseGrafico = 309;
  const alturaGrafico =
    baseGrafico - topoGrafico;
  const larguraColunaGrafico =
    larguraGrafico / ultimos7Dias.length;

  const pontosGrafico =
    ultimos7Dias.map(
      (item, index) => {

        const x =
          larguraColunaGrafico *
          (index + 0.5);

        const porcentagem =
          Number(item.faturamento || 0) /
          limiteGrafico;

        const y =
          topoGrafico +
          alturaGrafico -
          (
            porcentagem *
            alturaGrafico
          );

        return {
          ...item,
          x,
          y
        };

      }
    );

  function criarCaminhoCurvo(pontos) {

    return pontos
      .map(
        (ponto, index) => {

          if (index === 0) {
            return `M ${ponto.x} ${ponto.y}`;
          }

          const anterior =
            pontos[index - 1];

          const meioX =
            (
              anterior.x +
              ponto.x
            ) / 2;

          return `
            C
            ${meioX} ${anterior.y},
            ${meioX} ${ponto.y},
            ${ponto.x} ${ponto.y}
          `;

        }
      )
      .join(" ");
  }

  const caminhoLinha =
    criarCaminhoCurvo(
      pontosGrafico
    );

  const caminhoArea =
    `
      ${caminhoLinha}
      L ${pontosGrafico[pontosGrafico.length - 1].x} ${baseGrafico}
      L ${pontosGrafico[0].x} ${baseGrafico}
      Z
    `;

  const marcasEixo =
    [
      1,
      0.75,
      0.5,
      0.25,
      0
    ].map(
      porcentagem =>
        limiteGrafico *
        porcentagem
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

            <div className={styles.chartAccent} />

            <div className={styles.chartHeader}>

              <div className={styles.chartTitleGroup}>

                <span className={styles.chartEyebrow}>
                  <FiTrendingUp />
                  Performance semanal
                </span>

                <h3>
                  Vendas da Semana
                </h3>

                <p>
                  Faturamento e volume de pedidos dos últimos 7 dias
                </p>

              </div>

              <span className={styles.chartBadge}>
                {resumo.pedidos_semana || 0}
                {" "}
                pedidos
              </span>

            </div>


            <div className={styles.chartVisual}>

              {/* =============================================
                  RESUMO DO GRÁFICO
              ============================================= */}

              <div className={styles.chartMetrics}>

                <div className={styles.chartMetric}>

                  <span>
                    Faturamento semanal
                  </span>

                  <strong>
                    {formatarMoeda(
                      faturamentoSemana
                    )}
                  </strong>

                  <small>
                    acumulado nos últimos 7 dias
                  </small>

                </div>


                <div className={styles.chartMetric}>

                  <span>
                    Média diária
                  </span>

                  <strong>
                    {formatarMoeda(
                      mediaDiaria
                    )}
                  </strong>

                  <small>
                    média de faturamento por dia
                  </small>

                </div>


                <div
                  className={`${styles.chartMetric} ${styles.chartMetricDestaque}`}
                >

                  <span>
                    Melhor desempenho
                  </span>

                  <strong>
                    {melhorDia?.dia || "-"}
                  </strong>

                  <small>
                    {formatarMoeda(
                      melhorDia?.faturamento || 0
                    )}
                    {" • "}
                    {melhorDia?.pedidos || 0}
                    {" "}
                    {(melhorDia?.pedidos || 0) === 1
                      ? "pedido"
                      : "pedidos"}
                  </small>

                </div>

              </div>


              {/* =============================================
                  ÁREA PRINCIPAL DO GRÁFICO
              ============================================= */}

              <div className={styles.chartFrame}>

                {/* EIXO Y */}

                <div
                  className={styles.chartAxis}
                  aria-hidden="true"
                >

                  {marcasEixo.map(
                    (valor, index) => (

                      <span key={index}>
                        {valor > 0
                          ? Number(valor)
                            .toLocaleString(
                              "pt-BR",
                              {
                                style: "currency",
                                currency: "BRL",
                                notation: "compact",
                                maximumFractionDigits: 1
                              }
                            )
                          : "R$ 0"}
                      </span>

                    )
                  )}

                </div>


                {/* PLOT */}

                <div
                  className={styles.chartPlot}
                  onMouseLeave={() =>
                    setPontoAtivo(null)
                  }
                >

                  <div className={styles.chartGridLines}>
                    <span />
                    <span />
                    <span />
                    <span />
                    <span />
                  </div>


                  <svg
                    className={styles.waveSvg}
                    viewBox="0 0 760 330"
                    preserveAspectRatio="none"
                    role="img"
                    aria-label="Gráfico de faturamento dos últimos sete dias"
                  >

                    <defs>

                      <linearGradient
                        id="waveGradientPremium"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >

                        <stop
                          offset="0%"
                          stopColor="#7fa3e8"
                          stopOpacity="0.38"
                        />

                        <stop
                          offset="55%"
                          stopColor="#3264c8"
                          stopOpacity="0.13"
                        />

                        <stop
                          offset="100%"
                          stopColor="#3264c8"
                          stopOpacity="0"
                        />

                      </linearGradient>


                      <linearGradient
                        id="waveStrokePremium"
                        x1="0"
                        y1="0"
                        x2="1"
                        y2="0"
                      >

                        <stop
                          offset="0%"
                          stopColor="#9db8ee"
                        />

                        <stop
                          offset="52%"
                          stopColor="#5f88dc"
                        />

                        <stop
                          offset="100%"
                          stopColor="#3264c8"
                        />

                      </linearGradient>


                      <filter
                        id="softGlow"
                        x="-40%"
                        y="-40%"
                        width="180%"
                        height="180%"
                      >

                        <feGaussianBlur
                          stdDeviation="4"
                          result="blur"
                        />

                        <feMerge>
                          <feMergeNode in="blur" />
                          <feMergeNode in="SourceGraphic" />
                        </feMerge>

                      </filter>

                    </defs>


                    {/* GUIAS DOS DIAS */}

                    {pontosGrafico.map((item) => (
                      <line
                        key={`guia-${item.data}`}
                        x1={item.x}
                        x2={item.x}
                        y1={topoGrafico}
                        y2={baseGrafico}
                        className={styles.chartDayGuide}
                      />
                    ))}


                    {/* LINHA GUIA DO PONTO ATIVO */}

                    {pontoAtivo !== null && (
                      <line
                        x1={
                          pontosGrafico[
                            pontoAtivo
                          ]?.x || 0
                        }
                        x2={
                          pontosGrafico[
                            pontoAtivo
                          ]?.x || 0
                        }
                        y1={topoGrafico}
                        y2={baseGrafico}
                        className={
                          styles.chartGuide
                        }
                      />
                    )}


                    {/* ÁREA PREENCHIDA */}

                    <path
                      className={styles.waveArea}
                      d={caminhoArea}
                      fill="url(#waveGradientPremium)"
                    />


                    {/* LINHA PRINCIPAL */}

                    <path
                      className={styles.waveLine}
                      d={caminhoLinha}
                      fill="none"
                      stroke="url(#waveStrokePremium)"
                      strokeWidth="4"
                      vectorEffect="non-scaling-stroke"
                    />


                    {/* ÁREAS DE INTERAÇÃO DOS DIAS */}

                    {pontosGrafico.map(
                      (item, index) => (

                        <g
                          key={item.data}
                          className={
                            pontoAtivo === index
                              ? `${styles.wavePoint} ${styles.wavePointAtivo}`
                              : styles.wavePoint
                          }
                          onMouseEnter={() =>
                            setPontoAtivo(index)
                          }
                          onFocus={() =>
                            setPontoAtivo(index)
                          }
                          onBlur={() =>
                            setPontoAtivo(null)
                          }
                          tabIndex="0"
                          role="button"
                          aria-label={
                            `${item.dia}: ${formatarMoeda(
                              item.faturamento
                            )}, ${item.pedidos} pedido(s)`
                          }
                        >

                          <rect
                            x={
                              item.x -
                              larguraColunaGrafico / 2
                            }
                            y={topoGrafico}
                            width={larguraColunaGrafico}
                            height={alturaGrafico}
                            fill="transparent"
                          />

                        </g>

                      )
                    )}

                  </svg>


                  {/* TOOLTIP VISUAL */}

                  {pontoAtivo !== null && (

                    <div
                      className={styles.chartTooltip}
                      style={{
                        "--tooltip-x":
                          `${
                            (
                              pontosGrafico[
                                pontoAtivo
                              ].x /
                              larguraGrafico
                            ) * 100
                          }%`,
                        "--tooltip-y":
                          `${
                            (
                              pontosGrafico[
                                pontoAtivo
                              ].y /
                              330
                            ) * 100
                          }%`
                      }}
                    >

                      <span>
                        {
                          pontosGrafico[
                            pontoAtivo
                          ].dia
                        }
                      </span>

                      <strong>
                        {formatarMoeda(
                          pontosGrafico[
                            pontoAtivo
                          ].faturamento
                        )}
                      </strong>

                      <small>
                        {
                          pontosGrafico[
                            pontoAtivo
                          ].pedidos
                        }
                        {" "}
                        {
                          pontosGrafico[
                            pontoAtivo
                          ].pedidos === 1
                            ? "pedido"
                            : "pedidos"
                        }
                      </small>

                    </div>

                  )}

                </div>

              </div>


              {/* =============================================
                  DIAS
              ============================================= */}

              <div className={styles.waveDays}>

                {ultimos7Dias.map(
                  (item) => (

                    <div
                      className={
                        melhorDia?.data === item.data
                          ? `${styles.waveDay} ${styles.waveDayDestaque}`
                          : styles.waveDay
                      }
                      key={item.data}
                    >

                      <span>
                        {item.dia}
                      </span>

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

                      <small>

                        {item.pedidos}
                        {" "}
                        {item.pedidos === 1
                          ? "pedido"
                          : "pedidos"}

                      </small>

                    </div>

                  )
                )}

              </div>

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
