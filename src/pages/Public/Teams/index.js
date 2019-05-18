import React from 'react'
import { Query } from 'react-apollo'
import gql from 'graphql-tag'

// Styles
import { H5 } from '@blueprintjs/core'
import './index.scss'

const TEAM_QUERY = gql`
  query teamList {
    team_event(order_by: { event: { start_time: desc } }) {
      team {
        uuid
        name
      }
    }
  }
`

const TeamsPage = () => (
  <div style={{ padding: 25, width: '75%', margin: '0 auto' }}>
    <Query query={TEAM_QUERY}>
      {({ data, loading, error }) => {
        if (loading) return <div />
        if (error) return <div />

        if (!Array.isArray(data.team_event) || !data.team_event.length) {
          return <H5>No registered teams</H5>
        }

        return data.team_event.map(({ team }) => (
          <div key={team.uuid} className="team-list">
            <div className="team-name">{team.name}</div>
          </div>
        ))
      }}
    </Query>
  </div>
)

export default TeamsPage
