/* eslint-disable no-return-assign */
import React from 'react'
import PropTypes from 'prop-types'
import { Mutation } from 'react-apollo'

// Styles
import { Icon, Button, Toaster, Position } from '@blueprintjs/core'
import { IconNames } from '@blueprintjs/icons'

// Custom imports
import { PROCESS_SUBMISSION } from '../../graphql/adminQueries'
import { PanelConsumer } from '../../../../../shared/components/Panel'

const FeedToaster = Toaster.create({
  classname: 'feed-toaster',
  position: Position.TOP_LEFT,
})

const ShareButton = class extends React.PureComponent {
  copySubmissionUrl = e => {
    this.textArea.select()
    document.execCommand('copy')
    e.target.focus()

    FeedToaster.show({ message: 'Shareable link copied successfully!' })
  }

  render() {
    const { uuid } = this.props
    return (
      <React.Fragment>
        <Button onClick={this.copySubmissionUrl}>Share</Button>
        <textarea
          ref={textArea => (this.textArea = textArea)}
          readOnly
          value={`https://localhost:8084/submission/${uuid}`}
          style={{ position: 'absolute', zIndex: '-1', height: 0, opacity: '0.01' }}
        />
      </React.Fragment>
    )
  }
}
ShareButton.propTypes = {
  uuid: PropTypes.string.isRequired,
}

/* 
  TODO(Peter):
    We might want to change the panels to portals so they render in a different spot, which 
    makes it easier to work with and may negate some of the re-rendering bugs that might pop up
*/

const FeedPanel = ({ uuid, teamByteamId, explanation, content }) => (
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
            {updateSubmission => (
              <Button
                text="Approve"
                intent="success"
                large
                fill
                style={{ marginRight: 10, marginLeft: 10 }}
                onClick={() =>
                  updateSubmission({
                    variables: {
                      submissionID: uuid,
                      value: 'ACCEPTED',
                      processedAt: new Date(),
                    },
                  }).then(() => hidePanel())
                }
              />
            )}
          </Mutation>
          <Mutation mutation={PROCESS_SUBMISSION}>
            {updateSubmission => (
              <Button
                text="Reject"
                intent="danger"
                large
                fill
                style={{ marginRight: 10, marginLeft: 10 }}
                onClick={() =>
                  updateSubmission({
                    variables: {
                      submissionID: uuid,
                      value: 'REJECTED',
                      processedAt: new Date(),
                    },
                  }).then(() => hidePanel())
                }
              />
            )}
          </Mutation>
        </div>
        <div style={{ padding: 10 }}>
          <strong>Team Name:</strong>
          <span>{teamByteamId.name}</span>
        </div>
        <div style={{ padding: 10 }}>
          <strong>Submission</strong>
          <div>{content}</div>
        </div>
        <div style={{ padding: 10 }}>
          <strong>Explanation</strong>
          <div>{explanation}</div>
          <ShareButton uuid={uuid} />
        </div>
      </div>
    )}
  </PanelConsumer>
)

FeedPanel.propTypes = {
  uuid: PropTypes.string.isRequired,
  teamByteamId: PropTypes.objectOf(PropTypes.object).isRequired,
  explanation: PropTypes.string.isRequired,
  content: PropTypes.string.isRequired,
}

export default FeedPanel
