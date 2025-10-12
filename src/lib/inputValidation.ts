import { NextRequest } from 'next/server';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  sanitizedData?: any;
}

export interface ValidationRules {
  maxLength?: number;
  minLength?: number;
  maxSize?: number; // in bytes
  allowedTypes?: string[];
  required?: boolean;
  pattern?: RegExp;
  sanitize?: boolean;
}

/**
 * Sanitize text input to prevent XSS attacks
 */
export function sanitizeText(input: string): string {
  if (typeof input !== 'string') return '';
  
  return input
    .replace(/[<>]/g, '') // Remove < and > characters
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim()
    .substring(0, 1000); // Limit length
}

/**
 * Validate and sanitize text input
 */
export function validateText(
  input: any, 
  rules: ValidationRules = {}
): ValidationResult {
  const errors: string[] = [];
  
  // Check if required
  if (rules.required && (!input || input.toString().trim() === '')) {
    errors.push('This field is required');
    return { isValid: false, errors };
  }
  
  // Handle empty values for non-required fields
  if (!input || input.toString().trim() === '') {
    return { isValid: true, errors: [], sanitizedData: '' };
  }
  
  const text = input.toString();
  
  // Check length
  if (rules.minLength && text.length < rules.minLength) {
    errors.push(`Minimum length is ${rules.minLength} characters`);
  }
  
  if (rules.maxLength && text.length > rules.maxLength) {
    errors.push(`Maximum length is ${rules.maxLength} characters`);
  }
  
  // Check pattern
  if (rules.pattern && !rules.pattern.test(text)) {
    errors.push('Invalid format');
  }
  
  // Sanitize if requested
  let sanitizedData = text;
  if (rules.sanitize) {
    sanitizedData = sanitizeText(text);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    sanitizedData
  };
}

/**
 * Validate base64 image data
 */
export function validateImageData(
  input: any,
  rules: ValidationRules = {}
): ValidationResult {
  const errors: string[] = [];
  
  if (rules.required && !input) {
    errors.push('Image data is required');
    return { isValid: false, errors };
  }
  
  if (!input) {
    return { isValid: true, errors: [], sanitizedData: null };
  }
  
  const data = input.toString();
  
  // Check if it's valid base64
  if (!/^data:image\/(jpeg|jpg|png|webp);base64,/.test(data)) {
    errors.push('Invalid image format. Must be JPEG, PNG, or WebP');
  }
  
  // Check size
  if (rules.maxSize && data.length > rules.maxSize) {
    const maxSizeMB = Math.round(rules.maxSize / (1024 * 1024));
    errors.push(`Image too large. Maximum size is ${maxSizeMB}MB`);
  }
  
  // Extract and validate MIME type
  const mimeTypeMatch = data.match(/^data:image\/([^;]+);base64,/);
  if (mimeTypeMatch) {
    const mimeType = mimeTypeMatch[1];
    if (rules.allowedTypes && !rules.allowedTypes.includes(mimeType)) {
      errors.push(`Image type not allowed. Allowed types: ${rules.allowedTypes.join(', ')}`);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    sanitizedData: errors.length === 0 ? data : null
  };
}

/**
 * Validate UUID format
 */
export function validateUUID(input: any): ValidationResult {
  const errors: string[] = [];
  
  if (!input) {
    errors.push('ID is required');
    return { isValid: false, errors };
  }
  
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(input.toString())) {
    errors.push('Invalid ID format');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    sanitizedData: input
  };
}

/**
 * Validate pagination parameters
 */
export function validatePagination(
  page: any,
  limit: any,
  maxPage: number = 1000,
  maxLimit: number = 100
): ValidationResult {
  const errors: string[] = [];
  
  const pageNum = parseInt(page?.toString() || '1');
  const limitNum = parseInt(limit?.toString() || '20');
  
  if (isNaN(pageNum) || pageNum < 1 || pageNum > maxPage) {
    errors.push(`Page must be between 1 and ${maxPage}`);
  }
  
  if (isNaN(limitNum) || limitNum < 1 || limitNum > maxLimit) {
    errors.push(`Limit must be between 1 and ${maxLimit}`);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    sanitizedData: {
      page: pageNum,
      limit: limitNum
    }
  };
}

/**
 * Validate gallery item data
 */
