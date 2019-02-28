import gql from 'graphql-tag'


// Anything after here is old code!! Can likely be deleted

const OPEN_NEW_CASE = gql`
  mutation createCase($input: [case_insert_input!]!) {
    insert_case(objects: $input) {
      returning {
        uuid
        status
        classification
        full_name
        missing_since
        missing_from
        age
        height_weight
        characteristics
        dissappearance_details
        other_notes
      }
    }
  }
`

const EDIT_CASE = gql`
  mutation editCase($caseID: uuid!, $input: case_set_input!) {
    update_case(_set: $input, where: { uuid: { _eq: $caseID } }) {
      returning {
        uuid
        status
        classification
        full_name
        missing_since
        missing_from
        age
        height_weight
        characteristics
        dissappearance_details
        other_notes
      }
    }
  }
`

export {
  OPEN_NEW_CASE,
  EDIT_CASE,
}
