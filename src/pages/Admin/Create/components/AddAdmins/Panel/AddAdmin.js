import React from 'react'

//  Styles
import { HTMLSelect, Input, Icon } from '@blueprintjs/core'
import { IconNames } from '@blueprintjs/icons'

// Custom Components
import { SlidingPanelConsumer, SlidingPane } from '../../../../../../shared/components/SlidingPane'

class UserControl extends React.Component {
    state = { users: [] }

    render() {
        return (
            <div>
                <HTMLSelect fill large>
                    <option value="judge">Judge</option>
                    <option value="admin">Admin</option>
                </HTMLSelect>
            </div>
        )
    }
}

const AddAdmin = ({ isOpen, onRequestClose }) => (
  <SlidingPane
    isOpen={isOpen}
    onRequestClose={onRequestClose}
    closeIcon={<Icon icon={IconNames.MENU_CLOSED} iconSize={20} />}
    width="375px"
  >
    <SlidingPane.Header>
      <SlidingPane.Header.Title title="Add an Administrator" subtitle="Fill out the form" />
      <SlidingPane.Header.Actions onActionClick={onRequestClose}>
        <a>Cancel</a>
      </SlidingPane.Header.Actions>
    </SlidingPane.Header>

    <SlidingPane.Content>
      <UserControl />
    </SlidingPane.Content>
    <SlidingPane.Actions form="addAdminForm">ADD USER</SlidingPane.Actions>
  </SlidingPane>
)

export default AddAdmin
