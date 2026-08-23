import { useEffect, useState } from "react";
import style from "../styles/Compra.module.css";

import { api } from "../services/api";
import { useAuth } from "../contexts/authContext";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";

export default function Compra() {
    const { usuario } = useAuth();
    const navigate = useNavigate();

    const [produtos, setProdutos] = useState([]);
    const [pagamento, setPagamento] = useState("PIX");

    const [modal, setModal] = useState(false);
    const [modalSucesso, setModalSucesso] = useState(false);

    // ==========================
    // CUPOM
    // ==========================

    const [codigoCupom, setCodigoCupom] = useState("");
    const [cupom, setCupom] = useState(null);

    const [carregandoCupom, setCarregandoCupom] = useState(false);
    const [mensagemCupom, setMensagemCupom] = useState("");
    const [erroCupom, setErroCupom] = useState("");

    // ==========================
    // BUSCAR CARRINHO
    // ==========================

    async function buscarCarrinho() {
        if (!usuario?.id) {
            return;
        }

        try {
            const resposta = await api.get(
                `/carrinho/${usuario.id}`
            );

            setProdutos(resposta.data);
        } catch (error) {
            console.error(
                "Erro ao buscar carrinho:",
                error
            );
        }
    }

    // ==========================
    // CARREGAR CARRINHO
    // ==========================

    useEffect(() => {
        if (usuario?.id) {
            buscarCarrinho();
        }
    }, [usuario]);

    // ==========================
    // SUBTOTAL
    // ==========================

    const subtotal = produtos.reduce(
        (total, item) => {
            return (
                total +
                Number(item.preco) *
                    Number(item.quantidade)
            );
        },
        0
    );

    // ==========================
    // FRETE
    // ==========================

    const frete = subtotal > 0 ? 29.9 : 0;

    // ==========================
    // DESCONTO
    // ==========================

    let desconto = 0;

    if (cupom) {
        if (
            cupom.tipo === "percentual" ||
            cupom.tipo === "porcentagem"
        ) {
            desconto =
                subtotal *
                (Number(cupom.valor) / 100);
        } else {
            desconto = Number(cupom.valor);
        }

        if (desconto > subtotal) {
            desconto = subtotal;
        }
    }

    // ==========================
    // TOTAL
    // ==========================

    const total = Math.max(
        subtotal + frete - desconto,
        0
    );

    // ==========================
    // APLICAR CUPOM
    // ==========================

    async function aplicarCupom() {
        const codigo = codigoCupom
            .trim()
            .toUpperCase();

        if (!codigo) {
            setErroCupom(
                "Digite o código do cupom."
            );

            setMensagemCupom("");

            return;
        }

        try {
            setCarregandoCupom(true);

            setErroCupom("");
            setMensagemCupom("");
            setCupom(null);

            const resposta = await api.get(
                `/cupons/validar/${codigo}`
            );

            setCupom(resposta.data);

            setCodigoCupom(
                resposta.data.codigo
            );

            setMensagemCupom(
                "Cupom aplicado com sucesso!"
            );
        } catch (error) {
            console.error(
                "Erro ao validar cupom:",
                error
            );

            setCupom(null);

            setErroCupom(
                error.response?.data?.mensagem ||
                    "Cupom inválido ou indisponível."
            );
        } finally {
            setCarregandoCupom(false);
        }
    }

    // ==========================
    // REMOVER CUPOM
    // ==========================

    function removerCupom() {
        setCupom(null);
        setCodigoCupom("");
        setMensagemCupom("");
        setErroCupom("");
    }

    // ==========================
    // CONFIRMAR COMPRA
    // ==========================

    function confirmarCompra() {
        if (produtos.length === 0) {
            return;
        }

        setModal(true);
    }

    // ==========================
    // FINALIZAR COMPRA
    // ==========================

    async function finalizar() {
        if (!usuario?.id) {
            setModal(false);

            alert(
                "Usuário não identificado."
            );

            return;
        }

        try {
            await api.post(
                "/pedidos",
                {
                    usuario_id: usuario.id,
                    metodo_pagamento: pagamento,

                    cupom_id: cupom
                        ? cupom.id
                        : null
                }
            );

            // Fecha o modal de confirmação
            setModal(false);

            // Abre o modal de compra finalizada
            setModalSucesso(true);

        } catch (error) {
            console.error(
                "Erro ao finalizar compra:",
                error
            );

            alert(
                error.response?.data?.mensagem ||
                    "Erro ao finalizar compra."
            );
        }
    }

    // ==========================
    // FORMATAR MOEDA
    // ==========================

    function formatarMoeda(valor) {
        return Number(valor).toLocaleString(
            "pt-BR",
            {
                style: "currency",
                currency: "BRL"
            }
        );
    }

    // ==========================
    // JSX
    // ==========================

    return (
        <main className={style.container}>

            <div className={style.conteudo}>

                {/* ==================================================
                    PRODUTOS
                ================================================== */}

                <section className={style.produtos}>

                    <div className={style.pageHeader}>
                        <button
                            type="button"
                            className={style.backButton}
                            onClick={() => navigate(-1)}
                        >
                            <FiArrowLeft />
                            Voltar
                        </button>

                        <h1>
                            Finalizar compra
                        </h1>
                    </div>

                    {produtos.length === 0 ? (

                        <p>
                            Seu carrinho está vazio.
                        </p>

                    ) : (

                        produtos.map((item) => (

                            <div
                                key={item.id}
                                className={
                                    style.produto
                                }
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
                                        Quantidade:{" "}
                                        {item.quantidade}
                                    </p>

                                    <strong>
                                        {formatarMoeda(
                                            Number(
                                                item.preco
                                            ) *
                                            Number(
                                                item.quantidade
                                            )
                                        )}
                                    </strong>

                                </div>

                            </div>

                        ))
                    )}

                </section>


                {/* ==================================================
                    CUPOM
                ================================================== */}

                <section className={style.cupom}>

                    <h2>
                        Cupom de desconto
                    </h2>

                    {!cupom ? (

                        <>

                            <div
                                className={
                                    style.cupomInput
                                }
                            >

                                <input
                                    type="text"
                                    placeholder="Digite seu cupom"
                                    value={codigoCupom}
                                    onChange={(event) =>
                                        setCodigoCupom(
                                            event.target.value
                                        )
                                    }
                                    onKeyDown={(event) => {

                                        if (
                                            event.key ===
                                            "Enter"
                                        ) {
                                            aplicarCupom();
                                        }

                                    }}
                                />

                                <button
                                    type="button"
                                    onClick={
                                        aplicarCupom
                                    }
                                    disabled={
                                        carregandoCupom
                                    }
                                >
                                    {carregandoCupom
                                        ? "Verificando..."
                                        : "Aplicar"}
                                </button>

                            </div>


                            {mensagemCupom && (

                                <p
                                    className={
                                        style.sucesso
                                    }
                                >
                                    {mensagemCupom}
                                </p>

                            )}


                            {erroCupom && (

                                <p
                                    className={
                                        style.erro
                                    }
                                >
                                    {erroCupom}
                                </p>

                            )}

                        </>

                    ) : (

                        <div
                            className={
                                style.cupomAplicado
                            }
                        >

                            <div>

                                <strong>
                                    {cupom.codigo}
                                </strong>

                                <span>
                                    Cupom aplicado
                                </span>

                            </div>

                            <button
                                type="button"
                                onClick={
                                    removerCupom
                                }
                            >
                                Remover
                            </button>

                        </div>

                    )}

                </section>


                {/* ==================================================
                    PAGAMENTO
                ================================================== */}

                <section className={style.pagamento}>

                    <h2>
                        Forma de pagamento
                    </h2>

                    <label>

                        <input
                            type="radio"
                            name="pagamento"
                            value="PIX"
                            checked={
                                pagamento === "PIX"
                            }
                            onChange={() =>
                                setPagamento("PIX")
                            }
                        />

                        <span>
                            PIX
                        </span>

                    </label>


                    <label>

                        <input
                            type="radio"
                            name="pagamento"
                            value="Cartão"
                            checked={
                                pagamento ===
                                "Cartão"
                            }
                            onChange={() =>
                                setPagamento(
                                    "Cartão"
                                )
                            }
                        />

                        <span>
                            Cartão de crédito
                        </span>

                    </label>


                    <label>

                        <input
                            type="radio"
                            name="pagamento"
                            value="Boleto"
                            checked={
                                pagamento ===
                                "Boleto"
                            }
                            onChange={() =>
                                setPagamento(
                                    "Boleto"
                                )
                            }
                        />

                        <span>
                            Boleto
                        </span>

                    </label>

                </section>


                {/* ==================================================
                    RESUMO
                ================================================== */}

                <section className={style.resumo}>

                    <h2>
                        Resumo da compra
                    </h2>


                    <div>

                        <span>
                            Subtotal
                        </span>

                        <strong>
                            {formatarMoeda(
                                subtotal
                            )}
                        </strong>

                    </div>


                    <div>

                        <span>
                            Frete
                        </span>

                        <strong>
                            {formatarMoeda(
                                frete
                            )}
                        </strong>

                    </div>


                    {cupom && (

                        <div
                            className={
                                style.desconto
                            }
                        >

                            <span>
                                Desconto (
                                {cupom.codigo}
                                )
                            </span>

                            <strong>
                                -
                                {formatarMoeda(
                                    desconto
                                )}
                            </strong>

                        </div>

                    )}


                    <hr />


                    <div
                        className={
                            style.total
                        }
                    >

                        <span>
                            Total
                        </span>

                        <strong>
                            {formatarMoeda(
                                total
                            )}
                        </strong>

                    </div>


                    <button
                        type="button"
                        className={
                            style.finalizar
                        }
                        onClick={
                            confirmarCompra
                        }
                        disabled={
                            produtos.length ===
                            0
                        }
                    >
                        Finalizar compra
                    </button>

                </section>

            </div>


            {/* ==================================================
                MODAL CONFIRMAR COMPRA
            ================================================== */}

            {modal && (

                <div
                    className={
                        style.modalOverlay
                    }
                >

                    <div
                        className={
                            style.modal
                        }
                    >

                        <h2>
                            Confirmar compra
                        </h2>

                        <p>
                            Confira os dados antes
                            de finalizar sua compra.
                        </p>


                        <div>

                            <span>
                                Forma de pagamento
                            </span>

                            <strong>
                                {pagamento}
                            </strong>

                        </div>


                        {cupom && (

                            <div>

                                <span>
                                    Cupom
                                </span>

                                <strong>
                                    {cupom.codigo}
                                </strong>

                            </div>

                        )}


                        <div>

                            <span>
                                Desconto
                            </span>

                            <strong>
                                -
                                {formatarMoeda(
                                    desconto
                                )}
                            </strong>

                        </div>


                        <div>

                            <span>
                                Total
                            </span>

                            <strong>
                                {formatarMoeda(
                                    total
                                )}
                            </strong>

                        </div>


                        <div
                            className={
                                style.modalActions
                            }
                        >

                            <button
                                type="button"
                                onClick={() =>
                                    setModal(false)
                                }
                            >
                                Cancelar
                            </button>

                            <button
                                type="button"
                                onClick={
                                    finalizar
                                }
                            >
                                Confirmar compra
                            </button>

                        </div>

                    </div>

                </div>

            )}


            {/* ==================================================
                MODAL COMPRA FINALIZADA
            ================================================== */}

            {modalSucesso && (

                <div
                    className={
                        style.modalSucessoOverlay
                    }
                >

                    <div
                        className={
                            style.modalSucesso
                        }
                    >

                        {/* ÍCONE */}

                        <div
                            className={
                                style.iconeSucesso
                            }
                        >
                            ✓
                        </div>


                        {/* TÍTULO */}

                        <h2>
                            Compra realizada!
                        </h2>


                        {/* TEXTO */}

                        <p>
                            Seu pedido foi realizado
                            com sucesso. Obrigado
                            pela sua compra!
                        </p>


                        {/* RESUMO */}

                        <div
                            className={
                                style.resumoSucesso
                            }
                        >

                            <div>

                                <span>
                                    Forma de pagamento
                                </span>

                                <strong>
                                    {pagamento}
                                </strong>

                            </div>


                            <div>

                                <span>
                                    Total
                                </span>

                                <strong>
                                    {formatarMoeda(
                                        total
                                    )}
                                </strong>

                            </div>

                        </div>


                        {/* BOTÃO */}

                        <button
                            type="button"
                            className={
                                style.botaoSucesso
                            }
                            onClick={() =>
                                navigate(
                                    "/cliente/inicio"
                                )
                            }
                        >
                            Continuar
                        </button>

                    </div>

                </div>

            )}

        </main>
    );
}