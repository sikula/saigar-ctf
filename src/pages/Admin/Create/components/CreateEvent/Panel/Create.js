import React from 'react'
import PropTypes from 'prop-types'
import { Mutation } from 'react-apollo'
import { Formik } from 'formik'

import { Icon } from '@blueprintjs/core'
import { IconNames } from '@blueprintjs/icons'

import { SlidingPanelConsumer, SlidingPane } from '../../../../../../shared/components/SlidingPane'
import { EVENTS_QUERY, CREATE_EVENT_MUTATION } from '../../../graphql/graphQueries'
import CreateEventForm from './Form'

const CreateEvent = ({ isOpen, onRequestClose }) => (
  <SlidingPane
    isOpen={isOpen}
    onRequestClose={onRequestClose}
    closeIcon={<Icon icon={IconNames.MENU_CLOSED} iconSize={20} />}
  >
    <SlidingPane.Header>
      <SlidingPane.Header.Title title="Add an Event" subtitle="Fill out the form and save" />
      <SlidingPane.Header.Actions onActionClick={onRequestClose}>
        <a>Cancel</a>
      </SlidingPane.Header.Actions>
    </SlidingPane.Header>

    <SlidingPane.Content>
      <SlidingPanelConsumer>
        {({ closeSlider }) => (
          <Mutation
            mutation={CREATE_EVENT_MUTATION}
            refetchQueries={[{ query: EVENTS_QUERY }]}
            onCompleted={() => closeSlider()}
          >
            {insertEvent => (
              <Formik
                initialValues={{
                  event_name: '',
                  start_time: '',
                  end_time: '',
                }}
                onSubmit={values => {
                  const { event_name: eventName, ...rest } = values
                  insertEvent({
                    variables: {
                      input: { name: eventName, ...rest },
                    },
                  })
                }}
                render={formikProps => <CreateEventForm {...formikProps} />}
              />
            )}
          </Mutation>
        )}
      </SlidingPanelConsumer>
    </SlidingPane.Content>
    <SlidingPane.Actions form="createEventForm">SAVE</SlidingPane.Actions>
  </SlidingPane>
)

CreateEvent.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onRequestClose: PropTypes.func.isRequired,
}

export default CreateEvent
