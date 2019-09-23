import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { Query, ApolloConsumer } from 'react-apollo'
import { useMutation } from '@apollo/react-hooks'
import gql from 'graphql-tag'

// Styles
import {
  Toaster,
  Position,
  Card,
  Button,
  Tabs,
  Tag,
  Tab,
  Icon,
  H5,
  H4,
  H3,
  Dialog,
  Classes,
} from '@blueprintjs/core'
import { IconNames } from '@blueprintjs/icons'

import { Parser } from 'json2csv'
import { saveAs } from 'file-saver'
import JSZip from 'jszip'

// Custom Components
import CreateCase from './components/CreateCase'
import EditCase from './components/EditCase'
import CreateEvent from './components/CreateEvent'
import EditEvent from './components/EditEvent'
import UploadUser from './components/UploadUser'
import AddAdmin from './components/AddAdmins'

import { EVENTS_QUERY, CASES_QUERY } from './graphql/graphQueries'

import { SlidingPanelConsumer } from '../../../shared/components/SlidingPane'
import Can from '../../../shared/components/AuthContext/Can'

import './index.scss'

const EventsToaster = Toaster.create({
  classname: 'events-toaster',
  position: Position.TOP,
})

const GET_EVENT_EXPORT_DATA = gql`
  query getData($eventID: uuid!) {
    event_export(where: { uuid: { _eq: $eventID } }) {
      event_name
      decision
      case_name
      missing_from
      category
      explanation
      content
      supporting_evidence
    }
  }
`

class DownloadCsvButton extends React.Component {
  state = {
    data: [],
  }

  groupBy = key => array =>
    array.reduce((objectsByKeyValue, obj) => {
      const value = obj[key]
      objectsByKeyValue[value] = (objectsByKeyValue[value] || []).concat(obj)
      return objectsByKeyValue
    }, {})

  transformData = results => {
    const zip = new JSZip()

    const groupByCase = this.groupBy('case_name')
    Object.entries(groupByCase(results.event_export)).forEach(([key, value]) => {
      const fields = [
        {
          label: 'Event Name',
          value: 'event_name',
        },
        {
          label: 'Case Name',
          value: 'case_name',
        },
        {
          label: 'Missing From',
          value: 'missing_from',
        },
        {
          label: 'Decision',
          value: 'decision',
        },
        {
          label: 'Category',
          value: 'category',
        },
        {
          label: 'URL',
          value: 'content',
        },
        {
          label: 'Relevance',
          value: 'explanation',
        },
        {
          label: 'Supporting Evidence',
          value: 'supporting_evidence',
        },
      ]

      const parser = new Parser({ fields })
      const csv = parser.parse(value)

      zip.file(`${key.replace(/\s/g, '')}.csv`, csv)
    })

    zip.generateAsync({ type: 'blob' }).then(content => {
      saveAs(
        content,
        `${results.event_export[0].event_name.replace(/\s/g, '')}__${new Date().getTime()}.zip`,
      )
    })
  }

  render() {
    return (
      <ApolloConsumer>
        {client => {
          const { event } = this.props

          return (
            <Button
              className="case-card__actions"
              minimal
              icon={<Icon icon={IconNames.DOWNLOAD} style={{ color: '#394B59' }} iconSize={20} />}
              onClick={() => {
                client
                  .query({
                    query: GET_EVENT_EXPORT_DATA,
                    variables: { eventID: event },
                  })
                  .then(({ data }) => {
                    if (!data.event_export.length) {
                      EventsToaster.show({
                        message: 'Failed to download data',
                        intent: 'danger',
                      })
                    } else {
                      this.transformData(data)
                    }
                  })
              }}
            />
          )
        }}
      </ApolloConsumer>
    )
  }
}

const WipeEventDialog = ({ isOpen, onWipeClick, onCancelClick }) => (
  <Dialog
    isOpen={isOpen}
    autoFocus
    canEscapeKeyClose={false}
    canOutsideClickClose={false}
    className={Classes.DARK}
  >
    <div className={Classes.DIALOG_BODY}>
      <H3>Warning</H3>
      <p>This action will wipe all the data for the current event. This action is irreversible.</p>
    </div>
    <div className={Classes.DIALOG_FOOTER}>
      <div className={Classes.DIALOG_FOOTER_ACTIONS}>
        <Button large intent="danger" onClick={onWipeClick}>
          !! WIPE !!
        </Button>
        <Button large intent="primary" minimal onClick={onCancelClick}>
          CANCEL
        </Button>
      </div>
    </div>
  </Dialog>
)

