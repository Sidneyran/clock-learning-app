import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const authContext = useContext(AuthContext);

  const handleLogin = async () => {
    if (!email || !password) {
      alert("Please enter both email and password.");
      return;
    }

    try {
      const res = await fetch('http://localhost:5050/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      console.log('Login response:', res.status, data);
      if (res.ok && data.token) {
        if (authContext && authContext.setAuthData) {
          authContext.setAuthData(data); // 设置登录状态
          localStorage.setItem('user', JSON.stringify(data.user || {}));
          localStorage.setItem('token', data.token);
        } else {
          console.error('setAuthData is not available in AuthContext');
          alert('Something went wrong: AuthContext misconfigured.');
          return;
        }
        alert('Login successful!');
        navigate('/home'); // Redirect to homepage
      } else {
        alert(data.message || 'Login failed');
      }
    } catch (err) {
      console.error(err);
      alert(`Something went wrong: ${err.message}`);
    }
  };

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen bg-cover bg-center"
      style={{ backgroundImage: "url('/assets/login.jpg')" }}
    >
      <div className="bg-white p-8 rounded shadow-md w-96 space-y-4">
        <h2 className="text-2xl font-bold text-center text-blue-700">👋 Welcome Back! Please Login</h2>
        <p className="text-center text-sm text-gray-600">
          Enter your credentials to access your personalized learning dashboard.
        </p>
        <input
          className="w-full border px-4 py-2 rounded"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="w-full border px-4 py-2 rounded"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          onClick={handleLogin}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Login
        </button>
        <div className="text-center pt-4">
          <Link to="/" className="text-blue-500 hover:underline text-sm">← Back to Home</Link>
          <p className="text-sm mt-2">
            Don't have an account? <Link to="/register" className="text-blue-600 underline">Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;