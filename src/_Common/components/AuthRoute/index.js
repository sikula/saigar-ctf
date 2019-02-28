import React from 'react'

import { AuthConsumer } from '../AuthContext/context'

const AuthCallback = ({ history }) => (
  <AuthConsumer>
    {({ handleAuthentication }) => {
      const url = JSON.parse(localStorage.getItem("redirectBackTo") || '/home')
      handleAuthentication().then(res => {
        history.replace(url)
      })

      return <div>Loading.........</div>
    }}
  </AuthConsumer>
)

export default AuthCallback
