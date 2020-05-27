import React from 'react'
import PropTypes from 'prop-types'
import { Switch, Route } from 'react-router-dom'
import { ConnectedRouter as Router } from 'connected-react-router'

/* Features/Code Splitting */

import AuthCallback from '@shared/routes/AuthRoute'
import NotFound from '@shared/routes/NotFound'

import { AuthConsumer } from '@shared/components/AuthContext/context'
import CtfRoutes from '@pages/routes'

/* React Router History */
import history from './history'

import { SlidingPanelRoot, SlidingPanelProvider } from '../../shared/components/SlidingPane'

const LoginPage = ({ location }) => {
  const redirectTo = location.state ? location.state.from : { from: { pathname: '/' } }
  sessionStorage.setItem('redirectBackTo', JSON.stringify(redirectTo))
  return (
    <AuthConsumer>
      {({ initiateLogin }) => {
        initiateLogin()

        return <div>Loading....</div>
      }}
    </AuthConsumer>
  )
}

LoginPage.propTypes = {
  location: PropTypes.shape({
    state: PropTypes.objectOf(PropTypes.object).isRequired,
  }).isRequired,
}

const configureRoutes = () => (
  <Router history={history}>
    <React.Suspense fallback={<div>Loading...</div>}>
      <SlidingPanelProvider>
        {/* SPECIAL ROUTES */}
        <Switch>
          <Route exact path="/authcallback" render={AuthCallback} />
          <Route exact path="/login" render={LoginPage} />
          <Route path="/" component={CtfRoutes} />
          <Route component={NotFound} />
        </Switch>
        <SlidingPanelRoot />
      </SlidingPanelProvider>
    </React.Suspense>
  </Router>
)

export default configureRoutes
