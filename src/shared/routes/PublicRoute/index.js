import React from 'react'
import PropTypes from 'prop-types'
import { Route } from 'react-router-dom'

const PublicRoute = ({ layout: Layout, component: Component, ...rest }) => (
  <Route
    {...rest}
    render={matchProps => (
      <Layout>
        <Component {...matchProps} />
      </Layout>
    )}
  />
)

PublicRoute.propTypes = {
  layout: PropTypes.func.isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  component: PropTypes.any.isRequired,
  // eslint-disable-next-line react/require-default-props
  rest: PropTypes.objectOf(PropTypes.object),
}

export default PublicRoute
