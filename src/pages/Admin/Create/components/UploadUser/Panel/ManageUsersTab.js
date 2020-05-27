import React, { useReducer, useEffect } from 'react'
import PropTypes from 'prop-types'
import { Query, Mutation } from 'react-apollo'
import gql from 'graphql-tag'

// Styles
import { H4, InputGroup, Button, Checkbox, HTMLSelect } from '@blueprintjs/core'
import { IconNames } from '@blueprintjs/icons'

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

const USER_LIST = gql`
  query userList($teamId: uuid!) {
    user_team(where: { team_id: { _eq: $teamId } }) {
      user {
        uuid
        username
        email
      }
    }
  }
`

const TRANSFER_USER_TO_TEAM = gql`
  mutation transferUserToTeam($teamId: uuid!, $users: [uuid!]!) {
    update_user_team(_set: { team_id: $teamId }, where: { user_id: { _in: $users } }) {
      affected_rows
    }
  }
`

const ADD_USER_TO_TEAM = gql`
  mutation addUserToTeam($teamId: uuid!, $email: String!, $username: String!) {
    insert_user_team(
      objects: [
        {
          team_id: $teamId
          user: {
            data: {
              avatar: ""
              email: $email
              username: $username
              nickname: ""
              role: "CONTESTANT"
            }
          }
        }
      ]
    ) {
      affected_rows
    }
  }
`

// NOTE: There seems to be a bug where sometimes the cache isn't being updated, so we force a network-only fetchPolicy here"
const TeamSelect = ({ values, handleChange, teamId, eventId }) => (
  <Query query={TEAMS_QUERY} fetchPolicy="network-only" variables={{ eventId }} skip={!eventId}>
    {({ data, loading }) => {
      if (!data) return null
      if (loading) return null

      if (!Array.isArray(data.event) || !data.event.length) {
        return <div>No Events Created Yet</div>
      }

      return (
        <HTMLSelect name="eventID" value={teamId} onChange={handleChange} fill large>
          <React.Fragment>
            <option value="" defaultValue="" hidden>
              Choose a team
            </option>
            {data.event[0].team_events.map(({ team }) => (
              <option key={team.uuid} value={team.uuid}>
                {team.name}
              </option>
            ))}
          </React.Fragment>
        </HTMLSelect>
      )
    }}
  </Query>
)

TeamSelect.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  values: PropTypes.any.isRequired,
  handleChange: PropTypes.func.isRequired,
}

const initialState = {
  teamId: null,
  username: null,
  email: null,
  checkedItems: new Map(),
  transferId: null,
}

const ManageUsersTab = ({ eventId }) => {
  const [formState, dispatch] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    initialState,
  )

  // =================================================
  // Change Handlers
  // =================================================
  const handleSelect = e => {
    dispatch({ teamId: e.target.value })
  }

  const handleInputChange = e => {
    dispatch({ [e.target.name]: e.target.value })
  }

  const handleCheckBox = e => {
    const { name, checked } = e.target
    dispatch({ checkedItems: formState.checkedItems.set(name, checked) })
  }

  const handleTransferSelect = e => {
    dispatch({ transferId: e.target.value })
  }

  const { username, email, teamId, transferId, checkedItems } = formState
  return (
    <div>
      <TeamSelect eventId={eventId} teamId={teamId} handleChange={handleSelect} />
      <Query query={USER_LIST} variables={{ teamId }}>
        {({ data, loading, error }) => {
          if (!data) return null
          if (loading) return <div>Loading...</div>
          if (error) return <div>Error...</div>

          if (teamId === null) {
            return <H4>Select a user from the dropdown</H4>
          }

          if (!Array.isArray(data.user_team) || !data.user_team.length) {
            return (
              <table style={{ width: '100%', marginTop: 10 }}>
                <thead>
                  <td>Username</td>
                  <td>Email</td>
                  <td />
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <InputGroup name="username" value={username} onChange={handleInputChange} />
                    </td>
                    <td>
                      <InputGroup name="email" value={email} onChange={handleInputChange} />
                    </td>
                    <td>
                      <Mutation
                        mutation={ADD_USER_TO_TEAM}
                        refetchQueries={[{ query: USER_LIST, variables: { teamId } }]}
                      >
                        {insert_user_team => (
                          <Button
                            intent="primary"
                            icon={IconNames.PLUS}
                            fill
                            onClick={() => {
                              insert_user_team({
                                variables: {
                                  email,
                                  username,
                                  teamId,
                                },
                              })
                              dispatch({
                                email: '',
                                username: '',
                              })
                            }}
                          />
                        )}
                      </Mutation>
                    </td>
                  </tr>
                </tbody>
              </table>
            )
          }

          return (
            <div style={{ marginTop: 10 }}>
              <table style={{ width: '100%' }}>
                <thead>
                  <td>Username</td>
                  <td>Email</td>
                  <td />
                </thead>
                <tbody>
                  {data.user_team.map(({ user }) => (
                    <tr key={user.uuid}>
                      <td>{user.username}</td>
                      <td>{user.email}</td>
                      <td>
                        <Checkbox
                          name={user.uuid}
                          checked={checkedItems.get(user.uuid)}
                          onChange={handleCheckBox}
                          large
                          style={{ width: '100%' }}
                        />
                      </td>
                    </tr>
                  ))}
                  <tr>
                    <td>
                      <InputGroup name="username" value={username} onChange={handleInputChange} />
                    </td>
                    <td>
                      <InputGroup name="email" value={email} onChange={handleInputChange} />
                    </td>
                    <td>
                      <Mutation
                        mutation={ADD_USER_TO_TEAM}
                        refetchQueries={[{ query: USER_LIST, variables: { teamId } }]}
                      >
                        {insert_user_team => (
                          <Button
                            intent="primary"
                            icon={IconNames.PLUS}
                            fill
                            onClick={() => {
                              insert_user_team({
                                variables: {
                                  email,
                                  username,
                                  teamId,
                                },
                              })
                              dispatch({
                                email: '',
                                username: '',
                              })
                            }}
                          />
                        )}
                      </Mutation>
                    </td>
                  </tr>
                </tbody>
              </table>
              <div className="container">
                <hr className="hr-text" data-content="TRANSFER USER" />
                <TeamSelect
                  eventId={eventId}
                  teamId={transferId}
                  handleChange={handleTransferSelect}
                />
                <Mutation
                  mutation={TRANSFER_USER_TO_TEAM}
                  refetchQueries={[
                    { query: USER_LIST, variables: { teamId: transferId } },
                    { query: USER_LIST, variables: { teamId } },
                  ]}
                >
                  {update_user_team => (
                    <Button
                      intent="primary"
                      large
                      style={{ marginTop: 10 }}
                      onClick={() => {
                        update_user_team({
                          variables: {
                            teamId: transferId,
                            users: [...checkedItems.keys()],
                          },
                        }).then(() =>
                          dispatch({
                            checkedItems: new Map(),
                            transferId: null,
                          }),
                        )
                      }}
                    >
                      Confirm
                    </Button>
                  )}
                </Mutation>
              </div>
            </div>
          )
        }}
      </Query>
    </div>
  )
}

export default ManageUsersTab
