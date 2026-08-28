    import { useEffect, useState } from "react";

    import style from "../styles/CriaCupons.module.css";

    import Cabecalho from "../components/Cabeçalho-ADM/Cabecalho";

    import { api } from "../services/api";

    import {
        FaTicketAlt,
        FaPlus,
        FaTrash,
        FaPowerOff,
        FaCalendarAlt,
        FaPercent,
        FaMoneyBillWave,
        FaCopy,
        FaCheckCircle,
        FaBan
    } from "react-icons/fa";


    export default function CriaCupons() {

        const [cupons, setCupons] = useState([]);

        const [codigo, setCodigo] = useState("");

        const [tipo, setTipo] = useState("percentual");

        const [valor, setValor] = useState("");

        const [validade, setValidade] = useState("");

        const [limiteUso, setLimiteUso] = useState("");

        const [ativo, setAtivo] = useState(true);

        const [carregando, setCarregando] = useState(false);

        const [mensagem, setMensagem] = useState("");

        const [erro, setErro] = useState("");


        // =====================================================
        // BUSCAR CUPONS
        // =====================================================

        async function buscarCupons() {

            try {

                setErro("");

                const resposta = await api.get("/cupons");

                setCupons(
                    Array.isArray(resposta.data)
                        ? resposta.data
                        : []
                );

            } catch (error) {

                console.error(
                    "Erro ao buscar cupons:",
                    error
                );

                setErro(
                    error.response?.data?.mensagem ||
                    error.response?.data?.erro ||
                    "Não foi possível carregar os cupons."
                );

            }

        }


        // =====================================================
        // CARREGAR
        // =====================================================

        useEffect(() => {

            buscarCupons();

        }, []);


        // =====================================================
        // CADASTRAR CUPOM
        // =====================================================

        async function cadastrarCupom(event) {

            event.preventDefault();

            setMensagem("");

            setErro("");


            if (!codigo.trim()) {

                setErro(
                    "Informe o código do cupom."
                );

                return;

            }


            if (
                !valor ||
                Number(valor) <= 0
            ) {

                setErro(
                    "Informe um valor de desconto válido."
                );

                return;

            }


            if (
                tipo === "percentual" &&
                Number(valor) > 100
            ) {

                setErro(
                    "O desconto percentual não pode ser maior que 100%."
                );

                return;

            }


            if (
                limiteUso &&
                Number(limiteUso) < 1
            ) {

                setErro(
                    "O limite de uso deve ser maior que zero."
                );

                return;

            }


            try {

                setCarregando(true);


                const dadosCupom = {

                    codigo:
                        codigo
                            .trim()
                            .toUpperCase(),

                    tipo:
                        tipo === "percentual"
                            ? "porcentagem"
                            : "valor",

                    desconto:
                        Number(valor),

                    valor_minimo: 0,

                    validade_inicio:
                        null,

                    validade_fim:
                        validade
                            ? `${validade} 23:59:59`
                            : null,

                    limite_uso:
                        limiteUso
                            ? Number(limiteUso)
                            : null,

                    status:
                        ativo
                            ? "Ativo"
                            : "Inativo"

                };


                await api.post(
                    "/cupons",
                    dadosCupom
                );


                setMensagem(
                    "Cupom cadastrado com sucesso!"
                );


                setCodigo("");

                setTipo("percentual");

                setValor("");

                setValidade("");

                setLimiteUso("");

                setAtivo(true);


                await buscarCupons();


            } catch (error) {

                console.error(
                    "Erro ao cadastrar cupom:",
                    error
                );

                setErro(
                    error.response?.data?.mensagem ||
                    error.response?.data?.erro ||
                    "Não foi possível cadastrar o cupom."
                );

            } finally {

                setCarregando(false);

            }

        }


        // =====================================================
        // ALTERAR STATUS
        // =====================================================

        async function alterarStatus(cupom) {

            try {

                setErro("");

                setMensagem("");


                const estaAtivo =
                    cupom.status === "Ativo";


                const novoStatus =
                    estaAtivo
                        ? "Inativo"
                        : "Ativo";


                await api.patch(
                    `/cupons/${cupom.id}/status`,
                    {
                        status: novoStatus
                    }
                );


                setMensagem(
                    novoStatus === "Ativo"
                        ? "Cupom ativado com sucesso."
                        : "Cupom desativado com sucesso."
                );


                await buscarCupons();


            } catch (error) {

                console.error(
                    "Erro ao alterar status:",
                    error
                );

                setErro(
                    error.response?.data?.mensagem ||
                    error.response?.data?.erro ||
                    "Não foi possível alterar o status."
                );

            }

        }


        // =====================================================
        // EXCLUIR
        // =====================================================

        async function excluirCupom(id) {

            const confirmar =
                window.confirm(
                    "Tem certeza que deseja excluir este cupom?"
                );


            if (!confirmar) {

                return;

            }


            try {

                setErro("");

                setMensagem("");


                await api.delete(
                    `/cupons/${id}`
                );


                setMensagem(
                    "Cupom excluído com sucesso."
                );


                await buscarCupons();


            } catch (error) {

                console.error(
                    "Erro ao excluir cupom:",
                    error
                );

                setErro(
                    error.response?.data?.mensagem ||
                    error.response?.data?.erro ||
                    "Não foi possível excluir o cupom."
                );

            }

        }


        // =====================================================
        // COPIAR
        // =====================================================

        async function copiarCodigo(codigoCupom) {

            try {

                await navigator.clipboard.writeText(
                    codigoCupom
                );


                setMensagem(
                    `Cupom ${codigoCupom} copiado!`
                );


                setTimeout(() => {

                    setMensagem("");

                }, 2000);


            } catch (error) {

                console.error(
                    "Erro ao copiar:",
                    error
                );

            }

        }


        // =====================================================
        // FORMATAR DESCONTO
        // =====================================================

        function formatarDesconto(cupom) {

            if (
                cupom.tipo === "percentual" ||
                cupom.tipo === "porcentagem"
            ) {

                return `${cupom.valor ?? cupom.desconto}%`;

            }


            return Number(
                cupom.valor ?? cupom.desconto ?? 0
            ).toLocaleString(
                "pt-BR",
                {
                    style: "currency",
                    currency: "BRL"
                }
            );

        }


        // =====================================================
        // FORMATAR DATA
        // =====================================================

        function formatarData(data) {

            if (!data) {

                return "Sem validade";

            }


            const dataFormatada =
                new Date(data);


            if (
                Number.isNaN(
                    dataFormatada.getTime()
                )
            ) {

                return "Sem validade";

            }


            return dataFormatada.toLocaleDateString(
                "pt-BR"
            );

        }


        // =====================================================
        // STATUS
        // =====================================================

        const totalCupons =
            cupons.length;


        const cuponsAtivos =
            cupons.filter(
                (cupom) =>
                    cupom.status === "Ativo"
            ).length;


        const cuponsInativos =
            totalCupons -
            cuponsAtivos;


        // =====================================================
        // JSX
        // =====================================================

        return (

            <main className={style.container}>

                <Cabecalho />


                {/* =================================================
                    CABEÇALHO DA PÁGINA
                ================================================= */}

             <div className={style.topbar}>
             
                       <div>
             
                         <span className={style.badge}>
                           Administração
                         </span>
             
                         <h1 className={style.title}>
                           Cupons de desconto
                         </h1>
             
                         <p>
                           Gerencie todos os cupons de desconto da sua loja.
                         </p>
             
                       </div>
             
             
                     </div>


                {/* =================================================
                    RESUMO
                ================================================= */}

                <section className={style.stats}>

                    <div className={style.statCard}>

                        <div className={style.statIcon}>

                            <FaTicketAlt />

                        </div>


                        <div>

                            <span>
                                Total de cupons
                            </span>

                            <strong>
                                {totalCupons}
                            </strong>

                        </div>

                    </div>


                    <div className={style.statCard}>

                        <div
                            className={`${style.statIcon} ${style.green}`}
                        >

                            <FaCheckCircle />

                        </div>


                        <div>

                            <span>
                                Cupons ativos
                            </span>

                            <strong>
                                {cuponsAtivos}
                            </strong>

                        </div>

                    </div>


                    <div className={style.statCard}>

                        <div
                            className={`${style.statIcon} ${style.gray}`}
                        >

                            <FaBan />

                        </div>


                        <div>

                            <span>
                                Cupons inativos
                            </span>

                            <strong>
                                {cuponsInativos}
                            </strong>

                        </div>

                    </div>

                </section>


                {/* =================================================
                    MENSAGENS
                ================================================= */}

                {mensagem && (

                    <div className={style.success}>

                        <FaCheckCircle />

                        <span>
                            {mensagem}
                        </span>

                    </div>

                )}


                {erro && (

                    <div className={style.error}>

                        <FaBan />

                        <span>
                            {erro}
                        </span>

                    </div>

                )}


                {/* =================================================
                    CONTEÚDO
                ================================================= */}

                <div className={style.layout}>


                    {/* =================================================
                        CRIAR CUPOM
                    ================================================= */}

                    <section className={style.formCard}>

                        <div className={style.cardHeader}>

                            <div>

                                

                                <h2>
                                    Criar cupom
                                </h2>

                                <p>
                                    Preencha os dados abaixo
                                    para criar uma nova promoção.
                                </p>

                            </div>


                            <div className={style.cardIcon}>

                                <FaPlus />

                            </div>

                        </div>


                        <form
                            className={style.form}
                            onSubmit={cadastrarCupom}
                        >


                            {/* CÓDIGO */}

                            <div className={style.field}>

                                <label>
                                    Código do cupom
                                </label>

                                <div className={style.inputWrapper}>

                                    <FaTicketAlt />

                                    <input
                                        type="text"
                                        placeholder="Ex: TINTA10"
                                        value={codigo}
                                        onChange={(event) =>
                                            setCodigo(
                                                event.target.value
                                            )
                                        }
                                    />

                                </div>

                                <small>
                                    O código será salvo automaticamente
                                    em letras maiúsculas.
                                </small>

                            </div>


                            {/* TIPO + VALOR */}

                            <div className={style.row}>

                                <div className={style.field}>

                                    <label>
                                        Tipo de desconto
                                    </label>

                                    <select
                                        value={tipo}
                                        onChange={(event) =>
                                            setTipo(
                                                event.target.value
                                            )
                                        }
                                    >

                                        <option value="percentual">
                                            Porcentagem (%)
                                        </option>

                                        <option value="fixo">
                                            Valor fixo (R$)
                                        </option>

                                    </select>

                                </div>


                                <div className={style.field}>

                                    <label>
                                        Desconto
                                    </label>

                                    <div className={style.inputWrapper}>

                                        {tipo === "percentual"
                                            ? <FaPercent />
                                            : <FaMoneyBillWave />
                                        }

                                        <input
                                            type="number"
                                            min="0"
                                            max={
                                                tipo === "percentual"
                                                    ? "100"
                                                    : undefined
                                            }
                                            step="0.01"
                                            placeholder={
                                                tipo === "percentual"
                                                    ? "10"
                                                    : "25.00"
                                            }
                                            value={valor}
                                            onChange={(event) =>
                                                setValor(
                                                    event.target.value
                                                )
                                            }
                                        />

                                    </div>

                                </div>

                            </div>


                            {/* VALIDADE + LIMITE */}

                            <div className={style.row}>

                                <div className={style.field}>

                                    <label>
                                        Data de validade
                                    </label>

                                    <div className={style.inputWrapper}>

                                        <FaCalendarAlt />

                                        <input
                                            type="date"
                                            value={validade}
                                            onChange={(event) =>
                                                setValidade(
                                                    event.target.value
                                                )
                                            }
                                        />

                                    </div>

                                </div>


                                <div className={style.field}>

                                    <label>
                                        Limite de uso
                                    </label>

                                    <input
                                        type="number"
                                        min="1"
                                        placeholder="Ex: 100"
                                        value={limiteUso}
                                        onChange={(event) =>
                                            setLimiteUso(
                                                event.target.value
                                            )
                                        }
                                    />

                                    <small>
                                        Deixe vazio para uso ilimitado.
                                    </small>

                                </div>

                            </div>


                            {/* ATIVO */}

                            <label className={style.switchRow}>

                                <div className={style.switchContent}>

                                    <div className={style.switchTitle}>

                                        <span>
                                            Cupom ativo
                                        </span>

                                        <b>
                                            {ativo
                                                ? "Ativo"
                                                : "Inativo"}
                                        </b>

                                    </div>

                                    <small>
                                        Permitir que os clientes
                                        utilizem este cupom.
                                    </small>

                                </div>


                                <input
                                    type="checkbox"
                                    checked={ativo}
                                    onChange={(event) =>
                                        setAtivo(
                                            event.target.checked
                                        )
                                    }
                                />

                            </label>


                            {/* BOTÃO */}

                            <button
                                type="submit"
                                className={style.submit}
                                disabled={carregando}
                            >

                                <FaPlus />

                                {carregando
                                    ? "Cadastrando..."
                                    : "Cadastrar cupom"
                                }

                            </button>

                        </form>

                    </section>


                    {/* =================================================
                        LISTA
                    ================================================= */}

                    <section className={style.listCard}>

                        <div className={style.cardHeader2}>

                            <div>

                               

                                <h2>
                                    Cupons cadastrados
                                </h2>

                                <p>
                                    Visualize e gerencie suas
                                    promoções.
                                </p>

                            </div>


                            <div className={style.listCount}>

                                {totalCupons}

                            </div>

                        </div>


                        <div className={style.cupons}>

                            {cupons.length === 0 ? (

                                <div className={style.empty}>

                                    <div className={style.emptyIcon}>

                                        <FaTicketAlt />

                                    </div>

                                    <h3>
                                        Nenhum cupom cadastrado
                                    </h3>

                                    <p>
                                        Crie seu primeiro cupom
                                        usando o formulário ao lado.
                                    </p>

                                </div>

                            ) : (

                                cupons.map((cupom) => {

                                    const estaAtivo =
                                        cupom.status === "Ativo";


                                    return (

                                        <article
                                            key={cupom.id}
                                            className={`
                                                ${style.cupom}
                                                ${
                                                    !estaAtivo
                                                        ? style.inativo
                                                        : ""
                                                }
                                            `}
                                        >

                                            {/* ÍCONE */}

                                            <div className={style.cupomIcon}>

                                                <FaTicketAlt />

                                            </div>


                                            {/* INFORMAÇÕES */}

                                            <div className={style.cupomInfo}>

                                                <div className={style.codigoRow}>

                                                    <strong>
                                                        {cupom.codigo}
                                                    </strong>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            copiarCodigo(
                                                                cupom.codigo
                                                            )
                                                        }
                                                        title="Copiar código"
                                                    >

                                                        <FaCopy />

                                                    </button>

                                                </div>


                                                <div className={style.details}>

                                                    <div>

                                                        <span>
                                                            Desconto
                                                        </span>

                                                        <b className={style.discount}>
                                                            {formatarDesconto(
                                                                cupom
                                                            )}
                                                        </b>

                                                    </div>


                                                    <div>

                                                        <span>
                                                            Validade
                                                        </span>

                                                        <b>
                                                            {
                                                                formatarData(
                                                                    cupom.validade_fim ??
                                                                    cupom.validade
                                                                )
                                                            }
                                                        </b>

                                                    </div>


                                                    <div>

                                                        <span>
                                                            Limite
                                                        </span>

                                                        <b>
                                                            {
                                                                cupom.limite_uso ??
                                                                "Ilimitado"
                                                            }
                                                        </b>

                                                    </div>


                                                    <div>

                                                        <span>
                                                            Usos
                                                        </span>

                                                        <b>
                                                            {
                                                                cupom.usos ??
                                                                0
                                                            }
                                                        </b>

                                                    </div>

                                                </div>

                                            </div>


                                            {/* AÇÕES */}

                                            <div className={style.actions}>

                                                <span
                                                    className={
                                                        estaAtivo
                                                            ? style.ativo
                                                            : style.statusInativo
                                                    }
                                                >

                                                    {estaAtivo
                                                        ? "Ativo"
                                                        : "Inativo"}

                                                </span>


                                                <button
                                                    type="button"
                                                    className={style.statusButton}
                                                    onClick={() =>
                                                        alterarStatus(
                                                            cupom
                                                        )
                                                    }
                                                    title={
                                                        estaAtivo
                                                            ? "Desativar cupom"
                                                            : "Ativar cupom"
                                                    }
                                                >

                                                    <FaPowerOff />

                                                </button>


                                                <button
                                                    type="button"
                                                    className={style.deleteButton}
                                                    onClick={() =>
                                                        excluirCupom(
                                                            cupom.id
                                                        )
                                                    }
                                                    title="Excluir cupom"
                                                >

                                                    <FaTrash />

                                                </button>

                                            </div>

                                        </article>

                                    );

                                })

                            )}

                        </div>

                    </section>

                </div>

            </main>

        );

    }