# Руководство для разработчиков

## Быстрый старт

### Предварительные требования

- **Node.js** 18+
- **npm** 9+
- **Git**
- **VS Code** (рекомендуется)

### Установка

```bash
# Клонирование репозитория
git clone <repository-url>
cd car4u_frontend

# Установка зависимостей
npm install

# Настройка переменных окружения
cp .env.example .env.local
# Отредактируйте .env.local с вашими настройками

# Запуск в режиме разработки
npm run dev
```

Приложение будет доступно по адресу: `http://localhost:3000`

## Структура проекта

### Основные папки

```
car4u_frontend/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes (прокси к бекенду)
│   ├── ads/               # Страница объявлений
│   ├── search/            # Страница поисков
│   ├── my-ads/            # Страница моих объявлений
│   └── layout.tsx         # Корневой layout
├── client-pages/          # Клиентские компоненты страниц
├── components/            # Переиспользуемые UI компоненты
├── context/              # React Context провайдеры
├── hooks/                # Кастомные React хуки
├── services/             # API сервисы
├── types/                # TypeScript типы
├── utils/                # Утилиты и хелперы
├── lib/                  # Библиотеки и конфигурации
└── constants/            # Константы приложения
```

### Ключевые файлы

- `middleware.ts` - Middleware для авторизации
- `next.config.ts` - Конфигурация Next.js
- `tailwind.config.js` - Конфигурация Tailwind CSS
- `tsconfig.json` - Конфигурация TypeScript

## Переменные окружения

### .env.local

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

## Команды разработки

### Основные команды

```bash
# Запуск в режиме разработки
npm run dev

# Сборка для продакшена
npm run build

# Запуск продакшен сборки
npm start

# Линтинг кода
npm run lint

# Проверка типов TypeScript
npm run type-check
```

### Дополнительные команды

```bash
# Анализ размера bundle
npm run analyze

# Очистка кэша Next.js
npm run clean

# Проверка зависимостей
npm audit
```

## Архитектурные принципы

### 1. Разделение ответственности

- **app/** - Next.js страницы и API routes
- **client-pages/** - Клиентские компоненты страниц
- **components/** - Переиспользуемые UI компоненты
- **services/** - API сервисы и бизнес-логика
- **context/** - Глобальное состояние приложения

### 2. Прокси-архитектура

```typescript
// app/api/ads/route.ts
export async function GET(request: NextRequest) {
  return proxyToBackend(request, "/ads");
}
```

### 3. Типизация

Все компоненты и функции должны быть типизированы:

```typescript
interface ComponentProps {
  data: DataType;
  onAction: (id: string) => void;
}

const Component: React.FC<ComponentProps> = ({ data, onAction }) => {
  // Реализация
};
```

## Работа с API

### Создание нового API route

1. Создайте файл в `app/api/your-endpoint/route.ts`
2. Используйте `proxyToBackend` для проксирования

```typescript
// app/api/your-endpoint/route.ts
import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/auth/proxy-to-backend";

export async function GET(request: NextRequest) {
  return proxyToBackend(request, "/your-endpoint");
}

export async function POST(request: NextRequest) {
  return proxyToBackend(request, "/your-endpoint", {
    method: "POST",
    body: await request.text(),
  });
}
```

### Создание сервиса

```typescript
// services/your-service.ts
import { useFetchWithAuth } from "@/hooks/use-fetch-with-auth";

export const useYourService = () => {
  const { fetchWithAuth } = useFetchWithAuth();

  const getData = async () => {
    const response = await fetchWithAuth("/api/your-endpoint");
    return response.json();
  };

  const createData = async (data: any) => {
    const response = await fetchWithAuth("/api/your-endpoint", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return response.json();
  };

  return { getData, createData };
};
```

## Работа с компонентами

### Создание нового компонента

1. Создайте папку в `components/your-component/`
2. Создайте файл `your-component.tsx`
3. Добавьте экспорт в `components/index.ts`

```typescript
// components/your-component/your-component.tsx
interface YourComponentProps {
  title: string;
  onAction: () => void;
}

export const YourComponent: React.FC<YourComponentProps> = ({
  title,
  onAction,
}) => {
  return (
    <div className="your-component">
      <h2>{title}</h2>
      <button onClick={onAction}>Action</button>
    </div>
  );
};
```

### Использование общих компонентов

```typescript
import { Button, Modal, TextInput } from "@/components";

const MyComponent = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [value, setValue] = useState("");

  return (
    <Modal open={isOpen} onClose={() => setIsOpen(false)}>
      <TextInput label="Название" value={value} onChange={setValue} />
      <Button onClick={() => setIsOpen(false)}>Сохранить</Button>
    </Modal>
  );
};
```

## Управление состоянием

### React Query

```typescript
// Использование React Query для кэширования
import { useQuery, useMutation } from "@tanstack/react-query";

const useAds = () => {
  return useQuery({
    queryKey: ["ads"],
    queryFn: () => fetchAds(),
    staleTime: 5 * 60 * 1000, // 5 минут
  });
};

const useCreateAd = () => {
  return useMutation({
    mutationFn: (data: AdData) => createAd(data),
    onSuccess: () => {
      // Инвалидация кэша
      queryClient.invalidateQueries({ queryKey: ["ads"] });
    },
  });
};
```

### Context API

```typescript
// Создание нового контекста
const MyContext = createContext<MyContextType | undefined>(undefined);

export const MyProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, setState] = useState(initialState);

  return (
    <MyContext.Provider value={{ state, setState }}>
      {children}
    </MyContext.Provider>
  );
};

export const useMyContext = () => {
  const context = useContext(MyContext);
  if (!context) {
    throw new Error("useMyContext must be used within MyProvider");
  }
  return context;
};
```

## Стилизация

### Tailwind CSS

```typescript
// Использование Tailwind классов
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-md">
  <h2 className="text-xl font-semibold text-gray-900">Заголовок</h2>
  <Button className="bg-blue-600 hover:bg-blue-700 text-white">Действие</Button>
</div>
```

### Material-UI

```typescript
// Использование MUI компонентов
import { Button, TextField, Box } from "@mui/material";

const MyComponent = () => {
  return (
    <Box sx={{ p: 2 }}>
      <TextField
        label="Название"
        variant="outlined"
        fullWidth
        margin="normal"
      />
      <Button variant="contained" color="primary">
        Сохранить
      </Button>
    </Box>
  );
};
```

## Тестирование

### Unit тесты

```typescript
// __tests__/components/button.test.tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { Button } from "@/components/common/button";

describe("Button", () => {
  it("renders with correct text", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText("Click me")).toBeInTheDocument();
  });

  it("calls onClick when clicked", () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    fireEvent.click(screen.getByText("Click me"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### Интеграционные тесты

```typescript
// __tests__/pages/ads.test.tsx
import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AdsPage from "@/app/ads/page";

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

describe("AdsPage", () => {
  it("renders ads list", async () => {
    const queryClient = createTestQueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <AdsPage />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("Объявления")).toBeInTheDocument();
    });
  });
});
```

## Отладка

### Логирование

```typescript
// Использование console.log для отладки
console.log("Debug info:", { data, state });

// Условное логирование
if (process.env.NODE_ENV === "development") {
  console.log("Development only log");
}
```

### React DevTools

- Установите React Developer Tools
- Используйте для отладки компонентов и состояния

### Next.js DevTools

```bash
# Запуск с дополнительными инструментами
npm run dev -- --turbo
```

## Производительность

### Оптимизация рендеринга

```typescript
// Использование React.memo
const ExpensiveComponent = React.memo(({ data }) => {
  // Тяжелые вычисления
  return <div>{/* Рендер */}</div>;
});

