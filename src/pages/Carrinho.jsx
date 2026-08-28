import { useEffect, useState } from "react";
import style from "../styles/carrinho.module.css";

import { api } from "../services/api";
import { useAuth } from "../contexts/authContext";
import { useNavigate } from "react-router-dom";

import Cabecalho from "../components/Cabeçalho-Users/index.jsx";


export default function Carrinho() {


    const { usuario } = useAuth();

    const navigate = useNavigate();


    const [produtos, setProdutos] = useState([]);




    // ==========================
    // BUSCAR CARRINHO
    // ==========================

    async function carregarCarrinho() {


        try {


            const resposta = await api.get(
                `/carrinho/${usuario.id}`
            );


            setProdutos(resposta.data);



        } catch (error) {


            console.log(
                "Erro ao carregar carrinho:",
                error
            );


        }


    }




    useEffect(() => {


        if(usuario){

            carregarCarrinho();

        }


    },[usuario]);






    // ==========================
    // ALTERAR QUANTIDADE
    // ==========================


    async function alterarQuantidade(id, quantidade){


        if(quantidade <= 0){

            return;

        }



        try{


            await api.put(

                `/carrinho/${id}`,

                {
                    quantidade
                }

            );


            carregarCarrinho();



        }catch(error){


            const mensagem = error.response?.data?.erro ||
                "Não foi possível alterar a quantidade.";

            console.log(
                "Erro quantidade:",
                error
            );

            alert(mensagem);


        }


    }






    // ==========================
    // REMOVER PRODUTO
    // ==========================


    async function removerProduto(id){


        try{


            await api.delete(

                `/carrinho/${id}`

            );


            carregarCarrinho();



        }catch(error){


            console.log(
                "Erro remover:",
                error
            );


        }


    }






    const subtotal = produtos.reduce(

        (total,item)=>{


            return total +

            (
                Number(item.preco) *
                item.quantidade
            );


        },

        0

    );




    const frete = subtotal > 0 ? 29.90 : 0;



    const total = subtotal + frete;






    if(!usuario){


        return (

            <>

            <Cabecalho/>

            <h2>
                Faça login para acessar o carrinho.
            </h2>


            </>

        )


    }







    return (


        <>


        <Cabecalho/>




        <div className={style.container}>


            <h1>
                Carrinho de compras
            </h1>





            <div className={style.content}>


                <div className={style.lista}>


                {

                produtos.length === 0 ?


                (

                    <h2>
                        Seu carrinho está vazio
                    </h2>

                )


                :


                produtos.map(item=>(



                    <div

                    key={item.id}

                    className={style.card}

                    >



                        <img

                        src={
                            `http://localhost:3333/${item.foto}`
                        }

                        alt={item.nome}

                        />





                        <div className={style.info}>


                            <h3>
                                {item.nome}
                            </h3>



                            <p>

                            R$ {

                            Number(item.preco)
                            .toFixed(2)

                            }

                            </p>



                            <p>

                            {item.descricao}

                            </p>



                        </div>







                        <div className={style.preco}>


                            <h2>

                            R$ {

                            (

                            item.quantidade *
                            Number(item.preco)

                            ).toFixed(2)

                            }

                            </h2>


                            <span>
                                subtotal
                            </span>


                        </div>









                        <div className={style.qtd}>


                            <button

                            onClick={()=>

                            alterarQuantidade(

                                item.id,

                                item.quantidade - 1

                            )

                            }

                            >

                                -

                            </button>





                            <span>

                                {item.quantidade}

                            </span>

                            <small>
                                Estoque: {item.estoque_disponivel}
                            </small>






                            <button

                            onClick={()=>

                            alterarQuantidade(

                                item.id,

                                item.quantidade + 1

                            )

                            }

                            >

                                +

                            </button>



                        </div>







                        <button

                        className={style.lixeira}

                        onClick={()=>removerProduto(item.id)}

                        >

                            🗑

                        </button>





                    </div>



                ))


                }




                </div>









                <div className={style.resumo}>


                    <h2>
                        Resumo do pedido
                    </h2>





                    <div className={style.linha}>

                        <span>
                            Subtotal
                        </span>


                        <span>

                        R$ {subtotal.toFixed(2)}

                        </span>


                    </div>





                    <div className={style.linha}>


                        <span>
                            Frete
                        </span>


                        <span>

                        R$ {frete.toFixed(2)}

                        </span>



                    </div>






                    <hr/>





                    <div className={style.total}>


                        <h3>
                            Total
                        </h3>



                        <h2>

                        R$ {total.toFixed(2)}

                        </h2>


                    </div>







                    <button

                    className={style.finalizar}

                    onClick={()=>

                        navigate("/cliente/compra")

                    }

                    >

                        Finalizar compra →

                    </button>





                </div>





            </div>




        </div>



        </>


    );


}