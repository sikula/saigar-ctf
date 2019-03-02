import gql from 'graphql-tag'

const GET_SUBMISSION_QUERY = gql`
  query getSubmission($submissionID: uuid!) {
    submission(where: { uuid: { _eq: $submissionID } }) {
      category
      content
      explanation
    }
  }
`

export { GET_SUBMISSION_QUERY }
