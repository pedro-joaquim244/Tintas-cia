import "dotenv/config";

const emailHost = String(
    process.env.EMAIL_HOST ||
    process.env.SMTP_HOST ||
    "smtp.gmail.com"
).trim();

function normalizarSenhaEmail(senha) {
    const valor = String(senha || "");

    // O Google mostra senhas de app em quatro blocos. Os espacos
    // copiados entre os blocos nao fazem parte da credencial.
    if (emailHost.toLowerCase().endsWith("gmail.com")) {
        return valor.replace(/\s/g, "");
    }

    return valor;
}


export const config = {

    // =====================================================
    // SERVIDOR
    // =====================================================

    port:
        Number(
            process.env.PORT ||
            3333
        ),


    // =====================================================
    // CORS
    // =====================================================

    corsOrigin:
        process.env.CORS_ORIGIN ||
        "http://localhost:5173",


    // =====================================================
    // JWT
    // =====================================================

    jwtSecret:
        process.env.JWT_SECRET ||
        "PedroColors",


    // =====================================================
    // BANCO
    // =====================================================

    database: {

        host:
            process.env.DB_HOST ||
            "localhost",

        port:
            Number(
                process.env.DB_PORT ||
                3306
            ),

        user:
            process.env.DB_USER ||
            "root",

        password:
            process.env.DB_PASSWORD ||
            "",

        database:
            process.env.DB_NAME ||
            "tintas"

    },


    // =====================================================
    // EMAIL / SMTP
    // =====================================================

    email: {

        host:
            emailHost,

        port:
            Number(
                process.env.EMAIL_PORT ||
                process.env.SMTP_PORT ||
                587
            ),

        secure:
            String(
                process.env.EMAIL_SECURE ??
                process.env.SMTP_SECURE ??
                "false"
            )
                .toLowerCase() ===
                "true",

        user:
            String(
                process.env.EMAIL_USER ||
                process.env.SMTP_USER ||
                ""
            ).trim(),

        password:
            normalizarSenhaEmail(
                process.env.EMAIL_PASSWORD ||
                process.env.SMTP_PASSWORD
            ),

        from:
            process.env.EMAIL_FROM ||
            process.env.SMTP_FROM ||
            ""

    }

};
