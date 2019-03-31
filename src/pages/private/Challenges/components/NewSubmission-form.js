import React from 'react'
import { Query } from 'react-apollo'
import { isWithinRange } from 'date-fns'
import { FormGroup, HTMLSelect, TextArea } from '@blueprintjs/core'

import { SUBMISSION_CONFIGURATION } from '../graphql/queries'

const NewSubmissionForm = ({ handleSubmit, handleChange, values }) => (
  <Query query={SUBMISSION_CONFIGURATION}>
    {({ error, loading, data }) => {
      if (loading) return null
      if (error) return null

      const canCreateSubmission = isWithinRange(
        new Date(data.event.start_time),
        new Date(),
        new Date(data.event.end_time),
      )

      return canCreateSubmission ? (
        <form id="newSubmissionForm" onSubmit={handleSubmit}>
          <FormGroup label="Category" labelInfo="(required)" labelFor="text-input">
            <HTMLSelect name="category" value={values.category} onChange={handleChange} fill large>
              {data.submission_configuration.map(config => (
                <option id={config.uuid} value={config.category}>{`${config.category} (${
                  config.points
                } pts.)`}</option>
              ))}
            </HTMLSelect>
          </FormGroup>
          <FormGroup label="Proof" labelInfo="(required)" labelFor="text-input">
            <TextArea name="proof" fill value={values.proof} onChange={handleChange} />
          </FormGroup>
          <FormGroup label="Explanation" labelInfo="(required)" labelFor="text-input">
            <TextArea name="explanation" fill value={values.explanation} onChange={handleChange} />
          </FormGroup>
        </form>
      ) : (
        <div>Competition is over</div>
      )
    }}
  </Query>
)

export default NewSubmissionForm
