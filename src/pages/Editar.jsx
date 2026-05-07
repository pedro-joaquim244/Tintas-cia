import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../services/api.js";

export default function Editar() {
  return (
    <div>
      <h1>Editar</h1>

      <a href="/">Voltar para listagem</a>

      <p>Mensagem de erro</p>

      <form>
        <div>
          <label>Nome</label>
          <input
            type="text"
            placeholder="Digite o nome do item"
          />
        </div>

        <div>
          <label>Descrição</label>
          <input
            type="text"
            placeholder="Digite a descrição"
          />
        </div>

        <div>
          <label>Preço</label>
          <input
            type="number"
            placeholder="Digite o preço"
          />
        </div>

        <div>
          <label>Quantidade</label>
          <input
            type="number"
            placeholder="Digite a quantidade"
          />
        </div>

        <button type="submit">
          Salvar alterações
        </button>
      </form>

      <button type="button">
        Excluir item
      </button>
    </div>
  );
}