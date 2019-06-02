/* eslint-disable no-unused-vars */
/* eslint-disable jsx-a11y/anchor-is-valid */
import React from 'react'
import PropTypes from 'prop-types'
import { Query, Mutation } from 'react-apollo'
import gql from 'graphql-tag'

import { adopt } from 'react-adopt'
import CsvParse from '@vtex/react-csv-parse'

// Styles
import { Button, Icon, Tabs, InputGroup, Tab, H4, HTMLSelect } from '@blueprintjs/core'
import { IconNames } from '@blueprintjs/icons'

// Custom Components
import { SlidingPanelConsumer, SlidingPane } from '../../../../../../shared/components/SlidingPane'

import './Upload.scss'

const NEW_UPLOAD_USERS = gql`
  mutation uploadUsers($userData: [team_event_insert_input!]!) {
    insert_team_event(objects: $userData) {
      affected_rows
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

class FileUpload extends React.PureComponent {
  state = { fileName: null }

  handleChange = e => {
    const file = e.target.files[0].name
    this.setState({ fileName: file })
    this.props.onChange(e)
  }

  render() {
    return (
      <React.Fragment>
        <input
          type="file"
          name="file"
          id="file"
          className="inputfile"
          onChange={this.handleChange}
        />
        <label htmlFor="file">
          <Icon icon={IconNames.UPLOAD} />
          {this.state.fileName !== null ? this.state.fileName : 'Choose a file'}
        </label>
      </React.Fragment>
    )
  }
}

const TEAMS_QUERY = gql`
  query teamList($eventId: uuid!) {
    event(where: { uuid: { _eq: $eventId } }) {
      team_events {
        team {
          uuid
          name
        }
      }
    }
  }
`

const TeamSelect = ({ values, handleChange, teamId, eventId }) => (
  <Query query={TEAMS_QUERY} variables={{ eventId }} skip={!eventId}>
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
              Chose a team
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

const ADD_USER_TO_EVENT = gql`
  mutation addUserToEvent($eventId: uuid!, $teamName: String!) {
    insert_team_event(objects: [{ team: { data: { name: $teamName } }, event_id: $eventId }]) {
      affected_rows
    }
  }
