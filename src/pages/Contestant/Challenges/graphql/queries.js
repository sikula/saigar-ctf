import gql from 'graphql-tag'

const CASE_LIST = gql`
  query caseList {
    user(where: { auth0id: { _eq: "test" } }) {
      acceptedTos
    }
    case {
      uuid
      name
      missing_since
      missing_from
    }
    team(limit: 1) {
      pendingSubmissions: submissionsByteamId_aggregate(where: { processed: { _eq: "PENDING" } }) {
        aggregate {
          count
        }
      }
      acceptedSubmissions: submissionsByteamId_aggregate(
        where: { processed: { _eq: "ACCEPTED" } }
      ) {
        aggregate {
          count
        }
      }
      rejectedSubmissions: submissionsByteamId_aggregate(
        where: { processed: { _eq: "REJECTED" } }
      ) {
        aggregate {
          count
        }
      }
    }
  }
`

const ACCEPT_TERMS = gql`
  mutation acceptTerms {
    update_user(_set: { acceptedTos: true }, where: { auth0id: { _eq: "test" } }) {
      affected_rows
    }
  }
`

// query {
// user_team {
//   team {
//     uuid
//   }
// }
//   event(order_by:{start_time: desc}, limit:1) {
//     uuid
//   }
// }

const NEW_SUBMISSION_MUTATION = gql`
  mutation insertSubmission(
    $content: String!
    $explanation: String!
    $teamId: uuid!
    $eventId: uuid!
    $caseId: uuid!
    $configId: uuid!
  ) {
    insert_submission(
      objects: {
        content: $content
        explanation: $explanation
        team_id: $teamId # can get it from user
        event_id: $eventId # can get it from query
        case_id: $caseId # can get it from modal
        config_id: $configId # can get it from query
      }
    ) {
      affected_rows
    }
  }
`
// TODO(peter): need to fix this, make sure you are querying by the current user
const SUBMISION_INFO = gql`
  query submissionConfig {
    event(order_by: { start_time: desc }, limit: 1) {
      uuid
      start_time
      end_time
    }
    user_team {
      team {
        uuid
      }
    }
    submission_configuration {
      uuid
      category
      points
    }
  }
`

export { CASE_LIST, ACCEPT_TERMS, NEW_SUBMISSION_MUTATION, SUBMISION_INFO }
