import gql from 'graphql-tag'

const EVENTS_QUERY = gql`
  query getEvents {
    event(order_by: { start_time: desc }) {
      uuid
      name
      start_time
      end_time
      totalSubmissions: submissions_aggregate {
        aggregate {
          count
        }
      }
    }
  }
`

const EDIT_EVENT_MUTATION = gql`
  mutation editEvent($eventID: uuid!, $input: event_set_input!) {
    updateEvent: update_event(_set: $input, where: { uuid: { _eq: $eventID } }) {
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
    insertEvent: insert_event(objects: $input) {
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
    event {
      name
      eventCasesByeventId {
        case {
          uuid
          name
          missing_since
        }
      }
    }
  }
`

const CASE_QUERY = gql`
  query caseInfo($caseID: uuid) {
    eventCase: event_case(where: { case_id: { _eq: $caseID } }) {
      event_id
      case {
        uuid
        name
        missing_since
        missing_from
        age
        height
        weight
        characteristics
        source_url
        disappearance_details
        other_notes
      }
    }
  }
`

const EDIT_EVENT_CASE_MUTATION = gql`
  mutation editEventCase($eventID: uuid, $caseID: uuid) {
    updateEventCase: update_event_case(
      _set: { event_id: $eventID }
      where: { case_id: { _eq: $caseID } }
    ) {
      affected_rows
    }
  }
`

const EDIT_CASE_MUTATION = gql`
  mutation editCase($caseID: uuid, $input: case_set_input!) {
    updateCase: update_case(_set: $input, where: { uuid: { _eq: $caseID } }) {
      affected_rows
    }
  }
`

const CREATE_CASE_MUTATION = gql`
  mutation createCase($eventID: uuid!, $caseData: case_insert_input!) {
    insertEventCase: insert_event_case(objects: { event_id: $eventID, case: { data: $caseData } }) {
      affected_rows
    }
  }
`

export {
  EVENTS_QUERY,
  EDIT_EVENT_MUTATION,
  CREATE_EVENT_MUTATION,
  CASES_QUERY,
  CASE_QUERY,
  EDIT_EVENT_CASE_MUTATION,
  EDIT_CASE_MUTATION,
  CREATE_CASE_MUTATION,
}
