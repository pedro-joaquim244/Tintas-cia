import {
    Navigate,
    Outlet
} from "react-router-dom";


import { useAuth } from "../contexts/authContext";
import "../styles/adminTheme.css";



export default function RotasAdmin(){


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







    if(usuario.tipo !== "admin"){


        return (

            <Navigate
                to="/cliente/inicio"
                replace
            />

        );


    }






    return (
        <div className="adminTheme">
            <Outlet />
        </div>
    );



}
