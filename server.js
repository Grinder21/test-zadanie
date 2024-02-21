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

app.get("/users", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM users");
    res.json(result);
  } catch (err) {
    console.error("Ошибка при выполнении запроса к БД:", err.message);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

// 1 - принятие и обработка POST запросов с данными в формате JSON"

app.post("/process-referral", async (req, res) => {
  const requestData = req.body;

  // Безопасный доступ к вложенным свойствам
  const user = requestData?.Data?.Users?.[0];
  const document = user?.Documents?.[0];

  if (
    !user ||
    !user.login ||
    !user.password ||
    !user.sex ||
    !user.lastName ||
    !user.firstName
  ) {
    return res
      .status(400)
      .json({ message: "Все поля пользователя обязательны" });
  }

  if (
    typeof user.login !== "string" ||
    user.login.length < 4 ||
    user.login.length > 20
  ) {
    return res
      .status(400)
      .json({ message: "Логин должен быть строкой от 4 до 20 символов" });
  }

  if (
    typeof user.password !== "string" ||
    user.password.length < 6 ||
    user.password.length > 30
  ) {
    return res
      .status(400)
      .json({ message: "Пароль должен быть строкой от 6 до 30 символов" });
  }

  if (typeof user.sex !== "number" || (user.sex !== 1 && user.sex !== 2)) {
    return res
      .status(400)
      .json({ message: "Пол должен быть числом (1 - мужской, 2 - женский)" });
  }

  if (
    typeof user.lastName !== "string" ||
    user.lastName.length < 1 ||
    user.lastName.length > 50
  ) {
    return res
      .status(400)
      .json({ message: "Фамилия должна быть строкой от 1 до 50 символов" });
  }

  if (
    typeof user.firstName !== "string" ||
    user.firstName.length < 1 ||
    user.firstName.length > 50
  ) {
    return res
      .status(400)
      .json({ message: "Имя должно быть строкой от 1 до 50 символов" });
  }

  if (!user || !document) {
    return res.status(400).json({ message: "Некорректные данные в запросе" });
  }

  try {
    // Хеширование пароля
    const hashedPassword = bcrypt.hashSync(user.password, 10);

    // Проверяю наличие пользователя в БД
    const [existingUser] = await db.query(
      "SELECT * FROM users WHERE login = ?",
      [user.login]
    );

    if (existingUser.length > 0) {
      // Пользователь уже существует
      // Делаю обновление данных
      await db.query(
        `UPDATE users
         SET password = ?, gender_id = ?, type_id = ?, last_name = ?, first_name = ?
         WHERE login = ?`,
        [hashedPassword, user.sex, 2, user.lastName, user.firstName, user.login]
      );
    } else {
      // Пользователя нет в БД, выполняем операции для создания нового пользователя

      // Вставка нового пользователя
      const result = await db.query(
        `INSERT INTO users (login, password, gender_id, type_id, last_name, first_name)
           VALUES (?, ?, ?, ?, ?, ?)`,
        [user.login, hashedPassword, user.sex, 2, user.lastName, user.firstName]
      );

      // Беру ID только что созданного пользователя
      const userId = result.insertId;

      // Вставка документа
      await db.query(
        `INSERT INTO documents (user_id, type_id, data)
               VALUES (?, ?, ?)`,
        [userId, document.documentType_id, JSON.stringify(document)]
      );
    }

    res.json({ message: "Документ успешно обработан" });
  } catch (err) {
    console.error("Ошибка при выполнении запроса к БД:", err.message);
    return res.status(500).json({ message: "Ошибка сервера" });
  }
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
      if (err) {
        console.error("Ошибка при выполнении запроса к БД:", err.message);
        return res.status(500).json({ message: "Ошибка сервера" });
      }

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
      if (err) {
        console.error("Ошибка при выполнении запроса к БД:", err.message);
        return res.status(500).json({ message: "Ошибка сервера" });
      }

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
      if (err) {
        console.error("Ошибка при выполнении запроса к БД:", err.message);
        return res.status(500).json({ message: "Ошибка сервера" });
      }

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
