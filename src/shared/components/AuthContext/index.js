/* eslint-disable react/sort-comp */

import React from 'react'
import PropTypes from 'prop-types'

import auth0 from 'auth0-js'

import { AuthProvider } from './context'

const auth = new auth0.WebAuth({
  domain: 'sikulatest.auth0.com',
  clientID: 'Unt2d28190M3PXdvEUCLp1oR3p0s4nhA',
  redirectUri:
    process.env.NODE_ENV !== 'production'
      ? 'http://localhost:8084/authcallback'
      : 'https://saigar-ctf-demo.herokuapp.com/authcallback',
  responseType: 'token id_token',
  scope: 'openid profile email',
})

class Auth extends React.Component {
  state = {
    authenticated: false,
    user: {},
    accessToken: '',
  }

  logout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('id_token')
    localStorage.removeItem('expires_at')
    sessionStorage.removeItem('redirectBackTo')

    auth.logout({
      returnTo:
        process.env.NODE_ENV !== 'production'
          ? 'http://localhost:8084/login'
          : 'https://saigar-ctf-demo.herokuapp.com/login',
      clientID: 'Unt2d28190M3PXdvEUCLp1oR3p0s4nhA',
    })

    // this.setState({
    //   authenticated: false,
    //   user: {},
    //   accessToken: '',
    // })
  }

  handleAuthentication = () =>
    new Promise((resolve, reject) => {
      auth.parseHash((err, authResult) => {
        if (err) reject(err)
        if (!authResult || !authResult.idToken) reject(err)
        this.setSession(authResult)
        resolve(authResult)
      })
    })

  initiateLogin = () => {
    auth.authorize({
      connection: 'ctfuser',
    })
  }

  setSession({ accessToken, idToken, expiresIn, idTokenPayload }) {
    const user = {
      id: idTokenPayload.sub,
      email: idTokenPayload.email,
      nickname: idTokenPayload.nickname,
      authorization: idTokenPayload['https://ctf.saigar.io/roles'],
    }
    this.setState({
      authenticated: true,
      accessToken,
      user,
    })

    const expiresAt = JSON.stringify(expiresIn * 1000 + new Date().getTime())

    localStorage.setItem('access_token', accessToken)
    localStorage.setItem('id_token', idToken)
    localStorage.setItem('expires_at', expiresAt)
  }

  render() {
    const authProviderValue = {
      ...this.state,
      initiateLogin: this.initiateLogin,
      logout: this.logout,
      handleAuthentication: this.handleAuthentication,
    }
    const { children } = this.props
    return <AuthProvider value={authProviderValue}>{children}</AuthProvider>
  }
}

Auth.propTypes = {
  children: PropTypes.element.isRequired,
}

export default Auth
