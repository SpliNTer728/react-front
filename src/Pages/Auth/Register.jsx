import { useState } from "react";


export default function Register() {

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    function handleRegister(e) {
        e.preventDefault();
        console.log(formData);
    }

    return (
        <>
            <h1 className="title">Register to your account</h1>
            <form onSubmit={handleRegister} className="w-1/2 mx-auto space-y-6">
                <div>
                    <input type="text" placeholder="username" name="username" value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })} />
                </div>
                <div>
                    <input type="email" placeholder="email" name="email" value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                </div>
                <div>
                    <input type="password" placeholder="password" name="password" value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
                </div>
                <div>
                    <input type="password" placeholder="confirmPassword" name="confirmPassword" value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })} />
                </div>
                <button type="submit" className="primary-btn">Register</button>
            </form>
        </>
    );
}