import React from 'react'
import PropTypes from 'prop-types'
import { Query, ApolloConsumer } from 'react-apollo'
import gql from 'graphql-tag'

// Styles
import { Card, Button, Tabs, Tab, Icon } from '@blueprintjs/core'
import { IconNames } from '@blueprintjs/icons'

import { CSVLink } from 'react-csv'

// Custom Components
import CreateCase from './components/CreateCase'
import EditCase from './components/EditCase'
import CreateEvent from './components/CreateEvent'
import EditEvent from './components/EditEvent'
import UploadUser from './components/UploadUser'

import { EVENTS_QUERY, CASES_QUERY } from './graphql/graphQueries'

import { SlidingPanelConsumer } from '../../../shared/components/SlidingPane'
import Can from '../../../shared/components/AuthContext/Can'

import './index.scss'

class DownloadCsvButton extends React.Component {
  state = {
    data: [],
  }

  transformData = results => {
    // const data = results.event.map( => ({
    //   eventName: 'Hello There World',
    //   submission: 'TESTING THIS ONE HERE RIGHT NOW',
    // }))

    // console.log(data)

    this.setState({
      data: results.event,
    })
  }

  render() {
    return (
      <ApolloConsumer>
        {client => {
          return (
            <CSVLink
              filename="me"
              data={this.state.data}
              onClick={() => {
                client
                  .query({
                    query: gql`
                      query getData($eventID: uuid!) {
                        event(where: { uuid: { _eq: $eventID } }) {
                          name
                          eventCasesByeventId {
                            case {
                              name
                              submissions {
                                processed
                                explanation
                              }
                            }
                          }
                        }
                      }
                    `,
                    variables: { eventID: this.props.event },
                  })
                  .then(({ data }) => this.transformData(data))
                // console.log(results)
                // this.transformData()
              }}
            >
              <Button
                minimal
                icon={<Icon icon={IconNames.DOWNLOAD} style={{ color: '#394B59' }} iconSize={20} />}
              />
            </CSVLink>
          )
        }}
      </ApolloConsumer>
    )
  }
}
const EventCard = ({ eventID, name, startTime, endTime }) => (
  <div className="case-card__wrapper" style={{ width: 'calc(33.33% - 24px)' }}>
    <Card id="case-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <h4 className="case-card__header">{name}</h4>
      </div>
      <p>
        <strong>Start Time: </strong>
        {new Date(startTime).toDateString()}
      </p>
      <p>
        <strong>End Time: </strong>
        {new Date(endTime).toDateString()}
      </p>
    </Card>
    <div className="case-card__actions">
      <SlidingPanelConsumer>
        {({ openSlider }) => (
          <Button
            minimal
            icon={<Icon icon={IconNames.EDIT} style={{ color: '#394B59' }} iconSize={20} />}
            onClick={() => openSlider(EditEvent, { eventID, eventName: name, startTime, endTime })}
          />
        )}
      </SlidingPanelConsumer>
      <SlidingPanelConsumer>
        {({ openSlider }) => (
          <Button
            minimal
            icon={<Icon icon={IconNames.NEW_PERSON} style={{ color: '#394B59' }} iconSize={20} />}
            onClick={() => openSlider(UploadUser, { eventID, eventName: name, startTime, endTime })}
          />
        )}
      </SlidingPanelConsumer>
      {/* <DownloadCsvButton event={eventID} /> */}
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <h4 className="case-card__header">{name}</h4>
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
    <div className="case-card__actions">
      <SlidingPanelConsumer>
        {({ openSlider }) => (
          <Button
            minimal
            icon={<Icon icon={IconNames.EDIT} style={{ color: '#394B59' }} iconSize={20} />}
            onClick={() => openSlider(EditCase, { caseID: id })}
          />
        )}
      </SlidingPanelConsumer>
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

          return data.event.map(event => (
            <EventCard
              key={event.uuid}
              eventID={event.uuid}
              name={event.name}
              startTime={event.start_time}
              endTime={event.end_time}
            />
          ))
        }}
      </Query>
    </div>
  </div>
)

const CasesPanel = () => (
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
            onClick={() => openSlider(CreateCase, { agency_id: 1 })}
            icon={<Icon icon={IconNames.ADD} style={{ color: '#F5F8FA' }} iconSize={18} />}
          >
            Create Case
          </Button>
        )}
      </SlidingPanelConsumer>
      {/* <Button large intent="primary" text="Add Event" icon={IconNames.ADD} /> */}
    </div>
    <div className="case-card__grid" style={{ padding: 0 }}>
      <Query query={CASES_QUERY}>
        {({ data, loading, error }) => {
          if (loading) return <div>Loading...</div>
          if (error) return <div>`${error.message}`</div>

          return data.case.map(_case => (
            <CaseCard
              key={_case.uuid}
              id={_case.uuid}
              name={_case.name}
              missingSince={_case.missing_since}
            />
          ))
        }}
      </Query>
    </div>
  </div>
)

const CreatePage = () => (
  <Can
    allowedRole="ctf_admin"
    yes={() => (
      <div className="row">
        <div className="col-xs-12">
          <div style={{ padding: '1rem', display: 'inline-flex', marginTop: 65, width: '100%' }}>
            <Tabs large animate className="eventsTabs">
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
            </Tabs>
          </div>
        </div>
      </div>
    )}
  />
)

export default CreatePage
