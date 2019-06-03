import React from 'react'
import PropTypes from 'prop-types'
import { Query, ApolloConsumer } from 'react-apollo'
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
      case_name
      missing_from
      category
      explanation
      content
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
          label: 'Category',
          value: 'category',
        },
        {
          label: 'URL',
          value: 'content',
        },
        {
          lable: 'Proof',
          value: 'explanation',
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

const EventCard = ({ eventID, name, startTime, endTime, totalSubmissions }) => (
  <div className="case-card__wrapper" style={{ width: 'calc(33.33% - 24px)' }}>
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
    </div>
  </div>
)
EventCard.propTypes = {
  eventID: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  startTime: PropTypes.string.isRequired,
  endTime: PropTypes.string.isRequired,
}

const CaseCard = ({ id, name, missingSince }) => (
  <div className="case-card__wrapper" style={{ width: 'calc(33.33% - 24px)' }}>
    <Card id="case-card">
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>
        <H4 className="case-card__header" style={{ textAlign: 'center' }}>
          {name}
        </H4>
      </div>
      {/* {/* <p>
          <strong>Start Time: </strong>
          {new Date(startTime).toDateString()}
        </p> */}
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
      {/* <SlidingPanelConsumer>
        {({ openSlider }) => (
          <Button
            className="case-card__actions"
            style={{ background: '#F55656', borderRadius: 0 }}
            minimal
            icon={<Icon icon={IconNames.TRASH} style={{ color: '#CED9E0' }} iconSize={20} />}
            onClick={() => openSlider(UploadUser, { eventID, eventName: name, startTime, endTime })}
          />
        )}
      </SlidingPanelConsumer> */}
    </div>
  </div>
)
CaseCard.propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  missingSince: PropTypes.string.isRequired,
}

const EventsPanel = () => (
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

          return data.event.map(event => (
            <EventCard
              key={event.uuid}
              eventID={event.uuid}
              name={event.name}
              startTime={event.start_time}
              endTime={event.end_time}
              totalSubmissions={event.totalSubmissions}
            />
          ))
        }}
      </Query>
    </div>
  </div>
)

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
                event.eventCasesByeventId.map(_case => (
                  <CaseCard
                    key={_case.case.uuid}
                    id={_case.case.uuid}
                    name={_case.case.name}
                    missingSince={_case.case.missing_since}
                  />
                ))
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
    user(where: { role: { _in: ["JUDGE", "ADMIN"] } }) {
      uuid
      email
      role
      nickname
    }
  }
`

const UserCard = ({ id, name, email, role }) => (
  <div className="case-card__wrapper">
    <Card id="case-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <H5 className="case-card__header">{`${name} / (${email})`}</H5>
        <Tag round>{role}</Tag>
      </div>
      {/* <p>{`missing for: ${differenceInDays(new Date(), caseData.missing_since)} days`}</p> */}
    </Card>
  </div>
)

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
          <div>
            <div className="case-card__grid" style={{ padding: 0 }}>
              {data.user.map(user => (
                <UserCard
                  key={user.uuid}
                  id={user.uuid}
                  name={user.nickname}
                  email={user.email}
                  role={user.role}
                />
              ))}
            </div>
          </div>
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
