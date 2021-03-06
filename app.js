require('dotenv').config()

const express = require('express')
const path = require('path')
const cookieParser = require('cookie-parser')
const logger = require('morgan')
const cors = require('cors')

const swaggerUi = require('swagger-ui-express')
const YAML = require('yamljs')

const indexMiddleware = require('./middlewares/index')
const usersMiddleware = require('./middlewares/users/index')

const app = express()

app.use(cors())
app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())

app.use('/', indexMiddleware)
app.use('/users', usersMiddleware)

const swaggerDocument = YAML.load('./docs/swagger.yaml')
app.use(
  '/docs',
  (req, res, next) => {
    swaggerDocument.host = req.get('host')
    req.swaggerDoc = swaggerDocument
    next()
  },
  swaggerUi.serve,
  swaggerUi.setup()
)

app.use((err, req, res, next) => {
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}
  res.status(err.status || 500).send({
    error: err,
  })
})

module.exports = app
