import { useEffect, useState } from "react";
import style from "../styles/CriaCupons.module.css";

import { api } from "../services/api";

import {
    FaTicketAlt,
    FaPlus,
    FaTrash,
    FaPowerOff,
    FaCalendarAlt,
    FaPercent,
    FaMoneyBillWave,
    FaCopy
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

            setCupons(resposta.data);

        } catch (error) {

            console.error(
                "Erro ao buscar cupons:",
                error
            );

            setErro(
                error.response?.data?.mensagem ||
                "Não foi possível carregar os cupons."
            );

        }

    }

    // =====================================================
    // CARREGAR AO ABRIR A PÁGINA
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

        // ==========================
        // VALIDAR CÓDIGO
        // ==========================

        if (!codigo.trim()) {

            setErro(
                "Informe o código do cupom."
            );

            return;

        }

        // ==========================
        // VALIDAR VALOR
        // ==========================

        if (
            !valor ||
            Number(valor) <= 0
        ) {

            setErro(
                "Informe um valor de desconto válido."
            );

            return;

        }

        // ==========================
        // VALIDAR PORCENTAGEM
        // ==========================

        if (
            tipo === "percentual" &&
            Number(valor) > 100
        ) {

            setErro(
                "O desconto percentual não pode ser maior que 100%."
            );

            return;

        }

        // ==========================
        // VALIDAR LIMITE
        // ==========================

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

            // =================================================
            // CONVERSÃO PARA O FORMATO DO BANCO
            // =================================================

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

            console.log(
                "Dados enviados para /cupons:",
                dadosCupom
            );

            await api.post(
                "/cupons",
                dadosCupom
            );

            setMensagem(
                "Cupom cadastrado com sucesso!"
            );

            // ==========================
            // LIMPAR FORMULÁRIO
            // ==========================

            setCodigo("");
            setTipo("percentual");
            setValor("");
            setValidade("");
            setLimiteUso("");
            setAtivo(true);

            // ==========================
            // ATUALIZAR LISTA
            // ==========================

            await buscarCupons();

        } catch (error) {

            console.error(
                "Erro ao cadastrar cupom:",
                error
            );

            setErro(
                error.response?.data?.mensagem ||
                "Não foi possível cadastrar o cupom."
            );

        } finally {

            setCarregando(false);

        }

    }

    // =====================================================
    // ATIVAR / DESATIVAR
    // =====================================================

    async function alterarStatus(cupom) {

        try {

            setErro("");

            await api.put(
                `/cupons/${cupom.id}`,
                {
                    ativo: !cupom.ativo
                }
            );

            setMensagem(
                cupom.ativo
                    ? "Cupom desativado."
                    : "Cupom ativado."
            );

            await buscarCupons();

        } catch (error) {

            console.error(
                "Erro ao alterar status:",
                error
            );

            setErro(
                error.response?.data?.mensagem ||
                "Não foi possível alterar o status."
            );

        }

    }

    // =====================================================
    // EXCLUIR CUPOM
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
                "Não foi possível excluir o cupom."
            );

        }

    }

    // =====================================================
    // COPIAR CUPOM
    // =====================================================

    async function copiarCodigo(codigo) {

        try {

            await navigator.clipboard.writeText(
                codigo
            );

            setMensagem(
                `Cupom ${codigo} copiado!`
            );

            setTimeout(() => {

                setMensagem("");

            }, 2000);

        } catch (error) {

            console.error(
                "Erro ao copiar cupom:",
                error
            );

        }

    }

    // =====================================================
    // FORMATAÇÃO DO DESCONTO
    // =====================================================

    function formatarDesconto(cupom) {

        if (
            cupom.tipo === "percentual" ||
            cupom.tipo === "porcentagem"
        ) {

            return `${cupom.valor ?? cupom.desconto}%`;

        }

        return Number(
            cupom.valor ?? cupom.desconto
        ).toLocaleString(
            "pt-BR",
            {
                style: "currency",
                currency: "BRL"
            }
        );

    }

    // =====================================================
    // FORMATAÇÃO DA DATA
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
    // JSX
    // =====================================================

    return (

        <main className={style.container}>

            {/* =================================================
                CABEÇALHO
            ================================================= */}

            <div className={style.header}>

                <div
                    className={
                        style.headerIcon
                    }
                >
                    <FaTicketAlt />
                </div>

                <div>

                    <h1>
                        Cupons de desconto
                    </h1>

                    <p>
                        Crie e gerencie os cupons
                        utilizados pelos clientes.
                    </p>

                </div>

            </div>


            <div className={style.layout}>

                {/* =================================================
                    FORMULÁRIO
                ================================================= */}

                <section
                    className={
                        style.formCard
                    }
                >

                    <div
                        className={
                            style.cardHeader
                        }
                    >

                        <div>

                            <h2>
                                Novo cupom
                            </h2>

                            <p>
                                Cadastre uma nova
                                promoção para seus
                                clientes.
                            </p>

                        </div>

                        <div
                            className={
                                style.plusIcon
                            }
                        >
                            <FaPlus />
                        </div>

                    </div>


                    <form
                        onSubmit={
                            cadastrarCupom
                        }
                        className={
                            style.form
                        }
                    >

                        {/* ==========================
                            CÓDIGO
                        ========================== */}

                        <div
                            className={
                                style.field
                            }
                        >

                            <label>
                                Código do cupom
                            </label>

                            <div
                                className={
                                    style.inputIcon
                                }
                            >

                                <FaTicketAlt />

                                <input
                                    type="text"
                                    placeholder="Ex: TINTA10"
                                    value={codigo}
                                    onChange={(
                                        event
                                    ) =>
                                        setCodigo(
                                            event.target.value
                                        )
                                    }
                                />

                            </div>

                            <small>
                                O código será convertido
                                automaticamente para
                                letras maiúsculas.
                            </small>

                        </div>


                        {/* ==========================
                            TIPO + DESCONTO
                        ========================== */}

                        <div
                            className={
                                style.row
                            }
                        >

                            <div
                                className={
                                    style.field
                                }
                            >

                                <label>
                                    Tipo de desconto
                                </label>

                                <select
                                    value={tipo}
                                    onChange={(
                                        event
                                    ) =>
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


                            <div
                                className={
                                    style.field
                                }
                            >

                                <label>
                                    Valor do desconto
                                </label>

                                <div
                                    className={
                                        style.inputIcon
                                    }
                                >

                                    {tipo ===
                                    "percentual"
                                        ? (
                                            <FaPercent />
                                        )
                                        : (
                                            <FaMoneyBillWave />
                                        )}

                                    <input
                                        type="number"
                                        min="0"
                                        max={
                                            tipo ===
                                            "percentual"
                                                ? "100"
                                                : undefined
                                        }
                                        step="0.01"
                                        placeholder={
                                            tipo ===
                                            "percentual"
                                                ? "Ex: 10"
                                                : "Ex: 25.00"
                                        }
                                        value={valor}
                                        onChange={(
                                            event
                                        ) =>
                                            setValor(
                                                event.target.value
                                            )
                                        }
                                    />

                                </div>

                            </div>

                        </div>


                        {/* ==========================
                            VALIDADE + LIMITE
                        ========================== */}

                        <div
                            className={
                                style.row
                            }
                        >

                            <div
                                className={
                                    style.field
                                }
                            >

                                <label>
                                    Data de validade
                                </label>

                                <div
                                    className={
                                        style.inputIcon
                                    }
                                >

                                    <FaCalendarAlt />

                                    <input
                                        type="date"
                                        value={validade}
                                        onChange={(
                                            event
                                        ) =>
                                            setValidade(
                                                event.target.value
                                            )
                                        }
                                    />

                                </div>

                            </div>


                            <div
                                className={
                                    style.field
                                }
                            >

                                <label>
                                    Limite de uso
                                </label>

                                <input
                                    type="number"
                                    min="1"
                                    placeholder="Ex: 100"
                                    value={limiteUso}
                                    onChange={(
                                        event
                                    ) =>
                                        setLimiteUso(
                                            event.target.value
                                        )
                                    }
                                />

                                <small>
                                    Deixe vazio para
                                    permitir uso ilimitado.
                                </small>

                            </div>

                        </div>


                        {/* ==========================
                            STATUS
                        ========================== */}

                        <label
                            className={
                                style.switchRow
                            }
                        >

                            <div>

                                <strong>
                                    Cupom ativo
                                </strong>

                                <span>
                                    Permitir que os
                                    clientes utilizem
                                    este cupom.
                                </span>

                            </div>

                            <input
                                type="checkbox"
                                checked={ativo}
                                onChange={(
                                    event
                                ) =>
                                    setAtivo(
                                        event.target.checked
                                    )
                                }
                            />

                        </label>


                        {/* ==========================
                            MENSAGEM
                        ========================== */}

                        {mensagem && (

                            <div
                                className={
                                    style.success
                                }
                            >
                                {mensagem}
                            </div>

                        )}


                        {erro && (

                            <div
                                className={
                                    style.error
                                }
                            >
                                {erro}
                            </div>

                        )}


                        {/* ==========================
                            BOTÃO
                        ========================== */}

                        <button
                            type="submit"
                            className={
                                style.submit
                            }
                            disabled={
                                carregando
                            }
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
                    LISTA DE CUPONS
                ================================================= */}

                <section
                    className={
                        style.listCard
                    }
                >

                    <div
                        className={
                            style.cardHeader
                        }
                    >

                        <div>

                            <h2>
                                Cupons cadastrados
                            </h2>

                            <p>

                                {cupons.length}{" "}

                                cupom
                                {cupons.length !==
                                1
                                    ? "s"
                                    : ""}{" "}

                                encontrado
                                {cupons.length !==
                                1
                                    ? "s"
                                    : ""}.

                            </p>

                        </div>

                        <span
                            className={
                                style.count
                            }
                        >
                            {cupons.length}
                        </span>

                    </div>


                    <div
                        className={
                            style.cupons
                        }
                    >

                        {cupons.length === 0 ? (

                            <div
                                className={
                                    style.empty
                                }
                            >

                                <FaTicketAlt />

                                <h3>
                                    Nenhum cupom
                                    cadastrado
                                </h3>

                                <p>
                                    Crie seu primeiro
                                    cupom usando o
                                    formulário ao lado.
                                </p>

                            </div>

                        ) : (

                            cupons.map(
                                (cupom) => (

                                    <article
                                        key={
                                            cupom.id
                                        }
                                        className={`
                                            ${style.cupom}
                                            ${
                                                !cupom.ativo
                                                    ? style.inativo
                                                    : ""
                                            }
                                        `}
                                    >

                                        {/* ==========================
                                            ÍCONE
                                        ========================== */}

                                        <div
                                            className={
                                                style.cupomIcon
                                            }
                                        >
                                            <FaTicketAlt />
                                        </div>


                                        {/* ==========================
                                            INFORMAÇÕES
                                        ========================== */}

                                        <div
                                            className={
                                                style.cupomInfo
                                            }
                                        >

                                            <div
                                                className={
                                                    style.codigoLinha
                                                }
                                            >

                                                <strong>
                                                    {
                                                        cupom.codigo
                                                    }
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


                                            <span>

                                                Desconto:{" "}

                                                <b>
                                                    {
                                                        formatarDesconto(
                                                            cupom
                                                        )
                                                    }
                                                </b>

                                            </span>


                                            <span>

                                                Validade:{" "}

                                                {
                                                    formatarData(
                                                        cupom.validade
                                                    )
                                                }

                                            </span>


                                            <span>

                                                Limite:{" "}

                                                {
                                                    cupom.limite_uso ??
                                                    "Ilimitado"
                                                }

                                            </span>


                                            <span>

                                                Usos:{" "}

                                                <b>
                                                    {
                                                        cupom.usos ??
                                                        0
                                                    }
                                                </b>

                                            </span>

                                        </div>


                                        {/* ==========================
                                            AÇÕES
                                        ========================== */}

                                        <div
                                            className={
                                                style.cupomActions
                                            }
                                        >

                                            <span
                                                className={
                                                    cupom.ativo
                                                        ? style.ativo
                                                        : style.statusInativo
                                                }
                                            >

                                                {
                                                    cupom.ativo
                                                        ? "Ativo"
                                                        : "Inativo"
                                                }

                                            </span>


                                            <button
                                                type="button"
                                                className={
                                                    style.statusButton
                                                }
                                                onClick={() =>
                                                    alterarStatus(
                                                        cupom
                                                    )
                                                }
                                                title={
                                                    cupom.ativo
                                                        ? "Desativar"
                                                        : "Ativar"
                                                }
                                            >
                                                <FaPowerOff />
                                            </button>


                                            <button
                                                type="button"
                                                className={
                                                    style.deleteButton
                                                }
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

                                )
                            )

                        )}

                    </div>

                </section>

            </div>

        </main>
    );
}