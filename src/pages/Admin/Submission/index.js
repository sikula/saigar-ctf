import React from 'react'
import PropTypes from 'prop-types'
import { Query } from 'react-apollo'

import { GET_SUBMISSION_QUERY } from './graphql/queries'

const SubmissionPage = ({ match }) => {
  const { submissionID } = match.params

  return (
    <Query query={GET_SUBMISSION_QUERY} variables={{ submissionID }}>
      {({ data, loading, error }) => {
        if (loading) return null
        if (error) return <div>{error.message}</div>

        const { content, explanation } = data.submission[0]

        return (
          <div style={{ marginTop: 200 }}>
            <div className="row center-xs">
              <div className="col-12-xs">
                <div style={{ background: '#fff', width: '100%', padding: 20 }}>
                  <div>{data.submission[0].submissionConfigurationByconfigId.category}</div>
                  <div>{content}</div>
                  <div>{explanation}</div>
                </div>
                <div>
                  <div>{data.submission[0].teamByteamId.name}</div>
                  <div>{data.submission[0].case.name}</div>
                </div>
              </div>
            </div>
          </div>
        )
      }}
    </Query>
  )
}

SubmissionPage.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.objectOf(PropTypes.object).isRequired,
  }).isRequired,
}

export default SubmissionPage
