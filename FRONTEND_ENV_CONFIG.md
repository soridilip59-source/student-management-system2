# Frontend Environment Configuration

## Setup

1. **Create `.env` file in the frontend directory**
   ```bash
   cp .env.example .env
   ```

2. **Configure API Base URL**
   Update the `.env` file with your backend API URL:
   
   ```env
   # Development
   VITE_API_BASE_URL=http://localhost:5000/api

   # Production
   VITE_API_BASE_URL=https://your-production-api.com/api
   ```

## Environment Variables

### VITE_API_BASE_URL
- **Type**: String
- **Required**: Yes
- **Default**: http://localhost:5000/api
- **Description**: Base URL for backend API requests
- **Examples**:
  - Local Development: `http://localhost:5000/api`
  - Docker: `http://localhost:5000/api`
  - Production: `https://api.yourdomain.com/api`

## Available Environment Variables

You can define any environment variables with the `VITE_` prefix. They will be available in your application via `import.meta.env`.

### Example Usage in Code

```javascript
// In your React components or services
const apiBase = import.meta.env.VITE_API_BASE_URL;
```

## Common Configurations

### Local Development
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

### Docker Development
```env
VITE_API_BASE_URL=http://backend:5000/api
```

### Production
```env
VITE_API_BASE_URL=https://api.example.com/api
```

## Building for Production

When building for production, environment variables are baked into the build:

```bash
# Build with production environment
npm run build
```

The built files in `dist/` will have the environment variables embedded.

## Troubleshooting

### API calls not reaching backend?
1. Check `VITE_API_BASE_URL` in `.env`
2. Verify backend is running
3. Check browser console for error messages
4. Ensure CORS is properly configured on backend

### Environment variable not loading?
1. Restart development server after changing `.env`
2. Variable must start with `VITE_` prefix
3. Clear browser cache and restart

## Security Notes

- **Never commit `.env` files to version control**
- Use `.env.example` to show what variables are needed
- Sensitive data (API keys, tokens) should be stored securely
- For production, use your hosting platform's environment variable management

## References

- [Vite Environment Variables Documentation](https://vitejs.dev/guide/env-and-mode.html)
- [Frontend API Service Configuration](./frontend/src/services/api.js)
