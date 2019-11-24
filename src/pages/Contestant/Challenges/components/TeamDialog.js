import React, { useState, useContext } from 'react'
import { useMutation, useQuery } from '@apollo/react-hooks'
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
      user(where: {
          auth0id: { _eq: $auth0id }
      }) {
          uuid
      }
  }
`

const CREATE_TEAM = gql`
    mutation createTeam($name: String!) {
        insert_team(objects: {
            name: $name
        }) {
            returning {
                uuid
            }
        }
    }
`

const ADD_USER_TO_TEAM = gql`
    mutation insertUserTeam($team: uuid!, $user: uuid!) {
        insert_user_team(objects: {
            user_id: $user,
            team_id: $team
        }) {
            returning {
                team_id
                user_id
            }
        }
    }
`

const ADD_TEAM_TO_EVENT = gql`
    mutation insertTeamEvent($team: uuid!, $event: uuid!) {
        insert_team_event(objects: {
            team_id: $team,
            event_id: $event
        }) {
            returning {
                team_id,
                event_id
            }
        }
    }
`


// @NOTE(Peter): this is a duplicate of what's in ../index.js

const CASE_LIST = gql`
  query eventCases($auth0id: String!) {
    user(where: { auth0id: { _eq: $auth0id } }) {
      acceptedTos
    }
    team(where: { user_team: { user: { auth0id: { _eq: $auth0id } } } }) {
      name
    }
    event(order_by: { start_time: desc }, limit: 1) {
      eventCasesByeventId {
        case {
          uuid
          name
          missing_since
          missing_from
          pendingSubmissions: submissions_aggregate(
            where: {
              processed: { _eq: "PENDING" }
              teamByteamId: { user_team: { user: { auth0id: { _eq: $auth0id } } } }
            }
          ) {
            aggregate {
              count
            }
          }
          acceptedSubmissions: submissions_aggregate(
            where: {
              processed: { _in: ["ACCEPTED", "STARRED"] }
              teamByteamId: { user_team: { user: { auth0id: { _eq: $auth0id } } } }
            }
          ) {
            aggregate {
              count
            }
          }
          rejectedSubmissions: submissions_aggregate(
            where: {
              processed: { _eq: "REJECTED" }
              teamByteamId: { user_team: { user: { auth0id: { _eq: $auth0id } } } }
            }
          ) {
            aggregate {
              count
            }
          }
        }
      }
    }
  }
`


// @NOTE(Peter): this is a very quick hack for conditionally
// rendering the proper dialog.  We could try using the
// new React hooks with thte useReducer hook or something
// to make this cleaner.  This works for now though
const TeamDialog = () => {
    const [isOpen, setIsOpen] = useState(true)
    const [buttonPressed, setButtonPressed] = useState(null)
    const [teamCode, setTeamCode] = useState()
    const [teamName, setTeamName] = useState()

    const { user } = useContext(AuthContext)

    const { data: eventData } = useQuery(EVENT_ID)
    const { data: userData } = useQuery(GET_USER, {
        variables: {
            auth0id: user.id
        }
    })

    const [createTeam, { error, loading, data }] = useMutation(CREATE_TEAM, {
        variables: {
            name: teamName
        }
    })

    const [addUserToTeam] = useMutation(ADD_USER_TO_TEAM)
    const [addTeamToEvent] = useMutation(ADD_TEAM_TO_EVENT, {
        refetchQueries: [{ query: CASE_LIST, variables: {
            auth0id: user.id
        } }]
    })

    if (eventData) {
        console.log("EVENT DATA ", eventData)
    }

    if (userData) {
        console.log("USER DATA ", userData)
    }

    // ======================================================
    // Handlers
    // ======================================================

    // @NOTE(peter): This is so ugly... but it works....
    const handleClose = () => {
        if (buttonPressed === "JOIN") {
            // do stuff here to join team
        }
        if (buttonPressed === "CREATE") {
            createTeam()
                .then(({ data }) => {
                    addUserToTeam({
                        variables: {
                            team: data.insert_team.returning[0].uuid,
                            user: userData.user[0].uuid,
                        }
                    }).then(({ data }) => {
                        addTeamToEvent({
                            variables: {
                                team: data.insert_user_team.returning[0].team_id,
                                event: eventData.event[0].uuid
                            }
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
                    <Button large fill intent="primary" onClick={() => setButtonPressed("JOIN")} style={{ marginRight: 10 }}>Join a Team</Button>
                    <Button large fill intent="primary" onClick={() => setButtonPressed("CREATE")}>Create a Team</Button>
                </span>
                {buttonPressed && buttonPressed === "JOIN" && (
                    <div style={{ margin: "20px 0px" }}>
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
                    </div>
                )}
                {buttonPressed && buttonPressed === "CREATE" && (
                    <div style={{ margin: "20px 0px" }}>
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
                    <Button
                        disabled={!teamName}
                        large
                        intent="primary"
                        onClick={handleClose}
                    >
                        Confirm
                    </Button>
                </div>
            </div>
        </Dialog>
    )
}

export default TeamDialog