export function validateGalleryItem(data: any): ValidationResult {
  const errors: string[] = [];
  const sanitizedData: any = {};
  
  // Validate image data
  const imageValidation = validateImageData(data.imageData, {
    required: true,
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['jpeg', 'jpg', 'png', 'webp']
  });
  
  if (!imageValidation.isValid) {
    errors.push(...imageValidation.errors);
  } else {
    sanitizedData.imageData = imageValidation.sanitizedData;
  }
  
  // Validate prompt
  const promptValidation = validateText(data.prompt, {
    required: true,
    maxLength: 1000,
    sanitize: true
  });
  
  if (!promptValidation.isValid) {
    errors.push(...promptValidation.errors);
  } else {
    sanitizedData.prompt = promptValidation.sanitizedData;
  }
  
  // Validate design name (optional)
  if (data.designName) {
    const designNameValidation = validateText(data.designName, {
      maxLength: 200,
      sanitize: true
    });
    
    if (!designNameValidation.isValid) {
      errors.push(...designNameValidation.errors);
    } else {
      sanitizedData.designName = designNameValidation.sanitizedData;
    }
  }
  
  // Validate category (optional)
  if (data.category) {
    const categoryValidation = validateText(data.category, {
      maxLength: 100,
      sanitize: true
    });
    
    if (!categoryValidation.isValid) {
      errors.push(...categoryValidation.errors);
    } else {
      sanitizedData.category = categoryValidation.sanitizedData;
    }
  }
  
  // Validate original image data (optional)
  if (data.originalImageData) {
    const originalImageValidation = validateImageData(data.originalImageData, {
      maxSize: 10 * 1024 * 1024, // 10MB
      allowedTypes: ['jpeg', 'jpg', 'png', 'webp']
    });
    
    if (!originalImageValidation.isValid) {
      errors.push(...originalImageValidation.errors);
    } else {
      sanitizedData.originalImageData = originalImageValidation.sanitizedData;
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    sanitizedData
  };
}

/**
 * Validate AI generation request
 */
export function validateAIGeneration(data: any): ValidationResult {
  const errors: string[] = [];
  const sanitizedData: any = {};
  
  // Validate base64 image data
  const imageValidation = validateImageData(data.base64ImageData, {
    required: true,
    maxSize: 20 * 1024 * 1024, // 20MB
    allowedTypes: ['jpeg', 'jpg', 'png', 'webp']
  });
  
  if (!imageValidation.isValid) {
    errors.push(...imageValidation.errors);
  } else {
    sanitizedData.base64ImageData = imageValidation.sanitizedData;
  }
  
  // Validate MIME type
  const mimeTypeValidation = validateText(data.mimeType, {
    required: true,
    pattern: /^image\/(jpeg|jpg|png|webp)$/
  });
  
  if (!mimeTypeValidation.isValid) {
    errors.push(...mimeTypeValidation.errors);
  } else {
    sanitizedData.mimeType = mimeTypeValidation.sanitizedData;
  }
  
  // Validate prompt
  const promptValidation = validateText(data.prompt, {
    required: true,
    maxLength: 1000,
    sanitize: true
  });
  
  if (!promptValidation.isValid) {
    errors.push(...promptValidation.errors);
  } else {
    sanitizedData.prompt = promptValidation.sanitizedData;
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    sanitizedData
  };
}

/**
 * Validate query parameters
 */
export function validateQueryParams(request: NextRequest): ValidationResult {
  const errors: string[] = [];
  const sanitizedData: any = {};
  
  const { searchParams } = new URL(request.url);
  
  // Validate page
  const pageValidation = validatePagination(
    searchParams.get('page'),
    searchParams.get('limit')
  );
  
  if (!pageValidation.isValid) {
    errors.push(...pageValidation.errors);
  } else {
    sanitizedData.page = pageValidation.sanitizedData.page;
    sanitizedData.limit = pageValidation.sanitizedData.limit;
  }
  
  // Validate category
  const category = searchParams.get('category');
  if (category) {
    const categoryValidation = validateText(category, {
      maxLength: 100,
      sanitize: true
    });
    
    if (!categoryValidation.isValid) {
      errors.push(...categoryValidation.errors);
    } else {
      sanitizedData.category = categoryValidation.sanitizedData;
    }
  }
  
  // Validate search
  const search = searchParams.get('search');
  if (search) {
    const searchValidation = validateText(search, {
      maxLength: 200,
      sanitize: true
    });
    
    if (!searchValidation.isValid) {
      errors.push(...searchValidation.errors);
    } else {
      sanitizedData.search = searchValidation.sanitizedData;
    }
  }
  
  // Validate tags
  const tags = searchParams.get('tags');
  if (tags) {
    const tagList = tags.split(',').map(tag => tag.trim());
    const validTags = tagList.filter(tag => {
      const tagValidation = validateText(tag, {
        maxLength: 50,
        sanitize: true
      });
      return tagValidation.isValid;
    });
    
    sanitizedData.tags = validTags;
  }
  
  // Validate sortBy
  const sortBy = searchParams.get('sortBy');
  const allowedSortBy = ['newest', 'oldest', 'name', 'category'];
  if (sortBy && !allowedSortBy.includes(sortBy)) {
    errors.push(`Invalid sortBy. Allowed values: ${allowedSortBy.join(', ')}`);
  } else {
    sanitizedData.sortBy = sortBy || 'newest';
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    sanitizedData
  };
}
