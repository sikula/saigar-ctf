/* eslint-disable react/require-default-props, react/forbid-prop-types, jsx-a11y/anchor-is-valid */
import React from 'react'
import PropTypes from 'prop-types'
import { Query } from 'react-apollo'
import gql from 'graphql-tag'

import { Motion, spring } from 'react-motion'

// Styles
import { Icon, Tag, PanelStack } from '@blueprintjs/core'
import { IconNames } from '@blueprintjs/icons'

// Custom Components
import { SlidingPane } from '@shared/components/SlidingPane'
import SafeURL from '@shared/components/SafeUrl'

import './SubmissionInfo.scss'

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

const SubmissionItem = ({ data, openSubmissionHistory }) => (
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
            <a type="button" onClick={openSubmissionHistory}>
              Details
            </a>
            {/* <strong>{data.case.name}</strong> */}
            {/* <PanelConsumer>
              {({ showPanel }) => (
                <a type="button" onClick={() => showPanel(FeedPanel, data)}>
                  Details
                </a>
              )}
            </PanelConsumer> */}
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
  query submissionList($caseID: uuid!, $submissionType: String!) {
    case(where: { uuid: { _eq: $caseID } }) {
      submissions(where: { processed: { _eq: $submissionType } }) {
        uuid
        content
        explanation
        submissionConfigurationByconfigId {
          category
        }
      }
    }
  }
`

const SUBMISSION_HISTORY = gql`
  query submissionHistory($submissionID: uuid!) {
    submission(where: { uuid: { _eq: $submissionID } }) {
      history {
        decision
      }
    }
  }
`

const SubmisionHistory = ({ submissionID }) => (
  <Query query={SUBMISSION_HISTORY} variables={{ submissionID }}>
    {({ data, loading, error }) => {
      if (loading) return null
      if (error) return null

      return <div>{JSON.stringify(data)}</div>
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
    <Query query={SUBMISSION_LIST} variables={{ caseID, submissionType }}>
      {({ data, loading, error }) => {
        if (loading) return null
        if (error) return null

        console.log("SUB TYPE ", submissionType)
        const submissionData = data.case[0].submissions

        return (
          <div style={{ padding: 20 }}>
            {submissionData.map(submission => (
              <SubmissionItem
                data={submission}
                openSubmissionHistory={() => openHistoryPanel(submission.uuid)}
              />
            ))}
          </div>
        )
      }}
    </Query>
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
