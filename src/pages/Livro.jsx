import { useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  LoaderCircle,
  Package,
  Palette,
  ShoppingBag,
  X,
} from "lucide-react";

import style from "../styles/Livro.module.css";
import Cabecalho from "../components/Cabeçalho-Users/index.jsx";
import RoletaCores from "../components/RoletaCores/RoletaCores.jsx";
import { api } from "../services/api";
import { useNavigate } from "react-router-dom";

const categorias = [
  {
    titulo: "Brancos",
    descricao: "Tons claros e delicados para ambientes leves e elegantes.",
    cores: [
      { nome: "Gelo", cor: "#F2F0E9" },
      { nome: "Branco Neve", cor: "#FFFFFF" },
      { nome: "Algodão", cor: "#F7F5ED" },
      { nome: "Marfim", cor: "#EFE6D0" },
      { nome: "Pérola", cor: "#E8E1D5" },
      { nome: "Off White", cor: "#F4F1E8" },
      { nome: "Palha", cor: "#E7D8B5" },
      { nome: "Areia", cor: "#DCC9AA" },
      { nome: "Baunilha", cor: "#F1E2B8" },
      { nome: "Branco Antigo", cor: "#EDE7D9" }
    ]
  },

  {
    titulo: "Neutros",
    descricao: "Cores versáteis que combinam com diferentes estilos.",
    cores: [
      { nome: "Cinza Claro", cor: "#D6D6D2" },
      { nome: "Cinza Médio", cor: "#A8A9A4" },
      { nome: "Chumbo", cor: "#55585C" },
      { nome: "Grafite", cor: "#383B3D" },
      { nome: "Taupe", cor: "#8B8178" },
      { nome: "Fendi", cor: "#B9A99A" },
      { nome: "Cappuccino", cor: "#B89B7A" },
      { nome: "Caramelo", cor: "#B87941" },
      { nome: "Café", cor: "#6F4E37" },
      { nome: "Chocolate", cor: "#4B3025" }
    ]
  },

  {
    titulo: "Vermelhos",
    descricao: "Tons marcantes para criar ambientes cheios de personalidade.",
    cores: [
      { nome: "Vermelho Vivo", cor: "#D71920" },
      { nome: "Vermelho Paixão", cor: "#C1121F" },
      { nome: "Cereja", cor: "#A4161A" },
      { nome: "Marsala", cor: "#8E3B46" },
      { nome: "Bordô", cor: "#6D071A" },
      { nome: "Terracota", cor: "#C45A3C" },
      { nome: "Coral", cor: "#F0806A" },
      { nome: "Rubi", cor: "#9B111E" },
      { nome: "Rosé", cor: "#D98C8C" },
      { nome: "Vinho", cor: "#722F37" }
    ]
  },

  {
    titulo: "Amarelos",
    descricao: "Tons quentes e alegres para iluminar seus espaços.",
    cores: [
      { nome: "Amarelo Sol", cor: "#FFD21F" },
      { nome: "Dourado", cor: "#E5A900" },
      { nome: "Mostarda", cor: "#C9A227" },
      { nome: "Manteiga", cor: "#F4D77D" },
      { nome: "Milho", cor: "#F5C400" },
      { nome: "Canário", cor: "#FFDF00" },
      { nome: "Mel", cor: "#D9A441" },
      { nome: "Limão", cor: "#D9E44B" },
      { nome: "Champagne", cor: "#E8D9A8" },
      { nome: "Âmbar", cor: "#D68B00" }
    ]
  },

  {
    titulo: "Azuis",
    descricao: "Tons que transmitem tranquilidade, frescor e sofisticação.",
    cores: [
      { nome: "Azul Céu", cor: "#72B7E6" },
      { nome: "Azul Bebê", cor: "#A9D6F5" },
      { nome: "Azul Royal", cor: "#2855B5" },
      { nome: "Azul Marinho", cor: "#102A56" },
      { nome: "Azul Turquesa", cor: "#21B6C7" },
      { nome: "Azul Piscina", cor: "#55C6D8" },
      { nome: "Azul Petróleo", cor: "#176B78" },
      { nome: "Azul Serenity", cor: "#91A8D0" },
      { nome: "Azul Jeans", cor: "#496A91" },
      { nome: "Azul Profundo", cor: "#183B70" }
    ]
  },

  {
    titulo: "Verdes",
    descricao: "Tons inspirados na natureza para trazer equilíbrio.",
    cores: [
      { nome: "Verde Folha", cor: "#5B8C51" },
      { nome: "Verde Musgo", cor: "#687B3E" },
      { nome: "Verde Oliva", cor: "#7B7F32" },
      { nome: "Verde Menta", cor: "#9AD9C2" },
      { nome: "Verde Água", cor: "#65C8B5" },
      { nome: "Verde Esmeralda", cor: "#188A63" },
      { nome: "Verde Floresta", cor: "#245B3A" },
      { nome: "Verde Sálvia", cor: "#A8B89F" },
      { nome: "Verde Pistache", cor: "#B5C96B" },
      { nome: "Verde Militar", cor: "#596B4B" }
    ]
  },

  {
    titulo: "Roxos & Lilases",
    descricao: "Tons delicados e sofisticados para ambientes modernos.",
    cores: [
      { nome: "Lavanda", cor: "#B9A3D9" },
      { nome: "Lilás", cor: "#C8A2C8" },
      { nome: "Violeta", cor: "#7952A8" },
      { nome: "Roxo", cor: "#633A8A" },
      { nome: "Ametista", cor: "#9966CC" },
      { nome: "Orquídea", cor: "#BA55D3" },
      { nome: "Uva", cor: "#5F2A72" },
      { nome: "Malva", cor: "#B784A7" },
      { nome: "Íris", cor: "#6F5AA8" },
      { nome: "Roxo Profundo", cor: "#43245F" }
    ]
  },

  {
    titulo: "Rosas",
    descricao: "Tons românticos e modernos para deixar o ambiente acolhedor.",
    cores: [
      { nome: "Rosa Bebê", cor: "#F4C2C2" },
      { nome: "Rosa Claro", cor: "#F1A7B8" },
      { nome: "Rosa Chá", cor: "#DFA0A9" },
      { nome: "Rosa Antigo", cor: "#C08081" },
      { nome: "Rosa Pink", cor: "#E83E8C" },
      { nome: "Fúcsia", cor: "#C2185B" },
      { nome: "Rosa Coral", cor: "#F88379" },
      { nome: "Blush", cor: "#E8B4B8" },
      { nome: "Rosa Goiaba", cor: "#D96C75" },
      { nome: "Rosa Nude", cor: "#D8A7A7" }
    ]
  }
];

