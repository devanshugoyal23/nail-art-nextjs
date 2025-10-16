/**
 * Pinterest Rich Pins Service
 * Handles validation, generation, and optimization of Pinterest Article Rich Pins
 */

export interface PinterestRichPinData {
  title: string;
  description: string;
  imageUrl: string;
  pageUrl: string;
  author: string;
  publishedTime: string;
  section: string;
  tags: string[];
  category: string;
  designName: string;
}

/**
 * Generate comprehensive Pinterest Article Rich Pins meta tags
 */
export function generatePinterestRichPinMetaTags(data: PinterestRichPinData): Record<string, string> {
  const {
    title,
    description,
    imageUrl,
    pageUrl,
    author,
    publishedTime,
    section,
    tags,
    category,
    designName
  } = data;

  // Optimize title for Pinterest (under 100 characters)
  const pinterestTitle = title.length > 100 ? title.substring(0, 97) + '...' : title;
  
  // Optimize description for Pinterest (under 500 characters)
  const pinterestDescription = description.length > 500 ? description.substring(0, 497) + '...' : description;

  return {
    // Pinterest Rich Pin validation
    'pinterest-rich-pin': 'true',
    
    // Basic Pinterest meta tags
    'pinterest:title': pinterestTitle,
    'pinterest:description': pinterestDescription,
    'pinterest:image': imageUrl,
    'pinterest:image:width': '1000',
    'pinterest:image:height': '1500',
    'pinterest:image:alt': `${designName} ${category ? `- ${category}` : ''} nail art design`,
    
    // Pinterest engagement optimization
    'pinterest:board': category ? `${category} Nail Art Ideas` : 'Nail Art Ideas',
    'pinterest:category': 'beauty',
    'pinterest:type': 'article',
    'pinterest:url': pageUrl,
    
    // Article Rich Pins meta tags (required for Pinterest validation)
    'article:author': author,
    'article:published_time': publishedTime,
    'article:section': section,
    'article:tag': tags.join(','),
    
    // Open Graph meta tags (Pinterest uses these for Rich Pins)
    'og:type': 'article',
    'og:title': pinterestTitle,
    'og:description': pinterestDescription,
    'og:image': imageUrl,
    'og:url': pageUrl,
    'og:site_name': 'Nail Art AI',
    'og:locale': 'en_US',
    'og:updated_time': publishedTime,
    
    // Additional Pinterest optimization
    'pinterest:media': imageUrl,
    'pinterest:domain': 'nailartai.app',
    'pinterest:app_id': 'Nail Art AI',
  };
}

/**
 * Validate Pinterest Rich Pins requirements
 */
export function validatePinterestRichPins(data: PinterestRichPinData): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required fields validation
  if (!data.title || data.title.trim().length === 0) {
    errors.push('Title is required for Pinterest Rich Pins');
  } else if (data.title.length > 100) {
    warnings.push('Title is longer than 100 characters (Pinterest recommendation)');
  }

  if (!data.description || data.description.trim().length === 0) {
    errors.push('Description is required for Pinterest Rich Pins');
  } else if (data.description.length > 500) {
    warnings.push('Description is longer than 500 characters (Pinterest recommendation)');
  }

  if (!data.imageUrl) {
    errors.push('Image URL is required for Pinterest Rich Pins');
  }

  if (!data.pageUrl) {
    errors.push('Page URL is required for Pinterest Rich Pins');
  }

  if (!data.author || data.author.trim().length === 0) {
    errors.push('Author is required for Pinterest Rich Pins');
  }

  if (!data.publishedTime) {
    errors.push('Published time is required for Pinterest Rich Pins');
  }

  if (!data.section || data.section.trim().length === 0) {
    errors.push('Section is required for Pinterest Rich Pins');
  }

  // Image validation
  if (data.imageUrl && !isValidImageUrl(data.imageUrl)) {
    errors.push('Invalid image URL format');
  }

  // Pinterest-specific recommendations
  if (data.tags.length === 0) {
    warnings.push('Tags are recommended for better Pinterest categorization');
  } else if (data.tags.length > 10) {
    warnings.push('Too many tags (Pinterest recommends 5-10 tags)');
  }

  if (!data.category) {
    warnings.push('Category is recommended for better Pinterest organization');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Generate Pinterest Rich Pins HTML meta tags
 */
export function generatePinterestRichPinHTML(data: PinterestRichPinData): string {
  const metaTags = generatePinterestRichPinMetaTags(data);
  
  const htmlTags = Object.entries(metaTags)
    .map(([name, content]) => {
      if (name.startsWith('og:') || name.startsWith('article:') || name.startsWith('pinterest:')) {
        return `  <meta property="${name}" content="${escapeHtml(content)}" />`;
      } else {
        return `  <meta name="${name}" content="${escapeHtml(content)}" />`;
      }
    })
    .join('\n');

  return `<!-- Pinterest Article Rich Pins Meta Tags -->
${htmlTags}
<!-- End Pinterest Rich Pins -->`;
}

/**
 * Check if image URL is valid
 */
function isValidImageUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    return ['http:', 'https:'].includes(parsedUrl.protocol) && 
           /\.(jpg|jpeg|png|webp)$/i.test(parsedUrl.pathname);
  } catch {
    return false;
  }
}

