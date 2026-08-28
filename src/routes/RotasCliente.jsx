import {
    Navigate,
    Outlet
} from "react-router-dom";


import { useAuth } from "../contexts/authContext";
import Rodape from "../components/Rodape-User/Rodape.jsx";
import "../styles/clientTheme.css";



export default function RotasCliente(){


    const {
        usuario,
        carregando
    } = useAuth();





    if(carregando){

        return <p>Carregando...</p>;

    }





    if(!usuario){


        return (

            <Navigate
                to="/login"
                replace
            />

        );


    }







    if(usuario.tipo !== "cliente"){


        return (

            <Navigate
                to="/admin/dashboard"
                replace
            />

        );


    }






    return (
        <div className="clientTheme">
            <Outlet />
            <Rodape />
        </div>
    );



}
