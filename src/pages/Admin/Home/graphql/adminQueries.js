import gql from 'graphql-tag'

const HOME_QUERY = gql`
  query homeInfo {
    event(order_by: { start_time: desc }, limit: 1) {
      name
      start_time
    }
  }
`

const SUBMISSION_HISTORY = gql`
  subscription submissionHistory {
    event(order_by: { start_time: desc }, limit: 1) {
      submissions(
        where: { processed: { _in: ["ACCEPTED", "REJECTED"] } }
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
      submissions(where: { processed: { _eq: "PENDING" } }) {
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

const LIVE_FEED_FILTERED = gql`
  subscription liveFeedFilter($teams: [uuid]) {
    event(order_by: { start_time: desc }, limit: 1) {
      submissions(where: { processed: { _eq: "PENDING" }, team_id: { _in: $teams } }) {
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
  query getTeams {
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
`

export {
  HOME_QUERY,
  SUBMISSION_HISTORY,
  LIVE_FEED,
  LIVE_FEED_FILTERED,
  PROCESS_SUBMISSION,
  GET_TEAMS,
}
