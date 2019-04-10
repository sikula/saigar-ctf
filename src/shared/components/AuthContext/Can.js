import jwtDecode from 'jwt-decode'

const check = allowedRole => {
  const token = localStorage.getItem('id_token')
  const claims = jwtDecode(token)['https://ctf.saigar.io/roles']

  if (claims.groups.includes(allowedRole)) {
    // if (!claims.permissions) {
    //   return false
    // }

    // if (claims.permissions && claims.permissions.includes(action)) {
    //   return true
    // }

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
