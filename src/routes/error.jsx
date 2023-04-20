import { useRouteError } from "react-router-dom";

export default function ErrorPage() {
    try {
        const error = useRouteError();
        console.error(error);

        return (
            <div id="error-page">
                <h1>Oops!</h1>
                <p>Sorry, an unexpected error has occurred.</p>
                <p>
                    <i>{error.statusText || error.message}</i>
                </p>
            </div>
        );
    } catch (error) {
        console.error(error);
        return (
            <div id="error-page">
                <h1>Oops!</h1>
                <p>Could not get Route Error</p>
                <p>
                    <i>{error != null ? error.toString() : "Unknown error!"}</i>
                </p>
            </div>
        );
    }
}