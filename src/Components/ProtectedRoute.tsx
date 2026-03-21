import { Navigate, Outlet } from 'react-router-dom'
import { useAppContext } from '../Context/AppContext'

export default function ProtectedRoute() {
    const { isAuthenticated } = useAppContext()

    return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />
}
