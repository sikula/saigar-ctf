import React from 'react'
import PropTypes from 'prop-types'
import { Route, Redirect } from 'react-router-dom'

import { AuthConsumer } from '../../components/AuthContext/context'

const PrivateRoute = ({ layout: Layout, component: Component, ...rest }) => (
  <Route
    {...rest}
    render={matchProps => (
      <AuthConsumer>
        {({ authenticated }) =>
          authenticated ? (
            <Layout pathname={matchProps.location.pathname}>
              <Component {...matchProps} />
            </Layout>
          ) : (
            <Redirect to={{ pathname: '/login', state: { from: matchProps.location } }} />
          )
        }
      </AuthConsumer>
    )}
  />
)

PrivateRoute.propTypes = {
  layout: PropTypes.func.isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  component: PropTypes.any.isRequired,
  // eslint-disable-next-line react/require-default-props
  rest: PropTypes.objectOf(PropTypes.object),
}

export default PrivateRoute