/**
 * Escape HTML characters
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

/**
 * Generate Pinterest Rich Pins validation URL
 * This can be used to test if your Rich Pins are working correctly
 */
export function generatePinterestValidationUrl(pageUrl: string): string {
  return `https://developers.pinterest.com/tools/url-debugger/?link=${encodeURIComponent(pageUrl)}`;
}

/**
 * Get Pinterest board suggestions based on category
 */
export function getPinterestBoardSuggestions(category: string): string[] {
  const boardMap: Record<string, string[]> = {
    'wedding': ['Wedding Nail Designs', 'Bridal Nail Art', 'Wedding Nail Ideas'],
    'christmas': ['Christmas Nail Art', 'Holiday Nail Designs', 'Winter Nail Art'],
    'halloween': ['Halloween Nail Art', 'Spooky Nail Designs', 'Halloween Nail Ideas'],
    'valentine': ['Valentine\'s Nail Art', 'Romantic Nail Designs', 'Valentine Nail Ideas'],
    'french': ['French Manicure Ideas', 'French Nail Art', 'Classic Nail Designs'],
    'gel': ['Gel Nail Art', 'Gel Manicure Ideas', 'Gel Polish Designs'],
    'acrylic': ['Acrylic Nail Art', 'Acrylic Nail Designs', 'Acrylic Nail Ideas'],
    'summer': ['Summer Nail Art', 'Beach Nail Designs', 'Summer Nail Ideas'],
    'fall': ['Fall Nail Art', 'Autumn Nail Designs', 'Fall Nail Ideas'],
    'spring': ['Spring Nail Art', 'Spring Nail Designs', 'Spring Nail Ideas'],
    'winter': ['Winter Nail Art', 'Winter Nail Designs', 'Winter Nail Ideas'],
  };

  return boardMap[category.toLowerCase()] || [
    'Nail Art Ideas',
    'Nail Design Inspiration',
    'Nail Art Gallery',
    'Beautiful Nail Designs'
  ];
}

/**
 * Generate Pinterest hashtag suggestions
 */
export function generatePinterestHashtags(category: string, colors: string[], techniques: string[]): string[] {
  const baseHashtags = ['#nailart', '#naildesign', '#manicure', '#nailinspo', '#nailartideas'];
  
  const categoryHashtags = category ? [`#${category.toLowerCase()}nailart`, `#${category.toLowerCase()}nails`] : [];
  
  const colorHashtags = colors.slice(0, 3).map(color => `#${color.toLowerCase()}nails`);
  
  const techniqueHashtags = techniques.slice(0, 2).map(technique => `#${technique.toLowerCase()}nailart`);
  
  // Combine and limit to 10 hashtags (Pinterest best practice)
  return [...baseHashtags, ...categoryHashtags, ...colorHashtags, ...techniqueHashtags].slice(0, 10);
}

/**
 * Create Pinterest Rich Pins data from gallery item
 */
export function createPinterestRichPinDataFromItem(item: {
  design_name?: string;
  category?: string;
  prompt?: string;
  image_url: string;
  created_at: string;
  colors?: string[];
  techniques?: string[];
  occasions?: string[];
}, pageUrl: string): PinterestRichPinData {
  return {
    title: `${item.design_name || 'AI Generated'} ${item.category ? `- ${item.category}` : ''} Nail Art Design`,
    description: item.prompt 
      ? `${item.prompt} Try this ${item.category || 'nail art'} design virtually with AI-powered nail art try-on. Get inspired with beautiful nail art ideas!`
      : `Beautiful ${item.design_name || 'AI Generated'} nail art design. Perfect for ${item.category || 'any'} occasion. Try this design virtually and get inspired!`,
    imageUrl: item.image_url,
    pageUrl,
    author: 'Nail Art AI',
    publishedTime: item.created_at || new Date().toISOString(),
    section: item.category || 'Nail Art',
    tags: [
      ...(item.colors || []).slice(0, 3),
      ...(item.techniques || []).slice(0, 2),
      ...(item.occasions || []).slice(0, 2),
      item.category || 'nail-art'
    ].filter(Boolean),
    category: item.category || 'nail-art',
    designName: item.design_name || 'AI Generated'
  };
}
