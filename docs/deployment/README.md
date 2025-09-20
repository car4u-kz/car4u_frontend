# Деплоймент

## Обзор

Проект развертывается на Vercel.com с автоматическим деплойментом из Git репозитория. Next.js API routes выступают как прокси к .NET бекенду, работающему на отдельном сервере.

## Архитектура деплоймента

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Vercel.com    │    │   Next.js API   │    │   .NET Backend  │
│   (Frontend)    │◄──►│   Proxy Layer   │◄──►│   (Server)      │
│                 │    │                 │    │                 │
│ - Static Files  │    │ - API Routes    │    │ - Business Logic│
│ - SSR/SSG       │    │ - Auth Proxy    │    │ - Database      │
│ - Edge Runtime  │    │ - CORS Handling │    │ - Parsing       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Vercel конфигурация

### Переменные окружения

#### Production

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...

# Clerk URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/ads
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/ads

# Backend Configuration
NEXT_PUBLIC_BACKEND_URL=https://your-backend-server.com
INTERNAL_API_URL=https://your-backend-server.com/api

# Environment
NODE_ENV=production
```

#### Development

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Clerk URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/ads
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/ads

# Backend Configuration
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
INTERNAL_API_URL=http://localhost:5000/api

# Environment
NODE_ENV=development
```

### vercel.json (опционально)

```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "npm install",
  "devCommand": "npm run dev",
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        },
        {
          "key": "Access-Control-Allow-Methods",
          "value": "GET, POST, PUT, DELETE, OPTIONS"
        },
        {
          "key": "Access-Control-Allow-Headers",
          "value": "Content-Type, Authorization, X-Organization-Id"
        }
      ]
    }
  ]
}
```

## Процесс деплоймента

### 1. Автоматический деплоймент

#### Настройка в Vercel

1. Подключить Git репозиторий
2. Настроить переменные окружения
3. Включить автоматический деплоймент

#### Триггеры деплоймента

- **Push в main** → Production деплоймент
- **Push в develop** → Preview деплоймент
- **Pull Request** → Preview деплоймент

### 2. Ручной деплоймент

```bash
# Установка Vercel CLI
npm i -g vercel

# Логин в Vercel
vercel login

# Деплоймент
vercel --prod
```

### 3. Локальная сборка

```bash
# Установка зависимостей
npm install

# Сборка проекта
npm run build

# Запуск в production режиме
npm start
```

## Конфигурация Next.js

### next.config.ts

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Включение Turbopack для development
  experimental: {
    turbo: {
      rules: {
        "*.svg": {
          loaders: ["@svgr/webpack"],
          as: "*.js",
        },
      },
    },
  },

  // Оптимизация изображений
  images: {
    domains: ["kolesa.kz", "your-backend-server.com"],
    formats: ["image/webp", "image/avif"],
  },

  // Настройки для API routes
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: "*",
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, POST, PUT, DELETE, OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type, Authorization, X-Organization-Id",
          },
        ],
      },
    ];
  },

  // Настройки для статических файлов
  async rewrites() {
    return [
      {
        source: "/static/:path*",
        destination: "/api/static/:path*",
      },
    ];
  },
};

export default nextConfig;
```

## Мониторинг и логи

### Vercel Analytics

```typescript
// app/layout.tsx
import { Analytics } from "@vercel/analytics/react";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

### Логирование ошибок

```typescript
// utils/logger.ts
export const logger = {
  error: (message: string, error?: Error) => {
    console.error(`[ERROR] ${message}`, error);
    // Отправка в внешний сервис мониторинга
  },

  info: (message: string) => {
    console.log(`[INFO] ${message}`);
  },

  warn: (message: string) => {
    console.warn(`[WARN] ${message}`);
  },
};
```

## Безопасность

### HTTPS

- Vercel автоматически предоставляет HTTPS
- SSL сертификаты обновляются автоматически

### CORS

```typescript
// Настройка CORS для API routes
export async function OPTIONS(request: Request) {
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers":
        "Content-Type, Authorization, X-Organization-Id",
    },
  });
}
```

### Заголовки безопасности

```typescript
// middleware.ts
export default clerkMiddleware(async (auth, req) => {
  const response = NextResponse.next();

  // Заголовки безопасности
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  return response;
});
```

## Производительность

### Оптимизация сборки

```bash
# Анализ размера bundle
npm run build
npm run analyze

# Проверка производительности
npm run lighthouse
```

### Кэширование

#### Static Generation

```typescript
// app/page.tsx
export const revalidate = 3600; // 1 час

export default function HomePage() {
  return <div>Static content</div>;
}
```

#### API Routes кэширование

```typescript
// app/api/ads/route.ts
export const revalidate = 300; // 5 минут

export async function GET() {
  // API логика
}
```

## Troubleshooting

### Частые проблемы

1. **Ошибки сборки**

   ```bash
   # Очистка кэша
   rm -rf .next
   npm run build
   ```

2. **Проблемы с переменными окружения**

   - Проверить настройки в Vercel Dashboard
   - Убедиться в правильности названий переменных

3. **Ошибки API**
   - Проверить доступность бекенда
   - Убедиться в правильности URL

### Отладка

#### Локальная отладка

```bash
# Запуск с debug логами
DEBUG=* npm run dev

# Проверка переменных окружения
npm run env:check
```

#### Vercel функции

```bash
# Логи Vercel функций
vercel logs

# Локальная эмуляция
vercel dev
```

## CI/CD

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy to Vercel

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: "18"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test

      - name: Build project
        run: npm run build

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          scope: ${{ secrets.VERCEL_ORG_ID }}
```

## Резервное копирование

### Настройки Vercel

- Автоматические бэкапы Git репозитория
- Сохранение переменных окружения
- История деплойментов

### Мониторинг

- Uptime мониторинг
- Performance метрики
- Error tracking
- User analytics
