import React from 'react'
import { Query } from 'react-apollo'
import gql from 'graphql-tag'

import './index.scss'

// const TEAM_QUERY = gql`
//   query teamList {
//     team_event(order_by: { event: { start_time: desc } }, limit: 1) {
//       team {
//         uuid
//         name
//       }
//     }
//   }
// `

const TEAM_QUERY = gql`
  query teamList {
    team {
      uuid
      name
    }
  }
`
const TeamsPage = () => (
  <div style={{ padding: 25, width: '75%', margin: '0 auto' }}>
    <Query query={TEAM_QUERY}>
      {({ data, loading, error }) => {
        if (loading) return <div />
        if (error) return <div />

        return data.team.map(team => (
          <div key={team.uuid} className="team-list">
            <div className="team-name">{team.name}</div>
          </div>
        ))
      }}
    </Query>
  </div>
)

export default TeamsPage

// return data.team_event.map(({ team }) => (
//   <div key={team.uuid} className="team-list">
//     <div className="team-name">{team.name}</div>
//   </div>
// ))
