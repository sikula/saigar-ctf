import React from 'react'
import PropTypes from 'prop-types'
import { AuthConsumer } from '../../components/AuthContext/context'

const AuthCallback = ({ history }) => (
  <AuthConsumer>
    {({ handleAuthentication }) => {
      handleAuthentication().then(res => {
        const { groups } = res.idTokenPayload['https://ctf.saigar.io/roles']
        if (
          groups.includes('ctf_admin') ||
          groups.includes('judge') ||
          groups.includes('super_admin')
        ) {
          history.replace('/home')
        } else if (groups.includes('contestant')) {
          history.replace('/challenges')
        } else {
          history.replace('/404')
        }
      })

      return <div>Loading.........</div>
    }}
  </AuthConsumer>
)

AuthCallback.propTypes = {
  history: PropTypes.shape({
    replace: PropTypes.func.isRequired,
  }).isRequired,
}
export default AuthCallback
