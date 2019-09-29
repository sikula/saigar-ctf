import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { Query, ApolloConsumer } from 'react-apollo'
import { useQuery } from '@apollo/react-hooks'
import gql from 'graphql-tag'

import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import { Parser } from 'json2csv'

// Style Library
import { Dialog, Toaster, Position, Classes, Card, Button, Icon, H3, H5 } from '@blueprintjs/core'
import { IconNames } from '@blueprintjs/icons'

// Custom Components
import { SlidingPanelConsumer } from '../../../shared/components/SlidingPane'
import CreateEvent from './components/CreateEvent'
import EditEvent from './components/EditEvent'
import UploadUser from './components/UploadUser'

// GraphQL Data
import { EVENTS_QUERY } from './graphql/graphQueries'

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

/*
  @NOTE(peter):
    These are the steps necessary to to wipe the event (in order):
        1) Query all the information for the event
        2) Extract the user + teams array
        3) delete user_team
        4) delete user
        5) delete team_event
        6) delete team
        7) delete event_case
        8) delete submission_history
        9) delete submission
        10) delete case
        11) delete event
        12) delete judge_team

      This is the query:
        query GET_EVENT_DATA($eventID: uuid!) {
          event(where: {
            uuid: { _eq: $eventID }
          }) {
            team_events {
              team {
                name
                user_team {
                  user {
                    nickname
                  }
                }
                judge_teams {
                  judge_id
                }
              }
            }
          }
        }
*/

const EVENT_DATA = gql`
  query getEventData($eventId: uuid!) {
    event(where: { uuid: { _eq: $eventId } }) {
      team_events {
        team {
          uuid
          user_team {
            user {
              email
            }
          }
          judge_teams {
            judge_id
          }
        }
      }
    }
  }
`

const WipeEventDialog = ({ isOpen, onWipeClick, onCancelClick }) => {
  const { data, loading, error } = useQuery(EVENT_DATA, {
    variables: {
      eventId: 'f4edfe2e-0ef2-4dd4-b1aa-5dd2d17487af',
    },
  })

  if (!loading) {
    const { team_events: team } = data.event[0]
    console.log(team)
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
        {loading ? (
          <div>Loading....</div>
        ) : (
          <React.Fragment>
            <H3>Warning</H3>
            <p>
              This action will wipe all the data for the current event. This action is irreversible.
            </p>
            <p>
              <strong>The following data will be removed:</strong>
              <ul>
                <li>All Teams registered for the event</li>
                <li>All Users on the team</li>
                <li>All Cases for the event</li>
                <li>All Submissions on each case</li>
                <li>All history for a submission </li>
                <li>The event </li>
              </ul>
            </p>
          </React.Fragment>
        )}
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
}

const groupBy = key => array =>
  array.reduce((objectsByKeyValue, obj) => {
    const value = obj[key]
    objectsByKeyValue[value] = (objectsByKeyValue[value] || []).concat(obj)
    return objectsByKeyValue
  }, {})

const transformData = results => {
  const zip = new JSZip()
  const groupByCase = groupBy('case_name')

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

const DownloadCsvButton = ({ event }) => (
  <ApolloConsumer>
    {client => (
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
                transformData(data)
              }
            })
        }}
      />
    )}
  </ApolloConsumer>
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
      <Button
        className="case-card__actions"
        minimal
        icon={<Icon icon={IconNames.TRASH} style={{ color: '#CED9E0' }} iconSize={20} />}
        onClick={() => onWipeClick(eventID)}
        style={{ background: '#DB3737' }}
      />
    </div>
  </div>
)

EventCard.propTypes = {
  eventID: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  startTime: PropTypes.string.isRequired,
  endTime: PropTypes.string.isRequired,
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

export default EventsPanel
