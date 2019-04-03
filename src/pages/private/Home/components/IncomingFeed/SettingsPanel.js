import React from 'react'
import { Query } from 'react-apollo'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

// Styles
import { Button, Icon, Switch } from '@blueprintjs/core'
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
  constructor(props) {
    super(props)
    this.state = {
      items: [],
    }
  }

  handleCheck = event => {
    const { id, checked } = event.currentTarget

    // TODO(peter):
    //  Integrate Apollo-Client into this (eventually will swap out for Redux, but AC is simpler)
    // why does this work.......
    if (!checked) {
      this.setState(prevState => ({
        items: prevState.items.filter(item => item !== id),
      }))
    } else {
      this.setState(prevState => ({
        items: prevState.items.concat(id),
      }))
    }
  }

  _executeFilter = async () => {
    const { items } = this.state
    this.props.updateFilter(items)
  }

  render() {
    const { data } = this.props
    return (
      <React.Fragment>
        <table style={{ width: '100%' }}>
          <th>Tracked</th>
          <th>Submissions</th>
          <th>Name</th>
          {data.team.map(team => (
            <tr key={team.uuid}>
              <td style={{ textAlign: 'center' }}>
                <Switch
                  id={team.uuid}
                  checked={this.state.items.indexOf(team.uuid) !== -1}
                  onChange={this.handleCheck}
                />
              </td>
              <td style={{ textAlign: 'center' }}>
                {team.submissionsByteamId_aggregate.aggregate.count}
              </td>
              <td style={{ textAlign: 'center' }}>{team.name}</td>
            </tr>
          ))}
        </table>
        <Button onClick={() => this._executeFilter()}>Save</Button>
      </React.Fragment>
    )
  }
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
          position: 'absolute',
          width: '500px',
          right: '365px',
          background: '#F5F8FA',
          top: 0,
          height: '100%',
          padding: 20,
          zIndex: 9999,
          borderRight: '1px solid #e6dddd',
          boxShadow: '-10px 0px 10px 1px rgba(0, 0, 0,0.08)',
        }}
      >
        <Icon icon={IconNames.CROSS} iconSize={32} onClick={hidePanel} />
        <div className="teamList">
          <Query query={GET_TEAMS}>
            {({ data, loading, error }) => {
              if (loading) return <div>Loading...</div>
              if (error) return <div>{error.message}</div>

              return <ApolloSettingTable data={data} />
            }}
          </Query>
        </div>
      </div>
    )}
  </PanelConsumer>
)

export default SettingsPanel
