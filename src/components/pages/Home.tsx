/* eslint-disable react-hooks/exhaustive-deps */
import React, { SyntheticEvent, useEffect, useReducer, useState } from "react";
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import { Modal, Button, Form } from 'react-bootstrap';
import { Snackbar } from "../shared";

const Home: React.FC<{}> = () => {

    const location = useLocation();

    const config = {
        baseUrl: process.env.REACT_APP_BASE_URL,
    }

    const snackbarReducer = (state: any, action: any) => {
        switch(action.type) {
            case "SUCCESS":
                return { ...state, type: "success", open: action.open, message: action.message };
            case "ERROR":
                return { ...state, type: "error", open: action.open, message: action.message };
            case "WARNING":
                return { ...state, type: "warning", open: action.open, message: action.message };
            case "CLOSE":
                return { ...state, open: action.open, type: "", message: "" };
            default:
                return state;
        }
    }

    const [state, setState] = useState<any>({
        data: {
            led: 0,
        },
        devices: []
    })
    const [isConnected, setConnected] = useState<Boolean>(false);
    const [device, setDevice] = useState<String>('');
    const [modalOpen, setModalOpen] = useState<any>(true);
    const [theme, setTheme] = useState<string>("dark");
    // const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
    // const [message, setMessage] = useState<string|number|undefined>("");
    const [snackbar, dispatch] = useReducer(snackbarReducer, { type: "", message: "", open: false });

    useEffect(() => {
        getAllClients()
    }, [])

    useEffect(() => {
        if (device) {
            checkAndSetData();
        }
    }, [device])

    // useEffect(() => {
    //     let retrys: number = 0;
    //     const interval = setInterval(() => {
    //         if (device && retrys <= 5) {
    //             getAllClients();
    //             checkAndSetData();
    //             ++retrys;
    //         }
    //     }, 10000);
    //     return () => clearInterval(interval);
    // }, [device])

    const toggleSnackbar: Function = (type: string, message: string) => {
        dispatch({ type: type.toUpperCase(), message: message, open: true })
    }

    const checkAndSetData: VoidFunction = () => {
        if (state?.devices?.includes(device)) {
            setConnected(true);
        } else {
            setConnected(false)
        }
        fetchData()
    }

    const fetchData: VoidFunction = () => {
        axios.get(`${config.baseUrl}/api/client?device=${device}`).then(
            (res: any) => {
                if (res?.status === 200) {
                    if (state.data !== res?.data?.data) {
                        setState({ ...state, data: res?.data?.data })
                    }
                } else {
                    setState({ ...state, data: {} })
                    toggleSnackbar("error", "Failed to fetch data");
                }
            }
        ).catch(({ response: { data } }) => {
            setConnected(false)
            toggleSnackbar("error", data?.message);
            setState({ ...state, data: {}, devices: [] })
        })
    }

    const getAllClients: VoidFunction = () => {
        axios.get(`${config.baseUrl}/api/clients`).then(
            (res: any) => {
                if (res?.status === 200) {
                    setState({ ...state, devices: res?.data?.clients })
                } else {
                    setState({ ...state, data: {} })
                    toggleSnackbar("error", "Failed to fetch devices data")
                }
            }
        ).catch(({ response: { data } }) => {
            toggleSnackbar("error", data?.message);
        })
    }

    const notifyClient: Function = (type: String) => {
        axios.post(`${config.baseUrl}/api/notify-client`, { device: device, payload: type }).then(
            (res: any) => {
                if (res?.status === 200) {
                    toggleSnackbar("success", res?.data?.data?.message);
                    fetchData()
                } else {
                    toggleSnackbar("error",res?.data?.message)
                }
            }
        ).catch(({ response: { data } }) => {
            toggleSnackbar("error",data?.message);
        })
    }

    const handleChange = (e: SyntheticEvent) => {
        let { value }: any | undefined = e.target;
        setDevice(value);
    }

    const closeSnackbar = () => {
        dispatch({ type: "CLOSE", open: false });
    }

    let { data } = state;

    return (
        <div className={theme}>
            {(snackbar.type === "success" || snackbar.type === "error" || snackbar.type === "warning") && 
            <Snackbar 
                type={snackbar.type}
                open={snackbar.open} 
                message={snackbar.message}
                closeAlert={() => closeSnackbar()}  
                duration={6000}
            />}
            {!device &&
                <Modal
                    show={modalOpen}
                    size="sm"
                    aria-labelledby="contained-modal-title-vcenter"
                    centered
                >
                    <Modal.Header closeButton onClick={() => setModalOpen(false)}>
                        <Modal.Title id="contained-modal-title-vcenter">
                            Select Device
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form.Select aria-label="Device select Option" value={device} onChange={handleChange}>
                            <option>Please Select Device</option>
                            {state?.devices?.map((device: any, idx: number) => {
                                return <option key={idx} value={device}>{device}</option>
                            })}
                        </Form.Select>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button onClick={() => setModalOpen(false)}>Close</Button>
                    </Modal.Footer>
                </Modal>
            }
            <div className="container">
                <header className="header">
                    <div className="brand">
                        SmartifyMe
                    </div>
                    <ul className="header-item">
                        <li>Information</li>
                    </ul>
                    <label className="switch">
                        <input onClick={() => {
                            if (theme === 'light') setTheme('dark')
                            else setTheme("light")
                        }} type="checkbox" />
                        <span className="slider round"></span>
                    </label>
                </header>
                <div className="body">
                    <section className="section-information" id="information">
                        <h4 id="conn-info">Device & Network Information</h4>
                        <div className="status">
                            <span>Status: </span>
                            <span className={isConnected ? "active" : "inactive"}>{isConnected ? "Connected!" : "Not Connected!"}</span>
                        </div>
                        <div className="status">
                            <span>Signal Strength: </span>
                            <span className={parseInt(data?.power) >= -60.0 ? "active" : parseInt(data?.power) >= -67.0 ? "poor" : "inactive"}>
                                {((): any => {
                                    var power = parseFloat(data?.power);
                                    if (power >= -30.0) {
                                        return "Excellent"
                                    } else if (power >= -60.0) {
                                        return "Good"
                                    } else if (power >= -67.0) {
                                        return "OK"
                                    } else if (power >= -70.0) {
                                        return "Weak"
                                    } else if (power >= -80.0) {
                                        return "Very Weak"
                                    } else if (power >= -90.0) {
                                        return "bad"
                                    }
                                })()}
                            </span>
                        </div>
                        <div className="status">
                            <span>IP Address: </span>
                            <span>{data.client_ip}</span>
                        </div>
                        <div className="status">
                            <span>Mac Address: </span>
                            <span>{data.mac_address}</span>
                        </div>
                        <div className="status">
                            <span>Device ID: </span>
                            <span>{data.device_id}</span>
                        </div>
                        <div className="status">
                            <span>Water Level: </span>
                            <span>{data.w_percent ? data.w_percent * 1 === parseFloat(data.w_percent) && `${data.w_percent}%` : "NA"}</span>
                        </div>
                    </section>
                    {isConnected && <section className="section-information" id="information">
                        <h4 id="conn-info">Device State</h4>
                        <div className="status">
                            <span>LED State: </span>
                            <span className={data?.ledState * 1 === 1 ? "active" : "inactive"}>{data?.ledState * 1 === 1 ? "ON" : "OFF"}</span>
                        </div>
                        <h5>Actions</h5>
                        <div className="">
                            <button className="buttons me-2" onClick={() => notifyClient("switch-on")}>Turn ON</button>
                            <button className="buttons" onClick={() => notifyClient("switch-off")}>Turn OFF</button>
                        </div>
                    </section>}
                    <footer className="footer">
                        Copyright &copy; Sandesh Singh, SmartifyMe 2022
                    </footer>
                </div>
            </div>
        </div>
    )
}

export default Home;