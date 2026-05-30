import styles from "./Cabecalho.module.css";

import {
  FiHome,
  FiBox,
  FiShoppingCart,
  FiLogOut,
} from "react-icons/fi";

import { useNavigate, NavLink } from "react-router-dom";

import { useAuth } from "../../contexts/authContext.jsx";

import Logo from "../../assets/imagens/Logo.png";

export default function Cabecalho() {

  const navigate = useNavigate();

  const { logout } = useAuth();

  function Sair() {

    logout();

    navigate("/login");
  }

  return (

    <aside className={styles.sidebar}>

      {/* TOPO */}

      <div>

        {/* LOGO */}

        <div className={styles.logo}>

          <img
            src={Logo}
            alt="Logo"
          />

        </div>

        {/* MENU */}

        <nav className={styles.menu}>

          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              isActive
                ? `${styles.menuItem} ${styles.active}`
                : styles.menuItem
            }
          >

            <FiHome size={20} />

            <span>
              Dashboard
            </span>

          </NavLink>

          <NavLink
            to="/"
            className={({ isActive }) =>
              isActive
                ? `${styles.menuItem} ${styles.active}`
                : styles.menuItem
            }
          >

            <FiBox size={20} />

            <span>
              Produtos
            </span>

          </NavLink>

          <NavLink
            to="/pedidos"
            className={({ isActive }) =>
              isActive
                ? `${styles.menuItem} ${styles.active}`
                : styles.menuItem
            }
          >

            <FiShoppingCart size={20} />

            <span>
              Pedidos
            </span>

          </NavLink>

        </nav>

      </div>

      {/* PARTE DE BAIXO */}

      <div className={styles.bottomArea}>

        <NavLink
          to="/perfil"
          className={styles.userBox}
        >

          <div className={styles.avatar}>
            A
          </div>

          <div className={styles.userInfo}>

            <strong>
              Administrador
            </strong>

            <span>
              admin@tintas.com
            </span>

          </div>

        </NavLink>

        <button
          className={styles.logoutBtn}
          onClick={Sair}
        >

          <FiLogOut size={18} />

          <span>
            Sair
          </span>

        </button>

      </div>

    </aside>
  );
}