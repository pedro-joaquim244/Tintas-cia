import { useEffect, useState } from "react";
import { api } from "../services/api.js";

export default function Listar() {
  return (
    <div>
      <h1>Listar</h1>

      <a href="/itens/cadastrar">
        Cadastrar novo item
      </a>

      <p>Nenhum item cadastrado.</p>

      <div>
        <div>
          <strong>Nome do item</strong> - R$ 0.00 - Quantidade: 0

          {" "}

          <a href="/itens/1/editar">
            Editar
          </a>
        </div>
      </div>
    </div>
  );
}