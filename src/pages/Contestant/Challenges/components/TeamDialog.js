import React, { useState, useEffect, useContext } from 'react'
import { useMutation, useQuery, useApolloClient } from '@apollo/react-hooks'
import gql from 'graphql-tag'

// Styles
import { Button, Dialog, FormGroup, InputGroup, Classes, H3 } from '@blueprintjs/core'

// Data Stuffz
import { AuthContext } from '@shared/components/AuthContext/context'

const EVENT_ID = gql`
  query eventInfo {
    event(order_by: { start_time: desc }, limit: 1) {
      uuid
    }
  }
`

const GET_USER = gql`
  query getUser($auth0id: String!) {
    user(where: { auth0id: { _eq: $auth0id } }) {
      uuid
    }
  }
`

const GET_TEAM_COUNT = gql`
  query teamCount($teamId: uuid!) {
    user_team_aggregate(where: { team_id: { _eq: $teamId } }) {
      aggregate {
        count
      }
    }
  }
`

const FIND_TEAM_BY_CODE = gql`
  query findTeamByCode($code: String!) {
    team_codes(where: { code: { _eq: $code } }) {
      team_id
    }
  }
`

const CREATE_TEAM = gql`
  mutation createTeam($name: String!) {
    insert_team(objects: { name: $name }) {
      returning {
        uuid
      }
    }
  }
`

const ADD_USER_TO_TEAM = gql`
  mutation insertUserTeam($team: uuid!, $user: uuid!) {
    insert_user_team(objects: { user_id: $user, team_id: $team }) {
      returning {
        team_id
        user_id
      }
    }
  }
`

const ADD_TEAM_TO_EVENT = gql`
  mutation insertTeamEvent($team: uuid!, $event: uuid!) {
    insert_team_event(objects: { team_id: $team, event_id: $event }) {
      returning {
        team_id
        event_id
      }
    }
  }
`

const USER_INFO = gql`
  query userInfo($auth0id: String!) {
    user(where: { auth0id: { _eq: $auth0id } }) {
      acceptedTos
    }
    team(where: { user_team: { user: { auth0id: { _eq: $auth0id } } } }) {
      name
      uuid
    }
  }
`

const TeamDialog = () => {
  const [isOpen, setIsOpen] = useState(true)
  const [buttonPressed, setButtonPressed] = useState(null)
  const [teamCode, setTeamCode] = useState()
  const [teamName, setTeamName] = useState()
  const [message, setMessage] = useState()

  const { user } = useContext(AuthContext)

  const { data: eventData } = useQuery(EVENT_ID)
  const { data: userData } = useQuery(GET_USER, {
    variables: {
      auth0id: user.id,
    },
  })

  const [createTeam, { error, loading, data }] = useMutation(CREATE_TEAM, {
    variables: {
      name: teamName,
    },
  })

  const client = useApolloClient()

  const [addUserToTeam] = useMutation(ADD_USER_TO_TEAM, {
    refetchQueries: [{ query: USER_INFO, variables: { auth0id: user.id } }],
  })

  const [addTeamToEvent] = useMutation(ADD_TEAM_TO_EVENT, {
    refetchQueries: [{ query: USER_INFO, variables: { auth0id: user.id } }],
  })

  // ======================================================
  // Handlers
  // ======================================================

  const handleClose = () => {
    if (buttonPressed === 'JOIN') {
      // do stuff here to join team
      client
        .query({
          query: FIND_TEAM_BY_CODE,
          variables: {
            code: teamCode,
          },
        })
        .then(({ data }) => {
          const { team_id } = data.team_codes[0]
          client
            .query({
              query: GET_TEAM_COUNT,
              variables: {
                teamId: team_id,
              },
            })
            .then(({ data }) => {
              const { count } = data.user_team_aggregate.aggregate
              if (count <= 3) {
                addUserToTeam({
                  variables: {
                    team: team_id,
                    user: userData.user[0].uuid,
                  },
                })
              } else {
                setMessage('Max team size of 4 reached')
              }
            })
        })
    }

    if (buttonPressed === 'CREATE') {
      createTeam().then(({ data }) => {
        addUserToTeam({
          variables: {
            team: data.insert_team.returning[0].uuid,
            user: userData.user[0].uuid,
          },
        }).then(({ data }) => {
          addTeamToEvent({
            variables: {
              team: data.insert_user_team.returning[0].team_id,
              event: eventData.event[0].uuid,
            },
          })
        })
      })
      setIsOpen(!isOpen)
    }
  }

  return (
    <Dialog
      isOpen={isOpen}
      autoFocus
      canEscapeKeyClose={false}
      canOutsideClickClose={false}
      className={Classes.DARK}
    >
      <div className={Classes.DIALOG_BODY}>
        <H3>Team Creation</H3>
        <span style={{ display: 'flex', flexDirection: 'row' }}>
          <Button
            large
            fill
            intent="primary"
            onClick={() => setButtonPressed('JOIN')}
            style={{ marginRight: 10 }}
          >
            Join a Team
          </Button>
          <Button large fill intent="primary" onClick={() => setButtonPressed('CREATE')}>
            Create a Team
          </Button>
        </span>
        {buttonPressed && buttonPressed === 'JOIN' && (
          <div style={{ margin: '20px 0px' }}>
            <FormGroup label="Team Code (required)" labelFor="text-input">
              <InputGroup
                id="text-input"
                name="teamCode"
                placeholder="e.g. 212397-123102-123121212"
                large
                values={teamCode}
                onChange={e => setTeamCode(e.target.value)}
              />
            </FormGroup>
            <div>{message}</div>
          </div>
        )}
        {buttonPressed && buttonPressed === 'CREATE' && (
          <div style={{ margin: '20px 0px' }}>
            <FormGroup label="Team Name (required)" labelFor="text-input">
              <InputGroup
                id="text-input"
                name="teamName"
                placeholder="e.g. Elite H4x0rs"
                large
                values={teamName}
                onChange={e => setTeamName(e.target.value)}
              />
            </FormGroup>
          </div>
        )}
      </div>
      <div className={Classes.DIALOG_FOOTER}>
        <div className={Classes.DIALOG_FOOTER_ACTIONS}>
          <Button disabled={!(teamName || teamCode)} large intent="primary" onClick={handleClose}>
            Confirm
          </Button>
        </div>
      </div>
    </Dialog>
  )
}

export default TeamDialog
