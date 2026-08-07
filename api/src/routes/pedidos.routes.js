import express from "express";
import pool from "../database.js";

const router = express.Router();


// FINALIZAR PEDIDO

router.post("/", async (req,res)=>{

try{


const {
    usuario_id,
    metodo_pagamento
} = req.body;



// buscar carrinho

const [carrinho] = await pool.query(

`
SELECT 
c.produto_id,
c.quantidade,
i.preco

FROM carrinho c

INNER JOIN itens i
ON c.produto_id = i.id

WHERE c.usuario_id = ?

`,
[
usuario_id
]

);



if(carrinho.length === 0){

return res.status(400).json({
erro:"Carrinho vazio"
});

}




// calcular total

let total = 0;


carrinho.forEach(item=>{

total += Number(item.preco) * item.quantidade;

});


// adicionar frete

total += 29.90;



// criar pedido


const [pedido] = await pool.query(

`
INSERT INTO pedidos
(
usuario_id,
total,
metodo_pagamento,
status
)

VALUES
(?,?,?,?)

`,
[
usuario_id,
total,
metodo_pagamento,
"Processando"
]

);



const pedido_id = pedido.insertId;





// inserir itens pedido


for(const item of carrinho){


await pool.query(

`
INSERT INTO itens_pedidos

(
pedido_id,
produto_id,
quantidade,
preco
)

VALUES
(?,?,?,?)

`,

[
pedido_id,
item.produto_id,
item.quantidade,
item.preco
]


);


}





// limpar carrinho


await pool.query(

`
DELETE FROM carrinho
WHERE usuario_id = ?

`,
[
usuario_id
]

);



return res.status(201).json({

mensagem:"Pedido criado com sucesso",
pedido_id

});




}catch(error){

console.log(error);


return res.status(500).json({

erro:error.message

});


}



});



export default router;