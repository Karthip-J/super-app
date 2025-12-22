import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { authService } from "../../services/authService";
import logo from "../../assets/img/logo/android-chrome-512x512.png";
import API_CONFIG from "../../config/api.config";
import { useTheme } from "../../contexts/ThemeContext";
import { RiMoonFill, RiSunFill } from "react-icons/ri";

export default function SignIn() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const { toggleTheme, isDark } = useTheme();
  
  const validationSchema = Yup.object({
    email: Yup.string()
      .email("Please enter a valid email address")
      .required("Email is required"),
    password: Yup.string()
      .min(6, "Password must be at least 6 characters")
      .required("Password is required"),
  });

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(validationSchema),
  });

  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignIn = async (data) => {
    setLoading(true);
    setServerError("");

    try {
      console.log('Starting login process...');
      const response = await authService.login(data);
      
      console.log('Login response:', response);
      
      if (response.success) {
        console.log('Login successful, checking token storage...');
        
        // Check if token was stored
        const storedToken = localStorage.getItem(API_CONFIG.STORAGE_KEYS.AUTH_TOKEN);
        const storedUser = localStorage.getItem(API_CONFIG.STORAGE_KEYS.USER_DATA);
        const storedExpiration = localStorage.getItem(API_CONFIG.STORAGE_KEYS.TOKEN_EXPIRATION);
        
        console.log('Stored token:', storedToken ? 'Present' : 'Missing');
        console.log('Stored user:', storedUser ? 'Present' : 'Missing');
        console.log('Stored expiration:', storedExpiration);
        
        // Check if there's a saved redirect URL
        const redirectUrl = sessionStorage.getItem('redirectUrl');
        sessionStorage.removeItem('redirectUrl'); // Clear it after use
        
        const targetUrl = redirectUrl || API_CONFIG.ROUTES.DASHBOARD;
        console.log('Target URL:', targetUrl);
        console.log('About to navigate to:', targetUrl);
        
        // Navigate to the saved URL or default dashboard
        navigate(targetUrl);
      } else {
        console.log('Login failed:', response.message);
        setServerError(response.message || "Login failed. Please try again.");
      }
    } catch (error) {
      console.error('Login error:', error);
      setServerError(
        error.message || 
        "An error occurred while trying to sign in. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div 
      className="flex min-h-screen transition-colors duration-300"
      style={{ backgroundColor: 'var(--bg-primary)' }}
    >
      {/* Theme Toggle Button */}
      <button
        onClick={toggleTheme}
        className="fixed bottom-[30px] right-[35px] z-[99] flex h-[60px] w-[60px] items-center justify-center rounded-full border border-purple-500 bg-gradient-to-br from-purple-600 to-blue-500 p-0 shadow-lg hover:shadow-xl transition-all duration-300"
        aria-label="Toggle theme"
      >
        {isDark ? (
          <RiSunFill className="h-5 w-5 text-white" />
        ) : (
          <RiMoonFill className="h-5 w-5 text-white" />
        )}
      </button>

      {/* Left side - Login Form */}
      <div 
        className="w-full md:w-1/2 flex flex-col justify-center items-center p-8 transition-colors duration-300"
        style={{ backgroundColor: 'var(--bg-primary)' }}
      >
        <div className="w-full max-w-md">
          <div className="flex justify-center mb-8">
            <img src={logo} alt="Logo" className="h-16 w-auto" />
          </div>
          
          <h1 
            className="text-3xl font-bold text-center mb-2 transition-colors duration-300"
            style={{ color: 'var(--text-primary)' }}
          >
            Sign In
          </h1>
          <p 
            className="text-center mb-8 transition-colors duration-300"
            style={{ color: 'var(--text-secondary)' }}
          >
            Enter your email and password to sign in!
          </p>

          <form onSubmit={handleSubmit(handleSignIn)} className="space-y-6">
            <div>
              <label 
                className="block text-sm font-medium mb-1 transition-colors duration-300"
                style={{ color: 'var(--text-primary)' }}
              >
                Email*
              </label>
              <input
                type="email"
                {...register("email")}
                className={`w-full px-4 py-3 rounded-lg border transition-colors duration-300 ${
                  errors.email ? 'border-red-500' : ''
                } focus:outline-none focus:ring-2 focus:ring-purple-600 dark:focus:ring-purple-400`}
                style={{
                  backgroundColor: 'var(--bg-input)',
                  color: 'var(--text-primary)',
                  borderColor: errors.email ? '#ef4444' : 'var(--border-color)'
                }}
                placeholder="Enter your email"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label 
                className="block text-sm font-medium mb-1 transition-colors duration-300"
                style={{ color: 'var(--text-primary)' }}
              >
                Password*
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  {...register("password")}
                  className={`w-full px-4 py-3 pr-12 rounded-lg border transition-colors duration-300 ${
                    errors.password ? 'border-red-500' : ''
                  } focus:outline-none focus:ring-2 focus:ring-purple-600 dark:focus:ring-purple-400`}
                  style={{
                    backgroundColor: 'var(--bg-input)',
                    color: 'var(--text-primary)',
                    borderColor: errors.password ? '#ef4444' : 'var(--border-color)'
                  }}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center transition-colors duration-300 focus:outline-none"
                  style={{ color: 'var(--text-muted)' }}
                  onMouseEnter={(e) => e.target.style.color = 'var(--text-secondary)'}
                  onMouseLeave={(e) => e.target.style.color = 'var(--text-muted)'}
                >
                  {showPassword ? (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password.message}</p>
              )}
            </div>

            {serverError && (
              <div className="p-4 rounded-lg text-sm transition-colors duration-300 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800">
                {serverError}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 rounded-lg text-white text-lg font-medium 
                bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2
                ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Signing in...
                </div>
              ) : (
                'Sign In'
              )}
            </button>

            <div className="text-center mt-4">
              <p 
                className="text-sm transition-colors duration-300"
                style={{ color: 'var(--text-secondary)' }}
              >
                Don't have an account?{" "}
                <Link 
                  to={API_CONFIG.ROUTES.SIGNUP} 
                  className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium transition-colors duration-300"
                >
                  Sign Up
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>

      {/* Right side - Background Image/Design */}
      <div className="hidden md:block md:w-1/2 bg-gradient-to-br from-purple-600 to-blue-500">
        <div className="h-full flex flex-col justify-center items-center text-white p-12">
          <div className="text-center">
            <h2 className="text-4xl font-bold mb-4">Welcome Back!</h2>
            <p className="text-lg mb-8">Sign in to access your admin dashboard</p>
          </div>
        </div>
      </div>
    </div>
  );
}
