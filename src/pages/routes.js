import React from 'react'
import PropTypes from 'prop-types'
import { Switch, Redirect } from 'react-router-dom'

/* Custom Routes */
import PrivateRoute from '@shared/routes/PrivateRoute'
import PublicRoute from '@shared/routes/PublicRoute'

/* Layouts */
import DefaultLayout from '../layouts/Default'
import ScoreboardLayout from '../layouts/Scoreboard'

/* Custom Components */
import IncomingFeed from './Admin/Home/components/IncomingFeed'

/* Route Components */
const AsyncHomePage = React.lazy(() => import(/* webpackChunkName: "HomePage" */ './Admin/Home'))
const AsyncCreatePage = React.lazy(() =>
  import(/* webpackChunkName: "CreatePage" */ './Admin/Create'),
)
const AsyncSubmissionPage = React.lazy(() =>
  import(/* webpackChunkName: "SubmissionPage" */ './Admin/Submission'),
)
const AsyncChallengesPage = React.lazy(() =>
  import(/* webpackChunkName: "ChallengesPage" */ './Contestant/Challenges'),
)
const AsyncScoreboardPage = React.lazy(() =>
  import(/* webpackChunkName: "ScoreBoardPage" */ './Public/ScoreBoard'),
)
const AsyncTermsPage = React.lazy(() =>
  import(/* webpackChunkName: "TermsPage" */ './Public/TermsOfService'),
)
const CtfRoutes = ({ match }) => (
  <Switch>
    <Redirect exact from="/" to="/home" />
    {/* ADMIN ROUTES */}
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

    {/* JUDGE ROUTES */}
    {/* Judge & Admin homepage is the same */}
    <PrivateRoute
      exact
      path={`${match.url}home`}
      layout={props => <DefaultLayout showFeed {...props} feed={<IncomingFeed />} />}
      component={AsyncHomePage}
    />

    {/* CONTESTANT ROUTES !! TEMPORARY !! */}
    <PrivateRoute
      exact
      path={`${match.url}challenges`}
      layout={DefaultLayout}
      component={AsyncChallengesPage}
    />

    {/* PUBLIC ROUTES */}
    <PublicRoute
      exact
      path={`${match.url}scoreboard`}
      layout={ScoreboardLayout}
      component={AsyncScoreboardPage}
    />
    <PublicRoute
      exact
      path={`${match.url}terms-of-service`}
      layout={ScoreboardLayout}
      component={AsyncTermsPage}
    />
  </Switch>
)

CtfRoutes.propTypes = {
  match: PropTypes.shape({
    url: PropTypes.string.isRequired,
  }).isRequired,
}

export default CtfRoutes
