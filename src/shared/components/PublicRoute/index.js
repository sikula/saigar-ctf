import React from 'react'
import { Route } from 'react-router-dom'

const PublicRoute = ({ layout: Layout, component: Component, rest }) => (
  <Route
    {...rest}
    render={matchProps => (
      <Layout>
        <Component {...matchProps} />
      </Layout>
    )}
  />
)

export default PublicRoute
