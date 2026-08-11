-- 学习用示例库：用户表 + 文章表
-- 该文件会被 docker-compose 自动挂载到 MySQL 的初始化目录执行（仅首次建库时生效）

CREATE TABLE IF NOT EXISTS users (
  id         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  username   VARCHAR(50)  NOT NULL,
  password   VARCHAR(100) NOT NULL,        -- 存储 bcrypt 哈希，绝不存明文
  email      VARCHAR(120),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS articles (
  id         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  author_id  BIGINT UNSIGNED NOT NULL,
  title      VARCHAR(200) NOT NULL,
  content    TEXT,
  view_count INT UNSIGNED NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_author (author_id),
  CONSTRAINT fk_article_author FOREIGN KEY (author_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
