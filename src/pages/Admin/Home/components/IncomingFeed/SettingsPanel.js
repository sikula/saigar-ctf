import React, { useState } from 'react'
import PropTypes from 'prop-types'

import { Query, Mutation } from 'react-apollo'
import { useQuery, useMutation } from '@apollo/react-hooks'

// import { bindActionCreators } from 'redux'
// import { connect } from 'react-redux'

import gql from 'graphql-tag'
import createPersistedState from 'use-persisted-state'

// Styles
import { Icon, Switch, H5, PanelStack } from '@blueprintjs/core'
import { IconNames } from '@blueprintjs/icons'

import './SettingsPanel.scss'

// Custom imports
import { SlidingPane } from '@shared/components/SlidingPane'
import { GET_TEAMS } from '../../graphql/adminQueries'

const useTeamFilterState = createPersistedState('teams')

// TODO(peter): this needs to be cleaned up a bit, we might want to rethink the
// event system and how we requery by event
const EVENT_QUERY = gql`
  query eventQuery {
    event(order_by: { start_time: desc }, limit: 1) {
      uuid
    }
  }
`

const ADD_JUDGE_TEAM = gql`
  mutation addJudgeTeam($judgeID: uuid!, $teamID: uuid!) {
    insert_judge_team(objects: { judge_id: $judgeID, team_id: $teamID }) {
      affected_rows
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

const JUDGES_QUERY = gql`
  query judgesList {
    user(where: { role: { _in: ["JUDGE", "ADMIN"] } }, order_by: { nickname: asc }) {
      uuid
      nickname
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

const TeamListConnector = ({ children }) => {
  return (
    <Query query={EVENT_QUERY}>
      {({ loading, data: eventData }) =>
        !loading ? (
          <Query query={GET_TEAMS} variables={{ eventId: eventData.event[0].uuid }}>
            {({ data, loading, error }) => {
              if (loading) return <div>Loading...</div>
              if (error) return <div>{error.message}</div>

              if (!Array.isArray(data.team_event) || !data.team_event.length) {
                return <H5>No teams are registered for this event</H5>
              }

              return children(data)
            }}
          </Query>
        ) : null
      }
    </Query>
  )
}

const TeamsList = ({ judgeID, closePanel }) => {
  const [selectedTeams, setSelectedTeams] = useTeamFilterState([])
  const [addJudgeTeam, addJudgeResult] = useMutation(ADD_JUDGE_TEAM)
  const [removeJudgeTeam, removeJudgeResult] = useMutation(REMOVE_JUDGE_TEAM)
  const { loading, data } = useQuery(ASSIGNED_JUDGED_QUERY, {
    variables: { judgeID },
    skip: !judgeID,
  })

  const handleTeamToggle = event => {
    const { id, checked } = event.currentTarget

    if (!checked) {
      setSelectedTeams(selectedTeams.filter(team => team !== id))
      removeJudgeTeam({
        variables: {
          judgeID,
          teamID: id,
        },
        refetchQueries: [
          { query: TEAM_COUNT_QUERY, variables: { judgeID } },
          { query: ASSIGNED_JUDGED_QUERY, variables: { judgeID } },
        ],
      })
      closePanel()
    } else {
      setSelectedTeams(selectedTeams.concat(id))
      addJudgeTeam({
        variables: {
          judgeID,
          teamID: id,
        },
        refetchQueries: [
          { query: TEAM_COUNT_QUERY, variables: { judgeID } },
          { query: ASSIGNED_JUDGED_QUERY, variables: { judgeID } },
        ],
      })
      closePanel()
    }
  }

  if (loading) return null
  return (
    <React.Fragment>
      {data.judge_team.length < 1 ? (
        <div style={{ padding: 10, textAlign: 'center' }}>No Assigned Teams</div>
      ) : (
        data.judge_team.map(({ team }) => (
          <div
            style={{
              display: 'inline-flex',
              width: '100%',
              padding: '10px 20px 0px 20px',
              justifyContent: 'space-between',
              borderBottom: '1px solid #e8e1e1',
            }}
            key={team.uuid}
          >
            <span>
              <Switch
                id={team.uuid}
                checked={selectedTeams.indexOf(team.uuid) !== -1}
                onChange={handleTeamToggle}
              />
            </span>
            <span>{team.name}</span>
          </div>
        ))
      )}
      <div style={{ width: '100%', height: '2px', background: 'gray' }} />
      <TeamListConnector>
        {({ team_event: teamEvent }) => (
          <React.Fragment>
            <div
              style={{
                display: 'inline-flex',
                width: '100%',
                padding: '10px 20px 10px 20px',
                justifyContent: 'space-between',
                borderBottom: '1px solid #e8e1e1',
                fontWeight: 800,
                textTransform: 'uppercase',
              }}
            >
              <span>Assigned</span>
              <span>Pending Subs.</span>
              <span>Team Name</span>
            </div>
            {teamEvent.map(({ team }) => (
              <div
                style={{
                  display: 'inline-flex',
                  width: '100%',
                  padding: '10px 20px 0px 20px',
                  justifyContent: 'space-between',
                  borderBottom: '1px solid #e8e1e1',
                }}
                key={team.uuid}
              >
                <span>
                  <Switch
                    id={team.uuid}
                    disabled={selectedTeams.indexOf(team.uuid) !== -1}
                    checked={selectedTeams.indexOf(team.uuid) !== -1}
                    onChange={handleTeamToggle}
                  />
                </span>
                <span>{team.submissionByTeamAggregate.aggregate.count}</span>
                <span>{team.name}</span>
              </div>
            ))}
          </React.Fragment>
        )}
      </TeamListConnector>
    </React.Fragment>
  )
}

const JudgesList = ({ openPanel }) => {
  // Handlers
  const openTeamsPanel = judgeID => {
    openPanel({
      component: TeamsList,
      props: { judgeID },
      title: 'Team List',
    })
  }

  return (
    <Query query={JUDGES_QUERY}>
      {({ data, loading }) =>
        !loading && [
          <div
            style={{
              display: 'inline-flex',
              width: '100%',
              padding: '10px 20px 10px 20px',
              justifyContent: 'space-between',
              borderBottom: '1px solid #e8e1e1',
              fontWeight: 800,
              textTransform: 'uppercase',
            }}
          >
            <span>Username</span>
            <span>No. Teams</span>
            <span>Action</span>
          </div>,
          data.user.map(usr => (
            <div
              style={{
                display: 'inline-flex',
                width: '100%',
                padding: '10px 20px 10px 20px',
                justifyContent: 'space-between',
                borderBottom: '1px solid #e8e1e1',
              }}
              key={usr.uuid}
            >
              <span>{usr.nickname}</span>
              <Query query={TEAM_COUNT_QUERY} variables={{ judgeID: usr.uuid }}>
                {({ data, loading }) =>
                  !loading && <span>{data.judge_team_aggregate.aggregate.count}</span>
                }
              </Query>
              <span>
                <a href="#" onClick={() => openTeamsPanel(usr.uuid)}>
                  Assign
                </a>
              </span>
            </div>
          )),
        ]
      }
    </Query>
  )
}

const SettingsPanel = ({ isOpen, onRequestClose, ...otherProps }) => (
  <SlidingPane
    isOpen={isOpen}
    onRequestClose={onRequestClose}
    closeIcon={<Icon icon={IconNames.MENU_CLOSED} iconSize={20} />}
  >
    <SlidingPane.Header>
      <SlidingPane.Header.Title title="Feed Settings" subtitle="Assign teams to judges" />
      <SlidingPane.Header.Actions onActionClick={onRequestClose}>
        <a>Cancel</a>
      </SlidingPane.Header.Actions>
    </SlidingPane.Header>

    <SlidingPane.Content style={{ paddingLeft: 0, paddingRight: 0, paddingTop: 90 }}>
      <PanelStack
        className="panel-stack"
        initialPanel={{
          component: JudgesList,
          props: {},
          title: 'Judges',
        }}
      />
    </SlidingPane.Content>
  </SlidingPane>
)

export default SettingsPanel
