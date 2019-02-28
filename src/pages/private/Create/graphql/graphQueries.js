import gql from 'graphql-tag'

const EVENTS_QUERY = gql`
  query getEvents {
    event(order_by: { start_time: desc }) {
      uuid
      name
      start_time
      end_time
    }
  }
`

const EDIT_EVENT_MUTATION = gql`
  mutation editEvent($eventID: uuid!, $input: event_set_input!) {
    update_event(_set: $input, where: { uuid: { _eq: $eventID } }) {
      returning {
        uuid
        name
        start_time
        end_time
      }
    }
  }
`

const CREATE_EVENT_MUTATION = gql`
  mutation createEvent($input: [event_insert_input!]!) {
    insert_event(objects: $input) {
      returning {
        uuid
        name
        start_time
        end_time
      }
    }
  }
`

const CASES_QUERY = gql`
  query getCases {
    case {
      name
      missing_since
    }
  }
`

// const EDIT_CASE_MUTATION = gql`
//   mutation {}
// `

const CREATE_CASE_MUTATION = gql`
  mutation createCase($eventID: uuid!, $caseData: case_insert_input!) {
    insert_event_case(objects: { event_id: $eventID, case: { data: $caseData } }) {
      affected_rows
    }
  }
`

export {
  EVENTS_QUERY,
  EDIT_EVENT_MUTATION,
  CREATE_EVENT_MUTATION,
  CASES_QUERY,
  CREATE_CASE_MUTATION,
}
