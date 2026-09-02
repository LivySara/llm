import mysql from 'mysql2/promise';
import 'dotenv/config';

export const config = {
  port: Number(process.env.PORT ?? 8081),
  db: {
    host: process.env.DB_HOST ?? 'localhost',
    user: process.env.DB_USER ?? 'root',
    password: process.env.DB_PASSWORD ?? '',   // 不再有明文密码进 git
    database: process.env.DB_NAME ?? 'world',
    waitForConnections: true,
    connectionLimit: 10,   // 池化：受控的并发连接上限
    namedPlaceholders: true,
  },
};

export const db = mysql.createPool(config.db);