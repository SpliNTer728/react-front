import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAppContext } from '@/Context/AppContext';

/**
 * Layout for the scheduler — shares the same nav header as AppLayout
 * but renders the Outlet without any max-width / padding constraint,
 * so the scheduler can manage its own full-width dark background.
 */
export default function SchedulerLayout() {
    const { user, logout } = useAppContext();
    const navigate = useNavigate();

    async function handleLogout() {
        await logout();
        navigate('/login');
    }

    return (
        <div className="min-h-screen flex flex-col">
            <header className="border-b border-slate-700 shrink-0" style={{ background: 'rgba(2,6,23,0.95)', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 50 }}>
                <nav className="max-w-[1280px] mx-auto px-5 flex h-14 items-center justify-between">
                    <div className="flex items-center gap-6">
                        <Link to="/" className="text-base font-semibold" style={{ color: '#38bdf8' }}>
                            Swen
                        </Link>
                        <Link to="/reserver" className="text-sm text-slate-400 hover:text-slate-200 transition-colors">
                            Réserver
                        </Link>
                    </div>
                    <div className="flex items-center gap-4">
                        {user && (
                            <span className="text-sm text-slate-500">{user.name}</span>
                        )}
                        <button
                            onClick={handleLogout}
                            className="text-sm text-slate-500 hover:text-slate-200 transition-colors cursor-pointer bg-transparent border-0"
                        >
                            Déconnexion
                        </button>
                    </div>
                </nav>
            </header>

            <Outlet />
        </div>
    );
}
