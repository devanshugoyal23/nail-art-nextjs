# 🤖 Nail Salon AI Enrichment System

This documentation covers the architecture, scripts, and workflows for the AI-powered salon enrichment system. The system scales from individual salon testing to bulk processing of 142,000+ salons using Google Gemini and Cloudflare R2.

---

## 🏗️ Architecture Overview

The system follows a Three-Tier refinement process:

1.  **Raw Data Storage (R2)**: Standardized JSON files containing basic information (name, address, rating) gathered from initial scans.
2.  **Enrichment Engine (Gemini)**: A sophisticated service that uses "Tier 1" consolidated prompts to generate high-value marketing content:
    *   Deep "About" sections (250-300 words).
    *   Review Sentiment Analysis (Strengths/Weaknesses).
    *   Dynamic FAQ generation based on real customer reviews.
3.  **Refined Data Storage (R2)**: Fully enriched JSON files stored in `data/nail-salons/enriched/`, ready for SEO-landing pages.

---

## 🛠️ The Scripts

### 1. `scripts/create-quality-queue.ts`
**Purpose**: Scans the entire 142k+ salon database and filters for salons meeting specific quality criteria to create a "Target Queue".

*   **Logic**: It calculates a `priority` score based on `rating * reviewCount`.
*   **Usage**:
    ```bash
    # Create a queue of salons with at least 4.5 stars and 200 reviews
    npx tsx scripts/create-quality-queue.ts --min-rating=4.5 --min-reviews=200 --output=top-premium-queue.json
    ```
*   **Arguments**:
    *   `--min-reviews`: (Default: 100) Minimum reviews to qualify.
    *   `--min-rating`: (Default: 4.0) Minimum star rating to qualify.
    *   `--limit`: Maximum number of salons to add to the queue.
    *   `--dry-run`: View statistics without creating the file.

### 2. `scripts/batch-enrich-salons.ts`
**Purpose**: The "Workhorse" script. It reads a queue file and processes salons in parallel.

*   **Features**:
    *   **High Concurrency**: Processes 20 salons at once (adjustable).
    *   **Resiliency**: Automatically retries 429 (Rate Limit) errors.
    *   **Fallbacks**: If one model fails, it automatically switches to `gemini-2.0-flash-lite` or `gemini-flash-preview` and even switches to a secondary API key if provided.
*   **Usage**:
    ```bash
    # Process the default quality-queue.json
    npm run batch-enrich:queue
    ```

### 3. `scripts/check-enrichment-status.ts`
**Purpose**: Provides a real-time health check of your enrichment progress.

*   **Usage**:
    ```bash
    npm run check-enrichment
    ```
*   **Output**: Shows total salons vs. enriched salons, progress %, and estimated costs to finish.

### 4. `scripts/enrich-single-salon.ts`
**Purpose**: Best for testing and debugging. See exactly what Gemini outputs for a single salon.

*   **Usage**:
    ```bash
    npx tsx scripts/enrich-single-salon.ts "Salon Name" "City Name" "State Name"
    ```

### 5. `scripts/generate-enriched-sitemap-index.ts`
**Purpose**: Scans all enriched salon files in R2 and creates a fast, consolidated index for the sitemap. This is critical for SEO of 21,000+ enriched pages.

*   **Logic**: It calculates a quality score for each salon (Rating + Review Density) to assign sitemap priorities (0.6 - 0.9).
*   **Usage**:
    ```bash
    npm run generate-sitemap-index
    ```
*   **Benefit**: Allows the dynamic sitemap to load instantly on Vercel without hitting R2 for every request.

---

## 💎 The Enrichment Service (`geminiSalonEnrichmentService.ts`)

Instead of making 3 separate API calls (which is slow and expensive), we use a **Consolidated Prompt Strategy**:

1.  **Consolidated Call**: We send the salon details and the top 5 most helpful reviews to Gemini.
2.  **Structured JSON**: Gemini returns a specific JSON schema containing the About section, FAQ, and Insights in a single trip.
3.  **Cost Efficiency**: This reduced costs from **$0.20** per salon to ~**$0.03-$0.05** per salon.

---

## 📝 Workflow: Running a New Enrichment Campaign

If you want to target a specific subset (e.g., "Highly Reviewed Salons in Ohio"):

1.  **Create the Queue**:
    ```bash
    npx tsx scripts/create-quality-queue.ts --min-reviews=300 --min-rating=4.2 --output=ohio-premium.json
    ```
2.  **Update the batch-enrich configuration** (Optional):
    If you created a custom filename like `ohio-premium.json`, update the `QUEUE_PATH` in `scripts/batch-enrich-salons.ts` or simply rename your file to `quality-queue.json`.

3.  **Execute**:
    ```bash
    npm run batch-enrich:queue
    ```

4.  **Monitor**:
    In a separate terminal, run:
    ```bash
    npm run check-enrichment
    ```

---

## 💰 Cost Analysis

| Component | Cost per Salon | For 1,000 Salons | Notes |
| :--- | :--- | :--- | :--- |
| **Google Maps API** | ~$0.177 | ~$177.00 | Fetches phone, website, and rich reviews. |
| **Gemini 2.0 Flash** | ~$0.005 | ~$5.00 | Generates 300 words + AI analysis. |
| **Total** | **~$0.18** | **~$182.00** | |

*Tip: If raw data (Google Maps info) is already in R2, the cost drops to just the Gemini cost (~$0.005/salon).*

---

## 🚨 Troubleshooting

*   **Rate Limits (429)**: The scripts have built-in exponential backoff. If you hit hard limits, reduce the `CONCURRENCY` constant in `batch-enrich-salons.ts` to `10`.
*   **Missing API Keys**: Ensure `GEMINI_API_KEY` is present in `.env.local`.
*   **R2 Access**: If you see "Access Denied", check your `R2_ACCESS_KEY_ID` and `R2_SECRET_ACCESS_KEY`.
