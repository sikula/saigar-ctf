import React, { useState } from 'react'

// Styles
import { Button, FormGroup, InputGroup } from '@blueprintjs/core'

const RegisterPage = () => {

    return (
        <div
            style={{
                width: '100%',
                height: '100vh',
                background: 'rgb(239, 243, 245)',
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center'
            }}
        >
            <div style={{ display: 'flex', flexDirection: 'column', width: '100%', alignItems: 'center' }}>
                <div
                    style={{
                        margin: '0 auto',
                        width: '480px',
                        background: '#FFF',
                        boxShadow: 'rgba(12, 52, 75, 0.05) 0px 3px 3px',
                        borderRadius: '8px'
                    }}
                >
                    <div
                        style={{
                            width: '100%',
                            borderBottom: '1px solid #ece7e7',
                            textAlign: 'center',
                            paddingTop: 10,
                            paddingBottom: 10,
                        }}
                    >
                        <h2 style={{ fontWeight: 500 }}>Register for <span style={{ fontWeight: 600 }}>EVENT_NAME</span></h2>
                    </div>
                    <div style={{ margin: 30 }}>
                        <FormGroup label="Email" labelFor="text-input">
                            <InputGroup
                                id="text-input"
                                name="email"
                                placeholder="example@gmail.com"
                                large
                            />
                        </FormGroup>
                        <FormGroup label="Password" labelFor="text-input">
                            <InputGroup
                                id="text-input"
                                name="password"
                                type="password"
                                large
                            />
                        </FormGroup>
                        <Button fill large>Login</Button>
                    </div>
                    <div style={{
                        borderTop: '1px solid #ece7e7',
                        padding: 20,
                        textAlign: 'center'
                    }}>
                        Forgot password?
                </div>
                </div>
                <div style={{ color: "#000", padding: 10 }}>
                    Powered by <span style={{ fontWeight: 600 }}>Saigar Technologies</span> |{' '}
                    <a href="https://saigar.io" target="_blank">
                        saigar.io
                </a>{' '}
                    |{' '}
                    <a href="https://twitter.com/@saigar_to" target="_blank">
                        @saigar_to
                </a>{' '}
                </div>
            </div>
        </div>
    )
}


export default RegisterPage