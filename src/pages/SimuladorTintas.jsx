

import { useRef, useState, useEffect } from "react";

import {
  Upload,
  Sparkles,
  PaintBucket,
  Check,
  RotateCcw,
  Eye,
  Download,
  X,
  MousePointer2,
  Palette,
  SlidersHorizontal,
  Image as ImageIcon,
  Trash2,
  CheckCircle2,
  MousePointerClick,
} from "lucide-react";

import style from "../styles/SimuladorTintas.module.css";
import HeaderUser from "../components/Cabeçalho-Users/index.jsx";


/* =========================================================
   PALETA
========================================================= */

const CORES = [
  {
    nome: "Azul Oceano",
    cor: "#2563eb",
    descricao: "Moderno, elegante e sofisticado.",
  },
  {
    nome: "Azul Serenity",
    cor: "#7aa7d9",
    descricao: "Leve, tranquilo e perfeito para relaxar.",
  },
  {
    nome: "Verde Nature",
    cor: "#5c9b68",
    descricao: "Natural, fresco e aconchegante.",
  },
  {
    nome: "Verde Oliva",
    cor: "#718355",
    descricao: "Elegante e natural.",
  },
  {
    nome: "Areia Premium",
    cor: "#d6b98c",
    descricao: "Quente, sofisticado e aconchegante.",
  },
  {
    nome: "Bege Conforto",
    cor: "#cdbb9b",
    descricao: "Neutro e acolhedor.",
  },
  {
    nome: "Cinza Urban",
    cor: "#6b7280",
    descricao: "Minimalista e contemporâneo.",
  },
  {
    nome: "Cinza Pérola",
    cor: "#a7adb5",
    descricao: "Discreto e versátil.",
  },
  {
    nome: "Terracota",
    cor: "#b85c45",
    descricao: "Quente e marcante.",
  },
  {
    nome: "Rosa Suave",
    cor: "#d89aa4",
    descricao: "Delicado e sofisticado.",
  },
  {
    nome: "Amarelo Solar",
    cor: "#eabf3f",
    descricao: "Alegre e iluminado.",
  },
  {
    nome: "Branco Neve",
    cor: "#f4f3ee",
    descricao: "Clássico e atemporal.",
  },
];

/* =========================================================
   COMPONENTE
========================================================= */

