import React from 'react'

const SubmissionPage = ({ match }) => {
  const { submissionID } = match.params

  return (
    <div style={{ marginTop: 200 }}>
      <div className="row center-xs">
        <div classname="col-12-xs">
          <div style={{ background: '#fff', width: '100%', padding: 20 }}>
            hi
          </div>
        </div>
      </div>
    </div>
  )
}

export default SubmissionPage
