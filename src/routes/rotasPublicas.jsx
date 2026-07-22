import {
    Navigate,
    Outlet
} from "react-router-dom";


import { useAuth } from "../contexts/authContext";



export default function RotasPublicas(){



    const {

        usuario,

        carregando

    } = useAuth();






    if(carregando){

        return <p>Carregando...</p>;

    }







    if(usuario){



        if(usuario.tipo === "admin"){


            return (

                <Navigate
                    to="/admin/dashboard"
                    replace
                />

            );


        }






        return (

            <Navigate
                to="/cliente/inicio"
                replace
            />

        );



    }






    return <Outlet/>;



}
