# دیجی‌فاین - اخبار و مقالات تکنولوژی

یک وب‌سایت مدرن و کامل برای نمایش اخبار و مقالات تکنولوژی با استفاده از Nuxt 4، Vue 3 و TypeScript.

## 🚀 ویژگی‌های جدید

### ✅ **قابلیت‌های اضافه شده**
- **🔍 سیستم جستجو کامل** - جستجوی پیشرفته در مقالات
- **👤 سیستم احراز هویت** - ثبت‌نام، ورود و مدیریت پروفایل
- **💬 سیستم نظرات** - امکان نظرگذاری و پاسخ به نظرات
- **📊 تحلیل‌گر کاربری** - ردیابی رفتار کاربران و آمار
- **📱 پشتیبانی PWA** - قابلیت نصب روی موبایل
- **🔄 آفلاین** - کارکرد بدون اینترنت
- **🛡️ امنیت پیشرفته** - Rate limiting و validation قوی
- **⚡ عملکرد بهینه** - Caching و بهینه‌سازی‌های پیشرفته

### 🎨 **طراحی و تجربه کاربری**
- **طراحی مدرن و ریسپانسیو** - سازگار با تمام دستگاه‌ها
- **SEO بهینه** - متا تگ‌های داینامیک و ساختار داده مناسب
- **عملکرد بالا** - بهینه‌سازی شده برای سرعت بارگذاری
- **TypeScript کامل** - تایپ‌های دقیق و ایمن
- **تست جامع** - Unit tests و E2E tests
- **امنیت بالا** - اعتبارسنجی ورودی و هدرهای امنیتی
- **پشتیبانی از RTL** - طراحی شده برای زبان فارسی

## 🛠️ تکنولوژی‌های استفاده شده

### **Frontend**
- **Nuxt 4** - فریم‌ورک Vue.js
- **Vue 3** - فریم‌ورک JavaScript
- **TypeScript** - زبان برنامه‌نویسی
- **Vue Router** - مسیریابی

### **Backend & API**
- **GraphQL** - API برای دریافت داده‌ها
- **Nuxt Server API** - API های سرور
- **JWT** - احراز هویت
- **bcryptjs** - رمزنگاری

### **Testing & Quality**
- **Vitest** - تست‌های واحد
- **Playwright** - تست‌های E2E
- **ESLint** - بررسی کیفیت کد
- **Prettier** - فرمت‌بندی کد

### **Performance & PWA**
- **Service Worker** - آفلاین و caching
- **PWA** - Progressive Web App
- **Analytics** - تحلیل کاربری
- **Core Web Vitals** - نظارت بر عملکرد

## 📦 نصب و راه‌اندازی

### پیش‌نیازها

- Node.js 18+ 
- npm یا yarn

### نصب

```bash
# کلون کردن پروژه
git clone <repository-url>
cd digifun

# نصب وابستگی‌ها
npm install

# کپی فایل محیطی
cp .env.example .env
```

### تنظیم متغیرهای محیطی

فایل `.env` را ایجاد کنید:

```env
# GraphQL endpoint
WP_GRAPHQL_ENDPOINT=https://cms.digifynn.com/graphql

# Google Analytics
GOOGLE_ANALYTICS_ID=GA_MEASUREMENT_ID

# JWT Secret
JWT_SECRET=your-secret-key

# Rate Limiting
RATE_LIMIT_SECRET=rate-limit-secret

# API Base URL
API_BASE_URL=https://api.digifynn.com

# CDN URL
CDN_URL=https://cdn.digifynn.com

# Base URL
BASE_URL=https://digifynn.com

# محیط اجرا
NODE_ENV=development
```

### اجرا

```bash
# توسعه
npm run dev

# ساخت برای تولید
npm run build

# پیش‌نمایش
npm run preview
```

## 🧪 تست

### تست‌های واحد

```bash
# اجرای تمام تست‌ها
npm run test

# اجرا با UI
npm run test:ui

# گزارش پوشش
npm run test:coverage

# تست با watch mode
npm run test:watch
```

### تست‌های E2E

```bash
# اجرای تست‌های E2E
npm run test:e2e

# اجرا با UI
npm run test:e2e:ui

# تست در مرورگر خاص
npm run test:e2e:chrome
```

### کیفیت کد

```bash
# بررسی linting
npm run lint

# اصلاح خودکار
npm run lint:fix

# بررسی تایپ‌ها
npm run type-check

# فرمت‌بندی کد
npm run format
```

## 📁 ساختار پروژه

```
digifun/
├── app/                    # صفحات Nuxt
│   ├── app.vue            # لایوت اصلی
│   └── pages/             # صفحات
│       ├── index.vue      # صفحه اصلی
│       ├── search.vue     # صفحه جستجو
│       └── blog/          # صفحات وبلاگ
├── components/             # کامپوننت‌ها
│   ├── TheHeader.vue      # هدر سایت
│   └── ErrorBoundary.vue  # مدیریت خطا
├── composables/            # کامپوزابل‌ها
│   ├── useAuth.ts         # احراز هویت
│   ├── usePosts.ts        # مدیریت مقالات
│   ├── useComments.ts     # مدیریت نظرات
│   ├── useAnalytics.ts    # تحلیل‌گر
│   └── useDateFormatter.ts # فرمت تاریخ
├── utils/                  # ابزارها
│   ├── validation.ts      # اعتبارسنجی
│   ├── rateLimit.ts       # محدودیت نرخ
│   ├── env.ts             # متغیرهای محیطی
│   ├── security.ts        # امنیت
│   └── performance.ts     # بهینه‌سازی
├── server/                 # API های سرور
│   └── api/               # نقاط پایانی API
├── types/                  # تعاریف TypeScript
├── test/                   # تست‌ها
│   ├── utils/             # تست ابزارها
│   ├── composables/       # تست کامپوزابل‌ها
│   ├── components/        # تست کامپوننت‌ها
│   ├── api/               # تست API ها
│   └── e2e/               # تست‌های E2E
├── public/                 # فایل‌های عمومی
└── docs/                   # مستندات
```

