import { BrowserRouter, Routes, Route } from 'react-router-dom'
import AppLayout from './layouts/AppLayout'
import AuthLayout from './layouts/AuthLayout'
import SchedulerLayout from './layouts/SchedulerLayout'
import GuestRoute from './Components/GuestRoute'
import ProtectedRoute from './Components/ProtectedRoute'
import Home from './Pages/Home'
import Login from './Pages/Auth/Login'
import Register from './Pages/Auth/Register'
import Scheduler from './Pages/Scheduler'
import BookingSuccess from './Pages/BookingSuccess'
import Bundles from './Pages/Bundles'

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Public pages — accessible to everyone */}
                <Route element={<AppLayout />}>
                    <Route path="/" element={<Home />} />
                </Route>

                {/* Scheduler — authenticated users only, full-width dark layout */}
                <Route element={<ProtectedRoute />}>
                    <Route element={<SchedulerLayout />}>
                        <Route path="/reserver" element={<Scheduler />} />
                        <Route path="/reserver/succes" element={<BookingSuccess />} />
                        <Route path="/formules" element={<Bundles />} />
                    </Route>
                </Route>

                {/* Guest-only pages — uses the centered auth card shell */}
                <Route element={<GuestRoute />}>
                    <Route element={<AuthLayout />}>
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                    </Route>
                </Route>
            </Routes>
        </BrowserRouter>
    )
}
