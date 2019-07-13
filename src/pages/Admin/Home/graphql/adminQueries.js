import gql from 'graphql-tag'

const HOME_QUERY = gql`
  query homeInfo {
    event(order_by: { start_time: desc }, limit: 1) {
      name
      start_time
    }
  }
`

const SUBMISSION_FILTERS = gql`
  query filters {
    event(order_by: { start_time: desc }, limit: 1) {
      eventCasesByeventId {
        case {
          uuid
          name
        }
      }
      team_events {
        team {
          uuid
          name
        }
      }
    }
  }
`

const SUBMISSION_HISTORY = gql`
  subscription submissionHistory($team: uuid, $case: uuid, $category: uuid, $status: [String]) {
    event(order_by: { start_time: desc }, limit: 1) {
      submissions(
        where: {
          processed: { _in: $status }
          case_id: { _eq: $case }
          team_id: { _eq: $team }
          config_id: { _eq: $category }
        }
        order_by: { processed_at: desc }
      ) {
        uuid
        processed
        content
        explanation
        case {
          name
        }
        submissionConfigurationByconfigId {
          uuid
          category
        }
        teamByteamId {
          name
        }
      }
    }
  }
`

const LIVE_FEED = gql`
  subscription liveFeed($teams: [uuid]) {
    event(order_by: { start_time: desc }, limit: 1) {
      submissions(where: { processed: { _eq: "PENDING" } }, limit: 25) {
        uuid
        processed
        content
        explanation
        case {
          uuid
          name
        }
        submissionConfigurationByconfigId {
          uuid
          category
        }
        teamByteamId {
          name
        }
      }
    }
  }
`

const LIVE_FEED_FILTERED = gql`
  subscription liveFeedFilter($teams: [uuid]) {
    event(order_by: { start_time: desc }, limit: 1) {
      submissions(where: { processed: { _eq: "PENDING" }, team_id: { _in: $teams } }, limit: 25) {
        uuid
        processed
        content
        explanation
        case {
          uuid
          name
        }
        submissionConfigurationByconfigId {
          uuid
          category
        }
        teamByteamId {
          name
        }
      }
    }
  }
`

const URL_SEEN_COUNT = gql`
  query urlSeenCount($url: String!) {
    urlCount: submission_aggregate(where: { content: { _eq: $url } }) {
      aggregate {
        count
      }
    }
  }
`

/*
  Note(peter):
    Hasura currently doesn't allow you to insert into relations in one
    query (e.g. update submission, insert submission history), so we 
    need to fire off 2 hasura calls: first to update the submission; second
    to insert into the submission_history table
*/
const INSERT_SUBMISSION_HISTORY = gql`
  mutation insertSubmissionHistory(
    $submissionID: uuid!
    $decision: String!
    $processedBy: String!
    $rejectedReason: String
  ) {
    insertSubmissionHistory: insert_submission_history(
      objects: {
        submission_id: $submissionID
        decision: $decision
        processed_by: $processedBy
        rejected_reason: $rejectedReason
      }
    ) {
      affected_rows
    }
  }
`

const PROCESS_SUBMISSION = gql`
  mutation approveSubmission(
    $submissionID: uuid!
    $value: String!
    $processedAt: timestamptz!
    $category: uuid!
  ) {
    updateSubmission: update_submission(
      _set: { processed: $value, processed_at: $processedAt, config_id: $category }
      where: { uuid: { _eq: $submissionID } }
    ) {
      affected_rows
    }
  }
`

const GET_TEAMS = gql`
  query getTeams($eventId: uuid!) {
    team_event(
      order_by: { event: { start_time: desc }, team: { name: asc } }
      where: { event_id: { _eq: $eventId } }
    ) {
      team(order_by: { name: asc }) {
        uuid
        name
        submissionByTeamAggregate: submissionsByteamId_aggregate(
          where: { processed: { _eq: "PENDING" } }
        ) {
          aggregate {
            count
          }
        }
      }
    }
  }
`

export {
  HOME_QUERY,
  SUBMISSION_FILTERS,
  SUBMISSION_HISTORY,
  INSERT_SUBMISSION_HISTORY,
  LIVE_FEED,
  LIVE_FEED_FILTERED,
  URL_SEEN_COUNT,
  PROCESS_SUBMISSION,
  GET_TEAMS,
}
