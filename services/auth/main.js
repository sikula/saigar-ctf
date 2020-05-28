const express = require('express')
const bodyParser = require('body-parser')
const uuid = require('uuid/v4')

const { ManagementClient, AuthenticationClient } = require('auth0')

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

const app = express()

const handler = async event => {
  if (event.op === 'UPDATE') {
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

    await auth0.updateUserMetadata({
      authorization: {
        groups: [userRole],
      },
    })
  }

  if (event.op === 'DELETE') {
    await auth0.deleteUser({ id: event.data.old.auth0id })
  }

  if (event.op === 'INSERT') {
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

    if (event.data.new.role === 'JUDGE' || event.data.new.role === 'ADMIN') {
      await auth0
        .createUser(createUserOpts)
        .then(async () => {
          // Send off a password change email
          await auth0A
            .requestChangePasswordEmail({
              email: event.data.new.email,
              connection: `${process.env.AUTH0_CONNECTION}`,
            })
            .catch(err => console.log(err))
        })
        .catch(async err => {
          // If the user already exists (409), then just resent the password change email
          if (err.statusCode === 409) {
            await auth0A
              .requestChangePasswordEmail({
                email: event.data.new.email,
                connection: `${process.env.AUTH0_CONNECTION}`,
              })
              .catch(err => console.log(err))
          }
        })
    }
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
