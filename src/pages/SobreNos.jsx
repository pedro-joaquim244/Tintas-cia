import { useState } from "react";

import PaletadeCor from "../assets/imagens/paletaCor.png";
import Cartao from "../assets/imagens/cartao.png";
import LatadeTinta from "../assets/imagens/lataTinta.png";
import rolodeTinta from "../assets/imagens/roloTinta.png";
import LojadeTinta from "../assets/imagens/casadeTinta.png";

import {
  Target,
  Eye,
  Heart,
  Store,
  MapPin,
  Clock3,
  Phone,
  X,
  Star,
} from "lucide-react";

import style from "../styles/SobreNos.module.css";

export default function SobreNos() {

  const [abrirModal, setAbrirModal] = useState(false);

  return (

    <div className={style.container}>

      <main className={style.main}>

        {/* HERO */}

        <section className={style.hero}>

          <div className={style.heroTexto}>

            <span className={style.subtitulo}>
              NOSSA HISTÓRIA
            </span>

            <h1>
              Sobre a <span>Tintas+</span>
            </h1>

            <div className={style.linhaColorida}>
              <div className={style.amarelo}></div>
              <div className={style.rosa}></div>
              <div className={style.azul}></div>
            </div>

            <p>
              Somos especialistas em tintas premium,
              trazendo inovação, qualidade e sofisticação
              para transformar ambientes modernos.
            </p>

          </div>

          <div className={style.heroImagem}>

            <img
              src={LojadeTinta}
              alt="Loja de tintas"
            />

          </div>

        </section>

        {/* CARDS */}

        <section className={style.cardsInfo}>

          <div className={style.cardInfo}>

            <div className={style.icone}>
              <Target size={42} />
            </div>

            <div>

              <h3>Missão</h3>

              <p>
                Oferecer produtos premium com
                qualidade e excelência.
              </p>

            </div>

          </div>

          <div className={style.divisor}></div>

          <div className={style.cardInfo}>

            <div className={style.icone}>
              <Eye size={42} />
            </div>

            <div>

              <h3>Visão</h3>

              <p>
                Ser referência nacional no
                segmento de tintas.
              </p>

            </div>

          </div>

          <div className={style.divisor}></div>

          <div className={style.cardInfo}>

            <div className={style.icone}>
              <Heart size={42} />
            </div>

            <div>

              <h3>Valores</h3>

              <ul>

                <li>Qualidade</li>
                <li>Inovação</li>
                <li>Compromisso</li>

              </ul>

            </div>

          </div>

        </section>

        {/* BANNER */}

        <section className={style.banner}>

          <div className={style.bannerTexto}>

            <h2>
              Transformando <span>cores</span>
            </h2>

            <p>
              Trabalhamos com as melhores marcas
              e acabamentos premium do mercado.
            </p>

          </div>

          <div className={style.bannerItens}>

            <div className={style.item}>

              <img src={PaletadeCor} alt="" />

              <span>
                Mais de 3 mil cores
              </span>

            </div>

            <div className={style.linhaVertical}></div>

            <div className={style.item}>

              <img src={Cartao} alt="" />

              <span>
                Parcelamento facilitado
              </span>

            </div>

            <div className={style.linhaVertical}></div>

            <div className={style.item}>

              <img src={LatadeTinta} alt="" />

              <span>
                Produtos premium
              </span>

            </div>

            <div className={style.linhaVertical}></div>

            <div className={style.item}>

              <img src={rolodeTinta} alt="" />

              <span>
                Equipamentos profissionais
              </span>

            </div>

          </div>

          <div className={style.bannerImagem}>

            <img
              src={LojadeTinta}
              alt=""
            />

          </div>

        </section>

        {/* LOCALIZAÇÃO */}

        <section className={style.localizacao}>

          <div className={style.localTexto}>

            <div className={style.iconBox}>
              <Store size={38} />
            </div>

            <div>

              <h3>
                Conheça nossas lojas
              </h3>

              <p>
                Encontre a unidade mais próxima.
              </p>

            </div>

          </div>

          <button
            onClick={() => setAbrirModal(true)}
          >
            Ver lojas
          </button>

        </section>

      </main>

      {/* MODAL */}

      {abrirModal && (

        <div className={style.modalOverlay}>

          <div className={style.modal}>

            <div className={style.modalTopo}>

              <div>

                <span className={style.modalSubtitulo}>
                  NOSSAS UNIDADES
                </span>

                <h2>
                  Lojas <span>Tintas+</span>
                </h2>

              </div>

              <button
                className={style.fecharModal}
                onClick={() => setAbrirModal(false)}
              >

                <X />

              </button>

            </div>

            <div className={style.lojasGrid}>

              {[1,2,3].map((item) => (

                <div
                  key={item}
                  className={style.lojaCard}
                >

                  <div className={style.lojaTop}>

                    <div className={style.lojaIcone}>
                      <Store />
                    </div>

                    <div className={style.avaliacao}>

                      <Star size={16} />

                      4.9

                    </div>

                  </div>

                  <h3>
                    Tintas+ Campinas
                  </h3>

                  <div className={style.infoLinha}>

                    <MapPin size={18} />

                    <span>
                      Av. Brasil, 1200
                    </span>

                  </div>

                  <div className={style.infoLinha}>

                    <Clock3 size={18} />

                    <span>
                      08h às 18h
                    </span>

                  </div>

                  <div className={style.infoLinha}>

                    <Phone size={18} />

                    <span>
                      (19) 99999-9999
                    </span>

                  </div>

                  <button className={style.botaoRota}>
                    Ver rota
                  </button>

                </div>

              ))}

            </div>

          </div>

        </div>

      )}

    </div>

  );

}