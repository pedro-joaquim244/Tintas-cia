const LIMITE_FEEDBACKS = 20;

export function normalizarFeedbacks(dados) {
    const lista = Array.isArray(dados)
        ? dados
        : Array.isArray(dados?.feedbacks)
            ? dados.feedbacks
            : [];

    return lista
        .map((feedback, index) => {
            if (!feedback || typeof feedback !== "object") {
                return null;
            }

            const nota = Number(feedback.nota);
            const comentario =
                typeof feedback.comentario === "string"
                    ? feedback.comentario.trim()
                    : "";

            if (
                !comentario ||
                !Number.isInteger(nota) ||
                nota < 1 ||
                nota > 5
            ) {
                return null;
            }

            const nome = String(
                feedback.usuario_nome ??
                feedback.usuario?.nome ??
                "Cliente"
            ).trim();

            return {
                ...feedback,
                id: feedback.id ?? `feedback-${index}`,
                nota,
                comentario,
                usuario_nome: nome || "Cliente",
                usuario_foto:
                    feedback.usuario_foto ??
                    feedback.usuario?.foto ??
                    null,
                criado_em:
                    feedback.criado_em ??
                    feedback.dataCriacao ??
                    null
            };
        })
        .filter(Boolean)
        .slice(0, LIMITE_FEEDBACKS);
}

export function obterComentariosVisiveis(
    comentarios,
    indiceInicial,
    quantidade
) {
    if (!Array.isArray(comentarios) || comentarios.length === 0) {
        return [];
    }

    const total = comentarios.length;
    const indice = Number.isFinite(Number(indiceInicial))
        ? Math.trunc(Number(indiceInicial))
        : 0;
    const inicio = ((indice % total) + total) % total;
    const limite = Math.min(
        total,
        Math.max(1, Math.trunc(Number(quantidade)) || 1)
    );

    return Array.from(
        { length: limite },
        (_, deslocamento) =>
            comentarios[(inicio + deslocamento) % total]
    );
}

export function obterUrlFotoUsuario(foto, baseURL = "") {
    if (typeof foto !== "string") {
        return null;
    }

    let caminho = foto.trim().replace(/\\/g, "/");

    if (!caminho) {
        return null;
    }

    if (/^(https?:|data:|blob:)/i.test(caminho)) {
        return caminho;
    }

    caminho = caminho.replace(/^\/+/, "");

    if (!caminho.startsWith("uploads/")) {
        caminho = `uploads/${caminho}`;
    }

    const base = String(baseURL || "").trim().replace(/\/+$/, "");

    return base
        ? `${base}/${caminho}`
        : `/${caminho}`;
}

export function formatarDataFeedback(data) {
    if (!data) {
        return "";
    }

    const dataFeedback = new Date(data);

    if (Number.isNaN(dataFeedback.getTime())) {
        return "";
    }

    return dataFeedback.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric"
    });
}
