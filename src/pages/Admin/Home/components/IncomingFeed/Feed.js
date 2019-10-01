/* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions, jsx-a11y/no-static-element-interactions, jsx-a11y/anchor-is-valid */
import React, { useContext } from 'react'
import PropTypes from 'prop-types'
import { Query, Subscription } from 'react-apollo'
import { useSubscription } from '@apollo/react-hooks'

import gql from 'graphql-tag'
import { distanceInWordsToNow } from 'date-fns'

// Styles
import { Motion, spring } from 'react-motion'
import { Tabs, Tab, Icon, Tag, H3 } from '@blueprintjs/core'
import { IconNames } from '@blueprintjs/icons'

// Custom components
import { PanelConsumer } from '@shared/components/Panel'
import SafeURL from '@shared/components/SafeUrl'
import Can from '@shared/components/AuthContext/Can'
import { AuthContext } from '@shared/components/AuthContext/context'

import { LIVE_FEED, LIVE_FEED_FILTERED, URL_SEEN_COUNT } from '../../graphql/adminQueries'
import FeedPanel from './FeedPanel'

import './Feed.scss'

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
      <div>
        <div style={animation.render(value)} className="case-data__item__wrapper">
          <div
            className="case-data__item"
            style={
              data.teamByteamId.judge_teams_aggregate.aggregate.count > 0
                ? { borderLeft: '6px solid #3DCC91' }
                : { borderLeft: '6px solid #FF7373' }
            }
          >
            <div
              style={{
                padding: '5px 0px 5px 0px',
                display: 'flex',
                flex: 1,
                justifyContent: 'space-between',
              }}
            >
              <span style={{ fontWeight: 450, fontSize: '1em' }}>{data.teamByteamId.name}</span>
              <span
                style={{ fontWeight: 300, fontSize: '0.8em', textTransform: 'uppercase' }}
              >{`${distanceInWordsToNow(new Date(data.submitted_at), {
                includeSeconds: true,
              })} Ago`}</span>
            </div>
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
        </div>
        <div style={{ textAlign: 'center', ...animation.render(value) }}>
          <Query query={URL_SEEN_COUNT} variables={{ url: data.content }}>
            {({ data: urlData, loading }) =>
              !loading ? (
                <div
                  style={
                    data.teamByteamId.judge_teams_aggregate.aggregate.count > 0
                      ? {
                          borderLeft: '6px solid #3DCC91',
                          color: '#394B59',
                          fontSize: '0.85em',
                          fontWeight: 600,
                        }
                      : {
                          borderLeft: '6px solid #FF7373',
                          color: '#394B59',
                          fontSize: '0.85em',
                          fontWeight: 600,
                        }
                  }
                >
                  <Icon icon={IconNames.EMPLOYMENT} />
                  {urlData.urlCount.aggregate.count === 1
                    ? `${urlData.urlCount.aggregate.count} URL HIT`
                    : `${urlData.urlCount.aggregate.count} URL HITS`}
                </div>
              ) : null
            }
          </Query>
        </div>
      </div>
    )}
  </Motion>
)

SubmissionItem.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  data: PropTypes.any.isRequired,
}

// TODO(peter):
//  This could probably be cleaner by just passing data
//  as props and use the correct stuff in the component
const SubmissionListView = ({ data }) =>
  data.map(submission => <SubmissionItem key={submission.uuid} data={submission} />)

/*
  NOTE(Peter): Dynamic Queries are weird, and I'm not 100% sure how to do it
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

const JUDGES_FEED = gql`
  subscription judgesFeed($auth0id: String!) {
    judge_team(where: { user: { auth0id: { _eq: $auth0id } } }) {
      team {
        uuid
      }
      user {
        uuid
      }
    }
  }
`

const EVENT_CONFIG = gql`
  subscription eventConfig {
    event(order_by: { start_time: desc }, limit: 1) {
      free_for_all
    }
  }
`

const JudgeFeed = () => {
  const { user } = useContext(AuthContext)
  const { loading, data } = useSubscription(JUDGES_FEED, {
    variables: { auth0id: user.id },
  })
  const { loading: eventConfigLoading, data: eventConfigData } = useSubscription(EVENT_CONFIG)

  if (loading || eventConfigLoading) return null

  const teams = data.judge_team.map(({ team }) => team.uuid)
  const { free_for_all: freeForAll } = eventConfigData.event[0]

  return freeForAll ? (
    <SubscriptionData subscription={LIVE_FEED} />
  ) : (
    <SubscriptionData subscription={LIVE_FEED_FILTERED} teams={teams} />
  )
}


const AdminFeed = () => <SubscriptionData subscription={LIVE_FEED} />

const SubmissionList = () => (
  <React.Fragment>
    <Can allowedRole="ctf_admin" yes={() => <AdminFeed />} />
    <Can allowedRole="judge" yes={() => <JudgeFeed />} />
  </React.Fragment>
)

export default SubmissionList
