const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const SECRET = "supersecretkey";

// ================= DATABASE =================
const db = new sqlite3.Database("./db.sqlite");

// Create tables
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS employees (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employeeCode TEXT,
      nameEn TEXT,
      nameAr TEXT,
      dob TEXT,
      doj TEXT,
      salary REAL
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS attendance (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employeeId INTEGER,
      date TEXT,
      clockIn TEXT,
      clockOut TEXT
    )
  `);

  // Default user
  db.get(`SELECT * FROM users WHERE username='admin'`, async (err, row) => {
    if (!row) {
      const hash = await bcrypt.hash("admin123", 10);
      db.run(
        `INSERT INTO users (username, password) VALUES (?, ?)`,
        ["admin", hash]
      );
      console.log("✅ Default user created: admin / admin123");
    }
  });
});

// ================= MIDDLEWARE =================
function auth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "No token" });

  // Accept "Bearer token" or raw token
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : authHeader;

  jwt.verify(token, SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid token" });
    req.user = user;
    next();
  });
}

// ================= AUTH =================
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  db.get(
    `SELECT * FROM users WHERE username = ?`,
    [username],
    async (err, user) => {
      if (!user) return res.status(401).json({ message: "Invalid login" });

      const match = await bcrypt.compare(password, user.password);
      if (!match) return res.status(401).json({ message: "Invalid login" });

      const token = jwt.sign({ id: user.id }, SECRET, { expiresIn: "8h" });
      res.json({ token });
    }
  );
});

// ================= EMPLOYEE CRUD =================
app.get("/employees", auth, (req, res) => {
  db.all(`SELECT * FROM employees`, [], (err, rows) => {
    res.json(rows);
  });
});

app.post("/employees", auth, (req, res) => {
  const { employeeCode, nameEn, nameAr, dob, doj, salary } = req.body;

  db.run(
    `INSERT INTO employees VALUES (NULL, ?, ?, ?, ?, ?, ?)`,
    [employeeCode, nameEn, nameAr, dob, doj, salary],
    function () {
      res.json({ id: this.lastID });
    }
  );
});

app.put("/employees/:id", auth, (req, res) => {
  const { employeeCode, nameEn, nameAr, dob, doj, salary } = req.body;

  db.run(
    `UPDATE employees SET employeeCode=?, nameEn=?, nameAr=?, dob=?, doj=?, salary=? WHERE id=?`,
    [employeeCode, nameEn, nameAr, dob, doj, salary, req.params.id],
    () => res.json({ message: "Updated" })
  );
});

app.delete("/employees/:id", auth, (req, res) => {
  db.run(`DELETE FROM employees WHERE id=?`, [req.params.id], () =>
    res.json({ message: "Deleted" })
  );
});

// ================= ATTENDANCE =================
app.post("/attendance/clock-in", auth, (req, res) => {
  const { employeeId } = req.body;
  const date = new Date().toISOString().split("T")[0];
  const time = new Date().toLocaleTimeString();

  db.run(
    `INSERT INTO attendance VALUES (NULL, ?, ?, ?, NULL)`,
    [employeeId, date, time],
    () => res.json({ message: "Clocked In" })
  );
});

app.post("/attendance/clock-out", auth, (req, res) => {
  const { employeeId } = req.body;
  const time = new Date().toLocaleTimeString();

  db.run(
    `UPDATE attendance SET clockOut=? WHERE employeeId=? AND clockOut IS NULL`,
    [time, employeeId],
    () => res.json({ message: "Clocked Out" })
  );
});

app.get("/attendance/report", auth, (req, res) => {
  db.all(
    `
    SELECT e.nameEn, a.date, a.clockIn, a.clockOut
    FROM attendance a
    JOIN employees e ON e.id = a.employeeId
    `,
    [],
    (err, rows) => res.json(rows)
  );
});

// ================= START =================
app.listen(5000, () => {
  console.log("🚀 Backend running on http://localhost:5000");
});
