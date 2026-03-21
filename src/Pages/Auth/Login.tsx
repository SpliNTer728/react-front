import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAppContext } from '../../Context/AppContext'
import { AuthCard } from '../../layouts/AuthLayout'

type LoginFormData = {
    email: string
    password: string
}

type LoginErrors = Partial<Record<keyof LoginFormData | 'general', string[]>>

export default function Login() {
    const { login } = useAppContext()
    const navigate = useNavigate()

    const [formData, setFormData] = useState<LoginFormData>({
        email: '',
        password: '',
    })

    const [errors, setErrors] = useState<LoginErrors>({})

    async function handleLogin(e: FormEvent<HTMLFormElement>) {
        e.preventDefault()

        const res = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
        })

        const data = await res.json()

        if (!res.ok) {
            setErrors(data.errors ?? { general: [data.message ?? 'Login failed'] })
        } else {
            await login(data.token)
            navigate('/')
        }
    }

    return (
        <AuthCard title="Login to your account">
            <div className="flex flex-col gap-3 mb-2">
                <button type="button" className="w-full flex items-center justify-center gap-2 border border-gray-200 rounded-lg py-3 px-4 font-semibold text-gray-700 bg-white hover:bg-gray-50 transition text-sm">
                    <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
                    Continue with Google
                </button>
                <button type="button" className="w-full flex items-center justify-center gap-2 border border-gray-200 rounded-lg py-3 px-4 font-semibold text-gray-700 bg-white hover:bg-gray-50 transition text-sm">
                    <img src="https://www.svgrepo.com/show/512120/facebook-176.svg" alt="Facebook" className="w-5 h-5" />
                    Continue with Facebook
                </button>
            </div>

            <div className="flex items-center gap-3 my-4">
                <div className="flex-grow border-t border-gray-200"></div>
                <span className="text-gray-400 text-sm">Or continue with email</span>
                <div className="flex-grow border-t border-gray-200"></div>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
                <div>
                    <input type="email" placeholder="Email" name="email" value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#504e6e]" />
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email[0]}</p>}
                </div>
                <div>
                    <input type="password" placeholder="Password" name="password" value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#504e6e]" />
                    {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password[0]}</p>}
                </div>
                {errors.general && <p className="text-red-500 text-sm">{errors.general[0]}</p>}
                <button type="submit"
                    className="w-full rounded-md bg-[#504e6e] px-4 py-2 text-sm font-medium text-white hover:bg-[#3f3d57] focus:outline-none focus:ring-2 focus:ring-[#504e6e]">
                    Login
                </button>
                <p className="text-center text-sm text-gray-500">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-[#504e6e] hover:underline">Register</Link>
                </p>
            </form>
        </AuthCard>
    )
}