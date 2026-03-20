import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../../Context/AppContext";


export default function Register() {

    const {setToken} = useContext(AppContext);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const [errors, setErrors] = useState({});

    async function handleRegister(e) {
        e.preventDefault();

        const res = await fetch('/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const data = await res.json();
        
        if (data.errors || !res.ok) {
            setErrors(data.errors);
        }else{
            localStorage.setItem('token', data.token);
            setToken(data.token);
            navigate('/');
            console.log(data);
        }
        
    }

    return (
        <>
            <h1 className="title">Register to your account</h1>
            <form onSubmit={handleRegister} className="w-1/2 mx-auto space-y-6">
                <div>
                    <input type="text" placeholder="name" name="name" value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                </div>
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
                <div>
                    <input type="password" placeholder="password confirmation" name="password_confirmation" value={formData.password_confirmation}
                        onChange={(e) => setFormData({ ...formData, password_confirmation: e.target.value })} />
                        {errors.password_confirmation && <p className="text-red-500 text-sm mt-1">{errors.password_confirmation}</p>}
                </div>
                <button type="submit" className="primary-btn">Register</button>
            </form>
        </>
    );
}