import React from 'react'
import PropTypes from 'prop-types'
import { differenceInDays } from 'date-fns'

// Styles
import { Card, Button, Icon, Tag, H5, Divider } from '@blueprintjs/core'
import { IconNames } from '@blueprintjs/icons'

// Custom Components
import { SlidingPanelConsumer } from '../../../../shared/components/SlidingPane'
import NewSubmission from './NewSubmission'
import CaseInfo from './CaseInfo'
import SubmissionInfo from './SubmissionInfo'

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

const ViewSubmissionButton = ({ id, name, submissionType }) => (
  <SlidingPanelConsumer>
    {({ openSlider }) => (
      <Button
        minimal
        style={{ textAlign: 'center', fontSize: '.75em' }}
        onClick={() => openSlider(SubmissionInfo, { caseID: id, caseName: name, submissionType })}
      >
        View
      </Button>
    )}
  </SlidingPanelConsumer>
)

const CaseCard = ({ caseData }) => {
  const { pendingSubmissions, acceptedSubmissions, rejectedSubmissions, ...rest } = caseData

  return (
    <div className="case-card__wrapper">
      <Card id="case-card">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: 12,
          }}
        >
          <H5 className="case-card__header">{rest.name}</H5>
          <span>
            <Tag round style={{ marginRight: 5 }}>
              {rest.missing_from}
            </Tag>
            <Tag intent="danger" round>{`${differenceInDays(
              new Date(),
              rest.missing_since,
            )} Days`}</Tag>
          </span>
        </div>
        <div style={{ display: 'inline-flex', width: '100%', justifyContent: 'space-between' }}>
          <div style={{ fontWeight: 350, fontSize: '1.15em', color: '#137cbd' }}>
            <strong>Pending</strong>
            <p style={{ textAlign: 'center' }}>
              {pendingSubmissions.aggregate.count}
              <br />
              <ViewSubmissionButton id={rest.uuid} name={rest.name} submissionType={['PENDING']} />
            </p>
          </div>
          <Divider />
          <div style={{ fontWeight: 350, fontSize: '1.15em', color: '#137cbd' }}>
            <strong>Approved</strong>
            <p style={{ textAlign: 'center' }}>
              {acceptedSubmissions.aggregate.count}
              <br />
              <ViewSubmissionButton
                id={rest.uuid}
                name={rest.name}
                submissionType={['ACCEPTED', 'STARRED']}
              />
            </p>
          </div>
          <Divider />
          <div style={{ fontWeight: 350, fontSize: '1.15em', color: '#137cbd' }}>
            <strong>Rejected</strong>
            <p style={{ textAlign: 'center' }}>
              {rejectedSubmissions.aggregate.count}
              <br />
              <ViewSubmissionButton id={rest.uuid} name={rest.name} submissionType={['REJECTED']} />
            </p>
          </div>
        </div>
      </Card>
      <div style={{ display: 'inline-flex', width: '100%', background: '#E1E8ED' }}>
        <CaseInfoButton id={rest.uuid} />
        <NewSubmissionButton id={rest.uuid} name={rest.name} />
      </div>
    </div>
  )
}

CaseCard.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  caseData: PropTypes.any.isRequired,
}

export default CaseCard
