import React from 'react'
import gql from 'graphql-tag'

// Styles
import { Tabs, Tab, Toaster, Position } from '@blueprintjs/core'

// Custom Components
import EventsPanel from './EventsPanel'
import CasesPanel from './CasesPanel'
import UsersPanel from './UsersPanel'

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
      submitted_at
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

  groupBy = (key) => (array) =>
    array.reduce((objectsByKeyValue, obj) => {
      const value = obj[key]
      objectsByKeyValue[value] = (objectsByKeyValue[value] || []).concat(obj)
      return objectsByKeyValue
    }, {})

  transformData = (results) => {
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
          label: 'Submitted At',
          value: 'submitted_at',
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

    zip.generateAsync({ type: 'blob' }).then((content) => {
      saveAs(
        content,
        `${results.event_export[0].event_name.replace(/\s/g, '')}__${new Date().getTime()}.zip`,
      )
    })
  }

  render() {
    return (
      <ApolloConsumer>
        {(client) => {
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
      {/* <SlidingPanelConsumer>
        {({ openSlider }) => (
          <Button
            className="case-card__actions"
            minimal
            icon={<Icon icon={IconNames.TRASH} style={{ color: '#CED9E0' }} iconSize={20} />}
            onClick={() => onWipeClick(eventID)}
            style={{ background: '#DB3737' }}
          />
        )}
      </SlidingPanelConsumer> */}
    </div>
  </div>
)

const DELETE_CASE_MUTATION = gql`
  mutation DELETE_CASE($caseId: uuid!) {
    delete_event_case(where: { case_id: { _eq: $caseId } }) {
      affected_rows
    }
  }
`

const CaseCard = ({ id, name, missingSince }) => {
  const [deleteCase] = useMutation(DELETE_CASE_MUTATION, {
    variables: { caseId: id },
    refetchQueries: [{ query: CASES_QUERY }],
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

const CreatePage = () => (
  <Can
    allowedRole={['super_admin', 'ctf_admin']}
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
