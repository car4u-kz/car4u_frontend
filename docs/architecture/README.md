# Архитектура проекта

## Общая схема

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Next.js API   │    │   .NET Backend  │
│   (Next.js)     │◄──►│   Proxy Layer   │◄──►│   (Server)      │
│                 │    │                 │    │                 │
│ - Clerk Auth    │    │ - Route Proxy   │    │ - Business Logic│
│ - React Query   │    │ - Auth Headers  │    │ - Database      │
│ - Material-UI   │    │ - Org Headers   │    │ - Parsing       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Принципы архитектуры

### 1. **Разделение ответственности**
- **Frontend:** UI/UX, клиентская логика, состояние
- **Next.js API:** Проксирование запросов, авторизация
- **Backend:** Бизнес-логика, парсинг, база данных

### 2. **Прокси-архитектура**
Next.js выступает как прокси между фронтендом и .NET бекендом:
- Добавляет заголовки авторизации
- Обрабатывает CORS
- Кэширует ответы
- Обрабатывает ошибки

### 3. **Авторизация через Clerk**
- Внешняя аутентификация через Clerk.com
- JWT токены для доступа к бекенду
- Роли и права пользователей

## Структура данных

### Пользователь
```typescript
interface User {
  id: string;
  role: UserRole;
  status: UserStatus;
  organizations: Organization[];
}
```

### Организация
```typescript
interface Organization {
  id: string;
  name: string;
  accounts: Account[];
}
```

### Объявление
```typescript
interface Ad {
  id: string;
  title: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  engine: string;
  transmission: string;
  bodyType: string;
  region: string;
  url: string;
  searchId: string;
}
```

## Поток данных

### 1. **Авторизация**
```
User → Clerk → JWT Token → Backend Validation → User Context
```

### 2. **API запросы**
```
Component → Service → Next.js API → .NET Backend → Response
```

### 3. **Управление состоянием**
```
React Query → Cache → Background Updates → UI Refresh
```

## Паттерны проектирования

### 1. **Provider Pattern**
- `AuthProvider` - управление авторизацией
- `OrganizationProvider` - управление организациями
- `LoadingProvider` - глобальное состояние загрузки

### 2. **Service Layer**
- `auth-service.ts` - авторизация
- `ad-services.ts` - работа с объявлениями
- `search-services.ts` - поисковые запросы
- `organization-service.ts` - управление организациями

### 3. **Custom Hooks**
- `use-fetch-with-auth.ts` - авторизованные запросы
- `use-organization-manager.ts` - управление организациями

## Безопасность

### 1. **Middleware защита**
```typescript
const isProtectedRoute = createRouteMatcher([
  "/ads(.*)", 
  "/search", 
  "/my-ads"
]);
```

### 2. **Проверка токенов**
- Валидация Clerk токенов на бекенде
- Проверка ролей и статуса пользователя
- Автоматический logout при ошибках

### 3. **Заголовки безопасности**
- `Authorization` - JWT токен
- `X-Organization-Id` - контекст организации

## Производительность

### 1. **Кэширование**
- React Query для кэширования API ответов
- Next.js кэширование статических ресурсов
- Stale-while-revalidate стратегия

### 2. **Оптимизация**
- Server-side rendering для SEO
- Code splitting по страницам
- Lazy loading компонентов

### 3. **Мониторинг**
- Глобальный loading overlay
- Error boundaries
- Логирование ошибок

## Масштабируемость

### 1. **Модульность**
- Разделение по функциональным областям
- Переиспользуемые компоненты
- Типизированные интерфейсы

### 2. **Расширяемость**
- Легкое добавление новых площадок
- Плагинная архитектура для парсеров
- Конфигурируемые фильтры

### 3. **Поддержка**
- Подробная документация
- Типизация TypeScript
- Единые паттерны кодирования
