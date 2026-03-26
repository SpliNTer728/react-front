import { Link, Outlet, useNavigate } from 'react-router-dom'
import { useAppContext } from '../Context/AppContext'

export default function AppLayout() {
    const { user, logout } = useAppContext()
    const navigate = useNavigate()

    async function handleLogout() {
        await logout()
        navigate('/login')
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white border-b border-gray-200">
                <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
                    <Link to="/" className="text-lg font-semibold text-[#504e6e]">
                        Swen
                    </Link>
                    <Link to="/reserver" className="text-sm text-gray-600 hover:text-gray-900">
                        Réserver
                    </Link>
                    <div className="flex items-center gap-4">
                        {user && (
                            <span className="text-sm text-gray-500">{user.name}</span>
                        )}
                        <button
                            onClick={handleLogout}
                            className="text-sm text-gray-600 hover:text-gray-900"
                        >
                            Logout
                        </button>
                    </div>
                </nav>
            </header>

            <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
                <Outlet />
            </main>
        </div>
    )
}
