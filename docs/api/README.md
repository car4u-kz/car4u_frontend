# API Документация

## Обзор

API построено на Next.js App Router с использованием API Routes. Все запросы проксируются к .NET бекенду через промежуточный слой.

## Базовый URL

- **Development:** `http://localhost:3000/api`
- **Production:** `https://your-domain.vercel.app/api`

## Аутентификация

Все защищенные эндпоинты требуют JWT токен в заголовке:

```
Authorization: Bearer <jwt_token>
```

Для запросов с контекстом организации:

```
X-Organization-Id: <organization_id>
```

## Эндпоинты

### 🔐 Авторизация

#### `POST /api/auth/validate`

Валидация Clerk токена и получение пользовательских данных.

**Заголовки:**

- `Authorization: Bearer <clerk_token>`

**Ответ:**

```json
{
  "id": "user_id",
  "role": "admin|user",
  "status": "active|unconfirmed|access_denied|deleted",
  "token": "backend_jwt_token"
}
```

---

### 🏢 Организации

#### `GET /api/organization/my`

Получение списка организаций пользователя.

**Заголовки:**

- `Authorization: Bearer <jwt_token>`

**Ответ:**

```json
[
  {
    "id": "org_id",
    "name": "Organization Name",
    "accounts": [
      {
        "id": "account_id",
        "name": "Account Name",
        "platform": "kolesa"
      }
    ]
  }
]
```

#### `GET /api/organization/all`

Получение всех доступных организаций (для админов).

**Заголовки:**

- `Authorization: Bearer <jwt_token>`

---

### 🔍 Поиски

#### `GET /api/search`

Получение списка поисков пользователя.

**Заголовки:**

- `Authorization: Bearer <jwt_token>`
- `X-Organization-Id: <org_id>`

**Параметры запроса:**

- `page` (number) - номер страницы
- `limit` (number) - количество элементов на странице

**Ответ:**

