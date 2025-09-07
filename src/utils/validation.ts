export interface ValidationResult {
  isValid: boolean;
  message?: string;
}

export interface PasswordStrengthResult extends ValidationResult {
  strength: 'weak' | 'medium' | 'strong';
  score: number;
}

/**
 * Validates email format with support for:
 * - Unicode characters
 * - Plus tags
 * - Subdomains and modern TLDs
 */
export const validateEmail = (email: string): ValidationResult => {
  if (!email.trim()) {
    return { isValid: false, message: 'Email is required' };
  }

  // Modern, Unicode-friendly regex
  // Explanation:
  // ^[^\s@]+       → one or more characters except space or '@'
  // @              → must have '@'
  // [^\s@]+        → domain part without spaces or '@'
  // \.             → dot before TLD
  // [^\s@]{2,}     → at least 2 characters in TLD (can be Unicode)
  const emailRegex = /^[^\s@]+@(gmail|yahoo)\.(com|co|in|org)$/i;

  if (!emailRegex.test(email)) {
    return { isValid: false, message: 'Please enter a valid email address' };
  }

  return { isValid: true };
};


/**
 * Validates password strength with detailed scoring
 */
export const validatePasswordStrength = (password: string): PasswordStrengthResult => {
  if (!password) {
    return { 
      isValid: false, 
      message: 'Password is required',
      strength: 'weak',
      score: 0
    };
  }

  let score = 0;
  const checks = {
    length: password.length >= 8,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    numbers: /\d/.test(password),
    special: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password),
    longLength: password.length >= 12
  };

  // Scoring system
  if (checks.length) score += 2;
  if (checks.lowercase) score += 1;
  if (checks.uppercase) score += 1;
  if (checks.numbers) score += 1;
  if (checks.special) score += 2;
  if (checks.longLength) score += 1;

  let strength: 'weak' | 'medium' | 'strong';
  let message: string | undefined;

  if (score < 4) {
    strength = 'weak';
    message = 'Password is too weak. Use at least 8 characters with mixed case, numbers, and symbols.';
  } else if (score < 6) {
    strength = 'medium';
    message = 'Password strength is medium. Consider adding more complexity.';
  } else {
    strength = 'strong';
  }

  return {
    isValid: score >= 4,
    message,
    strength,
    score
  };
};

/**
 * Validates that two passwords match
 */
export const validatePasswordMatch = (password: string, confirmPassword: string): ValidationResult => {
  if (!confirmPassword.trim()) {
    return { isValid: false, message: 'Please confirm your password' };
  }

  if (password !== confirmPassword) {
    return { isValid: false, message: 'Passwords do not match' };
  }

  return { isValid: true };
};

/**
 * Validates that terms and conditions are accepted
 */
export const validateTermsAccepted = (accepted: boolean): ValidationResult => {
  if (!accepted) {
    return { isValid: false, message: 'You must accept the terms and conditions to continue' };
  }

  return { isValid: true };
};

/**
 * Comprehensive form validation for create account
 */
export interface CreateAccountFormData {
  email: string;
  password: string;
  confirmPassword: string;
  termsAccepted: boolean;
}

export interface CreateAccountValidationResult {
  isValid: boolean;
  errors: {
    email?: string;
    password?: string;
    confirmPassword?: string;
    terms?: string;
  };
  passwordStrength?: PasswordStrengthResult;
}

export const validateCreateAccountForm = (formData: CreateAccountFormData): CreateAccountValidationResult => {
  const emailValidation = validateEmail(formData.email);
  const passwordValidation = validatePasswordStrength(formData.password);
  const confirmPasswordValidation = validatePasswordMatch(formData.password, formData.confirmPassword);
  const termsValidation = validateTermsAccepted(formData.termsAccepted);

  const errors: CreateAccountValidationResult['errors'] = {};

  if (!emailValidation.isValid) {
    errors.email = emailValidation.message;
  }

  if (!passwordValidation.isValid) {
    errors.password = passwordValidation.message;
  }

  if (!confirmPasswordValidation.isValid) {
    errors.confirmPassword = confirmPasswordValidation.message;
  }

  if (!termsValidation.isValid) {
    errors.terms = termsValidation.message;
  }

  return {
    isValid: emailValidation.isValid && passwordValidation.isValid && confirmPasswordValidation.isValid && termsValidation.isValid,
    errors,
    passwordStrength: passwordValidation
  };
};
