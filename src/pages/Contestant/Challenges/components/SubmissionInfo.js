/* eslint-disable react/require-default-props, react/forbid-prop-types */
import React from 'react'
import PropTypes from 'prop-types'
import { Query } from 'react-apollo'
import gql from 'graphql-tag'

import format from 'date-fns/format'
import { distanceInWordsToNow } from 'date-fns'

import { Motion, spring } from 'react-motion'
import { Timeline, TimelineEvent } from 'react-event-timeline'

// Styles
import { Icon, Tag, PanelStack } from '@blueprintjs/core'
import { IconNames } from '@blueprintjs/icons'

// Custom Components
import { SlidingPane } from '@shared/components/SlidingPane'
import SafeURL from '@shared/components/SafeUrl'
import { AuthConsumer } from '@shared/components/AuthContext/context'

import './SubmissionInfo.scss'

const SUBMISSION_HISTORY = gql`
  query submissionHistory($submissionID: uuid!) {
    submission(where: { uuid: { _eq: $submissionID } }) {
      submissionConfigurationByconfigId {
        category
        points
      }
      history(order_by: { processed_at: desc }) {
        decision
        processed_at
        processedByUser {
          role
          username
        }
        rejected_reason
        accepted_reason
      }
    }
  }
`

const SUBMISSION_TYPES = {
  DARK_WEB: 'Dark Web',
  LOCATION: 'Location',
  DAY_LAST_SEEN: 'Day Last Seen',
  ADVANCED_SUBJECT_INFO: 'Advanced Subject Info',
  BASIC_SUBJECT_INFO: 'Basic Subject Info',
  HOME: 'Home',
  FAMILY: 'Family',
  FRIENDS: 'Friends',
  EMPLOYMENT: 'Employment',
}

const animation = {
  defaultStyle: { translateX: 200 },
  // style: { scale: spring(0, { stiffness: 350, damping: 50 })  },
  style: { translateX: spring(0, { stiffness: 400, damping: 50 }) },
  // render: (value) => ({ transform: `scale3d(${value.scale},${value.scale},${value.scale})` })
  render: value => ({ transform: `translateX(${value.translateX}px)` }),
}