```json
{
  "data": [
    {
      "id": "search_id",
      "name": "BMW X5 2020+",
      "filters": {
        "brand": "BMW",
        "model": "X5",
        "yearFrom": 2020
      },
      "createdAt": "2024-01-01T00:00:00Z",
      "isActive": true
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

#### `POST /api/search`

Создание нового поиска.

**Заголовки:**

- `Authorization: Bearer <jwt_token>`
- `X-Organization-Id: <org_id>`

**Тело запроса:**

```json
{
  "name": "BMW X5 2020+",
  "filters": {
    "brand": "BMW",
    "model": "X5",
    "yearFrom": 2020,
    "priceTo": 50000000,
    "region": "almaty"
  }
}
```

#### `PUT /api/search/:id`

Обновление поиска.

#### `DELETE /api/search/:id`

Удаление поиска.

---

### 📋 Объявления

#### `GET /api/ads`

Получение объявлений по поискам.

**Заголовки:**

- `Authorization: Bearer <jwt_token>`
- `X-Organization-Id: <org_id>`

**Параметры запроса:**

- `searchId` (string) - ID поиска
- `page` (number) - номер страницы
- `limit` (number) - количество элементов
- `sortBy` (string) - поле сортировки
- `sortOrder` (string) - направление сортировки (asc/desc)

**Ответ:**

```json
{
  "data": [
    {
      "id": "ad_id",
      "title": "BMW X5 2021",
      "brand": "BMW",
      "model": "X5",
      "year": 2021,
      "price": 25000000,
      "mileage": 50000,
      "engine": "3.0",
      "transmission": "Автомат",
      "bodyType": "Внедорожник",
      "region": "Алматы",
      "url": "https://kolesa.kz/...",
      "foundAt": "2024-01-01T00:00:00Z",
      "searchId": "search_id"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

#### `GET /api/ads/filters`

Получение доступных фильтров для объявлений.

**Ответ:**

```json
{
  "brands": ["BMW", "Mercedes", "Audi"],
  "models": {
    "BMW": ["X5", "X3", "3 Series"],
    "Mercedes": ["GLE", "GLC", "C-Class"]
  },
  "regions": ["Алматы", "Астана", "Шымкент"],
  "bodyTypes": ["Седан", "Внедорожник", "Хэтчбек"],
  "transmissions": ["Автомат", "Механика", "Вариатор"]
}
```

---

### 📊 Мои объявления

#### `GET /api/my-ads`

Получение собственных объявлений пользователя.

**Заголовки:**

- `Authorization: Bearer <jwt_token>`
- `X-Organization-Id: <org_id>`

**Параметры запроса:**

- `accountId` (string) - ID аккаунта
- `page` (number) - номер страницы
- `limit` (number) - количество элементов

**Ответ:**

```json
{
  "data": [
    {
      "id": "my_ad_id",
      "title": "BMW X5 2021",
      "url": "https://kolesa.kz/...",
      "accountId": "account_id",
      "currentPosition": 5,
      "views": 150,
      "price": 25000000,
      "status": "active",
      "lastChecked": "2024-01-01T00:00:00Z",
      "history": [
        {
          "date": "2024-01-01T00:00:00Z",
          "position": 5,
          "views": 150,
          "price": 25000000
        }
      ]
    }
  ]
}
```

#### `POST /api/my-ads`

Добавление объявления в мониторинг.

**Заголовки:**

- `Authorization: Bearer <jwt_token>`
- `X-Organization-Id: <org_id>`

**Тело запроса:**

```json
{
  "url": "https://kolesa.kz/cars/bmw-x5-2021/123456",
  "accountId": "account_id"
}
```

#### `PUT /api/my-ads/:id/change-state`

Изменение состояния мониторинга объявления.

**Тело запроса:**

```json
{
  "isActive": true
}
```

#### `DELETE /api/my-ads/:id`

Удаление объявления из мониторинга.

---

### 📈 Аналитика

#### `GET /api/ads/report`

Получение аналитического отчета по объявлениям.

**Параметры запроса:**

- `searchId` (string) - ID поиска
- `dateFrom` (string) - дата начала (ISO)
- `dateTo` (string) - дата окончания (ISO)
- `groupBy` (string) - группировка (day/week/month)

**Ответ:**

```json
{
  "data": [
    {
      "date": "2024-01-01",
      "totalAds": 25,
      "newAds": 5,
      "avgPrice": 22000000,
      "minPrice": 18000000,
      "maxPrice": 30000000
    }
  ]
}
```

#### `GET /api/ads/viewed`

Получение статистики просмотров.

#### `POST /api/ads/viewed`

Отметка объявления как просмотренного.

---

### 🔧 Парсинг

#### `GET /api/parsing-template`

Получение шаблонов парсинга.

#### `POST /api/parsing-template`

Создание шаблона парсинга.

#### `PUT /api/parsing-template/:id/change-state`

Изменение состояния шаблона.

#### `GET /api/parsing-template/lookup`

Поиск шаблонов парсинга.

---

## Коды ошибок

| Код | Описание                   |
| --- | -------------------------- |
| 200 | Успешный запрос            |
| 400 | Неверные параметры запроса |
| 401 | Не авторизован             |
| 403 | Доступ запрещен            |
| 404 | Ресурс не найден           |
| 422 | Ошибка валидации           |
| 500 | Внутренняя ошибка сервера  |

## Формат ошибок

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {
    "field": "error description"
  }
}
```

## Пагинация

Все списковые эндпоинты поддерживают пагинацию:

**Параметры:**

- `page` - номер страницы (начиная с 1)
- `limit` - количество элементов на странице (по умолчанию 20, максимум 100)

**Ответ:**

```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}
```

## Сортировка

Поддерживается сортировка по различным полям:

**Параметры:**

- `sortBy` - поле для сортировки
- `sortOrder` - направление сортировки (`asc` или `desc`)

**Пример:**

```
GET /api/ads?sortBy=price&sortOrder=desc
```
