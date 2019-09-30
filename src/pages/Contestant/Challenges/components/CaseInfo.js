/* eslint-disable react/require-default-props, react/forbid-prop-types */
import React from 'react'
import PropTypes from 'prop-types'

// Styles
import { Icon } from '@blueprintjs/core'
import { IconNames } from '@blueprintjs/icons'

// Custom Components
import CaseInfoData from '@features/CaseInfo/components'
import { SlidingPane } from '../../../../shared/components/SlidingPane'

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
      <CaseInfoData caseID={otherProps.caseID} />
    </SlidingPane.Content>
  </SlidingPane>
)

CaseInfo.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onRequestClose: PropTypes.func.isRequired,
  otherProps: PropTypes.any,
}

export default CaseInfo
