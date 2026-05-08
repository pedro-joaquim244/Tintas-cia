import { useEffect, useState } from "react";
import { api } from "../services/api.js";

export default function Listar() {
  const [itens, setItens] = useState([]);
  const [erro, setErro] = useState([]);

  useEffect(() => {
    api.get("/itens").then((resposta) => { setItens(resposta.data) }).catch(() => {
      setErro("Erro ao carregar itens.")
    })
  }, [])


  return (
    <div>
      <h1>Listar</h1>

      <a href="/itens/cadastrar">
        Cadastrar novo item
      </a>

      {erro && <p>{erro}</p>}

      {itens.length == 0 && !erro && (
        <p>Nenhum item cadastrado.</p>
      )}


      <div>
        {itens.length > 0 && (
          itens.map((item) => (
            <div key={item.id}>
              <strong>{item.nome}</strong> - R$ {item.preco} - Quantidade: {item.quantidade}

              {" "}

              <a href="/itens/1/editar">
                Editar
              </a>
            </div>
          ))
        )}

      </div>
    </div>
  );
}