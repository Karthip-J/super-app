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

export default function SignUp() {
  const navigate = useNavigate();
  const { toggleTheme, isDark } = useTheme();
  const validationSchema = Yup.object({
    name: Yup.string()
      .required("Name is required")
      .min(2, "Name must be at least 2 characters"),
    email: Yup.string()
      .email("Please enter a valid email address")
      .required("Email is required"),
    password: Yup.string()
      .min(6, "Password must be at least 6 characters")
      .required("Password is required"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password'), null], 'Passwords must match')
      .required('Please confirm your password'),
  });

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(validationSchema),
  });

  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignUp = async (data) => {
    setLoading(true);
    setServerError("");

    try {
      const response = await authService.register({
        name: data.name,
        email: data.email,
        password: data.password
      });
      
      if (response.success) {
        navigate(API_CONFIG.ROUTES.LOGIN);
      } else {
        setServerError(response.message || "Registration failed. Please try again.");
      }
    } catch (error) {
      console.error('Registration error:', error);
      setServerError(
        error.message || 
        "An error occurred while trying to register. Please try again."
      );
    } finally {
      setLoading(false);
    }
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

      {/* Left side - Registration Form */}
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
            Sign Up
          </h1>
          <p 
            className="text-center mb-8 transition-colors duration-300"
            style={{ color: 'var(--text-secondary)' }}
          >
            Create your account to get started!
          </p>

          <form onSubmit={handleSubmit(handleSignUp)} className="space-y-6">
            <div>
              <label 
                className="block text-sm font-medium mb-1 transition-colors duration-300"
                style={{ color: 'var(--text-primary)' }}
              >
                Name*
              </label>
              <input
                type="text"
                {...register("name")}
                className={`w-full px-4 py-3 rounded-lg border transition-colors duration-300 ${
                  errors.name ? 'border-red-500' : ''
                } focus:outline-none focus:ring-2 focus:ring-purple-600 dark:focus:ring-purple-400`}
                style={{
                  backgroundColor: 'var(--bg-input)',
                  color: 'var(--text-primary)',
                  borderColor: errors.name ? '#ef4444' : 'var(--border-color)'
                }}
                placeholder="Enter your name"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name.message}</p>
              )}
            </div>

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
              <input
                type="password"
                {...register("password")}
                className={`w-full px-4 py-3 rounded-lg border transition-colors duration-300 ${
                  errors.password ? 'border-red-500' : ''
                } focus:outline-none focus:ring-2 focus:ring-purple-600 dark:focus:ring-purple-400`}
                style={{
                  backgroundColor: 'var(--bg-input)',
                  color: 'var(--text-primary)',
                  borderColor: errors.password ? '#ef4444' : 'var(--border-color)'
                }}
                placeholder="Enter your password"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label 
                className="block text-sm font-medium mb-1 transition-colors duration-300"
                style={{ color: 'var(--text-primary)' }}
              >
                Confirm Password*
              </label>
              <input
                type="password"
                {...register("confirmPassword")}
                className={`w-full px-4 py-3 rounded-lg border transition-colors duration-300 ${
                  errors.confirmPassword ? 'border-red-500' : ''
                } focus:outline-none focus:ring-2 focus:ring-purple-600 dark:focus:ring-purple-400`}
                style={{
                  backgroundColor: 'var(--bg-input)',
                  color: 'var(--text-primary)',
                  borderColor: errors.confirmPassword ? '#ef4444' : 'var(--border-color)'
                }}
                placeholder="Confirm your password"
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.confirmPassword.message}</p>
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
                  Signing up...
                </div>
              ) : (
                'Sign Up'
              )}
            </button>

            <div className="text-center mt-4">
              <p 
                className="text-sm transition-colors duration-300"
                style={{ color: 'var(--text-secondary)' }}
              >
                Already have an account?{" "}
                <Link 
                  to={API_CONFIG.ROUTES.LOGIN} 
                  className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium transition-colors duration-300"
                >
                  Sign In
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
            <h2 className="text-4xl font-bold mb-4">Welcome!</h2>
            <p className="text-lg mb-8">Create your account to get started</p>
          </div>
        </div>
      </div>
    </div>
  );
} 