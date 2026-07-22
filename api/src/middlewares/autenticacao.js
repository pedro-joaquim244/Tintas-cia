import jwt from "jsonwebtoken";
import { config } from "../config.js";

export function autenticarToken(
    req,
    res,
    next
) {

    try {

        const authHeader =
            req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({
                erro: "Token inválido ou expirado."
            });
        }

        const [tipo, token] =
            authHeader.split(" ");

        if (
            tipo !== "Bearer" ||
            !token
        ) {
            return res.status(401).json({
                erro: "Token inválido ou expirado."
            });
        }

        const usuario = jwt.verify(
            token,
            config.jwtSecret
        );

        req.usuario = usuario;

        next();

    } catch (error) {

        console.error(error);

        return res.status(401).json({
            erro: "Token inválido ou expirado."
        });
    }
}

export function autorizarTipos(...tiposPermitidos) {
    return (req, res, next) => {
        if (!req.usuario || !tiposPermitidos.includes(req.usuario.tipo)) {
            return res.status(403).json({
                erro: "Voce nao tem permissao para realizar esta acao."
            });
        }

        next();
    };
}
