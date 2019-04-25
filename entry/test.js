const express = require('express')
const helmet = require('helmet')
const bodyParser = require('body-parser')

const app = express()
app.use(helmet())
app.use(bodyParser.urlencoded({ extended: true }))

app.post('/test', async (req, res) => {
  console.log(require('util').inspect(req.body, { depth: null }))
  res.status(200).end()
})

module.exports = app
