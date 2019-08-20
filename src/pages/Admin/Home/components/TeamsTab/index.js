import React, { useState } from 'react'
import { useSubscription, useQuery } from '@apollo/react-hooks'
import gql from 'graphql-tag'

// Styles
import { H4, H5, Button } from '@blueprintjs/core'

/*
    NOTE(peter):
        Currently in Hasura there is no way to query by aggregate count, ideally we would
        want to filter for teams whose submission count is greater than 0.

        For now, we just do client side logic.
*/
const TEAMS_NEED_ASSIGNMENT = gql`
  subscription {
    team_event(
      where: { event_id: { _eq: "2ded62b8-1023-4796-b2e4-4566773679bb" } }
      order_by: { team: { submissionsByteamId_aggregate: { count: desc } } }
    ) {
      team {
        name
        judge_teams {
          user {
            uuid
            nickname
          }
        }
        submissionsByteamId_aggregate(where: { processed: { _eq: "PENDING" } }) {
          aggregate {
            count
          }
        }
      }
    }
  }
`

const TeamsTab = () => {
  const { data, loading } = useSubscription(TEAMS_NEED_ASSIGNMENT)

  if (loading) return <div>Loading...</div>

  return (
    <React.Fragment>
      <div style={{ height: 'auto', width: '50%', margin: '0 auto' }}>
        {data.team_event.map(({ team }) => {
          if (team.submissionsByteamId_aggregate.aggregate.count < 1) {
            return null
          }

          if (team.judge_teams.length < 1) {
            return (
              <div
                style={{
                  maxHeight: '100px',
                  width: '100%',
                  background: 'rgba(255, 0, 0, 0.1)',
                  padding: 10,
                  marginBottom: 10,
                  borderRadius: 4,
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'end',
                  justifyContent: 'space-between',
                }}
              >
                <H4>{team.name}</H4>
                <H4>Unassigned</H4>
                <Button intent="primary" large>Assign</Button>
                {/* {JSON.stringify(team)} */}
              </div>
            )
          }

          return (
            <div
              style={{
                maxHeight: '100px',
                width: '100%',
                background: 'rgba(0, 255, 0, 0.1)',
                padding: 10,
                marginBottom: 10,
                borderRadius: 4,
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'end',
                justifyContent: 'space-between',
              }}
            >
              <H4>{team.name}</H4>
              <H4>{team.judge_teams[0].user.nickname}</H4>
              <Button intent="primary" large>Assign</Button>
              {/* <H5>{team.judge_teams[0].user.nickname}</H5> */}
              {/* {JSON.stringify(team)} */}
            </div>
          )
        })}
      </div>
    </React.Fragment>
  )
}

export default TeamsTab
