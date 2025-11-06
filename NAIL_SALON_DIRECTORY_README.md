# Nail Salon Directory Feature

This feature provides a comprehensive nail salon directory with programmatic SEO pages, powered by Google Gemini API with Google Maps Grounding.

## Overview

The nail salon directory allows users to browse nail salons by:
1. **State** → `/nail-salons/[state]`
2. **City** → `/nail-salons/[state]/[city]`
3. **Individual Salon** → `/nail-salons/[state]/[city]/[slug]`

## Features

- ✅ Hierarchical navigation (States → Cities → Salons)
- ✅ Programmatic SEO with dynamic page generation
- ✅ Google Gemini API integration with Google Maps Grounding
- ✅ Individual salon detail pages with full information
- ✅ Google Maps widget integration (optional)
- ✅ Comprehensive sitemap generation
- ✅ SEO-optimized metadata for all pages

## API Endpoints

### Get All States
```
GET /api/nail-salons/states
```

### Get Cities in a State
```
GET /api/nail-salons/cities?state=California
```

### Get Salons in a Location
```
GET /api/nail-salons/salons?state=California&city=Los Angeles&limit=20
```

### Get Salon by Slug
```
GET /api/nail-salons/[slug]?state=California&city=Los Angeles
```

## Configuration

### Required Environment Variables

1. **GEMINI_API_KEY** (Required)
   - Your Google Gemini API key
   - Used for querying nail salon data with Google Maps Grounding
   - Get your key from: https://ai.google.dev/

### Optional Environment Variables

2. **NEXT_PUBLIC_GOOGLE_MAPS_API_KEY** (Optional)
   - Google Maps JavaScript API key
   - Used for enhanced map widget functionality
   - If not provided, the widget will still work but with limited features
   - Get your key from: https://console.cloud.google.com/

## How It Works

1. **Data Fetching**: Uses Google Gemini API with Google Maps Grounding to fetch real-time nail salon data
2. **Page Generation**: Next.js App Router generates pages dynamically based on state, city, and salon slugs
3. **SEO**: Each page includes comprehensive metadata, structured data, and proper semantic HTML
4. **Sitemap**: Automatically generates sitemap entries for all salon pages

## Usage

### Browse States
Navigate to `/nail-salons` to see all available states.

### Browse Cities
Navigate to `/nail-salons/[state]` (e.g., `/nail-salons/california`) to see cities in that state.

### Browse Salons
Navigate to `/nail-salons/[state]/[city]` (e.g., `/nail-salons/california/los-angeles`) to see salons in that city.

### View Salon Details
Navigate to `/nail-salons/[state]/[city]/[slug]` to see detailed information about a specific salon.

## Sitemap

The nail salon pages are automatically included in the sitemap:
- `/sitemap-nail-salons.xml` - Dedicated sitemap for nail salon pages
- Included in `/sitemap-index.xml` - Main sitemap index

## Google Maps Grounding

This feature leverages Google Gemini's Grounding with Google Maps feature, which:
- Provides accurate, location-aware responses
- Includes up-to-date business information
- Returns Google Maps place IDs and URIs
- Can generate contextual map widgets

For more information, see: https://ai.google.dev/gemini-api/docs/maps-grounding

## Pricing

Google Maps Grounding pricing:
- **$25 per 1K grounded prompts**
- Free tier: Up to 500 requests per day
- Only counts requests that successfully return at least one Google Maps grounded result

## Limitations

- Geographical Scope: Currently optimized for US states
- Model Support: Uses Gemini 2.5 Flash (supports Maps Grounding)
- Rate Limits: Subject to Gemini API rate limits
- Data Freshness: Data is fetched in real-time from Google Maps

## Future Enhancements

- [ ] Caching layer for frequently accessed data
- [ ] Search functionality
- [ ] Filtering by services, ratings, etc.
- [ ] User reviews integration
- [ ] Booking functionality
- [ ] Photo galleries
- [ ] Directions integration

## Troubleshooting

### No salons found for a location
- Check that the GEMINI_API_KEY is set correctly
- Verify the state and city names are spelled correctly
- Check API rate limits and quotas

### Google Maps widget not showing
- Ensure NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is set (optional)
- The widget should still work with just the context token from Gemini
- Check browser console for errors

### Slow page loads
- The sitemap generation processes states and cities in batches to avoid timeouts
- Consider implementing caching for frequently accessed locations
- Monitor API response times

## Notes

- The salon data parsing is optimized but may need refinement based on actual API responses
- City lists are generated dynamically and may vary
- Salon counts are calculated on-demand and may not be cached
- All pages follow Next.js App Router conventions for optimal SEO

