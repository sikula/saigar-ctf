import React, { useState } from 'react'
import { useLazyQuery } from '@apollo/react-hooks'
import gql from 'graphql-tag'


// Styles
import { Button, FormGroup, InputGroup } from '@blueprintjs/core'
import { Wizard, Steps, Step } from 'react-albus'
import { Line } from 'rc-progress'

const FETCH_ORDER = gql`
    query fetchOrder($orderNumber: String!) {
        eventbrite(where: {
            order_number: { _eq: $orderNumber }
        }) {
            order_number
            used
        }
    }
`

const RegisterPage = () => {

    const [orderNumber, setOrderNumber] = useState()
    const [email, setEmail] = useState()
    const [fetchOrder, { called, loading, data }] = useLazyQuery(FETCH_ORDER)

    const handleConfirmClick = () => {
        fetchOrder({
            variables: {
                orderNumber,
            }
        })
    }

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
            <div style={{ display: 'flex', flexDirection: 'column', maxWidth: '35%', margin: '0 auto' }}>
                <Wizard render={({ steps, step }) => (
                    <>
                        <Line percent={(steps.indexOf(step) + 1) / steps.length * 100} />
                        <Steps key={step.id} step={step}>
                            <Step id="order" render={({ next }) => (
                                <>
                                    <FormGroup label="Order #" labelFor="text-input">
                                        <InputGroup
                                            id="text-input"
                                            name="orderNumber"
                                            placeholder="Enter your Eventbrite order number"
                                            large
                                            values={orderNumber}
                                            onChange={e => setOrderNumber(e.target.value)}
                                        />
                                    </FormGroup>
                                    {/* <Button fill large onClick={handleConfirmClick}>Confirm</Button> */}
                                    <Button fill large onClick={next} />
                                </>
                            )}
                            />
                            <Step id="user" render={({ next }) => (
                                <>
                                    <FormGroup label="Order #" labelFor="text-input">
                                        <InputGroup
                                            id="text-input"
                                            name="orderNumber"
                                            placeholder="Enter your Eventbrite order number"
                                            large
                                            values={orderNumber}
                                            onChange={e => setOrderNumber(e.target.value)}
                                        />
                                    </FormGroup>
                                    <Button fill large onClick={handleConfirmClick}>Confirm</Button>
                                </>
                            )}
                            />
                            <Step id="team" render={({ next }) => (
                                <>
                                    <FormGroup label="Order #" labelFor="text-input">
                                        <InputGroup
                                            id="text-input"
                                            name="orderNumber"
                                            placeholder="Enter your Eventbrite order number"
                                            large
                                            values={orderNumber}
                                            onChange={e => setOrderNumber(e.target.value)}
                                        />
                                    </FormGroup>
                                    <Button fill large onClick={handleConfirmClick}>Confirm</Button>
                                </>
                            )}
                            />
                        </Steps>
                    </>
                )}
                />
            </div>
        </div>
    )
}

/*
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
                        <h2 style={{ fontWeight: 500 }}>Register</h2>
                    </div>
                    <div style={{ margin: 30 }}>
                        <FormGroup label="Order #" labelFor="text-input">
                            <InputGroup
                                id="text-input"
                                name="orderNumber"
                                placeholder="Enter your Eventbrite order number"
                                large
                                values={orderNumber}
                                onChange={e => setOrderNumber(e.target.value)}
                            />
                        </FormGroup>
                        <Button fill large onClick={handleConfirmClick}>Confirm</Button>
                    </div>
                    {/* {(called && !loading && data) && (
                        <div style={{ margin: 30, borderTop: '1px solid #ece7e7' }}>
                            Hello There World
                        </div>
                    )} 
            //         <div style={{ borderTop: '1px solid #ece7e7' }}>
            //             <div style={{ margin: 30 }}>
            //                 <FormGroup label="Email (required)" labelFor="text-input">
            //                     <InputGroup
            //                         id="text-input"
            //                         name="orderNumber"
            //                         placeholder="Enter your email"
            //                         large
            //                         values={orderNumber}
            //                         onChange={e => setOrderNumber(e.target.value)}
            //                     />
            //                 </FormGroup>
            //                 <FormGroup label="Username (required)" labelFor="text-input">
            //                     <InputGroup
            //                         id="text-input"
            //                         name="orderNumber"
            //                         placeholder="Enter your username"
            //                         large
            //                         values={orderNumber}
            //                         onChange={e => setOrderNumber(e.target.value)}
            //                     />
            //                 </FormGroup>
            //                 <FormGroup label="Password (required)" labelFor="text-input">
            //                     <InputGroup
            //                         id="text-input"
            //                         name="orderNumber"
            //                         type="password"
            //                         placeholder="Enter your password"
            //                         large
            //                         values={orderNumber}
            //                         onChange={e => setOrderNumber(e.target.value)}
            //                     />
            //                 </FormGroup>
            //             </div>
            //         </div>
            //     </div>
            //     <div style={{ color: "#000", padding: 10 }}>
            //         Powered by <span style={{ fontWeight: 600 }}>Saigar Technologies</span> |{' '}
            //         <a href="https://saigar.io" target="_blank">
            //             saigar.io
            //     </a>{' '}
            //         |{' '}
            //         <a href="https://twitter.com/@saigar_to" target="_blank">
            //             @saigar_to
            //     </a>{' '}
            //     </div>
            // </div>
*/


export default RegisterPage