import React from 'react'
import PropTypes from 'prop-types'

import { Query } from 'react-apollo'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

// Styles
import { Button, Icon, Switch, H5 } from '@blueprintjs/core'
import { IconNames } from '@blueprintjs/icons'

// Custom imports
import { PanelConsumer } from '../../../../../shared/components/Panel'
import { GET_TEAMS } from '../../graphql/adminQueries'
import { actions as actionCreators } from '../../redux'

function mapStateToProps(state) {
  return {
    teamFilter: state.filter.teamFilter,
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(actionCreators, dispatch)
}

const SettingTable = class extends React.Component {
  state = { selectedTeams: this.props.teamFilter }

  handleCheck = event => {
    const { id, checked } = event.currentTarget

    if (!checked) {
      this.setState(prevState => ({
        selectedTeams: prevState.selectedTeams.filter(item => item !== id),
      }))
    } else {
      this.setState(prevState => ({
        selectedTeams: prevState.selectedTeams.concat(id),
      }))
    }
  }

  executeFilter = async () => {
    const { selectedTeams } = this.state
    const { updateFilter } = this.props
    updateFilter(selectedTeams)
  }

  render() {
    const { data } = this.props
    const { selectedTeams } = this.state

    return (
      <React.Fragment>
        <table style={{ width: '100%' }}>
          <thead>
            <tr>
              <th>Tracked</th>
              <th>Pending</th>
              <th>Team</th>
            </tr>
          </thead>
          <tbody>
            {data.team_event.map(({ team }) => (
              <tr key={team.uuid}>
                <td style={{ textAlign: 'center' }}>
                  <Switch
                    id={team.uuid}
                    checked={selectedTeams.indexOf(team.uuid) !== -1}
                    onChange={this.handleCheck}
                  />
                </td>
                <td style={{ textAlign: 'center' }}>
                  {team.submissionByTeamAggregate.aggregate.count}
                </td>
                <td style={{ textAlign: 'center' }}>{team.name}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <Button
          fill
          intent="primary"
          large
          style={{ marginTop: 10, marginBottom: 10 }}
          onClick={() => this.executeFilter()}
        >
          Save
        </Button>
      </React.Fragment>
    )
  }
}

SettingTable.propTypes = {
  updateFilter: PropTypes.func.isRequired,
  data: PropTypes.objectOf(PropTypes.object).isRequired,
}

const ApolloSettingTable = connect(
  mapStateToProps,
  mapDispatchToProps,
)(SettingTable)

const SettingsPanel = () => (
  <PanelConsumer>
    {({ hidePanel }) => (
      <div
        style={{
          position: 'fixed',
          width: '500px',
          right: '365px',
          background: '#F5F8FA',
          top: 0,
          height: '100%',
          padding: 20,
          zIndex: 9999,
          borderRight: '1px solid #e6dddd',
          boxShadow: '-10px 0px 10px 1px rgba(0, 0, 0,0.08)',
          overflowY: 'scroll',
        }}
      >
        <Icon icon={IconNames.CROSS} iconSize={32} onClick={hidePanel} />
        <div className="teamList">
          <Query query={GET_TEAMS}>
            {({ data, loading, error }) => {
              if (loading) return <div>Loading...</div>
              if (error) return <div>{error.message}</div>

              if (!Array.isArray(data.team_event) || !data.team_event.length) {
                return <H5>No teams are registered for this event</H5>
              }
              return <ApolloSettingTable data={data} />
            }}
          </Query>
        </div>
      </div>
    )}
  </PanelConsumer>
)

export default SettingsPanel
