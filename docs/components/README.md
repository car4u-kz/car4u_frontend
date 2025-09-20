# Компоненты

## Обзор

Проект использует модульную архитектуру компонентов с разделением на переиспользуемые UI компоненты и специфичные для страниц компоненты.

## Структура компонентов

```
components/
├── app-header/           # Главный заголовок приложения
├── auth-error-modal/     # Модальное окно ошибок авторизации
├── car-title-hover-preview/ # Превью объявления при наведении
├── common/               # Общие переиспользуемые компоненты
├── date-time-typography/ # Компонент для отображения дат
├── form/                 # Форменные компоненты
├── generate-pdf/         # Генерация PDF отчетов
├── organization-switcher/ # Переключатель организаций
└── table/                # Табличные компоненты
```

## Общие компоненты (common/)

### Button

```typescript
// components/common/button.tsx
interface ButtonProps {
  variant?: "primary" | "secondary" | "outline";
  size?: "small" | "medium" | "large";
  disabled?: boolean;
  loading?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}
```

**Использование:**

```typescript
<Button variant="primary" size="medium" onClick={handleClick}>
  Сохранить
</Button>
```

### IconButton

```typescript
// components/common/icon-button.tsx
interface IconButtonProps {
  icon: React.ReactNode;
  variant?: "primary" | "secondary";
  size?: "small" | "medium" | "large";
  disabled?: boolean;
  onClick?: () => void;
  tooltip?: string;
}
```

### Modal

```typescript
// components/common/modal.tsx
interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: "small" | "medium" | "large" | "fullscreen";
}
```

### Tooltip

```typescript
// components/common/tooltip.tsx
interface TooltipProps {
  title: string;
  children: React.ReactNode;
  placement?: "top" | "bottom" | "left" | "right";
  arrow?: boolean;
}
```

### Typography

```typescript
// components/common/typography.tsx
interface TypographyProps {
  variant?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "body1" | "body2";
  color?: "primary" | "secondary" | "error" | "warning" | "success";
  children: React.ReactNode;
}
```

## Форменные компоненты (form/)

### TextInput

```typescript
// components/form/text-input.tsx
interface TextInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  type?: "text" | "email" | "password" | "number";
  disabled?: boolean;
  required?: boolean;
}
```

### Select

```typescript
// components/form/select.tsx
interface SelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  multiple?: boolean;
}
```

## Табличные компоненты (table/)

### Table

```typescript
// components/table/table.tsx
interface TableProps {
  columns: Array<{
    key: string;
    title: string;
    sortable?: boolean;
    render?: (value: any, row: any) => React.ReactNode;
  }>;
  data: any[];
  loading?: boolean;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    onPageChange: (page: number) => void;
  };
  sorting?: {
    field: string;
    order: "asc" | "desc";
    onSort: (field: string, order: "asc" | "desc") => void;
  };
}
```

### TableBody

```typescript
// components/table/table-body.tsx
interface TableBodyProps {
  children: React.ReactNode;
  loading?: boolean;
  emptyMessage?: string;
}
```

### TableCell

```typescript
// components/table/table-cell.tsx
interface TableCellProps {
  children: React.ReactNode;
  align?: "left" | "center" | "right";
  sortable?: boolean;
  onClick?: () => void;
}
```

## Специализированные компоненты

### AppHeader

```typescript
// components/app-header/app-header.tsx
interface AppHeaderProps {
  // Автоматически получает данные из контекста
}
```

**Функциональность:**

- Навигационное меню
- Переключатель организаций
- Профиль пользователя
- Кнопка выхода

### AuthErrorModal

```typescript
// components/auth-error-modal/auth-error-modal.tsx
interface AuthErrorModalProps {
  errorStatus: UserStatus;
  onClose: () => void;
}
```

**Типы ошибок:**

- `Unconfirmed` - аккаунт не подтвержден
- `AccessDenied` - доступ запрещен
- `Deleted` - аккаунт удален

### CarTitleHoverPreview

```typescript
// components/car-title-hover-preview/car-title-hover-preview.tsx
interface CarTitleHoverPreviewProps {
  title: string;
  url: string;
  children: React.ReactNode;
}
```

**Функциональность:**

- Превью объявления при наведении
- Быстрый переход к объявлению
- Кэширование данных превью

### OrganizationSwitcher

```typescript
// components/organization-switcher/organization-switcher.tsx
interface OrganizationSwitcherProps {
  // Автоматически получает данные из OrganizationProvider
}
```

**Функциональность:**

- Список доступных организаций
- Переключение активной организации
- Отображение текущей организации

### GeneratePDF

```typescript
// components/generate-pdf/generate-pdf.tsx
interface GeneratePDFProps {
  data: any[];
  filename: string;
  title: string;
  columns: Array<{
    key: string;
    title: string;
    width?: number;
  }>;
}
```

## Клиентские страницы (client-pages/)

