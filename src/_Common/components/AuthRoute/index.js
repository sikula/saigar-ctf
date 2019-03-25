import React from 'react'

import { AuthConsumer } from '../AuthContext/context'

const AuthCallback = ({ history }) => (
  <AuthConsumer>
    {({ handleAuthentication }) => {
      const url = JSON.parse(localStorage.getItem('redirectBackTo')) || '/home'
      handleAuthentication().then(res => {
        const { groups } = res.idTokenPayload['https://ctf.saigar.io/roles']
        if (groups.includes('ctf_admin')) history.replace(url)
        if (groups.includes('judge')) history.replace(url)
        if (groups.includes('contestant')) history.replace('/challenges')
      })

      return <div>Loading.........</div>
    }}
  </AuthConsumer>
)

export default AuthCallback
