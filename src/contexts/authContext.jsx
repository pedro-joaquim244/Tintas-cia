import {
    createContext,
    useContext,
    useEffect,
    useState
} from "react";

import { api } from "../services/api";


const AuthContext = createContext();



export function AuthProvider({children}){


    const [usuario,setUsuario] = useState(null);

    const [carregando,setCarregando] = useState(true);




    useEffect(()=>{


        const usuarioSalvo =
            localStorage.getItem("usuario");


        const token =
            localStorage.getItem("token");



        if(usuarioSalvo && token){


            try{


                setUsuario(
                    JSON.parse(usuarioSalvo)
                );


            }catch(error){


                localStorage.removeItem("usuario");

                localStorage.removeItem("token");


            }


        }



        setCarregando(false);



    },[]);







    async function login(email,senha){


        try{


            const resposta = await api.post(
                "/usuarios/login",
                {
                    email,
                    senha
                }
            );



            const usuario =
                resposta.data.usuario;



            const token =
                resposta.data.token;



            localStorage.setItem(
                "usuario",
                JSON.stringify(usuario)
            );


            localStorage.setItem(
                "token",
                token
            );



            setUsuario(usuario);




            return {

                sucesso:true,

                usuario

            };



        }catch(error){



            return {

                sucesso:false,

                mensagem:
                error.response?.data?.erro ||
                "Erro ao fazer login"

            };


        }



    }








    async function cadastrar(nome,email,senha){


        try{


            await api.post(
                "/usuarios",
                {
                    nome,
                    email,
                    senha
                }
            );



            return {
                sucesso:true
            };



        }catch(error){


            return {

                sucesso:false,

                mensagem:
                error.response?.data?.erro ||
                "Erro ao cadastrar"

            };


        }


    }








    function logout(){


        localStorage.removeItem(
            "usuario"
        );


        localStorage.removeItem(
            "token"
        );


        setUsuario(null);


    }







    const estaLogado =
        usuario !== null;




    const ehAdmin =
        usuario?.tipo === "admin";




    const ehCliente =
        usuario?.tipo === "cliente";






    return(


        <AuthContext.Provider

        value={{

            usuario,

            login,

            cadastrar,

            logout,

            carregando,

            estaLogado,

            ehAdmin,

            ehCliente

        }}

        >


            {children}


        </AuthContext.Provider>


    );


}






export function useAuth(){

    return useContext(AuthContext);

}