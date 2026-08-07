import { useEffect, useState } from "react";

import Cabecalho from "../components/Cabeçalho-Users";
import style from "../styles/Cores.module.css";

import {
    FaChevronRight,
    FaChevronDown,
    FaShoppingCart
} from "react-icons/fa";

import { useNavigate } from "react-router-dom";

import { api } from "../services/api";
import { useAuth } from "../contexts/authContext";


export default function Cores(){


    const { usuario } = useAuth();

    const navigate = useNavigate();



    const [categoriaAberta,setCategoriaAberta] = useState(null);

    const [produtos,setProdutos] = useState([]);

    const [modalCarrinho,setModalCarrinho] = useState(false);





    // =========================
    // BUSCAR PRODUTOS
    // =========================


    useEffect(()=>{


        async function carregarProdutos(){


            try{


                const resposta = await api.get("/itens");


                setProdutos(resposta.data);



            }catch(error){


                console.log(
                    "Erro ao carregar produtos:",
                    error
                );


            }


        }



        carregarProdutos();



    },[]);








    function abrirCategoria(index){


        if(categoriaAberta === index){


            setCategoriaAberta(null);


        }else{


            setCategoriaAberta(index);


        }


    }








    // =========================
    // ADICIONAR CARRINHO
    // =========================


    async function adicionarCarrinho(produto){



        try{


            if(!usuario){


                alert(
                    "Faça login para adicionar produtos"
                );


                navigate("/login");


                return;


            }




            await api.post(
                "/carrinho",
                {

                    usuario_id: usuario.id,

                    produto_id: produto.id,

                    quantidade:1

                }
            );




            setModalCarrinho(true);




        }catch(error){


            console.log(
                "Erro ao adicionar:",
                error.response?.data || error
            );


            alert(
                "Erro ao adicionar produto"
            );


        }



    }










    const categorias = [

        {

            nome:"Produtos",

            descricao:
            "Confira nossas tintas e acessórios disponíveis.",

            imagem:
            "/img/tinta.png",

            produtos:produtos

        }


    ];










return (

<>


<Cabecalho />



<main className={style.page}>


<section className={style.banner}>


<div className={style.bannerTexto}>


<span>
LOJA DE TINTAS
</span>



<h1>
Encontre as melhores cores para sua casa
</h1>



<div className={style.linha}></div>



<p>
Tintas premium e produtos para pintura com qualidade.
</p>



</div>




<img

src="/img/banner.png"

alt="Banner"

/>



</section>









<section className={style.lista}>


{

categorias.map((categoria,index)=>(



<div

className={style.card}

key={index}

>



<div className={style.cardTopo}>


<img

src={categoria.imagem}

alt={categoria.nome}

/>




<div className={style.info}>


<h2>

{categoria.nome}

</h2>



<p>

{categoria.descricao}

</p>


</div>






<button

className={style.botao}

onClick={()=>abrirCategoria(index)}

>


{

categoriaAberta === index

?

<FaChevronDown/>

:

<FaChevronRight/>

}



</button>




</div>









{


categoriaAberta === index &&



<div className={style.detalhes}>


{

categoria.produtos.length === 0 &&

<p>
Nenhum produto cadastrado.
</p>


}







{

categoria.produtos.map(produto=>(



<div

className={style.produto}

key={produto.id}

>




<img

src={
produto.foto
?
`http://localhost:3333/${produto.foto}`
:
"/img/tinta.png"
}

alt={produto.nome}

/>





<div className={style.produtoInfo}>


<h3>

{produto.nome}

</h3>



<p>

{produto.descricao}

</p>



<strong>

R$ {Number(produto.preco).toFixed(2)}

</strong>



</div>








<button

className={style.carrinho}

onClick={()=>adicionarCarrinho(produto)}

>


<FaShoppingCart/>


Adicionar


</button>





</div>



))


}



</div>



}





</div>



))

}


</section>




</main>









{
modalCarrinho &&


<div className={style.overlay}>


<div className={style.modalCarrinho}>


<div className={style.icone}>

🛒

</div>



<h2>

Produto adicionado!

</h2>



<p>

O produto foi colocado no seu carrinho.

</p>






<div className={style.botoesModal}>


<button

onClick={()=>setModalCarrinho(false)}

>

Continuar comprando

</button>





<button

onClick={()=>navigate("/cliente/carrinho")}

>

Ir para carrinho

</button>



</div>




</div>


</div>


}




</>

);


}