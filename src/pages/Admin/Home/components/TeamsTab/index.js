import React, { useState } from 'react'
import { useSubscription, useMutation } from '@apollo/react-hooks'
import gql from 'graphql-tag'

// Styles
import { H4, Button } from '@blueprintjs/core'

// Custom Components
import Can from '@shared/components/AuthContext/Can'
import { SlidingPanelConsumer } from '@shared/components/SlidingPane'
import SettingsPanel from '../IncomingFeed/SettingsPanel'

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
        uuid
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

const REMOVE_JUDGE_TEAM = gql`
  mutation removeJudgeTeam($judgeID: uuid!, $teamID: uuid!) {
    delete_judge_team(where: { judge_id: { _eq: $judgeID }, team_id: { _eq: $teamID } }) {
      affected_rows
    }
  }
`

const ASSIGNED_JUDGED_QUERY = gql`
  query assignedJudges($judgeID: uuid!) {
    judge_team(where: { judge_id: { _eq: $judgeID } }, order_by: { team: { name: asc } }) {
      team {
        name
        uuid
      }
    }
  }
`

const TEAM_COUNT_QUERY = gql`
  query teamCount($judgeID: uuid!) {
    judge_team_aggregate(where: { judge_id: { _eq: $judgeID } }) {
      aggregate {
        count
      }
    }
  }
`

const TeamsTab = () => {
  // GraphQL Layer
  const { data, loading } = useSubscription(TEAMS_NEED_ASSIGNMENT)
  const [removeJudgeTeam, removeJudgeResult] = useMutation(REMOVE_JUDGE_TEAM)

  // Handlers
  const handleUnassignJudge = (judge, team) => {
    removeJudgeTeam({
      variables: {
        judgeID: judge,
        teamID: team,
      },
      refetchQueries: [
        { query: TEAM_COUNT_QUERY, variables: { judgeID: judge } },
        { query: ASSIGNED_JUDGED_QUERY, variables: { judgeID: judge } },
      ],
    })
  }

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
                <Can
                  allowedRole="ctf_admin"
                  yes={() => (
                    <SlidingPanelConsumer>
                      {({ openSlider }) => (
                        <Button
                          intent="primary"
                          large
                          onClick={() => openSlider(SettingsPanel, { team: team.uuid })}
                        >
                          Assign
                        </Button>
                      )}
                    </SlidingPanelConsumer>
                  )}
                />
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
              <Can
                allowedRole="ctf_admin"
                yes={() => (
                  <Button
                    intent="primary"
                    large
                    onClick={() => handleUnassignJudge(team.judge_teams[0].user.uuid, team.uuid)}
                  >
                    Unassign
                  </Button>
                )}
              />
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
