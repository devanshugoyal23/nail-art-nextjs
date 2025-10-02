// High-volume keyword to URL mapping based on Keyword Stats CSV
// Maps search terms to internal hub pages for SEO linking

export interface KeywordLink {
  keyword: string;
  href: string;
  searchVolume: string;
}

export const HIGH_VALUE_KEYWORDS: KeywordLink[] = [
  // Tier 1 - Seasonal & Holiday (500K+ searches)
  { keyword: 'Christmas Nail Art', href: '/christmas-nail-art', searchVolume: '500K' },
  { keyword: 'Halloween Nail Art', href: '/halloween-nail-art', searchVolume: '500K' },
  { keyword: 'Summer Nail Art', href: '/summer-nail-art', searchVolume: '500K' },
  { keyword: 'Fall Nail Art', href: '/fall-nail-art', searchVolume: '500K' },
  { keyword: 'Autumn Nail Art', href: '/autumn-nail-art', searchVolume: '500K' },
  
  // Tier 1 - Core Design (500K+ searches)
  { keyword: 'French Nail Art', href: '/french-nail-art', searchVolume: '500K' },
  { keyword: 'Nail Art Designs', href: '/nail-art-designs', searchVolume: '50K' },
  { keyword: 'Nails Design', href: '/nails-design', searchVolume: '500K' },
  { keyword: 'French Nails Design', href: '/french-nails-design', searchVolume: '500K' },
  
  // Tier 2 - Style Categories (50K+ searches)
  { keyword: 'Butterfly Nail Art', href: '/butterfly-nail-art', searchVolume: '50K' },
  { keyword: 'Leopard Print Nails', href: '/leopard-print-nails', searchVolume: '50K' },
  { keyword: 'Snowflake Nails', href: '/snowflake-nails', searchVolume: '50K' },
  { keyword: 'Nail Style', href: '/nail-style', searchVolume: '50K' },
  { keyword: 'Nail Charms', href: '/nail-charms', searchVolume: '50K' },
  { keyword: 'Nail Gems', href: '/nail-gems', searchVolume: '50K' },
  
  // Tier 2 - Color Categories (50K+ searches)
  { keyword: 'Black Nail Art', href: '/black-nail-art', searchVolume: '50K' },
  { keyword: 'White Nail Art', href: '/white-nail-art', searchVolume: '50K' },
  { keyword: 'Purple Nail Art', href: '/purple-nail-art', searchVolume: '50K' },
  { keyword: 'Blue Nail Art', href: '/blue-nail-art', searchVolume: '50K' },
  { keyword: 'Red Nail Art', href: '/red-nail-art', searchVolume: '50K' },
  { keyword: 'Pink Nail Art', href: '/pink-nail-art', searchVolume: '50K' },
  
  // Tier 2 - Seasonal Sub-categories (50K+ searches)
  { keyword: 'Easter Nail Art', href: '/easter-nail-art', searchVolume: '50K' },
  { keyword: '4th of July Nails', href: '/4th-of-july-nails', searchVolume: '50K' },
  { keyword: 'Thanksgiving Nail Art', href: '/thanksgiving-nail-art', searchVolume: '50K' },
  { keyword: 'Valentine Nail Art', href: '/valentine-nail-art', searchVolume: '50K' },
  { keyword: 'St Patrick\'s Day Nails', href: '/st-patricks-day-nails', searchVolume: '50K' },
  
  // Tier 3 - Technique Categories (5K+ searches)
  { keyword: '3D Nail Art', href: '/3d-nail-art', searchVolume: '5K' },
  { keyword: 'Marble Nail Art', href: '/marble-nail-art', searchVolume: '5K' },
  { keyword: 'Chrome Nail Art', href: '/chrome-nail-art', searchVolume: '5K' },
  { keyword: 'Gel Nail Art', href: '/gel-nail-art', searchVolume: '5K' },
  { keyword: 'Stamping Nail Art', href: '/stamping-nail-art', searchVolume: '5K' },
  { keyword: 'Abstract Nail Art', href: '/abstract-nail-art', searchVolume: '50K' },
  { keyword: 'Ombre Nail Art', href: '/ombre-nail-art', searchVolume: '50K' },
  
  // Tier 3 - Character & Theme (5K+ searches)
  { keyword: 'Disney Nail Art', href: '/disney-nail-art', searchVolume: '5K' },
  { keyword: 'Hello Kitty Nail Art', href: '/hello-kitty-nail-art', searchVolume: '5K' },
  { keyword: 'Mickey Mouse Nail Art', href: '/mickey-mouse-nail-art', searchVolume: '5K' },
  { keyword: 'Flower Nail Art', href: '/flower-nail-art', searchVolume: '5K' },
  { keyword: 'Sunflower Nail Art', href: '/sunflower-nail-art', searchVolume: '5K' },
  { keyword: 'Cherry Blossom Nail Art', href: '/cherry-blossom-nail-art', searchVolume: '5K' },
  
  // Tier 3 - Specialty (5K+ searches)
  { keyword: 'Easy Nail Art', href: '/easy-nail-art', searchVolume: '5K' },
  { keyword: 'Simple Nail Art', href: '/simple-nail-art', searchVolume: '5K' },
  { keyword: 'Wedding Nail Art', href: '/wedding-nail-art', searchVolume: '5K' },
  { keyword: 'Toe Nail Art', href: '/toe-nail-art', searchVolume: '50K' },
  { keyword: 'Short Nail Art', href: '/short-nail-art', searchVolume: '5K' },
  { keyword: 'Acrylic Nail Art', href: '/acrylic-nail-art', searchVolume: '50K' },
  { keyword: 'Watercolor Nail Art', href: '/watercolor-nail-art', searchVolume: '5K' },
  { keyword: 'Gradient Nail Art', href: '/gradient-nail-art', searchVolume: '5K' },
  
  // Tier 4 - Long-tail (500+ searches, low competition)
  { keyword: 'Minimalist Nail Art', href: '/minimalist-nail-art', searchVolume: '5K' },
  { keyword: 'Japanese Nail Art', href: '/japanese-nail-art', searchVolume: '5K' },
  { keyword: 'Nail Art for Beginners', href: '/nail-art-for-beginners', searchVolume: '5K' },
  { keyword: 'DIY Nail Art', href: '/diy-nail-art', searchVolume: '5K' },
];

