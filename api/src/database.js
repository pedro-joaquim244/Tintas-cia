import mysql from "mysql2/promise";

const pool = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "root",
    database: "api_itens",
    port: 3306,
    wiatforconnection: true,
    connectionlimit: 10,
    queuelimit: 0,

});

export default pool;