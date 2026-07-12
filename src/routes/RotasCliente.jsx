import {
    Navigate,
    Outlet
} from "react-router-dom";


import { useAuth } from "../contexts/authContext";



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
                to="/dashboard"
                replace
            />

        );


    }






    return <Outlet/>;



}