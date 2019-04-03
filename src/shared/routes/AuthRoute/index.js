import React from 'react'

import { AuthConsumer } from '../../components/AuthContext/context'

const AuthCallback = ({ history }) => (
  <AuthConsumer>
    {({ handleAuthentication }) => {
      handleAuthentication().then(res => {
        const { groups } = res.idTokenPayload['https://ctf.saigar.io/roles']
        if (groups.includes('ctf_admin') || groups.includes('judge')) {
          const url = JSON.parse(localStorage.getItem('redirectBackTo')).pathname || '/home'
          history.replace(url)
        }
        if (groups.includes('contestant')) {
          const url = JSON.parse(localStorage.getItem('redirectBackTo')).pathname || '/challenges'
          history.replace(url)
        }
      })

      return <div>Loading.........</div>
    }}
  </AuthConsumer>
)

export default AuthCallback
