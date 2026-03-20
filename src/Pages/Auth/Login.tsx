import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppContext } from '../../Context/AppContext'

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
        <>
            <h1 className="title">Login to your account</h1>
            <form onSubmit={handleLogin} className="w-1/2 mx-auto space-y-6">
                <div>
                    <input type="email" placeholder="Email" name="email" value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email[0]}</p>}
                </div>
                <div>
                    <input type="password" placeholder="Password" name="password" value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
                    {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password[0]}</p>}
                </div>
                {errors.general && <p className="text-red-500 text-sm">{errors.general[0]}</p>}
                <button type="submit" className="primary-btn">Login</button>
            </form>
        </>
    )
}