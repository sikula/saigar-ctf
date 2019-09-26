/* eslint-disable no-unused-vars */
/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { Mutation } from 'react-apollo'
import gql from 'graphql-tag'

import CsvParse from '@vtex/react-csv-parse'

// Styles
import { Button, Icon, Tabs, Tab, H4 } from '@blueprintjs/core'
import { IconNames } from '@blueprintjs/icons'

// Custom Components
import { SlidingPanelConsumer, SlidingPane } from '../../../../../../shared/components/SlidingPane'

import ManageTeamsTab from './ManageTeamsTab'
import ManageUsersTab from './ManageUsersTab'
import './Upload.scss'

const NEW_UPLOAD_USERS = gql`
  mutation uploadUsers($userData: [team_event_insert_input!]!) {
    insert_team_event(objects: $userData) {
      affected_rows
    }
  }
`
const FileUpload = ({ onChange }) => {
  const [fileName, setFileName] = useState()

  const handleChange = e => {
    const file = e.target.files[0].name
    setFileName(file)
    onChange(e)
  }

  return (
    <React.Fragment>
      <input type="file" name="file" id="file" className="inputfile" onChange={handleChange} />
      <label htmlFor="file">
        <Icon icon={IconNames.UPLOAD} />
        {fileName !== null ? fileName : 'Choose a file'}
      </label>
    </React.Fragment>
  )
}

const groupBy = key => array =>
  array.reduce((objectsByKeyValue, obj) => {
    const value = obj[key]
    objectsByKeyValue[value] = (objectsByKeyValue[value] || []).concat(obj)
    return objectsByKeyValue
  }, {})

const transformData = (data, eventID) => {
  const groupByCase = groupBy('Team')

  return Object.entries(groupByCase(data)).map(([key, value]) => {
    return {
      event_id: eventID,
      team: {
        data: {
          name: key,
          user_team: {
            data: value.map(user => ({
              user: {
                data: {
                  nickname: `${user.Username}}`,
                  username: `${user.Username}`,
                  avatar: '',
                  email: user.Email,
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

const UploadUser = ({ isOpen, onRequestClose, eventID }) => {
  const [data, setData] = useState()

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
              panel={<ManageUsersTab eventId={eventID} />}
              style={{ width: '100%' }}
            />
            <Tab
              id="bulkImport"
              title={<div style={{ fontSize: '1em' }}>Import Users</div>}
              panel={
                <React.Fragment>
                  <CsvParse
                    keys={['Email', 'Team', 'Username']}
                    onDataUploaded={data => setData(data)}
                    // eslint-disable-next-line no-console
                    onError={error => console.log(error)}
                    render={onChange => <FileUpload onChange={onChange} />}
                  />
                  <Mutation mutation={NEW_UPLOAD_USERS}>
                    {insert_team_event => (
                      <SlidingPanelConsumer>
                        {({ closeSlider }) => (
                          <Button
                            intent="primary"
                            large
                            // eslint-disable-next-line no-console
                            onClick={() =>
                              insert_team_event({
                                variables: {
                                  userData: transformData(data, eventID),
                                },
                                // refetchQueries: [{
                                //   query: TEAMS_QUERY,
                                //   variables: {
                                //     eventId:  eventID
                                //   }
                                // }]
                              }).then(closeSlider)
                            }
                          >
                            UPLOAD
                          </Button>
                        )}
                      </SlidingPanelConsumer>
                    )}
                  </Mutation>
                </React.Fragment>
              }
            />
          </Tabs>
        </div>
      </SlidingPane.Content>

      <SlidingPanelConsumer>
        {({ closeSlider }) => (
          <SlidingPane.Actions
            // eslint-disable-next-line no-console
            onClick={closeSlider}
          >
            SAVE
          </SlidingPane.Actions>
        )}
      </SlidingPanelConsumer>
    </SlidingPane>
  )
}

UploadUser.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onRequestClose: PropTypes.func.isRequired,
  // eslint-disable-next-line react/require-default-props
  //   otherProps: PropTypes.objectOf(PropTypes.object),
}

export default UploadUser