const EventCard = ({ eventID, name, startTime, endTime, totalSubmissions, onWipeClick }) => (
  <div className="case-card__wrapper">
    <Card id="case-card">
      <div style={{ textAlign: 'center' }}>
        <H3 className="case-card__header">{name}</H3>
      </div>
      <div
        style={{
          display: 'inline-flex',
          width: '100%',
          justifyContent: 'space-around',
          padding: 20,
        }}
      >
        <span style={{ fontWeight: 350, fontSize: '1.8em' }}>
          <p>
            {`${new Date(startTime).toDateString().split(' ')[1]} ${
              new Date(startTime).toDateString().split(' ')[2]
            }`}
          </p>
          <p style={{ textAlign: 'center', fontSize: '0.6em' }}>
            {`${new Date(startTime).toDateString().split(' ')[0]}`}
          </p>
        </span>
        <span style={{ height: 'auto', width: '1px', background: '#c9c9c9' }} />
        <span
          style={{ fontWeight: 350, fontSize: '1.8em', display: 'flex', flexDirection: 'column' }}
        >
          <p>Submissions</p>
          <p style={{ textAlign: 'center', fontSize: '0.8em' }}>
            {totalSubmissions.aggregate.count}
          </p>
        </span>
      </div>
    </Card>
    <div style={{ display: 'inline-flex', width: '100%', background: '#E1E8ED' }}>
      <SlidingPanelConsumer>
        {({ openSlider }) => (
          <Button
            className="case-card__actions"
            minimal
            icon={<Icon icon={IconNames.EDIT} style={{ color: '#394B59' }} iconSize={20} />}
            onClick={() => openSlider(EditEvent, { eventID, eventName: name, startTime, endTime })}
          />
        )}
      </SlidingPanelConsumer>
      <SlidingPanelConsumer>
        {({ openSlider }) => (
          <Button
            className="case-card__actions"
            minimal
            icon={<Icon icon={IconNames.PEOPLE} style={{ color: '#394B59' }} iconSize={20} />}
            onClick={() => openSlider(UploadUser, { eventID, eventName: name, startTime, endTime })}
          />
        )}
      </SlidingPanelConsumer>
      <DownloadCsvButton event={eventID} />
      <SlidingPanelConsumer>
        {({ openSlider }) => (
          <Button
            className="case-card__actions"
            minimal
            icon={<Icon icon={IconNames.TRASH} style={{ color: '#CED9E0' }} iconSize={20} />}
            onClick={() => onWipeClick(eventID)}
            style={{ background: '#DB3737' }}
          />
        )}
      </SlidingPanelConsumer>
    </div>
  </div>
)

EventCard.propTypes = {
  eventID: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  startTime: PropTypes.string.isRequired,
  endTime: PropTypes.string.isRequired,
}

const DELETE_CASE_MUTATION = gql`
  mutation DELETE_CASE($caseId: uuid!) {
    delete_event_case(where: {
      case_id: { _eq: $caseId }
    }) {
      affected_rows
    }
  }
`

const CaseCard = ({ id, name, missingSince }) => {
  const [deleteCase] = useMutation(DELETE_CASE_MUTATION, {
    variables: { caseId: id },
    refetchQueries: [{ query: CASES_QUERY }]
  })

  return (
    <div className="case-card__wrapper" style={{ width: 'calc(33.33% - 24px)' }}>
      <Card id="case-card">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>
          <H4 className="case-card__header" style={{ textAlign: 'center' }}>
            {name}
          </H4>
        </div>
        <p>
          <strong>Missing Since: </strong>
          {new Date(missingSince).toDateString()}
        </p>
      </Card>
      <div style={{ display: 'inline-flex', width: '100%', background: '#E1E8ED' }}>
        <SlidingPanelConsumer>
          {({ openSlider }) => (
            <Button
              className="case-card__actions"
              minimal
              icon={<Icon icon={IconNames.EDIT} style={{ color: '#394B59' }} iconSize={20} />}
              onClick={() => openSlider(EditCase, { caseID: id })}
            />
          )}
        </SlidingPanelConsumer>
        <Button
          className="case-card__actions"
          style={{ background: '#DB3737', borderRadius: 0 }}
          minimal
          icon={<Icon icon={IconNames.TRASH} style={{ color: '#CED9E0' }} iconSize={20} />}
          onClick={deleteCase}
        />
      </div>
    </div>
  )
}

CaseCard.propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  missingSince: PropTypes.string.isRequired,
}

const EventsPanel = () => {
  // Internal State Layer
  const [wipeDialogOpen, setWipeDialogOpen] = useState(false)
  const [currentEvent, setCurrentEvent] = useState()

  //  GraphQL Layer

  // Handlers
  const handleWipeClick = eventID => {
    setWipeDialogOpen(true)
    setCurrentEvent(eventID)
  }

  const handleWipeApproveClick = () => {
    console.log('WIPING')
    setWipeDialogOpen(false)
  }

  const handleCancelClick = () => {
    setWipeDialogOpen(false)
  }

  return (
    <div>
      <div style={{ paddingBottom: 10 }}>
        <SlidingPanelConsumer>
          {({ openSlider }) => (
            <Button
              id="createbutton"
              style={{
                width: '148px',
                height: '40px',
                background: '#1F4B99',
                color: '#FFFFFF',
                display: 'flex',
              }}
              onClick={() => openSlider(CreateEvent, { agency_id: 1 })}
              icon={<Icon icon={IconNames.ADD} style={{ color: '#F5F8FA' }} iconSize={18} />}
            >
              Add Event
            </Button>
          )}
        </SlidingPanelConsumer>
        {/* <Button large intent="primary" text="Add Event" icon={IconNames.ADD} /> */}
      </div>
      <div className="case-card__grid" style={{ padding: 0 }}>
        <Query query={EVENTS_QUERY}>
          {({ data, loading, error }) => {
            if (loading) return <div>Loading....</div>
            if (error) return <div>`${error.message}`</div>

            if (!Array.isArray(data.event) || !data.event.length) {
              return <H5>No events currently. Click the 'Add Event' button to create an event</H5>
            }

            return (
              <div className="case-card__row">
                {data.event.map(event => (
                  <EventCard
                    key={event.uuid}
                    eventID={event.uuid}
                    name={event.name}
                    startTime={event.start_time}
                    endTime={event.end_time}
                    totalSubmissions={event.totalSubmissions}
                    onWipeClick={handleWipeClick}
                  />
                ))}
              </div>
            )
          }}
        </Query>
      </div>
      <WipeEventDialog
        isOpen={wipeDialogOpen}
        onWipeClick={handleWipeApproveClick}
        onCancelClick={handleCancelClick}
      />
    </div>
  )
}