## 🔧 پیکربندی

### Nuxt Configuration

فایل `nuxt.config.ts` شامل تنظیمات کامل برای:

- **Performance**: بهینه‌سازی‌های پیشرفته
- **Security**: هدرهای امنیتی و CSP
- **SEO**: متا تگ‌ها و sitemap
- **PWA**: Service Worker و manifest
- **Testing**: پیکربندی تست‌ها

### Environment Variables

| متغیر | توضیح | پیش‌فرض |
|-------|-------|---------|
| `WP_GRAPHQL_ENDPOINT` | آدرس GraphQL | `https://cms.digifynn.com/graphql` |
| `GOOGLE_ANALYTICS_ID` | شناسه Google Analytics | - |
| `JWT_SECRET` | کلید رمزنگاری JWT | - |
| `RATE_LIMIT_SECRET` | کلید Rate Limiting | - |
| `API_BASE_URL` | آدرس پایه API | `https://api.digifynn.com` |
| `CDN_URL` | آدرس CDN | - |
| `BASE_URL` | آدرس پایه سایت | `https://digifynn.com` |
| `NODE_ENV` | محیط اجرا | `development` |

## 🚀 Deployment

### Production Build

```bash
# ساخت برای تولید
npm run build

# پیش‌نمایش
npm run preview
```

### Docker

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

### CI/CD Pipeline

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm run test:coverage
      - run: npm run test:e2e

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
```

## 📊 Performance Metrics

### Core Web Vitals

- **LCP (Largest Contentful Paint)**: < 2.5s
- **FID (First Input Delay)**: < 100ms
- **CLS (Cumulative Layout Shift)**: < 0.1

### Lighthouse Scores

- **Performance**: 95+
- **Accessibility**: 100
- **Best Practices**: 100
- **SEO**: 100

### Bundle Analysis

- **Main Bundle**: < 200KB
- **Vendor Bundle**: < 500KB
- **Total Size**: < 1MB

## 🛡️ Security Features

### Security Headers

- **Content Security Policy (CSP)**: محافظت در برابر XSS
- **Strict Transport Security (HSTS)**: اجباری کردن HTTPS
- **X-Frame-Options**: محافظت در برابر Clickjacking
- **X-Content-Type-Options**: جلوگیری از MIME sniffing

### Input Validation

- **Server-side validation**: اعتبارسنجی کامل ورودی
- **Client-side validation**: اعتبارسنجی سمت کلاینت
- **Sanitization**: پاک‌سازی ورودی‌ها
- **Rate Limiting**: محدودیت نرخ درخواست

### Authentication & Authorization

- **JWT Tokens**: توکن‌های امن
- **bcrypt Hashing**: رمزنگاری پسورد
- **CSRF Protection**: محافظت در برابر CSRF
- **Session Management**: مدیریت جلسه

## 🧪 Testing Strategy

### Unit Tests

- **Coverage**: 90%+
- **Framework**: Vitest
- **Components**: Vue Test Utils
- **Utilities**: Jest-like API

### Integration Tests

- **API Testing**: تست نقاط پایانی
- **Database Testing**: تست دیتابیس
- **Authentication**: تست احراز هویت

### E2E Tests

- **Framework**: Playwright
- **Browsers**: Chrome, Firefox, Safari
- **Mobile**: Responsive testing
- **Performance**: Load testing

## 📈 Monitoring & Analytics

### Performance Monitoring

- **Core Web Vitals**: نظارت بر عملکرد
- **Error Tracking**: ردیابی خطاها
- **User Analytics**: تحلیل کاربران
- **Server Monitoring**: نظارت سرور

### Error Handling

- **Global Error Boundary**: مدیریت خطاهای کلی
- **API Error Handling**: مدیریت خطاهای API
- **User Feedback**: بازخورد کاربر
- **Logging**: ثبت رویدادها

## 🤝 Contributing

### Development Workflow

1. **Fork** پروژه
2. **Create** شاخه جدید (`git checkout -b feature/amazing-feature`)
3. **Commit** تغییرات (`git commit -m 'Add amazing feature'`)
4. **Push** به شاخه (`git push origin feature/amazing-feature`)
5. **Open** Pull Request

### Code Standards

- **TypeScript**: استفاده از TypeScript
- **ESLint**: رعایت قوانین linting
- **Prettier**: فرمت‌بندی خودکار
- **Testing**: نوشتن تست برای کد جدید

### Commit Convention

```
feat: add new feature
fix: fix bug
docs: update documentation
style: format code
refactor: refactor code
test: add tests
chore: update dependencies
```

## 📄 License

این پروژه تحت مجوز MIT منتشر شده است. برای اطلاعات بیشتر فایل `LICENSE` را مطالعه کنید.

## 🙏 Acknowledgments

- **Nuxt Team**: برای فریم‌ورک عالی
- **Vue Team**: برای Vue.js
- **Vite Team**: برای ابزارهای build
- **Playwright Team**: برای تست‌های E2E

## 📞 Support

برای پشتیبانی و سوالات:

- **Email**: support@digifynn.com
- **GitHub Issues**: [ایجاد Issue](https://github.com/digifynn/issues)
- **Documentation**: [مستندات کامل](https://docs.digifynn.com)

---

**دیجی‌فاین** - اخبار و مقالات تکنولوژی 🚀
