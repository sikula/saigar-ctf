import React from 'react'

import ScoreGraph from '../../../features/ScoreGraph'
import ScoreBoard from '../../../features/ScoreBoard'

const ScoreBoardPage = () => (
  <React.Fragment>
    <div className="row center-xs">
      <div className="col-xs-12">
        <ScoreGraph dark />
      </div>
    </div>
    <div className="row center-xs">
      <div className="col-xs-10">
        <ScoreBoard />
      </div>
    </div>
  </React.Fragment>
)

export default ScoreBoardPage
