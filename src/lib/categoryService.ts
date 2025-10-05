import { supabase, GalleryItem } from './supabase';

export interface CategoryWithThumbnail {
  category: string;
  count: number;
  thumbnail: string | null;
  sampleItems: GalleryItem[];
  needsContent: boolean;
}

/**
 * Get all categories with thumbnails and sample data
 */
export async function getAllCategoriesWithThumbnails(): Promise<CategoryWithThumbnail[]> {
  try {
    // Get all categories with counts
    const { data: categoryData, error: categoryError } = await supabase
      .from('gallery_items')
      .select('category, image_url, design_name, id, created_at')
      .not('category', 'is', null);

    if (categoryError) {
      console.error('Error fetching categories:', categoryError);
      return [];
    }

    // Group by category and get counts
    const categoryMap = new Map<string, {
      count: number;
      items: GalleryItem[];
    }>();

    categoryData?.forEach(item => {
      const category = item.category;
      if (!categoryMap.has(category)) {
        categoryMap.set(category, { count: 0, items: [] });
      }
      
      const categoryInfo = categoryMap.get(category)!;
      categoryInfo.count++;
      categoryInfo.items.push({
        id: item.id,
        image_url: item.image_url,
        design_name: item.design_name,
        category: item.category,
        created_at: item.created_at
      });
    });

    // Convert to array with thumbnails
    const categoriesWithThumbnails: CategoryWithThumbnail[] = Array.from(categoryMap.entries())
      .map(([category, data]) => ({
        category,
        count: data.count,
        thumbnail: data.items[0]?.image_url || null, // Use first item as thumbnail
        sampleItems: data.items.slice(0, 3), // Get first 3 items as samples
        needsContent: data.count < 5 // Mark as needing content if less than 5 items
      }))
      .sort((a, b) => b.count - a.count); // Sort by count descending

    return categoriesWithThumbnails;
  } catch (error) {
    console.error('Error getting categories with thumbnails:', error);
    return [];
  }
}

/**
 * Get categories with pagination
 */
export async function getCategoriesWithPagination(
  page: number = 1,
  limit: number = 24,
  searchTerm?: string,
  sortBy: 'count' | 'name' | 'recent' = 'count'
): Promise<{
  categories: CategoryWithThumbnail[];
  total: number;
  totalPages: number;
  currentPage: number;
}> {
  try {
    const allCategories = await getAllCategoriesWithThumbnails();
    
    // Filter by search term if provided
    let filteredCategories = allCategories;
    if (searchTerm) {
      filteredCategories = allCategories.filter(cat => 
        cat.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort categories
    switch (sortBy) {
      case 'name':
        filteredCategories.sort((a, b) => a.category.localeCompare(b.category));
        break;
      case 'recent':
        // Sort by most recent items (this would need additional data)
        break;
      case 'count':
      default:
        filteredCategories.sort((a, b) => b.count - a.count);
        break;
    }

    // Calculate pagination
    const total = filteredCategories.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    
    const paginatedCategories = filteredCategories.slice(startIndex, endIndex);

    return {
      categories: paginatedCategories,
      total,
      totalPages,
      currentPage: page
    };
  } catch (error) {
    console.error('Error getting paginated categories:', error);
    return {
      categories: [],
      total: 0,
      totalPages: 0,
      currentPage: 1
    };
  }
}

/**
 * Get category statistics
 */
export async function getCategoryStatistics(): Promise<{
  totalCategories: number;
  totalItems: number;
  categoriesWithContent: number;
  categoriesNeedingContent: number;
  averageItemsPerCategory: number;
}> {
  try {
    const categories = await getAllCategoriesWithThumbnails();
    
    const totalCategories = categories.length;
    const totalItems = categories.reduce((sum, cat) => sum + cat.count, 0);
    const categoriesWithContent = categories.filter(cat => cat.count >= 5).length;
    const categoriesNeedingContent = categories.filter(cat => cat.count < 5).length;
    const averageItemsPerCategory = totalCategories > 0 ? Math.round(totalItems / totalCategories) : 0;

    return {
      totalCategories,
      totalItems,
      categoriesWithContent,
      categoriesNeedingContent,
      averageItemsPerCategory
    };
  } catch (error) {
    console.error('Error getting category statistics:', error);
    return {
      totalCategories: 0,
      totalItems: 0,
      categoriesWithContent: 0,
      categoriesNeedingContent: 0,
      averageItemsPerCategory: 0
    };
  }
}
