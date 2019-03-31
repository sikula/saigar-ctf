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

const NEW_SUBMISSION_MUTATION = gql`
  mutation insertSubmission($category: String!, $content: String!, $explanation: String!) {
    insert_submission(
      objects: {
        category: $category
        content: $content
        explanation: $explanation
        team_id: "0bbf7e9e-fcb6-4193-b622-09b2c60c863c" # can get it from user
        event_id: "887c65ba-abbe-4b81-a9f4-1c64784043a9" # can get it from query
        case_id: "8d536ac8-b3e4-438a-a962-db26b3c2f880" # can get it from modal
        config_id: "c5303458-aef7-4013-ba09-248edbd40c49" # can get it from query
      }
    ) {
      affected_rows
    }
  }
`

const SUBMISSION_CONFIGURATION = gql`
  query submissionConfig {
    event(order_by: { start_time: desc }, limit: 1) {
      start_time
      end_time
    }
    submission_configuration {
      uuid
      category
      points
    }
  }
`

export { CASE_LIST, NEW_SUBMISSION_MUTATION, SUBMISSION_CONFIGURATION }
