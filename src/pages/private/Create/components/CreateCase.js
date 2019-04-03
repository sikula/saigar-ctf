import React from 'react'
import { Mutation } from 'react-apollo'
import { Formik } from 'formik'

//  Styles
import { Icon } from '@blueprintjs/core'
import { IconNames } from '@blueprintjs/icons'

// Custom custom component
import { SlidingPane } from '../../../../shared/components/SlidingPane'
import { CASES_QUERY, CREATE_CASE_MUTATION } from '../graphql/graphQueries'
import CreateCaseForm from './CreateCase-form'


const CreateCase = ({ isOpen, onRequestClose, ...otherProps }) => (
  <SlidingPane
    isOpen={isOpen}
    onRequestClose={onRequestClose}
    closeIcon={<Icon icon={IconNames.MENU_CLOSED} iconSize={20} />}
    width="375px"
  >
    <SlidingPane.Header>
      <SlidingPane.Header.Title title="Create a Case" subtitle="Fill out the form" />
      <SlidingPane.Header.Actions onActionClick={onRequestClose}>
        <a>Cancel</a>
      </SlidingPane.Header.Actions>
    </SlidingPane.Header>

    <SlidingPane.Content>
      <Mutation mutation={CREATE_CASE_MUTATION} refetchQueries={[{ query: CASES_QUERY }]}>
        {insert_event_case => (
          <Formik
            initialValues={{
              eventID: undefined,
              name: undefined,
              missing_since: '',
              missing_from: '',
              dob: '',
              age: null,
              height: '',
              weight: '',
              characteristics: '',
              disappearance_details: '',
              other_notes: '',
            }}
            onSubmit={values => {
              const { eventID, ...rest } = values
              insert_event_case({
                variables: {
                  eventID,
                  caseData: rest,
                },
              })
            }}
            render={formikProps => <CreateCaseForm {...formikProps} />}
          />
        )}
      </Mutation>
    </SlidingPane.Content>
    <SlidingPane.Actions form="createCaseForm">CREATE CASE</SlidingPane.Actions>
  </SlidingPane>
)

export default CreateCase
