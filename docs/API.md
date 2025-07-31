# API Documentation

## Overview

This API provides access to blog posts and articles through GraphQL endpoints. All endpoints return JSON responses and support proper error handling.

## Base URL

```
https://your-domain.com/api
```

## Authentication

Currently, no authentication is required for public endpoints. All endpoints are publicly accessible.

## Rate Limiting

- **Posts endpoint**: 100 requests per 15 minutes
- **Single post endpoint**: 200 requests per 15 minutes

## Endpoints

### Get All Posts

Retrieves a list of blog posts.

**Endpoint:** `GET /api/posts`

**Query Parameters:**
- `limit` (optional): Number of posts to return (default: 10, max: 50)
- `offset` (optional): Number of posts to skip (default: 0)

**Response:**

```json
{
  "posts": {
    "nodes": [
      {
        "id": "1",
        "title": "عنوان مقاله",
        "content": "محتوای مقاله",
        "excerpt": "خلاصه مقاله",
        "date": "2024-01-01T00:00:00Z",
        "slug": "article-slug",
        "author": {
          "node": {
            "name": "نام نویسنده"
          }
        },
        "categories": {
          "nodes": [
            {
              "name": "دسته‌بندی",
              "slug": "category-slug"
            }
          ]
        }
      }
    ]
  }
}
```

**Error Responses:**

```json
{
  "statusCode": 500,
  "statusMessage": "خطا در دریافت مقالات",
  "data": {
    "message": "متأسفانه مشکلی در بارگذاری مقالات پیش آمده است.",
    "originalError": "GraphQL connection failed"
  }
}
```

### Get Single Post

Retrieves a specific blog post by its slug.

**Endpoint:** `GET /api/post/{slug}`

**Path Parameters:**
- `slug` (required): The slug of the post to retrieve

**Response:**

```json
{
  "post": {
    "id": "1",
    "title": "عنوان مقاله",
    "content": "محتوای مقاله",
    "excerpt": "خلاصه مقاله",
    "date": "2024-01-01T00:00:00Z",
    "slug": "article-slug",
    "author": {
      "node": {
        "name": "نام نویسنده"
      }
    },
    "categories": {
      "nodes": [
        {
          "name": "دسته‌بندی",
          "slug": "category-slug"
        }
      ]
    }
  }
}
```

**Error Responses:**

```json
{
  "statusCode": 400,
  "statusMessage": "شناسه مقاله نامعتبر است",
  "data": {
    "message": "شناسه مقاله باید بین ۱ تا ۱۰۰ کاراکتر باشد",
    "errors": ["شناسه باید حداقل ۱ کاراکتر باشد"]
  }
}
```

```json
{
  "statusCode": 404,
  "statusMessage": "مقاله یافت نشد",
  "data": {
    "message": "مقاله مورد نظر یافت نشد."
  }
}
```

## Data Models

### Post

```typescript
interface Post {
  id: string
  title: string
  content: string
  excerpt?: string
  date: string
  slug: string
  author?: {
    node: {
      name: string
    }
  }
  categories?: {
    nodes: Array<{
      name: string
      slug: string
    }>
  }
}
```

### Author

```typescript
interface Author {
  node: {
    name: string
  }
}
```

### Category

```typescript
interface Category {
  name: string
  slug: string
}
```

### Error Response

```typescript
interface ApiError {
  statusCode: number
  statusMessage: string
  data: {
    message: string
    originalError?: string
    errors?: string[]
  }
}
```

## Validation Rules

### Slug Validation

- Must be a string
- Length: 1-100 characters
- Allowed characters: alphanumeric, hyphens, underscores
- Case sensitive

### Input Sanitization

All inputs are automatically sanitized to prevent:
- XSS attacks
- SQL injection
- HTML injection
- JavaScript injection

## Caching

### Cache Headers

- **Posts endpoint**: Cache for 5 minutes
- **Single post endpoint**: Cache for 10 minutes

### Cache-Control Headers

```
Cache-Control: public, max-age=300
ETag: "abc123"
Last-Modified: Wed, 01 Jan 2024 00:00:00 GMT
```

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 400 | Bad Request - Invalid input |
| 404 | Not Found - Post not found |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error |

## Examples

### cURL Examples

**Get all posts:**
```bash
curl -X GET "https://your-domain.com/api/posts" \
  -H "Accept: application/json"
```

**Get single post:**
```bash
curl -X GET "https://your-domain.com/api/post/article-slug" \
  -H "Accept: application/json"
```

### JavaScript Examples

**Using fetch:**
```javascript
// Get all posts
const response = await fetch('/api/posts')
const data = await response.json()

// Get single post
const postResponse = await fetch('/api/post/article-slug')
const postData = await postResponse.json()
```

**Using axios:**
```javascript
import axios from 'axios'

// Get all posts
const { data } = await axios.get('/api/posts')

// Get single post
const { data: post } = await axios.get('/api/post/article-slug')
```

## GraphQL Schema

The API is built on top of WordPress GraphQL. The underlying GraphQL schema includes:

```graphql
type Post {
  id: ID!
  title: String!
  content: String!
  excerpt: String
  date: String!
  slug: String!
  author: PostAuthor
  categories: PostCategories
}

type PostAuthor {
  node: Author
}

type Author {
  name: String!
}

type PostCategories {
  nodes: [Category!]!
}

type Category {
  name: String!
  slug: String!
}
```

## Security

### Input Validation

All inputs are validated using the following rules:
- String length limits
- Character set restrictions
- Format validation
- Type checking

### Output Sanitization

All outputs are sanitized to prevent:
- XSS attacks
- HTML injection
- JavaScript injection

### Security Headers

The API includes the following security headers:
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`

## Performance

### Response Times

- **Posts endpoint**: < 200ms average
- **Single post endpoint**: < 150ms average

### Optimization

- GraphQL query optimization
- Response caching
- Database query optimization
- CDN integration

## Monitoring

### Health Check

```
GET /api/health
```

Returns:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00Z",
  "version": "1.0.0"
}
```

### Metrics

The API provides the following metrics:
- Request count
- Response time
- Error rate
- Cache hit rate

## Support

For API support:
- Email: api-support@example.com
- Documentation: https://docs.example.com/api
- Status page: https://status.example.com 