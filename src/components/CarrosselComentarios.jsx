import { useEffect, useState } from "react";
import { FiChevronLeft, FiChevronRight, FiStar } from "react-icons/fi";
import { api } from "../services/api.js";
import {
    formatarDataFeedback,
    normalizarFeedbacks,
    obterComentariosVisiveis,
    obterUrlFotoUsuario
} from "../utils/feedbacks.js";
import styles from "./CarrosselComentarios.module.css";

function obterLimitePorTela() {
    if (typeof window === "undefined") {
        return 3;
    }

    if (window.innerWidth <= 768) {
        return 1;
    }

    if (window.innerWidth <= 1200) {
        return 2;
    }

    return 3;
}

function AvatarUsuario({ foto, nome }) {
    const [fotoComErro, setFotoComErro] = useState(false);
    const urlFoto = obterUrlFotoUsuario(
        foto,
        api.defaults.baseURL
    );
    const inicial = nome.trim().charAt(0).toUpperCase() || "?";

    if (!urlFoto || fotoComErro) {
        return (
            <div className={styles.avatarVazio} aria-hidden="true">
                {inicial}
            </div>
        );
    }

    return (
        <img
            src={urlFoto}
            alt={`Foto de ${nome}`}
            className={styles.avatar}
            loading="lazy"
            onError={() => setFotoComErro(true)}
        />
    );
}

export default function CarrosselComentarios() {
    const [comentarios, setComentarios] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");
    const [indiceAtual, setIndiceAtual] = useState(0);
    const [limitePorTela, setLimitePorTela] = useState(
        obterLimitePorTela
    );

    useEffect(() => {
        function atualizarLimite() {
            setLimitePorTela(obterLimitePorTela());
        }

        window.addEventListener("resize", atualizarLimite);

        return () => {
            window.removeEventListener("resize", atualizarLimite);
        };
    }, []);

    useEffect(() => {
        let componenteAtivo = true;

        async function buscarComentarios() {
            try {
                const resposta = await api.get("/feedbacks");

                if (!componenteAtivo) {
                    return;
                }

                setComentarios(normalizarFeedbacks(resposta.data));
                setIndiceAtual(0);
                setErro("");
            } catch (error) {
                console.error("Erro ao buscar comentários:", error);

                if (componenteAtivo) {
                    setErro("Não foi possível carregar os comentários.");
                }
            } finally {
                if (componenteAtivo) {
                    setCarregando(false);
                }
            }
        }

        buscarComentarios();

        return () => {
            componenteAtivo = false;
        };
    }, []);

    const podeNavegar = comentarios.length > 1;

    // Mantém um item fora da janela para que a navegação tenha efeito
    // mesmo quando existem apenas dois ou três feedbacks cadastrados.
    const quantidadeVisivel = comentarios.length > 1
        ? Math.min(limitePorTela, comentarios.length - 1)
        : comentarios.length;

    const comentariosAtuais = obterComentariosVisiveis(
        comentarios,
        indiceAtual,
        quantidadeVisivel
    );

    function avancar() {
        if (!podeNavegar) {
            return;
        }

        setIndiceAtual(
            (indice) => (indice + 1) % comentarios.length
        );
    }

    function voltar() {
        if (!podeNavegar) {
            return;
        }

        setIndiceAtual(
            (indice) =>
                (indice - 1 + comentarios.length) % comentarios.length
        );
    }

    return (
        <section className={styles.carrossel}>
            <div className={styles.header}>
                <h2>O que nossos clientes dizem</h2>
                <p>Avaliações e comentários dos nossos clientes satisfeitos</p>
            </div>

            {carregando ? (
                <div className={styles.carregando} role="status">
                    <p>Carregando comentários...</p>
                </div>
            ) : erro ? (
                <div className={styles.erro} role="alert">
                    <p>{erro}</p>
                </div>
            ) : comentarios.length === 0 ? (
                <div className={styles.vazio}>
                    <p>Ainda não há comentários publicados.</p>
                </div>
            ) : (
                <>
                    <div className={styles.container}>
                        <button
                            type="button"
                            onClick={voltar}
                            disabled={!podeNavegar}
                            className={styles.btnVoltar}
                            aria-label="Comentários anteriores"
                        >
                            <FiChevronLeft />
                        </button>

                        <div
                            className={styles.grade}
                            style={{
                                "--comentarios-visiveis": quantidadeVisivel
                            }}
                            aria-live="polite"
                            aria-atomic="true"
                        >
                            {comentariosAtuais.map((comentario) => {
                                const data = formatarDataFeedback(
                                    comentario.criado_em
                                );

                                return (
                                    <article
                                        key={comentario.id}
                                        className={styles.cartao}
                                    >
                                        <div
                                            className={styles.estrelas}
                                            aria-label={`${comentario.nota} de 5 estrelas`}
                                        >
                                            {Array.from(
                                                { length: 5 },
                                                (_, indiceEstrela) => (
                                                    <FiStar
                                                        key={indiceEstrela}
                                                        aria-hidden="true"
                                                        className={
                                                            indiceEstrela < comentario.nota
                                                                ? styles.estrelaPreenchida
                                                                : styles.estrelaVazia
                                                        }
                                                    />
                                                )
                                            )}
                                        </div>

                                        <p className={styles.comentario}>
                                            “{comentario.comentario}”
                                        </p>

                                        <div className={styles.usuario}>
                                            <AvatarUsuario
                                                foto={comentario.usuario_foto}
                                                nome={comentario.usuario_nome}
                                            />

                                            <div>
                                                <strong>
                                                    {comentario.usuario_nome}
                                                </strong>
                                                {data && <small>{data}</small>}
                                            </div>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>

                        <button
                            type="button"
                            onClick={avancar}
                            disabled={!podeNavegar}
                            className={styles.btnAvancar}
                            aria-label="Próximos comentários"
                        >
                            <FiChevronRight />
                        </button>
                    </div>

                    {podeNavegar && (
                        <div className={styles.indicadores}>
                            {comentarios.map((comentario, indice) => (
                                <button
                                    type="button"
                                    key={comentario.id}
                                    className={
                                        indice === indiceAtual
                                            ? styles.indicadorAtivo
                                            : styles.indicador
                                    }
                                    onClick={() => setIndiceAtual(indice)}
                                    aria-label={`Exibir comentário ${indice + 1}`}
                                    aria-current={
                                        indice === indiceAtual
                                            ? "true"
                                            : undefined
                                    }
                                />
                            ))}
                        </div>
                    )}
                </>
            )}
        </section>
    );
}
