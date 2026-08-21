
import { useState } from "react";
import style from "../styles/Livro.module.css";
import Cabecalho from "../components/Cabeçalho-Users/index.jsx";

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
  const [livroAberto, setLivroAberto] = useState(false);

  // 0 = capa
  // 1 = primeira folha de cores
  // 2 = segunda folha...
  const [folhaAtual, setFolhaAtual] = useState(0);

  const [animando, setAnimando] = useState(false);
  const [direcao, setDirecao] = useState("direita");
  const [folhaAnimada, setFolhaAnimada] = useState(null);

  const folhas = [];

  for (let i = 0; i < categorias.length; i += 2) {
    folhas.push({
      esquerda: categorias[i],
      direita: categorias[i + 1] || null
    });
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
      destino: novaPagina
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
          <PaginaCategoria categoria={folha?.esquerda} />
        </div>

        <div className={style.paginaDireita}>
          <PaginaCategoria categoria={folha?.direita} />
        </div>
      </>
    );
  }

  return (
    <>
      <Cabecalho />

      {!livroAberto ? (
        <main className={style.capaContainer}>

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
                  <strong>Cores & Cia</strong>
                  <small>TINTAS</small>
                </div>
              </div>

              <h1>
                Paleta
                <br />
                de Cores.
              </h1>

              <p>
                Explore nossa paleta de cores
                <br />
                e encontre o tom perfeito para
                <br />
                o seu projeto!
              </p>

              <div className={style.latas}>
                <div className={`${style.lata} ${style.azul}`}>
                  <div className={style.tinta}></div>
                </div>

                <div className={`${style.lata} ${style.amarela}`}>
                  <div className={style.tinta}></div>
                </div>

                <div className={`${style.lata} ${style.vermelha}`}>
                  <div className={style.tinta}></div>
                </div>
              </div>

            </div>

            <div className={style.capaDireita}>

              <div className={style.pincelada}></div>

              <div className={style.miniLogo}>
                <div className={style.logoMarca}>
                  <span></span>
                  <span></span>
                  <span></span>
                  <span></span>
                </div>

                <strong>Cores & Cia</strong>
              </div>

              <h2>
                Descubra novas cores.
              </h2>

              <p>
                Encontre a combinação perfeita para
                transformar seus ambientes.
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

          </div>

          <button
            className={style.botaoVerCores}
            onClick={abrirLivro}
          >
            Ver Todas as Cores
          </button>

        </main>
      ) : (

        <main className={style.livroContainer}>

          <button
            className={`${style.seta} ${style.setaEsquerda}`}
            onClick={paginaAnterior}
            disabled={folhaAtual === 0 || animando}
          >
            ‹
          </button>

          <div className={style.areaLivro}>

            <button
              className={style.fecharLivro}
              onClick={fecharLivro}
            >
              ×
            </button>

            <div className={style.livro}>

              {/* =====================================
                  FOLHA ANTERIOR / PARTE FIXA
              ===================================== */}

              <div className={style.paginasBase}>
                {renderFolha(folhaAtual)}

              </div>


              {/* =====================================
                  FOLHA QUE VIRA
              ===================================== */}

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

          </div>

          <button
            className={`${style.seta} ${style.setaDireita}`}
            onClick={proximaPagina}
            disabled={
              folhaAtual === folhas.length || animando
            }
          >
            ›
          </button>


          <div className={style.indicadores}>

            {Array.from({
              length: folhas.length + 1
            }).map((_, index) => (

              <button
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
              />

            ))}

          </div>

        </main>
      )}
    </>
  );
}


/* ==================================================
   COMPONENTE — PÁGINA INICIAL
================================================== */

function PaginaInicial() {
  return (
    <div className={style.conteudoInicial}>

      <div className={style.logoPagina}>

        <div className={style.logoMarca}>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
        </div>

        <div>
          <strong>Cores & Cia</strong>
          <small>TINTAS</small>
        </div>

      </div>

      <h1>
        Paleta
        <br />
        de Cores.
      </h1>

      <p>
        Explore nossa seleção de cores e encontre
        o tom perfeito para transformar seu ambiente.
      </p>

      <div className={style.latasPagina}>

        <div className={`${style.lata} ${style.azul}`}>
          <div className={style.tinta}></div>
        </div>

        <div className={`${style.lata} ${style.vermelha}`}>
          <div className={style.tinta}></div>
        </div>

        <div className={`${style.lata} ${style.amarela}`}>
          <div className={style.tinta}></div>
        </div>

      </div>

    </div>
  );
}


/* ==================================================
   PÁGINA INICIAL DIREITA
================================================== */

function PaginaInicialDireita() {
  return (
    <div className={style.conteudoInicialDireita}>

      <span className={style.numeroPagina}>
        01
      </span>

      <h2>
        Encontre sua
        <br />
        cor perfeita.
      </h2>

      <p>
        Navegue pelo nosso catálogo e descubra
        diferentes tonalidades para cada estilo
        de ambiente.
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


/* ==================================================
   PÁGINA DE CATEGORIA
================================================== */

function PaginaCategoria({ categoria }) {

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

      <h2>
        {categoria.titulo}
      </h2>

      <p className={style.descricao}>
        {categoria.descricao}
      </p>

      <div className={style.linha}></div>

      <div className={style.gradeCores}>

        {categoria.cores.map((cor, index) => (

          <div
            className={style.corItem}
            key={index}
          >

            <div
              className={style.amostraCor}
              style={{
                backgroundColor: cor.cor
              }}
            >

              <span className={style.nomeHover}>
                {cor.nome}
              </span>

            </div>

            <span className={style.nomeCor}>
              {cor.nome}
            </span>

          </div>

        ))}

      </div>

      <div className={style.rodapePagina}>
        <span>
          Cores & Cia — Tintas
        </span>

        <span>
          Catálogo de Cores
        </span>
      </div>

    </div>
  );
}