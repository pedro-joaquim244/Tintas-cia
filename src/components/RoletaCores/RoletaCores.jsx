import { useRef, useState } from "react";
import styles from "./RoletaCores.module.css";

const PALETAS = {
  coloridos: [
    {
      nome: "VERMELHOS",
      titulo: "Vermelhos",
      cores: ["#7a0c12", "#a9161e", "#d71920", "#ff9999"],
      descricao: "Tons intensos que trazem energia, coragem e personalidade ao ambiente.",
      sensacoes: ["Energia", "Paixão", "Presença"],
    },
    {
      nome: "LARANJAS",
      titulo: "Laranjas",
      cores: ["#9c360a", "#c85012", "#f47b20", "#ffd0ad"],
      descricao: "Cores acolhedoras que estimulam a criatividade e deixam os espaços mais vivos.",
      sensacoes: ["Criatividade", "Calor", "Alegria"],
    },
    {
      nome: "AMARELOS",
      titulo: "Amarelos",
      cores: ["#a08300", "#c2a800", "#e6c900", "#fff0a3"],
      descricao: "Uma família luminosa para ambientes otimistas, leves e cheios de vitalidade.",
      sensacoes: ["Luz", "Otimismo", "Vitalidade"],
    },
    {
      nome: "VERDES",
      titulo: "Verdes",
      cores: ["#245b36", "#3f824b", "#55a866", "#c2e6c8"],
      descricao: "Tons ligados à natureza que favorecem equilíbrio, frescor e tranquilidade.",
      sensacoes: ["Natureza", "Equilíbrio", "Renovação"],
    },
    {
      nome: "TURQUESAS",
      titulo: "Turquesas",
      cores: ["#126b68", "#198f8b", "#22b7b0", "#a9e8e4"],
      descricao: "Uma combinação refrescante para espaços modernos, leves e descontraídos.",
      sensacoes: ["Frescor", "Liberdade", "Leveza"],
    },
    {
      nome: "AZUIS",
      titulo: "Azuis",
      cores: ["#122b59", "#244c9b", "#3970cf", "#b4d2f4"],
      descricao: "Cores serenas que transmitem confiança, segurança e sofisticação.",
      sensacoes: ["Calma", "Confiança", "Segurança"],
    },
    {
      nome: "ROXOS",
      titulo: "Roxos",
      cores: ["#43235f", "#623989", "#8255b8", "#d7c0eb"],
      descricao: "Tons expressivos que despertam imaginação, mistério e sofisticação.",
      sensacoes: ["Imaginação", "Mistério", "Elegância"],
    },
    {
      nome: "ROSAS",
      titulo: "Rosas",
      cores: ["#87334f", "#b44b6c", "#d86b91", "#f5c8d5"],
      descricao: "Uma paleta delicada que comunica acolhimento, afeto e criatividade.",
      sensacoes: ["Afeto", "Delicadeza", "Acolhimento"],
    },
  ],
  neutros: [
    {
      nome: "BRANCOS",
      titulo: "Brancos",
      cores: ["#c9c3b3", "#ddd9cc", "#edeae1", "#ffffff"],
      descricao: "Tons versáteis que ampliam a luz e valorizam cada detalhe da composição.",
      sensacoes: ["Leveza", "Amplitude", "Simplicidade"],
    },
    {
      nome: "BEGES",
      titulo: "Beges",
      cores: ["#8d7658", "#a9906d", "#c9b18e", "#efe2c9"],
      descricao: "Cores naturais para criar espaços confortáveis, elegantes e atemporais.",
      sensacoes: ["Conforto", "Naturalidade", "Calma"],
    },
    {
      nome: "CINZAS",
      titulo: "Cinzas",
      cores: ["#3d4145", "#606468", "#888b8d", "#d9d9d5"],
      descricao: "Uma família contemporânea que combina equilíbrio, sobriedade e modernidade.",
      sensacoes: ["Equilíbrio", "Modernidade", "Sobriedade"],
    },
    {
      nome: "MARRONS",
      titulo: "Marrons",
      cores: ["#38231c", "#51352b", "#795548", "#c5a898"],
      descricao: "Tons terrosos que tornam o ambiente estável, envolvente e acolhedor.",
      sensacoes: ["Terra", "Estabilidade", "Aconchego"],
    },
  ],
};

function criarGradiente(grupos, camada) {
  const tamanhoFatia = 360 / grupos.length;
  const fatias = grupos.map((grupo, indice) => {
    const inicio = indice * tamanhoFatia;
    const fim = (indice + 1) * tamanhoFatia;

    return `${grupo.cores[camada]} ${inicio}deg ${fim}deg`;
  });

  return `conic-gradient(from ${-tamanhoFatia / 2}deg, ${fatias.join(", ")})`;
}

