const express = require('express')
const helmet = require('helmet')
const bodyParser = require('body-parser')
const fetch = require('node-fetch')
const isString = require('lodash/isString')
const argParser = require('../lib/parser')

const app = express()
app.use(helmet())
app.use(bodyParser.urlencoded({ extended: true }))

const MATTERMOST_VERIFICATION_TOKEN = process.env.MATTERMOST_VERIFICATION_TOKEN

const createMessagePoster = url => text => {
  return fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      text
    })
  })
}

app.post('/', async (req, res) => {
  const { token, text, response_url } = req.body

  if (token !== MATTERMOST_VERIFICATION_TOKEN) {
    return res.status(400).end('Wrong token')
  } else {
    const postMessage = createMessagePoster(response_url)
    res.set('Content-Type', 'application/json')

    try {
      const finalMessage = await argParser(text, postMessage)

      if (isString(finalMessage)) {
        res.json({
          text: finalMessage
        })
      } else {
        res.status(200).end()
      }
    } catch (err) {
      res.json({
        text: `❌ ${err.message}`
      })
      console.warn(err)
    }
  }
})

module.exports = app
