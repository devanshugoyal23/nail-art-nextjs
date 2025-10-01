// AI Image Prompts for Nail Art Gallery
// This file contains all the prompts organized by category and priority

export interface PromptCategory {
  name: string;
  priority: 'TIER_1' | 'TIER_2' | 'TIER_3' | 'TIER_4';
  searchVolume: string;
  competition: 'LOW' | 'MEDIUM' | 'HIGH';
  growth?: string;
  prompts: string[];
}

export const PROMPT_CATEGORIES: PromptCategory[] = [
  // TIER 1 - HIGHEST PRIORITY CATEGORIES
  {
    name: 'Christmas Nail Art',
    priority: 'TIER_1',
    searchVolume: '500K searches',
    competition: 'MEDIUM',
    prompts: [
      "Elegant Christmas nail art with red and gold glitter, snowflake patterns, and tiny Christmas tree details on a white base",
      "Festive red and green Christmas nail design with holly leaves, berries, and gold accents on short square nails",
      "White Christmas nail art with silver snowflakes, red berries, and gold glitter tips on almond-shaped nails",
      "Classic Christmas nail design featuring Santa hat patterns, candy cane stripes, and white snowflakes",
      "Luxurious gold and red Christmas nails with metallic finish, tiny ornaments, and sparkly glitter",
      "Cozy Christmas sweater nail art with cable knit patterns, red and white stripes, and gold details",
      "Winter wonderland nails with white base, blue snowflakes, silver glitter, and tiny snowman accents",
      "Christmas tree nail art with green gradient, gold star on ring finger, and tiny presents on thumb",
      "Red and white candy cane striped nails with green holly leaves and gold glitter accents",
      "Elegant Christmas nail design with nude base, red French tips, and tiny gold Christmas lights"
    ]
  },
  {
    name: 'Halloween Nail Art',
    priority: 'TIER_1',
    searchVolume: '500K searches',
    competition: 'HIGH',
    growth: '+900% growth',
    prompts: [
      "Spooky Halloween nail art with black base, orange pumpkins, and white ghost silhouettes",
      "Creepy Halloween nails with black and orange gradient, spider webs, and tiny bats",
      "Halloween nail design featuring black base, white skulls, and red blood drips",
      "Festive Halloween nails with orange base, black cats, and white moon details",
      "Spooky Halloween nail art with black base, green witch hats, and purple glitter",
      "Creepy Halloween design with white base, black spider webs, and red spider accents",
      "Halloween nail art with orange base, black stripes, and tiny white ghosts",
      "Spooky Halloween nails with black base, orange pumpkins, and green witch details",
      "Creepy Halloween design featuring black base, white bones, and red blood splatters",
      "Halloween nail art with purple base, black bats, and silver glitter moon"
    ]
  },
  {
    name: 'Summer Nail Art',
    priority: 'TIER_1',
    searchVolume: '500K searches',
    competition: 'HIGH',
    prompts: [
      "Vibrant summer nail art with bright coral base, white palm trees, and gold sun details",
      "Tropical summer nails with turquoise base, pink flamingos, and white clouds",
      "Beach summer nail design with blue gradient, white waves, and gold sand details",
      "Sunny summer nail art with yellow base, orange sun, and white cloud patterns",
      "Tropical summer nails with pink base, green palm leaves, and gold pineapple accents",
      "Beach summer design with white base, blue waves, and gold seashell details",
      "Vibrant summer nail art with orange base, yellow sun, and white seagull silhouettes",
      "Tropical summer nails with green base, pink flowers, and gold butterfly details",
      "Summer nail design with blue base, white clouds, and yellow sun rays",
      "Beach summer nail art with sand-colored base, blue waves, and white seagull details"
    ]
  },
  {
    name: 'Fall/Autumn Nail Art',
    priority: 'TIER_1',
    searchVolume: '500K searches',
    competition: 'HIGH',
    growth: '+900% growth',
    prompts: [
      "Cozy autumn nail art with warm brown base, orange leaves, and gold acorn details",
      "Fall nail design with deep red base, yellow leaves, and brown tree branch patterns",
      "Autumn nail art with orange base, brown leaves, and gold pumpkin accents",
      "Fall nails with warm brown base, red and yellow leaves, and gold glitter details",
      "Autumn nail design with deep orange base, brown tree branches, and gold leaf details",
      "Fall nail art with brown base, orange pumpkins, and gold autumn leaves",
      "Autumn nails with warm red base, yellow leaves, and brown acorn details",
      "Fall nail design with orange base, brown tree bark, and gold leaf patterns",
      "Autumn nail art with deep brown base, orange leaves, and gold pumpkin details",
      "Fall nails with warm orange base, red leaves, and brown tree branch accents"
    ]
  },
  {
    name: 'French Nail Art',
    priority: 'TIER_1',
    searchVolume: '500K searches',
    competition: 'HIGH',
    prompts: [
      "Classic French manicure with nude base, white tips, and subtle pink undertones",
      "Modern French nail art with nude base, white tips, and gold glitter accent line",
      "Elegant French manicure with pink base, white tips, and silver glitter details",
      "French nail design with nude base, white tips, and tiny gold dots on accent nail",
      "Classic French nails with beige base, white tips, and subtle shimmer finish",
      "Modern French nail art with nude base, white tips, and gold metallic accent",
      "Elegant French manicure with pink base, white tips, and silver glitter line",
      "French nail design with nude base, white tips, and tiny silver stars on accent nail",
      "Classic French nails with beige base, white tips, and subtle pearl finish",
      "Modern French nail art with nude base, white tips, and gold glitter tips"
    ]
  },

  // TIER 2 - HIGH PRIORITY CATEGORIES
  {
    name: 'Butterfly Nail Art',
    priority: 'TIER_2',
    searchVolume: '50K searches',
    competition: 'HIGH',
    prompts: [
      "Delicate butterfly nail art with white base, colorful butterfly wings, and gold antenna details",
      "Elegant butterfly nails with nude base, blue butterfly patterns, and silver glitter accents",
      "Colorful butterfly nail design with pink base, orange butterfly wings, and gold details",
      "Butterfly nail art with white base, purple butterfly patterns, and silver glitter wings",
      "Delicate butterfly nails with nude base, yellow butterfly wings, and gold antenna details",
      "Elegant butterfly nail design with pink base, blue butterfly patterns, and silver accents",
      "Colorful butterfly nail art with white base, orange butterfly wings, and gold glitter details",
      "Butterfly nails with nude base, purple butterfly patterns, and silver glitter wings",
      "Delicate butterfly nail design with pink base, yellow butterfly wings, and gold antenna",
      "Elegant butterfly nail art with white base, blue butterfly patterns, and silver glitter accents"
    ]
  },
  {
    name: 'Leopard Print Nail Art',
    priority: 'TIER_2',
    searchVolume: '50K searches',
    competition: 'HIGH',
    prompts: [
      "Bold leopard print nail art with nude base, brown spots, and black outlines",
      "Elegant leopard nails with beige base, brown leopard spots, and gold glitter accents",
      "Classic leopard print design with nude base, brown spots, and black spot outlines",
      "Leopard nail art with tan base, dark brown spots, and gold metallic details",
      "Bold leopard print nails with nude base, brown spots, and silver glitter accents",
      "Elegant leopard nail design with beige base, brown leopard spots, and gold details",
      "Classic leopard print nail art with nude base, brown spots, and black outlines",
      "Leopard nails with tan base, dark brown spots, and gold metallic accents",
      "Bold leopard print design with nude base, brown spots, and silver glitter details",
      "Elegant leopard nail art with beige base, brown leopard spots, and gold accents"
    ]
  },
  {
    name: 'Snowflake Nail Art',
    priority: 'TIER_2',
    searchVolume: '50K searches',
    competition: 'MEDIUM',
    prompts: [
      "Delicate snowflake nail art with white base, blue snowflakes, and silver glitter details",
      "Elegant snowflake nails with nude base, white snowflakes, and gold glitter accents",
      "Winter snowflake design with white base, blue snowflake patterns, and silver details",
      "Snowflake nail art with light blue base, white snowflakes, and silver glitter accents",
      "Delicate snowflake nails with white base, blue snowflake patterns, and gold glitter details",
      "Elegant snowflake nail design with nude base, white snowflakes, and silver accents",
      "Winter snowflake nail art with white base, blue snowflakes, and silver glitter details",
      "Snowflake nails with light blue base, white snowflake patterns, and gold glitter accents",
      "Delicate snowflake nail design with white base, blue snowflakes, and silver details",
      "Elegant snowflake nail art with nude base, white snowflake patterns, and gold glitter accents"
    ]
  },
  {
    name: 'Nail Art Supplies',
    priority: 'TIER_2',
    searchVolume: '50K searches',
    competition: 'LOW',
    prompts: [
      "Professional nail art brush set with various sizes and shapes for detailed nail art",
      "Nail art stamping plates with intricate patterns and designs for easy nail art",
      "Nail art dotting tools with different sizes for creating perfect dots and patterns",
      "Nail art striping tape in various colors for creating clean lines and designs",
      "Nail art rhinestones and gems in different sizes and colors for embellishments",
      "Nail art glitter in various colors and sizes for sparkly nail designs",
      "Nail art foil in metallic colors for creating chrome and foil effects",
      "Nail art stencils with various patterns for easy nail art application",
      "Nail art decals with pre-made designs for quick nail art application",
      "Nail art sponges for creating gradient and ombre effects"
    ]
  },
  {
    name: 'Black Nail Art',
    priority: 'TIER_2',
    searchVolume: '50K searches',
    competition: 'HIGH',
    prompts: [
      "Elegant black nail art with glossy black base and white geometric patterns",
      "Bold black nails with matte black base and gold glitter accents",
      "Classic black nail design with black base and white polka dots",
      "Black nail art with glossy black base and silver metallic details",
      "Elegant black nails with black base and gold French tips",
      "Bold black nail design with matte black base and white stripes",
      "Classic black nail art with black base and silver glitter accents",
      "Black nails with glossy black base and gold geometric patterns",
      "Elegant black nail design with black base and white floral patterns",
      "Bold black nail art with matte black base and gold metallic details"
    ]
  },

  // TIER 4 - LONG-TAIL OPPORTUNITIES (GOLD MINES!)
  {
    name: 'Abstract Nail Art',
    priority: 'TIER_4',
    searchVolume: '5K searches',
    competition: 'LOW',
    prompts: [
      "Abstract nail art with colorful geometric shapes and bold brush strokes",
      "Modern abstract nail design with black and white patterns and gold accents",
      "Abstract nail art with rainbow colors and flowing lines",
      "Bold abstract nail design with red and blue shapes and silver details",
      "Abstract nail art with purple and yellow patterns and gold glitter",
      "Modern abstract nails with green and orange shapes and silver accents",
      "Abstract nail design with pink and blue patterns and gold metallic details",
      "Bold abstract nail art with black and white shapes and rainbow glitter",
      "Abstract nail art with red and green patterns and silver metallic accents",
      "Modern abstract nail design with blue and yellow shapes and gold details"
    ]
  },
  {
    name: 'Minimalist Nail Art',
    priority: 'TIER_4',
    searchVolume: '5K searches',
    competition: 'LOW',
    prompts: [
      "Minimalist nail art with nude base and single white line on each nail",
      "Simple minimalist nails with white base and tiny black dots",
      "Minimalist nail design with beige base and single gold line",
      "Clean minimalist nail art with nude base and white geometric shapes",
      "Simple minimalist nails with white base and single silver dot",
      "Minimalist nail design with beige base and tiny white hearts",
      "Clean minimalist nail art with nude base and single black line",
      "Simple minimalist nails with white base and gold geometric shapes",
      "Minimalist nail design with beige base and single silver line",
      "Clean minimalist nail art with nude base and white polka dots"
    ]
  },
  {
    name: 'Japanese Nail Art',
    priority: 'TIER_4',
    searchVolume: '5K searches',
    competition: 'LOW',
    prompts: [
      "Japanese nail art with cherry blossom patterns and pink and white colors",
      "Traditional Japanese nail design with wave patterns and blue and white colors",
      "Japanese nail art with koi fish patterns and orange and gold colors",
      "Traditional Japanese nail design with bamboo patterns and green and white colors",
      "Japanese nail art with fan patterns and red and gold colors",
      "Traditional Japanese nail design with lantern patterns and red and yellow colors",
      "Japanese nail art with geisha patterns and white and red colors",
      "Traditional Japanese nail design with temple patterns and gold and red colors",
      "Japanese nail art with sakura patterns and pink and white colors",
      "Traditional Japanese nail design with zen patterns and black and white colors"
    ]
  },
  // Added per strategy: starter low-competition, actionable categories
  {
    name: "St. Patrick's Day Nails",
    priority: 'TIER_2',
    searchVolume: '50K searches',
    competition: 'LOW',
    prompts: [
      "St. Patrick's Day nails with shamrock accents and gold flakes",
      "Emerald green chrome nails with lucky clover charm",
      "Green French tips with gold glitter cuticle line",
      "Mint ombré nails with subtle shamrock stamping",
      "Plaid green nails with gold foil accents"
    ]
  },
  {
    name: 'Simple Christmas Nails',
    priority: 'TIER_4',
    searchVolume: '50K searches',
    competition: 'LOW',
    prompts: [
      "Simple red tips with white snowflake accent",
      "Minimal green dots on nude base",
      "Gold glitter fade on red base",
      "White tree outline on milky base",
      "Candy cane stripes accent nail"
    ]
  },
  {
    name: 'Nail Art for Beginners',
    priority: 'TIER_4',
    searchVolume: '5K searches',
    competition: 'MEDIUM',
    prompts: [
      "Beginner nail art with single dot on each nail",
      "Easy stripe across nude base with tape guide",
      "Simple French tips with soft white",
      "Single glitter accent nail with neutral set",
      "Minimal heart accent on ring finger"
    ]
  },
  {
    name: 'Easy Halloween Nails',
    priority: 'TIER_4',
    searchVolume: '5K searches',
    competition: 'MEDIUM',
    prompts: [
      "Black tips with tiny ghost accent",
      "Orange base with minimal bat silhouette",
      "White web accent on black nail",
      "Pumpkin outline on nude base",
      "Striped Halloween accent and plain set"
    ]
  },
  {
    name: 'DIY Nail Art',
    priority: 'TIER_4',
    searchVolume: '5K searches',
    competition: 'MEDIUM',
    prompts: [
      "DIY diagonal lines using tape on nude base",
      "DIY dotting tool polka dots on sheer base",
      "DIY sponge gradient in soft pink tones",
      "DIY stamping florals with white polish",
      "DIY glitter fade from tip to center"
    ]
  },
  {
    name: 'Nail Art Near Me',
    priority: 'TIER_4',
    searchVolume: '5K searches',
    competition: 'LOW',
    prompts: [
      "Salon-style nail art with glossy finish and clean cuticles",
      "Modern salon nail art with chrome aura and micro gems",
      "Simple salon nail art with French tips and shimmer",
      "Elegant salon nail art with nude base and gold foil",
      "Trendy salon nail art with pastel ombré gradient"
    ]
  },
  // Missing Tier 1 Core categories
  {
    name: 'Nail Art Designs',
    priority: 'TIER_1',
    searchVolume: '50K searches',
    competition: 'HIGH',
    prompts: [
      "Trendy nail art designs with chrome accents",
      "Minimal nail art designs with negative space",
      "Floral nail art designs on nude base",
      "Geometric nail art designs in black and white",
      "Glitter nail art designs with soft ombré"
    ]
  },
  {
    name: 'Nails Design',
    priority: 'TIER_1',
    searchVolume: '500K searches',
    competition: 'HIGH',
    prompts: [
      "Nails design with glossy red and clean shape",
      "Nails design with chrome French tips",
      "Nails design with floral accents on nude",
      "Nails design with marble effect and gold",
      "Nails design with minimalist lines"
    ]
  },
  // Missing Tier 2 Style categories
  {
    name: 'French Nails Design',
    priority: 'TIER_2',
    searchVolume: '50K searches',
    competition: 'HIGH',
    prompts: [
      "Ultra-thin white tips on a sheer pink base",
      "Micro French in pastel blue on nude base",
      "Diagonal gold French tips on beige base",
      "Reverse French crescent at cuticle on milky base",
      "Chrome French tips over soft pink"
    ]
  },
  {
    name: 'Leopard Print Nails',
    priority: 'TIER_2',
    searchVolume: '50K searches',
    competition: 'HIGH',
    prompts: [
      "Leopard print on nude base with black outlines",
      "Matte leopard spots with neutral base",
      "French leopard tips on beige base",
      "Glitter leopard accent nail on nude",
      "Tan base leopard spots with gold foil"
    ]
  },
  {
    name: 'Snowflake Nails',
    priority: 'TIER_2',
    searchVolume: '50K searches',
    competition: 'MEDIUM',
    prompts: [
      "Sheer nude base with fine white snowflakes",
      "Icy blue ombré with silver glitter accents",
      "White snowflakes with chrome silver tips",
      "Minimal single snowflake accent on milky base",
      "Stamped snowflakes over pastel blue"
    ]
  },
  {
    name: 'Nail Style',
    priority: 'TIER_2',
    searchVolume: '50K searches',
    competition: 'HIGH',
    prompts: [
      "Milky base with chrome swirls",
      "Negative space geometric lines",
      "Blush pink with gold accents",
      "Matte black with silver foil details",
      "Classic glossy red with clean shape"
    ]
  },
  {
    name: 'Nail Charms',
    priority: 'TIER_2',
    searchVolume: '50K searches',
    competition: 'HIGH',
    prompts: [
      "Tiny gold heart charms on nude base",
      "Pearl charms on milky base with chrome accents",
      "Crystal cluster charm on ring finger",
      "Star charms scattered on sheer pink",
      "Butterfly charms with soft glitter gradient"
    ]
  },
  {
    name: 'Nail Gems',
    priority: 'TIER_2',
    searchVolume: '50K searches',
    competition: 'HIGH',
    prompts: [
      "Gem crescent near cuticle on nude base",
      "Scattered micro gems on glossy black",
      "Crystal clusters on chrome French tips",
      "Single gem accent on milky base",
      "Gem gradient from tip toward center"
    ]
  },
  // Missing Tier 2 Color categories
  {
    name: 'White Nail Art',
    priority: 'TIER_2',
    searchVolume: '50K searches',
    competition: 'HIGH',
    prompts: [
      "Glossy white with chrome aura",
      "Milky white with micro glitter veil",
      "White marble with soft gray veining",
      "Matte white with glossy geometric lines",
      "Embossed white sweater texture accent"
    ]
  },
  {
    name: 'Purple Nail Art',
    priority: 'TIER_2',
    searchVolume: '50K searches',
    competition: 'HIGH',
    prompts: [
      "Lavender chrome aura",
      "Purple ombré with silver glitter",
      "Deep plum with gold foil",
      "Pastel purple with tiny white florals",
      "Iridescent purple holographic shimmer"
    ]
  },
  {
    name: 'Blue Nail Art',
    priority: 'TIER_2',
    searchVolume: '50K searches',
    competition: 'HIGH',
    prompts: [
      "Baby blue with cloud accents and silver stars",
      "Cobalt blue with chrome French tips",
      "Blue watercolor with white swirls",
      "Navy blue with gold foil details",
      "Blue glazed donut glossy finish"
    ]
  },
  {
    name: 'Red Nail Art',
    priority: 'TIER_2',
    searchVolume: '50K searches',
    competition: 'HIGH',
    prompts: [
      "Classic glossy red high-shine gel finish",
      "Cherry red with chrome aura",
      "Red French tips with micro glitter",
      "Deep burgundy with gold foil",
      "Matte red with glossy heart accents"
    ]
  },
  // Missing Tier 2 Seasonal sub-categories
  {
    name: 'Easter Nail Art',
    priority: 'TIER_2',
    searchVolume: '50K searches',
    competition: 'MEDIUM',
    prompts: [
      "Pastel stripes with tiny white daisies",
      "Speckled egg nails in soft pastels",
      "Bunny accent on milky base",
      "Pastel ombré with floral Easter accents",
      "Minimal dots and lines in spring colors"
    ]
  },
  {
    name: '4th of July Nails',
    priority: 'TIER_2',
    searchVolume: '50K searches',
    competition: 'MEDIUM',
    prompts: [
      "Red, white, blue glitter gradient",
      "Stars and stripes with chrome silver",
      "Minimal patriotic French tips",
      "Blue base with white stars and silver foil",
      "Firework sparkle on dark navy base"
    ]
  },
  {
    name: 'Thanksgiving Nail Art',
    priority: 'TIER_2',
    searchVolume: '50K searches',
    competition: 'MEDIUM',
    prompts: [
      "Warm cinnamon and pumpkin tones",
      "Maple leaf accents on nude with gold",
      "Cozy plaid accent with fall palette",
      "Burnt orange ombré with shimmer",
      "Minimal harvest motifs with line art"
    ]
  },
  {
    name: 'Valentine Nail Art',
    priority: 'TIER_2',
    searchVolume: '50K searches',
    competition: 'MEDIUM',
    prompts: [
      "Tiny white hearts on blush base",
      "Pink chrome aura with heart charms",
      "Red French tips with glitter hearts",
      "Milky base with heart confetti gradient",
      "Minimal heart outline on nude"
    ]
  }
];

export function getPromptsByCategory(categoryName: string): string[] {
  const category = PROMPT_CATEGORIES.find(cat => 
    cat.name.toLowerCase().includes(categoryName.toLowerCase()) ||
    categoryName.toLowerCase().includes(cat.name.toLowerCase())
  );
  return category ? category.prompts : [];
}

export function getRandomPromptFromCategory(categoryName: string): string | null {
  const prompts = getPromptsByCategory(categoryName);
  if (prompts.length === 0) return null;
  return prompts[Math.floor(Math.random() * prompts.length)];
}

export function getAllCategories(): string[] {
  return PROMPT_CATEGORIES.map(cat => cat.name);
}

export function getCategoriesByPriority(priority: 'TIER_1' | 'TIER_2' | 'TIER_3' | 'TIER_4'): string[] {
  return PROMPT_CATEGORIES
    .filter(cat => cat.priority === priority)
    .map(cat => cat.name);
}
