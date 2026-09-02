
import { useEffect, useState } from "react";
import { FiChevronLeft, FiChevronRight, FiStar } from "react-icons/fi";
import { api } from "../../services/api";
import styles from "./CarrosselComentarios.module.css";

export default function CarrosselComentarios() {
    const [comentarios, setComentarios] = useState([]);
    const [indiceAtual, setIndiceAtual] = useState(0);
    const [carregando, setCarregando] = useState(true);

    useEffect(() => {
        async function carregarComentarios() {
            try {
                const { data } = await api.get("/feedbacks");

                const comentariosValidos = Array.isArray(data)
                    ? data.filter(
                          (f) => f.nota && f.comentario
                      )
                    : [];

                setComentarios(comentariosValidos);
            } catch (erro) {
                console.error(
                    "Erro ao carregar comentários:",
                    erro
                );
            } finally {
                setCarregando(false);
            }
        }

        carregarComentarios();
    }, []);

    /*
     * Avança 1 posição.
     * O primeiro card sai e um novo entra no final.
     */
    const irParaProximo = () => {
        setIndiceAtual((prev) => {
            if (comentarios.length === 0) return 0;

            return (prev + 1) % comentarios.length;
        });
    };

    /*
     * Volta 1 posição.
     * O último card sai e um anterior entra no começo.
     */
    const irParaAnterior = () => {
        setIndiceAtual((prev) => {
            if (comentarios.length === 0) return 0;

            return (
                (prev - 1 + comentarios.length) %
                comentarios.length
            );
        });
    };

    /*
     * Retorna os 3 comentários que devem aparecer.
     */
    const obterComentariosVisiveis = () => {
        if (comentarios.length <= 3) {
            return comentarios;
        }

        return [0, 1, 2].map(
            (offset) =>
                comentarios[
                    (indiceAtual + offset) %
                        comentarios.length
                ]
        );
    };

    const comentariosVisiveis =
        obterComentariosVisiveis();

    // Renderizar estrelas
    const renderarEstrelas = (nota) => {
        const notaNumerica = Number(nota);

        return Array.from({ length: 5 }).map((_, i) => (
            <FiStar
                key={i}
                size={20}
                className={
                    i < notaNumerica
                        ? styles.estrelaPreenchia
                        : styles.estraVazia
                }
            />
        ));
    };

    if (carregando) {
        return (
            <section className={styles.carrossel}>
                <div className={styles.carregando}>
                    Carregando comentários...
                </div>
            </section>
        );
    }

    if (comentarios.length === 0) {
        return null;
    }

    /*
     * Quantidade de posições possíveis.
     * Se houver até 3 comentários, não precisamos
     * de navegação entre conjuntos.
     */
    const quantidadeIndicadores =
        comentarios.length > 3
            ? comentarios.length
            : 1;

    return (
        <section className={styles.carrossel}>
            <div className={styles.conteudo}>
                <span className={styles.sectionNumber}>
                    05 — EXPERIÊNCIAS
                </span>

                <h2>
                    O que os nossos
                    <br />
                    <em>clientes dizem.</em>
                </h2>

                <div className={styles.cardsContainer}>
                    <div className={styles.cardsWrapper}>
                        {comentariosVisiveis.map(
                            (comentario, index) => (
                                <div
                                    className={
                                        styles.card
                                    }
                                    key={`${comentario.id || comentario.dataCriacao}-${index}`}
                                >
                                    <div
                                        className={
                                            styles.cardTopo
                                        }
                                    >
                                        <div
                                            className={
                                                styles.userInfo
                                            }
                                        >
                                            <strong>
                                                {comentario
                                                    .usuario
                                                    ?.nome ||
                                                    "Cliente Anônimo"}
                                            </strong>

                                            <span>
                                                {comentario.dataCriacao
                                                    ? new Date(
                                                          comentario.dataCriacao
                                                      ).toLocaleDateString(
                                                          "pt-BR"
                                                      )
                                                    : ""}
                                            </span>
                                        </div>

                                        <div
                                            className={
                                                styles.estrelas
                                            }
                                        >
                                            {renderarEstrelas(
                                                comentario.nota
                                            )}
                                        </div>
                                    </div>

                                    <p
                                        className={
                                            styles.comentario
                                        }
                                    >
                                        "
                                        {
                                            comentario.comentario
                                        }
                                        "
                                    </p>
                                </div>
                            )
                        )}
                    </div>

                    {comentarios.length > 3 && (
                        <div
                            className={
                                styles.indicadores
                            }
                        >
                            {Array.from({
                                length: quantidadeIndicadores,
                            }).map((_, index) => (
                                <button
                                    key={index}
                                    className={
                                        index ===
                                        indiceAtual
                                            ? styles.indicadorAtivo
                                            : styles.indicador
                                    }
                                    onClick={() =>
                                        setIndiceAtual(
                                            index
                                        )
                                    }
                                    aria-label={`Ir para grupo ${index + 1}`}
                                />
                            ))}
                        </div>
                    )}
                </div>

                <div className={styles.botoes}>
                    <button
                        className={
                            styles.btnNavegacao
                        }
                        onClick={irParaAnterior}
                        aria-label="Comentários anteriores"
                        disabled={
                            comentarios.length <= 3
                        }
                    >
                        <FiChevronLeft />
                    </button>

                    <button
                        className={
                            styles.btnNavegacao
                        }
                        onClick={irParaProximo}
                        aria-label="Próximos comentários"
                        disabled={
                            comentarios.length <= 3
                        }
                    >
                        <FiChevronRight />
                    </button>
                </div>
            </div>
        </section>
    );
}

