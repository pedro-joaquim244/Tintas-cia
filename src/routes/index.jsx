import { Routes, Route, Navigate } from "react-router-dom";

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

import Perfil from "../pages/Perfil";


import RotasAdmin from "./RotasAdmin";
import RotasCliente from "./RotasCliente";
import RotasPublicas from "./rotasPublicas";



export function AppRoutes(){


    return (

        <Routes>



            {/* ROTA INICIAL */}

            <Route
                path="/"
                element={
                    <Navigate 
                        to="/login"
                        replace
                    />
                }
            />






            {/* ROTAS PUBLICAS */}

            <Route element={<RotasPublicas/>}>


                <Route
                    path="/login"
                    element={<Login/>}
                />


                <Route
                    path="/cadastro"
                    element={<Cadastro/>}
                />


            </Route>









            {/* ROTAS ADMIN */}

            <Route element={<RotasAdmin/>}>


                <Route
                    path="/dashboard"
                    element={<Dashboard/>}
                />



                <Route
                    path="/admin"
                    element={<ListarItens/>}
                />



                <Route
                    path="/itens/cadastrar"
                    element={<CadastrarItem/>}
                />



                <Route
                    path="/itens/:id/editar"
                    element={<EditarItem/>}
                />


            </Route>









            {/* ROTAS CLIENTE */}

            <Route element={<RotasCliente/>}>


                <Route
                    path="/inicial"
                    element={<Inicial/>}
                />



                <Route
                    path="/pedidos"
                    element={<Pedidos/>}
                />



                <Route
                    path="/sobre-nos"
                    element={<SobreNos/>}
                />



                <Route
                    path="/simulador-tintas"
                    element={<SimuladorTinta/>}
                />


            </Route>










            {/* PERFIL LOGADO */}

            <Route element={<RotasCliente/>}>


                <Route
                    path="/perfil"
                    element={<Perfil/>}
                />


            </Route>










            {/* ERRO */}

            <Route
                path="*"
                element={
                    <h1>
                        Página não encontrada
                    </h1>
                }
            />



        </Routes>

    );

}