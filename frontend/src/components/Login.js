import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import { MessageSquare, LogIn } from 'lucide-react';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await login(username, password);
    
    if (result.success) {
      toast.success('Login successful!');
    } else {
      toast.error(result.error);
    }
    
    setLoading(false);
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)'
    }}>
      <div className="card" style={{ width: '400px', margin: '20px' }}>
        <div className="text-center mb-20">
          <MessageSquare size={48} color="#25D366" style={{ marginBottom: '10px' }} />
          <h2>WhatsApp Bot Manager</h2>
          <p style={{ color: '#666', marginTop: '10px' }}>
            Sign in to manage your WhatsApp bot
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="Enter your username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
            />
          </div>

          <button 
            type="submit" 
            className="btn" 
            disabled={loading}
            style={{ width: '100%', marginTop: '10px' }}
          >
            {loading ? 'Signing in...' : (
              <>
                <LogIn size={16} style={{ marginRight: '8px' }} />
                Sign In
              </>
            )}
          </button>
        </form>

        <div className="text-center mt-20">
          <p style={{ color: '#666' }}>
            Don't have an account?{' '}
            <Link 
              to="/register" 
              style={{ color: '#25D366', textDecoration: 'none' }}
            >
              Sign up here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
