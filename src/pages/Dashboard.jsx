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
} from "react-icons/fi";

import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/authContext.jsx";

import Cabecalho from "../components/Cabecalho.jsx";


export default function Dashboard() {

  const navigate = useNavigate();

  const { usuario, logout } = useAuth();

  function sair() {

    logout();

    navigate("/");
  }

  return (

    <div className={styles.container}>

      {/* SIDEBAR */}

      <Cabecalho />

      {/* ÁREA DIREITA */}

      <div className={styles.rightArea}>

        {/* CONTENT */}

        <main className={styles.content}>

          {/* HERO */}

          <section className={styles.hero}>

            <div>

              <span className={styles.badge}>
                Painel Administrativo
              </span>

              <h1>
                Bem-vindo, {usuario.nome}
              </h1>

              <p>
                Gerencie produtos, pedidos, estoque e clientes
                da sua loja de tintas em um único painel.
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

          {/* CARDS */}

          <section className={styles.cards}>

            <div className={styles.card}>

              <div className={styles.cardTop}>

                <span>Total de Produtos</span>

                <FiBox />

              </div>

              <h2>248</h2>

              <p>
                +12 novos essa semana
              </p>

            </div>

            <div className={styles.card}>

              <div className={styles.cardTop}>

                <span>Pedidos</span>

                <FiShoppingCart />

              </div>

              <h2>64</h2>

              <p>
                18 pendentes
              </p>

            </div>

            <div className={styles.card}>

              <div className={styles.cardTop}>

                <span>Clientes</span>

                <FiUsers />

              </div>

              <h2>1.284</h2>

              <p>
                +8.2% este mês
              </p>

            </div>

            <div className={styles.card}>

              <div className={styles.cardTop}>

                <span>Faturamento</span>

                <FiDollarSign />

              </div>

              <h2>R$ 18.420</h2>

              <p>
                Crescimento de 12%
              </p>

            </div>

          </section>

          {/* GRÁFICO */}

          <section className={styles.chartSection}>

            <div className={styles.chartHeader}>

              <div>

                <h3>
                  Vendas da Semana
                </h3>

                <p>
                  Desempenho dos últimos 7 dias
                </p>

              </div>

              <span className={styles.chartBadge}>
                +12%
              </span>

            </div>

            <div className={styles.chart}>

              <div className={styles.barGroup}>

                <span className={styles.day}>
                  Seg
                </span>

                <div
                  className={styles.bar}
                  style={{ height: "90px" }}
                />

                <strong>
                  12k
                </strong>

              </div>

              <div className={styles.barGroup}>

                <span className={styles.day}>
                  Ter
                </span>

                <div
                  className={styles.bar}
                  style={{ height: "140px" }}
                />

                <strong>
                  18k
                </strong>

              </div>

              <div className={styles.barGroup}>

                <span className={styles.day}>
                  Qua
                </span>

                <div
                  className={styles.bar}
                  style={{ height: "110px" }}
                />

                <strong>
                  14k
                </strong>

              </div>

              <div className={styles.barGroup}>

                <span className={styles.day}>
                  Qui
                </span>

                <div
                  className={styles.bar}
                  style={{ height: "170px" }}
                />

                <strong>
                  22k
                </strong>

              </div>

              <div className={styles.barGroup}>

                <span className={styles.day}>
                  Sex
                </span>

                <div
                  className={styles.bar}
                  style={{ height: "200px" }}
                />

                <strong>
                  26k
                </strong>

              </div>

              <div className={styles.barGroup}>

                <span className={styles.day}>
                  Sáb
                </span>

                <div
                  className={styles.bar}
                  style={{ height: "160px" }}
                />

                <strong>
                  20k
                </strong>

              </div>

              <div className={styles.barGroup}>

                <span className={styles.day}>
                  Dom
                </span>

                <div
                  className={styles.bar}
                  style={{ height: "130px" }}
                />

                <strong>
                  16k
                </strong>

              </div>

            </div>

          </section>

          {/* GRID */}

          <section className={styles.grid}>

            {/* VENDAS */}

            <div className={styles.panel}>

              <div className={styles.panelHeader}>

                <h3>
                  Vendas Recentes
                </h3>

                <button>
                  Ver tudo
                </button>

              </div>

              <div className={styles.sales}>

                <div className={styles.saleItem}>

                  <div>

                    <strong>
                      Tinta Azul Premium
                    </strong>

                    <span>
                      Pedido #2031
                    </span>

                  </div>

                  <b>
                    R$ 420
                  </b>

                </div>

                <div className={styles.saleItem}>

                  <div>

                    <strong>
                      Kit Pintura Completo
                    </strong>

                    <span>
                      Pedido #2030
                    </span>

                  </div>

                  <b>
                    R$ 280
                  </b>

                </div>

                <div className={styles.saleItem}>

                  <div>

                    <strong>
                      Verniz Madeira
                    </strong>

                    <span>
                      Pedido #2029
                    </span>

                  </div>

                  <b>
                    R$ 190
                  </b>

                </div>

              </div>

            </div>

            {/* ATIVIDADE */}

            <div className={styles.panel}>

              <div className={styles.panelHeader}>

                <h3>
                  Atividade
                </h3>

              </div>

              <div className={styles.activity}>

                <div className={styles.activityItem}>

                  <FiPlus />

                  <div>

                    <strong>
                      Novo produto cadastrado
                    </strong>

                    <span>
                      há 5 minutos
                    </span>

                  </div>

                </div>

                <div className={styles.activityItem}>

                  <FiTrendingUp />

                  <div>

                    <strong>
                      Estoque atualizado
                    </strong>

                    <span>
                      há 18 minutos
                    </span>

                  </div>

                </div>

                <div className={styles.activityItem}>

                  <FiAlertCircle />

                  <div>

                    <strong>
                      Produto com baixo estoque
                    </strong>

                    <span>
                      há 1 hora
                    </span>

                  </div>

                </div>

              </div>

            </div>

          </section>

          {/* QUICK ACTIONS */}

          <section className={styles.quick}>

            <div className={styles.quickCard}>

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

            <div className={styles.quickCard}>

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

            <div className={styles.quickCard}>

              <div>

                <h3>
                  Histórico
                </h3>

                <p>
                  Veja relatórios e movimentações.
                </p>

              </div>

              <FiClock />

            </div>

          </section>

      

        </main>

      </div>

    </div>
  );
}