export default function Livro() {
  const navigate = useNavigate();

  const [livroAberto, setLivroAberto] = useState(false);
  const [folhaAtual, setFolhaAtual] = useState(0);
  const [animando, setAnimando] = useState(false);
  const [direcao, setDirecao] = useState("direita");
  const [folhaAnimada, setFolhaAnimada] = useState(null);

  // =========================================================
  // MODAL DE PRODUTOS POR COR
  // =========================================================

  const [modalCorAberto, setModalCorAberto] = useState(false);
  const [corSelecionada, setCorSelecionada] = useState(null);
  const [produtosCor, setProdutosCor] = useState([]);
  const [carregandoProdutos, setCarregandoProdutos] = useState(false);
  const [erroProdutos, setErroProdutos] = useState("");

  const folhas = [];

  for (let i = 0; i < categorias.length; i += 2) {
    folhas.push({
      esquerda: categorias[i],
      direita: categorias[i + 1] || null,
    });
  }

  function normalizarTexto(texto) {
    return String(texto || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim()
      .toLowerCase();
  }

  function obterListaProdutos(dados) {
    if (Array.isArray(dados)) return dados;
    if (Array.isArray(dados?.itens)) return dados.itens;
    if (Array.isArray(dados?.produtos)) return dados.produtos;
    if (Array.isArray(dados?.data)) return dados.data;

    return [];
  }

  function produtoDisponivel(produto) {
    const status = normalizarTexto(produto?.status);

    return (
      status === "ativo" &&
      Number(produto?.quantidade || produto?.estoque_disponivel || 0) > 0
    );
  }

  function produtoCorrespondeCor(produto, cor) {
    const corBanco = normalizarTexto(
      produto?.cor ||
      produto?.cor_nome ||
      produto?.nome_cor
    );

    const nomeCor = normalizarTexto(cor?.nome);
    const hexCor = normalizarTexto(cor?.cor);

    if (!corBanco) return false;

    return (
      corBanco === nomeCor ||
      corBanco === hexCor ||
      corBanco.includes(nomeCor) ||
      nomeCor.includes(corBanco)
    );
  }

  function formatarPreco(valor) {
    return Number(valor || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  function imagemProduto(produto) {
    if (!produto?.foto) {
      return "/img/tinta.png";
    }

    if (
      produto.foto.startsWith("http://") ||
      produto.foto.startsWith("https://")
    ) {
      return produto.foto;
    }

    return `http://localhost:3333/${produto.foto}`;
  }

  async function abrirModalCor(cor) {
    setCorSelecionada(cor);
    setModalCorAberto(true);
    setProdutosCor([]);
    setErroProdutos("");
    setCarregandoProdutos(true);

    try {
      const resposta = await api.get("/itens");
      const lista = obterListaProdutos(resposta.data);

      const correspondentes = lista.filter(
        (produto) =>
          produtoDisponivel(produto) &&
          produtoCorrespondeCor(produto, cor)
      );

      setProdutosCor(correspondentes);
    } catch (error) {
      console.error(
        "Erro ao buscar produtos da cor:",
        error.response?.data || error
      );

      setErroProdutos(
        "Não foi possível consultar os produtos disponíveis agora."
      );
    } finally {
      setCarregandoProdutos(false);
    }
  }

  function fecharModalCor() {
    setModalCorAberto(false);
    setCorSelecionada(null);
    setProdutosCor([]);
    setErroProdutos("");
  }

  function abrirLivro() {
    setLivroAberto(true);
    setFolhaAtual(0);
  }

  function fecharLivro() {
    setLivroAberto(false);
  }

  function virarPagina(novaPagina, lado) {
    if (animando) return;

    if (novaPagina < 0 || novaPagina > folhas.length) {
      return;
    }

    setDirecao(lado);

    setFolhaAnimada({
      origem: folhaAtual,
      destino: novaPagina,
    });

    setAnimando(true);

    setTimeout(() => {
      setFolhaAtual(novaPagina);
      setAnimando(false);
    }, 800);
  }

  function proximaPagina() {
    if (folhaAtual < folhas.length) {
      virarPagina(folhaAtual + 1, "direita");
    }
  }

  function paginaAnterior() {
    if (folhaAtual > 0) {
      virarPagina(folhaAtual - 1, "esquerda");
    }
  }

  function renderFolha(indice) {
    if (indice === 0) {
      return (
        <>
          <div className={style.paginaEsquerda}>
            <PaginaInicial />
          </div>

          <div className={style.paginaDireita}>
            <PaginaInicialDireita />
          </div>
        </>
      );
    }

    const folha = folhas[indice - 1];

    return (
      <>
        <div className={style.paginaEsquerda}>
          <PaginaCategoria
            categoria={folha?.esquerda}
            onSelecionarCor={abrirModalCor}
          />
        </div>

        <div className={style.paginaDireita}>
          <PaginaCategoria
            categoria={folha?.direita}
            onSelecionarCor={abrirModalCor}
          />
        </div>
      </>
    );
  }

  return (
    <>
      <Cabecalho />

      {!livroAberto ? (
        <main className={style.capaContainer}>
          <section className={style.heroLivro}>
            <div className={style.heroTexto}>
              <span className={style.heroEyebrow}>
                PIXEL COLOR • CATÁLOGO DE CORES
              </span>

              <h1>
                Encontre a cor
                <em> perfeita.</em>
              </h1>

              <p>
                Explore nossa curadoria de tonalidades e descubra quais
                produtos estão realmente disponíveis no estoque para cada cor.
              </p>

              <button
                type="button"
                className={style.botaoVerCores}
                onClick={abrirLivro}
              >
                Explorar paleta
                <ArrowRight size={16} />
              </button>
            </div>

            <div className={style.capaLivro}>
              <div className={style.capaEsquerda}>
                <div className={style.logoLivro}>
                  <div className={style.logoMarca}>
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>

                  <div>
                    <strong>Pixel Color</strong>
                    <small>PALETA 2026</small>
                  </div>
                </div>

                <span className={style.numeroEdicao}>01 — 08</span>

                <h2>
                  Cores que
                  <br />
                  transformam.
                </h2>

                <p>
                  Uma seleção pensada para interiores, fachadas e projetos
                  que pedem personalidade.
                </p>

                <div className={style.coresMini}>
                  <span style={{ background: "#F4F1E8" }}></span>
                  <span style={{ background: "#D9A441" }}></span>
                  <span style={{ background: "#D71920" }}></span>
                  <span style={{ background: "#2855B5" }}></span>
                  <span style={{ background: "#5B8C51" }}></span>
                  <span style={{ background: "#9966CC" }}></span>
                </div>
              </div>

              <div className={style.capaDireita}>
                <span className={style.capaEtiqueta}>
                  CURADORIA PIXEL COLOR
                </span>

                <div className={style.circuloCapa}>
                  <Palette size={62} strokeWidth={1.25} />
                </div>

                <div className={style.capaDireitaRodape}>
                  <strong>
                    Escolha.
                    <br />
                    Compare.
                    <br />
                    Transforme.
                  </strong>

                  <span>
                    Clique em uma cor no livro para consultar
                    os produtos disponíveis no banco.
                  </span>
                </div>
              </div>
            </div>
          </section>
        </main>
      ) : (
        <main className={style.livroContainer}>
          <div className={style.livroTopo}>
            <div>
              <span>PIXEL COLOR • LIVRO DE CORES</span>
              <h1>
                Sua paleta,
                <em> seu projeto.</em>
              </h1>
            </div>

            <button
              type="button"
              className={style.fecharCatalogo}
              onClick={fecharLivro}
            >
              Fechar catálogo
              <X size={16} />
            </button>
          </div>

          <div className={style.livroAreaCentral}>
            <button
              type="button"
              className={`${style.seta} ${style.setaEsquerda}`}
              onClick={paginaAnterior}
              disabled={folhaAtual === 0 || animando}
              aria-label="Página anterior"
            >
              ‹
            </button>

            <div className={style.areaLivro}>
              <div className={style.livro}>
                <div className={style.paginasBase}>
                  {renderFolha(folhaAtual)}
                </div>

                {animando && (
                  <div
                    className={`
                      ${style.folhaVirando}
                      ${
                        direcao === "direita"
                          ? style.folhaDireita
                          : style.folhaEsquerda
                      }
                    `}
                  >
                    <div className={style.frenteFolha}>
                      <div className={style.folhaDupla}>
                        {renderFolha(folhaAnimada?.origem)}
                      </div>
                    </div>

                    <div className={style.versoFolha}>
                      <div className={style.folhaDupla}>
                        {renderFolha(folhaAnimada?.destino)}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className={style.indicadores}>
                {Array.from({
                  length: folhas.length + 1,
                }).map((_, index) => (
                  <button
                    type="button"
                    key={index}
                    className={
                      folhaAtual === index
                        ? style.indicadorAtivo
                        : ""
                    }
                    disabled={animando || folhaAtual === index}
                    onClick={() => {
                      if (index > folhaAtual) {
                        virarPagina(index, "direita");
                      } else if (index < folhaAtual) {
                        virarPagina(index, "esquerda");
                      }
                    }}
                    aria-label={`Ir para página ${index + 1}`}
                  />
                ))}
              </div>
            </div>

            <button
              type="button"
              className={`${style.seta} ${style.setaDireita}`}
              onClick={proximaPagina}
              disabled={folhaAtual === folhas.length || animando}
              aria-label="Próxima página"
            >
              ›
            </button>
          </div>

          <p className={style.dicaLivro}>
            Clique em qualquer amostra para consultar os produtos
            disponíveis nessa cor.
          </p>
        </main>
      )}

      <RoletaCores />

      {modalCorAberto && corSelecionada && (
        <div
          className={style.modalOverlay}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              fecharModalCor();
            }
          }}
        >
          <section className={style.modalCor}>
            <div className={style.modalTopo}>
              <div className={style.modalCorAmostra}>
                <span
                  style={{
                    backgroundColor: corSelecionada.cor,
                  }}
                ></span>

                <div>
                  <small>COR SELECIONADA</small>
                  <strong>{corSelecionada.nome}</strong>
                  <p>{corSelecionada.cor}</p>
                </div>
              </div>

              <button
                type="button"
                className={style.fecharModal}
                onClick={fecharModalCor}
                aria-label="Fechar modal"
              >
                <X />
              </button>
            </div>

            <div className={style.modalCabecalho}>
              <div>
                <span>DISPONIBILIDADE NO CATÁLOGO</span>

                <h2>
                  Produtos nesta
                  <em> tonalidade.</em>
                </h2>
              </div>

              {!carregandoProdutos && !erroProdutos && (
                <div className={style.contagemProdutos}>
                  <strong>{produtosCor.length}</strong>
                  <span>
                    {produtosCor.length === 1
                      ? "produto"
                      : "produtos"}
                  </span>
                </div>
              )}
            </div>

            <div className={style.modalConteudo}>
              {carregandoProdutos ? (
                <div className={style.estadoModal}>
                  <LoaderCircle
                    className={style.loader}
                    size={30}
                  />

                  <strong>Consultando estoque...</strong>

                  <p>
                    Estamos buscando os produtos cadastrados com
                    a cor {corSelecionada.nome}.
                  </p>
                </div>
              ) : erroProdutos ? (
                <div className={style.estadoModal}>
                  <Package size={30} />

                  <strong>Não foi possível carregar.</strong>

                  <p>{erroProdutos}</p>
                </div>
              ) : produtosCor.length === 0 ? (
                <div className={style.estadoModal}>
                  <ShoppingBag size={30} />

                  <strong>
                    Nenhum produto disponível nessa cor.
                  </strong>

                  <p>
                    A tonalidade existe na paleta, mas não há
                    produto ativo com estoque correspondente no momento.
                  </p>
                </div>
              ) : (
                <div className={style.produtosGrid}>
                  {produtosCor.map((produto) => (
                    <article
                      className={style.produtoCard}
                      key={produto.id}
                    >
                      <div className={style.produtoImagem}>
                        {produto?.marca && (
                          <span>{produto.marca}</span>
                        )}

                        <img
                          src={imagemProduto(produto)}
                          alt={produto.nome || "Produto"}
                          onError={(event) => {
                            event.currentTarget.src =
                              "/img/tinta.png";
                          }}
                        />
                      </div>

                      <div className={style.produtoInfo}>
                        <span className={style.disponivel}>
                          <CheckCircle2 size={12} />
                          Disponível
                        </span>

                        <h3>
                          {produto.nome || "Produto sem nome"}
                        </h3>

                        <div className={style.produtoMeta}>
                          {produto?.marca && (
                            <span>{produto.marca}</span>
                          )}

                          <span>
                            Estoque: {Number(produto.quantidade || 0)}
                          </span>
                        </div>

                        <strong className={style.precoProduto}>
                          {formatarPreco(produto.preco)}
                        </strong>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>

            <div className={style.modalRodape}>
              <p>
                Exibindo apenas produtos <strong>ativos</strong> e
                com <strong>estoque disponível</strong>.
              </p>

              <button
                type="button"
                onClick={() => navigate("/cliente/produtos")}
              >
                Ver catálogo completo
                <ArrowRight size={15} />
              </button>
            </div>
          </section>
        </div>
      )}
    </>
  );
}


/* =========================================================
   PÁGINA INICIAL DO LIVRO
========================================================= */

function PaginaInicial() {
  return (
    <div className={style.conteudoInicial}>
      <span className={style.numeroPagina}>01</span>

      <div className={style.logoPagina}>
        <div className={style.logoMarca}>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
        </div>

        <div>
          <strong>Pixel Color</strong>
          <small>CATÁLOGO</small>
        </div>
      </div>

      <h1>
        Paleta
        <br />
        de Cores.
      </h1>

      <p>
        Uma seleção de tonalidades para descobrir
        novas possibilidades para o seu ambiente.
      </p>

      <div className={style.amostrasInicio}>
        <span style={{ background: "#F2F0E9" }}></span>
        <span style={{ background: "#D71920" }}></span>
        <span style={{ background: "#FFD21F" }}></span>
        <span style={{ background: "#2855B5" }}></span>
        <span style={{ background: "#5B8C51" }}></span>
        <span style={{ background: "#9966CC" }}></span>
      </div>
    </div>
  );
}


function PaginaInicialDireita() {
  return (
    <div className={style.conteudoInicialDireita}>
      <span className={style.numeroPagina}>02</span>

      <span className={style.sectionLabel}>
        COMO USAR
      </span>

      <h2>
        Encontre sua
        <br />
        cor perfeita.
      </h2>

      <p>
        Navegue pelas categorias, escolha uma tonalidade
        e clique na amostra. O sistema consulta o banco e
        mostra os produtos disponíveis naquela cor.
      </p>

      <div className={style.passosLivro}>
        <div>
          <span>01</span>
          <p>Explore as categorias</p>
        </div>

        <div>
          <span>02</span>
          <p>Clique em uma cor</p>
        </div>

        <div>
          <span>03</span>
          <p>Veja os produtos disponíveis</p>
        </div>
      </div>
    </div>
  );
}


/* =========================================================
   PÁGINA DE CATEGORIA
========================================================= */

function PaginaCategoria({ categoria, onSelecionarCor }) {
  if (!categoria) {
    return (
      <div className={style.paginaVazia}>
        <span>Fim do catálogo</span>
      </div>
    );
  }

  return (
    <div className={style.conteudoCategoria}>
      <div className={style.manchaDecorativa}></div>

      <span className={style.sectionLabel}>
        PALETA PIXEL COLOR
      </span>

      <h2>{categoria.titulo}</h2>

      <p className={style.descricao}>
        {categoria.descricao}
      </p>

      <div className={style.linha}></div>

      <div className={style.gradeCores}>
        {categoria.cores.map((cor, index) => (
          <button
            type="button"
            className={style.corItem}
            key={`${categoria.titulo}-${cor.nome}-${index}`}
            onClick={() => onSelecionarCor(cor)}
            aria-label={`Ver produtos disponíveis na cor ${cor.nome}`}
          >
            <div
              className={style.amostraCor}
              style={{
                backgroundColor: cor.cor,
              }}
            >
              <span className={style.nomeHover}>
                Ver disponibilidade
              </span>
            </div>

            <span className={style.nomeCor}>
              {cor.nome}
            </span>
          </button>
        ))}
      </div>

      <div className={style.rodapePagina}>
        <span>Pixel Color</span>
        <span>{categoria.titulo}</span>
      </div>
    </div>
  );
}