/**
 * Get related keywords for a given category/design
 */
export function getRelatedKeywords(category?: string, colors?: string[], techniques?: string[]): string[] {
  const related: string[] = [];
  
  if (!category) return [];
  
  const categoryLower = category.toLowerCase();
  
  // Find exact matches
  const exactMatch = HIGH_VALUE_KEYWORDS.find(kw => 
    kw.keyword.toLowerCase() === categoryLower
  );
  if (exactMatch) {
    related.push(exactMatch.keyword);
  }
  
  // Find color-based matches
  if (colors && colors.length > 0) {
    colors.forEach(color => {
      const colorMatch = HIGH_VALUE_KEYWORDS.find(kw => 
        kw.keyword.toLowerCase().includes(color.toLowerCase())
      );
      if (colorMatch && !related.includes(colorMatch.keyword)) {
        related.push(colorMatch.keyword);
      }
    });
  }
  
  // Find technique-based matches
  if (techniques && techniques.length > 0) {
    techniques.forEach(tech => {
      const techMatch = HIGH_VALUE_KEYWORDS.find(kw => 
        kw.keyword.toLowerCase().includes(tech.toLowerCase())
      );
      if (techMatch && !related.includes(techMatch.keyword)) {
        related.push(techMatch.keyword);
      }
    });
  }
  
  // Add generic high-value terms if we don't have enough
  if (related.length < 3) {
    ['Nail Art Designs', 'Nails Design', 'Simple Nail Art'].forEach(kw => {
      if (!related.includes(kw)) {
        related.push(kw);
      }
    });
  }
  
  return related.slice(0, 5);
}

/**
 * Get internal links for editorial based on keywords
 */
export function getInternalLinksForKeywords(keywords: string[]): { label: string; href: string }[] {
  const links: { label: string; href: string }[] = [];
  
  keywords.forEach(keyword => {
    const match = HIGH_VALUE_KEYWORDS.find(kw => 
      kw.keyword.toLowerCase() === keyword.toLowerCase()
    );
    if (match) {
      links.push({
        label: `Explore ${match.keyword}`,
        href: match.href
      });
    }
  });
  
  return links.slice(0, 3);
}

