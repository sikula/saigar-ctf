import React from 'react'
import { Link } from 'react-router-dom'
import { Query } from 'react-apollo'

// Custom Components
import { CASE_LIST } from './graphql/queries'
import Can from '../../../shared/components/AuthContext/Can'

import CaseGrid from './components/CaseGrid'
import TosDialog from './components/TosDialog'

const ChallengesPage = () => (
  <Can
    allowedRole="contestant"
    yes={() => (
      <Query query={CASE_LIST}>
        {({ data, loading, error }) => {
          if (loading) return null
          if (error) return <div>{error.message}</div>

          const cases = data.case
          const user = data.user[0]

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
                  {user.acceptedTos === false && <TosDialog />}
                  <CaseGrid cases={cases} />
                </div>
              </div>
            </React.Fragment>
          )
        }}
      </Query>
    )}
  />
)

export default ChallengesPage
