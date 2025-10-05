/**
 * React Hook for Automatic SEO Generation
 * Automatically generates SEO when new content is created
 */

import { useCallback } from 'react';

interface UseAutoSEOOptions {
  autoGenerate?: boolean;
  notifySearchEngines?: boolean;
  updateSitemap?: boolean;
}

interface AutoSEOResult {
  success: boolean;
  seoData?: any;
  error?: string;
}

export function useAutoSEO(options: UseAutoSEOOptions = {}) {
  const {
    autoGenerate = true,
    notifySearchEngines = true,
    updateSitemap = true
  } = options;

  const generateSEO = useCallback(async (
    content: any,
    pageType: string
  ): Promise<AutoSEOResult> => {
    try {
      const response = await fetch('/api/auto-seo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          pageType,
          config: {
            autoGenerate,
            notifySearchEngines,
            updateSitemap
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate SEO');
      }

      const data = await response.json();
      return {
        success: true,
        seoData: data.seoData
      };

    } catch (error) {
      console.error('Error generating SEO:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }, [autoGenerate, notifySearchEngines, updateSitemap]);

  const generateBulkSEO = useCallback(async (
    contentItems: any[],
    pageType: string
  ): Promise<AutoSEOResult> => {
    try {
      const response = await fetch('/api/auto-seo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: contentItems,
          pageType,
          bulk: true,
          config: {
            autoGenerate,
            notifySearchEngines,
            updateSitemap
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate bulk SEO');
      }

      const data = await response.json();
      return {
        success: true,
        seoData: data.results
      };

    } catch (error) {
      console.error('Error generating bulk SEO:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }, [autoGenerate, notifySearchEngines, updateSitemap]);

  const regenerateSitemap = useCallback(async (): Promise<AutoSEOResult> => {
    try {
      const response = await fetch('/api/regenerate-sitemap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({})
      });

      if (!response.ok) {
        throw new Error('Failed to regenerate sitemap');
      }

      return {
        success: true
      };

    } catch (error) {
      console.error('Error regenerating sitemap:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }, []);

  const pingSearchEngines = useCallback(async (): Promise<AutoSEOResult> => {
    try {
      // Ping Google
      await fetch('https://www.google.com/ping?sitemap=https://nailartai.app/sitemap.xml');
      
      // Ping Bing
      await fetch('https://www.bing.com/ping?sitemap=https://nailartai.app/sitemap.xml');

      return {
        success: true
      };

    } catch (error) {
      console.error('Error notifying search engines:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }, []);

  return {
    generateSEO,
    generateBulkSEO,
    regenerateSitemap,
    pingSearchEngines
  };
}
