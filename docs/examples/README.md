# Примеры кода

## Создание нового API route

### Базовый API route

```typescript
// app/api/example/route.ts
import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/auth/proxy-to-backend";

export async function GET(request: NextRequest) {
  return proxyToBackend(request, "/example");
}

export async function POST(request: NextRequest) {
  return proxyToBackend(request, "/example", {
    method: "POST",
    body: await request.text(),
  });
}
```

### API route с валидацией

```typescript
// app/api/example/route.ts
import { NextRequest, NextResponse } from "next/server";
import { proxyToBackend } from "@/lib/auth/proxy-to-backend";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Валидация данных
    if (!body.name || !body.email) {
      return NextResponse.json(
        { error: "Name and email are required" },
        { status: 400 }
      );
    }

    return proxyToBackend(request, "/example", {
      method: "POST",
      body: JSON.stringify(body),
    });
  } catch (error) {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
}
```

## Создание сервиса

### Базовый сервис

```typescript
// services/example-service.ts
import { useFetchWithAuth } from "@/hooks/use-fetch-with-auth";

export interface ExampleData {
  id: string;
  name: string;
  email: string;
}

export const useExampleService = () => {
  const { fetchWithAuth } = useFetchWithAuth();

  const getExamples = async (): Promise<ExampleData[]> => {
    const response = await fetchWithAuth("/api/example");
    return response.json();
  };

  const createExample = async (
    data: Omit<ExampleData, "id">
  ): Promise<ExampleData> => {
    const response = await fetchWithAuth("/api/example", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return response.json();
  };

  const updateExample = async (
    id: string,
    data: Partial<ExampleData>
  ): Promise<ExampleData> => {
    const response = await fetchWithAuth(`/api/example/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
    return response.json();
  };

  const deleteExample = async (id: string): Promise<void> => {
    await fetchWithAuth(`/api/example/${id}`, {
      method: "DELETE",
    });
  };

  return {
    getExamples,
    createExample,
    updateExample,
    deleteExample,
  };
};
```

### Сервис с React Query

```typescript
// services/example-service.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useFetchWithAuth } from "@/hooks/use-fetch-with-auth";

export const useExampleService = () => {
  const { fetchWithAuth } = useFetchWithAuth();
  const queryClient = useQueryClient();

  const useExamples = () => {
    return useQuery({
      queryKey: ["examples"],
      queryFn: async () => {
        const response = await fetchWithAuth("/api/example");
        return response.json();
      },
      staleTime: 5 * 60 * 1000, // 5 минут
    });
  };

  const useCreateExample = () => {
    return useMutation({
      mutationFn: async (data: Omit<ExampleData, "id">) => {
        const response = await fetchWithAuth("/api/example", {
          method: "POST",
          body: JSON.stringify(data),
        });
        return response.json();
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["examples"] });
      },
    });
  };

  return {
    useExamples,
    useCreateExample,
  };
};
```

## Создание компонента

### Простой компонент

```typescript
// components/example/example.tsx
import React from "react";
import { Button, Typography } from "@/components";

interface ExampleProps {
  title: string;
  description?: string;
  onAction?: () => void;
}

export const Example: React.FC<ExampleProps> = ({
  title,
  description,
  onAction,
}) => {
  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <Typography variant="h6" className="mb-2">
        {title}
      </Typography>

      {description && (
        <Typography variant="body2" className="mb-4 text-gray-600">
          {description}
        </Typography>
      )}

      {onAction && (
        <Button onClick={onAction} variant="primary">
          Выполнить действие
        </Button>
      )}
    </div>
  );
};
```

### Компонент с формой

```typescript
// components/example-form/example-form.tsx
import React, { useState } from "react";
import { Button, TextInput, Modal } from "@/components";
import { useExampleService } from "@/services/example-service";

interface ExampleFormProps {
  open: boolean;
  onClose: () => void;
  initialData?: ExampleData;
}

