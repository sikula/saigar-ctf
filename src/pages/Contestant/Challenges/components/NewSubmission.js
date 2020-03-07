/* eslint-disable react/require-default-props, react/forbid-prop-types */
import React, { useContext } from 'react'
import PropTypes from 'prop-types'
import cookie from 'react-cookies'

import useAxios from 'axios-hooks'
import { useQuery, useMutation } from '@apollo/react-hooks'

import { Formik } from 'formik'

import * as Yup from 'yup'

// Styles
import { Icon } from '@blueprintjs/core'
import { IconNames } from '@blueprintjs/icons'

// Custom Components
import { AuthContext } from '@shared/components/AuthContext/context'
import { SlidingPane, SlidingPanelConsumer } from '../../../../shared/components/SlidingPane'

import NewSubmissionForm from './NewSubmission-form'
import {
  NEW_SUBMISSION_MUTATION,
  NEW_SUBMISSIONFILE_MUTATION,
  UPDATE_SUBMISSIONFILE_MUTATION,
  SUBMISION_INFO,
  CASE_LIST,
} from '../graphql/queries'

const NewSubmissionSchema = Yup.object().shape({
  proof: Yup.string()
    .url('not a valid url')
    .required('required'),
  explanation: Yup.string().required('required'),
  supporting_evidence: Yup.string().required('required'),
  supporting_file: Yup.string().matches(/.+((.png)|(.jpg)|(.svg)|(.gif))/, {
    message: 'image files only',
    excludeEmptyString: true,
  }),
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
  const [newSubmissionFile, newSubmissionFileResult] = useMutation(NEW_SUBMISSIONFILE_MUTATION)
  const [updateSubmissionFile, updateSubmissionFileResult] = useMutation(
    UPDATE_SUBMISSIONFILE_MUTATION,
  )
  const [{ fileData, fileLoading, fileError }, newSubmissionFileUpload] = useAxios(
    {
      // url: 'http://localhost:8081/upload',
      url:
        process.env.NODE_ENV === 'production'
          ? `${process.env.FILE_API_ENDPOINT}/upload`
          : `http://localhost:8080/upload`,
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${cookie.load('saigar:id_token')}`,
      },
    },
    { manual: true },
  )
  const fileRef = React.createRef()

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
                  supporting_file: '',
                  supporting_fileRef: fileRef,
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
                  }).then(result => {
                    if (values.supporting_file) {
                      newSubmissionFile({
                        variables: {
                          submission_id: result.data.insert_submission.returning[0].uuid,
                        },
                      }).then(addFileResult => {
                        let formData = new FormData()
                        formData.append(
                          'uuid',
                          addFileResult.data.insert_submission_file.returning[0].uuid,
                        )
                        formData.append('file', values.supporting_fileRef.current.files[0])
                        newSubmissionFileUpload({
                          data: formData,
                        }).then(fileUploadResult => {
                          updateSubmissionFile({
                            variables: {
                              file_id: addFileResult.data.insert_submission_file.returning[0].uuid,
                              url: fileUploadResult.data.Url,
                              expiry: fileUploadResult.data.Expiry,
                            },
                          }).then(() => closeSlider())
                        })
                      })
                    } else {
                      closeSlider()
                    }
                  })
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
