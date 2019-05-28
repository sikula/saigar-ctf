import React from 'react'
import { Link } from 'react-router-dom'
import { Query } from 'react-apollo'
import { isWithinRange } from 'date-fns'

// Styles
import { Card, H2, H4 } from '@blueprintjs/core'

// Custom Components
import { AuthConsumer } from '@shared/components/AuthContext/context'
import { CASE_LIST } from './graphql/queries'
import Can from '../../../shared/components/AuthContext/Can'

import CaseGrid from './components/CaseGrid'
import TosDialog from './components/TosDialog'

const ChallengesPage = () => (
  <Can
    allowedRole="contestant"
    yes={() => (
      <AuthConsumer>
        {({ user }) => (
          <Query query={CASE_LIST} pollInterval={120} variables={{ auth0id: user.id }}>
            {({ data, loading, error }) => {
              if (loading) return null
              if (error) return <div>{error.message}</div>

              const eventStarted = isWithinRange(
                new Date(), // date
                new Date(data.event[0].start_time), // start
                new Date(data.event[0].end_time), // end
              )

              if (!Array.isArray(data.event) || !data.event.length) {
                return <div>No Events Created Yet</div>
              }

              if (!eventStarted) {
                return (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: '100%',
                    }}
                  >
                    <div style={{ maxWidth: '50%' }}>
                      <H2 style={{ textAlign: 'center' }}>Event Hasn't Started Yet</H2>
                      <H4>Refresh the page once the event has officially begun</H4>
                    </div>
                  </div>
                )
              }

              const cases = data.event[0].eventCasesByeventId
              const duser = data.user[0]
              const team = data.team[0]

              return (
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
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-xs">
                      <div style={{ margin: 15, textAlign: 'center' }}>
                        <Card elevation={2}>
                          <div style={{ fontWeight: 350, fontSize: '2.2em', color: '#137cbd' }}>
                            <p>Pending</p>
                            <p>{team.pendingSubmissions.aggregate.count}</p>
                          </div>
                        </Card>
                      </div>
                    </div>
                    <div className="col-xs">
                      <div style={{ margin: 15, textAlign: 'center' }}>
                        <Card elevation={2}>
                          <div style={{ fontWeight: 350, fontSize: '2.2em', color: '#0f9960' }}>
                            <p>Accepted</p>
                            <p>{team.acceptedSubmissions.aggregate.count}</p>
                          </div>
                        </Card>
                      </div>
                    </div>
                    <div className="col-xs">
                      <div style={{ margin: 15, textAlign: 'center' }}>
                        <Card elevation={2}>
                          <div style={{ fontWeight: 350, fontSize: '2.2em', color: '#db3737' }}>
                            <p>Rejected</p>
                            <p>{team.rejectedSubmissions.aggregate.count}</p>
                          </div>
                        </Card>
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-xs">
                      {duser.acceptedTos === false && <TosDialog />}
                      <CaseGrid cases={cases} />
                    </div>
                  </div>
                </React.Fragment>
              )
            }}
          </Query>
        )}
      </AuthConsumer>
    )}
  />
)

export default ChallengesPage
