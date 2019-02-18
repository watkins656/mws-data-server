let dotenv = require('dotenv').config({ path: __dirname + '/../.env' })
module.exports = {
  port: process.env.PORT || 8081,
  db: {
    database: process.env.DB_NAME || 'christmaswishlist',
    user: process.env.DB_USER || 'testing',
    password: process.env.DB_PASS,
    options: {
      dialect: process.env.DIALECT || 'mysql',
      host: process.env.HOST || 'localhost'
    }
  },
}

