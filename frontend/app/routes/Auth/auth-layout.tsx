import React from 'react'

import {Outlet} from "react-router";

const AuthLayout = () => {
    return (
        <div className="admin-layout">

            <aside className="children">
                <Outlet />
            </aside>
        </div>
    )
}
export default AuthLayout
