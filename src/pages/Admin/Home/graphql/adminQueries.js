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
      team_events(order_by: { team: { name: asc } }) {
        team {
          uuid
          name
        }
      }
    }
  }
`

// CTF_ADMIN/JUDGES
const SUBMISSION_HISTORY = gql`
  subscription submissionHistory(
    $team: uuid
    $case: uuid
    $category: uuid
    $status: [String!]
    $url: String
    $offset: Int
  ) {
    event(order_by: { start_time: desc }, limit: 1) {
      submissions_aggregate(where: { processed: { _neq: "PENDING" } }) {
        aggregate {
          count
        }
      }
      submissions(
        where: {
          processed: { _in: $status }
          case_id: { _eq: $case }
          team_id: { _eq: $team }
          config_id: { _eq: $category }
          content: { _eq: $url }
          submissionConfigurationByconfigId: { category: { _neq: "CLOSED" }}
        }
        order_by: { processed_at: desc }
        limit: 100
        offset: $offset
      ) {
        uuid
        submitted_at
        processed_at
        processed
        content
        explanation
        supporting_evidence
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

const SUBMISSION_HISTORY_SA = gql`
  subscription submissionHistory(
    $team: uuid
    $case: uuid
    $category: uuid
    $status: [String!]
    $url: String
    $offset: Int
  ) {
    event(order_by: { start_time: desc }, limit: 1) {
      submissions_aggregate(where: { processed: { _neq: "PENDING" } }) {
        aggregate {
          count
        }
      }
      submissions(
        where: {
          processed: { _in: $status }
          case_id: { _eq: $case }
          team_id: { _eq: $team }
          config_id: { _eq: $category }
          content: { _eq: $url }
        }
        order_by: { processed_at: desc }
        limit: 100
        offset: $offset
      ) {
        uuid
        submitted_at
        processed_at
        processed
        content
        explanation
        supporting_evidence
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
  subscription liveFeed {
    event(order_by: { start_time: desc }, limit: 1) {
      submissions(where: { 
        processed: { _eq: "PENDING" },
        submissionConfigurationByconfigId: {
          category: { _neq: "CLOSED" }
        }}
        order_by: { submitted_at: asc },
        limit: 50
      ) {
        uuid
        submitted_at
        processed
        content
        explanation
        supporting_evidence
        case {
          uuid
          name
        }
        submissionConfigurationByconfigId {
          uuid
          category
        }
        teamByteamId {
          uuid
          name
          judge_teams_aggregate {
            aggregate {
              count
            }
          }
        }
        submission_files {
          url
        }
      }
    }
  }
`

const LIVE_FEED_FILTERED = gql`
  subscription liveFeedFilter($teams: [uuid!]) {
    event(order_by: { start_time: desc }, limit: 1) {
      submissions(
        where: { 
          processed: { _eq: "PENDING" },
          team_id: { _in: $teams },
          submissionConfigurationByconfigId: {
            category: { _neq: "CLOSED" }
          }}
        order_by: { submitted_at: asc }
      ) {
        uuid
        submitted_at
        processed
        content
        explanation
        supporting_evidence
        case {
          uuid
          name
        }
        submissionConfigurationByconfigId {
          uuid
          category
        }
        teamByteamId {
          uuid
          name
          judge_teams_aggregate {
            aggregate {
              count
            }
          }
        }
        submission_files {
          url
        }
      }
    }
  }
`

const LIVE_FEED_SA = gql`
  subscription liveFeedFilter($teams: [uuid!]) {
    event(order_by: { start_time: desc }, limit: 1) {
      submissions(
        where: { processed: { _eq: "PENDING" }, team_id: { _in: $teams } }
        order_by: { submitted_at: asc },
        limit: 50
      ) {
        uuid
        submitted_at
        processed
        content
        explanation
        supporting_evidence
        case {
          uuid
          name
        }
        submissionConfigurationByconfigId {
          uuid
          category
        }
        teamByteamId {
          uuid
          name
          judge_teams_aggregate {
            aggregate {
              count
            }
          }
        }
        submission_files {
          url
        }
      }
    }
  }
`

const URL_SEEN_COUNT = gql`
  query urlSeenCount($url: String!, $teamID: uuid!) {
    urlCount: submission_aggregate(where: { content: { _eq: $url } }) {
      aggregate {
        count
      }
    }
    teamUrlCount: submission_aggregate(where: { content: { _eq: $url }, _and: {team_id: {_eq: $teamID}}}) {
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
    $acceptedReason: String
  ) {
    insertSubmissionHistory: insert_submission_history(
      objects: {
        submission_id: $submissionID
        decision: $decision
        processed_by: $processedBy
        rejected_reason: $rejectedReason
        accepted_reason: $acceptedReason
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
      team {
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
  SUBMISSION_HISTORY_SA,
  INSERT_SUBMISSION_HISTORY,
  LIVE_FEED,
  LIVE_FEED_FILTERED,
  LIVE_FEED_SA,
  URL_SEEN_COUNT,
  PROCESS_SUBMISSION,
  GET_TEAMS,
}
