import React from 'react'
import { Mutation } from 'react-apollo'

// Styles
import { Icon, Button, Toaster, Position } from '@blueprintjs/core'
import { IconNames } from '@blueprintjs/icons'

// Custom imports
import { PROCESS_SUBMISSION } from '../../graphql/adminQueries'
import { PanelConsumer } from '../../../../../_Common/components/Panel'

const FeedToaster = Toaster.create({
  classname: 'feed-toaster',
  position: Position.TOP_LEFT,
})

const ShareButton = class extends React.PureComponent {
  constructor(props) {
    super(props)
  }

  copySubmissionUrl = e => {
    this.textArea.select()
    document.execCommand('copy')
    e.target.focus()

    FeedToaster.show({ message: 'Shareable link copied successfully!' })
  }

  render() {
    return (
      <React.Fragment>
        <Button onClick={this.copySubmissionUrl}>Share</Button>
        <textarea
          ref={textArea => (this.textArea = textArea)}
          readOnly
          value={`https://localhost:8084/submission/${this.props.uuid}`}
          style={{ position: 'absolute', zIndex: '-1', height: 0, opacity: '0.01' }}
        />
      </React.Fragment>
    )
  }
}

/* 
  TODO(Peter):
    We might want to change the panels to portals so they render in a different spot, which 
    makes it easier to work with and may negate some of the re-rendering bugs that might pop up
*/

const FeedPanel = props => (
  <PanelConsumer>
    {({ hidePanel }) => (
      <div
        style={{
          position: 'absolute',
          width: '500px',
          right: '365px',
          background: '#F5F8FA',
          top: 0,
          height: '100%',
          padding: 20,
          zIndex: 9999,
          borderRight: '1px solid #e6dddd',
          boxShadow: '-10px 0px 10px 1px rgba(0, 0, 0,0.08)',
        }}
      >
        <Icon icon={IconNames.CROSS} iconSize={32} onClick={hidePanel} />
        <div style={{ display: 'flex', flexDirection: 'row', marginTop: 10, alignItems: 'center' }}>
          <Mutation mutation={PROCESS_SUBMISSION}>
            {update_submission => (
              <Button
                text="Approve"
                intent="success"
                large
                fill
                style={{ marginRight: 10, marginLeft: 10 }}
                onClick={() =>
                  update_submission({
                    variables: {
                      submissionID: props.uuid,
                      value: 'ACCEPTED',
                    },
                  }).then(_ => hidePanel())
                }
              />
            )}
          </Mutation>
          <Mutation mutation={PROCESS_SUBMISSION}>
            {update_submission => (
              <Button
                text="Reject"
                intent="danger"
                large
                fill
                style={{ marginRight: 10, marginLeft: 10 }}
                onClick={() =>
                  update_submission({
                    variables: {
                      submissionID: props.uuid,
                      value: 'REJECTED',
                    },
                  }).then(_ => hidePanel())
                }
              />
            )}
          </Mutation>
        </div>
        <div style={{ padding: 10 }}>
          <strong>Team Name:</strong>
          <span>{props.teamByteamId.name}</span>
        </div>
        <div style={{ padding: 10 }}>
          <strong>Submission</strong>
          <div>{props.content}</div>
        </div>
        <div style={{ padding: 10 }}>
          <strong>Explanation</strong>
          <div>{props.explanation}</div>
          <ShareButton uuid={props.uuid} />
        </div>
      </div>
    )}
  </PanelConsumer>
)

// FeedPanel.propTypes = {
//     content: PropTypes.string.isRequired
// }

export default FeedPanel