// Использование useMemo
const processedData = useMemo(() => {
  return data.map((item) => processItem(item));
}, [data]);

// Использование useCallback
const handleClick = useCallback(() => {
  // Обработчик
}, [dependencies]);
```

### Анализ производительности

```bash
# Анализ размера bundle
npm run build
npm run analyze

# Проверка производительности
npm run lighthouse
```

## Git workflow

### Создание ветки

```bash
# Создание новой ветки
git checkout -b feature/your-feature-name

# Или для исправления багов
git checkout -b fix/your-bug-fix
```

### Коммиты

```bash
# Добавление изменений
git add .

# Коммит с описательным сообщением
git commit -m "feat: add new search functionality"

# Push в удаленный репозиторий
git push origin feature/your-feature-name
```

### Pull Request

1. Создайте Pull Request в GitHub
2. Добавьте описание изменений
3. Укажите связанные issues
4. Запросите review у коллег

## Troubleshooting

### Частые проблемы

1. **Ошибки сборки**

   ```bash
   # Очистка кэша
   rm -rf .next
   npm run build
   ```

2. **Проблемы с зависимостями**

   ```bash
   # Переустановка зависимостей
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Ошибки TypeScript**
   ```bash
   # Проверка типов
   npm run type-check
   ```

### Получение помощи

1. Проверьте документацию в папке `docs/`
2. Поищите в issues репозитория
3. Обратитесь к команде разработки
4. Создайте новый issue при необходимости

## Лучшие практики

### Код

1. **Типизация** - всегда используйте TypeScript
2. **Компоненты** - делайте их переиспользуемыми
3. **Именование** - используйте понятные имена
4. **Комментарии** - документируйте сложную логику

### Git

1. **Ветки** - создавайте отдельные ветки для каждой задачи
2. **Коммиты** - делайте атомарные коммиты
3. **Сообщения** - пишите понятные сообщения коммитов

### Тестирование

1. **Покрытие** - стремитесь к высокому покрытию тестами
2. **Типы тестов** - используйте разные типы тестов
3. **Автоматизация** - настройте автоматические тесты
