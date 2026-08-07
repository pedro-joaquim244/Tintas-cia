import { useEffect, useState } from "react";
import style from "../styles/Compra.module.css";

import { api } from "../services/api";
import { useAuth } from "../contexts/authContext";
import { useNavigate } from "react-router-dom";


export default function Compra(){

    const { usuario } = useAuth();

    const navigate = useNavigate();


    const [produtos,setProdutos] = useState([]);

    const [pagamento,setPagamento] = useState("PIX");

    const [modal,setModal] = useState(false);



    async function buscarCarrinho(){

        try{

            const resposta = await api.get(
                `/carrinho/${usuario.id}`
            );


            setProdutos(resposta.data);


        }catch(error){

            console.log(
                "Erro ao buscar carrinho:",
                error
            );

        }

    }





    useEffect(()=>{

        if(usuario){

            buscarCarrinho();

        }

    },[usuario]);





    const subtotal = produtos.reduce(

        (total,item)=>{

            return total +
            Number(item.preco) *
            item.quantidade;

        },

        0

    );



    const frete = subtotal > 0 ? 29.90 : 0;


    const total = subtotal + frete;







    function confirmarCompra(){

        setModal(true);

    }







    async function finalizar(){


        try{


            await api.post(
                "/pedidos",
                {

                    usuario_id: usuario.id,

                    metodo_pagamento: pagamento

                }

            );




            setModal(false);



            alert(
                "Compra realizada com sucesso!"
            );



            navigate(
                "/cliente/inicio"
            );



        }catch(error){


            console.log(
                "Erro ao finalizar compra:",
                error
            );


            alert(
                "Erro ao finalizar compra"
            );


        }


    }







return(

<div className={style.container}>


<h1>
Finalizar compra
</h1>




<div className={style.content}>


<div className={style.produtos}>


<h2>
Produtos
</h2>



{
produtos.map(item=>(


<div
className={style.produto}
key={item.id}
>


<img

src={
`http://localhost:3333/${item.foto}`
}

alt={item.nome}

/>



<div>

<h3>
{item.nome}
</h3>


<p>
Quantidade: {item.quantidade}
</p>


<p>
R$ {
Number(item.preco).toFixed(2)
}
</p>


</div>



</div>


))

}



</div>







<div className={style.pagamento}>


<h2>
Pagamento
</h2>



<label>

<input

type="radio"

checked={
pagamento === "PIX"
}

onChange={()=>
setPagamento("PIX")
}

/>

PIX

</label>





<label>

<input

type="radio"

checked={
pagamento === "Cartão"
}

onChange={()=>
setPagamento("Cartão")
}

/>

Cartão de crédito

</label>





<label>

<input

type="radio"

checked={
pagamento === "Boleto"
}

onChange={()=>
setPagamento("Boleto")
}

/>

Boleto

</label>





<div className={style.resumo}>


<p>
Subtotal:
R$ {subtotal.toFixed(2)}
</p>


<p>
Frete:
R$ {frete.toFixed(2)}
</p>


<h2>
Total:
R$ {total.toFixed(2)}
</h2>


</div>





<button

onClick={confirmarCompra}

className={style.finalizar}

>

Finalizar compra

</button>



</div>


</div>









{
modal &&


<div className={style.overlay}>


<div className={style.modal}>


<h2>
Confirmar compra?
</h2>


<p>
Pagamento:
{pagamento}
</p>


<p>
Total:
R$ {total.toFixed(2)}
</p>




<div>


<button

onClick={()=>
setModal(false)
}

>

Cancelar

</button>





<button

onClick={finalizar}

>

Confirmar

</button>


</div>


</div>


</div>


}



</div>


)


}