import React from 'react'
import PropTypes from 'prop-types'
import FlipMove from 'react-flip-move'

// Custom Components
import CaseCard from './CaseCard'

// styles
import '../index.scss'

const CaseGrid = ({ cases }) => (
  <FlipMove className="case-card__grid" duration={500}>
    {cases.map(_case => (
      <CaseCard key={_case.uuid} caseData={_case} />
    ))}
  </FlipMove>
)

CaseGrid.propTypes = {
  cases: PropTypes.arrayOf(PropTypes.object).isRequired,
}

export default CaseGrid
