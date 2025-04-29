/**
 * Email validation regex pattern
 * @type {RegExp}
 */
export const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

/**
 * Password validation regex pattern (min 8 chars, at least 1 letter and 1 number)
 * @type {RegExp}
 */
export const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/;

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} Whether the email is valid
 */
export const isValidEmail = (email) => {
  return EMAIL_REGEX.test(email);
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {boolean} Whether the password meets requirements
 */
export const isValidPassword = (password) => {
  return PASSWORD_REGEX.test(password);
};

/**
 * Get password strength feedback
 * @param {string} password - Password to evaluate
 * @returns {Object} Feedback object with score and message
 */
export const getPasswordStrength = (password) => {
  if (!password) {
    return { score: 0, message: 'Password is required' };
  }
  
  let score = 0;
  let message = '';
  
  // Length check
  if (password.length < 8) {
    message = 'Password must be at least 8 characters';
  } else {
    score += 1;
  }
  
  // Contains letter check
  if (/[A-Za-z]/.test(password)) {
    score += 1;
  }
  
  // Contains number check
  if (/\d/.test(password)) {
    score += 1;
  }
  
  // Contains special character check
  if (/[^A-Za-z0-9]/.test(password)) {
    score += 1;
  }
  
  // Mixed case check
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) {
    score += 1;
  }
  
  // Set message based on score
  if (score === 5) {
    message = 'Very strong password';
  } else if (score === 4) {
    message = 'Strong password';
  } else if (score === 3) {
    message = 'Good password';
  } else if (score === 2) {
    message = 'Fair password';
  } else if (score === 1) {
    message = 'Weak password';
  }
  
  return { score, message };
};

/**
 * Validate form fields
 * @param {Object} fields - Form fields to validate
 * @param {Object} rules - Validation rules
 * @returns {Object} Validation errors
 */
export const validateForm = (fields, rules) => {
  const errors = {};
  
  Object.keys(rules).forEach(field => {
    const value = fields[field];
    const fieldRules = rules[field];
    
    // Required check
    if (fieldRules.required && (!value || value.trim() === '')) {
      errors[field] = `${fieldRules.label || field} is required`;
      return;
    }
    
    // Email format check
    if (fieldRules.email && value && !isValidEmail(value)) {
      errors[field] = 'Invalid email format';
      return;
    }
    
    // Password strength check
    if (fieldRules.password && value && !isValidPassword(value)) {
      errors[field] = 'Password must be at least 8 characters with at least one letter and one number';
      return;
    }
    
    // Min length check
    if (fieldRules.minLength && value && value.length < fieldRules.minLength) {
      errors[field] = `${fieldRules.label || field} must be at least ${fieldRules.minLength} characters`;
      return;
    }
    
    // Max length check
    if (fieldRules.maxLength && value && value.length > fieldRules.maxLength) {
      errors[field] = `${fieldRules.label || field} must be at most ${fieldRules.maxLength} characters`;
      return;
    }
    
    // Match check (for password confirmation)
    if (fieldRules.match && value !== fields[fieldRules.match]) {
      errors[field] = `${fieldRules.label || field} does not match ${fieldRules.matchLabel || fieldRules.match}`;
      return;
    }
    
    // Custom validation
    if (fieldRules.validate && typeof fieldRules.validate === 'function') {
      const customError = fieldRules.validate(value, fields);
      if (customError) {
        errors[field] = customError;
      }
    }
  });
  
  return errors;
};
