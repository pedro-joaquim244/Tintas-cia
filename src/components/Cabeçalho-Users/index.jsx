import style from "./style.module.css";

import {
  FiSearch,
  FiShoppingCart,
  FiBell,
  FiUser,
  FiMenu,
  FiChevronDown,
} from "react-icons/fi";

export default function HeaderUser() {
  return (
    <header className={style.header}>

      {/* TOP BAR */}
      <div className={style.topBar}>

        <div className={style.topLeft}>
          <span>Entrega premium para todo o Brasil</span>
        </div>

        <div className={style.topRight}>
          <a href="#">Ajuda</a>
          <a href="#">Rastreamento</a>
          <a href="#">Suporte</a>
        </div>

      </div>

      {/* MAIN HEADER */}
      <div className={style.mainHeader}>

        {/* LOGO */}
        <div className={style.logoArea}>

          <div className={style.logoGlow}></div>

          <div className={style.logoIcon}>
            <div className={style.logoDot}></div>
          </div>

          <div className={style.logoText}>

            <strong>Pixel Colors</strong>

            <span>Premium Experience</span>

          </div>

        </div>

        {/* NAV */}
        <nav className={style.nav}>

          <a href="#">
            Início
          </a>

          <div className={style.dropdown}>

            <button>
              Produtos
              <FiChevronDown />
            </button>

            <div className={style.dropdownMenu}>

              <a href="#">Tintas Premium</a>
              <a href="#">Coleções</a>
              <a href="#">Novidades</a>
              <a href="#">Ambientes</a>

            </div>

          </div>

          <a href="#">
            Projetos
          </a>

          <a href="#">
            Inspirações
          </a>

          <a href="#">
            Contato
          </a>

        </nav>

        {/* RIGHT */}
        <div className={style.rightArea}>

          {/* SEARCH */}
          <div className={style.searchBox}>

            <FiSearch />

            <input
              type="text"
              placeholder="Buscar cores, ambientes..."
            />

          </div>

          {/* ICONS */}
          <div className={style.actions}>

            <button className={style.iconButton}>
              <FiBell />
              <span></span>
            </button>

            <button className={style.iconButton}>
              <FiShoppingCart />
              <span></span>
            </button>

            <button className={style.profileButton}>

              <div className={style.avatar}>
                <FiUser />
              </div>

              <div className={style.profileInfo}>

                <strong>Minha Conta</strong>

                <span>Entrar</span>

              </div>

            </button>

          </div>

          {/* MOBILE */}
          <button className={style.mobileMenu}>
            <FiMenu />
          </button>

        </div>

      </div>

    </header>
  );
}