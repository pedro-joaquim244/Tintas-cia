    import styles from "../styles/Pedidos.module.css";

import {
  FiSearch,
  FiEye,
  FiTruck,
  FiCheckCircle,
  FiClock,
  FiShoppingCart
} from "react-icons/fi";

import Cabecalho from "../components/Cabeçalho-ADM/Cabecalho.jsx";

export default function Pedidos() {

  const pedidos = [
    {
      id: "#1024",
      cliente: "Carlos Henrique",
      status: "Entregue",
      valor: "R$ 459,90",
      data: "16/05/2026"
    },
    {
      id: "#1025",
      cliente: "Fernanda Lima",
      status: "Em transporte",
      valor: "R$ 239,00",
      data: "17/05/2026"
    },
    {
      id: "#1026",
      cliente: "João Pedro",
      status: "Pendente",
      valor: "R$ 129,90",
      data: "17/05/2026"
    },
  ];

  return (

    <div className={styles.container}>

      <Cabecalho />

      <main className={styles.main}>

        {/* ===== TOPO ===== */}

        <div className={styles.top}>

          <div>

            <h1 className={styles.title}>
              Pedidos
            </h1>

            <p className={styles.subtitle}>
              Gerencie todos os pedidos da loja.
            </p>

          </div>

          <button className={styles.newBtn}>

            <FiShoppingCart />

            Novo pedido

          </button>

        </div>

        {/* ===== CARDS ===== */}

        <div className={styles.cards}>

          <div className={styles.card}>

            <div>

              <span>Total pedidos</span>

              <strong>248</strong>

            </div>

            <FiShoppingCart />

          </div>

          <div className={styles.card}>

            <div>

              <span>Em transporte</span>

              <strong>18</strong>

            </div>

            <FiTruck />

          </div>

          <div className={styles.card}>

            <div>

              <span>Entregues</span>

              <strong>193</strong>

            </div>

            <FiCheckCircle />

          </div>

          <div className={styles.card}>

            <div>

              <span>Pendentes</span>

              <strong>37</strong>

            </div>

            <FiClock />

          </div>

        </div>

        {/* ===== TABLE ===== */}

        <div className={styles.tableBox}>

          <div className={styles.tableTop}>

            <div className={styles.search}>

              <FiSearch />

              <input
                type="text"
                placeholder="Buscar pedido..."
              />

            </div>

          </div>

          <table className={styles.table}>

            <thead>

              <tr>

                <th>Pedido</th>
                <th>Cliente</th>
                <th>Status</th>
                <th>Valor</th>
                <th>Data</th>
                <th>Ações</th>

              </tr>

            </thead>

            <tbody>

              {pedidos.map((pedido) => (

                <tr key={pedido.id}>

                  <td>{pedido.id}</td>

                  <td>{pedido.cliente}</td>

                  <td>

                    <span
                      className={`${styles.status} ${
                        pedido.status === "Entregue"
                          ? styles.green
                          : pedido.status === "Em transporte"
                          ? styles.blue
                          : styles.orange
                      }`}
                    >
                      {pedido.status}
                    </span>

                  </td>

                  <td>{pedido.valor}</td>

                  <td>{pedido.data}</td>

                  <td>

                    <button className={styles.actionBtn}>

                      <FiEye />

                    </button>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </main>

    </div>
  );
}