const SubmissionItem = ({ data, openSubmissionHistory, submissionType }) => (
  <Motion defaultStyle={animation.defaultStyle} style={animation.style}>
    {value => (
      <div style={animation.render(value)} className="case-data__item__wrapper">
        <div className="case-data__item">
          {/* <div style={{ padding: '5px 0px 5px 0px', display: 'flex' }}>
            <span style={{ fontWeight: 450, fontSize: '1em' }}>{data.teamByteamId.name}</span>
          </div> */}
          <span
            style={{
              padding: '5px 0px 5px 0px',
              fontWeight: 500,
              color: '#5C7080',
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            <Tag large>
              {SUBMISSION_TYPES[data.submissionConfigurationByconfigId.category] || ''}
            </Tag>
          </span>

          <span className="long-text" style={{ paddingTop: '8px', paddingBottom: '8px' }}>
            <SafeURL dangerousURL={data.content} text={data.content} />
          </span>
          <span className="long-text">{data.explanation}</span>
          <div
            style={{
              textAlign: 'right',
              display: 'inline-flex',
              justifyContent: 'space-between',
              marginTop: 8,
            }}
          >
            {(submissionType.includes('ACCEPTED') || submissionType.includes('STARRED')) && (
              <React.Fragment>
                <div>{`Submitted ${distanceInWordsToNow(new Date(data.submitted_at))} Ago`}</div>
                <a type="button" onClick={openSubmissionHistory}>
                  Details
                </a>
              </React.Fragment>
            )}
            {submissionType.includes('PENDING') && (
              <div>{`Processed ${distanceInWordsToNow(new Date(data.processed_at))} Ago`}</div>
            )}
            {submissionType.includes('REJECTED') && (
              <React.Fragment>
                <div>{`Processed ${distanceInWordsToNow(new Date(data.processed_at))} Ago`}</div>
                <a type="button" onClick={openSubmissionHistory}>
                  Details
                </a>
              </React.Fragment>
            )}
          </div>
        </div>
      </div>
    )}
  </Motion>
)

SubmissionItem.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  data: PropTypes.any.isRequired,
}

const SUBMISSION_LIST = gql`
  query submissionList($auth0id: String!, $caseID: uuid!, $submissionType: [String!]!) {
    team(where: { user_team: { user: { auth0id: { _eq: $auth0id } } } }) {
      submissionsByteamId(
        where: { processed: { _in: $submissionType }, case_id: { _eq: $caseID } }
        order_by: { processed_at: desc }
      ) {
        uuid
        submitted_at
        processed_at
        content
        explanation
        submissionConfigurationByconfigId {
          category
        }
      }
    }
  }
`

/*
  NOTE(Peter):
    This code is duplicated (see HistoryTab in Admin/Home). For now its ok, but may
    lead to bugs eventually.  Should refactor out when it becomes an issue.
*/
const SubmisionHistory = ({ submissionID }) => (
  <Query
    query={SUBMISSION_HISTORY}
    variables={{ submissionID }}
    fetchPolicy="network-only"
    skip={!submissionID}
  >
    {({ data, loading, error }) => {
      if (!data) return null
      if (loading) return null
      if (error) return `Error: ${error}`

      const { submission } = data
      const {
        history: submissionHistory,
        submissionConfigurationByconfigId: config,
      } = submission[0]

      return (
        <div>
          <Timeline>
            {submissionHistory.map(submission => {
              let icon
              let color
              let title

              if (submission.decision === 'ACCEPTED') {
                icon = IconNames.TICK
                color = '#48AFF0'
                title = (
                  <div>
                    {submission.processedByUser.role.toLowerCase()}{' '}
                    <strong>({submission.processedByUser.username})</strong>{' '}
                    {submission.decision.toLowerCase()} the submission for +{config.points} points (
                    {config.category.toLowerCase()})
                  </div>
                )
              }

              if (submission.decision === 'REJECTED') {
                icon = IconNames.CROSS
                color = '#A82A2A'
                title = (
                  <div>
                    {submission.processedByUser.role.toLowerCase()}
                    <strong>({submission.processedByUser.username})</strong>
                    {submission.decision.toLowerCase()} the submission
                  </div>
                )
              }

              if (submission.decision === 'STARRED') {
                icon = IconNames.STAR
                color = '#3DCC91'
                title = (
                  <div>
                    {submission.processedByUser.role.toLowerCase()}
                    <strong>({submission.processedByUser.username})</strong>
                    {submission.decision.toLowerCase()} the submission
                  </div>
                )
              }

              if (submission.decision === 'UPDATED_POINTS') {
                icon = IconNames.CHANGES
                color = '#3DCC91'
                title = (
                  <div>
                    {submission.processedByUser.role.toLowerCase()}
                    <strong>({submission.processedByUser.username})</strong>
                    updated the points on this submission
                  </div>
                )
              }

              return (
                <TimelineEvent
                  title={title}
                  createdAt={format(new Date(submission.processed_at), 'HH:mm')}
                  icon={<Icon icon={icon} />}
                  contentStyle={{ background: '#EBF1F5' }}
                  iconColor="#FFF"
                  bubbleStyle={{ background: color }}
                >
                  {submission.decision === 'ACCEPTED'
                    ? submission.accepted_reason
                    : submission.rejected_reason}
                </TimelineEvent>
              )
            })}
          </Timeline>
        </div>
      )
    }}
  </Query>
)

const SubmissionList = ({ openPanel, caseID, submissionType }) => {
  const openHistoryPanel = submissionID => {
    openPanel({
      component: SubmisionHistory,
      props: { submissionID },
      title: 'History',
    })
  }

  return (
    <AuthConsumer>
      {({ user }) => (
        <Query query={SUBMISSION_LIST} variables={{ auth0id: user.id, caseID, submissionType }}>
          {({ data, loading, error }) => {
            if (loading) return null
            if (error) return null

            const submissionData = data.team[0].submissionsByteamId

            return (
              <div>
                {submissionData.map(submission => (
                  <SubmissionItem
                    key={submission.uuid}
                    data={submission}
                    openSubmissionHistory={() => openHistoryPanel(submission.uuid)}
                    submissionType={submissionType}
                  />
                ))}
              </div>
            )
          }}
        </Query>
      )}
    </AuthConsumer>
  )
}

const SubmissionInfo = ({ isOpen, onRequestClose, ...otherProps }) => (
  <SlidingPane
    isOpen={isOpen}
    onRequestClose={onRequestClose}
    closeIcon={<Icon icon={IconNames.MENU_CLOSED} iconSize={20} />}
  >
    <SlidingPane.Header>
      <SlidingPane.Header.Title title="Submission Info" subtitle={`${otherProps.caseName}`} />
      <SlidingPane.Header.Actions onActionClick={onRequestClose}>
        <a>Cancel</a>
      </SlidingPane.Header.Actions>
    </SlidingPane.Header>

    <SlidingPane.Content style={{ paddingLeft: 0, paddingRight: 0, paddingTop: 90 }}>
      <PanelStack
        className="panel-stack"
        initialPanel={{
          component: SubmissionList,
          props: { caseID: otherProps.caseID, submissionType: otherProps.submissionType },
          title: 'Submissions',
        }}
      />
    </SlidingPane.Content>
  </SlidingPane>
)

SubmissionInfo.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onRequestClose: PropTypes.func.isRequired,
  otherProps: PropTypes.any,
}

export default SubmissionInfo
