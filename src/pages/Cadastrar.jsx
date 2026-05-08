import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api.js";
import "../styles/Cadrastar.css";

export default function Cadastrar() {
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [preco, setPreco] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [erro, setErro] = useState("");

  const navigate = useNavigate();

  async function cadastrarItens(event) {
    event.preventDefault();

    try {
      setErro("");

      const dados = {
        nome: nome,
        descricao: descricao,
        preco: Number(preco),
        quantidade: Number(quantidade),
      };

      await api.post("/itens", dados);

      navigate("/");
    } catch (erro) {
      setErro("Erro ao cadastrar o item");
      console.error(erro);
    }
  }

  return (
    <div className="content">
      <div className="card">
        <h1 className="section-title">Cadastrar Produto</h1>

        {erro && <p className="error">{erro}</p>}

        <form className="form" onSubmit={cadastrarItens}>
          
          <div className="grid-2">

            <div className="input-group">
              <label>Nome</label>

              <input
                value={nome}
                onChange={(event) => setNome(event.target.value)}
                type="text"
                placeholder="Digite o nome do item"
              />
            </div>

            <div className="input-group">
              <label>Preço</label>

              <input
                value={preco}
                onChange={(event) => setPreco(event.target.value)}
                type="number"
                placeholder="Digite o preço"
              />
            </div>

          </div>

          <div className="grid-2">

            <div className="input-group">
              <label>Descrição</label>

              <textarea
                value={descricao}
                onChange={(event) => setDescricao(event.target.value)}
                placeholder="Digite a descrição"
              />
            </div>

            <div className="input-group">
              <label>Quantidade</label>

              <input
                value={quantidade}
                onChange={(event) => setQuantidade(event.target.value)}
                type="number"
                placeholder="Digite a quantidade"
              />
            </div>

          </div>

          <div className="buttons">
            <button className="btn btn-primary" type="submit">
              Cadastrar
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate("/")}
            >
              Voltar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}