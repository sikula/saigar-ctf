import React from 'react'
import FlipMove from 'react-flip-move'

// Custom Components
import CaseCard from './CaseCard'

const CaseGrid = ({ cases }) => (
  <FlipMove className="case-card__grid" duration={500}>
    {cases.map(_case => (
      <CaseCard key={_case.uuid} caseData={_case} />
    ))}
  </FlipMove>
)

export default CaseGrid
