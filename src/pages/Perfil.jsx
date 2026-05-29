import { useState } from "react";

import Cabecalho from "../components/Cabeçalho-ADM/Cabecalho.jsx";

import styles from "../styles/Perfil.module.css";

import {
  FiMail,
  FiPhone,
  FiMapPin,
  FiEdit2,
  FiSave,
  FiCamera,
  FiUser,
  FiCreditCard,
  FiLock,
  FiCalendar,
  FiHome,
} from "react-icons/fi";

export default function Perfil() {
  const [editando, setEditando] = useState(false);

  const [usuario, setUsuario] = useState(() => {
    const usuarioSalvo = localStorage.getItem("usuarioPerfil");

    return usuarioSalvo
      ? JSON.parse(usuarioSalvo)
      : {
          nome: "Administrador",
          cargo: "Gerente do Sistema",

          email: "admin@corescia.com.br",

          telefone: "(16) 99999-9999",
          cidade: "Jaboticabal",
          cpf: "123.456.789-00",
          endereco: "Rua das Tintas, 150",
          estado: "São Paulo",
          usuarioSistema: "admin_master",
          nascimento: "2000-01-01",
          senha: "123456",
          foto: "",
        };
  });

  function handleChange(e) {
    setUsuario({
      ...usuario,
      [e.target.name]: e.target.value,
    });
  }

  function alterarFoto(e) {
    const file = e.target.files[0];

    if (file) {
      const fotoURL = URL.createObjectURL(file);

      setUsuario({
        ...usuario,
        foto: fotoURL,
      });
    }
  }

  function salvarPerfil() {
    localStorage.setItem(
      "usuarioPerfil",
      JSON.stringify(usuario)
    );

    setEditando(false);
  }

  return (
    <div className={styles.layout}>
      <Cabecalho />

      <main className={styles.content}>
        <div className={styles.card}>
          {/* TOPO */}

          <div className={styles.topo}>
            <div className={styles.avatarArea}>
              <div className={styles.avatarWrapper}>
                {usuario.foto ? (
                  <img
                    src={usuario.foto}
                    alt="Perfil"
                    className={styles.avatarImg}
                  />
                ) : (
                  <div className={styles.avatar}>
                    {usuario.nome.charAt(0)}
                  </div>
                )}

                {editando && (
                  <label className={styles.cameraBtn}>
                    <FiCamera />

                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={alterarFoto}
                    />
                  </label>
                )}
              </div>

              <div className={styles.userInfo}>
                {editando ? (
                  <input
                    type="text"
                    name="nome"
                    value={usuario.nome}
                    onChange={handleChange}
                    className={styles.nomeInput}
                  />
                ) : (
                  <h1>{usuario.nome}</h1>
                )}

                {editando ? (
                  <input
                    type="text"
                    name="cargo"
                    value={usuario.cargo}
                    onChange={handleChange}
                    className={styles.cargoInput}
                  />
                ) : (
                  <p>{usuario.cargo}</p>
                )}
              </div>
            </div>

            <button
              className={styles.editBtn}
              onClick={() =>
                editando
                  ? salvarPerfil()
                  : setEditando(true)
              }
            >
              {editando ? (
                <>
                  <FiSave />
                  Salvar Alterações
                </>
              ) : (
                <>
                  <FiEdit2 />
                  Editar Perfil
                </>
              )}
            </button>
          </div>

          <div className={styles.divider}></div>

          {/* INFORMAÇÕES */}

          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <FiMail className={styles.icon} />

              <div className={styles.infoContent}>
                <span>Email</span>

                {editando ? (
                  <input
                    type="email"
                    name="email"
                    value={usuario.email}
                    onChange={handleChange}
                  />
                ) : (
                  <strong>{usuario.email}</strong>
                )}
              </div>
            </div>

            <div className={styles.infoItem}>
              <FiPhone className={styles.icon} />

              <div className={styles.infoContent}>
                <span>Telefone</span>

                {editando ? (
                  <input
                    type="text"
                    name="telefone"
                    value={usuario.telefone}
                    onChange={handleChange}
                  />
                ) : (
                  <strong>{usuario.telefone}</strong>
                )}
              </div>
            </div>

            <div className={styles.infoItem}>
              <FiMapPin className={styles.icon} />

              <div className={styles.infoContent}>
                <span>Cidade</span>

                {editando ? (
                  <input
                    type="text"
                    name="cidade"
                    value={usuario.cidade}
                    onChange={handleChange}
                  />
                ) : (
                  <strong>{usuario.cidade}</strong>
                )}
              </div>
            </div>

            <div className={styles.infoItem}>
              <FiCreditCard className={styles.icon} />

              <div className={styles.infoContent}>
                <span>CPF</span>

                {editando ? (
                  <input
                    type="text"
                    name="cpf"
                    value={usuario.cpf}
                    onChange={handleChange}
                  />
                ) : (
                  <strong>{usuario.cpf}</strong>
                )}
              </div>
            </div>

            <div className={styles.infoItem}>
              <FiHome className={styles.icon} />

              <div className={styles.infoContent}>
                <span>Endereço</span>

                {editando ? (
                  <input
                    type="text"
                    name="endereco"
                    value={usuario.endereco}
                    onChange={handleChange}
                  />
                ) : (
                  <strong>{usuario.endereco}</strong>
                )}
              </div>
            </div>

            <div className={styles.infoItem}>
              <FiMapPin className={styles.icon} />

              <div className={styles.infoContent}>
                <span>Estado</span>

                {editando ? (
                  <input
                    type="text"
                    name="estado"
                    value={usuario.estado}
                    onChange={handleChange}
                  />
                ) : (
                  <strong>{usuario.estado}</strong>
                )}
              </div>
            </div>

            <div className={styles.infoItem}>
              <FiUser className={styles.icon} />

              <div className={styles.infoContent}>
                <span>Usuário</span>

                {editando ? (
                  <input
                    type="text"
                    name="usuarioSistema"
                    value={usuario.usuarioSistema}
                    onChange={handleChange}
                  />
                ) : (
                  <strong>{usuario.usuarioSistema}</strong>
                )}
              </div>
            </div>

            <div className={styles.infoItem}>
              <FiCalendar className={styles.icon} />

              <div className={styles.infoContent}>
                <span>Data de Nascimento</span>

                {editando ? (
                  <input
                    type="date"
                    name="nascimento"
                    value={usuario.nascimento}
                    onChange={handleChange}
                  />
                ) : (
                  <strong>
                    {new Date(
                      usuario.nascimento
                    ).toLocaleDateString("pt-BR")}
                  </strong>
                )}
              </div>
            </div>

            <div className={styles.infoItem}>
              <FiLock className={styles.icon} />

              <div className={styles.infoContent}>
                <span>Senha</span>

                {editando ? (
                  <input
                    type="password"
                    name="senha"
                    value={usuario.senha}
                    onChange={handleChange}
                  />
                ) : (
                  <strong>••••••••</strong>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}