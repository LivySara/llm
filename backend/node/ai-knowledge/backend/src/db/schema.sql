-- 用户表：登录功能的唯一数据源
-- 该文件会被 docker-compose 挂载到 MySQL 初始化目录执行（仅首次建库时生效）

CREATE TABLE IF NOT EXISTS users (
  id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  username      VARCHAR(50)  NOT NULL,                       -- 登录名
  password      VARCHAR(100) NOT NULL,                       -- bcrypt 哈希，绝不存明文
  email         VARCHAR(120) NULL,
  status        TINYINT      NOT NULL DEFAULT 1,             -- 1 正常 / 0 禁用
  last_login_at TIMESTAMP    NULL,                           -- 最近登录时间，便于审计
  created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
