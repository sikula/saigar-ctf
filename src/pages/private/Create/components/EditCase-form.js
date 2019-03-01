import React from 'react'
import { Query } from 'react-apollo'

// Styles
import { TextArea, FormGroup, InputGroup, NumericInput, HTMLSelect } from '@blueprintjs/core'
import { DateInput } from '@blueprintjs/datetime'

// Custom Components
import { EVENTS_QUERY } from '../graphql/graphQueries'

const MissingSinceInput = props => {
  const handleChange = value => {
    props.onChange('missing_since', value)
  }

  return (
    <DateInput
      id="text-input"
      name="missing_since"
      value={props.value}
      onChange={handleChange}
      formatDate={date => date.toLocaleString()}
      parseDate={str => new Date(str)}
      placeholder="M/D/YYY"
      showActionsBar
      timePickerProps={{ precision: 'minute', useAmPm: true }}
      popoverProps={{
        targetProps: {
          style: { width: '100%' },
        },
      }}
      inputProps={{
        large: true,
      }}
    />
  )
}

const DobInput = props => {
  const handleChange = value => {
    props.onChange('dob', value)
  }

  return (
    <DateInput
      id="text-input"
      name="dob"
      value={props.value}
      onChange={handleChange}
      formatDate={date => date.toLocaleString()}
      parseDate={str => new Date(str)}
      minDate={new Date('1919', '01', '01')}
      placeholder="M/D/YYY"
      showActionsBar
      popoverProps={{
        targetProps: {
          style: { width: '100%' },
        },
      }}
      inputProps={{
        large: true,
      }}
    />
  )
}

const AgeInput = props => {
  const handleChange = value => {
    props.onChange('age', value)
  }

  return (
    <NumericInput
      allowNumericCharactersOnly
      buttonPosition="none"
      large
      fill
      name="age"
      onChange={handleChange}
      id="text-input"
      placeholder="14"
      onValueChange={handleChange}
      min="1"
      max="200"
    />
  )
}

const EventSelect = ({ values, handleChange }) => (
  <Query query={EVENTS_QUERY}>
    {({ data, loading }) => {
      if (loading) return null

      return (
        <HTMLSelect name="eventID" value={values.eventID} onChange={handleChange} fill large>
          <React.Fragment>
            <option value="" defaultValue="" hidden>
              Chose an event
            </option>
            {data.event.map(event => (
              <option key={event.uuid} value={event.uuid}>
                {event.name}
              </option>
            ))}
          </React.Fragment>
        </HTMLSelect>
      )
    }}
  </Query>
)

const EditCaseForm = ({ handleSubmit, handleChange, setFieldValue, values }) => (
  <form id="editCaseForm" onSubmit={handleSubmit}>
    <FormGroup label="Event" labelInfo="(required)" labelFor="text-input">
      <EventSelect values={values} handleChange={handleChange} />
    </FormGroup>
    <div style={{ width: '100%', height: '1px', background: '#f6e5ef', marginBottom: 15 }} />
    <FormGroup label="Full Name" labelInfo="(required)" labelFor="text-input">
      <InputGroup
        id="text-input"
        name="name"
        value={values.name}
        onChange={handleChange}
        placeholder="e.g. - John Doe"
        large
      />
    </FormGroup>
    <FormGroup label="Date of Birth" labelFor="text-input" labelInfo="(required)">
      <DobInput onChange={setFieldValue} value={new Date(values.dob)} valueFor="dob" />
    </FormGroup>
    <FormGroup label="Missing Since" labelInfo="(required)" labelFor="text-input">
      <MissingSinceInput
        onChange={setFieldValue}
        value={new Date(values.missing_since)}
        valueFor="missing_since"
      />
    </FormGroup>
    <FormGroup label="Missing From" labelInfo="(required)" labelFor="text-input">
      <InputGroup
        id="text-input"
        name="missing_from"
        value={values.missing_from}
        onChange={handleChange}
        placeholder="Toronto, Ontario"
        large
      />
    </FormGroup>
    <FormGroup label="Age" labelFor="text-input">
      <AgeInput onChange={setFieldValue} />
    </FormGroup>
    <FormGroup label="Height" labelFor="text-input">
      <InputGroup
        id="text-input"
        name="height"
        value={values.height}
        onChange={handleChange}
        placeholder="5'11"
        large
      />
    </FormGroup>
    <FormGroup label="Weight" labelFor="text-input">
      <InputGroup
        id="text-input"
        name="weight"
        value={values.weight}
        onChange={handleChange}
        placeholder="86KG"
        large
      />
    </FormGroup>
    <FormGroup label="Details of Disappearance" labelFor="text-input">
      <TextArea
        id="text-input"
        name="disappearance_details"
        value={values.disappearance_details}
        onChange={handleChange}
        placeholder="(e.g. reported missing last night)"
        fill
      />
    </FormGroup>
    <FormGroup label="Distinguishing Characteristics" labelFor="text-input">
      <TextArea
        id="text-input"
        name="characteristics"
        value={values.characteristics}
        onChange={handleChange}
        placeholder="(e.g. - dragon tatto on left wrist)"
        large
        fill
      />
    </FormGroup>
    <FormGroup label="Other Notes" labelFor="text-input">
      <TextArea
        id="text-input"
        name="other_notes"
        value={values.other_notes}
        onChange={handleChange}
        placeholder="(e.g. possible case of human trafficking)"
        fill
      />
    </FormGroup>
  </form>
)

export default EditCaseForm
