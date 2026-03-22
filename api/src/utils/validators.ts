import { parseISO, isValid, isFuture, isAfter } from 'date-fns';

// Email validation
const isValidEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Password validation (minimum 6 characters)
const isValidPassword = (password: string) => {
  return password && password.length >= 6;
}

// Date validation
const isValidDate = (dateString: string) => {
  if (!dateString) return false;
  try {
    const date = parseISO(dateString);
    return isValid(date);
  } catch {
    return false;
  }
}

// Check if date is not in the future
const isNotFutureDate = (dateString: string) => {
  if (!dateString) return false;
  try {
    const date = parseISO(dateString);
    return isValid(date) && !isFuture(date);
  } catch {
    return false;
  }
}

// Validate date range
const isValidDateRange = (startDate: string, endDate: string) => {
  if (!startDate || !endDate) return false;
  try {
    const start = parseISO(startDate);
    const end = parseISO(endDate);

    if (!isValid(start) || !isValid(end)) {
      return false;
    }

    return !isAfter(start, end);
  } catch {
    return false;
  }
}

// Sanitize string input
const sanitizeString = (str: string) => {
  if (typeof str !== 'string') return '';
  return str.trim().slice(0, 500); // Limit to 500 chars
}

// Validate required fields

const validateRequiredFields = (data: Record<string, unknown>, fields: string[]) => {
  const missing = [];

  for (const field of fields) {
    if (data[field] === undefined || data[field] === null || data[field] === '') {
      missing.push(field);
    }
  }

  return {
    valid: missing.length === 0,
    missing
  };
}

// Validate number in range
const isInRange = (value: number, min: number, max: number) => {
  const num = Number(value);
  return !isNaN(num) && num >= min && num <= max;
}

export {
  validateRequiredFields,
  sanitizeString,
  isInRange,
  isValidEmail,
  isValidPassword,
  isValidDateRange,
  isNotFutureDate,
  isValidDate,
};
