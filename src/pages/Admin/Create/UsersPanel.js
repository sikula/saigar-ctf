import React from 'react'
import { Query } from 'react-apollo'
import gql from 'graphql-tag'

// Styles
import { Button, Icon, H5 } from '@blueprintjs/core'
import { IconNames } from '@blueprintjs/icons'

// Custom Components
import { SlidingPanelConsumer } from '../../../shared/components/SlidingPane'
import AddAdmin from './components/AddAdmins'

const ADMIN_USERS_QUERY = gql`
  query {
    user(where: { role: { _in: ["JUDGE", "ADMIN"] } }, order_by: { role: asc }) {
      uuid
      email
      role
      nickname
    }
  }
`

const UsersPanel = () => (
  <div>
    <div style={{ paddingBottom: 30 }}>
      <SlidingPanelConsumer>
        {({ openSlider }) => (
          <Button
            id="createbutton"
            style={{
              width: '148px',
              height: '40px',
              background: '#1F4B99',
              color: '#FFFFFF',
              display: 'flex',
            }}
            onClick={() => openSlider(AddAdmin)}
            icon={<Icon icon={IconNames.ADD} style={{ color: '#F5F8FA' }} iconSize={18} />}
          >
            Create User
          </Button>
        )}
      </SlidingPanelConsumer>
    </div>
    <Query query={ADMIN_USERS_QUERY}>
      {({ data, loading, error }) => {
        if (loading) return <div>Loading....</div>
        if (error) return <div>`${error.message}`</div>

        if (!Array.isArray(data.user) || !data.user.length) {
          return <H5>No Admin/Judge users. Click "Create User" to create one.</H5>
        }

        return (
          <table style={{ width: '85%', margin: '0 auto' }}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
              </tr>
            </thead>
            <tbody>
              {data.user.map(user => (
                <tr key={user.uuid}>
                  <td>{user.nickname}</td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )
      }}
    </Query>
  </div>
)

export default UsersPanel
