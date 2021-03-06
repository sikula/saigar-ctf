import React, { useState } from 'react'
import { Mutation } from 'react-apollo'
import gql from 'graphql-tag'

// Styles
import { Button, InputGroup } from '@blueprintjs/core'
import { IconNames } from '@blueprintjs/icons'

const ADD_USER_TO_EVENT = gql`
  mutation addUserToEvent($eventId: uuid!, $teamName: String!) {
    insert_team_event(objects: [{ team: { data: { name: $teamName } }, event_id: $eventId }]) {
      affected_rows
    }
  }
`

const TEAMS_QUERY = gql`
  query teamList($eventId: uuid!) {
    event(where: { uuid: { _eq: $eventId } }) {
      team_events(order_by: { team: { name: asc } }) {
        team {
          uuid
          name
        }
      }
    }
  }
`

const ManageTeamsTab = ({ eventId }) => {
  const [teamName, setTeamName] = useState()

  const handleChange = e => {
    setTeamName(e.target.value)
  }

  return (
    <div style={{ marginTop: 10 }}>
      <table style={{ width: '100%' }}>
        <thead>
          <td>Team Name</td>
          <td />
        </thead>
        <tbody>
          <tr>
            <td>
              <InputGroup name="teamName" value={teamName} onChange={handleChange} />
            </td>
            <td>
              <Mutation
                mutation={ADD_USER_TO_EVENT}
                refetchQueries={[
                  {
                    query: TEAMS_QUERY,
                    variables: { eventId },
                  },
                ]}
                variables={{ eventId, teamName }}
              >
                {insert_team_event => (
                  <Button intent="primary" icon={IconNames.PLUS} fill onClick={insert_team_event} />
                )}
              </Mutation>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

export default ManageTeamsTab
