/* eslint-disable no-unused-vars */
/* eslint-disable jsx-a11y/anchor-is-valid */
import React from 'react'
import PropTypes from 'prop-types'
import { Mutation } from 'react-apollo'
import gql from 'graphql-tag'

import { adopt } from 'react-adopt'
import CsvParse from '@vtex/react-csv-parse'

// Styles
import { Icon } from '@blueprintjs/core'
import { IconNames } from '@blueprintjs/icons'

// Custom Components
import { SlidingPanelConsumer, SlidingPane } from '../../../../../../shared/components/SlidingPane'

const ADD_USERS_TO_TEAM = gql`
  mutation addUserToTeam($objects: [user_team_insert_input!]!) {
    insert_user_team(objects: $objects) {
      returning {
        team_id
      }
    }
  }
  # mutation addUserToTeam {
  #   insert_user_team(objects:[
  #     {
  #       user:{
  #         data:{
  #           nickname:"Peter"
  #           email:"test@test.com"
  #           avatar:"hello"
  #         }
  #       }
  #       team:{
  #         data:{
  #           name:"Saigar Team 4"
  #         }
  #       }
  #     }
  #   ]) {
  #     returning {
  #       team_id
  #     }
  #   }
  # }
`

const ADD_TEAM_TO_EVENT = gql`
  mutation addTeamToEvent($objects: [team_event_insert_input!]!) {
    insert_team_event(objects: $objects) {
      returning {
        team_id
      }
    }
  }
`

const addUsersToTeam = ({ render }) => (
  <Mutation mutation={ADD_USERS_TO_TEAM}>
    {(mutation, result) => render({ mutation, result })}
  </Mutation>
)

const addTeamToEvent = ({ render }) => (
  <Mutation mutation={ADD_TEAM_TO_EVENT}>
    {(mutation, result) => render({ mutation, result })}
  </Mutation>
)

const UserManager = adopt({
  addUsersToTeam,
  addTeamToEvent,
})

class UploadUser extends React.Component {
  state = {
    data: null,
  }

  transformUsers = () => {
    const { data } = this.state

    return data.map(user => ({
      user: {
        data: {
          nickname: `${user['Team Member First Name']}.${user['Team Member Last Name']}`,
          email: user['Team Member Email'],
          username: `${user['Team Member First Name']}.${user['Team Member Last Name']}`,
          avatar: '',
        },
      },
      team: {
        data: {
          name: user['Team Name'],
        },
      },
    }))
  }

  transformTeams = (teams, eventId) => {
    const { data } = this.state

    return teams.map(team => ({
      team_id: team.team_id,
      event_id: eventId,
    }))
  }

  render() {
    const { isOpen, onRequestClose, eventID } = this.props

    return (
      <SlidingPane
        isOpen={isOpen}
        onRequestClose={onRequestClose}
        closeIcon={<Icon icon={IconNames.MENU_CLOSED} iconSize={20} />}
      >
        <SlidingPane.Header>
          <SlidingPane.Header.Title title="Upload Users" subtitle="Fill out the form and save" />
          <SlidingPane.Header.Actions onActionClick={onRequestClose}>
            <a>Cancel</a>
          </SlidingPane.Header.Actions>
        </SlidingPane.Header>

        <SlidingPane.Content>
          <SlidingPanelConsumer>
            {({ closeSlider }) => (
              <CsvParse
                keys={[
                  'Team Name',
                  'Attendee ID',
                  'Number of Registered Members',
                  'Team Member Last Name',
                  'Team Member First Name',
                  'Ticket Type',
                  'Joined Date',
                  'Team Member Email',
                  'Currency',
                  'Team Captain Last Name',
                  'Team Captain First Name',
                  'Team Captain Email',
                  'Password',
                  'Created Date',
                  'Preferred Start Time',
                ]}
                onDataUploaded={data => this.setState({ data })}
                // eslint-disable-next-line no-console
                onError={error => console.log(error)}
                render={onChange => <input type="file" onChange={onChange} />}
              />
            )}
          </SlidingPanelConsumer>
        </SlidingPane.Content>

        <Mutation mutation={ADD_USERS_TO_TEAM}>
          {(insert_user_team, { data }) => (
            <Mutation mutation={ADD_TEAM_TO_EVENT}>
              {insert_team_event => {
                const addUsers = async () => {
                  const data = await insert_user_team({
                    variables: {
                      objects: this.transformUsers(),
                    },
                  })
                  const { returning } = data.data.insert_user_team

                  const teamData = this.transformTeams(returning, eventID)
                  const dataResult = await insert_team_event({
                    variables: {
                      objects: teamData,
                    },
                  })
                }

                return (
                  <SlidingPanelConsumer>
                    {({ closeSlider }) => (
                      <SlidingPane.Actions
                        form="uploadUserForm"
                        // eslint-disable-next-line no-console
                        onClick={() => addUsers().then(() => closeSlider())}
                      >
                        SAVE
                      </SlidingPane.Actions>
                    )}
                  </SlidingPanelConsumer>
                )
              }}
            </Mutation>
          )}
        </Mutation>
      </SlidingPane>
    )
  }
}

UploadUser.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onRequestClose: PropTypes.func.isRequired,
  // eslint-disable-next-line react/require-default-props
  //   otherProps: PropTypes.objectOf(PropTypes.object),
}

export default UploadUser

{
  /* <UserManager>
          {({ addUsersToTeam, addTeamToEvent }) => {

            // const users = this.transformUsers()
            // const teams = this.transformTeams()

            const addUsers = async () => {
              // console.log(this.transformUsers())
              // console.log(this.transformTeams())

              await addUsersToTeam.mutation({
                variables: {
                  objects: this.transformUsers()
                }
              })

              console.log("RESULT: ", addUsersToTeam.result)

              // await addTeamToEvent.mutation({
              //   variables: objects: [

              //   ]
              // })
            } */
}
// mutation {
//     insert_user_team(objects:{
//       user:{
//         data:{
//           auth0id:"test"
//           nickname:"saigarrrrrr"
//           email:"test@test.com"
//           avatar:"hello"
//         }
//       }
//       team:{
//         data:{
//           name:"SaigarTeamTest"
//         }
//       }
//     }) {
//       affected_rows
//     }
//   }

// mutation {
//     insert_team_event(objects:{
//       event:{
//         data:{
//           event_id
//         }
//       }
//       team:{
//         data:{
//           user_team:{
//             data:{
//               user:{
//                 data:{

//                 }
//               }
//               team:{
//                 data:{

//                 }
//               }
//             }
//           }
//         }
//       }
//     })
//   }
