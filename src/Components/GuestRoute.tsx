import { Navigate, Outlet } from 'react-router-dom'
import { useAppContext } from '../Context/AppContext'

export default function GuestRoute() {
    const { isAuthenticated } = useAppContext()

    return isAuthenticated ? <Navigate to="/reserver" replace /> : <Outlet />
}
