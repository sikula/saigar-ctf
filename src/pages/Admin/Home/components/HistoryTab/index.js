import React from 'react'
import PropTypes from 'prop-types'
import { Query, Mutation, Subscription } from 'react-apollo'

import gql from 'graphql-tag'
import { distanceInWordsToNow } from 'date-fns'

// Styles
import {
  Tabs,
  Tab,
  Card,
  Elevation,
  Tag,
  Button,
  Toaster,
  Position,
  H5,
  HTMLSelect,
  Icon,
  MenuItem,
  TextArea,
} from '@blueprintjs/core'
import { IconNames } from '@blueprintjs/icons'

// Custom Components

import { AuthConsumer } from '@shared/components/AuthContext/context'
import { SlidingPanelConsumer, SlidingPane } from '@shared/components/SlidingPane'
import {
  SUBMISSION_HISTORY,
  SUBMISSION_FILTERS,
  INSERT_SUBMISSION_HISTORY,
  PROCESS_SUBMISSION,
} from '../../graphql/adminQueries'

import ProcessingHistory from './ProcessingHistory'

/* TODO(peter): This code is duplicated, should be extracted to a shared component */
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
          icon={IconNames.CLIPBOARD}
          onClick={this.copySubmissionUrl}
          style={{ marginRight: 10 }}
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
/* -- END -- */

/* TODO(peter): This code is duplicated, can also be extracted */
const SUBMISSION_DETAILS = gql`
  query submissionConfig {
    submission_configuration {
      uuid
      category
      points
    }
  }
`

const UPDATE_CATEGORY = gql`
  mutation updateCategory($category: uuid!, $submissionID: uuid!, $auth0id: String!) {
    update_submission(_set: { config_id: $category }, where: { uuid: { _eq: $submissionID } }) {
      affected_rows
    }
    insert_submission_history(
      objects: {
        submission_id: $submissionID
        configuration: $category
        processed_by: $auth0id
        decision: "UPDATED_POINTS"
      }
    ) {
      affected_rows
    }
  }
`

