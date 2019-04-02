import gql from 'graphql-tag'

const CASE_LIST = gql`
  query caseList {
    case {
      uuid
      name
      missing_since
      missing_from
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

export { CASE_LIST, NEW_SUBMISSION_MUTATION, SUBMISION_INFO }
