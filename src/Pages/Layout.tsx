import { Link, Outlet } from 'react-router-dom'
import { useAppContext } from '../Context/AppContext'

export default function Layout() {
    const { user } = useAppContext()

    return (
        <>
            <header>
                <nav>
                    <Link to="/" className="nav-link">Home</Link>
                    {user ? (
                        <div className="space-x-4">
                            <p className="text-slate-400 text-xs">Welcome, {user.name}!</p>
                        </div>
                    ) : (
                        <div className="space-x-4">
                            <Link to="/login" className="nav-link">Login</Link>
                            <Link to="/register" className="nav-link">Register</Link>
                        </div>
                    )}
                </nav>
            </header>
            <main>
                <Outlet />
            </main>
        </>
    )
}