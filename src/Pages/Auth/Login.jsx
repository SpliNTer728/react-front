import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../../Context/AppContext";


export default function Login() {

    const { setToken } = useContext(AppContext);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const [errors, setErrors] = useState({});

    async function handleLogin(e) {
        e.preventDefault();

        const res = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const data = await res.json();


        if (data.errors || !res.ok) {
            setErrors(data.errors);
        } else {
            localStorage.setItem('token', data.token);
            setToken(data.token);
            navigate('/');
        }

    }

    return (
        <>
            <h1 className="title">Login to your account</h1>
            <form onSubmit={handleLogin} className="w-1/2 mx-auto space-y-6">
                <div>
                    <input type="email" placeholder="email" name="email" value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>
                <div>
                    <input type="password" placeholder="password" name="password" value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
                    {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                </div>
                <button type="submit" className="primary-btn">Login</button>
            </form>
        </>
    );
}