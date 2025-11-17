# IndexNow Setup Guide

## Prerequisites

Before submitting URLs to IndexNow, you need an API key.

### 1. Get Your IndexNow API Key

You can generate an API key from any of these sources:
- **Bing Webmaster Tools**: https://www.bing.com/indexnow
- **Yandex Webmaster**: https://webmaster.yandex.com/
- Or generate your own UUID: https://www.uuidgenerator.net/

### 2. Add API Key to Environment

Add the following to your `.env.local` file:

```bash
INDEXNOW_API_KEY=your-api-key-here
```

### 3. Create API Key File

Create a file at `public/{your-api-key}.txt` with the content being just your API key:

```
your-api-key-here
```

This file must be publicly accessible at:
```
https://nailartai.app/{your-api-key}.txt
```

## Usage

### Submit All URLs (Comprehensive)

This fetches all sitemaps, extracts all URLs, and submits them to IndexNow:

```bash
npm run indexnow:submit-all
```

**Use this when:**
- You want to submit ALL pages to IndexNow immediately
- You have new content and want it indexed quickly
- You're doing a bulk submission for the first time

**What it does:**
1. Fetches `sitemap-index.xml`
2. Fetches all individual sitemaps
3. Extracts all URLs from all sitemaps
4. Submits URLs in batches of 10,000 to IndexNow
5. Notifies Bing, Yandex, and IndexNow.org

### Submit Sitemap URLs Only (Fast)

This only submits the sitemap XML files themselves:

```bash
npm run indexnow:submit-sitemaps
```

**Use this when:**
- You want search engines to discover URLs by crawling sitemaps
- You want a faster submission (doesn't fetch all URLs)
- You update sitemaps regularly

**What it submits:**
- sitemap.xml
- sitemap-index.xml
- sitemap-static.xml
- sitemap-designs.xml
- sitemap-gallery.xml
- sitemap-images.xml
- sitemap-categories.xml
- sitemap-nail-salons.xml
- sitemap-nail-salons-premium.xml
- sitemap-nail-salons-cities.xml

## How IndexNow Works

1. **Submit Once**: You submit URLs to any IndexNow endpoint
2. **Share Instantly**: That search engine shares with all IndexNow partners
3. **Partners Include**:
   - Microsoft Bing
   - Yandex
   - Seznam.cz
   - Naver
   - And more!

## Rate Limits

- **URLs per batch**: 10,000 max
- **Request frequency**: No official limit, but avoid spamming
- **Batching**: Script automatically batches large URL lists

## Verification

After submission, you can verify in:
- **Bing Webmaster Tools**: Check IndexNow submissions
- **Yandex Webmaster**: Check indexing status

## Troubleshooting

### API Key Not Found
```
❌ ERROR: INDEXNOW_API_KEY not found in environment variables
```
**Solution**: Add `INDEXNOW_API_KEY` to your `.env.local` file

### Failed to Submit
```
❌ Failed to submit to https://api.indexnow.org/indexnow: 403 Forbidden
```
**Solution**: Ensure your API key file exists at `https://nailartai.app/{your-key}.txt`

### No URLs Found
```
No sitemap URLs found in sitemap index
```
**Solution**: Ensure your site is deployed and sitemaps are accessible at `https://nailartai.app/sitemap-index.xml`

## Best Practices

1. **Initial Setup**: Use `indexnow:submit-all` for first-time bulk submission
2. **Regular Updates**: Use `indexnow:submit-sitemaps` when you update sitemaps
3. **New Content**: Submit individual URLs immediately after publishing
4. **Don't Spam**: Don't submit the same URL multiple times in a short period

## Additional Resources

- IndexNow Documentation: https://www.indexnow.org/documentation
- Bing Webmaster Tools: https://www.bing.com/webmasters
- Yandex Webmaster: https://webmaster.yandex.com/
