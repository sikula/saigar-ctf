/* eslint-disable react/sort-comp */

import React from 'react'
import PropTypes from 'prop-types'

import auth0 from 'auth0-js'

import { AuthProvider } from './context'

import { wsClient } from '../../../_App/config/client'

const auth = new auth0.WebAuth({
  domain: `${process.env.AUTH0_DOMAIN}`,
  clientID: `${process.env.AUTH0_CLIENT_ID}`,
  redirectUri:
    process.env.NODE_ENV !== 'production'
      ? 'http://localhost:8084/authcallback'
      : `${process.env.AUTH0_REDIRECT_URI}`,
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
          : `${process.env.AUTH0_RETURN_TO}`,
      clientID: `${process.env.AUTH0_CLIENT_ID}`,
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

    /*
      Note(peter): There is an issue with the way the subscriptions work that causes the websocket
      client to be initialized before the token is stored and retrieved, thus setting empty headers
      and the authentication failing (blank incoming feed).  This is a quick workaround to fixing it.

      Basically, as soon as we fetch the token, we close and re-open the connection:

      (https://github.com/apollographql/subscriptions-transport-ws/issues/171)
    */
    wsClient.close(true)
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
