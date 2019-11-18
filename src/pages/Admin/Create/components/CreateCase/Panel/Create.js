/* eslint-disable import/no-named-as-default */
import React from 'react'
import PropTypes from 'prop-types'
import { Mutation } from 'react-apollo'
import { Formik } from 'formik'

//  Styles
import { Icon } from '@blueprintjs/core'
import { IconNames } from '@blueprintjs/icons'

// Custom custom component
import { SlidingPanelConsumer, SlidingPane } from '../../../../../../shared/components/SlidingPane'
import { CASES_QUERY, CREATE_CASE_MUTATION } from '../../../graphql/graphQueries'
import CreateCaseForm from './Form'

const CreateCase = ({ isOpen, onRequestClose }) => (
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
      <SlidingPanelConsumer>
        {({ closeSlider }) => (
          <Mutation
            mutation={CREATE_CASE_MUTATION}
            refetchQueries={[{ query: CASES_QUERY }]}
            onCompleted={() => closeSlider()}
          >
            {insertEventCase => (
              <Formik
                initialValues={{
                  eventID: undefined,
                  name: undefined,
                  source_url: '',
                  missing_since: '',
                  missing_from: '',
                  age: null,
                  height: '',
                  weight: '',
                  characteristics: '',
                  disappearance_details: '',
                  other_notes: '',
                }}
                onSubmit={values => {
                  const { eventID, ...rest } = values
                  insertEventCase({
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
        )}
      </SlidingPanelConsumer>
    </SlidingPane.Content>
    <SlidingPane.Actions form="createCaseForm">CREATE CASE</SlidingPane.Actions>
  </SlidingPane>
)

CreateCase.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onRequestClose: PropTypes.func.isRequired,
}

export default CreateCase
