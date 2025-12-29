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
      employeeCode VARCHAR(50) NOT NULL UNIQUE,
      nameEn VARCHAR(100) NOT NULL,
      nameAr VARCHAR(100) NOT NULL,
      dob DATE,
      doj DATE,
      salary DECIMAL(10,2)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS attendance (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employeeId INTEGER,
      date DATE,
      clockIn TIME,
      clockOut TIME
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
      console.log("Default user created: admin / admin123");
    }
  });
});

// ================= MIDDLEWARE =================
function auth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "No token" });

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

// Helper: convert DD-MM-YYYY to YYYY-MM-DD
const parseDate = (ddmmyyyy) => {
  if (!ddmmyyyy) return null;
  const [dd, mm, yyyy] = ddmmyyyy.split("-");
  return `${yyyy}-${mm}-${dd}`;
};

app.post("/employees", auth, (req, res) => {
  const { employeeCode, nameEn, nameAr, dob, doj, salary } = req.body;

  if (!employeeCode || !nameEn || !nameAr || !dob || !doj || salary == null) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // Parse DD-MM-YYYY to YYYY-MM-DD
  const dobSql = parseDate(dob);
  const dojSql = parseDate(doj);

  if (!dobSql || !dojSql) return res.status(400).json({ message: "Invalid date format" });
  if (isNaN(Number(salary))) return res.status(400).json({ message: "Salary must be a number" });

  db.run(
    `INSERT INTO employees (employeeCode, nameEn, nameAr, dob, doj, salary) VALUES (?, ?, ?, ?, ?, ?)`,
    [employeeCode, nameEn, nameAr, dobSql, dojSql, salary],
    function(err) {
      if (err) {
        if (err.code === "SQLITE_CONSTRAINT") return res.status(400).json({ message: "Employee Code already exists" });
        return res.status(500).json({ message: "Server error" });
      }
      res.status(201).json({ message: "Employee added successfully" });
    }
  );
});

app.put("/employees/:id", auth, (req, res) => {
  const { employeeCode, nameEn, nameAr, dob, doj, salary } = req.body;

  // 1️⃣ Required fields
  if (!employeeCode || !nameEn || !nameAr || !dob || !doj || salary == null) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // 2️⃣ Validate types
  if (isNaN(Date.parse(dob)) || isNaN(Date.parse(doj))) {
    return res.status(400).json({ message: "Invalid date format" });
  }

  if (isNaN(Number(salary))) {
    return res.status(400).json({ message: "Salary must be a number" });
  }

  // 3️⃣ Update DB
  db.run(
    `UPDATE employees
     SET employeeCode=?, nameEn=?, nameAr=?, dob=?, doj=?, salary=?
     WHERE id=?`,
    [employeeCode, nameEn, nameAr, dob, doj, salary, req.params.id],
    function (err) {
      if (err) {
        if (err.code === "SQLITE_CONSTRAINT") {
          return res.status(400).json({ message: "Employee Code already exists" });
        }
        return res.status(500).json({ message: "Server error" });
      }

      res.json({ message: "Employee updated successfully" });
    }
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

  // Check if employee already clocked in today
  db.get(
    `SELECT * FROM attendance WHERE employeeId=? AND date=?`,
    [employeeId, date],
    (err, row) => {
      if (err) return res.status(500).json({ message: "Server error" });

      if (row) {
        return res.status(400).json({ message: "Employee already clocked in today" });
      }

      // Insert new attendance
      db.run(
        `INSERT INTO attendance VALUES (NULL, ?, ?, ?, NULL)`,
        [employeeId, date, time],
        function (err) {
          if (err) return res.status(500).json({ message: "Server error" });
          res.json({ message: "Clocked In" });
        }
      );
    }
  );
});

app.post("/attendance/clock-out", auth, (req, res) => {
  const { employeeId } = req.body;
  const time = new Date().toLocaleTimeString();

  // Check if employee has clocked in today
  const date = new Date().toISOString().split("T")[0];
  db.get(
    `SELECT * FROM attendance WHERE employeeId=? AND date=?`,
    [employeeId, date],
    (err, row) => {
      if (err) return res.status(500).json({ message: "Server error" });
      if (!row) return res.status(400).json({ message: "Employee has not clocked in today" });
      if (row.clockOut) return res.status(400).json({ message: "Employee already clocked out today" });

      // Update clockOut
      db.run(
        `UPDATE attendance SET clockOut=? WHERE employeeId=? AND date=?`,
        [time, employeeId, date],
        function (err) {
          if (err) return res.status(500).json({ message: "Server error" });
          res.json({ message: "Clocked Out" });
        }
      );
    }
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
  console.log("Backend running on http://localhost:5000");
});
