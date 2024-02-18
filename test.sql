

-- 
-- Установка кодировки, с использованием которой клиент будет посылать запросы на сервер
--
SET NAMES 'utf8';

--
-- Установка базы данных по умолчанию
--
USE test;

--
-- Удалить таблицу `gender_types`
--
DROP TABLE IF EXISTS gender_types;

--
-- Удалить таблицу `user_types`
--
DROP TABLE IF EXISTS user_types;

--
-- Удалить таблицу `documents`
--
DROP TABLE IF EXISTS documents;

--
-- Удалить таблицу `document_types`
--
DROP TABLE IF EXISTS document_types;

--
-- Удалить таблицу `users`
--
DROP TABLE IF EXISTS users;

--
-- Установка базы данных по умолчанию
--
USE test;

--
-- Создать таблицу `users`
--
CREATE TABLE users (
  id int(11) NOT NULL AUTO_INCREMENT,
  last_name varchar(255) DEFAULT NULL COMMENT 'Фамилия',
  first_name varchar(255) DEFAULT NULL COMMENT 'Имя',
  patr_name varchar(255) DEFAULT NULL COMMENT 'Отчество',
  gender_id int(11) DEFAULT NULL COMMENT 'id пола',
  type_id int(11) DEFAULT NULL COMMENT 'id типа пользователя',
  login varchar(255) DEFAULT NULL COMMENT 'Логин',
  password text DEFAULT NULL COMMENT 'Пароль',
  create_datetime datetime DEFAULT NULL COMMENT 'Дата и время создания записи',
  create_user_id int(11) DEFAULT NULL COMMENT 'Автор создания записи',
  modify_datetime datetime DEFAULT NULL COMMENT 'Дата и время последнего изменения записи',
  modify_user_id int(11) DEFAULT NULL COMMENT 'Автор последнего изменения записи',
  deleted int(11) DEFAULT 0 COMMENT 'Отметка об удалении записи',
  PRIMARY KEY (id)
)
ENGINE = INNODB,
AUTO_INCREMENT = 2,
CHARACTER SET utf8mb4,
COLLATE utf8mb4_unicode_ci,
COMMENT = 'Пользователи';

--
-- Создать внешний ключ
--
ALTER TABLE users
ADD CONSTRAINT FK_users_create_user_id FOREIGN KEY (create_user_id)
REFERENCES users (id);

--
-- Создать внешний ключ
--
ALTER TABLE users
ADD CONSTRAINT FK_users_modify_user_id FOREIGN KEY (modify_user_id)
REFERENCES users (id);

--
-- Создать таблицу `document_types`
--
CREATE TABLE document_types (
  id int(11) NOT NULL AUTO_INCREMENT,
  name varchar(255) DEFAULT NULL COMMENT 'Название типа документа',
  create_datetime datetime DEFAULT NULL COMMENT 'Дата и время создания записи',
  create_user_id int(11) DEFAULT NULL COMMENT 'Автор создания записи',
  modify_datetime datetime DEFAULT NULL COMMENT 'Дата и время последнего изменения записи',
  modify_user_id int(11) DEFAULT NULL COMMENT 'Автор последнего изменения записи',
  deleted int(11) DEFAULT 0 COMMENT 'Отметка об удалении записи',
  PRIMARY KEY (id)
)
ENGINE = INNODB,
AUTO_INCREMENT = 5,
AVG_ROW_LENGTH = 4096,
CHARACTER SET utf8mb4,
COLLATE utf8mb4_unicode_ci,
COMMENT = 'Типы документов';

--
-- Создать внешний ключ
--
ALTER TABLE document_types
ADD CONSTRAINT FK_document_types_create_user_id FOREIGN KEY (create_user_id)
REFERENCES users (id);

--
-- Создать внешний ключ
--
ALTER TABLE document_types
ADD CONSTRAINT FK_document_types_modify_user_id FOREIGN KEY (modify_user_id)
REFERENCES users (id);

--
-- Создать таблицу `documents`
--
CREATE TABLE documents (
  id int(11) NOT NULL AUTO_INCREMENT,
  user_id int(11) DEFAULT NULL COMMENT 'id пользователя',
  type_id int(11) DEFAULT NULL COMMENT 'id типа документа',
  data text DEFAULT NULL COMMENT 'Данные документов в формате JSON',
  create_datetime datetime DEFAULT NULL COMMENT 'Дата и время создания записи',
  create_user_id int(11) DEFAULT NULL COMMENT 'Автор создания записи',
  modify_datetime datetime DEFAULT NULL COMMENT 'Дата и время последнего изменения записи',
  modify_user_id int(11) DEFAULT NULL COMMENT 'Автор последнего изменения записи',
  deleted int(11) DEFAULT 0 COMMENT 'Отметка об удалении записи',
  PRIMARY KEY (id)
)
ENGINE = INNODB,
CHARACTER SET utf8mb4,
COLLATE utf8mb4_unicode_ci,
COMMENT = 'Документы пользователей';

--
-- Создать внешний ключ
--
ALTER TABLE documents
ADD CONSTRAINT FK_documents_create_user_id FOREIGN KEY (create_user_id)
REFERENCES users (id);

--
-- Создать внешний ключ
--
ALTER TABLE documents
ADD CONSTRAINT FK_documents_modify_user_id FOREIGN KEY (modify_user_id)
REFERENCES users (id);

