

const express = require('express')
const bodyParser = require('body-parser')

const { ManagementClient } = require('auth0')

const auth0 = new ManagementClient({
  domain: 'blah',
  clientId: 'blah',
  clientSecret: 'blah',
})

const app = express()

const handler = async event => {
  switch (event.op) {
    case 'INSERT':
      console.log('event')
      break

    case 'UPDATE':
      break

    case 'DELETE':
      break

    default:
      break
  }
}

app.use(bodyParser.json())

app.post('/', async (req, res) => {
  try {
    const result = await handler(req.body.event)
    res.json(result)
  } catch (err) {
    console.log(err)
    res.status(500).json(e.toString())
  }
})

app.listen(process.env.PORT || 5000, () => {
  console.log('SERVER IS RUNNING')
})
