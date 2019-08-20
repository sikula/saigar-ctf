/* eslint-disable no-return-assign, react/no-multi-comp */
import React, { useState, useRef } from 'react'
import PropTypes from 'prop-types'

import { useMutation } from '@apollo/react-hooks'
import { Query, Mutation } from 'react-apollo'
import gql from 'graphql-tag'

// Styles
import {
  Tabs,
  Tab,
  H3,
  Icon,
  Button,
  Toaster,
  Position,
  HTMLSelect,
  ButtonGroup,
  TextArea,
} from '@blueprintjs/core'
import { IconNames } from '@blueprintjs/icons'

// Custom imports
import SafeURL from '@shared/components/SafeUrl'
import CaseInfoData from '@features/CaseInfo/components'
import { AuthConsumer } from '@shared/components/AuthContext/context'
import { PROCESS_SUBMISSION, INSERT_SUBMISSION_HISTORY } from '../../graphql/adminQueries'
import { PanelConsumer } from '../../../../../shared/components/Panel'

const FeedToaster = Toaster.create({
  classname: 'feed-toaster',
  position: Position.TOP_LEFT,
})

const ShareButton = ({ uuid }) => {
  const textAreaRef = useRef()

  const copySubmissionUrl = e => {
    textAreaRef.current.select()
    document.execCommand('copy')
    e.target.focus()

    FeedToaster.show({ message: 'Shareable link copied successfully!' })
  }

  return (
    <React.Fragment>
      <Button intent="primary" large fill icon={IconNames.CLIPBOARD} onClick={copySubmissionUrl}>
        Share
      </Button>

      <textarea
        ref={textAreaRef}
        readOnly
        value={`${window.location.protocol}//${window.location.hostname}/submission/${uuid}`}
        style={{ position: 'absolute', zIndex: '-1', height: 0, opacity: '0.01' }}
      />
    </React.Fragment>
  )
}

ShareButton.propTypes = {
  uuid: PropTypes.string.isRequired,
}

const SUBMISSION_DETAILS = gql`
  query submissionConfig {
    submission_configuration {
      uuid
      category
      points
    }
  }
`

const CategoryList = ({ currentCategory, handleChange }) => (
  <Query query={SUBMISSION_DETAILS} fetchPolicy="cache-first">
    {({ error, loading, data }) => {
      if (loading) return null
      if (error) return <div>{`${error.message}`}</div>

      return (
        <HTMLSelect name="category" value={currentCategory} onChange={handleChange} fill large>
          {data.submission_configuration.map(config => (
            <option key={config.uuid} id={config.category} value={config.uuid}>{`${
              config.category
            } (${config.points} pts.)`}</option>
          ))}
        </HTMLSelect>
      )
    }}
  </Query>
)

CategoryList.propTypes = {
  currentCategory: PropTypes.string.isRequired,
  handleChange: PropTypes.func.isRequired,
}

const AcceptSubmissionControls = ({ uuid, category, hidePanel }) => {
  const [acceptedReason, setAcceptedReason] = useState()

  // GraphQL Layer
  const [processSubmission] = useMutation(PROCESS_SUBMISSION)
  const [insertSubmissionHist] = useMutation(INSERT_SUBMISSION_HISTORY)

  // Handler Functions
  const handleChange = e => {
    setAcceptedReason(e.target.value)
  }

  return (
    <React.Fragment>
      <TextArea
        fill
        placeHolder="OPTIONAL: Specify a reason why the submission was accepted"
        value={acceptedReason}
        onChange={handleChange}
      />
      <AuthConsumer>
        {({ user }) => (
          <Button
            text="Accept"
            intent="success"
            large
            icon={IconNames.CROSS}
            style={{ marginTop: 10, marginBottom: 20 }}
            onClick={() => {
              processSubmission({
                variables: {
                  submissionID: uuid,
                  value: 'ACCEPTED',
                  processedAt: new Date(),
                  category,
                },
              })
                .then(() =>
                  insertSubmissionHist({
                    variables: {
                      submissionID: uuid,
                      decision: 'ACCEPTED',
                      processedBy: user.id,
                      acceptedReason,
                    },
                  }),
                )
                .then(hidePanel)
            }}
          />
        )}
      </AuthConsumer>
    </React.Fragment>
  )
}

/*
  @NOTE(Peter):
    This is a duplicate basically of the code above, but there are quite a few
    parameters that differ so right now I'm just duplicating, but we can look
    back at this later to see how we can combine the two.
*/
const RejectSubmissionControls = ({ uuid, category, hidePanel }) => {
  const [rejectedReason, setRejectedReason] = useState()

  // GraphQL Layer
  const [processSubmission] = useMutation(PROCESS_SUBMISSION)
  const [insertSubmissionHist] = useMutation(INSERT_SUBMISSION_HISTORY)

  // Handler Functions
  const handleChange = e => {
    setRejectedReason(e.target.value)
  }

  return (
    <React.Fragment>
      <TextArea
        fill
        placeHolder="reason for rejecting the submission"
        value={rejectedReason}
        onChange={handleChange}
      />
      <AuthConsumer>
        {({ user }) => (
          <Button
            text="Reject"
            intent="danger"
            large
            disabled={!rejectedReason}
            icon={IconNames.CROSS}
            style={{ marginTop: 10 }}
            onClick={() => {
              processSubmission({
                variables: {
                  submissionID: uuid,
                  value: 'REJECTED',
                  processedAt: new Date(),
                  category,
                },
              })
                .then(() =>
                  insertSubmissionHist({
                    variables: {
                      submissionID: uuid,
                      decision: 'REJECTED',
                      processedBy: user.id,
                      rejectedReason,
                    },
                  }),
                )
                .then(hidePanel)
            }}
          />
        )}
      </AuthConsumer>
    </React.Fragment>
  )
}

