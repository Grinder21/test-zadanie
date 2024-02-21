const express = require("express");
const mysql = require("mysql");
const bcrypt = require("bcrypt");
require("dotenv").config();
const app = express();
const port = process.env.PORT;

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

db.connect((err) => {
  if (err) {
    console.error("Ошибка при подключении к базе данных:", err.message);
    throw err;
  }

  console.log("Подключено к базе данных");
});

app.use(express.json());

app.get("/users", (req, res) => {
  db.query("SELECT * FROM users", (err, result) => {
    if (err) throw err;
    res.json(result);
  });
});

// 1 - принятие и обработка POST запросов с данными в формате JSON"

app.post("/process-referral", (req, res) => {
  const requestData = req.body;

  // Валидация данных (можно использовать какие-либо библиотеки)

  // Обязательные поля для создания записей в БД
  const user = requestData?.Data?.Users?.[0];
  const document = user?.Documents?.[0];

  // Хеширование пароля
  const hashedPassword = bcrypt.hashSync(user.password, 10);

  db.query(
    `INSERT INTO users (login, password, gender_id, type_id, last_name, first_name)
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
       login = VALUES(login), password = VALUES(password), gender_id = VALUES(gender_id),
       type_id = VALUES(type_id), last_name = VALUES(last_name), first_name = VALUES(first_name)`,
    [user.login, hashedPassword, user.sex, 2, user.lastName, user.firstName],
    (err, result) => {
      if (err) throw err;

      db.query(
        `INSERT INTO documents (user_id, type_id, data)
               VALUES (?, ?, ?)
               ON DUPLICATE KEY UPDATE
               user_id = VALUES(user_id), type_id = VALUES(type_id), data = VALUES(data)`,
        [result.insertId, document.documentType_id, JSON.stringify(document)],
        (err, result) => {
          if (err) throw err;
          res.json({ message: "Документ успешно обработан" });
        }
      );
    }
  );
});

// 2 - "авторизация пользователя по данным из БД"

app.post("/login", (req, res) => {
  const { login, password } = req.body;

  // Закодированный пароль должен быть декодирован перед сравнением
  const decodedPassword = Buffer.from(password, "base64").toString("utf-8");

  db.query(
    "SELECT * FROM Users WHERE login = ? AND password = ?",
    [login, decodedPassword],
    (err, result) => {
      if (err) throw err;

      if (result.length > 0) {
        // Пользователь авторизован
        res.json({ message: "Авторизация успешна" });
      } else {
        res.status(401).json({ message: "Неверные учетные данные" });
      }
    }
  );
});

// 3 -  "Отображение информации и документов об авторизованном пользователе"

app.get("/user/:userId", (req, res) => {
  const userId = req.params.userId;

  db.query(
    `SELECT users.id, users.last_name, users.first_name, users.patr_name, users.gender_id, 
       users.type_id, users.login, documents.data
       FROM users
       LEFT JOIN documents ON users.id = documents.user_id
       WHERE users.id = ?`,
    [userId],
    (err, result) => {
      if (err) throw err;

      if (result.length > 0) {
        const user = {
          id: result[0].id,
          lastName: result[0].last_name,
          firstName: result[0].first_name,
          patrName: result[0].patr_name,
          genderId: result[0].gender_id,
          typeId: result[0].type_id,
          login: result[0].login,
          documents: result.map((doc) => JSON.parse(doc.data)),
        };

        res.json({ user });
      } else {
        res.status(404).json({ message: "Пользователь не найден" });
      }
    }
  );
});

// 4 - "Отображение информации о всех пользователях и их документах (доступно только админу)"
app.get("/users", (req, res) => {
  const isAdmin = req.user && req.user.isAdmin;

  if (isAdmin) {
    db.query("SELECT * FROM users", (err, usersResult) => {
      if (err) throw err;

      const users = usersResult.map((user) => ({ ...user, documents: [] }));

      res.json({ users });
    });
  } else {
    res
      .status(403)
      .json({ message: "Недостаточно прав для просмотра информации" });
  }
});

app.listen(port, () => {
  console.log(`Сервер запущен на порту ${port}`);
});
