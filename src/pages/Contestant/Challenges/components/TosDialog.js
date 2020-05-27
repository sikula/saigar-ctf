import React from 'react'
import { Mutation } from 'react-apollo'
import { Link } from 'react-router-dom'
import gql from 'graphql-tag'

import { AuthConsumer } from '@shared/components/AuthContext/context'

// Styles
import { Button, Dialog, Classes, Checkbox, H3 } from '@blueprintjs/core'

// Data Stuffz
import { ACCEPT_TERMS } from '../graphql/queries'

const USER_INFO = gql`
  query userInfo($auth0id: String!) {
    user(where: { auth0id: { _eq: $auth0id } }) {
      acceptedTos
    }
    team(where: { user_team: { user: { auth0id: { _eq: $auth0id } } } }) {
      name
      uuid
    }
  }
`

export default class TosDialog extends React.Component {
  state = {
    isOpen: true,
    checkedItems: new Map(),
  }

  handleCheckBox = e => {
    const { name, checked } = e.target
    this.setState(prevState => ({
      checkedItems: prevState.checkedItems.set(name, checked),
    }))
  }

  handleClose = () => {
    this.setState(prevState => ({
      isOpen: !prevState.isOpen,
    }))
  }

  render() {
    const { isOpen, checkedItems } = this.state

    return (
      <Dialog
        isOpen={isOpen}
        autoFocus
        canEscapeKeyClose={false}
        canOutsideClickClose={false}
        className={Classes.DARK}
      >
        <div className={Classes.DIALOG_BODY}>
          <H3>Disclaimer</H3>
          <p>
            By participating in the Missing Persons CTF, there is a risk of being exposed to graphic
            or disturbing material.
          </p>

          <p>
            <Checkbox
              name="disclaimer"
              checked={checkedItems.get('disclaimer')}
              label="I understand these risks and want to proceed"
              onChange={this.handleCheckBox}
            />
          </p>

          <H3>Terms of Service</H3>
          <p>
            Please review and accept the <Link to="/terms-of-service">Terms of Service</Link> to
            complete your account registration.
          </p>

          <p>
            <Checkbox
              name="tos"
              checked={checkedItems.get('tos')}
              label="I accept the Terms of Service"
              onChange={this.handleCheckBox}
            />
          </p>
        </div>
        <div className={Classes.DIALOG_FOOTER}>
          <div className={Classes.DIALOG_FOOTER_ACTIONS}>
            <AuthConsumer>
              {({ user }) => (
                <Mutation
                  mutation={ACCEPT_TERMS}
                  variables={{ auth0id: user.id }}
                  refetchQueries={[{ query: USER_INFO, variables: { auth0id: user.id } }]}
                >
                  {acceptTerms => (
                    <Button
                      disabled={!(checkedItems.get('disclaimer') && checkedItems.get('tos'))}
                      large
                      intent="primary"
                      onClick={() => acceptTerms().then(() => this.handleClose())}
                    >
                      I Accept
                    </Button>
                  )}
                </Mutation>
              )}
            </AuthConsumer>
          </div>
        </div>
      </Dialog>
    )
  }
}

// Welcome to the Trace Labs Missing CTF, powered by Saigar's Saigar-CTF platform.

// Please review and accept the below Terms of Service to complete your account registration.
