import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAppContext } from '../../Context/AppContext'
import { AuthCard } from '../../layouts/AuthLayout'

type RegisterFormData = {
    name: string
    email: string
    password: string
    password_confirmation: string
}

type RegisterErrors = Partial<Record<keyof RegisterFormData, string[]>>

export default function Register() {
    const { login } = useAppContext()
    const navigate = useNavigate()

    const [formData, setFormData] = useState<RegisterFormData>({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    })

    const [errors, setErrors] = useState<RegisterErrors>({})

    async function handleRegister(e: FormEvent<HTMLFormElement>) {
        e.preventDefault()

        const res = await fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
        })

        const data = await res.json()

        if (!res.ok) {
            setErrors(data.errors ?? {})
        } else {
            await login(data.token)
            navigate('/')
        }
    }

    return (
        <AuthCard title="Create an account">
            <form onSubmit={handleRegister} className="space-y-4">
                <div>
                    <input type="text" placeholder="Name" name="name" value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#504e6e]" />
                    {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name[0]}</p>}
                </div>
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
                <div>
                    <input type="password" placeholder="Confirm password" name="password_confirmation" value={formData.password_confirmation}
                        onChange={(e) => setFormData({ ...formData, password_confirmation: e.target.value })}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#504e6e]" />
                    {errors.password_confirmation && <p className="text-red-500 text-sm mt-1">{errors.password_confirmation[0]}</p>}
                </div>
                <button type="submit"
                    className="w-full rounded-md bg-[#504e6e] px-4 py-2 text-sm font-medium text-white hover:bg-[#3f3d57] focus:outline-none focus:ring-2 focus:ring-[#504e6e]">
                    Register
                </button>
                <p className="text-center text-sm text-gray-500">
                    Already have an account?{' '}
                    <Link to="/login" className="text-[#504e6e] hover:underline">Login</Link>
                </p>
            </form>
        </AuthCard>
    )
}