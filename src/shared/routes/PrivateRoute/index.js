import React from 'react'
import { Route, Redirect } from 'react-router-dom'

import { injectAsyncReducer } from '@app/config/reducer'
import configureStore from '@app/config/store'
import { AuthConsumer } from '../../components/AuthContext/context'

const PrivateRoute = ({ layout: Layout, component: Component, featureName, ...rest }) => (
  /*
    @NOTE(Peter):
      I don't know if this is the best way to do this... but it is one way.  It might
      be better just to wrap <Component> in an <AsyncComponent> which injects the
      proper, but I think for now it is ok and we can always change it if we run
      into anyy problems.

    @TODO(Peter):
      Should also make sure were throwing an error if the featureName passed to the
      route component isn't valid, that shouldn't be too difficult though
  */
  // if (featureName != null || featureName !== undefined) {
  //   import(`@features/${featureName}/redux/reducer`).then(({ default: reducer }) => {
  //     injectAsyncReducer(configureStore, { key: featureName, reducer })
  //   })
  // }

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

export default PrivateRoute
