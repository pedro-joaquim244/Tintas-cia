import { useEffect, useState } from "react";
import { api } from "../services/api.js";
import styles from "../styles/Listar.module.css";

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
      <aside className={styles.sidebar}>

        <div>

          <div className={styles.logo}>
            <h1>
              Tintas<span>+</span>
            </h1>

            <p>Cores que transformam</p>
          </div>

          <nav className={styles.menu}>

            <a href="/">
              Dashboard
            </a>

            <a
              href="/itens"
              className={styles.active}
            >
              Produtos
            </a>

            <a href="/">
              Categorias
            </a>

            <a href="/">
              Marcas
            </a>

            <a href="/">
              Pedidos
            </a>

            <a href="/">
              Clientes
            </a>

            <a href="/">
              Configurações
            </a>

          </nav>

        </div>

        <div className={styles.userBox}>
          <strong>Administrador</strong>
          <span>admin@tintas.com</span>
        </div>

      </aside>

      {/* CONTENT */}
      <main className={styles.content}>

        {/* TOPBAR */}
        <div className={styles.topbar}>

          <div>

            <h1>Produtos</h1>

            <p>
              Gerencie todos os produtos da sua loja
            </p>

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
              href="/itens/cadastrar"
              className={styles.btnNovo}
            >
              + Novo Produto
            </a>

          </div>

          <div className={styles.filters}>

            <select className={styles.select}>
              <option>Todas as categorias</option>
            </select>

            <select className={styles.select}>
              <option>Todas as marcas</option>
            </select>

            <select className={styles.select}>
              <option>Todos os tipos</option>
            </select>

            <select className={styles.select}>
              <option>Todos os status</option>
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
                  <th>Produto</th>
                  <th>Categoria</th>
                  <th>Marca</th>
                  <th>Preço</th>
                  <th>Estoque</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>

              </thead>

              <tbody>

                {itens.map((item) => (

                  <tr key={item.id}>

                    <td>

                      <div className={styles.product}>

                        <div className={styles.productImage}></div>

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
                        className={`${styles.status} ${
                          item.quantidade < 5
                            ? styles.low
                            : ""
                        }`}
                      >

                        {item.quantidade < 5
                          ? "Baixo estoque"
                          : "Ativo"}

                      </span>

                    </td>

                    <td>

                      <div className={styles.actions}>

                        <a
                          href={`/itens/${item.id}/editar`}
                          className={styles.btnEditar}
                        >
                          Editar
                        </a>

                        <button className={styles.btnExcluir}>
                          Excluir
                        </button>

                      </div>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          )}

        </div>

      </main>

    </div>

  );

}