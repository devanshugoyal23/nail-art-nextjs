import { NextRequest } from 'next/server';

export interface ValidationResult<T = unknown> {
  isValid: boolean;
  errors: string[];
  sanitizedData?: T;
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

export interface GalleryItemData {
  imageData: string;
  prompt: string;
  designName?: string;
  category?: string;
  originalImageData?: string;
}

export interface AIGenerationData {
  base64ImageData: string;
  mimeType: string;
  prompt: string;
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
  input: unknown, 
  rules: ValidationRules = {}
): ValidationResult<string> {
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
  input: unknown,
  rules: ValidationRules = {}
): ValidationResult<string> {
  const errors: string[] = [];
  
  if (rules.required && !input) {
    errors.push('Image data is required');
    return { isValid: false, errors };
  }
  
  if (!input) {
    return { isValid: true, errors: [], sanitizedData: undefined };
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
    sanitizedData: errors.length === 0 ? data : undefined
  };
}

/**
 * Validate UUID format
 */
export function validateUUID(input: unknown): ValidationResult<string> {
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
    sanitizedData: input as string
  };
}

/**
 * Validate pagination parameters
 */
export function validatePagination(
  page: unknown,
  limit: unknown,
  maxPage: number = 1000,
  maxLimit: number = 100
): ValidationResult<{ page: number; limit: number }> {
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
export function validateGalleryItem(data: unknown): ValidationResult<GalleryItemData> {
  const errors: string[] = [];
  const sanitizedData: Partial<GalleryItemData> = {};
  
  // Type guard to ensure data is an object
  if (!data || typeof data !== 'object') {
    return { isValid: false, errors: ['Invalid data format'] };
  }
  
  const dataObj = data as Record<string, unknown>;
  
  // Validate image data
  const imageValidation = validateImageData(dataObj.imageData, {
    required: true,
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['jpeg', 'jpg', 'png', 'webp']
  });
  
  if (!imageValidation.isValid) {
    errors.push(...imageValidation.errors);
  } else {
    sanitizedData.imageData = imageValidation.sanitizedData as string;
  }
  
  // Validate prompt
  const promptValidation = validateText(dataObj.prompt, {
    required: true,
    maxLength: 1000,
    sanitize: true
  });
  
  if (!promptValidation.isValid) {
    errors.push(...promptValidation.errors);
  } else {
    sanitizedData.prompt = promptValidation.sanitizedData as string;
  }
  
  // Validate design name (optional)
  if (dataObj.designName) {
    const designNameValidation = validateText(dataObj.designName, {
      maxLength: 200,
      sanitize: true
    });
    
    if (!designNameValidation.isValid) {
      errors.push(...designNameValidation.errors);
    } else {
      sanitizedData.designName = designNameValidation.sanitizedData as string;
    }
  }
  
  // Validate category (optional)
  if (dataObj.category) {
    const categoryValidation = validateText(dataObj.category, {
      maxLength: 100,
      sanitize: true
    });
    
    if (!categoryValidation.isValid) {
      errors.push(...categoryValidation.errors);
    } else {
      sanitizedData.category = categoryValidation.sanitizedData as string;
    }
  }
  
  // Validate original image data (optional)
  if (dataObj.originalImageData) {
    const originalImageValidation = validateImageData(dataObj.originalImageData, {
      maxSize: 10 * 1024 * 1024, // 10MB
      allowedTypes: ['jpeg', 'jpg', 'png', 'webp']
    });
    
    if (!originalImageValidation.isValid) {
      errors.push(...originalImageValidation.errors);
    } else {
      sanitizedData.originalImageData = originalImageValidation.sanitizedData as string;
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    sanitizedData: errors.length === 0 ? sanitizedData as GalleryItemData : undefined
  };
}

/**
 * Validate AI generation request
 */
export function validateAIGeneration(data: unknown): ValidationResult<AIGenerationData> {
  const errors: string[] = [];
  const sanitizedData: Partial<AIGenerationData> = {};
  
  // Type guard to ensure data is an object
  if (!data || typeof data !== 'object') {
    return { isValid: false, errors: ['Invalid data format'] };
  }
  
  const dataObj = data as Record<string, unknown>;
  
  // Validate base64 image data
  const imageValidation = validateImageData(dataObj.base64ImageData, {
    required: true,
    maxSize: 20 * 1024 * 1024, // 20MB
    allowedTypes: ['jpeg', 'jpg', 'png', 'webp']
  });
  
  if (!imageValidation.isValid) {
    errors.push(...imageValidation.errors);
  } else {
    sanitizedData.base64ImageData = imageValidation.sanitizedData as string;
  }
  
  // Validate MIME type
  const mimeTypeValidation = validateText(dataObj.mimeType, {
    required: true,
    pattern: /^image\/(jpeg|jpg|png|webp)$/
  });
  
  if (!mimeTypeValidation.isValid) {
    errors.push(...mimeTypeValidation.errors);
  } else {
    sanitizedData.mimeType = mimeTypeValidation.sanitizedData as string;
  }
  
  // Validate prompt
  const promptValidation = validateText(dataObj.prompt, {
    required: true,
    maxLength: 1000,
    sanitize: true
  });
  
  if (!promptValidation.isValid) {
    errors.push(...promptValidation.errors);
  } else {
    sanitizedData.prompt = promptValidation.sanitizedData as string;
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    sanitizedData: errors.length === 0 ? sanitizedData as AIGenerationData : undefined
  };
}

/**
 * Validate query parameters
 */
export interface QueryParamsData {
  page: number;
  limit: number;
  category?: string;
  search?: string;
  tags?: string[];
  sortBy: string;
}

export function validateQueryParams(request: NextRequest): ValidationResult<QueryParamsData> {
  const errors: string[] = [];
  const sanitizedData: Partial<QueryParamsData> = {};
  
  const { searchParams } = new URL(request.url);
  
  // Validate page
  const pageValidation = validatePagination(
    searchParams.get('page'),
    searchParams.get('limit')
  );
  
  if (!pageValidation.isValid) {
    errors.push(...pageValidation.errors);
  } else {
    sanitizedData.page = pageValidation.sanitizedData!.page;
    sanitizedData.limit = pageValidation.sanitizedData!.limit;
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
    sanitizedData: errors.length === 0 ? sanitizedData as QueryParamsData : undefined
  };
}
