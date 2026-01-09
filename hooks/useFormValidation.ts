import { useState, useCallback } from 'react';

interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  min?: number;
  max?: number;
  custom?: (value: any) => string | null;
}

interface ValidationRules {
  [key: string]: ValidationRule;
}

export function useFormValidation<T extends Record<string, any>>(
  initialData: T,
  validationRules: ValidationRules
) {
  const [data, setData] = useState<T>(initialData);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateField = useCallback((name: keyof T, value: any): string | null => {
    const rules = validationRules[name as string];
    if (!rules) return null;

    if (rules.required && (!value || (typeof value === 'string' && !value.trim()))) {
      return `${String(name)} is required`;
    }

    if (value && typeof value === 'string') {
      if (rules.minLength && value.length < rules.minLength) {
        return `${String(name)} must be at least ${rules.minLength} characters`;
      }
      if (rules.maxLength && value.length > rules.maxLength) {
        return `${String(name)} must be no more than ${rules.maxLength} characters`;
      }
      if (rules.pattern && !rules.pattern.test(value)) {
        return `${String(name)} format is invalid`;
      }
    }

    if (value && typeof value === 'number') {
      if (rules.min !== undefined && value < rules.min) {
        return `${String(name)} must be at least ${rules.min}`;
      }
      if (rules.max !== undefined && value > rules.max) {
        return `${String(name)} must be no more than ${rules.max}`;
      }
    }

    if (rules.custom) {
      return rules.custom(value);
    }

    return null;
  }, [validationRules]);

  const validateAll = useCallback((): boolean => {
    const newErrors: Partial<Record<keyof T, string>> = {};
    let isValid = true;

    Object.keys(validationRules).forEach(key => {
      const error = validateField(key as keyof T, data[key as keyof T]);
      if (error) {
        newErrors[key as keyof T] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [data, validateField, validationRules]);

  const updateField = useCallback((name: keyof T, value: any) => {
    setData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  }, [errors]);

  const resetForm = useCallback(() => {
    setData(initialData);
    setErrors({});
    setIsSubmitting(false);
  }, [initialData]);

  const setFormData = useCallback((newData: T) => {
    setData(newData);
    setErrors({});
  }, []);

  return {
    data,
    errors,
    isSubmitting,
    setIsSubmitting,
    updateField,
    validateAll,
    resetForm,
    setFormData
  };
}