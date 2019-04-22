/* eslint-disable no-unused-vars */
/* eslint-disable jsx-a11y/anchor-is-valid */
import React from 'react'
import PropTypes from 'prop-types'
// import { Mutation } from 'react-apollo'

import CsvParse from '@vtex/react-csv-parse'

// Styles
import { Icon } from '@blueprintjs/core'
import { IconNames } from '@blueprintjs/icons'

// Custom Components
import { SlidingPanelConsumer, SlidingPane } from '../../../../../../shared/components/SlidingPane'

class UploadUser extends React.Component {
  state = {
    data: null,
  }

  render() {
    const { isOpen, onRequestClose } = this.props

    return (
      <SlidingPane
        isOpen={isOpen}
        onRequestClose={onRequestClose}
        closeIcon={<Icon icon={IconNames.MENU_CLOSED} iconSize={20} />}
      >
        <SlidingPane.Header>
          <SlidingPane.Header.Title title="Upload Users" subtitle="Fill out the form and save" />
          <SlidingPane.Header.Actions onActionClick={onRequestClose}>
            <a>Cancel</a>
          </SlidingPane.Header.Actions>
        </SlidingPane.Header>

        <SlidingPane.Content>
          <SlidingPanelConsumer>
            {({ closeSlider }) => (
              <CsvParse
                keys={[
                  'Team Name',
                  'Attendee ID',
                  'Number of Registered Members',
                  'Team Member Last Name',
                  'Team Member First Name',
                  'Ticket Type',
                  'Joined Date',
                  'Team Member Email',
                  'Currency',
                  'Team Captain Last Name',
                  'Team Captain First Name',
                  'Team Captain Email',
                  'Password',
                  'Created Date',
                  'Preferred Start Time',
                ]}
                onDataUploaded={data => this.setState({ data })}
                // eslint-disable-next-line no-console
                onError={error => console.log(error)}
                render={onChange => <input type="file" onChange={onChange} />}
              />
            )}
          </SlidingPanelConsumer>
          {JSON.stringify(this.state)}
        </SlidingPane.Content>

        <div>
          <SlidingPane.Actions
            form="uploadUserForm"
            // eslint-disable-next-line no-console
            onClick={() => console.log('HELLO THER WORLDDDDDDD')}
          >
            SAVE
          </SlidingPane.Actions>
        </div>
      </SlidingPane>
    )
  }
}

UploadUser.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onRequestClose: PropTypes.func.isRequired,
  // eslint-disable-next-line react/require-default-props
  //   otherProps: PropTypes.objectOf(PropTypes.object),
}

export default UploadUser

// mutation {
//     insert_user_team(objects:{
//       user:{
//         data:{
//           auth0id:"test"
//           nickname:"saigarrrrrr"
//           email:"test@test.com"
//           avatar:"hello"
//         }
//       }
//       team:{
//         data:{
//           name:"SaigarTeamTest"
//         }
//       }
//     }) {
//       affected_rows
//     }
//   }

// mutation {
//     insert_team_event(objects:{
//       event:{
//         data:{
//           event_id
//         }
//       }
//       team:{
//         data:{
//           user_team:{
//             data:{
//               user:{
//                 data:{

//                 }
//               }
//               team:{
//                 data:{

//                 }
//               }
//             }
//           }
//         }
//       }
//     })
//   }
