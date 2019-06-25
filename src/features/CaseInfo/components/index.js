/* eslint-disable react/require-default-props, react/forbid-prop-types, jsx-a11y/anchor-is-valid */
import React from 'react'
import PropTypes from 'prop-types'
import { Query } from 'react-apollo'
import gql from 'graphql-tag'

const CASE_INFO = gql`
  query caseInfo($caseID: uuid!) {
    case(where: { uuid: { _eq: $caseID } }) {
      uuid
      name
      missing_from
      missing_since
      age
      disappearance_details
      other_notes
      characteristics
      source_url
    }
  }
`

const CaseInfoData = ({ caseID }) => (
  <Query query={CASE_INFO} variables={{ caseID }}>
    {({ data, loading, error }) => {
      if (error) return <div>error</div>
      if (loading) return <div>Loading...</div>

      return data.case.map(_case => (
        <React.Fragment>
          <p>
            <strong>Source URL: </strong>
            <a href={_case.source_url}>{_case.source_url}</a>
          </p>
          <p>
            <strong>Name: </strong>
            {_case.name}
          </p>
          <p>
            <strong>Missing From: </strong>
            {_case.missing_from}
          </p>
          <p>
            <strong>Missing Since: </strong>
            {_case.missing_since}
          </p>
          <p>
            <strong>Age: </strong>
            {_case.age}
          </p>
          <p style={{ whiteSpace: 'pre-wrap' }}>
            <strong>Disappearance Details: </strong>
            {_case.disappearance_details}
          </p>
          <p style={{ whiteSpace: 'pre-wrap' }}>
            <strong>Characteristics: </strong>
            {_case.characteristics}
          </p>
          <p style={{ whiteSpace: 'pre-wrap' }}>
            <strong>Other Notes: </strong>
            {_case.other_notes}
          </p>
        </React.Fragment>
      ))
    }}
  </Query>
)

CaseInfoData.propTypes = {}

export default CaseInfoData
