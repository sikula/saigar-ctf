import React from 'react'
import { Query } from 'react-apollo'

// Styles
import { Card, Button, Tabs, Tab, Icon } from '@blueprintjs/core'
import { IconNames } from '@blueprintjs/icons'

// Custom Components
import { SlidingPanelConsumer } from '../../../_Common/components/SlidingPane'
import { CreateCase, EditCase, CreateEvent, EditEvent } from './components'
import { EVENTS_QUERY, CASES_QUERY } from './graphql/graphQueries'

import Can from '../../../_Common/components/AuthContext/Can'

import './index.scss'

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
    </div>
  </div>
)

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
    role="ctf_admin"
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
