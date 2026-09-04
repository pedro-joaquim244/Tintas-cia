import db from "../database.js";


function texto(valor) {
    return String(valor ?? "").trim();
}


function estadoFormatado(valor) {
    return texto(valor).toUpperCase();
}


function numero(valor) {
    const convertido = Number(valor);

    return Number.isFinite(convertido)
        ? convertido
        : null;
}


function resposta(status, dados) {
    return {
        status,
        dados
    };
}


/**
 * Calcula o frete exclusivamente a partir da modalidade, do destino e do
 * subtotal informado pelo chamador. O executor pode ser o pool padrão ou uma
 * conexão transacional, como ocorre durante a criação de um pedido.
 */
export async function calcularFrete({
    tipo_entrega,
    cidade: cidadeInformada,
    estado: estadoInformado,
    subtotal: subtotalInformado,
    executor = db
} = {}) {
    const tipoEntrega = texto(
        tipo_entrega || "ENTREGA"
    ).toUpperCase();

    const subtotal = numero(
        subtotalInformado
    ) ?? 0;


    if (tipoEntrega === "RETIRADA") {
        return resposta(200, {
            disponivel: true,
            tipo_entrega: "RETIRADA",
            retirada: true,
            cidade: null,
            estado: null,
            valor_original: 0,
            valor_frete: 0,
            frete_gratis: true,
            frete_gratis_acima: null,
            prazo_min: 0,
            prazo_max: 1,
            prazo_texto: "Retirada disponível em até 1 dia útil.",
            mensagem: "Retirada na loja grátis."
        });
    }


    if (tipoEntrega !== "ENTREGA") {
        return resposta(400, {
            erro: "Tipo de entrega inválido."
        });
    }


    const cidade = texto(
        cidadeInformada
    );

    const estado = estadoFormatado(
        estadoInformado
    );


    if (!cidade || !estado) {
        return resposta(400, {
            erro: "Informe a cidade e o estado para calcular o frete."
        });
    }


    if (estado.length !== 2) {
        return resposta(400, {
            erro: "Informe uma UF válida. Ex.: SP."
        });
    }


    if (subtotal < 0) {
        return resposta(400, {
            erro: "Subtotal inválido."
        });
    }


    const [regioes] = await executor.query(
        `
        SELECT
            id,
            cidade,
            estado,
            valor,
            prazo_min,
            prazo_max,
            frete_gratis_acima,
            ativo

        FROM configuracoes_frete

        WHERE
            LOWER(TRIM(cidade)) = LOWER(TRIM(?))
            AND UPPER(TRIM(estado)) = UPPER(TRIM(?))
            AND ativo = 1

        LIMIT 1
        `,
        [
            cidade,
            estado
        ]
    );


    if (regioes.length === 0) {
        return resposta(404, {
            disponivel: false,
            erro: "Ainda não realizamos entregas para esta cidade.",
            cidade,
            estado
        });
    }


    const regiao = regioes[0];

    const valorOriginal = Number(
        regiao.valor || 0
    );

    const freteGratisAcima =
        regiao.frete_gratis_acima === null
            ? null
            : Number(regiao.frete_gratis_acima);

    const freteGratis =
        freteGratisAcima !== null &&
        freteGratisAcima > 0 &&
        subtotal >= freteGratisAcima;

    const valorFrete = freteGratis
        ? 0
        : valorOriginal;

    let faltaParaGratis = null;

    if (
        freteGratisAcima !== null &&
        freteGratisAcima > 0
    ) {
        faltaParaGratis = Math.max(
            0,
            freteGratisAcima - subtotal
        );
    }


    const prazoMin = Number(
        regiao.prazo_min || 1
    );

    const prazoMax = Number(
        regiao.prazo_max || prazoMin
    );

    const prazoTexto = prazoMin === prazoMax
        ? `${prazoMin} dia${prazoMin === 1 ? "" : "s"} útil${prazoMin === 1 ? "" : "eis"}`
        : `${prazoMin} a ${prazoMax} dias úteis`;


    return resposta(200, {
        disponivel: true,
        tipo_entrega: "ENTREGA",
        retirada: false,
        regiao_id: regiao.id,
        cidade: regiao.cidade,
        estado: regiao.estado,
        valor_original: valorOriginal,
        valor_frete: valorFrete,
        frete_gratis: freteGratis,
        frete_gratis_acima: freteGratisAcima,
        falta_para_frete_gratis: faltaParaGratis,
        prazo_min: prazoMin,
        prazo_max: prazoMax,
        prazo_texto: prazoTexto,
        mensagem: freteGratis
            ? "Você ganhou frete grátis!"
            : "Frete calculado com sucesso."
    });
}
