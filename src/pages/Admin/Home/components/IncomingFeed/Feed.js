/* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions, jsx-a11y/no-static-element-interactions, jsx-a11y/anchor-is-valid */
import React from 'react'
import PropTypes from 'prop-types'
import { Mutation, Subscription } from 'react-apollo'
import { connect } from 'react-redux'

import { Motion, spring } from 'react-motion'
import { Icon, Tag, H3 } from '@blueprintjs/core'
import { IconNames } from '@blueprintjs/icons'

import { LIVE_FEED, LIVE_FEED_FILTERED, PROCESS_SUBMISSION } from '../../graphql/adminQueries'
import FeedPanel from './FeedPanel'
import { PanelConsumer } from '../../../../../shared/components/Panel'

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

const SubmissionItem = ({ data }) => (
  <Motion defaultStyle={animation.defaultStyle} style={animation.style}>
    {value => (
      <div style={animation.render(value)} className="case-data__item__wrapper">
        <div className="case-data__item">
          <span
            style={{
              padding: '5px 0px 5px 0px',
              fontWeight: 500,
              color: '#5C7080',
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            <Tag>{SUBMISSION_TYPES[data.submissionConfigurationByconfigId.category] || ''}</Tag>
            <span style={{ fontWeight: 450, fontSize: '1em' }}>{data.teamByteamId.name}</span>
          </span>
          <span className="long-text" style={{ paddingTop: '8px', paddingBottom: '8px' }}>
            <a href={data.content}>{data.content}</a>
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
            <strong>{data.case.name}</strong>
            <PanelConsumer>
              {({ showPanel }) => (
                <a type="button" onClick={() => showPanel(FeedPanel, data)}>
                  Details
                </a>
              )}
            </PanelConsumer>
          </div>
        </div>

        <Mutation mutation={PROCESS_SUBMISSION}>
          {updateSubmission => (
            <div className="case-data__item__icons">
              <a
                type="button"
                onClick={() =>
                  updateSubmission({
                    variables: {
                      submissionID: data.uuid,
                      value: 'ACCEPTED', // processed = ACCEPTED
                      processedAt: new Date(),
                      category: data.submissionConfigurationByconfigId.uuid,
                    },
                  })
                }
              >
                <Icon intent="primary" icon={IconNames.TICK} iconSize={22} />
              </a>
              <a
                type="button"
                onClick={() =>
                  updateSubmission({
                    variables: {
                      submissionID: data.uuid,
                      value: 'REJECTED', // processed = REJECTED
                      processedAt: new Date(),
                      category: data.submissionConfigurationByconfigId.uuid,
                    },
                  })
                }
              >
                <Icon intent="primary" icon={IconNames.CROSS} iconSize={22} />
              </a>
            </div>
          )}
        </Mutation>
      </div>
    )}
  </Motion>
)

SubmissionItem.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  data: PropTypes.any.isRequired,
}

function mapStateToProps(state) {
  return {
    teamFilter: state.filter.teamFilter,
  }
}

// TODO(peter):
//  This could probably be cleaner by just passing data
//  as props and use the correct stuff in the component
const SubmissionListView = ({ data }) =>
  data.map(submission => <SubmissionItem key={submission.uuid} data={submission} />)

/*
  Dynamic Queries are weird, and I'm not 100% sure how to do it
  any cleaner way, although this feels kinda hacky currently
*/
const SubscriptionData = ({ subscription, teams }) => (
  <Subscription subscription={subscription} variables={{ teams }}>
    {({ data, loading, error }) => {
      if (!data) return null
      if (loading) {
        return (
          <div className="case-data__item__wrapper">
            <div className="case-data__item">Loading...</div>
          </div>
        )
      }
      if (error) return <div>`${error.message}`</div>

      if (!Array.isArray(data.event) || !data.event.length) {
        return <div />
      }

      const { submissions } = data.event[0]

      if (!Array.isArray(submissions) || !submissions.length) {
        return <H3 style={{ textAlign: 'center', padding: 20 }}>No Pending Submissions</H3>
      }

      return <SubmissionListView data={submissions} />
    }}
  </Subscription>
)

SubscriptionData.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  subscription: PropTypes.any.isRequired,
  teams: PropTypes.arrayOf(PropTypes.array).isRequired,
}

const SubmissionList = ({ teamFilter }) => {
  return teamFilter.length > 0 ? (
    <SubscriptionData subscription={LIVE_FEED_FILTERED} teams={teamFilter} />
  ) : (
    <SubscriptionData subscription={LIVE_FEED} teams={teamFilter} />
  )
}

SubmissionList.propTypes = {
  teamFilter: PropTypes.arrayOf(PropTypes.array).isRequired,
}

export default connect(
  mapStateToProps,
  null,
)(SubmissionList)
