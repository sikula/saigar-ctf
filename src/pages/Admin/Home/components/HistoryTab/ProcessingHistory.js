/* eslint-disable react/require-default-props, react/forbid-prop-types, jsx-a11y/anchor-is-valid */
import React from 'react'
import PropTypes from 'prop-types'
import { Query, Mutation } from 'react-apollo'
import gql from 'graphql-tag'

import format from 'date-fns/format'

// Styles
import { Icon } from '@blueprintjs/core'
import { IconNames } from '@blueprintjs/icons'

import { Timeline, TimelineEvent } from 'react-event-timeline'

// Custom Components
import { SlidingPane, SlidingPanelConsumer } from '@shared/components/SlidingPane'
import { AuthConsumer } from '@shared/components/AuthContext/context'

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
      }
    }
  }
`

const SubmissionHistory = ({ isOpen, onRequestClose, ...otherProps }) => (
  <SlidingPane
    isOpen={isOpen}
    onRequestClose={onRequestClose}
    closeIcon={<Icon icon={IconNames.MENU_CLOSED} iconSize={20} />}
  >
    <SlidingPane.Header>
      <SlidingPane.Header.Title
        title="Processing History"
        subtitle="Complete history of this submission"
      />
      <SlidingPane.Header.Actions onActionClick={onRequestClose}>
        <a>Cancel</a>
      </SlidingPane.Header.Actions>
    </SlidingPane.Header>

    <SlidingPane.Content style={{ paddingLeft: 0, paddingRight: 0, paddingTop: 70 }}>
      <SlidingPanelConsumer>
        {({ closeSlider }) => (
          <AuthConsumer>
            {({ user }) => (
              <Query
                query={SUBMISSION_HISTORY}
                variables={{ submissionID: otherProps.submissionID }}
                fetchPolicy="network-only"
                skip={!otherProps.submissionID}
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
                                {submission.decision.toLowerCase()} the submission for +
                                {config.points} points ({config.category.toLowerCase()})
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
                              {submission.rejected_reason}
                            </TimelineEvent>
                          )
                        })}
                      </Timeline>
                    </div>
                  )
                }}
              </Query>
            )}
          </AuthConsumer>
        )}
      </SlidingPanelConsumer>
    </SlidingPane.Content>
  </SlidingPane>
)

SubmissionHistory.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onRequestClose: PropTypes.func.isRequired,
  otherProps: PropTypes.any,
}

export default SubmissionHistory
