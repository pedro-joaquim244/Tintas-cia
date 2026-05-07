import { Routes, Route, Navigate } from "react-router-dom";

import ListarItens from "../pages/Listar";
import EditarItem from "../pages/Editar";
import CadastrarItem from "../pages/Cadastrar";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<ListarItens />} />
      <Route path="/itens/:id/editar" element={<EditarItem />} />
      <Route path="/itens/cadastrar" element={<CadastrarItem />} />
      <Route path="*" element={<h1>Página não encontrada</h1>} />
    </Routes>
  );
}