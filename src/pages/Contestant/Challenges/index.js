import React, { useContext } from 'react'
import { Link } from 'react-router-dom'
import { Query } from 'react-apollo'
import { useQuery } from '@apollo/react-hooks'
import { isWithinInterval } from 'date-fns'

import gql from 'graphql-tag'

// Styles
import { H2, H4, H5 } from '@blueprintjs/core'

// Custom Components
import { AuthContext } from '@shared/components/AuthContext/context'
// import { CASE_LIST } from './graphql/queries'
import Can from '../../../shared/components/AuthContext/Can'

import CaseGrid from './components/CaseGrid'
import TosDialog from './components/TosDialog'
import TeamDialog from './components/TeamDialog'

const EVENT_START_TIME = gql`
  query eventInfo {
    event(order_by: { start_time: desc }, limit: 1) {
      start_time
      end_time
    }
  }
`

const USER_INFO = gql`
  query userInfo($auth0id: String!) {
    user(where: { auth0id: { _eq: $auth0id } }) {
      acceptedTos
    }
    team(where: { user_team: { user: { auth0id: { _eq: $auth0id } } } }) {
      name
      uuid
    }
  }
`

const CASE_LIST = gql`
  query eventCases($auth0id: String!) {
    event(order_by: { start_time: desc }, limit: 1) {
      eventCasesByeventId {
        case {
          uuid
          name
          missing_since
          missing_from
          pendingSubmissions: submissions_aggregate(
            where: {
              processed: { _eq: "PENDING" }
              teamByteamId: { user_team: { user: { auth0id: { _eq: $auth0id } } } }
            }
          ) {
            aggregate {
              count
            }
          }
          acceptedSubmissions: submissions_aggregate(
            where: {
              processed: { _in: ["ACCEPTED", "STARRED"] }
              teamByteamId: { user_team: { user: { auth0id: { _eq: $auth0id } } } }
            }
          ) {
            aggregate {
              count
            }
          }
          rejectedSubmissions: submissions_aggregate(
            where: {
              processed: { _eq: "REJECTED" }
              teamByteamId: { user_team: { user: { auth0id: { _eq: $auth0id } } } }
            }
          ) {
            aggregate {
              count
            }
          }
        }
      }
    }
  }
`

const CasesList = () => {
  // State Layer
  const { user } = useContext(AuthContext)

  // GraphQL Layer
  const { error, loading, data } = useQuery(CASE_LIST, {
    pollInterval: 120000,
    variables: {
      auth0id: user.id,
    },
  })

  if (loading) return null
  if (error) return <div>{error.message}</div>

  const cases = data.event[0].eventCasesByeventId


  // @TODO(peter): Ensure that the event registration is done, then show the "event hasn't started message"
  return (
    <React.Fragment>
      <div className="row">
        <div className="col-xs">
          <CaseGrid cases={cases} />
        </div>
      </div>
    </React.Fragment>
  )
}

const ChallengesPage = () => {
  const { user } = useContext(AuthContext)

  // GraphQL Layer
  const { error, loading, data } = useQuery(EVENT_START_TIME)
  const { error: userError, loading: userLoading, data: userData } = useQuery(USER_INFO, {
    variables: {
      auth0id: user.id
    }
  })

  if (loading || userLoading) return null
  if (error || userError) return <div>{error.message}{userError.message}</div>

  if (!Array.isArray(data.event) || !data.event.length) {
    return <div>No Events Created yet</div>
  }

  const eventStarted = isWithinInterval(
    new Date(), // current Date
    {
      start: new Date(data.event[0].start_time),
      end: new Date(data.event[0].end_time)
    },
  )

  if (userData.team.length === 0) {
    return <TeamDialog />
  }

  if (userData.user[0].acceptedTos === false) {
    return <TosDialog />
  }

  const team = userData.team[0]

  return (
    <Can allowedRole="contestant" yes={() => (
      <React.Fragment>
        <nav className="challenges" style={{ background: '#fff' }}>
          <div>
            <ul>
              <li>
                <Link to="/rules">Rules</Link>
              </li>
              <li>
                <Link to="/resources">Resources</Link>
              </li>
            </ul>
          </div>
        </nav>
        <div className="row">
          <div className="col-xs">
            <div style={{ margin: 15 }}>
              <H2>{team.name}</H2>
              <H5>TEAM CODE: {team.uuid}</H5>
            </div>
          </div>
        </div>
        {!eventStarted ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '80%'
            }}
          >
            <div style={{ maxWidth: '50%' }}>
              <H2 style={{ textAlign: 'center' }}>Event Hasn't Started Yet</H2>
              <H4>Refresh the page once the event has officially begun</H4>
            </div>
          </div>
        ) : (
            <CasesList />
          )}
        {userData.team.length === 0 && <TeamDialog />}
        {userData.user[0].acceptedTos === false && <TosDialog />}
      </React.Fragment>
    )}
    />
  )

}

export default ChallengesPage