function normalizarIndice(indice, total) {
  return ((indice % total) + total) % total;
}

function normalizarAngulo(angulo) {
  return ((angulo % 360) + 360) % 360;
}

export default function RoletaCores() {
  const [tipo, setTipo] = useState("coloridos");
  const [indiceAtual, setIndiceAtual] = useState(0);
  const [rotacaoAcumulada, setRotacaoAcumulada] = useState(0);
  const [arrastando, setArrastando] = useState(false);
  const [deslocamentoArraste, setDeslocamentoArraste] = useState(0);
  const rotacaoRef = useRef(0);
  const arrasteRef = useRef({
    ativo: false,
    pointerId: null,
    ultimoAngulo: 0,
    deslocamento: 0,
    rotacaoInicial: 0,
  });
  const ignorarCliqueRef = useRef(false);

  const grupos = PALETAS[tipo];
  const grupoAtual = grupos[indiceAtual];
  const tamanhoFatia = 360 / grupos.length;
  const rotacaoVisual = rotacaoAcumulada + deslocamentoArraste;

  function aplicarRotacao(novaRotacao, gruposAlvo = grupos) {
    const tamanhoFatiaAlvo = 360 / gruposAlvo.length;
    const passos = Math.round(-novaRotacao / tamanhoFatiaAlvo);

    rotacaoRef.current = novaRotacao;
    setRotacaoAcumulada(novaRotacao);
    setIndiceAtual(normalizarIndice(passos, gruposAlvo.length));
  }

  function selecionarTipo(novoTipo) {
    const novosGrupos = PALETAS[novoTipo];
    const novaFatia = 360 / novosGrupos.length;
    const rotacaoAjustada = (
      Math.round(rotacaoRef.current / novaFatia) * novaFatia
    );

    setTipo(novoTipo);
    setDeslocamentoArraste(0);
    aplicarRotacao(rotacaoAjustada, novosGrupos);
  }

  function navegar(deslocamento) {
    aplicarRotacao(
      rotacaoRef.current - deslocamento * tamanhoFatia
    );
  }

  function selecionarFatia(event) {
    if (ignorarCliqueRef.current) {
      ignorarCliqueRef.current = false;
      return;
    }

    const limites = event.currentTarget.getBoundingClientRect();
    const centroX = limites.left + limites.width / 2;
    const centroY = limites.top + limites.height / 2;
    const deslocamentoX = event.clientX - centroX;
    const deslocamentoY = event.clientY - centroY;
    const anguloTela = (
      Math.atan2(deslocamentoX, -deslocamentoY) * 180 / Math.PI + 360
    ) % 360;
    const anguloOriginal = normalizarAngulo(
      anguloTela - rotacaoRef.current
    );
    const indice = Math.floor(
      ((anguloOriginal + tamanhoFatia / 2) % 360) / tamanhoFatia
    );
    let distancia = indice - indiceAtual;

    if (distancia > grupos.length / 2) {
      distancia -= grupos.length;
    } else if (distancia < -(grupos.length / 2)) {
      distancia += grupos.length;
    }

    aplicarRotacao(
      rotacaoRef.current - distancia * tamanhoFatia
    );
  }

  function obterAnguloDoCursor(event, elemento) {
    const limites = elemento.getBoundingClientRect();
    const centroX = limites.left + limites.width / 2;
    const centroY = limites.top + limites.height / 2;

    return (
      Math.atan2(
        event.clientX - centroX,
        -(event.clientY - centroY)
      ) * 180 / Math.PI + 360
    ) % 360;
  }

  function iniciarArraste(event) {
    if (!event.isPrimary || event.button !== 0) {
      return;
    }

    const angulo = obterAnguloDoCursor(event, event.currentTarget);

    arrasteRef.current = {
      ativo: true,
      pointerId: event.pointerId,
      ultimoAngulo: angulo,
      deslocamento: 0,
      rotacaoInicial: rotacaoRef.current,
    };
    ignorarCliqueRef.current = false;
    setDeslocamentoArraste(0);
    setArrastando(true);
    event.currentTarget.setPointerCapture(event.pointerId);
    event.preventDefault();
  }

  function moverRoleta(event) {
    const arraste = arrasteRef.current;

    if (!arraste.ativo || arraste.pointerId !== event.pointerId) {
      return;
    }

    const angulo = obterAnguloDoCursor(event, event.currentTarget);
    const diferenca = (
      (angulo - arraste.ultimoAngulo + 540) % 360
    ) - 180;

    arraste.ultimoAngulo = angulo;
    arraste.deslocamento += diferenca;

    if (Math.abs(arraste.deslocamento) > 3) {
      ignorarCliqueRef.current = true;
    }

    setDeslocamentoArraste(arraste.deslocamento);
    event.preventDefault();
  }

  function finalizarArraste(event, cancelado = false) {
    const arraste = arrasteRef.current;

    if (!arraste.ativo || arraste.pointerId !== event.pointerId) {
      return;
    }

    arraste.ativo = false;

    if (!cancelado) {
      const rotacaoAoSoltar = (
        arraste.rotacaoInicial + arraste.deslocamento
      );
      const rotacaoAjustada = (
        Math.round(rotacaoAoSoltar / tamanhoFatia) * tamanhoFatia
      );

      aplicarRotacao(rotacaoAjustada);
    }

    setDeslocamentoArraste(0);
    setArrastando(false);

    if (cancelado) {
      ignorarCliqueRef.current = false;
    } else if (ignorarCliqueRef.current) {
      setTimeout(() => {
        ignorarCliqueRef.current = false;
      }, 0);
    }

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  function controlarTeclado(event) {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      navegar(1);
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      navegar(-1);
    }
  }

  return (
    <section
      className={styles.secao}
      aria-labelledby="titulo-roleta-cores"
      tabIndex={0}
      onKeyDown={controlarTeclado}
    >
      <header className={styles.cabecalho}>
        <span className={styles.eyebrow}>
          PIXEL COLOR • GUIA CROMÁTICO
        </span>
        <h2 id="titulo-roleta-cores">
          Gire a paleta.
          <em> Encontre sua atmosfera.</em>
        </h2>
        <p>
          Arraste a roleta ou use as setas para explorar as sensações de
          cada família de tons.
        </p>
      </header>

      <div className={styles.abas} aria-label="Tipo de paleta">
        <button
          type="button"
          className={tipo === "coloridos" ? styles.abaAtiva : ""}
          aria-pressed={tipo === "coloridos"}
          onClick={() => selecionarTipo("coloridos")}
        >
          Coloridos
        </button>
        <button
          type="button"
          className={tipo === "neutros" ? styles.abaAtiva : ""}
          aria-pressed={tipo === "neutros"}
          onClick={() => selecionarTipo("neutros")}
        >
          Neutros
        </button>
      </div>

      <div className={styles.navegacaoGrupo}>
        <button
          type="button"
          aria-label="Família de cores anterior"
          onClick={() => navegar(-1)}
        >
          ‹
        </button>
        <strong aria-live="polite">{grupoAtual.nome}</strong>
        <button
          type="button"
          aria-label="Próxima família de cores"
          onClick={() => navegar(1)}
        >
          ›
        </button>
      </div>

      <div className={styles.areaRoleta}>
        <div className={styles.recorteRoleta}>
          <div className={styles.ponteiro} aria-hidden="true" />
          <div
            className={`${styles.roda} ${
              arrastando ? styles.rodaArrastando : ""
            }`}
            style={{
              transform: `translateX(-50%) rotate(${rotacaoVisual}deg)`,
            }}
            role="slider"
            aria-label="Roleta de famílias de cores"
            aria-valuemin="1"
            aria-valuemax={grupos.length}
            aria-valuenow={indiceAtual + 1}
            aria-valuetext={grupoAtual.nome}
            aria-roledescription="roleta arrastável"
            onClick={selecionarFatia}
            onPointerDown={iniciarArraste}
            onPointerMove={moverRoleta}
            onPointerUp={(event) => finalizarArraste(event)}
            onPointerCancel={(event) => finalizarArraste(event, true)}
          >
            {[0, 1, 2, 3].map((camada) => (
              <div
                key={camada}
                className={`${styles.camada} ${styles[`camada${camada + 1}`]}`}
                style={{ background: criarGradiente(grupos, camada) }}
              />
            ))}
          </div>
          <div className={styles.miolo} aria-hidden="true" />
        </div>
      </div>

      <div className={styles.informacoes} key={`${tipo}-${grupoAtual.nome}`}>
        <span className={styles.rotulo}>ESTA PALETA REMETE A</span>
        <h3>{grupoAtual.titulo}</h3>
        <p>{grupoAtual.descricao}</p>

        <div className={styles.sensacoes}>
          {grupoAtual.sensacoes.map((sensacao) => (
            <span key={sensacao}>{sensacao}</span>
          ))}
        </div>

        <div className={styles.paleta} aria-label={`Paleta ${grupoAtual.titulo}`}>
          {grupoAtual.cores.map((cor) => (
            <span key={cor} style={{ backgroundColor: cor }} title={cor} />
          ))}
        </div>
      </div>
    </section>
  );
}
