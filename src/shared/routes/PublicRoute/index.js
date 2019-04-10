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
  layout: PropTypes.element.isRequired,
  component: PropTypes.element.isRequired,
  rest: PropTypes.objectOf(PropTypes.object()).isRequired,
}

export default PublicRoute
