# Static Data Directory

This directory contains pre-generated static data files to optimize performance and reduce API costs.

## Structure

```
src/data/
├── cities/          # Pre-generated city listings for each state
│   ├── alabama.json
│   ├── alaska.json
│   └── ... (50 state files)
└── README.md        # This file
```

## Cities Data

### Purpose
Cities data is pre-generated to avoid making Gemini API calls on every state page visit.

### Benefits
- ⚡ **99.8% faster** - 5-10ms vs 2-5 seconds
- 💰 **Zero cost** - No API calls
- 🔒 **100% reliable** - No API failures
- 📊 **Consistent** - Same data for all users

### Generation
Cities JSON files are generated using:
```bash
npm run generate-cities
```

This script uses the Gemini API to fetch comprehensive city listings for each state, then saves them as JSON files.

### File Format

Each state JSON file follows this structure:

```json
{
  "state": "California",
  "stateCode": "CA",
  "generatedAt": "2025-11-06T12:00:00Z",
  "citiesCount": 87,
  "cities": [
    {
      "name": "Los Angeles",
      "slug": "los-angeles",
      "salonCount": 0
    }
  ]
}
```

### Update Frequency
Cities rarely change. Recommended update frequency:
- **Production:** Quarterly (every 3 months)
- **Development:** As needed

### Regeneration
To regenerate all cities data:
```bash
npm run generate-cities
```

To regenerate a specific state:
```bash
npm run generate-cities -- --state="California"
```

## Maintenance

### When to Update
- New major cities are founded (rare)
- Significant population changes
- User reports missing cities
- Quarterly maintenance schedule

### How to Update
1. Run generation script
2. Review changes in git diff
3. Commit updated JSON files
4. Deploy to production

## Notes

- JSON files are committed to git (they're small and rarely change)
- Fallback to API exists if JSON is missing
- Generation script includes rate limiting to avoid API throttling

