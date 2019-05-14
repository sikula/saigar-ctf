/* eslint-disable react/require-default-props, react/forbid-prop-types, jsx-a11y/anchor-is-valid */
import React from 'react'
import PropTypes from 'prop-types'
import { Query } from 'react-apollo'
import gql from 'graphql-tag'

// Styles
import { Icon } from '@blueprintjs/core'
import { IconNames } from '@blueprintjs/icons'

// Custom Components
import { SlidingPane, SlidingPanelConsumer } from '../../../../shared/components/SlidingPane'

const CASE_INFO = gql`
  query caseInfo($caseID: uuid!) {
    case(where: { uuid: { _eq: $caseID } }) {
      uuid
      name
      missing_from
      missing_since
      age
      disappearance_details
      other_notes
      characteristics
      source_url
    }
  }
`

const CaseInfo = ({ isOpen, onRequestClose, ...otherProps }) => (
  <SlidingPane
    isOpen={isOpen}
    onRequestClose={onRequestClose}
    closeIcon={<Icon icon={IconNames.MENU_CLOSED} iconSize={20} />}
  >
    <SlidingPane.Header>
      <SlidingPane.Header.Title title="Case Info" subtitle="Details on the case" />
      <SlidingPane.Header.Actions onActionClick={onRequestClose}>
        <a>Cancel</a>
      </SlidingPane.Header.Actions>
    </SlidingPane.Header>

    <SlidingPane.Content>
      <Query query={CASE_INFO} variables={{ caseID: otherProps.caseID }}>
        {({ data, loading, error }) => {
          if (error) return <div>error</div>
          if (loading) return <div>Loading...</div>

          return data.case.map(_case => (
            <React.Fragment>
              <p>
                <strong>Source URL: </strong>
                <a href={_case.source_url}>{_case.source_url}</a>
              </p>
              <p>
                <strong>Name: </strong>
                {_case.name}
              </p>
              <p>
                <strong>Missing From: </strong>
                {_case.missing_from}
              </p>
              <p>
                <strong>Missing Since: </strong>
                {_case.missing_since}
              </p>
              <p>
                <strong>Age: </strong>
                {_case.age}
              </p>
              <p>
                <strong>Disappearance Details: </strong>
                {_case.disappreance_details}
              </p>
              <p>
                <strong>Characteristics: </strong>
                {_case.characteristics}
              </p>
              <p>
                <strong>Other Notes: </strong>
                {_case.other_notes}
              </p>
            </React.Fragment>
          ))
        }}
      </Query>
    </SlidingPane.Content>
  </SlidingPane>
)

CaseInfo.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onRequestClose: PropTypes.func.isRequired,
  otherProps: PropTypes.any,
}

export default CaseInfo
