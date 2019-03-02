import React from 'react'
import { FormGroup, HTMLSelect, TextArea } from '@blueprintjs/core'

const SUBMISSION_TYPE = {
  FAMILY: 'Family',
  FRIENDS: 'Friends',
  HOME: 'Home',
  EMPLOYMENT: 'Employment',
  BASIC_SUBJECT_INFO: 'Basic Subject Info',
  ADVANCED_SUBJECT_INFO: 'Advanced Subject Info',
  LOCATION: 'Location',
  DAY_LAST_SEEN: 'Day Last Seen',
  DARK_WEB: 'Dark Web',
}

const NewSubmissionForm = ({ handleSubmit, handleChange, values }) => (
  <form id="newSubmissionForm" onSubmit={handleSubmit}>
    <FormGroup label="Category" labelInfo="(required)" labelFor="text-input">
      <HTMLSelect name="category" value={values.category} onChange={handleChange} fill large>
        {Object.entries(SUBMISSION_TYPE).map(([key, value]) => (
          <option value={key}>{value}</option>
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
)

export default NewSubmissionForm
