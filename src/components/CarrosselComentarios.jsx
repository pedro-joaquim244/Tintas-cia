import { useEffect, useState } from "react";
import { FiChevronLeft, FiChevronRight, FiStar } from "react-icons/fi";
import { api } from "../services/api.js";
import styles from "./CarrosselComentarios.module.css";

export default function CarrosselComentarios() {

    const [comentarios, setComentarios] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");
    const [indiceAtual, setIndiceAtual] = useState(0);
    const comentariosPorVez = 3;


    // =====================================================
    // BUSCAR COMENTÁRIOS
    // =====================================================

    useEffect(() => {

        async function buscarComentarios() {

            try {

                setCarregando(true);
                setErro("");

                const resposta = await api.get("/feedbacks");

                const lista = Array.isArray(resposta.data)
                    ? resposta.data
                    : Array.isArray(resposta.data?.feedbacks)
                        ? resposta.data.feedbacks
                        : [];

                // Embaralha e limita a 20 comentários
                const embaralhados = lista
                    .sort(() => Math.random() - 0.5)
                    .slice(0, 20);

                setComentarios(embaralhados);

            } catch (error) {

                console.error(
                    "Erro ao buscar comentários:",
                    error
                );

                setErro(
                    "Não foi possível carregar os comentários"
                );

            } finally {

                setCarregando(false);

            }

        }

        buscarComentarios();

    }, []);


    // =====================================================
    // AVANÇAR CARROSSEL
    // =====================================================

    function avancar() {

        const proximoIndice = indiceAtual + 1;
        const maxIndice = Math.ceil(
            comentarios.length / comentariosPorVez
        ) - 1;

        if (proximoIndice <= maxIndice) {
            setIndiceAtual(proximoIndice);
        }

    }


    // =====================================================
    // VOLTAR CARROSSEL
    // =====================================================

    function voltar() {

        if (indiceAtual > 0) {
            setIndiceAtual(indiceAtual - 1);
        }

    }


    // =====================================================
    // OBTER COMENTÁRIOS ATUAIS
    // =====================================================

    const inicio = indiceAtual * comentariosPorVez;
    const comentariosAtuais = comentarios.slice(
        inicio,
        inicio + comentariosPorVez
    );

    const podeVoltar = indiceAtual > 0;
    const podeAvancar =
        indiceAtual <
        Math.ceil(comentarios.length / comentariosPorVez) - 1;


    // =====================================================
    // SEM COMENTÁRIOS
    // =====================================================

    if (!carregando && comentarios.length === 0) {
        return null;
    }


    // =====================================================
    // RENDERIZAR
    // =====================================================

    return (
        <section className={styles.carrossel}>

            <div className={styles.header}>
                <h2>O que nossos clientes dizem</h2>
                <p>Avaliações e comentários dos nossos clientes satisfeitos</p>
            </div>

            {carregando ? (

                <div className={styles.carregando}>
                    <p>Carregando comentários...</p>
                </div>

            ) : erro ? (

                <div className={styles.erro}>
                    <p>{erro}</p>
                </div>

            ) : (

                <>

                    <div className={styles.container}>

                        <button
                            onClick={voltar}
                            disabled={!podeVoltar}
                            className={styles.btnVoltar}
                            aria-label="Comentários anteriores"
                        >
                            <FiChevronLeft />
                        </button>

                        <div className={styles.grade}>
                            {comentariosAtuais.map(
                                (comentario) => (

                                    <div
                                        key={comentario.id}
                                        className={styles.cartao}
                                    >

                                        <div className={styles.estrelas}>
                                            {Array.from(
                                                { length: 5 },
                                                (_, i) => (
                                                    <FiStar
                                                        key={i}
                                                        className={
                                                            i < comentario.nota
                                                                ? styles.estrelaPreenchida
                                                                : styles.estrelaVazia
                                                        }
                                                    />
                                                )
                                            )}
                                        </div>

                                        <p className={styles.comentario}>
                                            "{comentario.comentario}"
                                        </p>

                                        <div className={styles.usuario}>
                                            {comentario.usuario_foto ? (
                                                <img
                                                    src={
                                                        comentario.usuario_foto.startsWith("http")
                                                            ? comentario.usuario_foto
                                                            : `http://localhost:3333/${comentario.usuario_foto}`
                                                    }
                                                    alt={comentario.usuario_nome}
                                                    className={styles.avatar}
                                                />
                                            ) : (
                                                <div className={styles.avatarVazio}>
                                                    {comentario.usuario_nome
                                                        .charAt(0)
                                                        .toUpperCase()}
                                                </div>
                                            )}

                                            <div>
                                                <strong>{comentario.usuario_nome}</strong>
                                                <small>
                                                    {new Date(
                                                        comentario.criado_em
                                                    ).toLocaleDateString(
                                                        "pt-BR",
                                                        {
                                                            day: "2-digit",
                                                            month: "long",
                                                            year: "numeric"
                                                        }
                                                    )}
                                                </small>
                                            </div>
                                        </div>

                                    </div>

                                )
                            )}
                        </div>

                        <button
                            onClick={avancar}
                            disabled={!podeAvancar}
                            className={styles.btnAvancar}
                            aria-label="Próximos comentários"
                        >
                            <FiChevronRight />
                        </button>

                    </div>

                    <div className={styles.indicadores}>
                        {Array.from(
                            {
                                length: Math.ceil(
                                    comentarios.length /
                                    comentariosPorVez
                                )
                            },
                            (_, i) => (

                                <button
                                    key={i}
                                    className={
                                        i === indiceAtual
                                            ? styles.indicadorAtivo
                                            : styles.indicador
                                    }
                                    onClick={() => setIndiceAtual(i)}
                                    aria-label={`Ir para slide ${i + 1}`}
                                />

                            )
                        )}
                    </div>

                </>

            )}

        </section>
    );

}