### Поиски (search/)

#### SearchForm

```typescript
// client-pages/search/components/form.tsx
interface SearchFormProps {
  onSubmit: (filters: SearchFilters) => void;
  initialFilters?: SearchFilters;
  loading?: boolean;
}
```

#### SearchTableRows

```typescript
// client-pages/search/components/table-rows.tsx
interface SearchTableRowsProps {
  searches: Search[];
  onEdit: (search: Search) => void;
  onDelete: (searchId: string) => void;
  onToggle: (searchId: string, isActive: boolean) => void;
}
```

### Объявления (ads/)

#### AdsTableButtons

```typescript
// client-pages/ads/components/table-buttons.tsx
interface AdsTableButtonsProps {
  ad: Ad;
  onView: (ad: Ad) => void;
  onAddToMyAds: (ad: Ad) => void;
}
```

#### AdsTableRow

```typescript
// client-pages/ads/components/table-row.tsx
interface AdsTableRowProps {
  ad: Ad;
  onView: (ad: Ad) => void;
  onAddToMyAds: (ad: Ad) => void;
}
```

### Мои объявления (my-ads/)

#### MyAdsForm

```typescript
// client-pages/my-ads/components/form.tsx
interface MyAdsFormProps {
  onSubmit: (data: MyAdFormData) => void;
  accounts: Account[];
  loading?: boolean;
}
```

#### MyAdsTableRows

```typescript
// client-pages/my-ads/components/table-rows.tsx
interface MyAdsTableRowsProps {
  ads: MyAd[];
  onEdit: (ad: MyAd) => void;
  onDelete: (adId: string) => void;
  onViewHistory: (ad: MyAd) => void;
}
```

## Паттерны использования

### 1. Композиция компонентов

```typescript
// Использование общих компонентов
<Modal open={isOpen} onClose={handleClose} title="Добавить объявление">
  <form onSubmit={handleSubmit}>
    <TextInput
      label="URL объявления"
      value={url}
      onChange={setUrl}
      error={errors.url}
      required
    />
    <Select
      label="Аккаунт"
      value={accountId}
      onChange={setAccountId}
      options={accountOptions}
      required
    />
    <Button type="submit" loading={loading}>
      Добавить
    </Button>
  </form>
</Modal>
```

### 2. Условный рендеринг

```typescript
// Условное отображение компонентов
{
  userRole === "admin" && (
    <Button onClick={handleAdminAction}>Админ действие</Button>
  );
}

{
  loading ? <CircularProgress /> : <Table data={data} columns={columns} />;
}
```

### 3. Обработка состояний

```typescript
// Обработка различных состояний
const renderContent = () => {
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  if (data.length === 0) return <EmptyState />;
  return <DataTable data={data} />;
};
```

## Стилизация

### Material-UI интеграция

```typescript
// Использование MUI компонентов
import { Button as MuiButton, styled } from "@mui/material";

const CustomButton = styled(MuiButton)(({ theme }) => ({
  borderRadius: theme.spacing(1),
  textTransform: "none",
  fontWeight: 600,
}));
```

### Tailwind CSS

```typescript
// Использование Tailwind классов
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-md">
  <Typography variant="h6" className="text-gray-900">
    Заголовок
  </Typography>
  <Button className="bg-blue-600 hover:bg-blue-700">Действие</Button>
</div>
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

### Storybook

```typescript
// stories/Button.stories.tsx
import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "@/components/common/button";

const meta: Meta<typeof Button> = {
  title: "Components/Button",
  component: Button,
  parameters: {
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    variant: "primary",
    children: "Primary Button",
  },
};
```

## Производительность

### Мемоизация

```typescript
// Использование React.memo для оптимизации
const ExpensiveComponent = React.memo(({ data, onUpdate }) => {
  // Тяжелые вычисления
  const processedData = useMemo(() => {
    return data.map((item) => processItem(item));
  }, [data]);

  return <div>{/* Рендер */}</div>;
});
```

### Lazy loading

```typescript
// Ленивая загрузка компонентов
const HeavyComponent = lazy(() => import("./HeavyComponent"));

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <HeavyComponent />
    </Suspense>
  );
}
```

## Доступность (Accessibility)

### ARIA атрибуты

```typescript
// Добавление ARIA атрибутов
<Button
  aria-label="Закрыть модальное окно"
  aria-describedby="modal-description"
  onClick={onClose}
>
  ×
</Button>
```

### Клавиатурная навигация

```typescript
// Обработка клавиатурных событий
const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === "Escape") {
    onClose();
  }
};
```

## Лучшие практики

1. **Единообразие** - используйте общие компоненты
2. **Типизация** - всегда типизируйте props
3. **Документация** - документируйте сложные компоненты
4. **Тестирование** - пишите тесты для критичных компонентов
5. **Производительность** - оптимизируйте рендеринг
6. **Доступность** - учитывайте accessibility требования
