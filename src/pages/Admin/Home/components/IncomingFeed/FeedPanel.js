/* eslint-disable no-return-assign, react/no-multi-comp */
import React from 'react'
import PropTypes from 'prop-types'

import { Query, Mutation } from 'react-apollo'
import gql from 'graphql-tag'

// Styles
import { Icon, Button, Toaster, Position, HTMLSelect, ButtonGroup } from '@blueprintjs/core'
import { IconNames } from '@blueprintjs/icons'

// Custom imports
import { PROCESS_SUBMISSION } from '../../graphql/adminQueries'
import { PanelConsumer } from '../../../../../shared/components/Panel'

const ActionButtons = () => <ButtonGroup />
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
        <Button
          intent="primary"
          large
          fill
          icon={IconNames.CLIPBOARD}
          onClick={this.copySubmissionUrl}
        >
          Share
        </Button>

        <textarea
          ref={textArea => (this.textArea = textArea)}
          readOnly
          value={`${window.location.protocol}//${window.location.hostname}/submission/${uuid}`}
          style={{ position: 'absolute', zIndex: '-1', height: 0, opacity: '0.01' }}
        />
      </React.Fragment>
    )
  }
}
ShareButton.propTypes = {
  uuid: PropTypes.string.isRequired,
}

const SUBMISSION_DETAILS = gql`
  query submissionConfig {
    submission_configuration {
      uuid
      category
      points
    }
  }
`

const CategoryList = ({ currentCategory, handleChange }) => (
  <Query query={SUBMISSION_DETAILS} fetchPolicy="cache-first">
    {({ error, loading, data }) => {
      if (loading) return null
      if (error) return <div>{`${error.message}`}</div>

      return (
        <HTMLSelect name="category" value={currentCategory} onChange={handleChange} fill large>
          {data.submission_configuration.map(config => (
            <option key={config.uuid} id={config.category} value={config.uuid}>{`${
              config.category
            } (${config.points} pts.)`}</option>
          ))}
        </HTMLSelect>
      )
    }}
  </Query>
)

CategoryList.propTypes = {
  currentCategory: PropTypes.string.isRequired,
  handleChange: PropTypes.func.isRequired,
}

class PanelContent extends React.Component {
  state = {
    // eslint-disable-next-line react/destructuring-assignment
    category: this.props.submissionConfiguration.uuid,
  }

  handleChange = e => {
    this.setState({
      category: e.currentTarget.value,
    })
  }

  render() {
    const { uuid, teamName, explanation, content, hidePanel } = this.props
    const { category } = this.state

    return (
      <React.Fragment>
        <div>
          <CategoryList currentCategory={category} handleChange={this.handleChange} />
        </div>
        <div style={{ padding: 10 }}>
          <strong>Team Name:</strong>
          <span>{teamName}</span>
        </div>
        <div style={{ padding: 10 }}>
          <strong>Submission</strong>
          <div>
            <p style={{ wordWrap: 'break-word' }}>{content}</p>
          </div>
        </div>
        <div style={{ padding: 10 }}>
          <strong>Explanation</strong>
          <div>
            <p style={{ wordWrap: 'break-word' }}>{explanation}</p>
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            marginTop: 10,
            alignItems: 'center',
            marginBottom: '30px',
          }}
        >
          <ButtonGroup fill>
            <ShareButton uuid={uuid} />
            <Mutation mutation={PROCESS_SUBMISSION}>
              {updateSubmission => (
                <Button
                  text="Star"
                  intent="warning"
                  large
                  fill
                  icon={IconNames.STAR}
                  onClick={() =>
                    updateSubmission({
                      variables: {
                        submissionID: uuid,
                        value: 'STARRED',
                        processedAt: new Date(),
                        category,
                      },
                    }).then(() => hidePanel())
                  }
                />
              )}
            </Mutation>
            <Mutation mutation={PROCESS_SUBMISSION}>
              {updateSubmission => (
                <Button
                  text="Approve"
                  intent="success"
                  large
                  fill
                  icon={IconNames.TICK}
                  onClick={() =>
                    updateSubmission({
                      variables: {
                        submissionID: uuid,
                        value: 'ACCEPTED',
                        processedAt: new Date(),
                        category,
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
                  icon={IconNames.CROSS}
                  onClick={() =>
                    updateSubmission({
                      variables: {
                        submissionID: uuid,
                        value: 'REJECTED',
                        processedAt: new Date(),
                        category,
                      },
                    }).then(() => hidePanel())
                  }
                />
              )}
            </Mutation>
          </ButtonGroup>
        </div>
      </React.Fragment>
    )
  }
}

PanelContent.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  submissionConfiguration: PropTypes.any.isRequired,
  uuid: PropTypes.string.isRequired,
  teamName: PropTypes.string.isRequired,
  explanation: PropTypes.string.isRequired,
  content: PropTypes.string.isRequired,
  hidePanel: PropTypes.func.isRequired,
}

/* 
  TODO(Peter):
    We might want to change the panels to portals so they render in a different spot, which 
    makes it easier to work with and may negate some of the re-rendering bugs that might pop up
*/

const FeedPanel = ({
  uuid,
  teamByteamId,
  explanation,
  content,
  submissionConfigurationByconfigId,
}) => (
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
          overflowY: 'auto',
        }}
      >
        <Icon icon={IconNames.CROSS} iconSize={32} onClick={hidePanel} />
        <PanelContent
          uuid={uuid}
          teamName={teamByteamId.name}
          explanation={explanation}
          content={content}
          submissionConfiguration={submissionConfigurationByconfigId}
          hidePanel={hidePanel}
          key={uuid}
        />
      </div>
    )}
  </PanelConsumer>
)

FeedPanel.propTypes = {
  uuid: PropTypes.string.isRequired,
  teamByteamId: PropTypes.objectOf(PropTypes.object).isRequired,
  explanation: PropTypes.string.isRequired,
  content: PropTypes.string.isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  submissionConfigurationByconfigId: PropTypes.any.isRequired,
}

export default FeedPanel
