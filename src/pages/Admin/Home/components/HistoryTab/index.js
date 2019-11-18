import React, { useState, useRef } from 'react'
import PropTypes from 'prop-types'
import { useMutation } from '@apollo/react-hooks'
import { Query, Mutation, Subscription } from 'react-apollo'

import gql from 'graphql-tag'
import createPersistedState from 'use-persisted-state'
import { formatDistanceToNow } from 'date-fns'

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

import ReactPaginate from 'react-paginate'

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

import './index.scss'

/* TODO(peter): This code is duplicated, should be extracted to a shared component */
const FeedToaster = Toaster.create({
  classname: 'feed-toaster',
  position: Position.TOP_LEFT,
})

const ShareButton = ({ uuid }) => {
  const textAreaRef = useRef()

  const copySubmissionUrl = e => {
    textAreaRef.current.select()
    document.execCommand('copy')
    e.target.focus()

    FeedToaster.show({ message: 'Shareable link copied successfully!' })
  }

  return (
    <React.Fragment>
      <Button
        intent="primary"
        large
        icon={IconNames.CLIPBOARD}
        onClick={copySubmissionUrl}
        style={{ marginRight: 10 }}
      >
        Share
      </Button>
      <textarea
        ref={textAreaRef}
        readOnly
        value={`${window.location.protocol}//${window.location.hostname}/submission/${uuid}`}
        style={{ position: 'absolute', zIndex: '-1', height: 0, opacity: '0.01' }}
      />
    </React.Fragment>
  )
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

const SubmissionItem = props => {
  // Local State
  const [category, setCategory] = useState(props.submission.submissionConfigurationByconfigId.uuid)
  const [rejectedReason, setRejectedReason] = useState()

  // GraphQL Layer
  const [processSubmission] = useMutation(PROCESS_SUBMISSION)
  const [insertSubmissionHist] = useMutation(INSERT_SUBMISSION_HISTORY)

  // Handler Functions
  const handleChange = e => {
    const currentTarget = e.currentTarget.value
    setCategory(currentTarget)
  }

  const handleReasonChange = e => {
    const cv = e.currentTarget.value
    setRejectedReason(cv)
  }

  const clearReasonField = () => {
    setRejectedReason()
  }

  const { submission } = props

  return (
    <Card style={{ marginBottom: 20 }}>
      <div style={{ width: '100%', display: 'inline-flex', alignItems: 'baseline' }}>
        <div style={{ flex: 1 }}>
          <H5>{submission.processed}</H5>
        </div>
        <div style={{ fontWeight: 450, marginRight: 10 }}>
          <span>
            {`Submitted: ${formatDistanceToNow(new Date(submission.submitted_at))} Ago`} /{' '}
          </span>
          <span>{`Processed: ${formatDistanceToNow(new Date(submission.processed_at))} Ago`}</span>
        </div>
        <div style={{ display: 'inline-flex' }}>
          <CategoryList
            currentCategory={category}
            submissionID={submission.uuid}
            handleChange={handleChange}
          />
          <UpdateButton category={category} submissionID={submission.uuid} />
        </div>
      </div>
      <code style={{ background: '#cdcdcd' }}>
        <H5>Source URL</H5>
        <p>{submission.content}</p>
        <H5>Relevance</H5>
        <p style={{ wordWrap: 'break-word' }}>{submission.explanation}</p>
        <H5>Supporting Evidence</H5>
        <p style={{ wordWrap: 'break-word' }}>{submission.supporting_evidence}</p>
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
          <AuthConsumer>
            {({ user }) => (
              <Button
                intent="warning"
                large
                icon={IconNames.STAR}
                style={{ marginRight: 10 }}
                disabled={submission.processed === 'STARRED'}
                onClick={() => {
                  processSubmission({
                    variables: {
                      submissionID: submission.uuid,
                      value: 'STARRED',
                      processedAt: new Date(),
                      category,
                    },
                  })
                  insertSubmissionHist({
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

          <AuthConsumer>
            {({ user }) => (
              <Button
                intent="success"
                large
                icon={IconNames.TICK}
                style={{ marginRight: 10 }}
                disabled={submission.processed === 'ACCEPTED'}
                onClick={() => {
                  processSubmission({
                    variables: {
                      submissionID: submission.uuid,
                      value: 'ACCEPTED',
                      processedAt: new Date(),
                      category,
                    },
                  })
                  insertSubmissionHist({
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
            submission.processed === 'REJECTED' ? '' : 'Reason why the submission is rejected'
          }
          disabled={submission.processed === 'REJECTED'}
          value={rejectedReason}
          onChange={handleReasonChange}
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
                        }).then(clearReasonField)
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

SubmissionItem.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  submission: PropTypes.any.isRequired,
}

const useHistoryFilterState = createPersistedState('historyFilter')

const HistoryTab = () => {
  const [historyFilter, setHistoryFilter] = useHistoryFilterState({
    teams: null,
    cases: null,
    category: null,
    status: ['ACCEPTED', 'REJECTED', 'STARRED'],
  })
  // loadCount tracks how many times the 'Load More' button
  // has been clicked to calculate the offset of data to fetch
  const [pageCount, setPageCount] = useState(0)
  const [pageOffset, setPageOffset] = useState(0)

  // =================================================
  // Handlers
  // =================================================
  const handleSelect = e => {
    setHistoryFilter(prevState => ({
      ...prevState,
      [e.currentTarget.name]: e.currentTarget.value === '' ? null : e.currentTarget.value,
    }))
  }

  const handleStatusSelect = e => {
    setHistoryFilter(prevState => ({
      ...prevState,
      status:
        e.currentTarget.value === ''
          ? ['ACCEPTED', 'REJECTED', 'STARRED']
          : [e.currentTarget.value],
    }))
  }

  const handlePageChange = data => {
    const { selected } = data
    const offset = Math.ceil(selected * 100)
    setPageOffset(offset)
  }

  // =================================================
  // Helpers
  // =================================================
  const calculatePageCount = count => {
    return Math.ceil(count / 100) // 100 submissions per page
  }

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
                <HTMLSelect
                  name="teams"
                  onChange={handleSelect}
                  value={historyFilter.teams}
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
                  onChange={handleSelect}
                  value={historyFilter.cases}
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
                        value={historyFilter.category}
                        onChange={handleSelect}
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
                  onChange={handleStatusSelect}
                  value={historyFilter.status}
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
          team: historyFilter.teams,
          case: historyFilter.cases,
          category: historyFilter.category,
          status: historyFilter.status,
          offset: pageOffset,
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

          setPageCount(calculatePageCount(data.event[0].submissions_aggregate.aggregate.count))

          return data.event[0].submissions.map(submission => (
            <SubmissionItem key={submission.uuid} submission={submission} />
          ))
        }}
      </Subscription>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <ReactPaginate
          previousLabel="previous"
          nextLabel="next"
          breakLabel="..."
          pageCount={pageCount}
          breakClassName="bp3-button"
          pageClassName="bp3-button"
          previousClassName="bp3-button"
          nextClassName="bp3-button"
          marginPagesDisplayed={2}
          pageRangeDisplayed={5}
          containerClassName="pagination bp3-button-group"
          subContainerClassName="bp3-button-group"
          activeClassName="active bp3-intent-primary"
          onPageChange={handlePageChange}
        />
      </div>
    </React.Fragment>
  )
}

export default HistoryTab
