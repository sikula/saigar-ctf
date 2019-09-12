/* eslint-disable react/require-default-props, react/forbid-prop-types, jsx-a11y/anchor-is-valid */
import React, { useContext } from 'react'
import PropTypes from 'prop-types'
import { Query, Mutation } from 'react-apollo'
import { useQuery, useMutation } from '@apollo/react-hooks'

import { Formik } from 'formik'

import * as Yup from 'yup'

// Styles
import { Icon } from '@blueprintjs/core'
import { IconNames } from '@blueprintjs/icons'

// Custom Components
import { AuthContext } from '@shared/components/AuthContext/context'
import { SlidingPane, SlidingPanelConsumer } from '../../../../shared/components/SlidingPane'
import { AuthConsumer } from '../../../../shared/components/AuthContext/context'

import NewSubmissionForm from './NewSubmission-form'
import { NEW_SUBMISSION_MUTATION, SUBMISION_INFO, CASE_LIST } from '../graphql/queries'

const NewSubmissionSchema = Yup.object().shape({
  proof: Yup.string()
    .url('not a valid url')
    .required('required'),
  explanation: Yup.string().required('required'),
  supporting_evidence: Yup.string().required('required'),
})

const NewSubmission = ({ isOpen, onRequestClose, ...otherProps }) => {
  // State Layer
  const { user } = useContext(AuthContext)

  // GraphQL Layer
  const { data, loading, error } = useQuery(SUBMISION_INFO, {
    variables: {
      auth0id: user.id,
    },
  })

  const [newSubmission, newSubmissionResult] = useMutation(NEW_SUBMISSION_MUTATION)

  // =======================================================
  //  RENDER
  // =======================================================
  return (
    <SlidingPane
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      closeIcon={<Icon icon={IconNames.MENU_CLOSED} iconSize={20} />}
    >
      <SlidingPane.Header>
        <SlidingPane.Header.Title
          title={`${otherProps.caseName}`}
          subtitle="Fill out the form and save"
        />
        <SlidingPane.Header.Actions onActionClick={onRequestClose}>
          <a>Cancel</a>
        </SlidingPane.Header.Actions>
      </SlidingPane.Header>

      <SlidingPane.Content>
        <SlidingPanelConsumer>
          {({ closeSlider }) => {
            if (loading) return null
            if (error) return null

            return (
              <Formik
                initialValues={{
                  category: data.submission_configuration[0].uuid,
                  proof: '', // source url
                  explanation: '', // relevance
                  supporting_evidence: '',
                }}
                validationSchema={NewSubmissionSchema}
                onSubmit={values =>
                  newSubmission({
                    variables: {
                      content: values.proof, // source_url
                      explanation: values.explanation, // relevance
                      supporting_evidence: values.supporting_evidence,
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
            )
          }}
        </SlidingPanelConsumer>
      </SlidingPane.Content>

      <SlidingPane.Actions form="newSubmissionForm">SUBMIT</SlidingPane.Actions>
    </SlidingPane>
  )
}

NewSubmission.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onRequestClose: PropTypes.func.isRequired,
  otherProps: PropTypes.any,
}

export default NewSubmission
