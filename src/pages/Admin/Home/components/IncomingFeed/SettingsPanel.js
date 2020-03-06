import React from 'react'
import PropTypes from 'prop-types'

import { Query, Mutation } from 'react-apollo'
import { useQuery, useMutation } from '@apollo/react-hooks'



import gql from 'graphql-tag'

// Styles
import { Icon } from '@blueprintjs/core'
import { IconNames } from '@blueprintjs/icons'

import './SettingsPanel.scss'

// Custom imports
import { SlidingPane } from '@shared/components/SlidingPane'

const ADD_JUDGE_TEAM = gql`
  mutation addJudgeTeam($judgeID: uuid!, $teamID: uuid!) {
    insert_judge_team(objects: { judge_id: $judgeID, team_id: $teamID }) {
      affected_rows
    }
  }
`

const JUDGES_QUERY = gql`
  query judgesList {
    user(where: { role: { _in: ["JUDGE"] } }, order_by: { nickname: asc }) {
      uuid
      nickname
      judge_teams_aggregate {
        aggregate {
          count
        }
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

const JudgesList = ({ team }) => {
  //  GraphQL Layer
  const [addJudgeTeam, addJudgeResult] = useMutation(ADD_JUDGE_TEAM)

  // Handlers
  const handleAssignJudge = uuid => {
    addJudgeTeam({
      variables: {
        judgeID: uuid,
        teamID: team,
      },
      refetchQueries: [
        { query: JUDGES_QUERY },
      ],
    })
  }

  // =================================================================
  // RENDER
  // =================================================================
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
            <div key={usr.uuid}
              style={{
                display: 'inline-flex',
                width: '100%',
                padding: '10px 20px 10px 20px',
                justifyContent: 'space-between',
                borderBottom: '1px solid #e8e1e1',
              }}
            >
              <span style={{ flexBasis: '33.33%' }}>{usr.nickname}</span>
              <span style={{ flexBasis: '33.33%', textAlign: 'center' }}>
                {usr.judge_teams_aggregate.aggregate.count}
              </span>
              <span styled={{ flexBasis: '33.33%', textAlign: 'right' }}>
                <a href="#" onClick={() => handleAssignJudge(usr.uuid)}>
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
      <JudgesList team={otherProps.team} />
    </SlidingPane.Content>
  </SlidingPane>
)

export default SettingsPanel
