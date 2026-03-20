import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppContext } from '../../Context/AppContext'

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
        <>
            <h1 className="title">Register to your account</h1>
            <form onSubmit={handleRegister} className="w-1/2 mx-auto space-y-6">
                <div>
                    <input type="text" placeholder="Name" name="name" value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                    {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name[0]}</p>}
                </div>
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
                <div>
                    <input type="password" placeholder="Confirm password" name="password_confirmation" value={formData.password_confirmation}
                        onChange={(e) => setFormData({ ...formData, password_confirmation: e.target.value })} />
                    {errors.password_confirmation && <p className="text-red-500 text-sm mt-1">{errors.password_confirmation[0]}</p>}
                </div>
                <button type="submit" className="primary-btn">Register</button>
            </form>
        </>
    )
}