import React from 'react'
import { Route, Switch, Redirect } from 'react-router-dom'

/* Custom Routes */
import PrivateRoute from '@common/components/PrivateRoute'
import PublicRoute from '@common/components/PublicRoute'

/* Layouts */
import DefaultLayout from '../layouts/Default'
import ScoreboardLayout from '../layouts/Scoreboard'

/* Custom Components */
import IncomingFeed from './private/Home/components/IncomingFeed'

/* Route Components */
const AsyncHomePage = React.lazy(() => import(/* webpackChunkName: "HomePage" */ './private/Home'))
const AsyncCreatePage = React.lazy(() =>
  import(/* webpackChunkName: "CreatePage" */ './private/Create'),
)
const AsyncSubmissionPage = React.lazy(() =>
  import(/* webpackChunkName: "SubmissionPage" */ './private/Submission'),
)
const AsyncScoreboardPage = React.lazy(() =>
  import(/* webpackChunkName: "ScoreBoardPage" */ './public/ScoreBoard'),
)

const CtfRoutes = ({ match }) => (
  <Switch>
    <Redirect exact from="/" to="/home" />
    <PrivateRoute
      exact
      path={`${match.url}home`}
      layout={props => <DefaultLayout showFeed {...props} feed={<IncomingFeed />} />}
      component={AsyncHomePage}
    />
    <PrivateRoute
      exact
      path={`${match.url}create`}
      layout={DefaultLayout}
      component={AsyncCreatePage}
    />
    <PrivateRoute
      exact
      path={`${match.url}submission/:submissionID`}
      layout={props => <div {...props} />}
      component={AsyncSubmissionPage}
    />
    <PublicRoute
      exact
      path={`${match.url}scoreboard`}
      layout={ScoreboardLayout}
      component={AsyncScoreboardPage}
    />
  </Switch>
)

export default CtfRoutes