--
-- Создать внешний ключ
--
ALTER TABLE documents
ADD CONSTRAINT FK_documents_type_id FOREIGN KEY (type_id)
REFERENCES document_types (id);

--
-- Создать внешний ключ
--
ALTER TABLE documents
ADD CONSTRAINT FK_documents_user_id FOREIGN KEY (user_id)
REFERENCES users (id);

--
-- Создать таблицу `user_types`
--
CREATE TABLE user_types (
  id int(11) NOT NULL AUTO_INCREMENT,
  name varchar(255) DEFAULT NULL COMMENT 'Наименование типа',
  create_datetime datetime DEFAULT NULL COMMENT 'Дата и время создания записи',
  create_user_id int(11) DEFAULT NULL COMMENT 'Автор создания записи',
  modify_datetime datetime DEFAULT NULL COMMENT 'Дата и время последнего изменения записи',
  modify_user_id int(11) DEFAULT NULL COMMENT 'Автор последнего изменения записи',
  deleted int(11) DEFAULT 0 COMMENT 'Отметка об удалении записи',
  PRIMARY KEY (id)
)
ENGINE = INNODB,
AUTO_INCREMENT = 3,
AVG_ROW_LENGTH = 8192,
CHARACTER SET utf8mb4,
COLLATE utf8mb4_unicode_ci,
COMMENT = 'Типы пользователей';

--
-- Создать внешний ключ
--
ALTER TABLE user_types
ADD CONSTRAINT FK_user_types_create_user_id FOREIGN KEY (create_user_id)
REFERENCES users (id);

--
-- Создать внешний ключ
--
ALTER TABLE user_types
ADD CONSTRAINT FK_user_types_modify_user_id FOREIGN KEY (modify_user_id)
REFERENCES users (id);

--
-- Создать внешний ключ
--
ALTER TABLE users
ADD CONSTRAINT FK_users_type_id FOREIGN KEY (type_id)
REFERENCES user_types (id);

--
-- Создать таблицу `gender_types`
--
CREATE TABLE gender_types (
  id int(11) NOT NULL AUTO_INCREMENT,
  name varchar(255) DEFAULT NULL COMMENT 'Наименование',
  create_datetime datetime DEFAULT NULL COMMENT 'Дата и время создания записи',
  create_user_id int(11) DEFAULT NULL COMMENT 'Автор создания записи',
  modify_datetime datetime DEFAULT NULL COMMENT 'Дата и время последнего изменения записи',
  modify_user_id int(11) DEFAULT NULL COMMENT 'Автор последнего изменения записи',
  deleted int(11) DEFAULT 0 COMMENT 'Отметка об удалении записи',
  PRIMARY KEY (id)
)
ENGINE = INNODB,
AUTO_INCREMENT = 3,
AVG_ROW_LENGTH = 8192,
CHARACTER SET utf8mb4,
COLLATE utf8mb4_unicode_ci,
COMMENT = 'Тип пола человека';

--
-- Создать внешний ключ
--
ALTER TABLE gender_types
ADD CONSTRAINT FK_gender_types_create_user_id FOREIGN KEY (create_user_id)
REFERENCES users (id);

--
-- Создать внешний ключ
--
ALTER TABLE gender_types
ADD CONSTRAINT FK_gender_types_modify_user_id FOREIGN KEY (modify_user_id)
REFERENCES users (id);

--
-- Создать внешний ключ
--
ALTER TABLE users
ADD CONSTRAINT FK_users_gender_id FOREIGN KEY (gender_id)
REFERENCES gender_types (id);

-- 
-- Вывод данных для таблицы users
--
INSERT INTO users VALUES
(1, 'Админ', '', '', 1, 1, 'admin', 'QWRtaW4=', '2024-02-09 00:00:00', 1, NULL, NULL, 0);

-- 
-- Вывод данных для таблицы document_types
--
INSERT INTO document_types VALUES
(1, 'Паспорт', '2024-02-09 00:00:00', 1, NULL, NULL, 0),
(2, 'Полис', '2024-02-09 00:00:00', 1, NULL, NULL, 0),
(3, 'СНИЛС', '2024-02-09 00:00:00', 1, NULL, NULL, 0),
(4, 'ИНН', '2024-02-09 00:00:00', 1, NULL, NULL, 0);

-- 
-- Вывод данных для таблицы user_types
--
INSERT INTO user_types VALUES
(1, 'Администратор', '2024-02-09 00:00:00', 1, NULL, NULL, 0),
(2, 'Пользователь', '2024-02-09 00:00:00', 1, NULL, NULL, 0);

-- 
-- Вывод данных для таблицы gender_types
--
INSERT INTO gender_types VALUES
(1, 'Мужской', '2024-02-09 00:00:00', 1, NULL, NULL, 0),
(2, 'Женский', '2024-02-09 00:00:00', 1, NULL, NULL, 0);

-- 
-- Вывод данных для таблицы documents
--
-- Таблица test.documents не содержит данных

-- 
-- Восстановить предыдущий режим SQL (SQL mode)
-- 
/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;

-- 
-- Включение внешних ключей
-- 
/*!40014 SET FOREIGN_KEY_CHECKS = @OLD_FOREIGN_KEY_CHECKS */;