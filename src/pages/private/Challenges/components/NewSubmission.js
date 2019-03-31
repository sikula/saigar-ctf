import React from 'react'
import { Query, Mutation } from 'react-apollo'
import { Formik } from 'formik'
import { isWithinRange } from 'date-fns'
import { adopt } from 'react-adopt'

// Styles
import { Icon } from '@blueprintjs/core'
import { IconNames } from '@blueprintjs/icons'

// Custom Components
import { SlidingPane } from '../../../../_Common/components/SlidingPane'
import NewSubmissionForm from './NewSubmission-form'
import { NEW_SUBMISSION_MUTATION, SUBMISSION_CONFIGURATION } from '../graphql/queries'

// const NewSubmissionContainer = adopt({
//   event: <Query query={SUBMISSION_CONFIGURATION} />,
//   newSubmission: ({ render }) => (
//     <Mutation mutation={NEW_SUBMISSION_MUTATION}>
//       {(mutation, result) => render({ mutation, result })}
//     </Mutation>
//   ),
// })

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
      <Mutation mutation={NEW_SUBMISSION_MUTATION}>
        {insert_submission => (
          <Formik
            initialValues={{
              category: '',
              proof: '',
              explanation: '',
            }}
            onSubmit={values =>
              insert_submission({
                variables: {
                  category: values.category,
                  content: values.proof,
                  explanation: values.explanation,
                },
              })
            }
            render={formikProps => <NewSubmissionForm {...formikProps} />}
          />
        )}
      </Mutation>
    </SlidingPane.Content>

    <SlidingPane.Actions form="newSubmissionForm">SUBMIT</SlidingPane.Actions>
  </SlidingPane>
)

export default NewSubmission
