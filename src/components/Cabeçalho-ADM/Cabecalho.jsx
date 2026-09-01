import styles from "./Cabecalho.module.css";

import {
  FiHome,
  FiBox,
  FiShoppingCart,
  FiLogOut,
  FiTag,
  FiUsers,
  FiClock,
} from "react-icons/fi";

import { useNavigate, NavLink } from "react-router-dom";
import { useAuth } from "../../contexts/authContext.jsx";

import Logo from "../../assets/imagens/logo.jfif";

export default function Cabecalho() {
  const navigate = useNavigate();

  const { logout, usuario } = useAuth();

  function Sair() {
    logout();
    navigate("/login");
  }

  return (
    <aside className={styles.sidebar}>
      {/* =====================================================
          PARTE SUPERIOR
      ===================================================== */}

      <div className={styles.topArea}>
        {/* LOGO */}

        <NavLink
          to="/admin/dashboard"
          className={styles.logo}
          aria-label="Ir para o dashboard"
        >
          <img src={Logo} alt="Logo" />
        </NavLink>

        {/* IDENTIFICAÇÃO */}

        <div className={styles.adminLabel}>
          <span>Área administrativa</span>
          <small>Gestão Pixel Color</small>
        </div>

        {/* MENU */}

        <nav className={styles.menu}>
          <NavLink
            to="/admin/dashboard"
            className={({ isActive }) =>
              isActive
                ? `${styles.menuItem} ${styles.active}`
                : styles.menuItem
            }
          >
            <FiHome size={19} />
            <span>Dashboard</span>
          </NavLink>

          <NavLink
            to="/admin/produtos"
            className={({ isActive }) =>
              isActive
                ? `${styles.menuItem} ${styles.active}`
                : styles.menuItem
            }
          >
            <FiBox size={19} />
            <span>Produtos</span>
          </NavLink>

          <NavLink
            to="/admin/pedidos"
            className={({ isActive }) =>
              isActive
                ? `${styles.menuItem} ${styles.active}`
                : styles.menuItem
            }
          >
            <FiShoppingCart size={19} />
            <span>Pedidos</span>
          </NavLink>

          <NavLink
            to="/admin/Cupons"
            className={({ isActive }) =>
              isActive
                ? `${styles.menuItem} ${styles.active}`
                : styles.menuItem
            }
          >
            <FiTag size={19} />
            <span>Cupons</span>
          </NavLink>

          <NavLink
            to="/admin/usuarios"
            className={({ isActive }) =>
              isActive
                ? `${styles.menuItem} ${styles.active}`
                : styles.menuItem
            }
          >
            <FiUsers size={19} />
            <span>Usuários</span>
          </NavLink>
          <NavLink
            to="/admin/historico"
            title="Histórico"
            aria-label="Abrir histórico administrativo"
            className={({ isActive }) =>
              isActive
                ? `${styles.menuItem} ${styles.active}`
                : styles.menuItem
            }
          >
            <FiClock size={19} />
            <span>Histórico</span>
          </NavLink>
        </nav>
      </div>

      {/* =====================================================
          PARTE INFERIOR
      ===================================================== */}

      <div className={styles.bottomArea}>
        {/* PERFIL */}

        <NavLink
          to="/admin/perfil"
          className={({ isActive }) =>
            isActive
              ? `${styles.userBox} ${styles.userBoxActive}`
              : styles.userBox
          }
        >
          <div className={styles.avatar}>
            {usuario?.nome?.charAt(0).toUpperCase() || "A"}
          </div>

          <div className={styles.userInfo}>
            <span className={styles.userRole}>Administrador</span>

            <strong>
              {usuario?.nome || "Administrador"}
            </strong>

            <small>
              {usuario?.email || ""}
            </small>
          </div>
        </NavLink>

        {/* SAIR */}

        <button
          type="button"
          className={styles.logoutBtn}
          onClick={Sair}
        >
          <FiLogOut size={17} />
          <span>Sair</span>
        </button>
      </div>
    </aside>
  );
}
