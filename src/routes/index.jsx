import { Navigate, Route, Routes } from "react-router-dom";

import Login from "../pages/Login";
import Cadastro from "../pages/Cadastro";
import Dashboard from "../pages/Dashboard";
import ListarItens from "../pages/Listar";
import CadastrarItem from "../pages/Cadastrar";
import EditarItem from "../pages/Editar";
import Inicial from "../pages/Inicial";
import Pedidos from "../pages/Pedidos";
import SobreNos from "../pages/SobreNos";
import SimuladorTinta from "../pages/SimuladorTintas";
import Carrinho from "../pages/Carrinho.jsx"
import Livro from "../pages/Livro.jsx"
import Perfil from "../pages/Perfil";
import Produtos from "../pages/Produtos.jsx";
import Compra from "../pages/Compras.jsx";
import Cupons from "../pages/CriaCupons.jsx";
import Usuarios from "../pages/Usuarios.jsx";

import RotasAdmin from "./RotasAdmin";
import RotasCliente from "./RotasCliente";
import RotasPublicas from "./rotasPublicas";
import { useAuth } from "../contexts/authContext";

function InicioPorPerfil() {
  const { usuario, carregando } = useAuth();

  if (carregando) return <p>Carregando...</p>;
  if (!usuario) return <Navigate to="/login" replace />;

  return (
    <Navigate
      to={usuario.tipo === "admin" ? "/admin/dashboard" : "/cliente/inicio"}
      replace
    />
  );
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<InicioPorPerfil />} />

      <Route element={<RotasPublicas />}>
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
      </Route>

      <Route element={<RotasAdmin />}>
        <Route path="/admin/dashboard" element={<Dashboard />} />
        <Route path="/admin/produtos" element={<ListarItens />} />
        <Route path="/admin/produtos/novo" element={<CadastrarItem />} />
        <Route path="/admin/produtos/:id/editar" element={<EditarItem />} />
        <Route path="/admin/pedidos" element={<Pedidos />} />
        <Route path="/admin/perfil" element={<Perfil />} />
        <Route path="/admin/Cupons" element={<Cupons />} />
        <Route path="/admin/Usuarios" element={<Usuarios />} />
        

        <Route path="/dashboard" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/admin" element={<Navigate to="/admin/produtos" replace />} />
        <Route path="/itens/cadastrar" element={<Navigate to="/admin/produtos/novo" replace />} />
        <Route path="/itens/:id/editar" element={<EditarItem />} />
      </Route>

      <Route element={<RotasCliente />}>
    <Route path="/cliente/inicio" element={<Inicial />} />
    <Route path="/cliente/sobre-nos" element={<SobreNos />} />
    <Route path="/cliente/simulador" element={<SimuladorTinta />} />
    <Route path="/cliente/perfil" element={<Perfil />} />
    <Route path="/cliente/carrinho" element={<Carrinho />} />                            
    <Route path="/cliente/produtos" element={<Produtos />} />
    <Route path="/cliente/Livro" element={<Livro />} />
    <Route path="/cliente/compra" element={<Compra />} />

    <Route path="/inicial" element={<Navigate to="/cliente/inicio" replace />} />
    <Route path="/sobre-nos" element={<Navigate to="/cliente/sobre-nos" replace />} />
    <Route path="/simulador-tintas" element={<Navigate to="/cliente/simulador" replace />} />
    <Route path="/perfil" element={<Navigate to="/cliente/perfil" replace />} />
</Route>

      <Route path="*" element={<InicioPorPerfil />} />
    </Routes>
  );
}
