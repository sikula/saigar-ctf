const express = require('express')
const bodyParser = require('body-parser')
const uuid = require('uuid/v4')

const { ManagementClient, AuthenticationClient } = require('auth0')
const sgMailer = require('@sendgrid/mail')

const auth0 = new ManagementClient({
  domain: 'sikulatest.auth0.com',
  clientId: 'uB0gs971j8jWcYicr9b5Dfy5aSN24Bss',
  clientSecret: '7JzhQaxHHIv89yA7p-6Lo9xGiQJvWPQ3q4TIbAPV3S3WE8N4RbhWkinxXmnVOq1L',
  audience: 'https://sikulatest.auth0.com/api/v2/',
})

const auth0A = new AuthenticationClient({
  domain: 'sikulatest.auth0.com',
  clientId: 'uB0gs971j8jWcYicr9b5Dfy5aSN24Bss',
  clientSecret: '7JzhQaxHHIv89yA7p-6Lo9xGiQJvWPQ3q4TIbAPV3S3WE8N4RbhWkinxXmnVOq1L',
  audience: 'https://sikulatest.auth0.com/api/v2/',
})

sgMailer.setApiKey('SENDGRID_API_KEY')

const app = express()

const handler = async event => {
  if (event.op === 'INSERT') {
    // eslint-disable-next-line no-console
    console.log(event)

    // #1 Create User
    const createUserOpts = {
      connection: 'ctfuser',
      email: event.data.new.email,
      username: event.data.new.username,
      password: `${uuid()}`,
      app_metadata: {
        role: 'contestant',
      },
    }

    const { email } = await auth0.createUser(createUserOpts).catch(err => console.log(err))

    // #2 Create Reset Ticket
    // const createResetOpts = {
    //   email,
    //   connection_id: 'con_C7x24ofiVd6bVRXp',
    // }

    await auth0A.requestChangePasswordEmail({
      email: event.data.new.email,
      connection: 'ctf-user',
    })

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

app.listen(process.env.PORT || 5000, () => {
  // eslint-disable-next-line no-console
  console.log('SERVER IS RUNNING')
})
