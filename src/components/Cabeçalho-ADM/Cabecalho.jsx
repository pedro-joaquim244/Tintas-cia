import styles from "./Cabecalho.module.css";

import {
  FiHome,
  FiBox,
  FiShoppingCart,
  FiLogOut,
  FiTag,
  FiUsers,
} from "react-icons/fi";

import { useNavigate, NavLink } from "react-router-dom";

import { useAuth } from "../../contexts/authContext.jsx";

import Logo from "../../assets/imagens/Logo.png";

export default function Cabecalho() {

  const navigate = useNavigate();

  const { logout, usuario } = useAuth();

  function Sair() {

    logout();

    navigate("/login");

  }

  return (

    <aside className={styles.sidebar}>

      {/* =========================
          TOPO
      ========================= */}

      <div>

        {/* LOGO */}

        <div className={styles.logo}>

          <img
            src={Logo}
            alt="Logo"
          />

        </div>


        {/* =========================
            MENU
        ========================= */}

        <nav className={styles.menu}>

          {/* DASHBOARD */}

          <NavLink
            to="/admin/dashboard"
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


          {/* PRODUTOS */}

          <NavLink
            to="/admin/produtos"
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


          {/* PEDIDOS */}

          <NavLink
            to="/admin/pedidos"
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


          {/* =========================
              CUPONS
          ========================= */}

          <NavLink
            to="/admin/Cupons"
            className={({ isActive }) =>
              isActive
                ? `${styles.menuItem} ${styles.active}`
                : styles.menuItem
            }
          >

            <FiTag size={20} />

            <span>
              Cupons
            </span>

          </NavLink>


          {/* =========================
              USUÁRIOS
          ========================= */}

          <NavLink
            to="/admin/usuarios"
            className={({ isActive }) =>
              isActive
                ? `${styles.menuItem} ${styles.active}`
                : styles.menuItem
            }
          >

            <FiUsers size={20} />

            <span>
              Usuários
            </span>

          </NavLink>

        </nav>

      </div>


      {/* =========================
          PARTE DE BAIXO
      ========================= */}

      <div className={styles.bottomArea}>


        {/* PERFIL */}

        <NavLink
          to="/admin/perfil"
          className={styles.userBox}
        >

          <div className={styles.avatar}>

            {usuario?.nome?.charAt(0).toUpperCase() || "A"}

          </div>


          <div className={styles.userInfo}>

            <strong>
              {usuario?.nome || "Administrador"}
            </strong>

            <span>
              {usuario?.email || ""}
            </span>

          </div>

        </NavLink>


        {/* SAIR */}

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