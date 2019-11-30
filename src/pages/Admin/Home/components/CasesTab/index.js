import React from 'react'
import PropTypes from 'prop-types'
import { Query } from 'react-apollo'
import gql from 'graphql-tag'

import { differenceInDays, parseISO } from 'date-fns'

// Styles
import { Card, Button, Icon, H5, Tag } from '@blueprintjs/core'
import { IconNames } from '@blueprintjs/icons'

// Custom Components
import { SlidingPanelConsumer, SlidingPane } from '@shared/components/SlidingPane'
import CaseInfoData from '@features/CaseInfo/components'

const CASES_QUERY = gql`
  query getCases {
    event(order_by: { start_time: desc }, limit: 1) {
      eventCasesByeventId {
        case {
          uuid
          name
          missing_since
          missing_from
        }
      }
    }
  }
`

// TODO(peter): This entire file needs to be cleaned up and split up into its own components.
// Its fine for now, but it is getting a little bit out of control.
const CaseInfo = ({ isOpen, onRequestClose, ...otherProps }) => (
  <SlidingPane
    isOpen={isOpen}
    onRequestClose={onRequestClose}
    closeIcon={<Icon icon={IconNames.MENU_CLOSED} iconSize={20} />}
  >
    <SlidingPane.Header>
      <SlidingPane.Header.Title title="Case Info" subtitle="Details on the case" />
      <SlidingPane.Header.Actions onActionClick={onRequestClose}>
        <a>Cancel</a>
      </SlidingPane.Header.Actions>
    </SlidingPane.Header>

    <SlidingPane.Content>
      <CaseInfoData caseID={otherProps.caseID} />
    </SlidingPane.Content>
  </SlidingPane>
)

const CaseInfoButton = ({ id }) => (
  <SlidingPanelConsumer>
    {({ openSlider }) => (
      <Button
        className="case-card__actions"
        minimal
        icon={<Icon icon={IconNames.INFO_SIGN} style={{ color: '#394B59' }} iconSize={20} />}
        onClick={() => openSlider(CaseInfo, { caseID: id })}
      />
    )}
  </SlidingPanelConsumer>
)
CaseInfoButton.propTypes = {
  id: PropTypes.string.isRequired,
}

const CaseCard = ({ caseData }) => (
  <div className="case-card__wrapper">
    <Card id="case-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <H5 className="case-card__header">{caseData.name}</H5>
        <Tag round>{caseData.missing_from}</Tag>
      </div>
      <p>{`missing for: ${differenceInDays(
        new Date(), parseISO(caseData.missing_since)
      )} days`}</p>
    </Card>
    <div style={{ display: 'inline-flex', width: '100%', background: '#E1E8ED' }}>
      <CaseInfoButton id={caseData.uuid} />
    </div>
  </div>
)

const CasesTab = () => (
  <Query query={CASES_QUERY}>
    {({ loading, error, data }) => {
      if (loading) return null
      if (error) return null

      const cases = data.event[0].eventCasesByeventId

      return (
        <div className="case-card__grid">
          <div className="case-card__row">
            {cases.map(({ case: _case }) => (
              <CaseCard key={_case.uuid} caseData={_case} />
            ))}
          </div>
        </div>
      )
    }}
  </Query>
)

export default CasesTab