export const ExampleForm: React.FC<ExampleFormProps> = ({
  open,
  onClose,
  initialData,
}) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    email: initialData?.email || "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { createExample, updateExample } = useExampleService();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Валидация
    const newErrors: Record<string, string> = {};
    if (!formData.name) newErrors.name = "Имя обязательно";
    if (!formData.email) newErrors.email = "Email обязателен";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      if (initialData) {
        await updateExample(initialData.id, formData);
      } else {
        await createExample(formData);
      }
      onClose();
    } catch (error) {
      console.error("Ошибка при сохранении:", error);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Пример формы">
      <form onSubmit={handleSubmit} className="space-y-4">
        <TextInput
          label="Имя"
          value={formData.name}
          onChange={(value) =>
            setFormData((prev) => ({ ...prev, name: value }))
          }
          error={errors.name}
          required
        />

        <TextInput
          label="Email"
          type="email"
          value={formData.email}
          onChange={(value) =>
            setFormData((prev) => ({ ...prev, email: value }))
          }
          error={errors.email}
          required
        />

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Отмена
          </Button>
          <Button type="submit" variant="primary">
            {initialData ? "Обновить" : "Создать"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
```

## Создание страницы

### Страница со списком

```typescript
// app/examples/page.tsx
"use client";

import React, { useState } from "react";
import { useExampleService } from "@/services/example-service";
import { Button, Table, LoadingSpinner } from "@/components";
import { ExampleForm } from "@/components/example-form/example-form";

export default function ExamplesPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ExampleData | null>(null);

  const { useExamples, useDeleteExample } = useExampleService();
  const { data: examples, isLoading, error } = useExamples();
  const deleteExample = useDeleteExample();

  const handleEdit = (item: ExampleData) => {
    setEditingItem(item);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Вы уверены, что хотите удалить этот элемент?")) {
      await deleteExample.mutateAsync(id);
    }
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingItem(null);
  };

  if (isLoading) return <LoadingSpinner />;
  if (error) return <div>Ошибка загрузки данных</div>;

  const columns = [
    { key: "name", title: "Имя" },
    { key: "email", title: "Email" },
    {
      key: "actions",
      title: "Действия",
      render: (value: any, row: ExampleData) => (
        <div className="flex space-x-2">
          <Button
            size="small"
            variant="outline"
            onClick={() => handleEdit(row)}
          >
            Редактировать
          </Button>
          <Button
            size="small"
            variant="outline"
            onClick={() => handleDelete(row.id)}
          >
            Удалить
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Примеры</h1>
        <Button onClick={() => setIsFormOpen(true)}>Добавить пример</Button>
      </div>

      <Table columns={columns} data={examples || []} loading={isLoading} />

      <ExampleForm
        open={isFormOpen}
        onClose={handleFormClose}
        initialData={editingItem || undefined}
      />
    </div>
  );
}
```

## Создание хука

### Кастомный хук

```typescript
// hooks/use-example.ts
import { useState, useEffect } from "react";
import { useExampleService } from "@/services/example-service";

export const useExample = (id: string) => {
  const [data, setData] = useState<ExampleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { getExample } = useExampleService();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await getExample(id);
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Ошибка загрузки");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id, getExample]);

  return { data, loading, error };
};
```

## Работа с формами

### Форма с валидацией

```typescript
// components/validated-form/validated-form.tsx
import React, { useState } from "react";
import { Button, TextInput } from "@/components";

interface FormData {
  name: string;
  email: string;
  phone: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
}

export const ValidatedForm: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Имя обязательно";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email обязателен";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email некорректен";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Телефон обязателен";
    } else if (!/^\+?[\d\s\-\(\)]+$/.test(formData.phone)) {
      newErrors.phone = "Телефон некорректен";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      // Отправка данных
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Имитация запроса
      console.log("Данные отправлены:", formData);
    } catch (error) {
      console.error("Ошибка отправки:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFieldChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Очистка ошибки при изменении поля
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      <TextInput
        label="Имя"
        value={formData.name}
        onChange={(value) => handleFieldChange("name", value)}
        error={errors.name}
        required
      />

      <TextInput
        label="Email"
        type="email"
        value={formData.email}
        onChange={(value) => handleFieldChange("email", value)}
        error={errors.email}
        required
      />

      <TextInput
        label="Телефон"
        value={formData.phone}
        onChange={(value) => handleFieldChange("phone", value)}
        error={errors.phone}
        required
      />

      <Button
        type="submit"
        loading={isSubmitting}
        disabled={isSubmitting}
        className="w-full"
      >
        {isSubmitting ? "Отправка..." : "Отправить"}
      </Button>
    </form>
  );
};
```

## Обработка ошибок

### Error Boundary

```typescript
// components/error-boundary/error-boundary.tsx
import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button, Typography } from "@/components";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center min-h-[200px] p-4">
          <Typography variant="h6" className="mb-2 text-red-600">
            Что-то пошло не так
          </Typography>
          <Typography
            variant="body2"
            className="mb-4 text-gray-600 text-center"
          >
            Произошла ошибка при загрузке компонента. Попробуйте обновить
            страницу.
          </Typography>
          <Button onClick={() => window.location.reload()} variant="primary">
            Обновить страницу
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

## Тестирование

### Unit тест компонента

```typescript
// __tests__/components/example.test.tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { Example } from "@/components/example/example";

describe("Example", () => {
  it("renders with title", () => {
    render(<Example title="Test Title" />);
    expect(screen.getByText("Test Title")).toBeInTheDocument();
  });

  it("renders with description", () => {
    render(<Example title="Test Title" description="Test Description" />);
    expect(screen.getByText("Test Description")).toBeInTheDocument();
  });

  it("calls onAction when button is clicked", () => {
    const handleAction = jest.fn();
    render(<Example title="Test Title" onAction={handleAction} />);

    fireEvent.click(screen.getByText("Выполнить действие"));
    expect(handleAction).toHaveBeenCalledTimes(1);
  });

  it("does not render button when onAction is not provided", () => {
    render(<Example title="Test Title" />);
    expect(screen.queryByText("Выполнить действие")).not.toBeInTheDocument();
  });
});
```

### Тест хука

```typescript
// __tests__/hooks/use-example.test.ts
import { renderHook, waitFor } from "@testing-library/react";
import { useExample } from "@/hooks/use-example";
import { useExampleService } from "@/services/example-service";

jest.mock("@/services/example-service");

describe("useExample", () => {
  it("fetches data successfully", async () => {
    const mockData = { id: "1", name: "Test", email: "test@example.com" };
    const mockGetExample = jest.fn().mockResolvedValue(mockData);

    (useExampleService as jest.Mock).mockReturnValue({
      getExample: mockGetExample,
    });

    const { result } = renderHook(() => useExample("1"));

    expect(result.current.loading).toBe(true);
    expect(result.current.data).toBe(null);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual(mockData);
    expect(result.current.error).toBe(null);
  });
});
```
