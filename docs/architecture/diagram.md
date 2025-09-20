# Архитектурная диаграмма

## Общая схема системы

```
┌─────────────────────────────────────────────────────────────────┐
│                        Car4U Frontend                          │
│                     (Next.js + TypeScript)                     │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Next.js API Proxy Layer                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │ Auth Routes │  │ Data Routes │  │ File Routes │            │
│  │ /api/auth   │  │ /api/ads    │  │ /api/files  │            │
│  │ /api/org    │  │ /api/search │  │ /api/pdf    │            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      .NET Backend Server                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │ Auth Service│  │ Data Service│  │ Parse Service│            │
│  │ JWT Validation│ │ CRUD Ops   │  │ Kolesa.kz   │            │
│  │ User Mgmt   │  │ Reports     │  │ Monitoring  │            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                        Database                                │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │ Users       │  │ Ads         │  │ Searches    │            │
│  │ Organizations│ │ My Ads      │  │ Reports     │            │
│  │ Accounts    │  │ History     │  │ Templates   │            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
└─────────────────────────────────────────────────────────────────┘
```

## Поток данных

### 1. Авторизация

```
User → Clerk.com → JWT Token → Next.js API → .NET Backend → User Context
```

### 2. API запросы

```
Frontend Component → Service → Next.js API → .NET Backend → Database → Response
```

### 3. Парсинг данных

```
.NET Backend → Kolesa.kz → Parse Data → Database → Frontend (via API)
```

## Компоненты фронтенда

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend Components                     │
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │   Pages     │  │ Components  │  │   Context   │            │
│  │             │  │             │  │             │            │
│  │ /ads        │  │ AppHeader   │  │ AuthProvider│            │
│  │ /search     │  │ Table       │  │ OrgProvider │            │
│  │ /my-ads     │  │ Forms       │  │ LoadingCtx  │            │
│  │ /about      │  │ Modals      │  │             │            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │   Hooks     │  │  Services   │  │   Utils     │            │
│  │             │  │             │  │             │            │
│  │ useAuth     │  │ AuthService │  │ Formatters  │            │
│  │ useOrg      │  │ AdService   │  │ Helpers     │            │
│  │ useFetch    │  │ SearchSvc   │  │ Constants   │            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
└─────────────────────────────────────────────────────────────────┘
```

## Безопасность

```
┌─────────────────────────────────────────────────────────────────┐
│                        Security Layer                          │
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │ Middleware  │  │ Auth Check  │  │ Role Check  │            │
│  │             │  │             │  │             │            │
│  │ Route Guard │  │ JWT Valid   │  │ Admin/User  │            │
│  │ Clerk Auth  │  │ Backend JWT │  │ Org Access  │            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
└─────────────────────────────────────────────────────────────────┘
```

## Деплоймент

```
┌─────────────────────────────────────────────────────────────────┐
│                        Deployment                              │
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │   Vercel    │  │   GitHub    │  │   .NET      │            │
│  │             │  │             │  │  Backend    │            │
│  │ Frontend    │  │ Repository  │  │  Server     │            │
│  │ Hosting     │  │ CI/CD       │  │  Hosting    │            │
│  │ CDN         │  │ Auto Deploy │  │  Database   │            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
└─────────────────────────────────────────────────────────────────┘
```

## Технологический стек

### Frontend

- **Next.js 15** - React фреймворк
- **TypeScript** - типизация
- **Tailwind CSS** - стилизация
- **Material-UI** - UI компоненты
- **React Query** - управление состоянием
- **Clerk.com** - аутентификация

### Backend

- **.NET 8** - серверный фреймворк
- **Entity Framework** - ORM
- **SQL Server** - база данных
- **JWT** - авторизация

### Infrastructure

- **Vercel** - хостинг фронтенда
- **GitHub** - репозиторий и CI/CD
- **Dedicated Server** - хостинг бекенда

## Потоки пользователей

### 1. Регистрация и вход

```
User → Clerk Sign-up → Email Verification → Access Granted → Dashboard
```

### 2. Создание поиска

```
User → Search Page → Fill Filters → Submit → Backend Processing → Search Created
```

### 3. Просмотр объявлений

```
User → Ads Page → Select Search → View Results → Filter/Sort → View Details
```

### 4. Мониторинг своих объявлений

```
User → My Ads → Add URL → Select Account → Start Monitoring → View History
```

## Масштабируемость

### Горизонтальное масштабирование

- **Frontend**: Vercel Edge Network
- **Backend**: Load Balancer + Multiple Instances
- **Database**: Read Replicas + Connection Pooling

### Вертикальное масштабирование

- **Frontend**: CDN + Caching
- **Backend**: More CPU/RAM
- **Database**: Better Hardware + Indexing

## Мониторинг

### Метрики

- **Performance**: Response times, Throughput
- **Errors**: 4xx/5xx rates, Exception tracking
- **Business**: User activity, Feature usage
- **Infrastructure**: CPU, Memory, Disk usage

### Алерты

- **Critical**: System down, High error rate
- **Warning**: Performance degradation, Resource usage
- **Info**: Deployment success, Feature releases
