import React from 'react'
import { Query } from 'react-apollo'
import gql from 'graphql-tag'

// Styles
import { H5 } from '@blueprintjs/core'
import './index.scss'

const TEAM_QUERY = gql`
  query getTeams($eventId: uuid!) {
    team_event(
      order_by: { event: { start_time: desc }, team: { name: asc } }
      where: { event_id: { _eq: $eventId } }
    ) {
      team(order_by: { name: asc }) {
        uuid
        name
      }
    }
  }
`

const EVENT_QUERY = gql`
  query eventQuery {
    event(order_by: { start_time: desc }, limit: 1) {
      uuid
    }
  }
`

const TeamsPage = () => (
  <div style={{ padding: 25, width: '75%', margin: '0 auto' }}>
    <Query query={EVENT_QUERY}>
      {({ loading, data: eventData }) =>
        !loading ? (
          <Query query={TEAM_QUERY} variables={{ eventId: eventData.event[0].uuid }}>
            {({ data, loading, error }) => {
              if (loading) return <div>Loading...</div>
              if (error) return <div>{error.message}</div>

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
        ) : null
      }
    </Query>
  </div>
)

export default TeamsPage
