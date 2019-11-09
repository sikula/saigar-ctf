import React from 'react'

const LoginPage = () => (
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
                    height: '640px',
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
                        borderRadius: '8px',
                        paddingTop: 10,
                        paddingBottom: 10,
                    }}
                >
                    <h2 style={{ fontWeight: 500 }}>Login to <span style={{ fontWeight: 600 }}>Saigar CE</span></h2>
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

export default LoginPage