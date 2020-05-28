import jwtDecode from 'jwt-decode'
import cookie from 'react-cookies'

const check = allowedRole => {
  const token = cookie.load('saigar:id_token')
  const claims = jwtDecode(token)['https://ctf.saigar.io/roles']

  if (claims.groups.some(r => allowedRole.includes(r))) {
    return true
  }

  return false
}

const Can = props => (check(props.allowedRole, props.perform) ? props.yes() : props.no())

Can.defaultProps = {
  yes: () => null,
  no: () => null,
}

export default Can
