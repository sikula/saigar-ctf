import gql from 'graphql-tag'

const CASE_LIST = gql`
  query caseList($auth0id: String!) {
    user(where: { auth0id: { _eq: $auth0id } }) {
      acceptedTos
    }
    event(order_by: { start_time: desc }, limit: 1) {
      start_time
      end_time
      eventCasesByeventId {
        case {
          uuid
          name
          missing_since
          missing_from
          pendingSubmissions: submissions_aggregate(
            where: {
              processed: { _eq: "PENDING" }
              teamByteamId: { user_team: { user: { auth0id: { _eq: $auth0id } } } }
            }
          ) {
            aggregate {
              count
            }
          }
          acceptedSubmissions: submissions_aggregate(
            where: {
              processed: { _in: ["ACCEPTED", "STARRED"] }
              teamByteamId: { user_team: { user: { auth0id: { _eq: $auth0id } } } }
            }
          ) {
            aggregate {
              count
            }
          }
          rejectedSubmissions: submissions_aggregate(
            where: {
              processed: { _eq: "REJECTED" }
              teamByteamId: { user_team: { user: { auth0id: { _eq: $auth0id } } } }
            }
          ) {
            aggregate {
              count
            }
          }
        }
      }
    }
    team(where: { user_team: { user: { auth0id: { _eq: $auth0id } } } }) {
      name
    }
  }
`

const ACCEPT_TERMS = gql`
  mutation acceptTerms($auth0id: String!) {
    update_user(_set: { acceptedTos: true }, where: { auth0id: { _eq: $auth0id } }) {
      affected_rows
    }
  }
`

const NEW_SUBMISSION_MUTATION = gql`
  mutation insertSubmission(
    $content: String!
    $explanation: String!
    $supporting_evidence: String!
    $teamId: uuid!
    $eventId: uuid!
    $caseId: uuid!
    $configId: uuid!
  ) {
    insert_submission(
      objects: {
        content: $content
        explanation: $explanation
        supporting_evidence: $supporting_evidence
        team_id: $teamId # can get it from user
        event_id: $eventId # can get it from query
        case_id: $caseId # can get it from modal
        config_id: $configId # can get it from query
      }
    ) {
      affected_rows
      returning {
        uuid
      }
    }
  }
`

const NEW_SUBMISSIONFILE_MUTATION = gql`
  mutation insertSubmissionFile(
    $submission_id: uuid!
  ) {
    insert_submission_file(
      objects: {
        submission_id: $submission_id
      }
    ) {
      returning {
        uuid
      }
    }
  }
`

// TODO(peter): need to fix this, make sure you are querying by the current user
const SUBMISION_INFO = gql`
  query submissionConfig($auth0id: String!) {
    event(order_by: { start_time: desc }, limit: 1) {
      uuid
      start_time
      end_time
    }
    user_team(where: { user: { auth0id: { _eq: $auth0id } } }) {
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

export { CASE_LIST, ACCEPT_TERMS, NEW_SUBMISSION_MUTATION, NEW_SUBMISSIONFILE_MUTATION, SUBMISION_INFO }
