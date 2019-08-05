import React from 'react'
import PropTypes from 'prop-types'

// Custom Components
import CaseCard from './CaseCard'

// styles
import '../index.scss'

const CaseGrid = ({ cases }) => (
  <div className="case-card__grid">
    <div className="case-card__row">
      {cases.map(({ case: _case }) => (
        <CaseCard key={_case.uuid} caseData={_case} />
      ))}
    </div>
  </div>
)

CaseGrid.propTypes = {
  cases: PropTypes.arrayOf(PropTypes.object).isRequired,
}

export default CaseGrid
