/* eslint-disable react/require-default-props, react/forbid-prop-types, jsx-a11y/anchor-is-valid */
import React from 'react'
import PropTypes from 'prop-types'
import { Query, Mutation } from 'react-apollo'
import { Formik } from 'formik'
import { adopt } from 'react-adopt'

import * as Yup from 'yup'

// Styles
import { Icon } from '@blueprintjs/core'
import { IconNames } from '@blueprintjs/icons'

// Custom Components
import { SlidingPane, SlidingPanelConsumer } from '../../../../shared/components/SlidingPane'
import { AuthConsumer } from '../../../../shared/components/AuthContext/context'

import NewSubmissionForm from './NewSubmission-form'
import { NEW_SUBMISSION_MUTATION, SUBMISION_INFO, CASE_LIST } from '../graphql/queries'

const NewSubmissionSchema = Yup.object().shape({
  proof: Yup.string()
    .url('not a valid url')
    .required('required'),
  explanation: Yup.string().required('required'),
})

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
      <SlidingPanelConsumer>
        {({ closeSlider }) => (
          <AuthConsumer>
            {({ user }) => (
              <Query query={SUBMISION_INFO} variables={{ auth0id: user.id }}>
                {({ data, loading, error }) => {
                  if (loading) return null
                  if (error) return null

                  return (
                    <Mutation mutation={NEW_SUBMISSION_MUTATION}>
                      {insert_submission => (
                        <Formik
                          initialValues={{
                            category: data.submission_configuration[0].uuid,
                            proof: '',
                            explanation: '',
                          }}
                          validationSchema={NewSubmissionSchema}
                          onSubmit={values =>
                            insert_submission({
                              variables: {
                                content: values.proof,
                                explanation: values.explanation,
                                teamId: data.user_team[0].team.uuid,
                                eventId: data.event[0].uuid,
                                caseId: otherProps.caseID,
                                configId: values.category,
                              },
                              refetchQueries: [
                                {
                                  query: CASE_LIST,
                                  variables: { auth0id: user.id },
                                },
                              ],
                            }).then(() => closeSlider())
                          }
                          render={formikProps => <NewSubmissionForm {...formikProps} />}
                        />
                      )}
                    </Mutation>
                  )
                }}
              </Query>
            )}
          </AuthConsumer>
        )}
      </SlidingPanelConsumer>
    </SlidingPane.Content>

    <SlidingPane.Actions form="newSubmissionForm">SUBMIT</SlidingPane.Actions>
  </SlidingPane>
)

NewSubmission.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onRequestClose: PropTypes.func.isRequired,
  otherProps: PropTypes.any,
}

export default NewSubmission
