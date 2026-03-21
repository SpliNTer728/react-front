import { BrowserRouter, Routes, Route } from 'react-router-dom'
import AppLayout from './layouts/AppLayout'
import AuthLayout from './layouts/AuthLayout'
import GuestRoute from './Components/GuestRoute'
import Home from './Pages/Home'
import Login from './Pages/Auth/Login'
import Register from './Pages/Auth/Register'

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Public pages — accessible to everyone */}
                <Route element={<AppLayout />}>
                    <Route path="/" element={<Home />} />
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