`

class ManageTeamsTab extends React.Component {
  state = { teamName: undefined }

  handleChange = e => {
    this.setState({
      teamName: e.target.value,
    })
  }

  render() {
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
                <InputGroup
                  name="teamName"
                  value={this.state.teamName}
                  onChange={this.handleChange}
                />
              </td>
              <td>
                <Mutation
                  mutation={ADD_USER_TO_EVENT}
                  refetchQuries={[
                    {
                      query: TEAMS_QUERY,
                      variables: { eventId: this.props.eventId },
                    },
                  ]}
                  variables={{ eventId: this.props.eventId, teamName: this.state.teamName }}
                >
                  {insert_team_event => (
                    <Button
                      intent="primary"
                      icon={IconNames.PLUS}
                      fill
                      onClick={insert_team_event}
                    />
                  )}
                </Mutation>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    )
  }
}

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

class ManageUserTab extends React.Component {
  state = { teamId: null, username: null, email: null }

  handleSelect = e => {
    this.setState({ teamId: e.target.value })
  }

  handleInputChange = e => {
    this.setState({
      [e.target.name]: e.target.value,
    })
  }

  render() {
    return (
      <div>
        <TeamSelect
          eventId={this.props.eventId}
          teamId={this.state.teamId}
          handleChange={this.handleSelect}
        />
        <Query query={USER_LIST} variables={{ teamId: this.state.teamId }}>
          {({ data, loading, error }) => {
            if (!data) return null
            if (loading) return <div>Loading...</div>
            if (error) return <div>Error...</div>

            if (this.state.teamId === null) {
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
                        <InputGroup
                          name="username"
                          value={this.state.username}
                          onChange={this.handleInputChange}
                        />
                      </td>
                      <td>
                        <InputGroup
                          name="email"
                          value={this.state.email}
                          onChange={this.handleInputChange}
                        />
                      </td>
                      <td>
                        <Mutation
                          mutation={ADD_USER_TO_TEAM}
                          refetchQueries={[
                            { query: USER_LIST, variables: { teamId: this.state.teamId } },
                          ]}
                        >
                          {insert_user_team => (
                            <Button
                              intent="primary"
                              icon={IconNames.PLUS}
                              fill
                              onClick={() => {
                                insert_user_team({
                                  variables: {
                                    email: this.state.email,
                                    username: this.state.username,
                                    teamId: this.state.teamId,
                                  },
                                })
                                this.setState({
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
                        <td />
                      </tr>
                    ))}
                    <tr>
                      <td>
                        <InputGroup
                          name="username"
                          value={this.state.username}
                          onChange={this.handleInputChange}
                        />
                      </td>
                      <td>
                        <InputGroup
                          name="email"
                          value={this.state.email}
                          onChange={this.handleInputChange}
                        />
                      </td>
                      <td>
                        <Mutation
                          mutation={ADD_USER_TO_TEAM}
                          refetchQueries={[
                            { query: USER_LIST, variables: { teamId: this.state.teamId } },
                          ]}
                        >
                          {insert_user_team => (
                            <Button
                              intent="primary"
                              icon={IconNames.PLUS}
                              fill
                              onClick={() => {
                                insert_user_team({
                                  variables: {
                                    email: this.state.email,
                                    username: this.state.username,
                                    teamId: this.state.teamId,
                                  },
                                })
                                this.setState({
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
              </div>
            )
          }}
        </Query>
      </div>
    )
  }
}

class UploadUser extends React.Component {
  state = {
    data: null,
  }

  groupBy = key => array =>
    array.reduce((objectsByKeyValue, obj) => {
      const value = obj[key]
      objectsByKeyValue[value] = (objectsByKeyValue[value] || []).concat(obj)
      return objectsByKeyValue
    }, {})

  transformData = () => {
    const groupByCase = this.groupBy('Team Name')

    return Object.entries(groupByCase(this.state.data)).map(([key, value]) => {
      return {
        event_id: this.props.eventID,
        team: {
          data: {
            name: key,
            user_team: {
              data: value.map(user => ({
                user: {
                  data: {
                    nickname: `${user['Team Member First Name']}.${user['Team Member Last Name']}`,
                    username: `${user['Team Member First Name']}.${user['Team Member Last Name']}`,
                    avatar: '',
                    email: user['Team Member Email'],
                    role: 'CONTESTANT',
                  },
                },
              })),
            },
          },
        },
      }
    })
  }

  render() {
    const { isOpen, onRequestClose, eventID } = this.props

    return (
      <SlidingPane
        isOpen={isOpen}
        onRequestClose={onRequestClose}
        closeIcon={<Icon icon={IconNames.MENU_CLOSED} iconSize={20} />}
        width={525}
      >
        <SlidingPane.Header>
          <SlidingPane.Header.Title title="Manage Users" subtitle="View and manage users" />
          <SlidingPane.Header.Actions onActionClick={onRequestClose}>
            <a>Cancel</a>
          </SlidingPane.Header.Actions>
        </SlidingPane.Header>

        <SlidingPane.Content>
          {/* NOTE(Peter): not sure about the negative padding here, but seems ok for now, does the job */}
          <div style={{ marginTop: '-30px', width: '100%' }}>
            <Tabs large animate className="usersTabs">
              <Tab
                id="manageTeams"
                title={<div style={{ fontSize: '1em' }}>Add Team</div>}
                panel={<ManageTeamsTab eventId={eventID} />}
                style={{ width: '100%' }}
              />
              <Tab
                id="manageUsers"
                title={<div style={{ fontSize: '1em' }}>View Team</div>}
                panel={<ManageUserTab eventId={eventID} />}
                style={{ width: '100%' }}
              />
              <Tab
                id="bulkImport"
                title={<div style={{ fontSize: '1em' }}>Import Users</div>}
                panel={
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
                    render={onChange => <FileUpload onChange={onChange} />}
                  />
                }
              />
            </Tabs>
          </div>
        </SlidingPane.Content>

        <Mutation mutation={NEW_UPLOAD_USERS}>
          {insert_team_event => (
            <SlidingPanelConsumer>
              {({ closeSlider }) => (
                <SlidingPane.Actions
                  form="uploadUserForm"
                  // eslint-disable-next-line no-console
                  onClick={() =>
                    insert_team_event({
                      variables: {
                        userData: this.transformData(),
                      },
                      // refetchQueries: [{
                      //   query: TEAMS_QUERY,
                      //   variables: {
                      //     eventId:  eventID
                      //   }
                      // }]
                    }).then(() => closeSlider())
                  }
                >
                  SAVE
                </SlidingPane.Actions>
              )}
            </SlidingPanelConsumer>
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
