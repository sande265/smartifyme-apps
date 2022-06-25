/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef } from 'react';
import './snackbar.css';
import PropTypes from 'prop-types';
import { useState } from 'react';

interface SnackbarProps {
    type?: String | undefined;
    message?: String | number | undefined;
    duration?: number | undefined;
    open: boolean;
    closeAlert: Function;
}

const Snackbar: React.FC<SnackbarProps> = (props) => {
    let { type, message, duration, open, closeAlert } = props;

    console.log("open", open);
    

    const [showState, setShow] = useState<Boolean>(open)

    useEffect(() => {
        let timer1 = setTimeout(() => {
            closeSnackbar()
        }, duration ? duration : 3000);

        return () => {
            clearTimeout(timer1);
        };
    }, []);

    const closeSnackbar = () => {
        setShow(!showState)
        setTimeout(() => {
            closeAlert()
        }, 100)
    }

    const onClickOutside = (ref: any) => {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useEffect(() => {
            function handleClickOutside(event: any) {
                if (ref.current && !ref.current.contains(event.target)) {
                    closeAlert()
                }
            }
            document.addEventListener("mousedown", handleClickOutside);
            return () => {
                document.removeEventListener("mousedown", handleClickOutside);
            };
        }, [ref]);
    }

    const wrapperRef = useRef(null);
    onClickOutside(wrapperRef);

    return <div className="snackbar-container">
        <div className="snackbar-wrapper">
            <div ref={wrapperRef} className={`snackbars alert-with-icon alert alert-dismissible show ${showState ? 'fadeIn' : 'fadeOut'} fade alert-${getAlertType(type)}`} role="alert">
                <button type="button" className="close" aria-label="Close" onClick={() => {
                    closeSnackbar()
                }}>
                    <span aria-hidden="true">×</span>
                </button>
                <span data-notify="icon" className={`${getIconType(type)}`}></span>
                <span>{message}</span>
            </div>
        </div>
    </div>
}

const getAlertType = (type: String | undefined) => {
    switch (type) {
        case "success":
            return "success";
        case "error":
            return "danger";
        case "warning":
            return "warning"
        default:
            return "info"
    }
}

const getIconType = (type: String | undefined) => {
    switch (type) {
        case "success":
            return "ri-checkbox-circle-line";
        case "error":
            return "ri-error-warning-line";
        case "warning":
            return "ri-alert-line"
        default:
            return "ri-indeterminate-circle-line"
    }
}

Snackbar.propTypes = {
    type: PropTypes.string.isRequired,
    message: PropTypes.string.isRequired,
    duration: PropTypes.number,
    open: PropTypes.bool.isRequired,
    closeAlert: PropTypes.func.isRequired
};

export { Snackbar }
export default Snackbar;