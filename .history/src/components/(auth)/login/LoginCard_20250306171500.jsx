import { useState } from 'react';
import Loader from '../../../components/loader/Loader';

export default function LoginCard() {
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      window.location.href = '/dashboard'; // Example redirect
    }, 3000);
  };

  return (
    <>
      {/* Loader Overlay */}
      {loading && (
        <div className="flex justify-center items-center min-h-screen fixed top-0 left-0 right-0 bottom-0 bg-opacity-50 bg-gray-800 z-50">
          <Loader />
        </div>
      )}

      {/* Login Card */}
      <div
        className="w-full max-w-md p-8 rounded-lg shadow-lg"
        style={{
          background:
            'linear-gradient(140.06deg, rgba(89, 89, 89, 0.4) -3.08%, rgba(255, 255, 255, 0.4) 106.56%)',
          backdropFilter: 'blur(40px)',
        }}
      >
        {!loading && (
          <>
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Login</h2>

            <form>
              {/* Email Field */}
              <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium text-gray-600">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  placeholder="Enter your email"
                  className="mt-2 w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Password Field */}
              <div className="mb-6">
                <label htmlFor="password" className="block text-sm font-medium text-gray-600">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  placeholder="Enter your password"
                  className="mt-2 w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Login Button */}
              <button
                type="button"
                onClick={handleLogin}
                className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Login
              </button>
            </form>

            <p className="mt-4 text-center text-gray-600">
              Don't have an account?{' '}
              <a href="/register" className="text-blue-600 hover:underline">
                Register
              </a>
            </p>
          </>
        )}
      </div>
    </>
  );
}
