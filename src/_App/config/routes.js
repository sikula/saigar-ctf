import React from 'react'
import { Switch, Route, Redirect } from 'react-router-dom'
import { ConnectedRouter as Router } from 'connected-react-router'
import { Button } from '@blueprintjs/core'

/* Features/Code Splitting */

// import Auth from '@common/components/AuthContext'

import AuthCallback from '@common/components/AuthRoute'
import NotFound from '@common/components/NotFound'

import { AuthConsumer } from '@common/components/AuthContext/context'
import CtfRoutes from '@pages/routes'

/* React Router History */
import history from './history'

import { PanelProvider, PanelRoot } from '../../_Common/components/Panel'

/*
  @NOTE(Peter):
    This is the syntax for defining Async Components for Code Splitting
    per-route basis. The React Router Switch statements need to be wrapped
    in Suspense component.

    Lazy/Suspsense does not support SSR as of yet, if we decide we need SSR
    we should use the React-Loadable library.

    Check here for more details (https://blog.logrocket.com/lazy-loading-components-in-react-16-6-6cea535c0b52)
*/
// const TestComponent = React.lazy(() => import(/* webpackChunkName: "TestComponent */ './TestComponentt'))

const LoginPage = ({ location }) => {
  const redirectTo = location.state ? location.state.from : { from: { pathname: '/' } }
  localStorage.setItem('redirectBackTo', JSON.stringify(redirectTo))
  return (
    <AuthConsumer>
      {({ initiateLogin }) => {
        initiateLogin()

        return <div>Loading....</div>
      }}
    </AuthConsumer>
  )
}

const configureRoutes = () => (
  <Router history={history}>
    <React.Suspense fallback={<div>Loading...</div>}>
      <PanelProvider>
        {/* SPECIAL ROUTES */}
        <Switch>
          <Route exact path="/authcallback" render={AuthCallback} />
          <Route exact path="/login" render={LoginPage} />
          <Route
            exact
            path="/logout"
            render={props => (
              <AuthConsumer>
                {({ logout }) => <Button text="logout" onClick={logout} />}
              </AuthConsumer>
            )}
          />
          <Route path="/" component={CtfRoutes} />
          <Route component={NotFound} />
        </Switch>
        <PanelRoot />
      </PanelProvider>
    </React.Suspense>
  </Router>
)

export default configureRoutes