const CategoryList = ({ currentCategory, handleChange }) => (
  <Query query={SUBMISSION_DETAILS} fetchPolicy="cache-first">
    {({ error, loading, data }) => {
      if (loading) return null
      if (error) return <div>{`${error.message}`}</div>

      return (
        <HTMLSelect name="category" value={currentCategory} onChange={handleChange} large fill>
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

/*
  NOTE(Peter):
    This is duplicated in ProcessHistory, should eventually extract this out to a shared folder
    in case queires change, we have one source of truth
*/
const SUBMISSION_HISTORY_2 = gql`
  query submissionHistory($submissionID: uuid!) {
    submission(where: { uuid: { _eq: $submissionID } }) {
      submissionConfigurationByconfigId {
        category
        points
      }
      history(order_by: { processed_at: desc }) {
        decision
        processed_at
        processedByUser {
          role
          username
        }
        rejected_reason
        submission_configuration {
          category
          points
        }
      }
    }
  }
`

const UpdateButton = ({ category, submissionID }) => (
  <AuthConsumer>
    {({ user }) => (
      <Mutation
        mutation={UPDATE_CATEGORY}
        variables={{ category, submissionID, auth0id: user.id }}
        refetchQueries={[{ query: SUBMISSION_HISTORY_2, variables: { submissionID } }]}
      >
        {updateCategory => (
          <Button large style={{ marginLeft: 10, marginRight: 10 }} onClick={updateCategory}>
            Update
          </Button>
        )}
      </Mutation>
    )}
  </AuthConsumer>
)
/* -- END -- */

const HistoryButton = ({ uuid }) => (
  <SlidingPanelConsumer>
    {({ openSlider }) => (
      <Button
        large
        icon={IconNames.HISTORY}
        style={{ marginRight: 10 }}
        onClick={() => openSlider(ProcessingHistory, { submissionID: uuid })}
      >
        History
      </Button>
    )}
  </SlidingPanelConsumer>
)

class SubmissionItem extends React.Component {
  state = {
    // eslint-disable-next-line react/destructuring-assignment
    category: this.props.submission.submissionConfigurationByconfigId.uuid,
    rejectedReason: null,
  }

  handleChange = e => {
    const currentTarget = e.currentTarget.value
    this.setState(prevState => ({
      category: currentTarget,
      swappedCategory: prevState.category !== currentTarget,
    }))
  }

  handleReasonChange = e => {
    this.setState({ rejectedReason: e.currentTarget.value })
  }

  clearReasonField = () => {
    this.setState({ rejectedReason: null })
  }

  render() {
    const { submission } = this.props
    const { category, rejectedReason } = this.state

    return (
      <Card style={{ marginBottom: 20 }}>
        <div style={{ width: '100%', display: 'inline-flex', alignItems: 'baseline' }}>
          <div style={{ flex: 1 }}>
            <H5>{submission.processed}</H5>
          </div>
          <div style={{ fontWeight: 450, marginRight: 10 }}>
          <span>{`Submitted: ${distanceInWordsToNow(new Date(submission.submitted_at))} Ago`} / </span>
            <span>{`Processed: ${distanceInWordsToNow(new Date(submission.processed_at))} Ago`}</span>
          </div>
          <div style={{ display: 'inline-flex' }}>
            <CategoryList
              currentCategory={category}
              submissionID={submission.uuid}
              handleChange={this.handleChange}
            />
            <UpdateButton category={category} submissionID={submission.uuid} />
          </div>
        </div>
        <code style={{ background: '#cdcdcd' }}>
          <p>{submission.content}</p>
          <p style={{ wordWrap: 'break-word' }}>{submission.explanation}</p>
        </code>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Tag large style={{ marginRight: 10 }}>
              <strong>Team: </strong>
              {submission.teamByteamId.name}
            </Tag>
            <Tag large style={{ marginRight: 10 }}>
              <strong>Case: </strong>
              {submission.case.name}
            </Tag>
            <Tag large>
              <strong>Category: </strong>
              {submission.submissionConfigurationByconfigId.category}
            </Tag>
          </div>
          <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end' }}>
            <HistoryButton uuid={submission.uuid} />
            <ShareButton uuid={submission.uuid} />
            <Mutation mutation={PROCESS_SUBMISSION}>
              {updateSubmission => (
                <Mutation mutation={INSERT_SUBMISSION_HISTORY}>
                  {insertSubmissionHistory => (
                    <AuthConsumer>
                      {({ user }) => (
                        <Button
                          intent="warning"
                          large
                          icon={IconNames.STAR}
                          style={{ marginRight: 10 }}
                          disabled={submission.processed === "STARRED"}
                          onClick={() => {
                            updateSubmission({
                              variables: {
                                submissionID: submission.uuid,
                                value: 'STARRED',
                                processedAt: new Date(),
                                category,
                              },
                            })
                            insertSubmissionHistory({
                              variables: {
                                submissionID: submission.uuid,
                                decision: 'STARRED',
                                processedBy: user.id,
                              },
                            })
                          }}
                        >
                          Star
                        </Button>
                      )}
                    </AuthConsumer>
                  )}
                </Mutation>
              )}
            </Mutation>
            <Mutation mutation={PROCESS_SUBMISSION}>
              {updateSubmission => (
                <Mutation mutation={INSERT_SUBMISSION_HISTORY}>
                  {insertSubmissionHistory => (
                    <AuthConsumer>
                      {({ user }) => (
                        <Button
                          intent="success"
                          large
                          icon={IconNames.TICK}
                          style={{ marginRight: 10 }}
                          disabled={submission.processed === 'ACCEPTED'}
                          onClick={() => {
                            updateSubmission({
                              variables: {
                                submissionID: submission.uuid,
                                value: 'ACCEPTED',
                                processedAt: new Date(),
                                category,
                              },
                            })
                            insertSubmissionHistory({
                              variables: {
                                submissionID: submission.uuid,
                                decision: 'ACCEPTED',
                                processedBy: user.id,
                              },
                            })
                          }}
                        >
                          Approve
                        </Button>
                      )}
                    </AuthConsumer>
                  )}
                </Mutation>
              )}
            </Mutation>
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'end',
            marginTop: 10,
            marginRight: 10,
          }}
        >
          <TextArea
            fill
            placeHolder={
              submission.processed === 'REJECTED' ? '' : 'reason why the submission is rejected'
            }
            disabled={submission.processed === 'REJECTED'}
            value={rejectedReason}
            onChange={this.handleReasonChange}
          />
          <Mutation mutation={PROCESS_SUBMISSION}>
            {updateSubmission => (
              <Mutation mutation={INSERT_SUBMISSION_HISTORY}>
                {insertSubmissionHistory => (
                  <AuthConsumer>
                    {({ user }) => (
                      <Button
                        intent="danger"
                        large
                        icon={IconNames.CROSS}
                        style={{ marginTop: 10 }}
                        disabled={!rejectedReason}
                        onClick={() => {
                          updateSubmission({
                            variables: {
                              submissionID: submission.uuid,
                              value: 'REJECTED',
                              processedAt: new Date(),
                              category,
                            },
                          })
                          insertSubmissionHistory({
                            variables: {
                              submissionID: submission.uuid,
                              decision: 'REJECTED',
                              processedBy: user.id,
                              rejectedReason,
                            },
                          }).then(() => this.clearReasonField())
                        }}
                      >
                        Reject
                      </Button>
                    )}
                  </AuthConsumer>
                )}
              </Mutation>
            )}
          </Mutation>
        </div>
      </Card>
    )
  }
}

SubmissionItem.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  submission: PropTypes.any.isRequired,
}

export default class HistoryTab extends React.Component {
  state = { teams: null, cases: null, category: null, status: ['ACCEPTED', 'REJECTED', 'STARRED'] }

  handleSelect = e => {
    this.setState({
      [e.currentTarget.name]: e.currentTarget.value === '' ? null : e.currentTarget.value,
    })
  }

  handleStatusSelect = e => {
    this.setState({
      status:
        e.currentTarget.value === ''
          ? ['ACCEPTED', 'REJECTED', 'STARRED']
          : [e.currentTarget.value],
    })
  }

  render() {
    return (
      <React.Fragment>
        <Query query={SUBMISSION_FILTERS}>
          {({ data, loading, error }) => {
            if (loading) return null
            if (error) return null

            if (!Array.isArray(data.event) || !data.event.length) {
              return <div> No Events Created Yet </div>
            }

            return (
              <div style={{ display: 'inline-flex', width: '100%', marginBottom: '20px' }}>
                <div style={{ width: '100%', marginRight: '20px' }}>
                  {/* <MultiSelect
                    itemPredicate={(query, team, _index, exactMatch) => {
                      const normalizedTeams = team.name.toLowerCase()
                      const normalizedQuery = query.toLowerCase()

                      if (exactMatch) {
                        return normalizedTeams === normalizedQuery
                      } else {
                        return `${team.name}`.indexOf(normalizedQuery) >= 0;
                      }
                    }}
                    itemRenderer={(team, { handleClick, modifiers, query }) => {
                      if (!modifiers.matchesPredicate) {
                        return null
                      }
                      const text = `${team.name}`
                      return (
                        <MenuItem active={modifiers.active} disabled={modifiers.disabled} label={team.name.toString()} key={team.uuid} onClick={() => console.log("HELLO WORLD")} text={text} />
                      )
                    }}
                    tagRenderer={team => team.name}
                    items={[
                      {
                        uuid: "1",
                        name: "Yo"
                      },
                      {
                        uuid: '2',
                        name: "Sherlock"
                      }
                    ]}
                    tagInputProps={{ large: true }}
                  /> */}
                  <HTMLSelect
                    name="teams"
                    onChange={this.handleSelect}
                    value={this.state.teams}
                    fill
                    large
                  >
                    <option value="">All Teams</option>
                    {data.event[0].team_events.map(({ team }) => (
                      <option key={team.uuid} value={team.uuid}>
                        {team.name}
                      </option>
                    ))}
                  </HTMLSelect>
                </div>
                <div style={{ width: '100%', marginRight: '20px' }}>
                  <HTMLSelect
                    name="cases"
                    onChange={this.handleSelect}
                    value={this.state.cases}
                    label="Filter Cases"
                    fill
                    large
                  >
                    <option value="">All Cases</option>
                    {data.event[0].eventCasesByeventId.map(({ case: _case }) => (
                      <option key={_case.uuid} value={_case.uuid}>
                        {_case.name}
                      </option>
                    ))}
                  </HTMLSelect>
                </div>
                <div style={{ width: '100%', marginRight: '20px' }}>
                  <Query query={SUBMISSION_DETAILS} fetchPolicy="cache-first">
                    {({ error, loading, data }) => {
                      if (loading) return null
                      if (error) return <div>{`${error.message}`}</div>

                      return (
                        <HTMLSelect
                          name="category"
                          value={this.state.category}
                          onChange={this.handleSelect}
                          label="Filter Category"
                          fill
                          large
                        >
                          <option value="">Any Category</option>
                          {data.submission_configuration.map(config => (
                            <option key={config.uuid} id={config.category} value={config.uuid}>{`${
                              config.category
                            } (${config.points} pts.)`}</option>
                          ))}
                        </HTMLSelect>
                      )
                    }}
                  </Query>
                </div>
                <div style={{ width: '100%' }}>
                  <HTMLSelect
                    name="status"
                    onChange={this.handleStatusSelect}
                    value={this.state.status}
                    label="Filter Status"
                    fill
                    large
                  >
                    <option value="">Any Status</option>
                    <option value="STARRED">Starred</option>
                    <option value="ACCEPTED">Accepted</option>
                    <option value="REJECTED">Rejected</option>
                  </HTMLSelect>
                </div>
              </div>
            )
          }}
        </Query>
        <Subscription
          subscription={SUBMISSION_HISTORY}
          variables={{
            team: this.state.teams,
            case: this.state.cases,
            category: this.state.category,
            status: this.state.status,
          }}
        >
          {({ data, loading, error }) => {
            if (loading) return <div> Loading... </div>
            if (error) return <div>Error: `${error.message}`</div>

            if (!Array.isArray(data.event) || !data.event.length) {
              return (
                <H5 style={{ textAlign: 'center' }}>
                  There is currently no history, items will appear once submissions have been
                  processed
                </H5>
              )
            }

            return data.event[0].submissions.map(submission => (
              <SubmissionItem key={submission.uuid} submission={submission} />
            ))
          }}
        </Subscription>
      </React.Fragment>
    )
  }
}
