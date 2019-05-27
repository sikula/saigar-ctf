import React from 'react'
import PropTypes from 'prop-types'
import { Switch, Redirect } from 'react-router-dom'

/* Custom Routes */
import PrivateRoute from '@shared/routes/PrivateRoute'
import PublicRoute from '@shared/routes/PublicRoute'

/* Layouts */
import Can from '@shared/components/AuthContext/Can'
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
const AsyncRulesPage = React.lazy(() =>
  import(/* webpackChunkName: "RulesPage" */ './Public/Rules'),
)
const AsyncResourcesPage = React.lazy(() =>
  import(/* webpackChunkName: "ResourcesPage" */ './Public/Resources'),
)
const AsyncTeamsPage = React.lazy(() =>
  import(/* webpackChunkName: "TeamsPage" */ './Public/Teams'),
)
const AsyncCategoriesPage = React.lazy(() =>
  import(/* webpackChunkName: "CategoriesPage" */ './Public/Categories'),
)

const CtfRoutes = ({ match }) => (
  <Switch>
    <Redirect exact from="/" to="/login" />
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
    <PublicRoute
      exact
      path={`${match.url}rules`}
      layout={ScoreboardLayout}
      component={AsyncRulesPage}
    />
    <PublicRoute
      exact
      path={`${match.url}resources`}
      layout={ScoreboardLayout}
      component={AsyncResourcesPage}
    />
    <PublicRoute
      exact
      path={`${match.url}terms-of-service`}
      layout={ScoreboardLayout}
      component={AsyncTermsPage}
    />
    <PublicRoute
      exact
      path={`${match.url}teams`}
      layout={ScoreboardLayout}
      component={AsyncTeamsPage}
    />
    <PublicRoute
      exact
      path={`${match.url}categories`}
      layout={ScoreboardLayout}
      component={AsyncCategoriesPage}
    />
  </Switch>
)

CtfRoutes.propTypes = {
  match: PropTypes.shape({
    url: PropTypes.string.isRequired,
  }).isRequired,
}

export default CtfRoutes
