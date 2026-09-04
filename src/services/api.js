import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3333",
});

export function urlArquivo(caminho) {
  if (!caminho) {
    return "";
  }

  if (/^https?:\/\//i.test(caminho)) {
    return caminho;
  }

  const baseUrl = api.defaults.baseURL.replace(/\/$/, "");
  return `${baseUrl}/${String(caminho).replace(/^\//, "")}`;
}

export function urlFotoUsuario(foto) {
  if (!foto) {
    return "";
  }

  const caminho = String(foto).trim().replace(/\\/g, "/");

  if (/^https?:\/\//i.test(caminho)) {
    return caminho;
  }

  const caminhoNormalizado = caminho.replace(/^\.?\//, "");
  const nomeArquivo = caminhoNormalizado.split("/").pop();

  if (
    caminhoNormalizado.startsWith("usuarios/") ||
    caminhoNormalizado.startsWith("uploads/usuarios/")
  ) {
    const baseUrl = api.defaults.baseURL.replace(/\/$/, "");
    return `${baseUrl}/usuarios/foto-arquivo/${encodeURIComponent(nomeArquivo)}`;
  }

  return urlArquivo(caminhoNormalizado);
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("usuario");
    }

    return Promise.reject(error);
  }
);
