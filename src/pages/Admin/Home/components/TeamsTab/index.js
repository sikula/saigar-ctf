import React, { useState, useEffect } from 'react'
import { useSubscription, useMutation, useQuery } from '@apollo/react-hooks'
import gql from 'graphql-tag'

// Styles
import { H4, Button, Switch } from '@blueprintjs/core'

// Custom Components
import Can from '@shared/components/AuthContext/Can'
import { SlidingPanelConsumer } from '@shared/components/SlidingPane'
import SettingsPanel from '../IncomingFeed/SettingsPanel'

const TEAMS_NEED_ASSIGNMENT = gql`
  subscription TEAM_ASSIGNMENTS($eventId: uuid) {
    team_event(
      where: { event_id: { _eq: $eventId } }
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
        submissionsByteamId_aggregate(where: { processed: { _in: ["PENDING", "ACCEPTED"] } }) {
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

const EVENT_QUERY = gql`
  query eventQuery {
    event(order_by: { start_time: desc }, limit: 1) {
      uuid
      free_for_all
    }
  }
`

const TOGGLE_FFA = gql`
  mutation toggleFfa($ffa: Boolean!, $event: uuid!) {
    update_event(where: { uuid: { _eq: $event } }, _set: { free_for_all: $ffa }) {
      affected_rows
    }
  }
`

const FFAToggle = ({ ffaChecked, handleFfaClick }) => (
  <div style={{ paddingTop: 10, paddingRight: 20, display: 'flex', justifyContent: 'end' }}>
    <Switch checked={ffaChecked} label="Free For All" onChange={handleFfaClick} />
  </div>
)

const TeamsTab = () => {
  // State Layer
  const [ffaChecked, setFfaChecked] = useState(false)

  // GraphQL Layer
  const { data: eventData, loading: eventLoading } = useQuery(EVENT_QUERY)
  const { data, loading } = useSubscription(TEAMS_NEED_ASSIGNMENT, {
    variables: {
      eventId: eventData && !eventLoading ? eventData.event[0].uuid : null,
    },
  })

  const [toggleFfa, toggleFfaResult] = useMutation(TOGGLE_FFA)
  const [removeJudgeTeam, removeJudgeResult] = useMutation(REMOVE_JUDGE_TEAM)

  useEffect(() => {
    if (!eventLoading) {
      setFfaChecked(eventData.event[0].free_for_all)
    }
  }, [eventLoading])

  // Handlers
  const handleFfaClick = () => {
    toggleFfa({
      variables: {
        ffa: !ffaChecked,
        event: eventData.event[0].uuid,
      },
    }).then(() => setFfaChecked(prevChecked => !prevChecked))
  }

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

  if (loading || eventLoading) return <div>Loading...</div>

  if (ffaChecked) {
    return (
      <React.Fragment>
        <FFAToggle ffaChecked={ffaChecked} handleFfaClick={handleFfaClick} />
        <H4>Free For All Activated</H4>
      </React.Fragment>
    )
  }

  return (
    <React.Fragment>
      <FFAToggle ffaChecked={ffaChecked} handleFfaClick={handleFfaClick} />
      <div style={{ height: 'auto', width: '50%', margin: '0 auto' }}>
        {data.team_event.length < 1 && null}
        {data.team_event.map(({ team }) => {
          if (team.submissionsByteamId_aggregate.aggregate.count < 1) {
            return null
          }

          if (team.judge_teams.length < 1) {
            return (
              <div
                key={team.uuid}
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
                  allowedRole={['super_admin', 'ctf_admin']}
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
              key={team.uuid}
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
                allowedRole={['super_admin', 'ctf_admin']}
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
            </div>
          )
        })}
      </div>
    </React.Fragment>
  )
}

export default TeamsTab
