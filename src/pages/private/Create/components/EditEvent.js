import React from 'react'
import { Query, Mutation } from 'react-apollo'
import { Formik } from 'formik'
import * as Yup from 'yup'

// Styles
import { Icon, FormGroup, InputGroup } from '@blueprintjs/core'
import { IconNames } from '@blueprintjs/icons'
import { DateInput } from '@blueprintjs/datetime'

// Custom Components
import { SlidingPane } from '../../../../_Common/components/SlidingPane'
import { EDIT_EVENT_MUTATION, EVENTS_QUERY } from '../graphql/graphQueries'
import EditEventForm from './EditEvent-form'


const EditEvent = ({ isOpen, onRequestClose, ...otherProps }) => (
  <SlidingPane
    isOpen={isOpen}
    onRequestClose={onRequestClose}
    closeIcon={<Icon icon={IconNames.MENU_CLOSED} iconSize={20} />}
  >
    <SlidingPane.Header>
      <SlidingPane.Header.Title title="Edit Event Details" subtitle="Fill out the form and save" />
      <SlidingPane.Header.Actions onActionClick={onRequestClose}>
        <a>Cancel</a>
      </SlidingPane.Header.Actions>
    </SlidingPane.Header>

    <SlidingPane.Content>
      <Mutation mutation={EDIT_EVENT_MUTATION} refetchQueries={[{ query: EVENTS_QUERY }]}>
        {update_event => (
          <Formik
            initialValues={{
              event_name: otherProps.eventName,
              start_time: otherProps.startTime,
              end_time: otherProps.endTime,
            }}
            onSubmit={values => {
              const { event_name, ...rest } = values
              update_event({
                variables: {
                  eventID: otherProps.eventID,
                  input: { name: event_name, ...rest },
                },
              })
            }}
            render={formikProps => <EditEventForm {...formikProps} />}
          />
        )}
      </Mutation>
    </SlidingPane.Content>

    <SlidingPane.Actions form="editEventForm">SAVE</SlidingPane.Actions>
  </SlidingPane>
)

export default EditEvent
