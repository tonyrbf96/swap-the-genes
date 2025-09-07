# fal.ai Integration Setup

This document explains the fal.ai integration setup for the dressmeup project.

## Overview

The integration allows users to:
- Submit AI image processing jobs (style transfer, outfit generation, virtual try-on, background removal)
- Track job status and progress  
- Automatically store generated images in Supabase storage
- View and manage AI-generated content

## Database Schema

### Tables Created:
- **`ai_jobs`** - Tracks all AI processing jobs
- **`user_ai_preferences`** - Stores user AI settings and preferences
- **`generated_images`** - Metadata for AI-generated images

### Enums:
- **`job_status`** - pending, processing, completed, failed
- **`job_type`** - style_transfer, outfit_generation, try_on, background_removal

## Edge Functions

### 1. `fal-ai-submit`
**Endpoint:** `POST /functions/v1/fal-ai-submit`

Submits new AI processing jobs to fal.ai.

**Request Body:**
```json
{
  "jobType": "style_transfer",
  "model": "stable-diffusion-v1-5",
  "inputData": {
    "image_url": "https://example.com/image.jpg",
    "prompt": "A professional headshot in corporate style",
    "style": "corporate"
  }
}
```

**Response:**
```json
{
  "success": true,
  "jobId": "uuid-here",
  "falJobId": "fal-job-id-here", 
  "status": "processing",
  "estimatedTime": 30
}
```

### 2. `fal-ai-webhook`
**Endpoint:** `POST /functions/v1/fal-ai-webhook`

Receives status updates from fal.ai when jobs complete.

### 3. `job-status`
**Endpoint:** `GET /functions/v1/job-status`

Query job status and results.

**Parameters:**
- `?jobId=uuid` - Get specific job
- No params - Get all user jobs

## Environment Variables

Set these in your Supabase project:

```bash
# fal.ai API Configuration
FAL_AI_API_KEY=your_fal_ai_api_key_here

# Supabase (auto-configured)
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key  
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Setup Instructions

1. **Get fal.ai API Key:**
   - Sign up at https://fal.ai/
   - Generate an API key from your dashboard
   
2. **Configure Environment Variables:**
   ```bash
   # In your Supabase project dashboard
   supabase secrets set FAL_AI_API_KEY=your_api_key_here
   ```

3. **Deploy Edge Functions:**
   ```bash
   supabase functions deploy fal-ai-submit
   supabase functions deploy fal-ai-webhook  
   supabase functions deploy job-status
   ```

4. **Apply Database Migration:**
   ```bash
   supabase db push
   ```

## Usage Examples

### Submit a Style Transfer Job
```javascript
const response = await fetch('/functions/v1/fal-ai-submit', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    jobType: 'style_transfer',
    model: 'stable-diffusion-v1-5',
    inputData: {
      image_url: userImageUrl,
      prompt: 'Transform into professional headshot',
      style: 'corporate'
    }
  })
})
```

### Check Job Status
```javascript
const response = await fetch(`/functions/v1/job-status?jobId=${jobId}`, {
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
})
```

## Supported AI Models

Configure these fal.ai models in your requests:

- **Style Transfer:** `stable-diffusion-v1-5`, `stable-diffusion-xl`
- **Outfit Generation:** `fashion-diffusion`, `clothing-generator`
- **Virtual Try-On:** `virtual-tryon-v2`, `outfit-anyone`
- **Background Removal:** `background-removal`, `person-segmentation`

## Security

- All endpoints require authentication
- Row Level Security (RLS) enforced on all tables
- Users can only access their own jobs and generated images
- Webhook endpoint uses service role for internal operations

## Error Handling

The system handles various error scenarios:
- Invalid API keys
- fal.ai service outages  
- Image download/upload failures
- Database connection issues

All errors are logged and returned with appropriate HTTP status codes.