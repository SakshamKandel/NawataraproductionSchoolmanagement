# Environment Configuration Guide

## Overview
This application uses environment variables to configure the API URL and other settings. The configuration is handled through multiple `.env` files depending on the environment.

## Environment Files

### `.env`
- **Purpose**: Production environment variables
- **API URL**: `https://nawataraenglishschool.com`
- **Committed to git**: Yes
- **Used for**: Production builds and deployment

### `.env.local`
- **Purpose**: Local development environment variables
- **API URL**: `http://localhost:8001`
- **Committed to git**: No (ignored by .gitignore)
- **Used for**: Local development

## Required Environment Variables

### VITE_API_URL
- **Description**: The base URL for API calls
- **Examples**: 
  - Development: `http://localhost:8001`
  - Production: `https://nawataraenglishschool.com`
- **Required**: Yes

### VITE_APP_NAME
- **Description**: The name of the application
- **Default**: `Nawa Tara English School`
- **Required**: No

### VITE_APP_VERSION
- **Description**: The version of the application
- **Default**: `1.0.0`
- **Required**: No

## Setup Instructions

### For Development
1. Create a `.env.local` file in the frontend root directory
2. Add your local API URL:
   ```
   VITE_API_URL=http://localhost:8001
   ```
3. Start the development server: `npm run dev`

### For Production
1. Ensure `.env` file has the correct production URL
2. Build the application: `npm run build`
3. Deploy the `dist` folder

## API Configuration Usage

The API configuration is centralized in `src/config/api.js`. All API calls should use the `getApiUrl()` function:

```javascript
import { getApiUrl } from '../config/api.js';

// Correct usage
const url = getApiUrl('/api/students');
fetch(url, { /* options */ });

// Incorrect usage (hardcoded URL)
fetch('http://localhost:8001/api/students', { /* options */ });
```

## Troubleshooting

### Error: "VITE_API_URL environment variable is required"
- Ensure you have either `.env` or `.env.local` file with `VITE_API_URL` defined
- Check that the URL includes the protocol (http:// or https://)
- Restart the development server after making changes

### API calls not working
- Verify the backend server is running on the configured URL
- Check browser console for CORS or network errors
- Ensure the API URL doesn't end with a trailing slash (the config handles this automatically)
