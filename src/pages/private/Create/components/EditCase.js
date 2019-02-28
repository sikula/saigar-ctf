import React from 'react'
import { Query, Mutation } from 'react-apollo'
import { Formik } from 'formik'
import * as Yup from 'yup'

// Styles
import { Icon, Button } from '@blueprintjs/core'
import { IconNames } from '@blueprintjs/icons'

// Custom Components
import { SlidingPane } from '../../../../_Common/components/SlidingPane'
// import { CASE_INFO, EDIT_CASE } from '../../graphql/graphQueries'

import EditCaseForm from './EditCase-form'

/*
  @TODO(Peter):
    The EditCase form and OpenCase form are essentially the same form, with very slight
    modifications.  They can (and should) be moved into a single component and wrap
    the proper mutation or queries surrounding the form.

  @TODO(Peter):
    Also change the form id to tomething more standard, and push it to the Slider.Actions
    component
*/

const EditCase = ({ isOpen, onRequestClose, ...otherProps }) => (
  <SlidingPane
    isOpen={isOpen}
    onRequestClose={onRequestClose}
    closeIcon={<Icon icon={IconNames.MENU_CLOSED} iconSize={20} />}
  >
    <SlidingPane.Header>
      <SlidingPane.Header.Title title="Edit a Case" subtitle="Fill out the form and save" />
      <SlidingPane.Header.Actions onActionClick={onRequestClose}>
        <a>Cancel</a>
      </SlidingPane.Header.Actions>
    </SlidingPane.Header>

    <SlidingPane.Content>
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
        onSubmit={values => console.log(values)}
        render={formikProps => <EditCaseForm {...formikProps} />}
      />
    </SlidingPane.Content>

    <SlidingPane.Actions form="editCaseForm">SAVE</SlidingPane.Actions>
  </SlidingPane>
)

export default EditCase
