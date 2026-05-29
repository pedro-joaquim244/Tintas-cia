import { useState } from "react";

import {
  Upload,
  Sparkles,
  PaintBucket,
  Check,
} from "lucide-react";

import style from "../styles/SimuladorTintas.module.css";

export default function SimuladorTinta() {

  const [imagem, setImagem] = useState(null);

  const [cores] = useState([
    {
      nome: "Azul Oceano",
      cor: "#2563eb",
      descricao:
        "Ideal para ambientes modernos e sofisticados.",
    },

    {
      nome: "Areia Premium",
      cor: "#d6b98c",
      descricao:
        "Tonalidade elegante e aconchegante.",
    },

    {
      nome: "Verde Nature",
      cor: "#4ade80",
      descricao:
        "Sensação natural e relaxante.",
    },

    {
      nome: "Cinza Urban",
      cor: "#6b7280",
      descricao:
        "Minimalista e contemporâneo.",
    },
  ]);

  function carregarImagem(evento) {

    const arquivo = evento.target.files[0];

    if (arquivo) {

      setImagem(URL.createObjectURL(arquivo));

    }

  }

  return (

    <div className={style.container}>

      {/* HERO */}

      <section className={style.hero}>

        <div className={style.heroContent}>

          <span className={style.badge}>
            Inteligência visual
          </span>

          <h1>
            Descubra a tinta perfeita
            para sua casa
          </h1>

          <p>
            Envie uma foto do ambiente e receba
            sugestões modernas de cores para
            transformar sua parede.
          </p>

        </div>

      </section>

      {/* UPLOAD */}

      <section className={style.uploadSection}>

        <label className={style.uploadBox}>

          <input
            type="file"
            accept="image/*"
            onChange={carregarImagem}
          />

          <Upload size={60} />

          <h3>
            Clique para enviar uma foto
          </h3>

          <p>
            JPG, PNG ou WEBP
          </p>

        </label>

      </section>

      {/* PREVIEW */}

      {imagem && (

        <section className={style.previewSection}>

          <div className={style.imagemContainer}>

            <img
              src={imagem}
              alt="Casa enviada"
            />

            <div className={style.overlay}></div>

          </div>

          <div className={style.resultados}>

            <div className={style.resultadoTop}>

              <Sparkles />

              <h2>
                Sugestões para seu ambiente
              </h2>

            </div>

            <div className={style.coresGrid}>

              {cores.map((item, index) => (

                <div
                  className={style.corCard}
                  key={index}
                >

                  <div
                    className={style.corPreview}
                    style={{
                      background: item.cor,
                    }}
                  ></div>

                  <div className={style.corInfo}>

                    <h3>
                      {item.nome}
                    </h3>

                    <p>
                      {item.descricao}
                    </p>

                    <button>

                      <PaintBucket size={18} />

                      Aplicar cor

                    </button>

                  </div>

                </div>

              ))}

            </div>

          </div>

        </section>

      )}

      {/* BENEFÍCIOS */}

      <section className={style.benefits}>

        <div className={style.benefitCard}>

          <Check />

          <h3>
            Simulação realista
          </h3>

          <p>
            Veja como a cor ficará antes de pintar.
          </p>

        </div>

        <div className={style.benefitCard}>

          <Check />

          <h3>
            Tendências modernas
          </h3>

          <p>
            Paletas inspiradas em designs premium.
          </p>

        </div>

        <div className={style.benefitCard}>

          <Check />

          <h3>
            Fácil de usar
          </h3>

          <p>
            Basta enviar uma foto do ambiente.
          </p>

        </div>

      </section>

    </div>

  );

}