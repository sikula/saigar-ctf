import React from 'react'
import PropTypes from 'prop-types'
import { Query } from 'react-apollo'
import { useMutation } from '@apollo/react-hooks'
import gql from 'graphql-tag'

// Styles
import { Card, Button, Icon, H5, H4 } from '@blueprintjs/core'
import { IconNames } from '@blueprintjs/icons'

// Custom Components
import { SlidingPanelConsumer } from '../../../shared/components/SlidingPane'
import CreateCase from './components/CreateCase'
import EditCase from './components/EditCase'

// GraphQL
import { CASES_QUERY } from './graphql/graphQueries'

const DELETE_CASE_MUTATION = gql`
  mutation DELETE_CASE($caseId: uuid!) {
    delete_event_case(where: { case_id: { _eq: $caseId } }) {
      affected_rows
    }
  }
`

const CaseCard = ({ id, name, missingSince }) => {
  const [deleteCase] = useMutation(DELETE_CASE_MUTATION, {
    variables: { caseId: id },
    refetchQueries: [{ query: CASES_QUERY }],
  })

  return (
    <div className="case-card__wrapper" style={{ width: 'calc(33.33% - 24px)' }}>
      <Card id="case-card">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>
          <H4 className="case-card__header" style={{ textAlign: 'center' }}>
            {name}
          </H4>
        </div>
        <p>
          <strong>Missing Since: </strong>
          {new Date(missingSince).toDateString()}
        </p>
      </Card>
      <div style={{ display: 'inline-flex', width: '100%', background: '#E1E8ED' }}>
        <SlidingPanelConsumer>
          {({ openSlider }) => (
            <Button
              className="case-card__actions"
              minimal
              icon={<Icon icon={IconNames.EDIT} style={{ color: '#394B59' }} iconSize={20} />}
              onClick={() => openSlider(EditCase, { caseID: id })}
            />
          )}
        </SlidingPanelConsumer>
        <Button
          className="case-card__actions"
          style={{ background: '#DB3737', borderRadius: 0 }}
          minimal
          icon={<Icon icon={IconNames.TRASH} style={{ color: '#CED9E0' }} iconSize={20} />}
          onClick={deleteCase}
        />
      </div>
    </div>
  )
}

CaseCard.propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  missingSince: PropTypes.string.isRequired,
}

const CasesPanel = () => (
  <React.Fragment>
    <div style={{ paddingBottom: 10 }}>
      <SlidingPanelConsumer>
        {({ openSlider }) => (
          <Button
            id="createbutton"
            style={{
              width: '148px',
              height: '40px',
              background: '#1F4B99',
              color: '#FFFFFF',
              display: 'flex',
            }}
            onClick={() => openSlider(CreateCase)}
            icon={<Icon icon={IconNames.ADD} style={{ color: '#F5F8FA' }} iconSize={18} />}
          >
            Create Case
          </Button>
        )}
      </SlidingPanelConsumer>
    </div>
    <Query query={CASES_QUERY}>
      {({ data, loading, error }) => {
        if (loading) return <div>Loading....</div>
        if (error) return <div>`${error.message}`</div>

        if (!Array.isArray(data.event) || !data.event.length) {
          return (
            <H5>
              No events currently. Click on the 'Add Event' button in the 'Events' tab to create one
            </H5>
          )
        }

        return data.event.map(event => (
          <div>
            <h2 style={{ textAlign: 'center' }}>{event.name}</h2>
            <div className="case-card__grid" style={{ padding: 0 }}>
              {!Array.isArray(event.eventCasesByeventId) || !event.eventCasesByeventId.length ? (
                <div>
                  <H5>No cases currently. Click on the 'Create Case' button to create one.</H5>
                </div>
              ) : (
                <div className="case-card__row">
                  {event.eventCasesByeventId.map(_case => (
                    <CaseCard
                      key={_case.case.uuid}
                      id={_case.case.uuid}
                      name={_case.case.name}
                      missingSince={_case.case.missing_since}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        ))
      }}
    </Query>
  </React.Fragment>
)

export default CasesPanel
