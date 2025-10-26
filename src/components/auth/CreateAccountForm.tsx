import React, { useState, useEffect, useCallback } from 'react';
import { UserPlus, Mail, Key, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
// The validation file is not available in this single-file React component context,
// so we'll move the validation logic directly into this file.

// Defining the types here since the external file is not available
interface CreateAccountFormData {
  email: string;
  password: string;
  confirmPassword: string;
  termsAccepted: boolean;
}

interface PasswordStrengthResult {
  score: number;
  strength: 'weak' | 'medium' | 'strong';
}

interface ValidationResult {
  isValid: boolean;
  message?: string;
}

// Relocating the validation functions
const validateEmail = (email: string): ValidationResult => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return { isValid: emailRegex.test(email) };
};

const validateCreateAccountForm = (formData: CreateAccountFormData): { isValid: boolean; errors: Record<string, string>; passwordStrength: PasswordStrengthResult | null } => {
  const errors: Record<string, string> = {};
  let passwordStrength: PasswordStrengthResult | null = null;
  let score = 0;

  // Password strength check
  if (formData.password.length > 0) {
    if (formData.password.length >= 8) score++;
    if (/[a-z]/.test(formData.password)) score++;
    if (/[A-Z]/.test(formData.password)) score++;
    if (/[0-9]/.test(formData.password)) score++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(formData.password)) score++;
    
    let strength: 'weak' | 'medium' | 'strong' = 'weak';
    if (score >= 5) strength = 'strong';
    else if (score >= 3) strength = 'medium';
    passwordStrength = { score, strength };
  }

  if (!formData.email.trim()) {
    errors.email = 'Email is required';
  } else if (!validateEmail(formData.email).isValid) {
    errors.email = 'Please enter a valid email address';
  }

  if (!formData.password.trim()) {
    errors.password = 'Password is required';
  } else if (formData.password.length < 8) {
    errors.password = 'Password must be at least 8 characters long';
  }

  if (formData.password !== formData.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }

  if (!formData.termsAccepted) {
    errors.terms = 'You must accept the terms and conditions';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    passwordStrength
  };
};