const SubmissionDetailsPanel = ({
  uuid,
  teamName,
  explanation,
  content,
  hidePanel,
  category,
  handleChange,
}) => {
  // GraphQL Layer
  const [processSubmission] = useMutation(PROCESS_SUBMISSION)
  const [insertSubmissionHist] = useMutation(INSERT_SUBMISSION_HISTORY)

  return (
    <React.Fragment>
      <div>
        <CategoryList currentCategory={category} handleChange={handleChange} />
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          marginTop: 10,
          alignItems: 'center',
        }}
      >
        <ButtonGroup fill>
          <ShareButton uuid={uuid} />
          <AuthConsumer>
            {({ user }) => (
              <Button
                text="Star"
                intent="warning"
                large
                fill
                icon={IconNames.STAR}
                onClick={() => {
                  processSubmission({
                    variables: {
                      submissionID: uuid,
                      value: 'STARRED',
                      processedAt: new Date(),
                      category,
                    },
                  })
                    .then(() =>
                      insertSubmissionHist({
                        variables: {
                          submissionID: uuid,
                          decision: 'STARRED',
                          processedBy: user.id,
                        },
                      }),
                    )
                    .then(hidePanel)
                }}
              />
            )}
          </AuthConsumer>
        </ButtonGroup>
      </div>
      <div>
        <div style={{ paddingTop: 10, textAlign: 'center' }}>
          <H3 style={{ background: '#E1E8ED', padding: 10 }}>{teamName}</H3>
        </div>
        <div style={{ paddingTop: 10 }}>
          <SafeURL dangerousURL={content} text={content} style={{ wordWrap: 'break-word' }} />
        </div>
        <div style={{ paddingTop: 10 }}>
          <p style={{ wordWrap: 'break-word' }}>{explanation}</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'end' }}>
          <AcceptSubmissionControls uuid={uuid} category={category} hidePanel={hidePanel} />
          <RejectSubmissionControls uuid={uuid} category={category} hidePanel={hidePanel} />
        </div>
      </div>
    </React.Fragment>
  )
}

const PanelContent = ({
  uuid,
  caseID,
  teamName,
  explanation,
  content,
  hidePanel,
  submissionConfiguration,
}) => {
  const [category, setCategory] = useState(submissionConfiguration.uuid)

  const handleChange = e => {
    setCategory(e.currentTarget.value)
  }

  return (
    <React.Fragment>
      <Tabs id="detailsTab" selectedTabIndex="submissionDetails" renderActiveTabPanelOnly>
        <Tab
          id="submissionDetails"
          title="Submission Details"
          panel={
            <SubmissionDetailsPanel
              uuid={uuid}
              teamName={teamName}
              explanation={explanation}
              content={content}
              hidePanel={hidePanel}
              category={category}
              handleChange={handleChange}
            />
          }
        />
        <Tab id="caseDetails" title="Case Details" panel={<CaseInfoData caseID={caseID} />} />
      </Tabs>
    </React.Fragment>
  )
}

PanelContent.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  submissionConfiguration: PropTypes.any.isRequired,
  uuid: PropTypes.string.isRequired,
  teamName: PropTypes.string.isRequired,
  explanation: PropTypes.string.isRequired,
  content: PropTypes.string.isRequired,
  hidePanel: PropTypes.func.isRequired,
  caseID: PropTypes.string.isRequired,
}

/* 
  TODO(Peter):
    We might want to change the panels to portals so they render in a different spot, which 
    makes it easier to work with and may negate some of the re-rendering bugs that might pop up
*/

const FeedPanel = ({
  uuid,
  teamByteamId,
  explanation,
  content,
  submissionConfigurationByconfigId,
  case: { uuid: caseID },
}) => (
  <PanelConsumer>
    {({ hidePanel }) => (
      <div
        style={{
          position: 'absolute',
          width: '500px',
          right: '365px',
          background: '#F5F8FA',
          top: 0,
          height: '100%',
          padding: 20,
          zIndex: 9999,
          borderRight: '1px solid #e6dddd',
          boxShadow: '-10px 0px 10px 1px rgba(0, 0, 0,0.08)',
          overflowY: 'auto',
        }}
      >
        <Icon icon={IconNames.CROSS} iconSize={32} onClick={hidePanel} />
        <PanelContent
          uuid={uuid}
          teamName={teamByteamId.name}
          explanation={explanation}
          content={content}
          submissionConfiguration={submissionConfigurationByconfigId}
          hidePanel={hidePanel}
          caseID={caseID}
          key={uuid}
        />
      </div>
    )}
  </PanelConsumer>
)

FeedPanel.propTypes = {
  uuid: PropTypes.string.isRequired,
  teamByteamId: PropTypes.objectOf(PropTypes.object).isRequired,
  explanation: PropTypes.string.isRequired,
  content: PropTypes.string.isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  submissionConfigurationByconfigId: PropTypes.any.isRequired,
}

export default FeedPanel
