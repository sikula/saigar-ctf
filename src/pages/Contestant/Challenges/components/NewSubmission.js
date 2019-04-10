/* eslint-disable jsx-a11y/anchor-is-valid */
import React from 'react'
import PropTypes from 'prop-types'
import { Query, Mutation } from 'react-apollo'
import { Formik } from 'formik'
import { adopt } from 'react-adopt'

// Styles
import { Icon } from '@blueprintjs/core'
import { IconNames } from '@blueprintjs/icons'

// Custom Components
import { SlidingPane } from '../../../../shared/components/SlidingPane'
import NewSubmissionForm from './NewSubmission-form'
import { NEW_SUBMISSION_MUTATION, SUBMISION_INFO } from '../graphql/queries'

const NewSubmissionContainer = adopt({
  // eslint-disable-next-line react/prop-types
  submissionInfo: ({ render }) => <Query query={SUBMISION_INFO}>{render}</Query>,

  // eslint-disable-next-line react/prop-types
  newSubmission: ({ render }) => (
    <Mutation mutation={NEW_SUBMISSION_MUTATION}>
      {(mutation, result) => render({ mutation, result })}
    </Mutation>
  ),
})

const NewSubmission = ({ isOpen, onRequestClose, ...otherProps }) => (
  <SlidingPane
    isOpen={isOpen}
    onRequestClose={onRequestClose}
    closeIcon={<Icon icon={IconNames.MENU_CLOSED} iconSize={20} />}
  >
    <SlidingPane.Header>
      <SlidingPane.Header.Title title="New Submission" subtitle="Fill out the form and save" />
      <SlidingPane.Header.Actions onActionClick={onRequestClose}>
        <a>Cancel</a>
      </SlidingPane.Header.Actions>
    </SlidingPane.Header>

    <SlidingPane.Content>
      <NewSubmissionContainer>
        {({ submissionInfo: { data, loading, error }, newSubmission }) => {
          if (loading) return null
          if (error) return null
          return (
            <Formik
              initialValues={{
                category: data.submission_configuration[0].uuid,
                proof: '',
                explanation: '',
              }}
              onSubmit={values =>
                newSubmission.mutation({
                  variables: {
                    content: values.proof,
                    explanation: values.explanation,
                    teamId: data.user_team[0].team.uuid,
                    eventId: data.event[0].uuid,
                    caseId: otherProps.caseID,
                    configId: values.category,
                  },
                })
              }
              render={formikProps => <NewSubmissionForm {...formikProps} />}
            />
          )
        }}
      </NewSubmissionContainer>
    </SlidingPane.Content>

    <SlidingPane.Actions form="newSubmissionForm">SUBMIT</SlidingPane.Actions>
  </SlidingPane>
)

NewSubmission.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onRequestClose: PropTypes.func.isRequired,
  otherProps: PropTypes.objectOf(PropTypes.object()).isRequired,
}

export default NewSubmission