const CreateAccountForm: React.FC = () => {
  const [formData, setFormData] = useState<CreateAccountFormData>({
    email: '',
    password: '',
    confirmPassword: '',
    termsAccepted: false
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrengthResult | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [emailValidation, setEmailValidation] = useState<ValidationResult | null>(null);
  const [isEmailTouched, setIsEmailTouched] = useState(false);

  const handleInputChange = (field: keyof CreateAccountFormData, value: string | boolean) => {
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);

    // Handle email field specific logic
    if (field === 'email' && typeof value === 'string') {
      setIsEmailTouched(true);
      // Clear email validation when user starts typing
      if (emailValidation && !emailValidation.isValid) {
        setEmailValidation(null);
      }
    }

    // Real-time validation for password strength
    if (field === 'password' && typeof value === 'string') {
      const validation = validateCreateAccountForm(newFormData);
      setPasswordStrength(validation.passwordStrength || null);
    }

    // Clear errors when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const getPasswordStrengthColor = (strength: string) => {
    switch (strength) {
      case 'weak': return 'text-red-400';
      case 'medium': return 'text-yellow-400';
      case 'strong': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  const getPasswordStrengthBg = (strength: string) => {
    switch (strength) {
      case 'weak': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'strong': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  // Enhanced email validation with specific error messages
  const validateEmailWithDetails = useCallback((email: string): ValidationResult => {
    if (!email.trim()) {
      return { isValid: false, message: 'Email address is required' };
    }

    const trimmedEmail = email.trim();

    // Check for basic format issues
    if (!trimmedEmail.includes('@')) {
      return { isValid: false, message: 'Email must contain an @ symbol' };
    }

    if (trimmedEmail.split('@').length !== 2) {
      return { isValid: false, message: 'Email must contain exactly one @ symbol' };
    }

    const [localPart, domainPart] = trimmedEmail.split('@');

    if (!localPart) {
      return { isValid: false, message: 'Email must have a username before the @ symbol' };
    }

    if (!domainPart) {
      return { isValid: false, message: 'Email must have a domain after the @ symbol' };
    }

    if (!domainPart.includes('.')) {
      return { isValid: false, message: 'Email domain must contain a dot (e.g., .com, .org)' };
    }

    // Check for invalid patterns
    if (trimmedEmail.includes('..') || trimmedEmail.startsWith('.') || trimmedEmail.endsWith('.')) {
      return { isValid: false, message: 'Email contains invalid dot placement' };
    }

    if (trimmedEmail.includes('@.') || trimmedEmail.includes('.@')) {
      return { isValid: false, message: 'Email has invalid formatting around @ symbol' };
    }

    // Use the main validation function
    return validateEmail(trimmedEmail);
  }, []);

  // Debounced email validation
  const debouncedEmailValidation = useCallback(
    (email: string) => {
      const timeoutId = setTimeout(() => {
        if (email && isEmailTouched) {
          const validation = validateEmailWithDetails(email);
          setEmailValidation(validation);
        } else if (!email && isEmailTouched) {
          setEmailValidation({ isValid: false, message: 'Email is required' });
        } else if (!isEmailTouched) {
          // Clear validation when field hasn't been touched
          setEmailValidation(null);
        }
      }, 300); // 300ms debounce delay

      return () => clearTimeout(timeoutId);
    },
    [isEmailTouched, validateEmailWithDetails]
  );

  // Effect for real-time email validation
  useEffect(() => {
    const cleanup = debouncedEmailValidation(formData.email);
    return cleanup;
  }, [formData.email, debouncedEmailValidation]);

  // Check if form is valid for submission
  const isFormValid = useCallback(() => {
    // Strict email validation
    const currentEmailValidation = validateEmailWithDetails(formData.email);
    if (!currentEmailValidation.isValid) {
      return false;
    }

    // Check password strength
    const passwordValidation = validateCreateAccountForm(formData);
    if (!passwordValidation.isValid) {
      return false;
    }

    // Check if all required fields are filled
    if (!formData.email.trim() || !formData.password.trim() || !formData.confirmPassword.trim()) {
      return false;
    }

    // Check if terms are accepted
    if (!formData.termsAccepted) {
      return false;
    }

    return true;
  }, [formData, validateEmailWithDetails]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Ensure email is touched and validate it strictly
    setIsEmailTouched(true);
    const currentEmailValidation = validateEmailWithDetails(formData.email);
    setEmailValidation(currentEmailValidation);

    // Strict email validation - block submission if email is invalid
    if (!currentEmailValidation.isValid) {
      setErrors({
        email: currentEmailValidation.message || 'Please enter a valid email address'
      });
      setIsLoading(false);
      return;
    }

    const validation = validateCreateAccountForm(formData);

    // Check both form validation and strict email validation
    if (!validation.isValid) {
      setErrors(validation.errors);
      setIsLoading(false);
      return;
    }

    // Connect to the database here
    try {
      const response = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          // The database expects 'username' and 'password'
          username: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log('Registration successful:', data.message);
        setIsSubmitted(true);
      } else {
        console.error('Registration failed:', data.error);
        setErrors({ general: data.error || 'An error occurred during registration.' });
      }
    } catch (error) {
      console.error('Network error:', error);
      setErrors({ general: 'Failed to connect to the server. Please ensure the server is running.' });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="bg-gray-800 border border-indigo-900 rounded-lg shadow-xl p-8 w-full max-w-md mx-auto">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-900 rounded-full mb-4">
            <CheckCircle size={32} className="text-green-300" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Account Created!</h2>
          <p className="text-gray-300 mb-6">
            Your account has been successfully created. You can now sign in to access CryptoHide.
          </p>
          <Link
            to="/login"
            className="w-full inline-flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-white bg-purple-700 hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition duration-200"
          >
            Sign In Now
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 border border-indigo-900 rounded-lg shadow-xl p-8 w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-900 rounded-full mb-4">
          <UserPlus size={28} className="text-yellow-300" />
        </div>
        <h2 className="text-2xl font-bold text-white">Create Your Account</h2>
        <p className="text-gray-400 mt-2">Join CryptoHide and start securing your messages</p>
      </div>

      {errors.general && (
        <div className="mb-6 p-4 bg-red-900 border border-red-700 rounded-md">
          <div className="flex items-center">
            <AlertCircle size={18} className="text-red-300 mr-2" />
            <p className="text-red-300 text-sm">{errors.general}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email Field */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
            Email Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail size={18} className={`${
                emailValidation && !emailValidation.isValid && isEmailTouched
                  ? 'text-red-400'
                  : emailValidation && emailValidation.isValid && isEmailTouched
                  ? 'text-green-400'
                  : 'text-gray-500'
              }`} />
            </div>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              onBlur={() => setIsEmailTouched(true)}
              className={`block w-full pl-10 pr-12 py-3 border ${
                // Priority: form submission errors > real-time validation > default
                errors.email
                  ? 'border-red-500'
                  : emailValidation && !emailValidation.isValid && isEmailTouched
                  ? 'border-red-500'
                  : emailValidation && emailValidation.isValid && isEmailTouched
                  ? 'border-green-500'
                  : 'border-gray-600'
              } bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200`}
              placeholder="your@email.com"
            />
            {/* Real-time validation icon */}
            {isEmailTouched && emailValidation && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                {emailValidation.isValid ? (
                  <CheckCircle size={18} className="text-green-400" />
                ) : (
                  <AlertCircle size={18} className="text-red-400" />
                )}
              </div>
            )}
          </div>
          {/* Show real-time validation error or form submission error */}
          {(errors.email || (emailValidation && !emailValidation.isValid && isEmailTouched)) && (
            <p className="mt-1 text-sm text-red-400 flex items-center">
              <AlertCircle size={14} className="mr-1" />
              {errors.email || emailValidation?.message}
            </p>
          )}
          {/* Show success message for valid email */}
          {emailValidation && emailValidation.isValid && isEmailTouched && !errors.email && (
            <p className="mt-1 text-sm text-green-400 flex items-center">
              <CheckCircle size={14} className="mr-1" />
              Valid email address
            </p>
          )}
          {/* Helper text for email requirements */}
          {!isEmailTouched && !formData.email && (
            <p className="mt-1 text-xs text-gray-500">
              Enter a valid email address (e.g., user@example.com)
            </p>
          )}
        </div>

        {/* Password Field */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
            Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Key size={18} className="text-gray-500" />
            </div>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              className={`block w-full pl-10 pr-10 py-3 border ${
                errors.password ? 'border-red-500' : 'border-gray-600'
              } bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200`}
              placeholder="••••••••"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-400 hover:text-white focus:outline-none"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          
          {/* Password Strength Indicator */}
          {passwordStrength && formData.password && (
            <div className="mt-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-400">Password strength:</span>
                <span className={`text-xs font-medium ${getPasswordStrengthColor(passwordStrength.strength)}`}>
                  {passwordStrength.strength.charAt(0).toUpperCase() + passwordStrength.strength.slice(1)}
                </span>
              </div>
              <div className="w-full bg-gray-600 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthBg(passwordStrength.strength)}`}
                  style={{ width: `${(passwordStrength.score / 8) * 100}%` }}
                ></div>
              </div>
            </div>
          )}
          
          {errors.password && (
            <p className="mt-1 text-sm text-red-400">{errors.password}</p>
          )}
        </div>

        {/* Confirm Password Field */}
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-1">
            Confirm Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Key size={18} className="text-gray-500" />
            </div>
            <input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              className={`block w-full pl-10 pr-10 py-3 border ${
                errors.confirmPassword ? 'border-red-500' : 'border-gray-600'
              } bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200`}
              placeholder="••••••••"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="text-gray-400 hover:text-white focus:outline-none"
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-red-400">{errors.confirmPassword}</p>
          )}
        </div>

        {/* Terms and Conditions */}
        <div>
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="terms"
                type="checkbox"
                checked={formData.termsAccepted}
                onChange={(e) => handleInputChange('termsAccepted', e.target.checked)}
                className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500 focus:ring-2"
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="terms" className="text-gray-300">
                I agree to the{' '}
                <Link to="/terms-privacy" className="text-purple-400 hover:text-purple-300 underline">
                  Terms and Conditions & Privacy Policy
                </Link>{' '}
               
                
              </label>
            </div>
          </div>
          {errors.terms && (
            <p className="mt-1 text-sm text-red-400">{errors.terms}</p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || !isFormValid()}
          className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-white transition duration-200 ${
            isLoading || !isFormValid()
              ? 'bg-gray-600 cursor-not-allowed opacity-70'
              : 'bg-purple-700 hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500'
          }`}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Creating Account...
            </>
          ) : (
            <>
              <UserPlus size={18} className="mr-2" />
              Create Account
            </>
          )}
        </button>

        {/* Form validation status */}
        {!isFormValid() && !isLoading && (
          <div className="text-center">
            <p className="text-xs text-gray-500">
              {!validateEmailWithDetails(formData.email).isValid
                ? '⚠️ Please enter a valid email address'
                : !formData.password.trim()
                ? '⚠️ Please enter a password'
                : !formData.confirmPassword.trim()
                ? '⚠️ Please confirm your password'
                : formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword
                ? '⚠️ Passwords do not match'
                : !formData.termsAccepted
                ? '⚠️ Please accept the terms and conditions'
                : '⚠️ Please complete all required fields'
              }
            </p>
          </div>
        )}

        {/* Sign In Link */}
        <div className="text-center">
          <p className="text-sm text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="text-purple-400 hover:text-purple-300 font-medium transition duration-200">
              Sign in here
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
};

export default CreateAccountForm;
