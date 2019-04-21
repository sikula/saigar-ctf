/* eslint-disable jsx-a11y/anchor-is-valid */
import React from 'react'
import PropTypes from 'prop-types'
import { Mutation } from 'react-apollo'
import { Formik } from 'formik'

// Styles
import { Icon } from '@blueprintjs/core'
import { IconNames } from '@blueprintjs/icons'

// Custom Components
import { SlidingPanelConsumer, SlidingPane } from '../../../../../../shared/components/SlidingPane'
import { EDIT_EVENT_MUTATION, EVENTS_QUERY } from '../../../graphql/graphQueries'
import EditEventForm from './Form'

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
      <SlidingPanelConsumer>
        {({ closeSlider }) => (
          <Mutation
            mutation={EDIT_EVENT_MUTATION}
            refetchQueries={[{ query: EVENTS_QUERY }]}
            onCompleted={() => closeSlider()}
          >
            {updateEvent => (
              <Formik
                initialValues={{
                  event_name: otherProps.eventName,
                  start_time: otherProps.startTime,
                  end_time: otherProps.endTime,
                }}
                onSubmit={values => {
                  const { event_name: eventName, ...rest } = values
                  updateEvent({
                    variables: {
                      eventID: otherProps.eventID,
                      input: { name: eventName, ...rest },
                    },
                  })
                }}
                render={formikProps => <EditEventForm {...formikProps} />}
              />
            )}
          </Mutation>
        )}
      </SlidingPanelConsumer>
    </SlidingPane.Content>

    <SlidingPane.Actions form="editEventForm">SAVE</SlidingPane.Actions>
  </SlidingPane>
)

EditEvent.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onRequestClose: PropTypes.func.isRequired,
  // eslint-disable-next-line react/require-default-props
  otherProps: PropTypes.objectOf(PropTypes.object),
}

export default EditEvent
