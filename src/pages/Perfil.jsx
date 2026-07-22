import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FiUser,
  FiMail,
  FiEdit2,
  FiSave,
  FiCamera,
  FiShield,
  FiCalendar,
  FiLogOut
} from "react-icons/fi";


import Cabecalho from "../components/Cabeçalho-ADM/Cabecalho.jsx";
import HeaderUser from "../components/Cabeçalho-Users/index.jsx";

import { useAuth } from "../contexts/authContext";
import styles from "../styles/Perfil.module.css";


export default function Perfil() {


  const navigate = useNavigate();


  const {
    usuario,
    atualizarPerfil,
    logout
  } = useAuth();



  const [editando,setEditando] = useState(false);



  const [form,setForm] = useState({

    nome: usuario?.nome || "",

    email: usuario?.email || "",

    senha:""

  });





  async function salvarPerfil(){


    const resultado = await atualizarPerfil({

      nome:form.nome,

      email:form.email,

      ...(form.senha && {
        senha:form.senha
      })

    });



    if(resultado.sucesso){

      setEditando(false);


      setForm({

        ...form,

        senha:""

      });

    }


  }







  function handleChange(e){


    setForm({

      ...form,

      [e.target.name]:
      e.target.value

    });


  }







  function sairConta(){


    logout();


    navigate("/login");


  }







  const header =

    usuario?.tipo === "admin"

    ?

    <Cabecalho/>

    :

    <HeaderUser/>;






return (

<div className={styles.layout}>


{header}



<main className={styles.content}>


<h1>
Meu Perfil
</h1>



<p className={styles.subtitle}>

Gerencie suas informações pessoais e de acesso

</p>




<section className={styles.container}>




<div className={styles.leftCard}>


<h3>
Foto do perfil
</h3>




<div className={styles.avatarBox}>


<div className={styles.avatar}>

{usuario?.nome?.charAt(0).toUpperCase()}

</div>




<button className={styles.camera}>

<FiCamera/>

</button>



</div>




<button className={styles.photoBtn}>

Alterar foto

</button>




<small>

PNG ou JPG. Tamanho máximo: 2MB.

</small>





<button

className={styles.logout}

onClick={sairConta}

>


<FiLogOut/>

Sair da conta


</button>







<div className={styles.account}>


<h3>

Informações da conta

</h3>




<div className={styles.row}>


<FiUser/>


<div>

<span>
Nome completo
</span>


<strong>
{usuario?.nome}
</strong>


</div>


</div>






<div className={styles.row}>


<FiMail/>


<div>

<span>
E-mail
</span>


<strong>
{usuario?.email}
</strong>


</div>


</div>







<div className={styles.row}>


<FiShield/>


<div>

<span>
Nível de acesso
</span>


<strong className={styles.badge}>

{usuario?.tipo}

</strong>


</div>


</div>






<div className={styles.row}>


<FiCalendar/>


<div>


<span>
Membro desde
</span>


<strong>

2026

</strong>


</div>


</div>






</div>




</div>







<div className={styles.rightCard}>


<div className={styles.titleEdit}>


<h3>

Editar informações

</h3>



<button

onClick={

editando

?

salvarPerfil

:

()=>setEditando(true)

}


>


{

editando

?

<>

<FiSave/>

Salvar alterações

</>


:

<>

<FiEdit2/>

Editar

</>

}


</button>



</div>





<label>

Nome completo

</label>



<input

disabled={!editando}

name="nome"

value={form.nome}

onChange={handleChange}

/>






<label>

E-mail

</label>



<input

disabled={!editando}

name="email"

value={form.email}

onChange={handleChange}

/>







{

editando &&


<>

<label>

Nova senha

</label>



<input

type="password"

name="senha"

value={form.senha}

onChange={handleChange}

/>

</>


}





</div>






</section>






</main>



</div>

);


}