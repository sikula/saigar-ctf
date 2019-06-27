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
    team_event(order_by: { event: { start_time: desc } }, where: { event_id: { _eq: $eventId } }) {
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
  LIVE_FEED,
  LIVE_FEED_FILTERED,
  PROCESS_SUBMISSION,
  GET_TEAMS,
}
