import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useLazyQuery } from '@apollo/react-hooks'
import useAxios from 'axios-hooks'
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
        }
    }
`


const EventOrderStep = ({ onNextClick }) => {

    const [orderNumber, setOrderNumber] = useState()
    const [message, setMessage] = useState()

    const [fetchOrder, { called, loading, data }] = useLazyQuery(FETCH_ORDER, {
        onCompleted: (data) => {
            console.log("COMPLETED")
            if (!data.eventrbite && data.eventbrite.length == 0) {
                setMessage("Invalid Eventbrite Order Number")
            } else {
                setMessage()
                onNextClick()
            }
        },
    })

    const handleConfirmClick = () => {
        fetchOrder({
            variables: {
                orderNumber,
            }
        })
    }

    return (
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
            {message}
            {/* <Button fill large onClick={handleConfirmClick}>Confirm</Button> */}
            <Button fill large onClick={handleConfirmClick}>Confirm</Button>
        </>
    )
}


const UserCreationStep = ({ onNextClick }) => {

    const [email, setEmail] = useState()
    const [username, setUsername] = useState()
    const [password, setPassword] = useState()

    const [{ data, loading, error }, executePost] = useAxios(
        {
            url: 'http://localhost:8080/register',
            method: 'POST',
        },
        { manual: true }
    )


    const handleClick = () => {
        executePost({
            data: {
                username,
                email,
                password
            }
        })
        .then(() => onNextClick())
    }

    if (loading) return "loading"

    return (
        <>
            <FormGroup label="Email (required)" labelFor="text-input">
                <InputGroup
                    id="text-input"
                    name="email"
                    placeholder="Enter your email"
                    large
                    values={email}
                    onChange={e => setEmail(e.target.value)}
                />
            </FormGroup>
            <FormGroup label="Username (required)" labelFor="text-input">
                <InputGroup
                    id="text-input"
                    name="username"
                    placeholder="Enter your username"
                    large
                    values={username}
                    onChange={e => setUsername(e.target.value)}
                />
            </FormGroup>
            <FormGroup label="Password (required)" labelFor="text-input">
                <InputGroup
                    id="text-input"
                    name="password"
                    type="password"
                    placeholder="Enter your password"
                    large
                    values={password}
                    onChange={e => setPassword(e.target.value)}
                />
            </FormGroup>
            <Button fill large onClick={handleClick}>Confirm</Button>
        </>
    )
}


// const TeamCreationStep = () => {

//     // State Layer
//     const [teamCode, setTeamCode] = useState()
//     const [teamName, setTeamName] = useState()
//     const [buttonPressed, setButtonPressed] = useState(null)

//     // GraphQL Layer

//     /*
//         1) If joining team, enter code (team UUID, add to table)
//         2) If creating team, enter team name, return team code (UUID); add user to that team
//         3) IMPLEMENT: eventbrite CSV import into eventbrite table
//     */

//     return (
//         <>
//             <span style={{ display: 'flex', flexDirection: 'row' }}>
//                 <Button fill large onClick={() => setButtonPressed("JOIN")} style={{ marginRight: 10 }}>Join a Team</Button>
//                 <Button fill large onClick={() => setButtonPressed("CREATE")}>Create a Team</Button>
//             </span>

//             {buttonPressed && buttonPressed == "JOIN" && (
//                 <>
//                     <FormGroup label="Team Code" labelFor="text-input">
//                         <InputGroup
//                             id="text-input"
//                             name="teamName"
//                             placeholder="e.g. - 67812-12839182-1231-123123312"
//                             large
//                             values={teamCode}
//                             onChange={e => setTeamCode(e.target.value)}
//                         />
//                     </FormGroup>
//                     <Button fill large onClick={() => 10}>Confirm</Button>
//                 </>
//             )}
//             {buttonPressed && buttonPressed === "CREATE" && (
//                 <>
//                     <FormGroup label="Team Name" labelFor="text-input">
//                         <InputGroup
//                             id="text-input"
//                             name="teamName"
//                             placeholder="e.g. Epic Doxxers"
//                             large
//                             values={teamName}
//                             onChange={e => setTeamName(e.target.value)}
//                         />
//                     </FormGroup>
//                     <Button fill large onClick={() => 10}>Confirm</Button>
//                 </>
//             )}
//         </>
//     )

// }


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
            <div style={{ display: 'flex', flexDirection: 'column', maxWidth: '35%', margin: '0 auto' }}>
                <Wizard render={({ steps, step }) => (
                    <>
                        <Line percent={(steps.indexOf(step) + 1) / steps.length * 100} style={{ marginBottom: 10 }} />
                        <Steps key={step.id} step={step}>
                            <Step id="order" render={({ next }) => <EventOrderStep onNextClick={next} />} />
                            <Step id="user" render={({ next }) => <UserCreationStep onNextClick={next} />} />
                            <Step id="login" render={({ next }) => (
                                <div>
                                    Registration finished! Proceed to <Link to="/login">Login</Link>
                                </div>
                            )}
                            />
                        </Steps>
                    </>
                )}
                />
                <div style={{ color: "#000", padding: 10, marginTop: 30 }}>
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
                            // <FormGroup label="Email (required)" labelFor="text-input">
                            //     <InputGroup
                            //         id="text-input"
                            //         name="orderNumber"
                            //         placeholder="Enter your email"
                            //         large
                            //         values={orderNumber}
                            //         onChange={e => setOrderNumber(e.target.value)}
                            //     />
                            // </FormGroup>
                            // <FormGroup label="Username (required)" labelFor="text-input">
                            //     <InputGroup
                            //         id="text-input"
                            //         name="orderNumber"
                            //         placeholder="Enter your username"
                            //         large
                            //         values={orderNumber}
                            //         onChange={e => setOrderNumber(e.target.value)}
                            //     />
                            // </FormGroup>
                            // <FormGroup label="Password (required)" labelFor="text-input">
                            //     <InputGroup
                            //         id="text-input"
                            //         name="orderNumber"
                            //         type="password"
                            //         placeholder="Enter your password"
                            //         large
                            //         values={orderNumber}
                            //         onChange={e => setOrderNumber(e.target.value)}
                            //     />
                            // </FormGroup>
            //             </div>
            //         </div>
            //     </div>
                // <div style={{ color: "#000", padding: 10 }}>
                //     Powered by <span style={{ fontWeight: 600 }}>Saigar Technologies</span> |{' '}
                //     <a href="https://saigar.io" target="_blank">
                //         saigar.io
                // </a>{' '}
                //     |{' '}
                //     <a href="https://twitter.com/@saigar_to" target="_blank">
                //         @saigar_to
                // </a>{' '}
                // </div>
            // </div>
*/


export default RegisterPage