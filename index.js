const express = require('express')
const path = require('path')
const sqlite3 = require('sqlite3').verbose()

const PORT = 4200

const app = express()

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))
app.use(express.urlencoded({ extended: false })) // middleware configuration

//Подключение к бд
const db_name = path.join(__dirname, 'data', 'users.db')
const db = new sqlite3.Database(db_name, (err) => {
  if (err) {
    return console.error(err.message)
  }
  console.log("Successful connection to the database 'users.db'")
})
//Создание бд
const sql_create = `CREATE TABLE IF NOT EXISTS Users (
  User_ID INTEGER PRIMARY KEY AUTOINCREMENT,
  FirstName TEXT NOT NULL CHECK(FirstName !=''),
  LastName TEXT NOT NULL CHECK(LastName !=''),
  Age INTEGER NOT NULL CHECK(Age > 0 AND Age <100)
);`

db.run(sql_create, (err) => {
  if (err) {
    return console.error(err.message)
  }
  console.log("Successful creation of the 'Users' table")
})

// Добавление элементов в бд
// const sql_insert = `INSERT INTO Users (User_ID, FirstName, LastName, Age) VALUES
//   (1, 'Ivan', 'Markelov', 25),
//   (2, 'Vasya', 'Pupkin', 30),
//   (3, 'Masha', 'Ivanova', 22);`
// db.run(sql_insert, (err) => {
//   if (err) {
//     return console.error(err.message)
//   }
//   console.log('Successful creation of 3 users')
// })

app.listen(PORT, () => {
  console.log('Server OK')
})

//Вывод данных на главную страницу
app.get('/', (req, res) => {
  const sql = 'SELECT * FROM Users' //получение данных
  db.all(sql, [], (err, rows) => {
    if (err) {
      return console.error(err.message)
    }
    res.render('index', { model: rows })
  })
})

//Редактирование данных
app.get('/edit/:id', (req, res) => {
  const id = req.params.id
  const sql = 'SELECT * FROM Users WHERE User_ID = ?'
  db.get(sql, id, (err, row) => {
    if (err) {
      return console.error(err.message)
    }
    res.render('edit', { model: row })
  })
})

//Обновление данных
app.post('/edit/:id', (req, res) => {
  const id = req.params.id
  const user = [req.body.FirstName, req.body.LastName, req.body.Age, id] //данные для обновления
  const sql =
    'UPDATE Users SET FirstName = ?, LastName = ?, Age = ? WHERE (User_ID = ?)'
  db.run(sql, user, (err) => {
    if (err) {
      return console.error(err.message)
    }
    res.redirect('/')
    console.log('Edit OK')
  })
})

//GET create
app.get('/create', (req, res) => {
  res.render('create', { model: {} })
})

//POST create
app.post('/create', (req, res) => {
  const sql = 'INSERT INTO Users (FirstName, LastName, Age) VALUES (?, ?, ?)'
  const user = [req.body.FirstName, req.body.LastName, req.body.Age]
  db.run(sql, user, (err) => {
    if (err) {
      return console.error(err.message)
    }
    res.redirect('/')
    console.log('Create OK')
  })
})

// GET delete
app.get('/delete/:id', (req, res) => {
  const id = req.params.id
  const sql = 'SELECT * FROM Users WHERE User_ID = ?'
  db.get(sql, id, (err, row) => {
    if (err) {
      return console.error(err.message)
    }
    res.render('delete', { model: row })
  })
})

// POST delete
app.post('/delete/:id', (req, res) => {
  const id = req.params.id
  const sql = 'DELETE FROM Users WHERE User_ID = ?'
  db.run(sql, id, (err) => {
    if (err) {
      return console.error(err.message)
    }
    res.redirect('/')
    console.log('delete OK')
  })
})
