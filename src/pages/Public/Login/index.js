import React, { useState } from 'react'

// Styles
import { Button, FormGroup, InputGroup } from '@blueprintjs/core'

const LoginPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const validate = () => {
    return email.length > 0 && password.length > 0
  }

  // const handleSubmit = (event) => event.preventDefault()
  const handleLogin = () => {
    fetch('http://localhost:8080/signin', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        Accepts: 'application/json',
      },
      body: JSON.stringify({ email, password }),
    }).then((response) => console.log(response.status))
  }

  return (
    <div
      style={{
        width: '100%',
        height: '100vh',
        background: 'rgb(239, 243, 245)',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
      }}
    >
      <div
        style={{ display: 'flex', flexDirection: 'column', width: '100%', alignItems: 'center' }}
      >
        <div
          style={{
            margin: '0 auto',
            width: '480px',
            background: '#FFF',
            boxShadow: 'rgba(12, 52, 75, 0.05) 0px 3px 3px',
            borderRadius: '8px',
          }}
        >
          <div
            style={{
              width: '100%',
              borderBottom: '1px solid #ece7e7',
              textAlign: 'center',
              paddingTop: 10,
              paddingBottom: 10,
            }}
          >
            <h2 style={{ fontWeight: 500 }}>
              Login to <span style={{ fontWeight: 600 }}>Saigar CE</span>
            </h2>
          </div>
          <div style={{ margin: 30 }}>
            <FormGroup label="Email" labelFor="text-input">
              <InputGroup
                id="text-input"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@gmail.com"
                large
              />
            </FormGroup>
            <FormGroup label="Password" labelFor="text-input">
              <InputGroup
                id="text-input"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                large
                type="password"
              />
            </FormGroup>
            <Button fill large disabled={!validate()} onClick={handleLogin}>
              Login
            </Button>
          </div>
          <div
            style={{
              borderTop: '1px solid #ece7e7',
              padding: 20,
              textAlign: 'center',
            }}
          >
            Forgot password?
          </div>
        </div>
        <div style={{ color: '#000', padding: 10 }}>
          Powered by <span style={{ fontWeight: 600 }}>Saigar</span>|{' '}
          <a href="https://github.com/sikula/saigar-ctf" target="_blank">
            Github
          </a>{' '}
        </div>
      </div>
    </div>
  )
}

export default LoginPage
