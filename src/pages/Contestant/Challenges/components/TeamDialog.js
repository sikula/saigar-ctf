import React, { useState } from 'react'
import { Mutation } from 'react-apollo'

import { AuthConsumer } from '@shared/components/AuthContext/context'

// Styles
import { Button, Dialog, FormGroup, InputGroup, Classes, H3 } from '@blueprintjs/core'

// Data Stuffz
import { ACCEPT_TERMS } from '../graphql/queries'

// @NOTE(Peter): this is a very quick hack for conditionally
// rendering the proper dialog.  We could try using the
// new React hooks with thte useReducer hook or something
// to make this cleaner.  This works for now though
const TeamDialog = () => {
    const [isOpen, setIsOpen] = useState(true)
    const [buttonPressed, setButtonPressed] = useState(null)
    const [teamCode, setTeamCode] = useState()
    const [teamName, setTeamName] = useState()

    // ======================================================
    // Handlers
    // ======================================================

    const handleClose = () => {
        setIsOpen(prevState => ({
            isOpen: !prevState.isOpen,
        }))
    }

    return (
        <Dialog
            isOpen={isOpen}
            autoFocus
            canEscapeKeyClose={false}
            canOutsideClickClose={false}
            className={Classes.DARK}
        >
            <div className={Classes.DIALOG_BODY}>
                <H3>Team Creation</H3>
                <span style={{ display: 'flex', flexDirection: 'row' }}>
                    <Button large fill intent="primary" onClick={() => setButtonPressed("JOIN")} style={{ marginRight: 10 }}>Join a Team</Button>
                    <Button large fill intent="primary" onClick={() => setButtonPressed("CREATE")}>Create a Team</Button>
                </span>
                {buttonPressed && buttonPressed === "JOIN" && (
                    <div style={{ margin: 20 }}>
                        <FormGroup label="Team Code (required)" labelFor="text-input">
                            <InputGroup
                                id="text-input"
                                name="teamCode"
                                placeholder="e.g. 212397-123102-123121212"
                                large
                                values={teamCode}
                                onChange={e => setTeamCode(e.target.value)}
                            />
                        </FormGroup>
                    </div>
                )}
                {buttonPressed && buttonPressed === "CREATE" && (
                    <div style={{ margin: 20 }}>
                        <FormGroup label="Team Name (required)" labelFor="text-input">
                            <InputGroup
                                id="text-input"
                                name="teamName"
                                placeholder="e.g. Elite H4x0rs"
                                large
                                values={teamName}
                                onChange={e => setTeamName(e.target.value)}
                            />
                        </FormGroup>
                    </div>
                )}
            </div>
            <div className={Classes.DIALOG_FOOTER}>
                <div className={Classes.DIALOG_FOOTER_ACTIONS}>
                    <AuthConsumer>
                        {({ user }) => (
                            <Mutation mutation={ACCEPT_TERMS} variables={{ auth0id: user.id }}>
                                {acceptTerms => (
                                    <Button
                                        // disabled={!(checkedItems.get('disclaimer') && checkedItems.get('tos'))}
                                        large
                                        intent="primary"
                                        onClick={() => acceptTerms().then(handleClose)}
                                    >
                                        Confirm
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

export default TeamDialog
