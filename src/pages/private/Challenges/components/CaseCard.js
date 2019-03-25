import React from 'react'
import { differenceInDays } from 'date-fns'

// Styles
import { Card, Button, Icon, Tag, H5 } from '@blueprintjs/core'
import { IconNames } from '@blueprintjs/icons'

// Custom Components
import { SlidingPanelConsumer } from '../../../../_Common/components/SlidingPane'
import NewSubmission from './NewSubmission'

// styles
import '../index.scss'

const NewSubmissionButton = ({ id }) => (
  <SlidingPanelConsumer>
    {({ openSlider }) => (
      <Button
        className="case-card__actions"
        minimal
        icon={<Icon icon={IconNames.ADD} style={{ color: '#394B59' }} iconSize={20} />}
        onClick={() => openSlider(NewSubmission, { caseID: id })}
      />
    )}
  </SlidingPanelConsumer>
)

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
      <NewSubmissionButton id={caseData.uuid} />
    </div>
  </div>
)

export default CaseCard