export default function SimuladorTinta() {
  /* =======================================================
     REFS
  ======================================================= */

  const canvasRef = useRef(null);

  const selectionCanvasRef = useRef(null);

  const originalCanvasRef = useRef(null);

  const originalImageDataRef = useRef(null);

  const imagemRef = useRef(null);

  /* =======================================================
     ESTADOS
  ======================================================= */

  const [imagem, setImagem] = useState(null);

  const [corSelecionada, setCorSelecionada] = useState(
    CORES[0]
  );

  const [tolerancia, setTolerancia] = useState(30);

  const [intensidade, setIntensidade] = useState(82);

  const [paredeSelecionada, setParedeSelecionada] =
    useState(false);

  const [modalAberto, setModalAberto] = useState(false);

  const [processando, setProcessando] = useState(false);

  const [mensagem, setMensagem] = useState(
    "Envie uma foto e marque os 4 cantos da parede."
  );

  const [imagemOriginalModal, setImagemOriginalModal] =
    useState(null);

  const [imagemResultadoModal, setImagemResultadoModal] =
    useState(null);

  /*
   * Pontos da seleção.
   *
   * Ordem:
   *
   * 1 = superior esquerdo
   * 2 = superior direito
   * 3 = inferior direito
   * 4 = inferior esquerdo
   */

  const [pontosSelecao, setPontosSelecao] = useState([]);

  /*
   * Quando true, os quatro pontos
   * foram confirmados.
   */

  const [areaConfirmada, setAreaConfirmada] =
    useState(false);

  /*
   * Índice do ponto que está sendo arrastado.
   */

  const [pontoArrastando, setPontoArrastando] =
    useState(null);

  /*
   * Guarda se o usuário realmente arrastou
   * um ponto.
   *
   * Isso evita que o mouseup gere um clique
   * acidental.
   */

  const arrastouRef = useRef(false);

  /* =======================================================
     REDESENHAR SELEÇÃO
  ======================================================= */

  useEffect(() => {
    desenharSelecao();
  }, [pontosSelecao, areaConfirmada, imagem]);

  /* =======================================================
     CARREGAR IMAGEM
  ======================================================= */

  function carregarImagem(evento) {
    const arquivo = evento.target.files?.[0];

    if (!arquivo) return;

    if (!arquivo.type.startsWith("image/")) {
      setMensagem("Escolha uma imagem válida.");
      return;
    }

    const url = URL.createObjectURL(arquivo);

    setImagem(url);

    setParedeSelecionada(false);

    setAreaConfirmada(false);

    setPontosSelecao([]);

    setPontoArrastando(null);

    setModalAberto(false);

    setImagemOriginalModal(null);

    setImagemResultadoModal(null);

    setMensagem(
      "Clique nos 4 cantos da parede para criar a seleção."
    );

    const img = new Image();

    img.onload = () => {
      imagemRef.current = img;

      prepararCanvas(img);

      URL.revokeObjectURL(url);
    };

    img.src = url;
  }

  /* =======================================================
     PREPARAR CANVAS
  ======================================================= */

  function prepararCanvas(img) {
    const canvas = canvasRef.current;

    const selectionCanvas =
      selectionCanvasRef.current;

    const originalCanvas =
      originalCanvasRef.current;

    if (
      !canvas ||
      !selectionCanvas ||
      !originalCanvas
    ) {
      return;
    }

    const MAX_WIDTH = 1100;

    const MAX_HEIGHT = 700;

    let largura = img.naturalWidth;

    let altura = img.naturalHeight;

    const escala = Math.min(
      MAX_WIDTH / largura,
      MAX_HEIGHT / altura,
      1
    );

    largura = Math.round(largura * escala);

    altura = Math.round(altura * escala);

    /* =====================================================
       CANVAS PRINCIPAL
    ===================================================== */

    canvas.width = largura;

    canvas.height = altura;

    /* =====================================================
       CANVAS DA SELEÇÃO
    ===================================================== */

    selectionCanvas.width = largura;

    selectionCanvas.height = altura;

    /* =====================================================
       CANVAS ORIGINAL
    ===================================================== */

    originalCanvas.width = largura;

    originalCanvas.height = altura;

    const ctx = canvas.getContext("2d", {
      willReadFrequently: true,
    });

    const selectionCtx =
      selectionCanvas.getContext("2d");

    const originalCtx =
      originalCanvas.getContext("2d", {
        willReadFrequently: true,
      });

    ctx.clearRect(
      0,
      0,
      largura,
      altura
    );

    selectionCtx.clearRect(
      0,
      0,
      largura,
      altura
    );

    originalCtx.clearRect(
      0,
      0,
      largura,
      altura
    );

    /* =====================================================
       DESENHA FOTO
    ===================================================== */

    ctx.drawImage(
      img,
      0,
      0,
      largura,
      altura
    );

    originalCtx.drawImage(
      img,
      0,
      0,
      largura,
      altura
    );

    /* =====================================================
       GUARDA IMAGEM ORIGINAL
    ===================================================== */

    const originalData =
      originalCtx.getImageData(
        0,
        0,
        largura,
        altura
      );

    originalImageDataRef.current =
      new ImageData(
        new Uint8ClampedArray(
          originalData.data
        ),
        largura,
        altura
      );

    setPontosSelecao([]);

    setAreaConfirmada(false);

    setParedeSelecionada(false);

    setPontoArrastando(null);
  }

  /* =======================================================
     DESENHAR SELEÇÃO
  ======================================================= */

  function desenharSelecao() {
    const canvas =
      selectionCanvasRef.current;

    if (!canvas) return;

    const ctx =
      canvas.getContext("2d");

    ctx.clearRect(
      0,
      0,
      canvas.width,
      canvas.height
    );

    if (pontosSelecao.length === 0) {
      return;
    }

    /* =====================================================
       ÁREA DO QUADRILÁTERO
    ===================================================== */

    if (pontosSelecao.length >= 3) {
      ctx.beginPath();

      ctx.moveTo(
        pontosSelecao[0].x,
        pontosSelecao[0].y
      );

      for (
        let i = 1;
        i < pontosSelecao.length;
        i++
      ) {
        ctx.lineTo(
          pontosSelecao[i].x,
          pontosSelecao[i].y
        );
      }

      if (pontosSelecao.length === 4) {
        ctx.closePath();

        ctx.fillStyle = areaConfirmada
          ? "rgba(34, 197, 94, 0.15)"
          : "rgba(37, 99, 235, 0.18)";

        ctx.fill();
      }
    }

    /* =====================================================
       LINHAS
    ===================================================== */

    if (pontosSelecao.length >= 2) {
      ctx.beginPath();

      ctx.moveTo(
        pontosSelecao[0].x,
        pontosSelecao[0].y
      );

      for (
        let i = 1;
        i < pontosSelecao.length;
        i++
      ) {
        ctx.lineTo(
          pontosSelecao[i].x,
          pontosSelecao[i].y
        );
      }

      if (pontosSelecao.length === 4) {
        ctx.closePath();
      }

      ctx.lineWidth = 3;

      ctx.strokeStyle = areaConfirmada
        ? "#22c55e"
        : "#2563eb";

      ctx.setLineDash(
        areaConfirmada
          ? []
          : [8, 5]
      );

      ctx.lineCap = "round";

      ctx.lineJoin = "round";

      ctx.stroke();

      ctx.setLineDash([]);
    }

    /* =====================================================
       PONTOS
    ===================================================== */

    pontosSelecao.forEach(
      (ponto, indice) => {
        ctx.beginPath();

        ctx.arc(
          ponto.x,
          ponto.y,
          11,
          0,
          Math.PI * 2
        );

        ctx.fillStyle = areaConfirmada
          ? "#22c55e"
          : "#2563eb";

        ctx.fill();

        ctx.lineWidth = 3;

        ctx.strokeStyle = "#ffffff";

        ctx.stroke();

        /* Número */

        ctx.fillStyle = "#ffffff";

        ctx.font =
          "bold 11px Poppins, Arial";

        ctx.textAlign = "center";

        ctx.textBaseline = "middle";

        ctx.fillText(
          String(indice + 1),
          ponto.x,
          ponto.y
        );
      }
    );
  }

  /* =======================================================
     OBTER COORDENADAS
  ======================================================= */

  function obterCoordenadas(evento) {
    const canvas =
      selectionCanvasRef.current;

    if (!canvas) return null;

    const rect =
      canvas.getBoundingClientRect();

    if (
      rect.width === 0 ||
      rect.height === 0
    ) {
      return null;
    }

    const escalaX =
      canvas.width / rect.width;

    const escalaY =
      canvas.height / rect.height;

    let x =
      (evento.clientX - rect.left) *
      escalaX;

    let y =
      (evento.clientY - rect.top) *
      escalaY;

    /*
     * Impede que o ponto saia do canvas.
     */

    x = Math.max(
      0,
      Math.min(canvas.width, x)
    );

    y = Math.max(
      0,
      Math.min(canvas.height, y)
    );

    return {
      x,
      y,
    };
  }

  /* =======================================================
     DISTÂNCIA
  ======================================================= */

  function distanciaPontos(
    x1,
    y1,
    x2,
    y2
  ) {
    return Math.sqrt(
      Math.pow(x1 - x2, 2) +
      Math.pow(y1 - y2, 2)
    );
  }

  /* =======================================================
     ENCONTRAR PONTO
  ======================================================= */

  function encontrarPonto(
    x,
    y
  ) {
    const distanciaMaxima = 30;

    for (
      let i = 0;
      i < pontosSelecao.length;
      i++
    ) {
      const ponto =
        pontosSelecao[i];

      const distancia =
        distanciaPontos(
          x,
          y,
          ponto.x,
          ponto.y
        );

      if (
        distancia <=
        distanciaMaxima
      ) {
        return i;
      }
    }

    return -1;
  }

  /* =======================================================
     MOUSE DOWN
  ======================================================= */

  function iniciarInteracao(evento) {
    if (processando) return;

    const coordenadas =
      obterCoordenadas(evento);

    if (!coordenadas) return;

    arrastouRef.current = false;

    /*
     * Depois de confirmar, não permite
     * mexer nos pontos.
     */

    if (areaConfirmada) {
      return;
    }

    /*
     * Primeiro verifica se clicou em
     * um ponto existente.
     */

    const indice =
      encontrarPonto(
        coordenadas.x,
        coordenadas.y
      );

    if (indice !== -1) {
      setPontoArrastando(indice);
      return;
    }

    /*
     * Se já existem 4 pontos,
     * não cria outro.
     */

    if (pontosSelecao.length >= 4) {
      return;
    }

    /*
     * Cria novo ponto.
     */

    const novosPontos = [
      ...pontosSelecao,
      coordenadas,
    ];

    setPontosSelecao(novosPontos);

    /* Mensagens */

    if (novosPontos.length === 1) {
      setMensagem(
        "1º canto marcado. Clique no canto superior direito."
      );
    }

    if (novosPontos.length === 2) {
      setMensagem(
        "2 cantos marcados. Clique no canto inferior direito."
      );
    }

    if (novosPontos.length === 3) {
      setMensagem(
        "3 cantos marcados. Clique no último canto da parede."
      );
    }

    if (novosPontos.length === 4) {
      setMensagem(
        "Os 4 cantos foram marcados. Ajuste os pontos se necessário e confirme a área."
      );
    }
  }

  /* =======================================================
     MOUSE MOVE
  ======================================================= */

  function moverPonto(evento) {
    if (
      pontoArrastando === null ||
      areaConfirmada ||
      processando
    ) {
      return;
    }

    const coordenadas =
      obterCoordenadas(evento);

    if (!coordenadas) return;

    arrastouRef.current = true;

    setPontosSelecao(
      (pontosAtuais) => {
        const novosPontos =
          [...pontosAtuais];

        if (
          novosPontos[
          pontoArrastando
          ]
        ) {
          novosPontos[
            pontoArrastando
          ] = coordenadas;
        }

        return novosPontos;
      }
    );
  }

  /* =======================================================
     FINALIZAR ARRASTE
  ======================================================= */

  function finalizarArraste() {
    if (
      pontoArrastando !== null
    ) {
      setPontoArrastando(null);

      if (arrastouRef.current) {
        setMensagem(
          "Ponto ajustado. Confira a área e confirme a seleção."
        );
      }
    }
  }

  /* =======================================================
     PONTO DENTRO DO POLÍGONO
  ======================================================= */

  function pontoDentroPoligono(
    x,
    y,
    pontos
  ) {
    if (pontos.length < 3) {
      return false;
    }

    let dentro = false;

    for (
      let i = 0,
      j = pontos.length - 1;
      i < pontos.length;
      j = i++
    ) {
      const xi =
        pontos[i].x;

      const yi =
        pontos[i].y;

      const xj =
        pontos[j].x;

      const yj =
        pontos[j].y;

      const intersecta =
        yi > y !== yj > y &&
        x <
        ((xj - xi) *
          (y - yi)) /
        (yj - yi) +
        xi;

      if (intersecta) {
        dentro = !dentro;
      }
    }

    return dentro;
  }

  /* =======================================================
     LIMPAR SELEÇÃO
  ======================================================= */

  function limparSelecao() {
    setPontosSelecao([]);

    setAreaConfirmada(false);

    setParedeSelecionada(false);

    setPontoArrastando(null);

    restaurarImagem();

    setMensagem(
      "Seleção limpa. Clique nos 4 cantos da parede."
    );
  }

  /* =======================================================
     CONFIRMAR ÁREA
  ======================================================= */

  function confirmarArea() {
    if (
      pontosSelecao.length !== 4
    ) {
      setMensagem(
        "Você precisa marcar exatamente 4 cantos."
      );

      return;
    }

    /*
     * Confirma o quadrilátero.
     */

    setAreaConfirmada(true);

    setParedeSelecionada(false);

    setMensagem(
      "Área confirmada! Escolha uma cor e clique em Aplicar para pintar automaticamente."
    );
  }

  /* =======================================================
     DISTÂNCIA RGB
  ======================================================= */

  function distanciaRGB(
    r1,
    g1,
    b1,
    r2,
    g2,
    b2
  ) {
    return Math.sqrt(
      Math.pow(r1 - r2, 2) +
      Math.pow(g1 - g2, 2) +
      Math.pow(b1 - b2, 2)
    );
  }

  /* =======================================================
     LUMINOSIDADE
  ======================================================= */

  function luminosidade(
    r,
    g,
    b
  ) {
    return (
      0.2126 * r +
      0.7152 * g +
      0.0722 * b
    );
  }

  /* =======================================================
     HEX → RGB
  ======================================================= */

  function hexParaRGB(hex) {
    const valor =
      hex.replace("#", "");

    return {
      r: parseInt(
        valor.substring(0, 2),
        16
      ),

      g: parseInt(
        valor.substring(2, 4),
        16
      ),

      b: parseInt(
        valor.substring(4, 6),
        16
      ),
    };
  }

  /* =======================================================
     AMOSTRA
  ======================================================= */

  function obterAmostra(
    data,
    largura,
    altura,
    x,
    y
  ) {
    const raio = 8;

    let somaR = 0;

    let somaG = 0;

    let somaB = 0;

    let quantidade = 0;

    for (
      let yy = y - raio;
      yy <= y + raio;
      yy++
    ) {
      for (
        let xx = x - raio;
        xx <= x + raio;
        xx++
      ) {
        if (
          xx < 0 ||
          yy < 0 ||
          xx >= largura ||
          yy >= altura
        ) {
          continue;
        }

        if (
          !pontoDentroPoligono(
            xx,
            yy,
            pontosSelecao
          )
        ) {
          continue;
        }

        const indice =
          (yy * largura + xx) *
          4;

        somaR += data[indice];

        somaG +=
          data[indice + 1];

        somaB +=
          data[indice + 2];

        quantidade++;
      }
    }

    if (quantidade === 0) {
      const indice =
        (y * largura + x) * 4;

      return {
        r: data[indice],
        g: data[indice + 1],
        b: data[indice + 2],
      };
    }

    return {
      r: somaR / quantidade,
      g: somaG / quantidade,
      b: somaB / quantidade,
    };
  }

  /* =======================================================
     APLICAR TINTA
  ======================================================= */

  function aplicarTintaAutomatica() {
    const canvas = canvasRef.current;
    const original = originalImageDataRef.current;

    if (!canvas || !original) return;

    if (pontosSelecao.length !== 4 || !areaConfirmada) {
      setMensagem(
        "Marque os 4 cantos e confirme a área antes de aplicar."
      );
      return;
    }

    setProcessando(true);
    setMensagem(
      `Aplicando ${corSelecionada.nome} automaticamente na área selecionada...`
    );

    setTimeout(() => {
      const largura = canvas.width;
      const altura = canvas.height;
      const pixels = original.data;

      const resultado = new ImageData(
        new Uint8ClampedArray(pixels),
        largura,
        altura
      );

      const dados = resultado.data;
      const tinta = hexParaRGB(corSelecionada.cor);

      const menorX = Math.max(
        0,
        Math.floor(Math.min(...pontosSelecao.map((ponto) => ponto.x)))
      );

      const maiorX = Math.min(
        largura - 1,
        Math.ceil(Math.max(...pontosSelecao.map((ponto) => ponto.x)))
      );

      const menorY = Math.max(
        0,
        Math.floor(Math.min(...pontosSelecao.map((ponto) => ponto.y)))
      );

      const maiorY = Math.min(
        altura - 1,
        Math.ceil(Math.max(...pontosSelecao.map((ponto) => ponto.y)))
      );

      const centroX = pontosSelecao.reduce(
        (soma, ponto) => soma + ponto.x,
        0
      ) / pontosSelecao.length;

      const centroY = pontosSelecao.reduce(
        (soma, ponto) => soma + ponto.y,
        0
      ) / pontosSelecao.length;

      const amostras = [];

      const possiveisAmostras = [
        { x: centroX, y: centroY },
        {
          x: (pontosSelecao[0].x + pontosSelecao[1].x + pontosSelecao[2].x) / 3,
          y: (pontosSelecao[0].y + pontosSelecao[1].y + pontosSelecao[2].y) / 3,
        },
        {
          x: (pontosSelecao[0].x + pontosSelecao[2].x + pontosSelecao[3].x) / 3,
          y: (pontosSelecao[0].y + pontosSelecao[2].y + pontosSelecao[3].y) / 3,
        },
      ];

      possiveisAmostras.forEach((ponto) => {
        if (pontoDentroPoligono(ponto.x, ponto.y, pontosSelecao)) {
          amostras.push(
            obterAmostra(
              pixels,
              largura,
              altura,
              Math.floor(ponto.x),
              Math.floor(ponto.y)
            )
          );
        }
      });

      if (amostras.length === 0) {
        amostras.push(
          obterAmostra(
            pixels,
            largura,
            altura,
            Math.floor(centroX),
            Math.floor(centroY)
          )
        );
      }

      const amostra = {
        r: amostras.reduce((soma, item) => soma + item.r, 0) / amostras.length,
        g: amostras.reduce((soma, item) => soma + item.g, 0) / amostras.length,
        b: amostras.reduce((soma, item) => soma + item.b, 0) / amostras.length,
      };

      const luzParede = luminosidade(amostra.r, amostra.g, amostra.b);

      const toleranciaCor = Math.max(12, tolerancia * 1.55);
      const toleranciaLuz = Math.max(18, tolerancia * 1.8);

      for (let py = menorY; py <= maiorY; py++) {
        for (let px = menorX; px <= maiorX; px++) {
          if (!pontoDentroPoligono(px, py, pontosSelecao)) continue;

          const indice = (py * largura + px) * 4;

          const r = pixels[indice];
          const g = pixels[indice + 1];
          const b = pixels[indice + 2];

          const distancia = distanciaRGB(
            r,
            g,
            b,
            amostra.r,
            amostra.g,
            amostra.b
          );

          const luzPixel = luminosidade(r, g, b);
          const diferencaLuz = Math.abs(luzPixel - luzParede);

          /*
           * A seleção dos 4 pontos é a máscara principal.
           * A tolerância apenas evita pintar objetos muito diferentes
           * que estejam acidentalmente dentro da área selecionada.
           */
          if (distancia > toleranciaCor * 2) continue;
          if (diferencaLuz > toleranciaLuz * 2) continue;

          const luz = luminosidade(r, g, b) / 255;
          const fatorLuz = 0.55 + luz * 0.65;
          const novaR = tinta.r * fatorLuz;
          const novaG = tinta.g * fatorLuz;
          const novaB = tinta.b * fatorLuz;
          const alpha = intensidade / 100;

          dados[indice] = r * (1 - alpha) + novaR * alpha;
          dados[indice + 1] = g * (1 - alpha) + novaG * alpha;
          dados[indice + 2] = b * (1 - alpha) + novaB * alpha;
          dados[indice + 3] = pixels[indice + 3];
        }
      }

      const ctx = canvas.getContext("2d");
      ctx.putImageData(resultado, 0, 0);

      setParedeSelecionada(true);
      setProcessando(false);
      setMensagem(
        `${corSelecionada.nome} aplicada automaticamente na área selecionada.`
      );

      requestAnimationFrame(() => {
        desenharSelecao();
      });
    }, 50);
  }

  /* =======================================================
     CLIQUE NA ÁREA
  ======================================================= */

  function clicarParaPintar() {
    return;
  }

  /* =======================================================
     RESTAURAR IMAGEM
  ======================================================= */

  function restaurarImagem() {
    const canvas =
      canvasRef.current;

    const original =
      originalImageDataRef.current;

    if (!canvas || !original) {
      return;
    }

    const ctx =
      canvas.getContext("2d");

    ctx.putImageData(
      original,
      0,
      0
    );

    setParedeSelecionada(false);

    if (areaConfirmada) {
      setMensagem(
        "Imagem restaurada. A área continua selecionada."
      );
    } else {
      setMensagem(
        "Imagem restaurada. Marque os 4 cantos da parede."
      );
    }

    requestAnimationFrame(() => {
      desenharSelecao();
    });
  }

  /* =======================================================
     VISUALIZAR ANTES E DEPOIS
  ======================================================= */

  function visualizarResultado() {
    if (!imagem) {
      setMensagem(
        "Envie uma foto primeiro."
      );

      return;
    }

    if (!areaConfirmada) {
      setMensagem(
        "Marque e confirme os 4 cantos da parede primeiro."
      );

      return;
    }

    if (!paredeSelecionada) {
      setMensagem(
        "Clique dentro da área selecionada para aplicar a tinta."
      );

      return;
    }

    const originalCanvas =
      originalCanvasRef.current;

    const canvas =
      canvasRef.current;

    if (
      !originalCanvas ||
      !canvas
    ) {
      return;
    }

    const antes =
      originalCanvas.toDataURL(
        "image/jpeg",
        0.92
      );

    const depois =
      canvas.toDataURL(
        "image/jpeg",
        0.92
      );

    setImagemOriginalModal(
      antes
    );

    setImagemResultadoModal(
      depois
    );

    setModalAberto(true);
  }

  /* =======================================================
     SALVAR
  ======================================================= */

  function salvarSimulacao() {
    const canvas =
      canvasRef.current;

    if (!canvas) return;

    const link =
      document.createElement("a");

    link.download =
      `simulacao-${corSelecionada.nome
        .toLowerCase()
        .replaceAll(" ", "-")}.png`;

    link.href =
      canvas.toDataURL(
        "image/png"
      );

    link.click();
  }

  /* =======================================================
     SELECIONAR COR
  ======================================================= */

  function selecionarCor(cor) {
    setCorSelecionada(cor);

    restaurarImagem();

    if (areaConfirmada) {
      setMensagem(
        `Você escolheu ${cor.nome}. Clique em "Aplicar ${cor.nome}" para pintar automaticamente a área.`
      );
    } else {
      setMensagem(
        `Você escolheu ${cor.nome}. Primeiro marque os 4 cantos da parede.`
      );
    }
  }

  /* =======================================================
     NOVA FOTO
  ======================================================= */

  function novaFoto() {
    setImagem(null);

    setParedeSelecionada(false);

    setAreaConfirmada(false);

    setPontosSelecao([]);

    setPontoArrastando(null);

    setModalAberto(false);

    setImagemOriginalModal(null);

    setImagemResultadoModal(null);

    setMensagem(
      "Envie uma foto e marque os 4 cantos da parede."
    );

    originalImageDataRef.current =
      null;

    imagemRef.current = null;
  }

  /* =======================================================
     JSX
  ======================================================= */

  return (
    <div className={style.container}>

      <HeaderUser />

      {/* ==================================================
          HERO
      ================================================== */}

      <section className={style.hero}>

        <div className={style.heroContent}>

          <span className={style.badge}>

            <Sparkles size={16} />

            SIMULADOR INTELIGENTE

          </span>

          <h1>

            Visualize antes

            <span> de pintar.</span>

          </h1>

          <p>

            Escolha uma cor, envie uma foto
            e marque exatamente a área que
            deseja pintar.

          </p>

        </div>

      </section>

      {/* ==================================================
          MAIN
      ================================================== */}

      <main className={style.main}>

        {/* =================================================
            UPLOAD
        ================================================= */}

        {!imagem && (

          <section
            className={
              style.uploadSection
            }
          >

            <label
              className={
                style.uploadBox
              }
            >

              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={
                  carregarImagem
                }
              />

              <div
                className={
                  style.uploadIcon
                }
              >

                <Upload size={38} />

              </div>

              <h2>

                Envie uma foto
                do seu ambiente

              </h2>

              <p>

                Escolha uma foto contendo
                a parede que deseja pintar.

              </p>

              <span
                className={
                  style.uploadFormats
                }
              >

                JPG • PNG • WEBP

              </span>

              <div
                className={
                  style.uploadButton
                }
              >

                <Upload size={18} />

                Escolher foto

              </div>

            </label>

          </section>

        )}

        {/* =================================================
            SIMULADOR
        ================================================= */}

        {imagem && (

          <section
            className={
              style.simulador
            }
          >

            {/* =============================================
                CABEÇALHO
            ============================================= */}

            <div
              className={
                style.simuladorHeader
              }
            >

              <div>

                <span
                  className={
                    style.sectionTag
                  }
                >

                  SIMULADOR DE CORES

                </span>

                <h2>

                  Transforme sua parede

                </h2>

                <p>

                  Marque os quatro cantos
                  da parede antes de aplicar
                  a tinta.

                </p>

              </div>

              <button
                className={
                  style.novaFoto
                }
                onClick={
                  novaFoto
                }
              >

                <ImageIcon size={18} />

                Nova foto

              </button>

            </div>

            {/* =============================================
                GRID
            ============================================= */}

            <div
              className={
                style.simuladorGrid
              }
            >

              {/* ===========================================
                  IMAGEM
              =========================================== */}

              <div
                className={
                  style.imagemArea
                }
              >

                <div
                  className={
                    style.imagemHeader
                  }
                >

                  <div>

                    {!areaConfirmada ? (
                      <>

                        <MousePointerClick
                          size={18}
                        />

                        <span>

                          {pontosSelecao.length === 0
                            ? "Marque o primeiro canto da parede"
                            : pontosSelecao.length < 4
                              ? `Marque o ${pontosSelecao.length + 1}º canto da parede`
                              : "Confira os 4 cantos e confirme a área"}

                        </span>

                      </>
                    ) : (
                      <>

                        <MousePointer2
                          size={18}
                        />

                        <span>

                          Clique dentro da área para pintar

                        </span>

                      </>
                    )}

                  </div>

                  {areaConfirmada && (

                    <span
                      className={
                        style.status
                      }
                    >

                      <Check size={15} />

                      Área confirmada

                    </span>

                  )}

                </div>

                {/* =========================================
                    CANVAS
                ========================================= */}

                <div
                  className={`${style.canvasWrapper} ${processando
                      ? style.processando
                      : ""
                    } ${!areaConfirmada
                      ? style.selecionando
                      : style.selecaoCompleta
                    }`}
                >

                  {/* FOTO */}

                  <canvas
                    ref={canvasRef}
                    className={
                      style.canvas
                    }
                  />

                  {/* =======================================
                      CANVAS DE SELEÇÃO
                  ======================================= */}

                  <canvas
                    ref={
                      selectionCanvasRef
                    }
                    className={
                      style.selectionCanvas
                    }

                    onMouseDown={
                      iniciarInteracao
                    }

                    onMouseMove={
                      moverPonto
                    }

                    onMouseUp={
                      finalizarArraste
                    }

                    onMouseLeave={
                      finalizarArraste
                    }

                  />

                  {/* LOADING */}

                  {processando && (

                    <div
                      className={
                        style.loading
                      }
                    >

                      <div
                        className={
                          style.spinner
                        }
                      ></div>

                      <strong>

                        Aplicando tinta...

                      </strong>

                    </div>

                  )}

                </div>

                {/* =========================================
                    CANVAS ORIGINAL
                ========================================= */}

                <canvas
                  ref={
                    originalCanvasRef
                  }
                  className={
                    style.hiddenCanvas
                  }
                />

                {/* =========================================
                    INSTRUÇÕES
                ========================================= */}

                {!areaConfirmada &&
                  pontosSelecao.length <
                  4 && (

                    <div
                      className={
                        style.instrucoesSelecao
                      }
                    >

                      <div>

                        <span>

                          {
                            pontosSelecao.length
                          }

                        </span>

                        / 4 pontos

                      </div>

                      <p>

                        Clique nos quatro
                        cantos da parede.
                        Você poderá arrastar
                        os pontos para ajustar.

                      </p>

                    </div>

                  )}

                {/* =========================================
                    MENSAGEM
                ========================================= */}

                <div
                  className={
                    style.mensagem
                  }
                >

                  <MousePointer2
                    size={17}
                  />

                  {mensagem}

                </div>

                {/* =========================================
                    CONTROLES DA SELEÇÃO
                ========================================= */}

                <div
                  className={
                    style.controlesSelecao
                  }
                >

                  <button
                    className={
                      style.botaoLimparSelecao
                    }
                    onClick={
                      limparSelecao
                    }
                  >

                    <Trash2
                      size={17}
                    />

                    Limpar área

                  </button>

                  <button
                    className={
                      style.botaoConfirmarArea
                    }
                    disabled={
                      pontosSelecao.length !==
                      4 ||
                      areaConfirmada
                    }
                    onClick={
                      confirmarArea
                    }
                  >

                    <CheckCircle2
                      size={18}
                    />

                    {areaConfirmada
                      ? "Área confirmada"
                      : "Confirmar área"}

                  </button>

                </div>

                {/* =========================================
                    AÇÕES
                ========================================= */}

                <div
                  className={
                    style.acoesImagem
                  }
                >

                  <button
                    className={
                      style.botaoRestaurar
                    }
                    onClick={
                      restaurarImagem
                    }
                  >

                    <RotateCcw
                      size={17}
                    />

                    Restaurar

                  </button>

                  <button
                    className={
                      style.botaoVisualizar
                    }
                    onClick={
                      visualizarResultado
                    }
                  >

                    <Eye size={18} />

                    Visualizar parede

                  </button>

                </div>

              </div>

              {/* ===========================================
                  PAINEL DE CORES
              =========================================== */}

              <aside
                className={
                  style.painel
                }
              >

                <div
                  className={
                    style.painelTitulo
                  }
                >

                  <div
                    className={
                      style.paletaIcon
                    }
                  >

                    <Palette size={20} />

                  </div>

                  <div>

                    <span>

                      ESCOLHA SUA COR

                    </span>

                    <h3>

                      Paleta de tintas

                    </h3>

                  </div>

                </div>

                {/* COR ATUAL */}

                <div
                  className={
                    style.corSelecionada
                  }
                >

                  <div
                    className={
                      style.corGrande
                    }
                    style={{
                      background:
                        corSelecionada.cor,
                    }}
                  />

                  <div>

                    <strong>

                      {
                        corSelecionada.nome
                      }

                    </strong>

                    <span>

                      {
                        corSelecionada.cor
                      }

                    </span>

                  </div>

                </div>

                {/* PALETA */}

                <div
                  className={
                    style.coresGrid
                  }
                >

                  {CORES.map(
                    (item) => (

                      <button
                        key={
                          item.nome
                        }
                        className={`${style.corCard} ${corSelecionada.nome ===
                            item.nome
                            ? style.corAtiva
                            : ""
                          }`}
                        onClick={() =>
                          selecionarCor(
                            item
                          )
                        }
                      >

                        <div
                          className={
                            style.corBolinha
                          }
                          style={{
                            background:
                              item.cor,
                          }}
                        >

                          {corSelecionada.nome ===
                            item.nome && (

                              <Check
                                size={18}
                              />

                            )}

                        </div>

                        <span>

                          {
                            item.nome
                          }

                        </span>

                      </button>

                    )
                  )}

                </div>

                {/* AJUSTES */}

                <div
                  className={
                    style.configuracoes
                  }
                >

                  <div
                    className={
                      style.configTitulo
                    }
                  >

                    <SlidersHorizontal
                      size={18}
                    />

                    Ajustes da simulação

                  </div>

                  {/* PRECISÃO */}

                  <label>

                    <div>

                      <span>

                        Precisão da parede

                      </span>

                      <strong>

                        {tolerancia}

                      </strong>

                    </div>

                    <input
                      type="range"
                      min="10"
                      max="45"
                      value={
                        tolerancia
                      }
                      onChange={(e) =>
                        setTolerancia(
                          Number(
                            e.target.value
                          )
                        )
                      }
                    />

                  </label>

                  {/* INTENSIDADE */}

                  <label>

                    <div>

                      <span>

                        Intensidade da tinta

                      </span>

                      <strong>

                        {intensidade}%

                      </strong>

                    </div>

                    <input
                      type="range"
                      min="20"
                      max="100"
                      value={
                        intensidade
                      }
                      onChange={(e) =>
                        setIntensidade(
                          Number(
                            e.target.value
                          )
                        )
                      }
                    />

                  </label>

                </div>

                {/* BOTÃO APLICAR */}

                <button
                  className={style.aplicarBotao}
                  onClick={aplicarTintaAutomatica}
                  disabled={
                    processando ||
                    pontosSelecao.length !== 4 ||
                    !areaConfirmada
                  }
                >

                  <PaintBucket
                    size={19}
                  />

                  Aplicar{" "}

                  {
                    corSelecionada.nome
                  }

                </button>

              </aside>

            </div>

          </section>

        )}

      </main>

      {/* ==================================================
          MODAL ANTES / DEPOIS
      ================================================== */}

      {modalAberto && (

        <div
          className={
            style.modalOverlay
          }
          onClick={() =>
            setModalAberto(
              false
            )
          }
        >

          <div
            className={
              style.modal
            }
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            {/* HEADER */}

            <div
              className={
                style.modalHeader
              }
            >

              <div>

                <span>

                  RESULTADO DA SIMULAÇÃO

                </span>

                <h2>

                  Antes e depois

                </h2>

              </div>

              <button
                className={
                  style.fecharModal
                }
                onClick={() =>
                  setModalAberto(
                    false
                  )
                }
              >

                <X size={22} />

              </button>

            </div>

            {/* COMPARAÇÃO */}

            <div
              className={
                style.comparacao
              }
            >

              {/* ANTES */}

              <div
                className={
                  style.comparacaoCard
                }
              >

                <div
                  className={
                    style.comparacaoTitulo
                  }
                >

                  <span>

                    ANTES

                  </span>

                </div>

                {imagemOriginalModal && (

                  <img
                    src={
                      imagemOriginalModal
                    }
                    alt="Ambiente antes da pintura"
                  />

                )}

              </div>

              {/* DEPOIS */}

              <div
                className={
                  style.comparacaoCard
                }
              >

                <div
                  className={`${style.comparacaoTitulo} ${style.tituloDepois}`}
                >

                  <span>

                    DEPOIS

                  </span>

                  <strong>

                    {
                      corSelecionada.nome
                    }

                  </strong>

                </div>

                {imagemResultadoModal && (

                  <img
                    className={
                      style.imagemDepois
                    }
                    src={
                      imagemResultadoModal
                    }
                    alt="Ambiente depois da pintura"
                  />

                )}

              </div>

            </div>

            {/* FOOTER */}

            <div
              className={
                style.modalFooter
              }
            >

              <div
                className={
                  style.resultadoCor
                }
              >

                <div
                  style={{
                    background:
                      corSelecionada.cor,
                  }}
                />

                <span>

                  {
                    corSelecionada.nome
                  }

                </span>

              </div>

              <div
                className={
                  style.modalAcoes
                }
              >

                <button
                  className={
                    style.botaoFechar
                  }
                  onClick={() =>
                    setModalAberto(
                      false
                    )
                  }
                >

                  Continuar editando

                </button>

                <button
                  className={
                    style.botaoSalvar
                  }
                  onClick={
                    salvarSimulacao
                  }
                >

                  <Download
                    size={18}
                  />

                  Salvar simulação

                </button>

              </div>

            </div>

          </div>

        </div>

      )}

    </div>
    
  );
}