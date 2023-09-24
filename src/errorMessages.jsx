import { faWindowClose } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

const ErrorMessageContext = createContext({ errors: [], clearErrors() { }, addError(error) { }, removeError(errorID) { } });

export default function ErrorMessageProvider({ children }) {
    const [errors, setErrors] = useState([]);

    const value = useMemo(() => ({
        errors,
        addError(error) {
            const getErrorID = () => {
                let id = 0;
                do {
                    id = Math.floor(Math.random() * 1024);
                }
                while (errors.find(error => error.id === id));
                return id;
            }
            setErrors([...errors, {
                id: getErrorID(),
                error
            }]);
        },
        clearErrors() {
            setErrors([]);
        },
        removeError(errorID) {
            setErrors(errors.filter(error => error.id !== errorID));
        }
    }), [errors]);

    return <ErrorMessageContext.Provider value={value}>
        {children}
    </ErrorMessageContext.Provider>
}

export function ErrorMessages() {
    const { errors, addError, removeError, clearErrors } = useContext(ErrorMessageContext);

    useEffect(() => {
        const onError = (e) => {
            addError(e.reason);
        }
        window.addEventListener('unhandledrejection', onError);

        return () => {
            window.removeEventListener('unhandledrejection', onError);
        }
    }, [errors]);

    return (<>
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 9999 }}>
            <div className="flex-column flex-center gap-xs">
                {errors.map(error => (
                    <ErrorMessage key={error.id} error={error} removeError={removeError} />
                ))}
                {errors.length > 1 && <button onClick={clearErrors}>Clear Errors</button>}
            </div>
            {/* <button onClick={() => addError("Lorem ipsum dolor sit, amet consectetur adipisicing elit. Sint officia cumque quod consectetur voluptatum blanditiis?")}>Add Error</button> */}
        </div>
    </>);
}

function ErrorMessage({ error, removeError }) {
    const err = error.error;
    const { heading, message, backgroundColor } = (() => {
        let heading = 'Error!';
        let message = err;
        let backgroundColor = 'bg-red-200';
        if (typeof err === 'object' && err) {
            if (err instanceof Error) {
                if (err.name) {
                    heading = err.name;
                }

                if (import.meta.env.DEV) {
                    message = err.stack.includes(err.message) ? err.stack : `${err.message}\n${err.stack}`
                } else {
                    message = err.message;
                }
                return { heading, message };
            }

            if ('message' in err) {
                message = err.message;
                //TODO: show hint, detail from supabase error
            }

            switch (err.level) {
                case 'warn':
                    heading = `Warning`;
                    backgroundColor = 'bg-orange-400';
                default: {
                    if ('statusCode' in err) {
                        heading = `HTTP ${err.statusCode} Error`;
                    }
                    else if ('code' in err) {
                        heading = `${err.code} Error`;
                    }
                }
            }
        }
        if (typeof message !== 'string') {
            message = JSON.stringify(message);
        }
        return { heading, message, backgroundColor };
    })()

    return (<>
        <div className={backgroundColor} style={{ maxWidth: '40%', padding: '.75em', boxShadow: '1px 1px 7px 1px rgba(0, 0, 0, 1)' }}>
            <button onClick={() => removeError(error.id)} style={{ float: 'right' }}>
                <FontAwesomeIcon icon={faWindowClose} />
            </button>
            <h4>{heading}</h4>
            <p>{message}</p>
        </div>
    </>)
}