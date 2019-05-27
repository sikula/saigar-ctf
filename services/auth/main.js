const express = require('express')
const bodyParser = require('body-parser')
const uuid = require('uuid/v4')

const { ManagementClient, AuthenticationClient } = require('auth0')
const sgMailer = require('@sendgrid/mail')

require('dotenv').config()

const auth0 = new ManagementClient({
  domain: `${process.env.AUTH0_DOMAIN}`,
  clientId: `${process.env.AUTH0_MANAGEMENT_CLIENT_ID}`,
  clientSecret: `${process.env.AUTH0_MANAGEMENT_CLIENT_SECRET}`,
  audience: `${process.env.AUTH0_AUDIENCE}`,
})

const auth0A = new AuthenticationClient({
  domain: `${process.env.AUTH0_DOMAIN}`,
  clientId: `${process.env.AUTH0_AUTH_CLIENT_ID}`,
  clientSecret: `${process.env.AUTH0_AUTH_CLIENT_SECRET}`,
  audience: `${process.env.AUTH0_AUDIENCE}`,
})

sgMailer.setApiKey('SENDGRID_API_KEY')

const app = express()

const handler = async event => {
  if (event.op === 'INSERT') {
    // eslint-disable-next-line no-console
    console.log(event)

    let userRole
    if (event.data.new.role === 'CONTESTANT') {
      userRole = 'contestant'
    } else if (event.data.new.role === 'JUDGE') {
      userRole = 'judge'
    } else if (event.data.new.role === 'ADMIN') {
      userRole = 'ctf_admin'
    } else {
      console.log('[ERROR]: INCORRECT ROLE')
    }

    // #1 Create User
    const createUserOpts = {
      connection: `${process.env.AUTH0_CONNECTION}`,
      email: event.data.new.email,
      username: event.data.new.username,
      password: `${uuid()}`,
      app_metadata: {
        authorization: {
          groups: [userRole],
        },
      },
    }

    const { email } = await auth0.createUser(createUserOpts).catch(err => console.log(err))

    // #2 Create Reset Ticket
    // const createResetOpts = {
    //   email,
    //   connection_id: 'con_C7x24ofiVd6bVRXp',
    // }

    await auth0A
      .requestChangePasswordEmail({
        email: event.data.new.email,
        connection: `${process.env.AUTH0_CONNECTION}`,
      })
      .catch(err => console.log(err))

    // const { ticket } = await auth0
    //   .createPasswordChangeTicket(createResetOpts)
    //   .catch(err => console.log(err))

    // #3 Send email with reset ticket
    // const msg = {
    //     to: email,
    //     from:
    // }
    // eslint-disable-next-line no-console
    // console.log('INSERT', ticket)
  }
}

app.use(bodyParser.json())

app.post('/', async (req, res) => {
  try {
    const result = await handler(req.body.event)
    res.json(result)
  } catch (err) {
    res.status(500).json(err.toString())
  }
})

app.listen(process.env.PORT || 3000, () => {
  // eslint-disable-next-line no-console
  console.log('SERVER IS RUNNING')
})
