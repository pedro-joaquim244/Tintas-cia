import { Routes, Route } from "react-router-dom";

import ListarItens from "../pages/Listar";
import EditarItem from "../pages/Editar";
import CadastrarItem from "../pages/Cadastrar";
import Inicial from "../pages/Inicial.jsx";
import Login from "../pages/Login.jsx";
import Dashboard from "../pages/Dashboard.jsx";
import Cadastro from "../pages/Cadastro.jsx";

import RotasPublicas from "./rotasPublicas.jsx";
import RotasPrivadas from "./rotasPrivadas.jsx";

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<RotasPrivadas />}>
        <Route path="/" element={<ListarItens />} />
        <Route path="/itens/:id/editar" element={<EditarItem />} />
        <Route path="/itens/cadastrar" element={<CadastrarItem />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Route>

      <Route element={<RotasPublicas />}>
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/inicial" element={<Inicial />} />
      </Route>

      <Route path="*" element={<h1>Página não encontrada</h1>} />
    </Routes>
  );
}