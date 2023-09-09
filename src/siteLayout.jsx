import { Outlet } from "react-router-dom";
import ErrorMessageProvider, { ErrorMessages } from "~/errorMessages";

/**
 * Top level component of react router
 * @returns React Element that wraps all routes on the site (eg. Outlet = /*)
 */
export default function SiteLayout() {
    return (<>
        <ErrorMessageProvider>
            <ErrorMessages />
            <Outlet />
        </ErrorMessageProvider>
    </>)
}