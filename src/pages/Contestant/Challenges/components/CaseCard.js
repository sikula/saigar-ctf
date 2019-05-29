import React from 'react'
import PropTypes from 'prop-types'
import { differenceInDays } from 'date-fns'

// Styles
import { Card, Button, Icon, Tag, H5 } from '@blueprintjs/core'
import { IconNames } from '@blueprintjs/icons'

// Custom Components
import { SlidingPanelConsumer } from '../../../../shared/components/SlidingPane'
import NewSubmission from './NewSubmission'
import CaseInfo from './CaseInfo'

// styles
import '../index.scss'

const NewSubmissionButton = ({ id, name }) => (
  <SlidingPanelConsumer>
    {({ openSlider }) => (
      <Button
        className="case-card__actions"
        minimal
        icon={<Icon icon={IconNames.ADD} style={{ color: '#394B59' }} iconSize={20} />}
        onClick={() => openSlider(NewSubmission, { caseID: id, caseName: name })}
      />
    )}
  </SlidingPanelConsumer>
)

NewSubmissionButton.propTypes = {
  id: PropTypes.string.isRequired,
}

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
      <p>{`missing for: ${differenceInDays(new Date(), caseData.missing_since)} days`}</p>
    </Card>
    <div style={{ display: 'inline-flex', width: '100%', background: '#E1E8ED' }}>
      <CaseInfoButton id={caseData.uuid} />
      <NewSubmissionButton id={caseData.uuid} name={caseData.name} />
    </div>
  </div>
)

CaseCard.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  caseData: PropTypes.any.isRequired,
}

export default CaseCard