const CasesPanel = () => (
  <React.Fragment>
    <div style={{ paddingBottom: 10 }}>
      <SlidingPanelConsumer>
        {({ openSlider }) => (
          <Button
            id="createbutton"
            style={{
              width: '148px',
              height: '40px',
              background: '#1F4B99',
              color: '#FFFFFF',
              display: 'flex',
            }}
            onClick={() => openSlider(CreateCase)}
            icon={<Icon icon={IconNames.ADD} style={{ color: '#F5F8FA' }} iconSize={18} />}
          >
            Create Case
          </Button>
        )}
      </SlidingPanelConsumer>
    </div>
    <Query query={CASES_QUERY}>
      {({ data, loading, error }) => {
        if (loading) return <div>Loading....</div>
        if (error) return <div>`${error.message}`</div>

        if (!Array.isArray(data.event) || !data.event.length) {
          return (
            <H5>
              No events currently. Click on the 'Add Event' button in the 'Events' tab to create one
            </H5>
          )
        }

        return data.event.map(event => (
          <div>
            <h2 style={{ textAlign: 'center' }}>{event.name}</h2>
            <div className="case-card__grid" style={{ padding: 0 }}>
              {!Array.isArray(event.eventCasesByeventId) || !event.eventCasesByeventId.length ? (
                <div>
                  <H5>No cases currently. Click on the 'Create Case' button to create one.</H5>
                </div>
              ) : (
                <div className="case-card__row">
                  {event.eventCasesByeventId.map(_case => (
                    <CaseCard
                      key={_case.case.uuid}
                      id={_case.case.uuid}
                      name={_case.case.name}
                      missingSince={_case.case.missing_since}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        ))
      }}
    </Query>
  </React.Fragment>
)

const ADMIN_USERS_QUERY = gql`
  query {
    user(where: { role: { _in: ["JUDGE", "ADMIN"] } }, order_by: { role: asc }) {
      uuid
      email
      role
      nickname
    }
  }
`

const UsersPanel = () => (
  <div>
    <div style={{ paddingBottom: 30 }}>
      <SlidingPanelConsumer>
        {({ openSlider }) => (
          <Button
            id="createbutton"
            style={{
              width: '148px',
              height: '40px',
              background: '#1F4B99',
              color: '#FFFFFF',
              display: 'flex',
            }}
            onClick={() => openSlider(AddAdmin)}
            icon={<Icon icon={IconNames.ADD} style={{ color: '#F5F8FA' }} iconSize={18} />}
          >
            Create User
          </Button>
        )}
      </SlidingPanelConsumer>
    </div>
    <Query query={ADMIN_USERS_QUERY}>
      {({ data, loading, error }) => {
        if (loading) return <div>Loading....</div>
        if (error) return <div>`${error.message}`</div>

        if (!Array.isArray(data.user) || !data.user.length) {
          return <H5>No Admin/Judge users. Click "Create User" to create one.</H5>
        }

        return (
          <table style={{ width: '85%', margin: '0 auto' }}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
              </tr>
            </thead>
            <tbody>
              {data.user.map(user => (
                <tr key={user.uuid}>
                  <td>{user.nickname}</td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )
      }}
    </Query>
  </div>
)

const CreatePage = () => (
  <Can
    allowedRole="ctf_admin"
    yes={() => (
      <div className="row">
        <div className="col-xs-12">
          <div style={{ padding: '1rem', display: 'inline-flex', marginTop: 65, width: '100%' }}>
            <Tabs large animate renderActiveTabPanelOnly className="eventsTabs">
              <Tab
                id="eventsTab"
                title={<div style={{ fontSize: '1.5em' }}>Events</div>}
                panel={<EventsPanel />}
                style={{ width: '100%' }}
              />
              <Tab
                id="casesTab"
                title={<div style={{ fontSize: '1.5em' }}>Cases</div>}
                panel={<CasesPanel />}
              />
              <Tab
                id="userTab"
                title={<div style={{ fontSize: '1.5em' }}>Admins & Judges</div>}
                panel={<UsersPanel />}
              />
            </Tabs>
          </div>
        </div>
      </div>
    )}
  />
)

export default CreatePage
