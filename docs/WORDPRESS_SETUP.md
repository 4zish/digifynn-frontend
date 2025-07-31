# WordPress Dynamic Content Setup

This guide explains how to set up WordPress as a headless CMS for your blog with the exact digifynn design.

## Prerequisites

1. **WordPress Installation** with admin access
2. **WPGraphQL Plugin** installed and activated
3. **Basic WordPress knowledge**

## Step 1: Install Required WordPress Plugins

### 1.1 Install WPGraphQL
```bash
# Via WordPress Admin
1. Go to Plugins → Add New
2. Search for "WPGraphQL"
3. Install and activate "WPGraphQL" by WPGraphQL

# Or via WP-CLI
wp plugin install wp-graphql --activate
```

### 1.2 Install WPGraphQL for Advanced Custom Fields (Optional)
```bash
# If you use ACF for custom fields
wp plugin install wp-graphql-acf --activate
```

## Step 2: Configure WordPress Settings

### 2.1 Enable GraphQL Endpoint
After installing WPGraphQL, your GraphQL endpoint will be available at:
```
https://your-wordpress-site.com/graphql
```

### 2.2 Configure Permalinks
1. Go to Settings → Permalinks
2. Choose "Post name" structure: `/%postname%/`
3. Save changes

### 2.3 Set Up Categories
Create categories that match the digifynn structure:
- نرم افزار و اپلیکیشن
- فناوری  
- گوگل
- هوش مصنوعی
- آموزش

## Step 3: Configure Environment Variables

### 3.1 Create .env File
Create a `.env` file in your project root:

```env
# WordPress GraphQL Endpoint
WP_GRAPHQL_ENDPOINT=https://your-wordpress-site.com/graphql

# Google Analytics ID (optional)
GOOGLE_ANALYTICS_ID=GA_MEASUREMENT_ID

# Environment
NODE_ENV=development
```

### 3.2 Update WordPress URL in Config
The WordPress endpoint is already configured in `nuxt.config.ts`:

```typescript
runtimeConfig: {
  wpGraphqlEndpoint: process.env.WP_GRAPHQL_ENDPOINT || 'https://cms.digifynn.com/graphql',
}
```

## Step 4: Create Sample Content

### 4.1 Create a Sample Post
1. Go to Posts → Add New
2. Title: "هوش مصنوعی پیشرفته NotebookLM آپدیت شد؛ تولید پادکست ویدیویی با ابزار گوگل"
3. Content: Add your article content with proper formatting
4. Categories: Select appropriate categories
5. Featured Image: Upload an image (optional)
6. Publish the post

### 4.2 Set Post Slug
Make sure the post slug is URL-friendly:
- Slug: `notebooklm-video-overviews-english`

## Step 5: Test the Integration

### 5.1 Test GraphQL Endpoint
Visit your GraphQL endpoint in browser:
```
https://your-wordpress-site.com/graphql
```

You should see the GraphQL Playground.

### 5.2 Test Sample Query
Test this query in GraphQL Playground:

```graphql
{
  posts(first: 5) {
    nodes {
      id
      title
      content
      excerpt
      date
      slug
      author {
        node {
          name
        }
      }
      categories {
        nodes {
          name
          slug
        }
      }
      featuredImage {
        node {
          sourceUrl
          altText
        }
      }
    }
  }
}
```

### 5.3 Test Single Post Query
```graphql
query GetPostBySlug($slug: ID!) {
  post(id: $slug, idType: SLUG) {
    id
    title
    content
    excerpt
    date
    author {
      node {
        name
      }
    }
    categories {
      nodes {
        name
        slug
      }
    }
    featuredImage {
      node {
        sourceUrl
        altText
      }
    }
  }
}
```

Variables:
```json
{
  "slug": "notebooklm-video-overviews-english"
}
```

## Step 6: Run Your Application

### 6.1 Install Dependencies
```bash
npm install
```

### 6.2 Start Development Server
```bash
npm run dev
```

### 6.3 Visit Your Blog
- Blog listing: `http://localhost:3000/blog`
- Single post: `http://localhost:3000/blog/your-post-slug`

## Step 7: WordPress Content Best Practices

### 7.1 Content Structure
- Use proper headings (H2, H3, H4)
- Add featured images for better visual appeal
- Write compelling excerpts
- Use categories consistently

### 7.2 Persian Content
- Ensure your WordPress is configured for Persian/Farsi
- Use proper Persian fonts
- Test right-to-left (RTL) text rendering

### 7.3 SEO Optimization
- Install Yoast SEO or similar plugin
- Configure meta descriptions
- Use proper alt text for images

## Step 8: Advanced Features

### 8.1 Custom Fields (Optional)
If you need additional fields, install ACF:

```graphql
# Example query with ACF fields
{
  posts {
    nodes {
      title
      customFields {
        readingTime
        authorBio
        relatedLinks
      }
    }
  }
}
```

### 8.2 Related Posts
The system automatically fetches related posts based on:
- Recent posts from the same categories
- Excludes the current post
- Limits to 3 related articles

### 8.3 Caching
The application includes built-in caching:
- Posts list: 5 minutes cache
- Single posts: 10 minutes cache
- Related posts: 5 minutes cache

## Troubleshooting

### Common Issues

**1. GraphQL endpoint not accessible**
- Ensure WPGraphQL plugin is activated
- Check WordPress permalink settings
- Verify server supports GraphQL

**2. Images not loading**
- Check WordPress media settings
- Ensure image URLs are accessible
- Verify CORS settings if needed

**3. Persian text issues**
- Configure WordPress for UTF-8
- Install Persian/RTL WordPress theme
- Check database collation

**4. Build errors**
- Verify all environment variables are set
- Check WordPress endpoint accessibility
- Ensure all dependencies are installed

### Testing Queries

Use GraphQL Playground at `/graphql` to test queries before implementing them in your application.

## Production Deployment

### Environment Variables
Set these in your production environment:
```env
WP_GRAPHQL_ENDPOINT=https://your-live-wordpress.com/graphql
NODE_ENV=production
```

### WordPress Security
- Use SSL certificates
- Implement proper authentication
- Regular WordPress updates
- Backup your WordPress database

## Features Included

✅ **Dynamic content from WordPress**
✅ **Featured images support** 
✅ **Categories and tags**
✅ **Author information**
✅ **Reading time calculation**
✅ **Related posts**
✅ **SEO optimization**
✅ **Persian/RTL support**
✅ **Responsive design**
✅ **Exact digifynn styling**

Your blog now reads all content dynamically from WordPress while maintaining the exact digifynn design and functionality!