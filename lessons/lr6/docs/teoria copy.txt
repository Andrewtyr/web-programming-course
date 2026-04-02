# TypeScript - Полный конспект

## 📘 Содержание

1. [Введение в TypeScript](#введение-в-typescript)
2. [Базовые типы](#базовые-типы)
3. [Union и Intersection типы](#union-и-intersection-типы)
4. [Интерфейсы и типы](#интерфейсы-и-типы)
5. [Generics (Обобщения)](#generics-обобщения)
6. [Настройка tsconfig.json](#настройка-tsconfigjson)
7. [Практические советы](#практические-советы)

---

## 1. Введение в TypeScript

### 🎯 Зачем нужен TypeScript?

TypeScript решает ключевые проблемы JavaScript, добавляя статическую типизацию.

#### ❌ JavaScript проблемы:

```javascript
// Ошибки обнаруживаются только в runtime
function calculatePrice(price, discount) {
    return price - (price * discount / 100);
}

calculatePrice("100", "10"); // "100900" - WTF результат
calculatePrice(100);         // NaN - undefined discount
```

#### ✅ TypeScript решения:

```typescript
function calculatePrice(price: number, discount: number): number {
    return price - (price * discount / 100);
}

calculatePrice("100", "10"); // ❌ Ошибка компиляции
calculatePrice(100);         // ❌ Ошибка компиляции - не хватает аргумента
calculatePrice(100, 10);     // ✅ 90
```

### 🚀 Основные преимущества TypeScript:

- **Статическая типизация** - ошибки находятся на этапе разработки
- **Автодополнение** - IDE знает что доступно
- **Рефакторинг** - безопасное переименование и изменение кода
- **Документация** - типы служат документацией
- **Масштабируемость** - легче поддерживать большие проекты

> 💡 **Важно:** TypeScript компилируется в обычный JavaScript, поэтому работает везде, где работает JS.

---

## 2. Базовые типы

### Примитивные типы

```typescript
// Явное указание типов
let name: string = "Анна";
let age: number = 25;
let isStudent: boolean = true;

// Type inference - TypeScript сам выводит тип
let city = "Москва";        // string
let score = 100;            // number
let isActive = false;       // boolean
```

> 💡 **Совет:** Используйте type inference когда тип очевиден. TypeScript достаточно умный, чтобы вывести тип самостоятельно.

### Массивы и объекты

```typescript
// Массивы
let numbers: number[] = [1, 2, 3, 4, 5];
let names: Array<string> = ["Анна", "Петр", "Мария"];

// Объекты
let user: {
    name: string;
    age: number;
    email?: string; // опциональное свойство
} = {
    name: "Анна",
    age: 25
    // email необязательный
};
```

### null, undefined и void

```typescript
let data: string | null = null;
let result: undefined = undefined;

function logMessage(msg: string): void {
    console.log(msg);
    // функция ничего не возвращает
}
```

### 📋 Типы данных в TypeScript:

| Тип | Описание | Пример |
|-----|----------|--------|
| `string` | Текстовые данные | `"Hello"` |
| `number` | Числовые данные | `42`, `3.14` |
| `boolean` | true/false | `true`, `false` |
| `array` | Массивы | `[1, 2, 3]` |
| `object` | Объекты | `{name: "Anna"}` |
| `null` | Явное отсутствие значения | `null` |
| `undefined` | Неопределенное значение | `undefined` |
| `void` | Отсутствие возвращаемого значения | `function(): void` |
| `any` | Любой тип (избегайте!) | `any` |

---

## 3. Union и Intersection типы

### Union типы (|)

Позволяют переменной быть одним из нескольких типов.

```typescript
// Переменная может быть одним из нескольких типов
let id: string | number;
id = "abc123";  // ✅
id = 12345;     // ✅
id = true;      // ❌

// Функция с union параметром
function formatId(id: string | number): string {
    // Type narrowing - проверка типа
    if (typeof id === "string") {
        return id.toUpperCase();
    }
    return id.toString();
}
```

### Literal типы

Точные значения как типы - очень полезно для создания перечислений.

```typescript
// Точные значения как типы
type Status = "loading" | "success" | "error";
type Theme = "light" | "dark";

let currentStatus: Status = "loading"; // ✅
let userTheme: Theme = "blue";         // ❌ Error
```

### Intersection типы (&)

Объединяют несколько типов в один - должны быть ВСЕ свойства.

```typescript
type PersonalInfo = {
    name: string;
    age: number;
};

type ContactInfo = {
    email: string;
    phone: string;
};

// Объединение типов - должны быть ВСЕ свойства
type User = PersonalInfo & ContactInfo;

let user: User = {
    name: "Анна",
    age: 25,
    email: "anna@example.com",
    phone: "+7-123-456-78-90"
};
```

> 📝 **Разница между Union и Intersection:**
> - Union (|) - "ИЛИ" - может быть одним из типов
> - Intersection (&) - "И" - должен содержать все свойства

---

## 4. Интерфейсы и типы

### Интерфейсы (interface)

Определяют структуру объектов.

```typescript
interface Product {
    id: number;
    name: string;
    price: number;
    description?: string;        // опциональное
    readonly category: string;   // только для чтения
}

// Использование интерфейса
let laptop: Product = {
    id: 1,
    name: "MacBook Pro",
    price: 150000,
    category: "Electronics"
};

// laptop.category = "Computers"; // ❌ readonly свойство
```

### Расширение интерфейсов

```typescript
interface BaseProduct {
    id: number;
    name: string;
    price: number;
}

interface DigitalProduct extends BaseProduct {
    downloadUrl: string;
    fileSize: number;
}

interface PhysicalProduct extends BaseProduct {
    weight: number;
    dimensions: {
        width: number;
        height: number;
        depth: number;
    };
}
```

### Type aliases vs Interfaces

| Type alias | Interface |
|------------|-----------|
| `type Point = { x: number; y: number; }` | `interface IPoint { x: number; y: number; }` |
| Хорошо для union типов | Можно расширять |
| `type Status = "ok" \| "error"` | `interface IPoint { z?: number; }` |

> 💡 **Когда использовать что:**
> - `interface` - для объектов, которые могут расширяться
> - `type` - для union типов, примитивов, сложных типов

### Функциональные типы

```typescript
// Type alias для функции
type CalculatorFn = (a: number, b: number) => number;

// Interface для функции
interface ICalculator {
    (a: number, b: number): number;
}

// Использование
let add: CalculatorFn = (a, b) => a + b;
let multiply: ICalculator = (a, b) => a * b;
```

---

## 5. Generics (Обобщения)

### 🎯 Зачем нужны Generics?

Позволяют создавать переиспользуемый код, который работает с разными типами.

#### ❌ Без generics - дублирование:

```typescript
function getFirstString(items: string[]): string {
    return items[0];
}

function getFirstNumber(items: number[]): number {
    return items[0];
}
```

#### ✅ С generics - универсально:

```typescript
function getFirst<T>(items: T[]): T {
    return items[0];
}

let firstNumber = getFirst([1, 2, 3]);        // number
let firstName = getFirst(["Anna", "Peter"]);  // string
let firstBool = getFirst([true, false]);      // boolean
```

### Generics с ограничениями

```typescript
// Ограничение - T должен иметь свойство length
function logLength<T extends { length: number }>(item: T): T {
    console.log(`Длина: ${item.length}`);
    return item;
}

logLength("Hello");        // ✅ string has length
logLength([1, 2, 3]);      // ✅ array has length
logLength(42);             // ❌ number doesn't have length
```

### 🌟 Практический пример - API Response

```typescript
interface ApiResponse<T> {
    data: T;
    status: "success" | "error";
    message?: string;
}

interface User {
    id: number;
    name: string;
    email: string;
}

// Типизированный ответ API
let userResponse: ApiResponse<User> = {
    data: {
        id: 1,
        name: "Анна",
        email: "anna@example.com"
    },
    status: "success"
};

let usersResponse: ApiResponse<User[]> = {
    data: [
        { id: 1, name: "Анна", email: "anna@example.com" },
        { id: 2, name: "Петр", email: "peter@example.com" }
    ],
    status: "success"
};
```

---

## 6. Настройка tsconfig.json

### Базовая конфигурация

```json
{
  "compilerOptions": {
    "target": "esnext",                          
    "lib": ["esnext", "DOM"],   
    "allowJs": true,                             
    "skipLibCheck": true,                        
    "esModuleInterop": true,                     
    "allowSyntheticDefaultImports": true,        
    "strict": true,                              
    "forceConsistentCasingInFileNames": true,    
    "noFallthroughCasesInSwitch": true,         
    "module": "ESNext",                          
    "moduleResolution": "bundler",               
    "resolveJsonModule": true,                   
    "isolatedModules": true,                     
    "noEmit": true,                             
    "jsx": "react-jsx"                          
  },
  "include": [
    "src"
  ],
  "exclude": ["node_modules", "dist"]
}
```

### 🔧 Ключевые опции:

- `"strict": true` - включает все строгие проверки
- `"noImplicitAny": true` - запрещает неявный any
- `"strictNullChecks": true` - строгие проверки null/undefined
- `"jsx": "react-jsx"` - поддержка React JSX

> ⚠️ **Внимание:** Включение strict режима может выявить много ошибок в существующем коде, но это хорошо для качества проекта.

---

## 7. Практические советы

### 1. Описывайте малое + собирайте большое

#### ❌ Плохо - слишком сложно для начала:

```typescript
type ComplexType<T extends Record<string, any>, U = keyof T> = {
    [K in U]: T[K] extends Function ? never : T[K];
};
```

#### ✅ Хорошо - простое и понятное:

```typescript
interface User {
    name: string;
    age: number;
}
```

### 2. Используйте Type Inference

#### ❌ Не нужно:

```typescript
let message: string = "Hello World";
```

#### ✅ Лучше:

```typescript
let message = "Hello World"; // TS сам выведет string
```

### 3. Избегайте any

#### ❌ Плохо:

```typescript
let data: any = fetchData();
```

#### ✅ Лучше:

```typescript
interface ApiData {
    id: number;
    name: string;
}
let data: ApiData = fetchData();

// Или используйте unknown для неизвестных данных
let data: unknown = fetchData();
```

### ✅ Чеклист

- [ ] Включите strict режим в tsconfig.json
- [ ] Используйте интерфейсы для объектов
- [ ] Применяйте union типы для ограниченного набора значений
- [ ] Не указывайте типы там, где TS может их вывести
- [ ] Избегайте any - используйте unknown или конкретные типы
- [ ] Используйте readonly для неизменяемых свойств
- [ ] Применяйте опциональные свойства (?:) где нужно

> 💡 **TypeScript** - это инструмент для повышения качества кода.

---

## 📚 Дополнительные ресурсы

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [TypeScript Playground](https://www.typescriptlang.org/play)
- [Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html)
- [tsconfig.json Reference](https://www.typescriptlang.org/tsconfig)
# TypeScript - Практическая шпаргалка

## 🚀 Быстрый старт

### Установка TypeScript

```bash

# В проекте
npm install --save-dev typescript

# Компиляция файла
tsc app.ts

# Инициализация tsconfig.json
tsc --init
```

---

## 📝 Основные типы

| Тип | Синтаксис | Пример |
|-----|-----------|--------|
| **string** | `let name: string` | `let name: string = "Анна"` |
| **number** | `let age: number` | `let age: number = 25` |
| **boolean** | `let active: boolean` | `let active: boolean = true` |
| **array** | `let items: type[]` | `let numbers: number[] = [1, 2, 3]` |
| **object** | `let user: {prop: type}` | `let user: {name: string, age: number}` |
| **union** | `let id: string \| number` | `let id: string \| number = "abc123"` |
| **literal** | `let status: "ok" \| "error"` | `let status: "ok" \| "error" = "ok"` |

---

## 🔧 Интерфейсы

### Базовый синтаксис

```typescript
interface User {
    name: string;           // обязательное
    age: number;            // обязательное
    email?: string;         // опциональное
    readonly id: number;    // только для чтения
}

// Использование
const user: User = {
    name: "Анна",
    age: 25,
    id: 1
};
```

### Расширение интерфейсов

```typescript
interface BaseUser {
    name: string;
    age: number;
}

interface AdminUser extends BaseUser {
    permissions: string[];
    isAdmin: true;
}
```

### Функциональные интерфейсы

```typescript
interface Calculator {
    (a: number, b: number): number;
}

const add: Calculator = (a, b) => a + b;
```

---

## 🎯 Функции

### Типизация функций

```typescript
// Явная типизация
function greet(name: string): string {
    return `Hello, ${name}!`;
}

// Стрелочные функции
const multiply = (a: number, b: number): number => a * b;

// Опциональные параметры
function log(message: string, level?: string): void {
    console.log(`[${level || 'INFO'}] ${message}`);
}

// Параметры по умолчанию
function createUser(name: string, age: number = 18): User {
    return { name, age };
}

// Rest параметры
function sum(...numbers: number[]): number {
    return numbers.reduce((a, b) => a + b, 0);
}
```

---

## 🔀 Union и Intersection

### Union типы (|)

```typescript
// Либо string, либо number
let id: string | number;
id = "abc123";  // ✅
id = 12345;     // ✅

// Type narrowing
function formatId(id: string | number): string {
    if (typeof id === "string") {
        return id.toUpperCase();
    }
    return id.toString();
}

// Literal union
type Theme = "light" | "dark" | "auto";
type Status = "loading" | "success" | "error";
```

### Intersection типы (&)

```typescript
type PersonalInfo = {
    name: string;
    age: number;
};

type ContactInfo = {
    email: string;
    phone: string;
};

// Должны быть ВСЕ свойства
type User = PersonalInfo & ContactInfo;

const user: User = {
    name: "Анна",
    age: 25,
    email: "anna@email.com",
    phone: "+7-123-456-78-90"
};
```

---

## 🎭 Generics

### Базовый синтаксис

```typescript
// Функция с generic
function identity<T>(arg: T): T {
    return arg;
}

const stringResult = identity<string>("hello");  // string
const numberResult = identity<number>(42);       // number
const autoResult = identity("hello");           // type inference

// Generic интерфейс
interface ApiResponse<T> {
    data: T;
    success: boolean;
    message?: string;
}

// Использование
const userResponse: ApiResponse<User> = {
    data: { name: "Анна", age: 25 },
    success: true
};

const usersResponse: ApiResponse<User[]> = {
    data: [
        { name: "Анна", age: 25 },
        { name: "Петр", age: 30 }
    ],
    success: true
};
```

### Generic с ограничениями

```typescript
// T должен иметь свойство length
function logLength<T extends { length: number }>(item: T): T {
    console.log(`Length: ${item.length}`);
    return item;
}

logLength("hello");     // ✅ string
logLength([1, 2, 3]);   // ✅ array
logLength(42);          // ❌ error

// Keyof ограничение
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
    return obj[key];
}

const user = { name: "Anna", age: 25 };
const name = getProperty(user, "name");  // string
const age = getProperty(user, "age");    // number
```

---

## 🛠 Утилитарные типы

| Утилита | Описание | Пример |
|---------|----------|--------|
| `Partial<T>` | Все свойства опциональные | `Partial<User>` |
| `Required<T>` | Все свойства обязательные | `Required<User>` |
| `Readonly<T>` | Все свойства readonly | `Readonly<User>` |
| `Pick<T, K>` | Выбрать только указанные свойства | `Pick<User, "name" \| "age">` |
| `Omit<T, K>` | Исключить указанные свойства | `Omit<User, "password">` |
| `Record<K, T>` | Объект с ключами K и значениями T | `Record<string, number>` |

### Примеры использования

```typescript
interface User {
    id: number;
    name: string;
    email: string;
    password: string;
}

// Все свойства опциональные
type PartialUser = Partial<User>;
// { id?: number; name?: string; email?: string; password?: string; }

// Только нужные свойства
type PublicUser = Pick<User, "id" | "name" | "email">;
// { id: number; name: string; email: string; }

// Исключить password
type SafeUser = Omit<User, "password">;
// { id: number; name: string; email: string; }

// Словарь пользователей
type UserMap = Record<string, User>;
// { [key: string]: User }
```

---

## ⚙️ tsconfig.json - Основные опции

```json
{
  "compilerOptions": {
    // Основные
    "target": "ES2020",                    // Версия JS на выходе
    "module": "ESNext",                    // Система модулей
    "lib": ["ES2020", "DOM"],             // Доступные библиотеки
    
    // Строгость
    "strict": true,                        // Все строгие проверки
    "noImplicitAny": true,                // Запретить неявный any
    "strictNullChecks": true,             // Проверки null/undefined
    "noImplicitReturns": true,            // Все пути должны return
    
    // Модули
    "moduleResolution": "node",            // Как искать модули
    "esModuleInterop": true,              // Совместимость ES6/CommonJS
    "allowSyntheticDefaultImports": true, // Синтетические импорты
    
    // Вывод
    "outDir": "./dist",                   // Папка для скомпилированных файлов
    "rootDir": "./src",                   // Корневая папка исходников
    "declaration": true,                  // Генерировать .d.ts файлы
    "sourceMap": true,                    // Генерировать source maps
    
    // React (если нужно)
    "jsx": "react-jsx"                    // Поддержка JSX
  },
  "include": ["src/**/*"],                // Какие файлы компилировать
  "exclude": ["node_modules", "dist"]     // Какие исключить
}
```

---

## 🚨 Type Guards

### typeof guards

```typescript
function processValue(value: string | number) {
    if (typeof value === "string") {
        return value.toUpperCase(); // TypeScript знает что это string
    }
    return value.toFixed(2);       // TypeScript знает что это number
}
```

### instanceof guards

```typescript
class Dog {
    bark() { console.log("Woof!"); }
}

class Cat {
    meow() { console.log("Meow!"); }
}

function makeSound(animal: Dog | Cat) {
    if (animal instanceof Dog) {
        animal.bark(); // TypeScript знает что это Dog
    } else {
        animal.meow(); // TypeScript знает что это Cat
    }
}
```

### Custom type guards

```typescript
interface User {
    name: string;
    email: string;
}

interface Admin {
    name: string;
    permissions: string[];
}

// Custom type guard
function isAdmin(user: User | Admin): user is Admin {
    return 'permissions' in user;
}

function handleUser(user: User | Admin) {
    if (isAdmin(user)) {
        console.log(user.permissions); // TypeScript знает что это Admin
    } else {
        console.log(user.email);       // TypeScript знает что это User
    }
}
```

---

## 🎨 Enum

```typescript
// Числовой enum
enum Status {
    Pending = 0,
    Approved = 1,
    Rejected = 2
}

// Строковый enum (предпочтительно)
enum Color {
    Red = "red",
    Green = "green",
    Blue = "blue"
}

// Использование
const userStatus: Status = Status.Pending;
const themeColor: Color = Color.Red;

// Const enum (оптимизация)
const enum Direction {
    Up = "UP",
    Down = "DOWN",
    Left = "LEFT",
    Right = "RIGHT"
}
```

---

## 💡 Практические советы

### ✅ Хорошие практики

```typescript
// 1. Используйте type inference
const message = "Hello"; // лучше чем: const message: string = "Hello"

// 2. Предпочитайте interface для объектов
interface User {
    name: string;
    age: number;
}

// 3. Используйте readonly для неизменяемых данных
interface Config {
    readonly apiUrl: string;
    readonly timeout: number;
}

// 4. Строковые литералы вместо enum для простых случаев
type Theme = "light" | "dark";

// 5. Используйте unknown вместо any для неизвестных типов
function processApiData(data: unknown) {
    if (typeof data === 'object' && data !== null) {
        // безопасная обработка
    }
}
```

### ❌ Избегайте

```typescript
// 1. Избегайте any
let data: any = fetchData(); // ❌

// 2. Не дублируйте типы
interface User { name: string; }
interface UserData { name: string; } // ❌ дублирование

// 3. Не переопределяйте встроенные типы
interface String { // ❌ плохая идея
    customMethod(): void;
}
```

---

## 🔍 Отладка типов

```typescript
// Посмотреть тип переменной
type UserType = typeof user; // тип переменной user

// Получить тип возвращаемого значения функции
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : any;

// Получить типы параметров функции
type Parameters<T> = T extends (...args: infer P) => any ? P : never;

// Проверить тип в IDE
const user = { name: "Anna", age: 25 };
type UserKeys = keyof typeof user; // "name" | "age"
```

---

## 📚 Дополнительные ресурсы

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [TypeScript Playground](https://www.typescriptlang.org/play)
- [Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html)
- [tsconfig.json Reference](https://www.typescriptlang.org/tsconfig)
Хорошо, делаем **отдельно и только LR1**, без всего лишнего. Ниже — **подробная теория по LR1**, объяснённая максимально простым языком, так чтобы понял **девятиклассник**, но при этом это **полноценный материал для теста**.

---

# **LR1. Основы TypeScript (объяснение «на пальцах»)**

## 1. Что такое TypeScript

**TypeScript — это JavaScript с правилами.**

Обычный JavaScript:

* позволяет писать как угодно;
* ошибки часто всплывают только когда программа уже запущена.

TypeScript:

* заставляет указывать, **какие данные где используются**;
* проверяет код **до запуска**;
* не даёт сделать очевидные глупости.

👉 TypeScript **не заменяет** JavaScript.
Он **превращается в JavaScript** перед запуском.

Можно представить так:
**TypeScript — это черновик с проверкой учителя, JavaScript — чистовик.**

---

## 2. Зачем вообще нужен TypeScript

Пример на JavaScript:

```js
let age = 18;
age = "восемнадцать";
```

Компьютеру всё равно.
А человеку — нет: программа может сломаться.

То же самое на TypeScript:

```ts
let age: number = 18;
age = "восемнадцать"; // ошибка
```

Ошибка видна **сразу в редакторе**, ещё до запуска.

TypeScript нужен чтобы:

* ловить ошибки заранее;
* понимать код даже через полгода;
* не бояться менять код;
* работать в больших проектах.

---

## 3. Типы данных — что это вообще такое

**Тип** — это ответ на вопрос:
👉 *«Что здесь хранится?»*

### Основные типы

| Тип         | Что означает       |
| ----------- | ------------------ |
| `string`    | текст              |
| `number`    | число              |
| `boolean`   | true / false       |
| `null`      | пусто специально   |
| `undefined` | значение не задано |

Пример:

```ts
let name: string = "Alex";
let age: number = 18;
let isOnline: boolean = true;
```

Теперь:

* `name` — только текст
* `age` — только число

---

## 4. Type inference — TypeScript умеет думать сам

TypeScript **часто сам понимает тип**:

```ts
let city = "Moscow";
```

Он запомнит: `city` — это `string`.

После этого:

```ts
city = 123; // ошибка
```

👉 Поэтому **не нужно всегда писать тип вручную**.
Если тип очевиден — TypeScript справится сам.

---

## 5. Тип `any` — почему с ним осторожно

```ts
let value: any = 10;
value = "текст";
value = false;
```

`any` означает:

> «TypeScript, не проверяй вообще ничего».

Это почти обычный JavaScript.

Используют `any`:

* когда данных ещё нет;
* при временных заглушках.

В учебных работах: **лучше избегать**.

---

## 6. Массивы (списки значений)

Массив чисел:

```ts
let scores: number[] = [10, 20, 30];
```

Массив строк:

```ts
let names: string[] = ["Anna", "Ivan"];
```

Альтернативная запись:

```ts
Array<number>
```

Но чаще используют `number[]`.

---

## 7. Объекты — данные с полями

Объект — это как анкета с полями.

```ts
let user: {
  id: number;
  name: string;
  age: number;
} = {
  id: 1,
  name: "Alex",
  age: 18
};
```

TypeScript проверяет:

* все поля есть;
* типы совпадают.

---

## 8. Необязательные и неизменяемые поля

### Необязательное поле (`?`)

```ts
age?: number;
```

Означает: поле может быть, а может не быть.

```ts
{ name: "Alex" }
{ name: "Alex", age: 18 }
```

Оба варианта допустимы.

---

### Неизменяемое поле (`readonly`)

```ts
readonly id: number;
```

После создания объекта:

```ts
user.id = 5; // ошибка
```

Используется для:

* идентификаторов;
* данных, которые нельзя менять.

---

## 9. `type` и `interface`

Оба нужны, чтобы **задавать форму объекта**.

### `type`

```ts
type User = {
  id: number;
  name: string;
};
```

### `interface`

```ts
interface User {
  id: number;
  name: string;
}
```

Проще запомнить так:

* `interface` — чаще для объектов;
* `type` — более универсален.

В лабораторных допустимы оба.

---

## 10. Union-типы — «ИЛИ»

```ts
let id: number | string;
```

Означает:

* либо число;
* либо строка.

Частый пример:

```ts
type Status = "loading" | "success" | "error";
```

Теперь нельзя написать что-то другое.

---

## 11. Intersection-типы — «И»

```ts
type A = { a: number };
type B = { b: string };

type C = A & B;
```

Тип `C` должен иметь:

* `a`
* и `b` одновременно.

---

## 12. Функции и типы

### Типы параметров и результата

```ts
function sum(a: number, b: number): number {
  return a + b;
}
```

Если функция **ничего не возвращает**:

```ts
function log(text: string): void {
  console.log(text);
}
```

`void` — значит «нет результата».

---

## 13. Generics — универсальные функции

Generics позволяют писать код **без привязки к одному типу**.

```ts
function first<T>(arr: T[]): T {
  return arr[0];
}
```

TypeScript сам подставит нужный тип:

* массив чисел → `T = number`
* массив строк → `T = string`

---

## 14. Ограничения Generics

```ts
function getLength<T extends { length: number }>(value: T) {
  return value.length;
}
```

Означает:

* тип `T` обязан иметь `length`.

Работает с:

* строками;
* массивами;
* объектами с `length`.

---

## 15. tsconfig.json — правила проекта

`tsconfig.json` — файл с настройками TypeScript.

Что там задаётся:

* насколько строгая проверка;
* в какой JavaScript компилировать;
* как работать с модулями.

Если включён строгий режим — TypeScript проверяет всё максимально жёстко.

---

## 16. Итог LR1 (что должно остаться в голове)

После LR1 студент должен понимать:

* что такое типы;
* зачем нужен TypeScript;
* как типизировать переменные, функции и объекты;
* почему ошибки лучше ловить заранее.

---

Если хочешь, дальше можем:

* разобрать **типичные задания и ошибки из LR1**;
* сделать **короткую шпаргалку к тесту**;
* или перейти к **LR2 в таком же стиле**.











# Полное руководство: React + TypeScript

## Содержание
1. [Введение](#введение)
2. [Настройка проекта](#настройка-проекта)
3. [Типизация компонентов](#типизация-компонентов)
4. [Работа с хуками](#работа-с-хуками)
5. [Event Handlers](#event-handlers)
6. [Формы и валидация](#формы-и-валидация)
7. [Продвинутые паттерны](#продвинутые-паттерны)
8. [Best Practices](#best-practices)

---

## Введение

TypeScript с React дает нам возможность создавать надежные, масштабируемые приложения с прекрасной поддержкой IDE и автокомплитом.

### Преимущества TypeScript в React:
- **Безопасность типов** - ошибки ловятся на этапе компиляции
- **Лучшая поддержка IDE** - автокомплит, рефакторинг, навигация
- **Документирование через типы** - типы служат живой документацией
- **Рефакторинг** - безопасные изменения кода

---

## Настройка проекта

### Создание нового проекта
```bash
# С помощью Vite
npm create vite@latest my-app -- --template react-ts
cd my-app
npm install
```

### Основные зависимости
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "typescript": "^5.0.0"
  }
}
```

### Конфигурация TypeScript (tsconfig.json)
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["DOM", "DOM.Iterable", "ES6"],
    "allowJs": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noFallthroughCasesInSwitch": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx"
  },
  "include": [
    "src"
  ]
}
```

---

## Типизация компонентов

### Функциональные компоненты

#### Простой компонент без props
```typescript
import React from 'react';

// Способ 1: Простая функция
function Welcome() {
  return <h1>Добро пожаловать!</h1>;
}

// Способ 2: С явным указанием типа
const Welcome: React.FC = () => {
  return <h1>Добро пожаловать!</h1>;
};

export default Welcome;
```

#### Компонент с props
```typescript
import React from 'react';

// Определение интерфейса для props
interface UserCardProps {
  name: string;
  email: string;
  age?: number; // опциональное свойство
  avatar?: string;
  isOnline: boolean;
}

// Рекомендуемый способ
function UserCard({ name, email, age, avatar, isOnline }: UserCardProps) {
  return (
    <div className={`user-card ${isOnline ? 'online' : 'offline'}`}>
      {avatar && <img src={avatar} alt={`${name} avatar`} />}
      <h2>{name}</h2>
      <p>{email}</p>
      {age && <p>Возраст: {age}</p>}
      <span className="status">
        {isOnline ? '🟢 В сети' : '🔴 Не в сети'}
      </span>
    </div>
  );
}

// Альтернативный способ с React.FC
const UserCardFC: React.FC<UserCardProps> = ({
  name,
  email,
  age,
  avatar,
  isOnline
}) => {
  // тот же JSX...
};

export default UserCard;
```

### Типизация Children

#### ReactNode vs ReactElement

**ReactNode** - самый широкий тип для children:
```typescript
type ReactNode =
  | ReactElement
  | string
  | number
  | boolean
  | null
  | undefined
  | ReactNode[]
```

**ReactElement** - только JSX элементы:
```typescript
type ReactElement = {
  type: string | ComponentType;
  props: any;
  key: string | number | null;
}
```

**Когда использовать:**

- `ReactNode` - для обычных children (принимает текст, числа, элементы)
- `ReactElement` - когда нужны только JSX элементы (не текст/числа)

```typescript
// ReactNode - принимает всё
interface CardProps {
  children: React.ReactNode; // ✅ "text", 123, <div/>, null
}

// ReactElement - только JSX элементы
interface WrapperProps {
  children: React.ReactElement; // ✅ <div/>, но ✗ "text", 123
}

// Массив элементов
interface TabsProps {
  children: React.ReactElement[]; // только массив JSX элементов
}

// Конкретный тип элемента
interface ModalProps {
  children: React.ReactElement<ButtonProps>; // только Button компоненты
}
```

#### ReactNode для обычных children
```typescript
import React from 'react';

interface CardProps {
  title: string;
  children: React.ReactNode; // принимает любой валидный JSX
  variant?: 'default' | 'outlined' | 'filled';
}

function Card({ title, children, variant = 'default' }: CardProps) {
  return (
    <div className={`card card--${variant}`}>
      <h3 className="card__title">{title}</h3>
      <div className="card__content">
        {children}
      </div>
    </div>
  );
}

// Использование
function App() {
  return (
    <Card title="Мой профиль" variant="outlined">
      <p>Содержимое карточки</p>
      <UserCard name="John" email="john@example.com" isOnline={true} />
    </Card>
  );
}
```

#### Render Props паттерн
```typescript
interface DataFetcherProps<T> {
  url: string;
  children: (data: T | null, loading: boolean, error: string | null) => React.ReactNode;
}

function DataFetcher<T>({ url, children }: DataFetcherProps<T>) {
  const [data, setData] = React.useState<T | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    fetch(url)
      .then(response => response.json())
      .then((data: T) => {
        setData(data);
        setLoading(false);
      })
      .catch((err: Error) => {
        setError(err.message);
        setLoading(false);
      });
  }, [url]);

  return <>{children(data, loading, error)}</>;
}

// Использование
interface User {
  id: number;
  name: string;
  email: string;
}

function UserProfile({ userId }: { userId: number }) {
  return (
    <DataFetcher<User> url={`/api/users/${userId}`}>
      {(user, loading, error) => {
        if (loading) return <div>Загрузка...</div>;
        if (error) return <div>Ошибка: {error}</div>;
        if (!user) return <div>Пользователь не найден</div>;

        return <UserCard {...user} isOnline={false} />;
      }}
    </DataFetcher>
  );
}
```

---

## Работа с хуками

### useState

#### Примитивные типы
```typescript
import React, { useState } from 'react';

function Counter() {
  // TypeScript автоматически выводит тип
  const [count, setCount] = useState(0); // number
  const [name, setName] = useState(''); // string
  const [isVisible, setVisible] = useState(false); // boolean

  return (
    <div>
      <p>Счетчик: {count}</p>
      <button onClick={() => setCount(count + 1)}>+1</button>
      <button onClick={() => setCount(prev => prev - 1)}>-1</button>
    </div>
  );
}
```

#### Сложные типы
```typescript
interface User {
  id: string;
  name: string;
  email: string;
}

interface AppState {
  currentUser: User | null;
  users: User[];
  loading: boolean;
  error: string | null;
}

function App() {
  // Явное указание типа для сложных объектов
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);

  // Инициализация с начальным значением
  const [state, setState] = useState<AppState>({
    currentUser: null,
    users: [],
    loading: false,
    error: null
  });

  // Функциональные обновления с типизацией
  const addUser = (newUser: User) => {
    setUsers(prevUsers => [...prevUsers, newUser]);
  };

  const updateCurrentUser = (updates: Partial<User>) => {
    setUser(prevUser =>
      prevUser ? { ...prevUser, ...updates } : null
    );
  };

  // Обновление сложного состояния
  const setLoading = (loading: boolean) => {
    setState(prev => ({ ...prev, loading }));
  };

  // JSX...
}
```

### useEffect

```typescript
import React, { useState, useEffect } from 'react';

interface Post {
  id: number;
  title: string;
  body: string;
  userId: number;
}

function PostsList() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Эффект с async/await
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/posts');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: Post[] = await response.json();
        setPosts(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []); // пустой массив зависимостей

  // Эффект с зависимостями
  useEffect(() => {
    if (posts.length > 0) {
      document.title = `Постов: ${posts.length}`;
    }

    // Cleanup функция
    return () => {
      document.title = 'React App';
    };
  }, [posts.length]);

  if (loading) return <div>Загрузка...</div>;
  if (error) return <div>Ошибка: {error}</div>;

  return (
    <ul>
      {posts.map(post => (
        <li key={post.id}>
          <h3>{post.title}</h3>
          <p>{post.body}</p>
        </li>
      ))}
    </ul>
  );
}
```

### useReducer

```typescript
import React, { useReducer } from 'react';

// Определение типов состояния и действий
interface TodoState {
  todos: Todo[];
  filter: 'all' | 'completed' | 'active';
  loading: boolean;
}

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Date;
}

// Union тип для всех возможных действий
type TodoAction =
  | { type: 'ADD_TODO'; payload: { text: string } }
  | { type: 'TOGGLE_TODO'; payload: { id: string } }
  | { type: 'DELETE_TODO'; payload: { id: string } }
  | { type: 'SET_FILTER'; payload: { filter: 'all' | 'completed' | 'active' } }
  | { type: 'SET_LOADING'; payload: { loading: boolean } }
  | { type: 'CLEAR_COMPLETED' };

// Reducer функция с типизацией
function todoReducer(state: TodoState, action: TodoAction): TodoState {
  switch (action.type) {
    case 'ADD_TODO':
      const newTodo: Todo = {
        id: Date.now().toString(),
        text: action.payload.text,
        completed: false,
        createdAt: new Date()
      };
      return {
        ...state,
        todos: [...state.todos, newTodo]
      };

    case 'TOGGLE_TODO':
      return {
        ...state,
        todos: state.todos.map(todo =>
          todo.id === action.payload.id
            ? { ...todo, completed: !todo.completed }
            : todo
        )
      };

    case 'DELETE_TODO':
      return {
        ...state,
        todos: state.todos.filter(todo => todo.id !== action.payload.id)
      };

    case 'SET_FILTER':
      return {
        ...state,
        filter: action.payload.filter
      };

    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload.loading
      };

    case 'CLEAR_COMPLETED':
      return {
        ...state,
        todos: state.todos.filter(todo => !todo.completed)
      };

    default:
      return state;
  }
}

// Компонент с useReducer
function TodoApp() {
  const [state, dispatch] = useReducer(todoReducer, {
    todos: [],
    filter: 'all',
    loading: false
  });

  const addTodo = (text: string) => {
    dispatch({ type: 'ADD_TODO', payload: { text } });
  };

  const toggleTodo = (id: string) => {
    dispatch({ type: 'TOGGLE_TODO', payload: { id } });
  };

  // Фильтрация todos
  const filteredTodos = state.todos.filter(todo => {
    switch (state.filter) {
      case 'completed':
        return todo.completed;
      case 'active':
        return !todo.completed;
      default:
        return true;
    }
  });

  return (
    <div>
      <h1>Todo приложение</h1>
      {/* JSX для UI */}
    </div>
  );
}
```

### useRef

```typescript
import React, { useRef, useEffect } from 'react';

function FocusInput() {
  // Ref для DOM элементов
  const inputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // Ref для хранения значений
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const renderCountRef = useRef(0);

  // Увеличиваем счетчик рендеров
  renderCountRef.current += 1;

  useEffect(() => {
    // Фокус на input при монтировании
    inputRef.current?.focus();

    // Создаем интервал
    intervalRef.current = setInterval(() => {
      console.log('Tick');
    }, 1000);

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const handleFocus = () => {
    inputRef.current?.focus();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(formRef.current!);
    console.log('Form data:', Object.fromEntries(formData));
  };

  return (
    <div>
      <p>Рендеров: {renderCountRef.current}</p>
      <form ref={formRef} onSubmit={handleSubmit}>
        <input
          ref={inputRef}
          name="text"
          type="text"
          placeholder="Введите текст"
        />
        <button type="button" onClick={handleFocus}>
          Фокус на input
        </button>
        <button type="submit">Отправить</button>
      </form>
    </div>
  );
}
```

### useContext

```typescript
import React, { createContext, useContext, useState, ReactNode } from 'react';

// Типизация контекста
interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  colors: {
    primary: string;
    background: string;
    text: string;
  };
}

// Создание контекста с undefined как значение по умолчанию
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Кастомный хук для использования контекста
function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme должен использоваться внутри ThemeProvider');
  }
  return context;
}

// Props для провайдера
interface ThemeProviderProps {
  children: ReactNode;
}

// Провайдер контекста
function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const colors = {
    primary: theme === 'light' ? '#007bff' : '#0056b3',
    background: theme === 'light' ? '#ffffff' : '#1a1a1a',
    text: theme === 'light' ? '#333333' : '#ffffff'
  };

  const value: ThemeContextType = {
    theme,
    toggleTheme,
    colors
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

// Компонент, использующий контекст
function ThemedButton() {
  const { theme, toggleTheme, colors } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      style={{
        backgroundColor: colors.primary,
        color: colors.background,
        border: 'none',
        padding: '10px 20px',
        borderRadius: '5px',
        cursor: 'pointer'
      }}
    >
      Текущая тема: {theme}
    </button>
  );
}

// Главный компонент
function App() {
  return (
    <ThemeProvider>
      <div>
        <h1>Тематическое приложение</h1>
        <ThemedButton />
      </div>
    </ThemeProvider>
  );
}
```

---

## Event Handlers

### Основные типы событий

```typescript
import React from 'react';

function EventHandlers() {
  // Click события
  const handleButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    console.log('Button clicked:', e.currentTarget.textContent);
    e.preventDefault();
  };

  const handleDivClick = (e: React.MouseEvent<HTMLDivElement>) => {
    console.log('Div clicked at:', e.clientX, e.clientY);
  };

  // Input события
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('Input value:', e.target.value);
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    console.log('Textarea value:', e.target.value);
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    console.log('Selected value:', e.target.value);
  };

  // Form события
  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('Form submitted');

    // Работа с FormData
    const formData = new FormData(e.currentTarget);
    const values = Object.fromEntries(formData.entries());
    console.log('Form values:', values);
  };

  // Keyboard события
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      console.log('Enter pressed');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    console.log('Key down:', e.key, e.code);

    // Проверка модификаторов
    if (e.ctrlKey && e.key === 's') {
      e.preventDefault();
      console.log('Ctrl+S pressed');
    }
  };

  // Mouse события
  const handleMouseEnter = (e: React.MouseEvent) => {
    console.log('Mouse entered');
  };

  const handleMouseLeave = (e: React.MouseEvent) => {
    console.log('Mouse left');
  };

  // Focus события
  const handleInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    console.log('Input focused');
    e.target.select(); // Выделить весь текст
  };

  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    console.log('Input blurred, value:', e.target.value);
  };

  return (
    <div>
      <h2>Event Handlers Examples</h2>

      <form onSubmit={handleFormSubmit}>
        <input
          name="username"
          type="text"
          placeholder="Username"
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          onKeyPress={handleKeyPress}
          onKeyDown={handleKeyDown}
        />

        <textarea
          name="message"
          placeholder="Message"
          onChange={handleTextareaChange}
        />

        <select name="category" onChange={handleSelectChange}>
          <option value="">Выберите категорию</option>
          <option value="tech">Технологии</option>
          <option value="design">Дизайн</option>
          <option value="business">Бизнес</option>
        </select>

        <button type="submit" onClick={handleButtonClick}>
          Отправить
        </button>
      </form>

      <div
        onClick={handleDivClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          padding: '20px',
          border: '1px solid #ccc',
          marginTop: '20px',
          cursor: 'pointer'
        }}
      >
        Кликните по мне!
      </div>
    </div>
  );
}
```

### Передача параметров в обработчики

```typescript
interface Item {
  id: string;
  name: string;
  category: string;
}

function ItemsList() {
  const [items, setItems] = React.useState<Item[]>([
    { id: '1', name: 'Товар 1', category: 'tech' },
    { id: '2', name: 'Товар 2', category: 'design' }
  ]);

  // Способ 1: Через arrow function
  const handleDeleteClick1 = (itemId: string) => {
    setItems(prev => prev.filter(item => item.id !== itemId));
  };

  // Способ 2: Currying
  const handleDeleteClick2 = (itemId: string) =>
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation(); // Предотвратить всплытие
      setItems(prev => prev.filter(item => item.id !== itemId));
    };

  // Способ 3: Через data-атрибуты
  const handleDeleteClick3 = (e: React.MouseEvent<HTMLButtonElement>) => {
    const itemId = e.currentTarget.dataset.itemId;
    if (itemId) {
      setItems(prev => prev.filter(item => item.id !== itemId));
    }
  };

  const handleItemClick = (item: Item) =>
    (e: React.MouseEvent<HTMLDivElement>) => {
      console.log('Item clicked:', item.name);
    };

  return (
    <div>
      {items.map(item => (
        <div
          key={item.id}
          onClick={handleItemClick(item)}
          style={{
            padding: '10px',
            border: '1px solid #ccc',
            margin: '5px',
            cursor: 'pointer'
          }}
        >
          <h3>{item.name}</h3>
          <p>{item.category}</p>

          {/* Способ 1 */}
          <button onClick={() => handleDeleteClick1(item.id)}>
            Удалить (1)
          </button>

          {/* Способ 2 */}
          <button onClick={handleDeleteClick2(item.id)}>
            Удалить (2)
          </button>

          {/* Способ 3 */}
          <button
            data-item-id={item.id}
            onClick={handleDeleteClick3}
          >
            Удалить (3)
          </button>
        </div>
      ))}
    </div>
  );
}
```

---

## Формы и валидация

### Контролируемые компоненты

```typescript
import React, { useState } from 'react';

interface FormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  age: number;
  country: string;
  newsletter: boolean;
  gender: 'male' | 'female' | 'other';
}

interface FormErrors {
  username?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  age?: string;
}

function ControlledForm() {
  const [formData, setFormData] = useState<FormData>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    age: 0,
    country: '',
    newsletter: false,
    gender: 'other'
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Валидация
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Имя пользователя обязательно';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Минимум 3 символа';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email обязателен';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Некорректный email';
    }

    if (!formData.password) {
      newErrors.password = 'Пароль обязателен';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Минимум 8 символов';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Пароли не совпадают';
    }

    if (formData.age < 18) {
      newErrors.age = 'Минимальный возраст 18 лет';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Обработчики изменений
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked :
               type === 'number' ? Number(value) : value
    }));

    // Очистить ошибку для поля
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      gender: e.target.value as 'male' | 'female' | 'other'
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Имитация API запроса
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('Form submitted:', formData);

      // Сброс формы
      setFormData({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        age: 0,
        country: '',
        newsletter: false,
        gender: 'other'
      });

      alert('Форма успешно отправлена!');
    } catch (error) {
      console.error('Ошибка отправки:', error);
      alert('Ошибка при отправке формы');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Регистрация</h2>

      {/* Text Input */}
      <div>
        <label htmlFor="username">Имя пользователя:</label>
        <input
          type="text"
          id="username"
          name="username"
          value={formData.username}
          onChange={handleInputChange}
          disabled={isSubmitting}
        />
        {errors.username && <span style={{color: 'red'}}>{errors.username}</span>}
      </div>

      {/* Email Input */}
      <div>
        <label htmlFor="email">Email:</label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          disabled={isSubmitting}
        />
        {errors.email && <span style={{color: 'red'}}>{errors.email}</span>}
      </div>

      {/* Password Input */}
      <div>
        <label htmlFor="password">Пароль:</label>
        <input
          type="password"
          id="password"
          name="password"
          value={formData.password}
          onChange={handleInputChange}
          disabled={isSubmitting}
        />
        {errors.password && <span style={{color: 'red'}}>{errors.password}</span>}
      </div>

      {/* Confirm Password */}
      <div>
        <label htmlFor="confirmPassword">Подтвердите пароль:</label>
        <input
          type="password"
          id="confirmPassword"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleInputChange}
          disabled={isSubmitting}
        />
        {errors.confirmPassword && <span style={{color: 'red'}}>{errors.confirmPassword}</span>}
      </div>

      {/* Number Input */}
      <div>
        <label htmlFor="age">Возраст:</label>
        <input
          type="number"
          id="age"
          name="age"
          value={formData.age}
          onChange={handleInputChange}
          disabled={isSubmitting}
          min="0"
          max="120"
        />
        {errors.age && <span style={{color: 'red'}}>{errors.age}</span>}
      </div>

      {/* Select */}
      <div>
        <label htmlFor="country">Страна:</label>
        <select
          id="country"
          name="country"
          value={formData.country}
          onChange={handleSelectChange}
          disabled={isSubmitting}
        >
          <option value="">Выберите страну</option>
          <option value="russia">Россия</option>
          <option value="ukraine">Украина</option>
          <option value="belarus">Беларусь</option>
          <option value="other">Другая</option>
        </select>
      </div>

      {/* Checkbox */}
      <div>
        <label>
          <input
            type="checkbox"
            name="newsletter"
            checked={formData.newsletter}
            onChange={handleInputChange}
            disabled={isSubmitting}
          />
          Подписаться на рассылку
        </label>
      </div>

      {/* Radio Buttons */}
      <div>
        <p>Пол:</p>
        <label>
          <input
            type="radio"
            name="gender"
            value="male"
            checked={formData.gender === 'male'}
            onChange={handleRadioChange}
            disabled={isSubmitting}
          />
          Мужской
        </label>
        <label>
          <input
            type="radio"
            name="gender"
            value="female"
            checked={formData.gender === 'female'}
            onChange={handleRadioChange}
            disabled={isSubmitting}
          />
          Женский
        </label>
        <label>
          <input
            type="radio"
            name="gender"
            value="other"
            checked={formData.gender === 'other'}
            onChange={handleRadioChange}
            disabled={isSubmitting}
          />
          Другой
        </label>
      </div>

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Отправка...' : 'Зарегистрироваться'}
      </button>
    </form>
  );
}
```

---

## Продвинутые паттерны

### Compound Components

Compound Components - это паттерн, при котором несколько компонентов работают вместе для создания единого интерфейса. Компоненты "знают" друг о друге и могут совместно использовать состояние.

```typescript
import React, { createContext, useContext, ReactNode } from 'react';

// Простой пример Card с compound components
interface CardProps {
  children: ReactNode;
  className?: string;
}

interface CardHeaderProps {
  children: ReactNode;
}

interface CardContentProps {
  children: ReactNode;
}

interface CardFooterProps {
  children: ReactNode;
}

// Основной компонент Card
function Card({ children, className }: CardProps) {
  return (
    <div className={`card ${className || ''}`}>
      {children}
    </div>
  );
}

// Подкомпоненты
const CardHeader = ({ children }: CardHeaderProps) => {
  return <div className="card-header">{children}</div>;
};

const CardContent = ({ children }: CardContentProps) => {
  return <div className="card-content">{children}</div>;
};

const CardFooter = ({ children }: CardFooterProps) => {
  return <div className="card-footer">{children}</div>;
};

// Присоединяем compound components к основному компоненту
Card.Header = CardHeader;
Card.Content = CardContent;
Card.Footer = CardFooter;

// Использование
function App() {
  return (
    <Card className="my-card">
      <Card.Header>
        <h2>Заголовок карточки</h2>
      </Card.Header>
      <Card.Content>
        <p>Содержимое карточки</p>
      </Card.Content>
      <Card.Footer>
        <button>Действие</button>
      </Card.Footer>
    </Card>
  );
}
```

#### Пример с совместным состоянием

Вот пример Accordion, где компоненты действительно делят состояние через Context:

```typescript
import React, { createContext, useContext, useState, ReactNode } from 'react';

// Контекст для состояния аккордеона
interface AccordionContextType {
  openItems: Set<string>;
  toggleItem: (id: string) => void;
}

const AccordionContext = createContext<AccordionContextType | null>(null);

// Хук для использования контекста
function useAccordion() {
  const context = useContext(AccordionContext);
  if (!context) {
    throw new Error('useAccordion должен использоваться внутри Accordion');
  }
  return context;
}

// Основной компонент Accordion
interface AccordionProps {
  children: ReactNode;
  allowMultiple?: boolean;
}

function Accordion({ children, allowMultiple = false }: AccordionProps) {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());

  const toggleItem = (id: string) => {
    setOpenItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        if (!allowMultiple) {
          newSet.clear();
        }
        newSet.add(id);
      }
      return newSet;
    });
  };

  return (
    <AccordionContext.Provider value={{ openItems, toggleItem }}>
      <div className="accordion">
        {children}
      </div>
    </AccordionContext.Provider>
  );
}

// Подкомпоненты, использующие общее состояние
interface AccordionItemProps {
  id: string;
  children: ReactNode;
}

const AccordionItem = ({ id, children }: AccordionItemProps) => {
  return <div className="accordion-item" data-id={id}>{children}</div>;
};

interface AccordionHeaderProps {
  id: string;
  children: ReactNode;
}

const AccordionHeader = ({ id, children }: AccordionHeaderProps) => {
  const { openItems, toggleItem } = useAccordion();
  const isOpen = openItems.has(id);

  return (
    <button
      className={`accordion-header ${isOpen ? 'open' : ''}`}
      onClick={() => toggleItem(id)}
    >
      {children}
      <span className="accordion-icon">{isOpen ? '−' : '+'}</span>
    </button>
  );
};

interface AccordionContentProps {
  id: string;
  children: ReactNode;
}

const AccordionContent = ({ id, children }: AccordionContentProps) => {
  const { openItems } = useAccordion();
  const isOpen = openItems.has(id);

  if (!isOpen) return null;

  return (
    <div className="accordion-content">
      {children}
    </div>
  );
};

// Присоединяем compound components
Accordion.Item = AccordionItem;
Accordion.Header = AccordionHeader;
Accordion.Content = AccordionContent;

// Использование
function App() {
  return (
    <Accordion allowMultiple={true}>
      <Accordion.Item id="item1">
        <Accordion.Header id="item1">Первый раздел</Accordion.Header>
        <Accordion.Content id="item1">
          <p>Содержимое первого раздела</p>
        </Accordion.Content>
      </Accordion.Item>

      <Accordion.Item id="item2">
        <Accordion.Header id="item2">Второй раздел</Accordion.Header>
        <Accordion.Content id="item2">
          <p>Содержимое второго раздела</p>
        </Accordion.Content>
      </Accordion.Item>
    </Accordion>
  );
}
```

### Generic компоненты

```typescript
import React from 'react';

// Generic Table компонент
interface Column<T> {
  key: keyof T;
  label: string;
  render?: (value: T[keyof T], item: T) => React.ReactNode;
}

interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T) => string | number;
  onRowClick?: (item: T) => void;
  loading?: boolean;
  emptyMessage?: string;
}

function Table<T>({
  data,
  columns,
  keyExtractor,
  onRowClick,
  loading = false,
  emptyMessage = 'Нет данных'
}: TableProps<T>) {
  if (loading) {
    return <div>Загрузка...</div>;
  }

  if (data.length === 0) {
    return <div>{emptyMessage}</div>;
  }

  return (
    <table>
      <thead>
        <tr>
          {columns.map(column => (
            <th key={String(column.key)}>{column.label}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map(item => (
          <tr
            key={keyExtractor(item)}
            onClick={() => onRowClick?.(item)}
            style={{ cursor: onRowClick ? 'pointer' : 'default' }}
          >
            {columns.map(column => (
              <td key={String(column.key)}>
                {column.render
                  ? column.render(item[column.key], item)
                  : String(item[column.key])
                }
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// Использование Generic Table
interface User {
  id: number;
  name: string;
  email: string;
  age: number;
  isActive: boolean;
}

function UsersTable() {
  const users: User[] = [
    { id: 1, name: 'John', email: 'john@example.com', age: 25, isActive: true },
    { id: 2, name: 'Jane', email: 'jane@example.com', age: 30, isActive: false }
  ];

  const columns: Column<User>[] = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Имя' },
    { key: 'email', label: 'Email' },
    {
      key: 'age',
      label: 'Возраст',
      render: (age) => `${age} лет`
    },
    {
      key: 'isActive',
      label: 'Статус',
      render: (isActive) => (
        <span style={{ color: isActive ? 'green' : 'red' }}>
          {isActive ? 'Активен' : 'Неактивен'}
        </span>
      )
    }
  ];

  const handleRowClick = (user: User) => {
    console.log('User clicked:', user.name);
  };

  return (
    <Table
      data={users}
      columns={columns}
      keyExtractor={user => user.id}
      onRowClick={handleRowClick}
    />
  );
}
```

### Higher-Order Components (HOC)

```typescript
import React from 'react';

// HOC для добавления логики загрузки
interface WithLoadingProps {
  isLoading?: boolean;
  loadingComponent?: React.ComponentType;
}

function withLoading<P extends object>(
  WrappedComponent: React.ComponentType<P>
) {
  const WithLoadingComponent = (props: P & WithLoadingProps) => {
    const { isLoading, loadingComponent: LoadingComponent, ...restProps } = props;

    if (isLoading) {
      return LoadingComponent ? <LoadingComponent /> : <div>Загрузка...</div>;
    }

    return <WrappedComponent {...(restProps as P)} />;
  };

  WithLoadingComponent.displayName = `withLoading(${WrappedComponent.displayName || WrappedComponent.name})`;

  return WithLoadingComponent;
}

// HOC для обработки ошибок
interface WithErrorHandlingProps {
  error?: string | null;
  onErrorRetry?: () => void;
}

function withErrorHandling<P extends object>(
  WrappedComponent: React.ComponentType<P>
) {
  const WithErrorHandlingComponent = (props: P & WithErrorHandlingProps) => {
    const { error, onErrorRetry, ...restProps } = props;

    if (error) {
      return (
        <div style={{ color: 'red', padding: '20px', border: '1px solid red' }}>
          <h3>Произошла ошибка:</h3>
          <p>{error}</p>
          {onErrorRetry && (
            <button onClick={onErrorRetry}>Повторить</button>
          )}
        </div>
      );
    }

    return <WrappedComponent {...(restProps as P)} />;
  };

  WithErrorHandlingComponent.displayName = `withErrorHandling(${WrappedComponent.displayName || WrappedComponent.name})`;

  return WithErrorHandlingComponent;
}

// Композиция HOC
const withLoadingAndErrorHandling = <P extends object>(
  WrappedComponent: React.ComponentType<P>
) => {
  return withLoading(withErrorHandling(WrappedComponent));
};

// Базовый компонент
interface UserListProps {
  users: User[];
}

const UserList: React.FC<UserListProps> = ({ users }) => (
  <ul>
    {users.map(user => (
      <li key={user.id}>{user.name} - {user.email}</li>
    ))}
  </ul>
);

// Компонент с HOC
const EnhancedUserList = withLoadingAndErrorHandling(UserList);

// Использование
function App() {
  const [users, setUsers] = React.useState<User[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);

    try {
      // Имитация API запроса
      await new Promise(resolve => setTimeout(resolve, 2000));
      setUsers([
        { id: 1, name: 'John', email: 'john@example.com', age: 25, isActive: true }
      ]);
    } catch (err) {
      setError('Ошибка загрузки пользователей');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div>
      <h1>Пользователи</h1>
      <EnhancedUserList
        users={users}
        isLoading={loading}
        error={error}
        onErrorRetry={fetchUsers}
      />
    </div>
  );
}
```

### Кастомные хуки

```typescript
import { useState, useEffect, useCallback, useRef } from 'react';

// Хук для работы с localStorage
function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  const removeValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue] as const;
}

// Хук для debounced значений
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Хук для предыдущего значения
function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();

  useEffect(() => {
    ref.current = value;
  });

  return ref.current;
}

// Хук для toggle состояния
function useToggle(initialValue: boolean = false) {
  const [value, setValue] = useState(initialValue);

  const toggle = useCallback(() => setValue(v => !v), []);
  const setTrue = useCallback(() => setValue(true), []);
  const setFalse = useCallback(() => setValue(false), []);

  return [value, toggle, setTrue, setFalse] as const;
}

// Хук для работы с API
interface UseApiOptions {
  immediate?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}

function useApi<T>(url: string, options: UseApiOptions = {}) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { immediate = true, onSuccess, onError } = options;

  const execute = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result: T = await response.json();
      setData(result);
      onSuccess?.(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [url, onSuccess, onError]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return { data, loading, error, execute, reset };
}

// Хук для intersection observer
function useIntersectionObserver(
  elementRef: React.RefObject<Element>,
  options: IntersectionObserverInit = {}
) {
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    }, options);

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [elementRef, options]);

  return isIntersecting;
}

// Примеры использования кастомных хуков
function CustomHooksExample() {
  // localStorage хук
  const [name, setName, removeName] = useLocalStorage('userName', '');

  // Toggle хук
  const [isVisible, toggleVisible, showElement, hideElement] = useToggle(false);

  // Debounce хук
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Previous value хук
  const previousSearchTerm = usePrevious(debouncedSearchTerm);

  // API хук
  const { data: users, loading, error, execute: refetchUsers } = useApi<User[]>(
    '/api/users',
    {
      onSuccess: (data) => console.log('Users loaded:', data.length),
      onError: (error) => console.error('Failed to load users:', error)
    }
  );

  // Intersection observer хук
  const elementRef = useRef<HTMLDivElement>(null);
  const isElementVisible = useIntersectionObserver(elementRef, {
    threshold: 0.5
  });

  useEffect(() => {
    if (debouncedSearchTerm && debouncedSearchTerm !== previousSearchTerm) {
      console.log('Searching for:', debouncedSearchTerm);
      // Выполнить поиск
    }
  }, [debouncedSearchTerm, previousSearchTerm]);

  return (
    <div>
      <h2>Кастомные хуки в действии</h2>

      {/* localStorage */}
      <div>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Введите имя"
        />
        <button onClick={removeName}>Очистить имя</button>
        <p>Сохраненное имя: {name}</p>
      </div>

      {/* Toggle */}
      <div>
        <button onClick={toggleVisible}>
          {isVisible ? 'Скрыть' : 'Показать'} элемент
        </button>
        <button onClick={showElement}>Показать</button>
        <button onClick={hideElement}>Скрыть</button>
        {isVisible && <p>Этот элемент видимый!</p>}
      </div>

      {/* Debounce search */}
      <div>
        <input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Поиск с задержкой"
        />
        <p>Поисковый запрос: {debouncedSearchTerm}</p>
        {previousSearchTerm && (
          <p>Предыдущий запрос: {previousSearchTerm}</p>
        )}
      </div>

      {/* API data */}
      <div>
        <button onClick={refetchUsers}>Обновить пользователей</button>
        {loading && <p>Загрузка...</p>}
        {error && <p style={{color: 'red'}}>Ошибка: {error}</p>}
        {users && <p>Пользователей загружено: {users.length}</p>}
      </div>

      {/* Intersection observer */}
      <div style={{ height: '1000px' }}>
        <p>Прокрутите вниз...</p>
      </div>
      <div
        ref={elementRef}
        style={{
          height: '200px',
          backgroundColor: isElementVisible ? 'lightgreen' : 'lightcoral',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {isElementVisible ? 'Элемент видим!' : 'Элемент не видим'}
      </div>
    </div>
  );
}
```

---

## Best Practices

### 1. Структура проекта
```
src/
├── components/           # Переиспользуемые компоненты
│   ├── ui/              # Базовые UI компоненты
│   │   ├── Button/
│   │   │   ├── Button.tsx
│   │   │   ├── Button.types.ts
│   │   │   └── index.ts
│   │   └── Input/
│   └── common/          # Общие компоненты
├── hooks/               # Кастомные хуки
├── types/               # Типы TypeScript
├── utils/               # Утилиты
├── pages/               # Страницы
└── contexts/            # React контексты
```

### 2. Именование типов и интерфейсов
```typescript
// ✅ Хорошо
interface UserProps {
  name: string;
  email: string;
}

interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}

type Theme = 'light' | 'dark';
type Status = 'loading' | 'success' | 'error';

// ❌ Плохо
interface IUser {  // Не используйте префикс I
  name: string;
}

interface userProps {  // Используйте PascalCase
  name: string;
}
```

### 3. Типизация props
```typescript
// ✅ Хорошо - отдельный интерфейс
interface ButtonProps {
  variant: 'primary' | 'secondary';
  size: 'small' | 'medium' | 'large';
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

function Button({ variant, size, disabled, onClick, children }: ButtonProps) {
  // ...
}

// ✅ Хорошо - наследование от HTML атрибутов
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

function Input({ label, error, ...inputProps }: InputProps) {
  // ...
}
```

### 4. Избегайте any
```typescript
// ❌ Плохо
function processData(data: any) {
  return data.someProperty;
}

// ✅ Хорошо
interface DataType {
  someProperty: string;
  anotherProperty: number;
}

function processData(data: DataType) {
  return data.someProperty;
}

// ✅ Хорошо - unknown для неизвестных данных
function processUnknownData(data: unknown) {
  if (typeof data === 'object' && data !== null && 'someProperty' in data) {
    return (data as DataType).someProperty;
  }
  throw new Error('Invalid data format');
}
```

### 5. Используйте union типы для состояний
```typescript
// ✅ Хорошо
type AsyncState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: string };

function useAsyncData<T>(fetcher: () => Promise<T>) {
  const [state, setState] = useState<AsyncState<T>>({ status: 'idle' });

  const execute = async () => {
    setState({ status: 'loading' });

    try {
      const data = await fetcher();
      setState({ status: 'success', data });
    } catch (error) {
      setState({
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  return { state, execute };
}
```

### 6. Константы и enums
```typescript
// ✅ Хорошо - const assertions
const THEME = {
  LIGHT: 'light',
  DARK: 'dark'
} as const;

type Theme = typeof THEME[keyof typeof THEME];

// ✅ Хорошо - string enums
enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  MODERATOR = 'moderator'
}

// ✅ Хорошо - union типы для небольших наборов
type ButtonSize = 'small' | 'medium' | 'large';
```

### 7. Обработка ошибок
```typescript
// ✅ Хорошо
class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function fetchUser(id: string): Promise<User> {
  try {
    const response = await fetch(`/api/users/${id}`);

    if (!response.ok) {
      throw new ApiError(
        `Failed to fetch user: ${response.statusText}`,
        response.status
      );
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(
      'Network error occurred',
      0,
      'NETWORK_ERROR'
    );
  }
}
```

### 8. Мемоизация и оптимизация
```typescript
import React, { memo, useMemo, useCallback } from 'react';

interface ExpensiveListProps {
  items: Item[];
  onItemClick: (item: Item) => void;
  filter: string;
}

// Мемоизация компонента
const ExpensiveList = memo<ExpensiveListProps>(({
  items,
  onItemClick,
  filter
}) => {
  // Мемоизация вычислений
  const filteredItems = useMemo(() => {
    return items.filter(item =>
      item.name.toLowerCase().includes(filter.toLowerCase())
    );
  }, [items, filter]);

  // Мемоизация функций
  const handleItemClick = useCallback((item: Item) => {
    onItemClick(item);
  }, [onItemClick]);

  return (
    <ul>
      {filteredItems.map(item => (
        <ExpensiveListItem
          key={item.id}
          item={item}
          onClick={handleItemClick}
        />
      ))}
    </ul>
  );
});

// Сравнение props для memo
const ExpensiveListItem = memo<{
  item: Item;
  onClick: (item: Item) => void;
}>(({ item, onClick }) => {
  return (
    <li onClick={() => onClick(item)}>
      {item.name}
    </li>
  );
}, (prevProps, nextProps) => {
  return prevProps.item.id === nextProps.item.id &&
         prevProps.item.name === nextProps.item.name;
});
```

---

## Заключение

React + TypeScript предоставляет мощные инструменты для создания надежных, типобезопасных приложений. Основные принципы:

1. **Используйте строгую типизацию** - избегайте `any`
2. **Создавайте четкие интерфейсы** для props и состояния
3. **Применяйте правильные паттерны** для различных сценариев
4. **Оптимизируйте производительность** с помощью мемоизации
5. **Следуйте соглашениям** по именованию и структуре

Регулярная практика и изучение современных паттернов поможет вам максимально эффективно использовать возможности TypeScript в React приложениях.
# Шпаргалка: React + TypeScript

## Быстрый справочник по React с TypeScript

### 📋 Содержание
- [Базовые типы](#базовые-типы)
- [Типизация компонентов](#типизация-компонентов)
- [Хуки](#хуки)
- [Event Handlers](#event-handlers)
- [Формы](#формы)
- [Refs](#refs)
- [Контекст](#контекст)
- [Продвинутые типы](#продвинутые-типы)

---

## Базовые типы

### React типы
```typescript
import React from 'react';

// Основные React типы
React.ReactNode        // Любой рендерируемый контент
React.ReactElement     // JSX элемент
React.ComponentType    // Тип компонента
React.FC              // Functional Component (необязательно)
React.Component       // Class Component

// JSX типы
JSX.Element           // Результат JSX выражения
JSX.IntrinsicElements // HTML элементы
```

### HTML типы
```typescript
// HTML элементы
HTMLDivElement
HTMLInputElement
HTMLButtonElement
HTMLFormElement
HTMLSelectElement
HTMLTextAreaElement

// HTML атрибуты
React.HTMLProps<HTMLDivElement>
React.InputHTMLAttributes<HTMLInputElement>
React.ButtonHTMLAttributes<HTMLButtonElement>
React.FormHTMLAttributes<HTMLFormElement>
```

---

## Типизация компонентов

### Функциональные компоненты

```typescript
// ✅ Рекомендуемый способ
interface Props {
  name: string;
  age?: number;
}

function MyComponent({ name, age }: Props) {
  return <div>Hello {name}</div>;
}

// ✅ Альтернативный способ
const MyComponent: React.FC<Props> = ({ name, age }) => {
  return <div>Hello {name}</div>;
};
```

### Props с children
```typescript
// Простые children
interface Props {
  children: React.ReactNode;
}

// Render prop
interface Props {
  children: (data: User) => React.ReactNode;
}

// Ограниченные children
interface Props {
  children: React.ReactElement<ButtonProps>;
}
```

### Расширение HTML атрибутов
```typescript
// Кнопка с дополнительными props
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant: 'primary' | 'secondary';
  loading?: boolean;
}

// Input с лейблом
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}
```

---

## Хуки

### useState
```typescript
// Простые типы (автовывод)
const [count, setCount] = useState(0);          // number
const [name, setName] = useState('');           // string
const [visible, setVisible] = useState(false);  // boolean

// Сложные типы
const [user, setUser] = useState<User | null>(null);
const [users, setUsers] = useState<User[]>([]);

// С начальным значением
const [state, setState] = useState<State>({
  loading: false,
  error: null,
  data: []
});
```

### useEffect
```typescript
useEffect(() => {
  // Синхронная функция
  fetchData();

  // Cleanup
  return () => {
    cleanup();
  };
}, [dependency]); // типизация зависимостей автоматическая

// Async эффект
useEffect(() => {
  const fetchData = async () => {
    const response = await fetch('/api/data');
    const data: ApiResponse = await response.json();
    setData(data);
  };

  fetchData();
}, []);
```

### useReducer
```typescript
// Типы состояния и действий
type State = {
  count: number;
  error: string | null;
};

type Action =
  | { type: 'increment' }
  | { type: 'decrement' }
  | { type: 'set_error'; payload: string };

// Reducer
const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'increment':
      return { ...state, count: state.count + 1 };
    case 'decrement':
      return { ...state, count: state.count - 1 };
    case 'set_error':
      return { ...state, error: action.payload };
    default:
      return state;
  }
};

// Использование
const [state, dispatch] = useReducer(reducer, { count: 0, error: null });
```

### useRef
```typescript
// DOM элементы
const inputRef = useRef<HTMLInputElement>(null);
const divRef = useRef<HTMLDivElement>(null);

// Изменяемые значения
const countRef = useRef<number>(0);
const timerRef = useRef<NodeJS.Timeout | null>(null);

// Доступ к ref
inputRef.current?.focus();
```

### useContext
```typescript
// Создание контекста
interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Хук для использования контекста
function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
```

---

## Event Handlers

### Базовые события
```typescript
// Click события
const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
  console.log(e.currentTarget.textContent);
};

const handleDivClick = (e: React.MouseEvent<HTMLDivElement>) => {
  console.log('Clicked at:', e.clientX, e.clientY);
};

// Input события
const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setValue(e.target.value);
};

const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
  setText(e.target.value);
};

const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
  setSelected(e.target.value);
};

// Form события
const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  const formData = new FormData(e.currentTarget);
};

// Keyboard события
const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
  if (e.key === 'Enter') {
    handleSubmit();
  }
};

// Focus события
const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
  console.log('Input focused');
};

const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
  console.log('Input blurred');
};
```

### Передача параметров
```typescript
// Через arrow function
<button onClick={() => handleDelete(item.id)}>Delete</button>

// Через currying
const handleDelete = (id: string) => (e: React.MouseEvent) => {
  e.stopPropagation();
  deleteItem(id);
};

// Через data-атрибуты
const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
  const id = e.currentTarget.dataset.id;
  if (id) deleteItem(id);
};

<button data-id={item.id} onClick={handleClick}>Delete</button>
```

---

## Формы

### Контролируемые компоненты
```typescript
interface FormData {
  username: string;
  email: string;
  age: number;
  country: string;
  subscribe: boolean;
}

const [formData, setFormData] = useState<FormData>({
  username: '',
  email: '',
  age: 0,
  country: '',
  subscribe: false
});

// Универсальный обработчик
const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
  const { name, value, type } = e.target;
  const checked = (e.target as HTMLInputElement).checked;

  setFormData(prev => ({
    ...prev,
    [name]: type === 'checkbox' ? checked :
             type === 'number' ? Number(value) : value
  }));
};
```

### Валидация
```typescript
interface FormErrors {
  username?: string;
  email?: string;
}

const [errors, setErrors] = useState<FormErrors>({});

const validateForm = (): boolean => {
  const newErrors: FormErrors = {};

  if (!formData.username.trim()) {
    newErrors.username = 'Username is required';
  }

  if (!formData.email.includes('@')) {
    newErrors.email = 'Invalid email';
  }

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};
```

---

## Refs

### useRef
```typescript
// DOM refs
const inputRef = useRef<HTMLInputElement>(null);

// Доступ к элементу
const focusInput = () => {
  inputRef.current?.focus();
};

// Refs для значений
const renderCount = useRef(0);
renderCount.current += 1;
```

### forwardRef
```typescript
interface InputProps {
  label: string;
  error?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, ...props }, ref) => (
    <div>
      <label>{label}</label>
      <input ref={ref} {...props} />
      {error && <span>{error}</span>}
    </div>
  )
);

// Использование
const MyForm = () => {
  const inputRef = useRef<HTMLInputElement>(null);

  return <Input ref={inputRef} label="Name" />;
};
```

---

## Контекст

### Создание контекста
```typescript
interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
```

### Провайдер
```typescript
interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const user = await apiLogin(email, password);
      setUser(user);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
```

### Кастомный хук
```typescript
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

---

## Продвинутые типы

### Generic компоненты
```typescript
interface ListProps<T> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
  keyExtractor: (item: T) => string;
}

function List<T>({ items, renderItem, keyExtractor }: ListProps<T>) {
  return (
    <ul>
      {items.map(item => (
        <li key={keyExtractor(item)}>
          {renderItem(item)}
        </li>
      ))}
    </ul>
  );
}

// Использование
<List
  items={users}
  keyExtractor={user => user.id}
  renderItem={user => <span>{user.name}</span>}
/>
```

### Utility Types
```typescript
// Pick - выбрать определенные поля
type UserFormData = Pick<User, 'name' | 'email'>;

// Omit - исключить определенные поля
type CreateUser = Omit<User, 'id' | 'createdAt'>;

// Partial - сделать все поля опциональными
type UserUpdate = Partial<User>;

// Required - сделать все поля обязательными
type CompleteUser = Required<User>;

// Record - создать объект с определенными ключами
type UserRoles = Record<string, 'admin' | 'user'>;
```

### Union типы для состояний
```typescript
type AsyncState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: string };

const [state, setState] = useState<AsyncState<User[]>>({ status: 'idle' });

// Type guard
const isSuccess = (state: AsyncState<any>): state is { status: 'success'; data: any } => {
  return state.status === 'success';
};

if (isSuccess(state)) {
  console.log(state.data); // TypeScript знает что data существует
}
```

### HOC типизация
```typescript
interface WithLoadingProps {
  loading?: boolean;
}

function withLoading<P extends object>(
  Component: React.ComponentType<P>
) {
  return (props: P & WithLoadingProps) => {
    const { loading, ...restProps } = props;

    if (loading) {
      return <div>Loading...</div>;
    }

    return <Component {...(restProps as P)} />;
  };
}
```

---

## ⚡ Быстрые команды

### Создание компонента
```typescript
// Шаблон функционального компонента
interface Props {
  // определить props
}

export const ComponentName = ({ }: Props) => {
  return (
    <div>
      {/* JSX */}
    </div>
  );
};
```

### Создание хука
```typescript
// Шаблон кастомного хука
export const useCustomHook = <T>(initialValue: T) => {
  const [value, setValue] = useState<T>(initialValue);

  // логика хука

  return { value, setValue };
};
```

### Создание контекста
```typescript
// Шаблон контекста
interface ContextType {
  // определить типы
}

const Context = createContext<ContextType | undefined>(undefined);

export const useContext = () => {
  const context = useContext(Context);
  if (!context) {
    throw new Error('useContext must be used within Provider');
  }
  return context;
};
```

---

## 🚨 Частые ошибки

### ❌ Что НЕ нужно делать
```typescript
// Не используйте any
const handleClick = (e: any) => { };

// Не используйте React.FC без необходимости
const Component: React.FC = () => { };

// Не мутируйте состояние
state.users.push(newUser);

// Не забывайте dependencies в useEffect
useEffect(() => {
  fetchData(userId);
}, []); // userId должен быть в зависимостях
```

### ✅ Что нужно делать
```typescript
// Используйте точные типы
const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => { };

// Простые функции
const Component = () => { };

// Иммутабельные обновления
setUsers(prev => [...prev, newUser]);

// Правильные зависимости
useEffect(() => {
  fetchData(userId);
}, [userId]);
```

---
Отлично, идём **по той же логике**, без спешки и «магии».
Ниже — **ТОЛЬКО LR2**, подробная теория, объяснение максимально простое, как для **9 класса**, но полностью покрывающее то, что реально спрашивают в тестах и используют в лабораторных.

---

# **LR2. React + TypeScript (как делается интерфейс сайта)**

## 1. Зачем вообще нужен React

Обычный сайт (HTML + CSS + JS):

* страница загрузилась;
* чтобы что-то изменить — надо вручную менять DOM.

React решает проблему:

* интерфейс **сам обновляется**, когда меняются данные;
* сайт разбивается на **компоненты**;
* код становится понятнее и короче.

👉 React — это библиотека для создания **динамических интерфейсов**.

---

## 2. Что такое компонент (самое главное в React)

**Компонент** — это кусок интерфейса.

Можно представить как функцию:

* на вход получает данные;
* на выходе отдаёт HTML.

Пример компонента:

```tsx
function Hello() {
  return <h1>Привет!</h1>;
}
```

Это обычная функция, но:

* возвращает **JSX** (HTML внутри JS).

---

## 3. JSX — почему HTML внутри JavaScript

JSX — это не настоящий HTML, а **удобная запись**.

```tsx
const element = <h1>Привет</h1>;
```

На самом деле React превращает это в обычный JavaScript.

Правила JSX:

* всегда **один корневой элемент**;
* классы пишутся как `className`;
* можно вставлять переменные через `{}`.

---

## 4. Props — как передавать данные в компонент

**Props** — это данные, которые компонент получает снаружи.

Пример:

```tsx
function Greeting(props: { name: string }) {
  return <p>Привет, {props.name}</p>;
}
```

Использование:

```tsx
<Greeting name="Алекс" />
```

👉 Props **нельзя изменять внутри компонента**.
Они только для чтения.

---

## 5. Типизация props (почему это важно)

Правильный вариант:

```tsx
type GreetingProps = {
  name: string;
};

function Greeting(props: GreetingProps) {
  return <p>Привет, {props.name}</p>;
}
```

Теперь:

* нельзя забыть `name`;
* нельзя передать число вместо строки.

---

## 6. Состояние компонента (state)

**State** — это данные, которые могут меняться.

Для этого используется хук `useState`.

Пример счётчика:

```tsx
const [count, setCount] = useState<number>(0);
```

Здесь:

* `count` — текущее значение;
* `setCount` — функция для изменения.

Изменение:

```tsx
setCount(count + 1);
```

👉 **Нельзя менять `count` напрямую**.

---

## 7. Почему интерфейс обновляется сам

Когда вызывается `setState`:

* React понимает, что данные изменились;
* перерисовывает компонент.

Программист **не трогает DOM вручную**.

---

## 8. Обработка событий (кнопки, ввод)

Пример кнопки:

```tsx
<button onClick={handleClick}>Нажми</button>
```

Функция-обработчик:

```tsx
function handleClick() {
  console.log("Нажали кнопку");
}
```

Типизация события:

```tsx
function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
  console.log(e);
}
```

---

## 9. Формы и ввод данных

Пример поля ввода:

```tsx
const [text, setText] = useState("");
```

```tsx
<input
  value={text}
  onChange={(e) => setText(e.target.value)}
/>
```

Это называется **controlled component**:

* значение хранится в state;
* input только отображает его.

---

## 10. useEffect — когда нужен

`useEffect` используется для:

* загрузки данных;
* таймеров;
* подписок;
* действий «после рендера».

Пример:

```tsx
useEffect(() => {
  console.log("Компонент загрузился");
}, []);
```

Второй аргумент:

* `[]` — выполнить один раз;
* `[value]` — выполнять при изменении `value`.

---

## 11. useRef — ссылка на элемент

`useRef` позволяет получить доступ к HTML-элементу.

```tsx
const inputRef = useRef<HTMLInputElement>(null);
```

```tsx
<input ref={inputRef} />
```

Используется для:

* фокуса;
* прокрутки;
* доступа к DOM без перерендера.

---

## 12. children — вложенные компоненты

Компонент может содержать другие компоненты.

```tsx
function Box({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
}
```

Использование:

```tsx
<Box>
  <p>Текст внутри</p>
</Box>
```

---

## 13. Структура React-проекта

Обычно:

* `components/` — компоненты;
* `pages/` — страницы;
* `hooks/` — кастомные хуки;
* `types/` — типы TypeScript.

Разделение — для порядка и читаемости.

---

## 14. Частые ошибки новичков

❌ менять state напрямую
❌ забывать типы props
❌ писать всё в одном компоненте
❌ использовать `any`
❌ вызывать хуки внутри условий

---

## 15. Главная идея LR2

После LR2 студент должен понимать:

* что такое компонент;
* как передавать данные через props;
* как хранить данные в state;
* как реагировать на действия пользователя;
* как React сам обновляет интерфейс.

---

Если хочешь, следующим шагом можем:

* разобрать **типичные задания из LR2**;
* разобрать **ошибки студентов**;
* или идти дальше к **LR3 (Vite + Tailwind)** в таком же стиле.


# Полное руководство: Vite + Tailwind CSS

## Содержание
1. [Введение](#введение)
2. [Vite vs Create React App](#vite-vs-create-react-app)
3. [Настройка проекта](#настройка-проекта)
4. [Конфигурация Vite](#конфигурация-vite)
5. [Введение в Tailwind CSS](#введение-в-tailwind-css)
6. [Utility-First подход](#utility-first-подход)
7. [Интеграция Tailwind с Vite](#интеграция-tailwind-с-vite)
8. [Hot Module Replacement](#hot-module-replacement)
9. [ESLint и Prettier](#eslint-и-prettier)
10. [Best Practices](#best-practices)

---

## Введение

Современная разработка фронтенда требует быстрых инструментов и эффективных подходов к стилизации. В этом руководстве мы рассмотрим связку **Vite + Tailwind CSS** — мощную комбинацию для создания современных веб-приложений.

### Что мы изучим:
- **Vite** - сверхбыстрый сборщик для разработки
- **Tailwind CSS** - utility-first CSS фреймворк
- **TypeScript** - статическая типизация для надежности
- **HMR** - мгновенные обновления при разработке

---

## Vite vs Create React App

### Что такое Vite?

**Vite** (фр. "быстрый") — это инструмент сборки нового поколения, созданный Эваном Ю (создателем Vue.js).

### Сравнительная таблица

| Характеристика | Vite | Create React App (CRA) |
|---------------|------|------------------------|
| **Запуск dev-сервера** | ~300ms | ~20-30s |
| **Hot Module Replacement** | Мгновенный | 1-3s |
| **Технология** | ES Modules + esbuild | Webpack |
| **Bundle size** | Меньше | Больше |
| **Конфигурация** | Простая | Требует eject |
| **Поддержка TypeScript** | Из коробки | Из коробки |
| **Tree-shaking** | Автоматически | Требует настройки |

### Преимущества Vite

#### 1. Скорость разработки
```bash
# CRA - холодный старт
$ npm start
⏱️  Starting development server... (25 seconds)

# Vite - холодный старт
$ npm run dev
⚡️ Vite dev server running in 287ms
```

#### 2. Мгновенный HMR
Vite использует нативные ES модули браузера, поэтому при изменении файла обновляется только этот модуль, а не весь бандл.

```typescript
// Изменение в Button.tsx
// CRA: Перезагрузка всего приложения (~2-3s)
// Vite: Обновление только Button (~50ms)
```

#### 3. Оптимизированный production build
Vite использует Rollup для production сборки, что дает лучшее tree-shaking и меньший размер бандла.

```bash
# Размер production bundle
CRA:  500-800 KB (gzipped)
Vite: 300-500 KB (gzipped)
```

### Когда использовать CRA?

- Легаси проекты, уже использующие CRA
- Если нужна стабильность (CRA проверен годами)
- Проекты с очень специфичными Webpack плагинами

### Когда использовать Vite?

- ✅ Новые проекты
- ✅ Когда важна скорость разработки
- ✅ Современные браузеры
- ✅ TypeScript проекты

---

## Настройка проекта

### Создание нового проекта с Vite

#### Шаг 1: Инициализация проекта

```bash
# С помощью npm
npm create vite@latest my-app -- --template react-ts

# С помощью yarn
yarn create vite my-app --template react-ts

# С помощью pnpm
pnpm create vite my-app --template react-ts
```

#### Шаг 2: Установка зависимостей

```bash
cd my-app
npm install
```

#### Шаг 3: Запуск dev-сервера

```bash
npm run dev
```

Ваше приложение запустится на `http://localhost:5173`

### Структура проекта

```
my-app/
├── node_modules/
├── public/
│   └── vite.svg
├── src/
│   ├── assets/
│   │   └── react.svg
│   ├── App.css
│   ├── App.tsx
│   ├── index.css
│   ├── main.tsx
│   └── vite-env.d.ts
├── .gitignore
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
```

### Ключевые файлы

#### index.html
```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Vite + React + TS</title>
  </head>
  <body>
    <div id="root"></div>
    <!-- Точка входа - TypeScript модуль -->
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

**Важно:** HTML файл находится в корне проекта, а не в `public/`, в отличие от CRA.

#### src/main.tsx
```typescript
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

#### package.json
```json
{
  "name": "my-app",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@vitejs/plugin-react": "^4.2.0",
    "typescript": "^5.3.0",
    "vite": "^5.0.0"
  }
}
```

---

## Конфигурация Vite

### vite.config.ts

Базовая конфигурация Vite минималистична:

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})
```

### Расширенная конфигурация

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],

  // Алиасы для импортов
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@utils': path.resolve(__dirname, './src/utils'),
    },
  },

  // Настройки dev-сервера
  server: {
    port: 3000,
    open: true, // Автоматически открыть браузер
    host: true, // Доступ по сети
    proxy: {
      // Проксирование API запросов
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },

  // Production build настройки
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild',

    // Chunk splitting
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
        },
      },
    },
  },

  // Определение глобальных переменных
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
  },
})
```

### Использование алиасов

После настройки алиасов:

```typescript
// Было:
import Button from '../../../components/ui/Button'

// Стало:
import Button from '@components/ui/Button'
```

### Environment Variables

#### Создание .env файлов

```bash
# .env
VITE_API_URL=http://localhost:3000/api

# .env.development
VITE_API_URL=http://localhost:8080/api

# .env.production
VITE_API_URL=https://api.production.com
```

#### Использование в коде

```typescript
// Доступ к env переменным
const apiUrl = import.meta.env.VITE_API_URL

// Проверка режима
if (import.meta.env.DEV) {
  console.log('Development mode')
}

if (import.meta.env.PROD) {
  console.log('Production mode')
}
```

**Важно:** Все переменные окружения должны начинаться с `VITE_`

### TypeScript настройки для env

```typescript
// src/vite-env.d.ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_APP_TITLE: string
  // Добавьте другие переменные
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

---

## Введение в Tailwind CSS

### Что такое Tailwind CSS?

Tailwind CSS — это **utility-first** CSS фреймворк, который предоставляет низкоуровневые utility классы для построения кастомных дизайнов.

### Традиционный CSS vs Tailwind

#### Традиционный подход
```html
<!-- HTML -->
<button class="btn btn-primary">
  Click me
</button>

<!-- CSS -->
<style>
.btn {
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  font-weight: 500;
  transition: all 0.3s;
}

.btn-primary {
  background-color: #3b82f6;
  color: white;
}

.btn-primary:hover {
  background-color: #2563eb;
}
</style>
```

#### Tailwind подход
```html
<button class="bg-blue-500 hover:bg-blue-600 text-white font-medium px-4 py-2 rounded transition-colors">
  Click me
</button>
```

### Преимущества Tailwind

#### 1. Нет naming проблем
Не нужно придумывать имена для CSS классов:
```html
<!-- Не нужно думать об именах -->
<div class="flex items-center justify-between p-4">
  <!-- content -->
</div>
```

#### 2. Предсказуемость
Каждый класс делает одну вещь:
```html
<!-- bg-blue-500 всегда делает фон синим -->
<!-- p-4 всегда добавляет padding: 1rem -->
<div class="bg-blue-500 p-4">Предсказуемо</div>
```

#### 3. Оптимизация размера
Tailwind удаляет неиспользуемые классы в production:
```bash
# Development: ~3.5 MB CSS
# Production:  ~10-20 KB CSS (только использованные классы)
```

#### 4. Responsive дизайн
```html
<!-- Разные стили для разных экранов -->
<div class="text-sm md:text-base lg:text-lg">
  Responsive text
</div>

<!-- 1 колонка на мобильных, 3 на десктопах -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
  <!-- items -->
</div>
```

#### 5. Темизация из коробки
```html
<!-- Dark mode -->
<div class="bg-white dark:bg-gray-800 text-black dark:text-white">
  Адаптивная тема
</div>
```

### Недостатки Tailwind

#### 1. Длинные списки классов
```html
<button class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
  Long class list
</button>
```

**Решение:** Извлекайте компоненты или используйте `@apply`

#### 2. Кривая обучения
Нужно запомнить множество классов и их сокращения.

**Решение:** IDE расширения, документация, практика

---

## Utility-First подход

### Философия

Вместо создания semantic классов (`.card`, `.button`), вы используете utility классы (`.bg-white`, `.rounded`, `.p-4`).

### Пример: Создание карточки

#### Шаг 1: Базовые стили
```html
<div class="bg-white">
  <h2>Title</h2>
  <p>Description</p>
</div>
```

#### Шаг 2: Добавляем spacing
```html
<div class="bg-white p-6">
  <h2 class="mb-2">Title</h2>
  <p>Description</p>
</div>
```

#### Шаг 3: Добавляем borders и shadows
```html
<div class="bg-white p-6 rounded-lg shadow-md">
  <h2 class="mb-2">Title</h2>
  <p>Description</p>
</div>
```

#### Шаг 4: Typography
```html
<div class="bg-white p-6 rounded-lg shadow-md">
  <h2 class="text-xl font-bold mb-2">Title</h2>
  <p class="text-gray-600">Description</p>
</div>
```

#### Шаг 5: Hover эффекты
```html
<div class="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow cursor-pointer">
  <h2 class="text-xl font-bold mb-2">Title</h2>
  <p class="text-gray-600">Description</p>
</div>
```

### Компонентизация с Tailwind

Когда паттерн повторяется, извлекайте компонент:

```typescript
// components/Card.tsx
interface CardProps {
  title: string;
  description: string;
  onClick?: () => void;
}

export function Card({ title, description, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow cursor-pointer"
    >
      <h2 className="text-xl font-bold mb-2">{title}</h2>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

// Использование
<Card title="My Card" description="Card description" />
```

### @apply директива

Для часто повторяющихся паттернов можно использовать `@apply`:

```css
/* styles/components.css */
@layer components {
  .btn-primary {
    @apply bg-blue-500 hover:bg-blue-600 text-white font-medium px-4 py-2 rounded transition-colors;
  }

  .card {
    @apply bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow;
  }

  .input {
    @apply border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent;
  }
}
```

```html
<button class="btn-primary">Click me</button>
<div class="card">Card content</div>
<input class="input" type="text" />
```

**Важно:** Используйте `@apply` умеренно. Слишком частое использование противоречит utility-first подходу.

---

## Интеграция Tailwind с Vite

### Установка Tailwind CSS

#### Шаг 1: Установка пакетов

```bash
npm install -D tailwindcss postcss autoprefixer
```

#### Шаг 2: Инициализация конфигурации

```bash
npx tailwindcss init -p
```

Это создаст два файла:
- `tailwind.config.js` — конфигурация Tailwind
- `postcss.config.js` — конфигурация PostCSS

#### Шаг 3: Настройка tailwind.config.js

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          900: '#1e3a8a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      spacing: {
        '128': '32rem',
        '144': '36rem',
      },
      borderRadius: {
        '4xl': '2rem',
      },
    },
  },
  plugins: [],
}
```

#### Шаг 4: Добавление Tailwind directives в CSS

```css
/* src/index.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Кастомные глобальные стили */
@layer base {
  body {
    @apply font-sans antialiased;
  }

  h1 {
    @apply text-4xl font-bold;
  }

  h2 {
    @apply text-3xl font-semibold;
  }
}

@layer components {
  .btn {
    @apply px-4 py-2 rounded font-medium transition-colors;
  }

  .btn-primary {
    @apply btn bg-blue-500 hover:bg-blue-600 text-white;
  }

  .btn-secondary {
    @apply btn bg-gray-500 hover:bg-gray-600 text-white;
  }
}

@layer utilities {
  .text-balance {
    text-wrap: balance;
  }
}
```

#### Шаг 5: Импорт CSS в main.tsx

```typescript
// src/main.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css' // Импортируем Tailwind

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

### Проверка установки

Создайте тестовый компонент:

```typescript
// src/App.tsx
function App() {
  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">
          Tailwind CSS работает! 🎉
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow"
            >
              <h2 className="text-xl font-bold mb-2">Card {i}</h2>
              <p className="text-gray-600">
                This is a test card with Tailwind CSS styling.
              </p>
              <button className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
                Action
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default App
```

### Расширение конфигурации Tailwind

#### Кастомные цвета

```javascript
// tailwind.config.js
export default {
  theme: {
    extend: {
      colors: {
        'brand': {
          light: '#85d7ff',
          DEFAULT: '#1fb6ff',
          dark: '#009eeb',
        },
        'accent': '#ff49db',
      }
    }
  }
}
```

```html
<div class="bg-brand text-white">Brand color</div>
<div class="bg-brand-light">Light brand</div>
<div class="bg-accent">Accent color</div>
```

#### Кастомные breakpoints

```javascript
// tailwind.config.js
export default {
  theme: {
    screens: {
      'xs': '475px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
      '3xl': '1920px',
    }
  }
}
```

```html
<div class="text-sm xs:text-base md:text-lg xl:text-xl">
  Responsive text
</div>
```

---

## Hot Module Replacement

### Что такое HMR?

Hot Module Replacement (HMR) — это технология, позволяющая обновлять модули приложения без полной перезагрузки страницы, сохраняя состояние приложения.

### HMR в Vite

Vite предоставляет HMR из коробки с невероятной скоростью благодаря использованию ES модулей.

#### Как это работает

```typescript
// src/components/Counter.tsx
import { useState } from 'react'

export function Counter() {
  const [count, setCount] = useState(0)

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(c => c + 1)}>
        Increment
      </button>
    </div>
  )
}

// При изменении этого файла:
// 1. Vite обнаруживает изменение
// 2. Пересобирает только этот модуль
// 3. Отправляет обновление через WebSocket
// 4. Браузер применяет изменение без перезагрузки
// 5. Состояние React сохраняется!
```

### Fast Refresh

Vite использует React Fast Refresh, который сохраняет состояние компонентов при HMR:

```typescript
function App() {
  const [count, setCount] = useState(0)

  // Измените JSX или стили здесь
  // count останется прежним после HMR!

  return (
    <div className="p-4"> {/* Изменил padding с 2 на 4 */}
      <p>Count: {count}</p>
      <button onClick={() => setCount(c => c + 1)}>
        Click me
      </button>
    </div>
  )
}
```

### HMR API

Для продвинутых случаев можно использовать HMR API:

```typescript
// src/config.ts
export const API_URL = 'http://localhost:3000'

if (import.meta.hot) {
  import.meta.hot.accept((newModule) => {
    console.log('Config updated:', newModule)
  })
}
```

### Troubleshooting HMR

#### Проблема: HMR не работает

```typescript
// ❌ Плохо - экспорт по умолчанию с анонимной функцией
export default () => {
  return <div>Component</div>
}

// ✅ Хорошо - именованная функция
export default function Component() {
  return <div>Component</div>
}

// ✅ Хорошо - named export
export function Component() {
  return <div>Component</div>
}
```

#### Проблема: Состояние сбрасывается

```typescript
// ❌ Плохо - состояние вне компонента
let count = 0

function Counter() {
  return <div>{count}</div> // Сбросится при HMR
}

// ✅ Хорошо - используйте React state
function Counter() {
  const [count, setCount] = useState(0)
  return <div>{count}</div> // Сохранится при HMR
}
```

---

## ESLint и Prettier

### Настройка ESLint

#### Установка

```bash
npm install -D eslint @typescript-eslint/eslint-plugin @typescript-eslint/parser eslint-plugin-react eslint-plugin-react-hooks
```

#### Конфигурация .eslintrc.cjs

```javascript
module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  plugins: [
    '@typescript-eslint',
    'react',
    'react-hooks',
  ],
  rules: {
    'react/react-in-jsx-scope': 'off',
    '@typescript-eslint/no-unused-vars': ['warn', {
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_',
    }],
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
}
```

#### Scripts в package.json

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "lint:fix": "eslint . --ext ts,tsx --fix"
  }
}
```

### Настройка Prettier

#### Установка

```bash
npm install -D prettier eslint-config-prettier eslint-plugin-prettier
```

#### .prettierrc

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "arrowParens": "always",
  "endOfLine": "lf",
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

#### Интеграция с ESLint

Обновите `.eslintrc.cjs`:

```javascript
module.exports = {
  extends: [
    // ... другие extends
    'plugin:prettier/recommended', // Добавьте в конец
  ],
}
```

#### Scripts для Prettier

```json
{
  "scripts": {
    "format": "prettier --write \"src/**/*.{ts,tsx,css,md}\"",
    "format:check": "prettier --check \"src/**/*.{ts,tsx,css,md}\""
  }
}
```

### Prettier Plugin для Tailwind

Автоматически сортирует Tailwind классы:

```bash
npm install -D prettier-plugin-tailwindcss
```

```typescript
// До
<div className="pt-2 p-4 text-center bg-blue-500">

// После форматирования
<div className="bg-blue-500 p-4 pt-2 text-center">
```

### VS Code настройки

Создайте `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "tailwindCSS.experimental.classRegex": [
    ["class:\\s*?[\"'`]([^\"'`]*).*?,", "[\"'`]([^\"'`]*).*?[\"'`]"],
    ["className:\\s*?[\"'`]([^\"'`]*).*?,", "[\"'`]([^\"'`]*).*?[\"'`]"]
  ]
}
```

### Pre-commit hooks с Husky

#### Установка

```bash
npm install -D husky lint-staged

# Инициализация husky
npx husky-init && npm install
```

#### .husky/pre-commit

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx lint-staged
```

#### lint-staged конфигурация

```json
{
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{css,md}": [
      "prettier --write"
    ]
  }
}
```

---

## Best Practices

### 1. Организация Tailwind классов

#### Используйте порядок классов

```html
<!-- Layout -> Spacing -> Sizing -> Typography -> Visual -> Misc -->
<div class="flex items-center justify-between p-4 w-full text-lg font-bold bg-blue-500 rounded hover:bg-blue-600">
```

#### Разбивайте длинные списки

```typescript
const cardClasses = [
  // Layout
  'flex flex-col',
  // Spacing
  'p-6 gap-4',
  // Sizing
  'w-full max-w-md',
  // Visual
  'bg-white rounded-lg shadow-md',
  // Interactive
  'hover:shadow-xl transition-shadow',
].join(' ')

<div className={cardClasses}>
```

#### Используйте clsx или classnames

```bash
npm install clsx
```

```typescript
import clsx from 'clsx'

interface ButtonProps {
  variant: 'primary' | 'secondary'
  size: 'small' | 'large'
  disabled?: boolean
}

function Button({ variant, size, disabled }: ButtonProps) {
  return (
    <button
      className={clsx(
        // Base styles
        'rounded font-medium transition-colors',

        // Variants
        {
          'bg-blue-500 hover:bg-blue-600 text-white': variant === 'primary',
          'bg-gray-500 hover:bg-gray-600 text-white': variant === 'secondary',
        },

        // Sizes
        {
          'px-3 py-1 text-sm': size === 'small',
          'px-6 py-3 text-lg': size === 'large',
        },

        // States
        disabled && 'opacity-50 cursor-not-allowed'
      )}
      disabled={disabled}
    >
      Click me
    </button>
  )
}
```

### 2. Компонентная архитектура

```
src/
├── components/
│   ├── ui/              # Базовые UI компоненты
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   └── Modal.tsx
│   ├── layout/          # Layout компоненты
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── Sidebar.tsx
│   └── features/        # Feature-специфичные компоненты
│       ├── auth/
│       └── products/
├── hooks/               # Кастомные хуки
├── utils/               # Утилиты
└── styles/              # Глобальные стили
    └── index.css
```

### 3. Responsive Design паттерны

#### Mobile-First подход

```html
<!-- Начинайте с мобильных стилей, добавляйте для больших экранов -->
<div class="p-2 md:p-4 lg:p-6">
  <h1 class="text-xl md:text-2xl lg:text-3xl">Title</h1>
</div>
```

#### Скрытие элементов

```html
<!-- Скрыть на мобильных -->
<div class="hidden md:block">Desktop only</div>

<!-- Скрыть на десктопах -->
<div class="md:hidden">Mobile only</div>

<!-- Разный контент -->
<div>
  <span class="md:hidden">☰ Menu</span>
  <span class="hidden md:inline">Navigation Menu</span>
</div>
```

### 4. Performance оптимизация

#### PurgeCSS (автоматически в production)

```javascript
// tailwind.config.js
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  // Tailwind автоматически удалит неиспользуемые классы
}
```

#### Избегайте динамических классов

```typescript
// ❌ Плохо - классы могут быть удалены PurgeCSS
const color = 'blue'
<div className={`bg-${color}-500`}>Bad</div>

// ✅ Хорошо - используйте полные имена классов
const colorClass = color === 'blue' ? 'bg-blue-500' : 'bg-red-500'
<div className={colorClass}>Good</div>

// ✅ Хорошо - используйте safelist
// tailwind.config.js
export default {
  safelist: [
    'bg-blue-500',
    'bg-red-500',
    'bg-green-500',
  ]
}
```

### 5. Темизация

#### Dark mode

```javascript
// tailwind.config.js
export default {
  darkMode: 'class', // или 'media'
  // ...
}
```

```typescript
// App.tsx
function App() {
  const [darkMode, setDarkMode] = useState(false)

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <div className="text-black dark:text-white">
          <button onClick={() => setDarkMode(!darkMode)}>
            Toggle Dark Mode
          </button>
        </div>
      </div>
    </div>
  )
}
```

### 6. Accessibility

```html
<!-- Используйте semantic HTML -->
<button class="...">Click me</button>

<!-- Добавляйте ARIA атрибуты -->
<button
  aria-label="Close menu"
  aria-expanded="false"
  class="..."
>
  ✕
</button>

<!-- Focus states -->
<input
  class="border focus:outline-none focus:ring-2 focus:ring-blue-500"
  type="text"
/>
```

---

## Заключение

Связка **Vite + Tailwind CSS** предоставляет современный, быстрый и эффективный способ разработки веб-приложений:

### Ключевые преимущества:

1. **Vite** — молниеносная разработка с HMR
2. **Tailwind CSS** — быстрая стилизация без написания CSS
3. **TypeScript** — безопасность типов
4. **Отличный DX** — ESLint, Prettier, IntelliSense

Отлично, идём дальше **строго по тому же стилю** 👍
Ниже — **ТОЛЬКО LR3**, подробно, спокойно, без заумных слов, так чтобы понял **9-классник**, но при этом это полноценная теория для лабораторной и теста.

---

# **LR3. Современный стек: Vite + Tailwind CSS**

## 1. Зачем вообще нужна эта лабораторная

До этого:

* мы писали код;
* создавали компоненты;
* работали с логикой.

Но остаются вопросы:

* **как запускать проект быстро**?
* **как красиво оформлять интерфейс**?
* **как не писать тонны CSS**?

LR3 отвечает на эти вопросы.

---

## 2. Что такое Vite и зачем он нужен

**Vite** — это инструмент, который:

* запускает проект;
* собирает его;
* обновляет страницу при изменении кода.

Проще:

> Vite — это «двигатель» проекта.

---

## 3. Почему не старый CRA, а Vite

Раньше использовали **Create React App (CRA)**.
Он был удобный, но:

* долго запускался;
* медленно обновлялся;
* сложно настраивался.

**Vite:**

* стартует почти мгновенно;
* изменения видны сразу;
* конфигурация проще.

---

## 4. HMR — мгновенные изменения

**HMR (Hot Module Replacement)** — это когда:

* ты сохраняешь файл;
* браузер **обновляется без перезагрузки страницы**;
* состояние не теряется.

Пример:

* счётчик был `5`;
* ты поменял цвет кнопки;
* счётчик остался `5`.

Это и есть HMR.

---

## 5. Структура проекта с Vite

Обычно:

* `src/` — весь код;
* `main.tsx` — точка входа;
* `App.tsx` — главный компонент;
* `vite.config.ts` — настройки Vite.

---

## 6. vite.config.ts — файл настроек

Это файл, где:

* настраиваются плагины;
* задаются алиасы;
* прокси для сервера.

Пример алиаса:

```ts
resolve: {
  alias: {
    "@": "/src"
  }
}
```

Теперь можно писать:

```ts
import Button from "@/components/Button";
```

А не длинные пути.

---

## 7. Переменные окружения (`.env`)

Используются для:

* адресов серверов;
* ключей;
* разных настроек.

Пример:

```env
VITE_API_URL=http://localhost:3000
```

В коде:

```ts
import.meta.env.VITE_API_URL
```

⚠️ В Vite **все переменные должны начинаться с `VITE_`**.

---

## 8. Proxy — зачем он нужен

Когда фронтенд и сервер разные — появляются проблемы (CORS).

**Proxy** позволяет:

* делать запросы как будто на тот же сайт;
* избежать ошибок браузера.

Настраивается в `vite.config.ts`.

---

## 9. Что такое Tailwind CSS

**Tailwind CSS** — это способ писать CSS через готовые классы.

Вместо этого:

```css
.button {
  padding: 16px;
  background: blue;
  border-radius: 8px;
}
```

Пишем сразу в JSX:

```html
<button className="p-4 bg-blue-500 rounded-lg">
```

---

## 10. Почему Tailwind удобен

* не нужно придумывать имена классов;
* стили видно прямо в компоненте;
* меньше CSS-файлов;
* легко поддерживать.

---

## 11. Основные классы Tailwind

### Отступы

* `p-4` — внутренний отступ
* `m-2` — внешний отступ

### Цвета

* `bg-blue-500`
* `text-red-600`

### Размеры

* `w-full`
* `h-10`

### Скругления и тени

* `rounded-lg`
* `shadow-md`

---

## 12. Адаптивность (разные экраны)

Tailwind поддерживает **breakpoints**.

Пример:

```html
<div className="text-sm md:text-lg">
```

Означает:

* маленький экран → мелкий текст
* средний и больше → крупный

Основные:

* `sm`
* `md`
* `lg`
* `xl`

---

## 13. Тёмная тема (dark mode)

```html
<div className="bg-white dark:bg-black">
```

Работает:

* по классу `dark`;
* или по настройкам системы.

---

## 14. Условные классы

Часто стиль зависит от состояния.

Используют `clsx` или `classnames`:

```ts
className={clsx(
  "p-4",
  isActive && "bg-green-500"
)}
```

---

## 15. ESLint и Prettier — порядок в коде

### ESLint

* ищет ошибки;
* подсказывает плохие места.

### Prettier

* форматирует код;
* делает его единообразным.

Работают автоматически при сохранении.

---

## 16. Husky — защита от плохого кода

**Husky** запускает проверки:

* перед коммитом;
* не даёт залить кривой код.

Используется в реальных проектах.

---

## 17. Best practices (что любят на тестах)

* маленькие компоненты;
* понятные имена;
* алиасы вместо длинных путей;
* стили через Tailwind;
* не перегружать один файл.

---

## 18. Главная идея LR3

После LR3 студент должен понимать:

* зачем нужен Vite;
* что такое HMR;
* как работать с `.env`;
* как стилизовать интерфейс через Tailwind;
* как держать проект в порядке.

---

Если хочешь, дальше можем:

* разобрать **типовые задания LR3**;
* показать **ошибки студентов**;
* или идти дальше к **LR4 (MobX / Zustand)** в таком же стиле.


# Полное руководство: Управление состоянием с MobX и Zustand

## Содержание
1. [Введение в управление состоянием](#введение)
2. [MobX: Реактивное программирование](#mobx)
3. [Zustand: Минималистичное решение](#zustand)
4. [Сравнение и выбор подхода](#сравнение)
5. [Интеграция с TypeScript](#typescript)
6. [Продвинутые паттерны](#advanced)
7. [Best Practices](#best-practices)

---

## Введение в управление состоянием {#введение}

### Зачем нужно управление состоянием?

В React-приложениях состояние (state) — это данные, которые определяют, что показывать пользователю. По мере роста приложения возникают проблемы:

1. **Prop drilling** — передача данных через множество компонентов
2. **Дублирование состояния** — одни и те же данные в разных местах
3. **Синхронизация** — сложность обновления связанных данных
4. **Производительность** — лишние ре-рендеры компонентов

### Эволюция решений

```
Local State (useState)
   ↓
Context API (useContext)
   ↓
Redux (действия, редьюсеры)
   ↓
MobX / Zustand (современные решения)
```

### Когда использовать библиотеки управления состоянием?

**Используйте**, если:
- Состояние нужно в многих компонентах
- Сложная бизнес-логика
- Нужно кэшировать серверные данные
- Состояние должно переживать навигацию

**Не используйте**, если:
- Простые формы
- Локальное UI-состояние (модалки, табы)
- Мало компонентов

---

## MobX: Реактивное программирование {#mobx}

### Философия MobX

MobX делает управление состоянием простым, применяя **реактивное программирование**:

```
State → Derivations → Reactions
```

- **State** (состояние) — данные приложения
- **Derivations** (производные) — вычисляемые значения
- **Reactions** — побочные эффекты (например, обновление UI)

### Основные концепции

#### 1. Observable State (Наблюдаемое состояние)

```typescript
import { makeObservable, observable, action } from 'mobx';

class TodoStore {
  todos: string[] = [];

  constructor() {
    makeObservable(this, {
      todos: observable,
      addTodo: action,
    });
  }

  addTodo(text: string) {
    this.todos.push(text);
  }
}
```

**Что происходит:**
- `observable` — MobX отслеживает изменения массива `todos`
- `action` — метод, который может изменять состояние
- При изменении `todos` все зависимые компоненты обновятся

#### 2. makeAutoObservable — упрощённый вариант

```typescript
import { makeAutoObservable } from 'mobx';

class CounterStore {
  count = 0;

  constructor() {
    makeAutoObservable(this); // Автоматически делает всё observable
  }

  increment() {
    this.count++;
  }

  decrement() {
    this.count--;
  }
}
```

**Преимущества:**
- Не нужно перечислять каждое поле
- Методы автоматически становятся actions
- Меньше boilerplate-кода

#### 3. Computed Values (Вычисляемые значения)

```typescript
import { makeAutoObservable, computed } from 'mobx';

class CartStore {
  items = [
    { name: 'Книга', price: 500, quantity: 2 },
    { name: 'Ручка', price: 50, quantity: 5 },
  ];

  constructor() {
    makeAutoObservable(this);
  }

  get total() {
    return this.items.reduce((sum, item) =>
      sum + item.price * item.quantity, 0
    );
  }

  get itemCount() {
    return this.items.reduce((sum, item) => sum + item.quantity, 0);
  }
}

// Использование
const cart = new CartStore();
console.log(cart.total); // 1250
console.log(cart.itemCount); // 7
```

**Computed values:**
- Вычисляются **автоматически** при изменении зависимостей
- **Кэшируются** — пересчёт только при изменении данных
- **Чистые функции** — нет побочных эффектов

#### 4. Actions — изменение состояния

```typescript
class TodoStore {
  todos: Todo[] = [];

  constructor() {
    makeAutoObservable(this);
  }

  addTodo(text: string) {
    this.todos.push({
      id: Date.now(),
      text,
      completed: false,
    });
  }

  toggleTodo(id: number) {
    const todo = this.todos.find(t => t.id === id);
    if (todo) {
      todo.completed = !todo.completed;
    }
  }

  removeTodo(id: number) {
    this.todos = this.todos.filter(t => t.id !== id);
  }
}
```

**Правила actions:**
- Все изменения состояния — только через actions
- Actions могут быть синхронными и асинхронными
- Можно вызывать другие actions

### Интеграция с React

#### observer — HOC и хук

```typescript
import { observer } from 'mobx-react-lite';

// Вариант 1: observer как HOC
const TodoList = observer(({ store }: { store: TodoStore }) => {
  return (
    <div>
      <h2>Задачи: {store.todos.length}</h2>
      {store.todos.map(todo => (
        <div key={todo.id}>
          <input
            type="checkbox"
            checked={todo.completed}
            onChange={() => store.toggleTodo(todo.id)}
          />
          {todo.text}
        </div>
      ))}
    </div>
  );
});

// Вариант 2: observer как хук
function TodoList({ store }: { store: TodoStore }) {
  return useObserver(() => (
    <div>
      <h2>Задачи: {store.todos.length}</h2>
      {/* ... */}
    </div>
  ));
}
```

**Важно:**
- Компонент **автоматически** обновляется при изменении используемых observable-полей
- Обновляются **только** компоненты, которые читают изменённые данные
- Никаких `setState` или `dispatch` не нужно

#### React Context для передачи store

```typescript
import React, { createContext, useContext } from 'react';

const TodoStoreContext = createContext<TodoStore | null>(null);

export const TodoStoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const store = new TodoStore();
  return (
    <TodoStoreContext.Provider value={store}>
      {children}
    </TodoStoreContext.Provider>
  );
};

export const useTodoStore = () => {
  const store = useContext(TodoStoreContext);
  if (!store) {
    throw new Error('useTodoStore must be used within TodoStoreProvider');
  }
  return store;
};

// Использование в компоненте
const TodoApp = observer(() => {
  const store = useTodoStore();
  return <div>{store.todos.length} задач</div>;
});
```

### Async Actions (Асинхронные действия)

#### runInAction для обновления после async/await

```typescript
import { runInAction, makeAutoObservable } from 'mobx';

class UserStore {
  users: User[] = [];
  loading = false;
  error: string | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  async fetchUsers() {
    this.loading = true;
    this.error = null;

    try {
      const response = await fetch('/api/users');
      const data = await response.json();

      runInAction(() => {
        this.users = data;
        this.loading = false;
      });
    } catch (err) {
      runInAction(() => {
        this.error = err instanceof Error ? err.message : 'Unknown error';
        this.loading = false;
      });
    }
  }
}
```

**Почему runInAction?**
- Код после `await` выполняется **вне** action
- `runInAction` оборачивает обновления в action
- Альтернатива — использовать `flow` (генераторы)

#### flow — альтернатива async/await

```typescript
import { flow, makeAutoObservable } from 'mobx';

class UserStore {
  users: User[] = [];
  loading = false;

  constructor() {
    makeAutoObservable(this, {
      fetchUsers: flow, // Указываем, что это flow
    });
  }

  *fetchUsers() { // Генератор
    this.loading = true;
    try {
      const response = yield fetch('/api/users');
      const data = yield response.json();
      this.users = data;
    } catch (err) {
      console.error(err);
    } finally {
      this.loading = false;
    }
  }
}

// Использование
store.fetchUsers(); // Вызывается как обычная функция
```

**flow vs runInAction:**
- `flow` — не нужны `runInAction`-обёртки
- `runInAction` — привычный async/await синтаксис
- Выбирайте, что удобнее

### Reactions (Реакции)

Reactions — код, который выполняется **автоматически** при изменении observable:

```typescript
import { reaction, autorun, when } from 'mobx';

class LogStore {
  logs: string[] = [];

  constructor() {
    makeAutoObservable(this);

    // autorun — выполняется сразу и при каждом изменении
    autorun(() => {
      console.log(`Всего логов: ${this.logs.length}`);
    });

    // reaction — выполняется только при изменении отслеживаемого значения
    reaction(
      () => this.logs.length,
      (length) => {
        if (length > 100) {
          console.warn('Слишком много логов!');
        }
      }
    );

    // when — выполняется один раз, когда условие станет true
    when(
      () => this.logs.length >= 10,
      () => {
        console.log('Достигнуто 10 логов');
      }
    );
  }

  addLog(message: string) {
    this.logs.push(message);
  }
}
```

**Когда использовать reactions:**
- Синхронизация с localStorage
- Логирование
- Аналитика
- Автосохранение

---

## Zustand: Минималистичное решение {#zustand}

### Философия Zustand

Zustand (нем. "состояние") — **минималистичная** библиотека управления состоянием:

- **Простой API** — один хук `create`
- **Без провайдеров** — состояние вне React-дерева
- **TypeScript-first** — отличная типизация из коробки
- **Middleware** — расширяемость через плагины

### Создание Store

```typescript
import { create } from 'zustand';

interface BearStore {
  bears: number;
  increase: () => void;
  decrease: () => void;
  reset: () => void;
}

const useBearStore = create<BearStore>((set) => ({
  bears: 0,
  increase: () => set((state) => ({ bears: state.bears + 1 })),
  decrease: () => set((state) => ({ bears: state.bears - 1 })),
  reset: () => set({ bears: 0 }),
}));

// Использование в компоненте
function BearCounter() {
  const bears = useBearStore((state) => state.bears);
  const increase = useBearStore((state) => state.increase);

  return (
    <div>
      <h1>{bears} медведей</h1>
      <button onClick={increase}>Добавить</button>
    </div>
  );
}
```

**Что происходит:**
- `create` создаёт хук для доступа к состоянию
- `set` — функция для обновления состояния
- Селектор `(state) => state.bears` — компонент подписывается только на `bears`

### Selectors (Селекторы)

#### Базовые селекторы

```typescript
interface TodoStore {
  todos: Todo[];
  addTodo: (text: string) => void;
  toggleTodo: (id: number) => void;
}

const useTodoStore = create<TodoStore>((set) => ({
  todos: [],
  addTodo: (text) => set((state) => ({
    todos: [...state.todos, { id: Date.now(), text, done: false }]
  })),
  toggleTodo: (id) => set((state) => ({
    todos: state.todos.map(t =>
      t.id === id ? { ...t, done: !t.done } : t
    )
  })),
}));

// Компонент подписывается только на todos
function TodoList() {
  const todos = useTodoStore((state) => state.todos);

  return (
    <div>
      {todos.map(todo => (
        <TodoItem key={todo.id} todo={todo} />
      ))}
    </div>
  );
}

// Компонент подписывается только на addTodo
function AddTodoForm() {
  const addTodo = useTodoStore((state) => state.addTodo);
  const [text, setText] = useState('');

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      addTodo(text);
      setText('');
    }}>
      <input value={text} onChange={e => setText(e.target.value)} />
      <button type="submit">Добавить</button>
    </form>
  );
}
```

#### Computed Selectors

```typescript
interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
}

const useCartStore = create<CartStore>((set) => ({
  items: [],
  addItem: (item) => set((state) => ({
    items: [...state.items, item]
  })),
}));

// Вычисляемые значения через селекторы
function CartSummary() {
  const total = useCartStore((state) =>
    state.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  );

  const itemCount = useCartStore((state) =>
    state.items.reduce((sum, item) => sum + item.quantity, 0)
  );

  return (
    <div>
      <p>Товаров: {itemCount}</p>
      <p>Итого: {total} ₽</p>
    </div>
  );
}
```

**Проблема:** селектор пересчитывается при каждом рендере

**Решение:** используйте `shallow` или `useShallow`

```typescript
import { shallow } from 'zustand/shallow';

function CartSummary() {
  const { total, itemCount } = useCartStore(
    (state) => ({
      total: state.items.reduce((sum, item) => sum + item.price * item.quantity, 0),
      itemCount: state.items.reduce((sum, item) => sum + item.quantity, 0),
    }),
    shallow // Сравнивает объект по значениям, а не по ссылке
  );

  return (
    <div>
      <p>Товаров: {itemCount}</p>
      <p>Итого: {total} ₽</p>
    </div>
  );
}
```

### Async Actions

```typescript
interface UserStore {
  users: User[];
  loading: boolean;
  error: string | null;
  fetchUsers: () => Promise<void>;
}

const useUserStore = create<UserStore>((set) => ({
  users: [],
  loading: false,
  error: null,

  fetchUsers: async () => {
    set({ loading: true, error: null });

    try {
      const response = await fetch('/api/users');
      const users = await response.json();
      set({ users, loading: false });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Unknown error',
        loading: false
      });
    }
  },
}));

// Использование
function UserList() {
  const { users, loading, error, fetchUsers } = useUserStore();

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  if (loading) return <div>Загрузка...</div>;
  if (error) return <div>Ошибка: {error}</div>;

  return (
    <div>
      {users.map(user => (
        <div key={user.id}>{user.name}</div>
      ))}
    </div>
  );
}
```

### Middleware

Zustand поддерживает middleware для расширения функциональности.

#### persist — сохранение в localStorage

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsStore {
  theme: 'light' | 'dark';
  language: string;
  setTheme: (theme: 'light' | 'dark') => void;
  setLanguage: (lang: string) => void;
}

const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      theme: 'light',
      language: 'ru',
      setTheme: (theme) => set({ theme }),
      setLanguage: (language) => set({ language }),
    }),
    {
      name: 'app-settings', // Ключ в localStorage
    }
  )
);
```

**Что происходит:**
- При изменении состояния — автосохранение в `localStorage`
- При загрузке страницы — автоматическое восстановление
- Поддержка сериализации/десериализации

#### immer — удобные мутации

```typescript
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

interface TodoStore {
  todos: Todo[];
  addTodo: (text: string) => void;
  toggleTodo: (id: number) => void;
}

const useTodoStore = create<TodoStore>()(
  immer((set) => ({
    todos: [],

    addTodo: (text) => set((state) => {
      // Можно напрямую мутировать state!
      state.todos.push({
        id: Date.now(),
        text,
        done: false,
      });
    }),

    toggleTodo: (id) => set((state) => {
      const todo = state.todos.find(t => t.id === id);
      if (todo) {
        todo.done = !todo.done;
      }
    }),
  }))
);
```

**Преимущества immer:**
- Пишете код как с обычными мутациями
- Под капотом — immutable обновления
- Проще работать со сложными структурами

#### devtools — интеграция с Redux DevTools

```typescript
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

const useCounterStore = create<CounterStore>()(
  devtools(
    (set) => ({
      count: 0,
      increase: () => set((state) => ({ count: state.count + 1 }), false, 'increase'),
      decrease: () => set((state) => ({ count: state.count - 1 }), false, 'decrease'),
    }),
    { name: 'CounterStore' }
  )
);
```

**Возможности:**
- Просмотр истории изменений
- Time-travel debugging
- Экспорт/импорт состояния

#### Комбинирование middleware

```typescript
const useStore = create<Store>()(
  devtools(
    persist(
      immer((set) => ({
        // ... ваш store
      })),
      { name: 'my-store' }
    ),
    { name: 'MyStore' }
  )
);
```

---

## Сравнение и выбор подхода {#сравнение}

### MobX vs Zustand

| Критерий | MobX | Zustand |
|----------|------|---------|
| **Размер** | ~16 KB | ~1 KB |
| **Философия** | ООП, классы, декораторы | Функциональный, хуки |
| **Кривая обучения** | Средняя | Низкая |
| **TypeScript** | Хорошая поддержка | Отличная поддержка |
| **DevTools** | Через mobx-react-devtools | Redux DevTools |
| **Производительность** | Отличная (автоматическая оптимизация) | Отличная (селекторы) |
| **Мутации** | Разрешены (в actions) | Через immer middleware |
| **Computed** | Встроенные (getters) | Вручную (селекторы) |
| **Async** | runInAction / flow | Обычный async/await |

### Когда использовать MobX

**Используйте MobX, если:**
- Сложная бизнес-логика
- Много computed values
- ООП-стиль ближе команде
- Нужны автоматические реакции
- Есть опыт с наблюдателями (RxJS, Vue)

**Пример:** CRM-система с множеством связанных сущностей

```typescript
class CRMStore {
  clients: Client[] = [];
  deals: Deal[] = [];
  tasks: Task[] = [];

  constructor() {
    makeAutoObservable(this);
  }

  get activeDeals() {
    return this.deals.filter(d => d.status === 'active');
  }

  get totalRevenue() {
    return this.deals
      .filter(d => d.status === 'closed')
      .reduce((sum, d) => sum + d.amount, 0);
  }

  get clientsWithActiveDeals() {
    const activeDealClientIds = new Set(
      this.activeDeals.map(d => d.clientId)
    );
    return this.clients.filter(c => activeDealClientIds.has(c.id));
  }
}
```

### Когда использовать Zustand

**Используйте Zustand, если:**
- Нужна простота и минимализм
- UI-состояние (модалки, формы, фильтры)
- Команда предпочитает функциональный стиль
- Важен размер бандла
- Нужна интеграция с Redux DevTools

**Пример:** UI-состояние приложения

```typescript
interface UIStore {
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  currentModal: string | null;
  toggleSidebar: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  openModal: (modal: string) => void;
  closeModal: () => void;
}

const useUIStore = create<UIStore>((set) => ({
  sidebarOpen: false,
  theme: 'light',
  currentModal: null,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setTheme: (theme) => set({ theme }),
  openModal: (modal) => set({ currentModal: modal }),
  closeModal: () => set({ currentModal: null }),
}));
```

### Комбинирование подходов

Можно использовать **оба** решения в одном приложении:

```typescript
// MobX для бизнес-логики
class ProductStore {
  products: Product[] = [];

  constructor() {
    makeAutoObservable(this);
  }

  get categorizedProducts() {
    return groupBy(this.products, 'category');
  }

  async fetchProducts() {
    const data = await api.getProducts();
    runInAction(() => {
      this.products = data;
    });
  }
}

// Zustand для UI-состояния
const useUIStore = create<UIStore>((set) => ({
  selectedCategory: null,
  sortBy: 'name',
  setCategory: (category) => set({ selectedCategory: category }),
  setSortBy: (sortBy) => set({ sortBy }),
}));

// Компонент использует оба
const ProductList = observer(() => {
  const productStore = useProductStore();
  const { selectedCategory, sortBy } = useUIStore();

  const products = productStore.categorizedProducts[selectedCategory] || [];
  const sorted = sortProducts(products, sortBy);

  return (
    <div>
      {sorted.map(p => <ProductCard key={p.id} product={p} />)}
    </div>
  );
});
```

---

## Интеграция с TypeScript {#typescript}

### MobX + TypeScript

#### Типизация store

```typescript
interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

class TodoStore {
  todos: Todo[] = [];
  filter: 'all' | 'active' | 'completed' = 'all';

  constructor() {
    makeAutoObservable(this);
  }

  get filteredTodos(): Todo[] {
    switch (this.filter) {
      case 'active':
        return this.todos.filter(t => !t.completed);
      case 'completed':
        return this.todos.filter(t => t.completed);
      default:
        return this.todos;
    }
  }

  addTodo(text: string): void {
    this.todos.push({
      id: Date.now(),
      text,
      completed: false,
    });
  }

  toggleTodo(id: number): void {
    const todo = this.todos.find(t => t.id === id);
    if (todo) {
      todo.completed = !todo.completed;
    }
  }

  setFilter(filter: 'all' | 'active' | 'completed'): void {
    this.filter = filter;
  }
}
```

#### Типизация React-компонентов

```typescript
interface TodoListProps {
  store: TodoStore;
}

const TodoList: React.FC<TodoListProps> = observer(({ store }) => {
  return (
    <div>
      {store.filteredTodos.map(todo => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggle={() => store.toggleTodo(todo.id)}
        />
      ))}
    </div>
  );
});
```

### Zustand + TypeScript

#### Полная типизация store

```typescript
interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  clear: () => void;
  total: () => number;
}

const useCartStore = create<CartStore>((set, get) => ({
  items: [],

  addItem: (item) => set((state) => {
    const existing = state.items.find(i => i.id === item.id);
    if (existing) {
      return {
        items: state.items.map(i =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        )
      };
    }
    return {
      items: [...state.items, { ...item, quantity: 1 }]
    };
  }),

  removeItem: (id) => set((state) => ({
    items: state.items.filter(i => i.id !== id)
  })),

  updateQuantity: (id, quantity) => set((state) => ({
    items: state.items.map(i =>
      i.id === id ? { ...i, quantity } : i
    )
  })),

  clear: () => set({ items: [] }),

  total: () => {
    return get().items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
  },
}));
```

#### Типизация селекторов

```typescript
// Хорошо: типизированный селектор
const items = useCartStore((state: CartStore) => state.items);

// Ещё лучше: создайте типизированные селекторы
const useCartItems = () => useCartStore((state) => state.items);
const useCartTotal = () => useCartStore((state) => state.total());
const useAddToCart = () => useCartStore((state) => state.addItem);

// Использование
function Cart() {
  const items = useCartItems();
  const total = useCartTotal();
  const addToCart = useAddToCart();

  return (
    <div>
      <p>Товаров: {items.length}</p>
      <p>Итого: {total} ₽</p>
    </div>
  );
}
```

---

## Продвинутые паттерны {#advanced}

### MobX: Модульная архитектура

```typescript
// stores/RootStore.ts
class RootStore {
  userStore: UserStore;
  todoStore: TodoStore;
  uiStore: UIStore;

  constructor() {
    this.userStore = new UserStore(this);
    this.todoStore = new TodoStore(this);
    this.uiStore = new UIStore(this);
  }
}

// stores/TodoStore.ts
class TodoStore {
  rootStore: RootStore;
  todos: Todo[] = [];

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
  }

  async fetchTodos() {
    // Можем обращаться к другим store
    const userId = this.rootStore.userStore.currentUserId;
    const data = await api.getTodos(userId);
    runInAction(() => {
      this.todos = data;
    });
  }
}

// React Context
const RootStoreContext = createContext<RootStore | null>(null);

export const RootStoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const store = useMemo(() => new RootStore(), []);
  return (
    <RootStoreContext.Provider value={store}>
      {children}
    </RootStoreContext.Provider>
  );
};

export const useRootStore = () => {
  const store = useContext(RootStoreContext);
  if (!store) throw new Error('useRootStore must be used within RootStoreProvider');
  return store;
};

export const useTodoStore = () => useRootStore().todoStore;
export const useUserStore = () => useRootStore().userStore;
```

### Zustand: Slices паттерн

```typescript
// Разделение большого store на слайсы
interface UserSlice {
  user: User | null;
  setUser: (user: User) => void;
  logout: () => void;
}

interface TodoSlice {
  todos: Todo[];
  addTodo: (text: string) => void;
  removeTodo: (id: number) => void;
}

type Store = UserSlice & TodoSlice;

const createUserSlice: StateCreator<Store, [], [], UserSlice> = (set) => ({
  user: null,
  setUser: (user) => set({ user }),
  logout: () => set({ user: null }),
});

const createTodoSlice: StateCreator<Store, [], [], TodoSlice> = (set) => ({
  todos: [],
  addTodo: (text) => set((state) => ({
    todos: [...state.todos, { id: Date.now(), text, done: false }]
  })),
  removeTodo: (id) => set((state) => ({
    todos: state.todos.filter(t => t.id !== id)
  })),
});

const useStore = create<Store>()((...a) => ({
  ...createUserSlice(...a),
  ...createTodoSlice(...a),
}));
```

### Оптимизация ре-рендеров

#### MobX: автоматическая оптимизация

```typescript
const UserProfile = observer(({ userId }: { userId: number }) => {
  const store = useUserStore();
  const user = store.getUserById(userId);

  // Компонент обновится только при изменении полей,
  // которые используются в рендере
  return (
    <div>
      <h2>{user.name}</h2>
      <p>{user.email}</p>
    </div>
  );
});
```

#### Zustand: селекторы с shallow

```typescript
import { shallow } from 'zustand/shallow';

function UserProfile({ userId }: { userId: number }) {
  // Без shallow — ре-рендер при любом изменении store
  const user = useUserStore((state) => state.getUserById(userId));

  // С shallow — ре-рендер только при изменении { name, email }
  const { name, email } = useUserStore(
    (state) => {
      const user = state.getUserById(userId);
      return { name: user.name, email: user.email };
    },
    shallow
  );

  return (
    <div>
      <h2>{name}</h2>
      <p>{email}</p>
    </div>
  );
}
```

### Тестирование

#### MobX Store

```typescript
import { describe, it, expect } from 'vitest';

describe('TodoStore', () => {
  it('should add todo', () => {
    const store = new TodoStore();
    store.addTodo('Test');

    expect(store.todos.length).toBe(1);
    expect(store.todos[0].text).toBe('Test');
  });

  it('should compute completed count', () => {
    const store = new TodoStore();
    store.addTodo('Task 1');
    store.addTodo('Task 2');
    store.toggleTodo(store.todos[0].id);

    expect(store.completedCount).toBe(1);
  });
});
```

#### Zustand Store

```typescript
import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';

describe('useTodoStore', () => {
  it('should add todo', () => {
    const { result } = renderHook(() => useTodoStore());

    act(() => {
      result.current.addTodo('Test');
    });

    expect(result.current.todos.length).toBe(1);
    expect(result.current.todos[0].text).toBe('Test');
  });
});
```

---

## Best Practices {#best-practices}

### Общие рекомендации

1. **Не храните всё в глобальном состоянии**
   ```typescript
   // ❌ Плохо: форма в глобальном store
   const useAppStore = create((set) => ({
     loginFormEmail: '',
     loginFormPassword: '',
     setLoginFormEmail: (email: string) => set({ loginFormEmail: email }),
   }));

   // ✅ Хорошо: локальное состояние
   function LoginForm() {
     const [email, setEmail] = useState('');
     const [password, setPassword] = useState('');
     // ...
   }
   ```

2. **Разделяйте бизнес-логику и UI-состояние**
   ```typescript
   // MobX для данных и бизнес-логики
   class ProductStore { /* ... */ }

   // Zustand для UI
   const useUIStore = create((set) => ({
     sidebarOpen: false,
     currentTab: 'products',
   }));
   ```

3. **Избегайте излишней нормализации**
   ```typescript
   // ❌ Плохо: слишком нормализовано
   {
     users: { byId: { 1: { name: 'Alice' } }, allIds: [1] },
     posts: { byId: { 1: { userId: 1 } }, allIds: [1] },
   }

   // ✅ Хорошо: простая структура
   {
     users: [{ id: 1, name: 'Alice', posts: [...] }]
   }
   ```

### MobX Best Practices

1. **Всегда используйте actions**
   ```typescript
   // ❌ Плохо
   store.count++; // Прямая мутация

   // ✅ Хорошо
   store.increment(); // Через action
   ```

2. **Используйте computed для производных данных**
   ```typescript
   // ❌ Плохо
   const completedTodos = store.todos.filter(t => t.completed);

   // ✅ Хорошо
   get completedTodos() {
     return this.todos.filter(t => t.completed);
   }
   ```

3. **runInAction для async**
   ```typescript
   async fetchData() {
     const data = await api.getData();
     runInAction(() => {
       this.data = data; // Обязательно в runInAction!
     });
   }
   ```

### Zustand Best Practices

1. **Используйте селекторы**
   ```typescript
   // ❌ Плохо: подписка на весь store
   const store = useStore();

   // ✅ Хорошо: подписка на часть
   const count = useStore((state) => state.count);
   ```

2. **Immutable updates**
   ```typescript
   // ❌ Плохо
   set((state) => {
     state.items.push(newItem); // Мутация
     return state;
   });

   // ✅ Хорошо
   set((state) => ({
     items: [...state.items, newItem]
   }));
   ```

3. **Выносите селекторы**
   ```typescript
   // ✅ Переиспользуемые селекторы
   const selectUser = (state: AppStore) => state.user;
   const selectIsLoggedIn = (state: AppStore) => state.user !== null;

   // Использование
   const user = useAppStore(selectUser);
   const isLoggedIn = useAppStore(selectIsLoggedIn);
   ```

---

## Заключение

### Ключевые выводы

1. **MobX** — отличный выбор для:
   - Сложной бизнес-логики
   - Команд с ООП-бэкграундом
   - Приложений с множеством computed values

2. **Zustand** — идеален для:
   - Простых приложений
   - UI-состояния
   - Функционального стиля

3. **Комбинация** — используйте оба:
   - MobX для domain-логики
   - Zustand для UI-состояния

### Дальнейшее изучение

- **Документация MobX**: https://mobx.js.org
- **Документация Zustand**: https://github.com/pmndrs/zustand
- **MobX State Tree**: для более структурированного подхода
- **Jotai/Recoil**: атомарные state-менеджеры

### Практика

Лучший способ освоить — **практиковаться**:
1. Начните с простого Todo-приложения
2. Добавьте API-интеграцию
3. Реализуйте фильтры и сортировку
4. Добавьте персистентность (localStorage)
5. Оптимизируйте производительность

Успехов в управлении состоянием! 🚀

Отлично, продолжаем в том же стиле. Ниже — **LR4 (управление состоянием в React с MobX и Zustand)**, подробно, как для 9-классника, с пояснениями и примерами.

---

# **LR4. Управление состоянием (MobX и Zustand)**

## 1. Зачем вообще нужен state management

### Проблема

В React у каждого компонента есть **state** (данные, которые могут меняться).

Если проект маленький — можно передавать данные через **props** от родителя к дочерним компонентам.

Но что если:

* компонент A хочет данные из компонента Z,
* между ними 5–10 промежуточных компонентов?

❌ Передавать через props на каждый уровень — **prop drilling** (очень неудобно).

---

### Решение

**Хранилище состояния (store)** — централизованное место, где хранятся общие данные.

Плюсы:

* данные в одном месте;
* любой компонент может их использовать;
* проще менять и тестировать.

---

## 2. MobX — реактивное хранилище

### Основная идея

MobX **следит за данными**, и как только они меняются, React **перерисовывает компоненты автоматически**.

---

### Основные элементы MobX

1. **observable** — данные, за которыми следим

```ts
import { makeAutoObservable } from "mobx";

class TodoStore {
  todos: string[] = [];

  constructor() {
    makeAutoObservable(this); // делает свойства реактивными
  }

  addTodo(todo: string) {
    this.todos.push(todo);
  }
}
```

* `todos` — наблюдаемое;
* любые изменения автоматически «ловятся» React.

---

2. **action** — методы, которые меняют данные

```ts
addTodo(todo: string) {
  this.todos.push(todo);
}
```

* Любое изменение состояния должно быть через action.

---

3. **computed** — вычисляемые значения

```ts
get todosCount() {
  return this.todos.length;
}
```

* React автоматически пересчитает это значение при изменении `todos`.

---

### Использование в компоненте

```tsx
import { observer } from "mobx-react-lite";

const TodoList = observer(({ store }: { store: TodoStore }) => (
  <ul>
    {store.todos.map((t, i) => <li key={i}>{t}</li>)}
  </ul>
));
```

* `observer` — делает компонент реактивным к изменениям store.

---

### Пример

```ts
const store = new TodoStore();
store.addTodo("Сделать лабораторную");
```

Компонент TodoList автоматически покажет новую задачу.

---

## 3. Zustand — минималистичное хранилище

### Идея

Zustand проще MobX:

* нет decorator’ов;
* нет observer;
* меньше кода.

---

### Создание store

```ts
import { create } from "zustand";

type State = {
  todos: string[];
  addTodo: (todo: string) => void;
};

const useTodoStore = create<State>((set) => ({
  todos: [],
  addTodo: (todo) => set((state) => ({ todos: [...state.todos, todo] }))
}));
```

---

### Использование в компоненте

```tsx
const TodoList = () => {
  const todos = useTodoStore((state) => state.todos);
  const addTodo = useTodoStore((state) => state.addTodo);

  return (
    <>
      <button onClick={() => addTodo("Новая задача")}>Добавить</button>
      <ul>
        {todos.map((t, i) => <li key={i}>{t}</li>)}
      </ul>
    </>
  );
};
```

* `useTodoStore` возвращает состояние и функции изменения.
* React **сам подписывается на изменения**.

---

## 4. MobX vs Zustand

| Особенность  | MobX                      | Zustand         |
| ------------ | ------------------------- | --------------- |
| Реактивность | Автоматическая (observer) | Через селекторы |
| Сложность    | Средняя / высокая         | Низкая          |
| Кол-во кода  | Больше                    | Меньше          |
| Подходит     | Большие проекты           | Малые и средние |

---

## 5. Контекст + useState

* Перед тем как брать MobX/Zustand, можно использовать **Context + useState**.
* Подходит для маленьких проектов.
* Например, тема сайта (светлая/тёмная) или авторизация.

---

## 6. Главные принципы LR4

1. Общие данные — **в одном месте**.
2. Менять данные только через **методы store**.
3. Компоненты **реагируют на изменения автоматически**.
4. Малые проекты → Context + useState;
   средние/большие → MobX или Zustand.

---

## 7. Типичные ошибки студентов

❌ Менять state напрямую без action
❌ Использовать props вместо store для глобальных данных
❌ Создавать один большой store на всё подряд
❌ Не подписывать компонент на изменения (observer/Zustand selector)

---

## 8. Краткая формула

> **State management = централизованное хранилище + реактивные компоненты + методы изменения данных**

---

Если хочешь, следующим шагом могу сделать **LR5 (Продвинутые паттерны React + API)** в том же стиле.
# Полное руководство: React паттерны, оптимизация и работа с API

## Содержание
1. [Введение](#введение)
2. [Обзор React паттернов](#паттерны)
   - [Custom Hooks](#custom-hooks)
   - [Compound Components](#compound-components)
   - [Render Props](#render-props)
   - [Context API](#context-api)
3. [Error Boundaries](#error-boundaries)
4. [Оптимизация производительности](#оптимизация)
   - [React.memo](#react-memo)
   - [useMemo](#usememo)
   - [useCallback](#usecallback)
   - [Профилирование](#профилирование)
5. [Работа с API через React Query](#react-query)
6. [OpenAPI и кодогенерация](#openapi)
7. [Best Practices](#best-practices)

---

## Введение {#введение}

### О чём эта лекция

Эта лекция — **повторение и углубление** пройденного материала + **новые важные темы**:

1. **Обзор паттернов** — быстрое повторение Custom Hooks, Compound Components, Render Props, Context из LR2
2. **Error Boundaries** — профессиональная обработка ошибок в React
3. **Оптимизация** — когда и как использовать memo, useMemo, useCallback
4. **React Query** — современный стандарт работы с API

### Для кого эта лекция

✅ Вы прошли LR2 (React + TypeScript)
✅ Знаете основные хуки (useState, useEffect, useContext)
✅ Понимаете TypeScript базово

---

## Обзор React паттернов {#паттерны}

> 📝 **Примечание**: Эти паттерны подробно разбирались в LR2. Здесь — краткое повторение.

### Таблица сравнения паттернов

| Паттерн | Что решает | Когда использовать | Пример |
|---------|------------|-------------------|--------|
| **Custom Hooks** | Переиспользование stateful логики | Любая логика с состоянием | `useToggle`, `useDebounce` |
| **Compound Components** | Гибкие составные UI | Сложные компоненты с частями | `<Tabs>`, `<Accordion>` |
| **Render Props** | Разделение логики и UI | Разный UI с одной логикой | DataFetcher, MouseTracker |
| **Context API** | Избегание prop drilling | Глобальное состояние | Theme, Auth, Language |

---

### Custom Hooks {#custom-hooks}

**Быстрое напоминание**: Custom Hooks — это функции, начинающиеся с `use`, которые используют встроенные хуки React.

#### Пример: useToggle

```typescript
import { useState, useCallback } from 'react';

function useToggle(initialValue: boolean = false) {
  const [value, setValue] = useState(initialValue);

  const toggle = useCallback(() => {
    setValue(v => !v);
  }, []);

  const setTrue = useCallback(() => setValue(true), []);
  const setFalse = useCallback(() => setValue(false), []);

  return { value, toggle, setTrue, setFalse };
}

// Использование
function Modal() {
  const { value: isOpen, toggle, setTrue } = useToggle(false);

  return (
    <>
      <button onClick={setTrue}>Open Modal</button>
      {isOpen && (
        <div className="modal">
          <h2>Modal Title</h2>
          <button onClick={toggle}>Close</button>
        </div>
      )}
    </>
  );
}
```

**Когда создавать Custom Hook:**
- Логика используется в нескольких компонентах
- Есть состояние + эффекты + функции
- Хотите изолировать сложную логику

---

### Compound Components {#compound-components}

**Быстрое напоминание**: Компоненты, которые работают вместе через общий Context.

#### Пример: Card

```typescript
import { createContext, useContext, ReactNode } from 'react';

// Простой вариант без Context (для статичных компонентов)
interface CardProps {
  children: ReactNode;
}

function Card({ children }: CardProps) {
  return <div className="card">{children}</div>;
}

const CardHeader = ({ children }: { children: ReactNode }) => (
  <div className="card-header">{children}</div>
);

const CardBody = ({ children }: { children: ReactNode }) => (
  <div className="card-body">{children}</div>
);

const CardFooter = ({ children }: { children: ReactNode }) => (
  <div className="card-footer">{children}</div>
);

// Attach compound components
Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;

// Использование
function UserProfile() {
  return (
    <Card>
      <Card.Header>
        <h2>John Doe</h2>
      </Card.Header>
      <Card.Body>
        <p>Frontend Developer</p>
        <p>john@example.com</p>
      </Card.Body>
      <Card.Footer>
        <button>Edit Profile</button>
      </Card.Footer>
    </Card>
  );
}
```

**Когда использовать:**
- Компонент состоит из нескольких логических частей
- Нужна гибкость в композиции
- Хотите красивый API

---

### Render Props {#render-props}

**Быстрое напоминание**: Паттерн передачи функции через props для рендера.

#### Пример: DataFetcher

```typescript
import { useState, useEffect, ReactNode } from 'react';

interface DataFetcherProps<T> {
  url: string;
  children: (data: T | null, loading: boolean, error: string | null) => ReactNode;
}

function DataFetcher<T>({ url, children }: DataFetcherProps<T>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(url)
      .then(res => res.json())
      .then(data => {
        setData(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [url]);

  return <>{children(data, loading, error)}</>;
}

// Использование
interface User {
  id: number;
  name: string;
  email: string;
}

function UserProfile({ userId }: { userId: number }) {
  return (
    <DataFetcher<User> url={`/api/users/${userId}`}>
      {(user, loading, error) => {
        if (loading) return <div>Loading...</div>;
        if (error) return <div>Error: {error}</div>;
        if (!user) return <div>No user found</div>;

        return (
          <div>
            <h2>{user.name}</h2>
            <p>{user.email}</p>
          </div>
        );
      }}
    </DataFetcher>
  );
}
```

**Render Props vs Custom Hooks:**
- Render Props: разный UI с одной логикой
- Custom Hooks: переиспользование логики (современный подход)

---

### Context API {#context-api}

**Быстрое напоминание**: Способ передать данные через дерево компонентов без prop drilling.

#### Пример: Theme Context

```typescript
import { createContext, useContext, useState, ReactNode } from 'react';

interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Custom hook для использования контекста
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}

// Использование
function Header() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className={theme}>
      <h1>My App</h1>
      <button onClick={toggleTheme}>
        Switch to {theme === 'light' ? 'dark' : 'light'}
      </button>
    </header>
  );
}

function App() {
  return (
    <ThemeProvider>
      <Header />
    </ThemeProvider>
  );
}
```

**Когда использовать Context:**
- Данные нужны в многих компонентах на разных уровнях
- Хотите избежать prop drilling
- Глобальное состояние (theme, auth, language)

**⚠️ Когда НЕ использовать:**
- Для передачи через 1-2 уровня (просто используйте props)
- Для частообновляемых данных (будет много ре-рендеров)

---

## Error Boundaries {#error-boundaries}

### Проблема

В React ошибка в одном компоненте **крашит всё приложение**:

```typescript
function BuggyComponent() {
  throw new Error('Oops! Something went wrong');
  return <div>This will never render</div>;
}

function App() {
  return (
    <div>
      <h1>My App</h1>
      <BuggyComponent /> {/* Весь App упадёт! */}
    </div>
  );
}
```

**Результат**: Белый экран смерти (WSOD) 💀

### Решение: Error Boundaries

**Error Boundary** — это React-компонент, который ловит ошибки в дочерних компонентах и показывает fallback UI.

### Создание Error Boundary

```typescript
import React, { Component, ReactNode, ErrorInfo } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  // Вызывается при ошибке - обновляет state
  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  // Вызывается после отлова ошибки - для логирования
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);

    // Здесь можно отправить ошибку в сервис мониторинга
    // logErrorToService(error, errorInfo);
  }

  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render() {
    if (this.state.hasError) {
      // Fallback UI
      return (
        this.props.fallback || (
          <div style={{ padding: '20px', border: '1px solid red' }}>
            <h2>⚠️ Something went wrong</h2>
            <details style={{ whiteSpace: 'pre-wrap' }}>
              {this.state.error?.toString()}
            </details>
            <button onClick={this.resetError}>Try again</button>
          </div>
        )
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
```

### Использование

```typescript
function App() {
  return (
    <div>
      <h1>My App</h1>

      {/* Весь App защищён */}
      <ErrorBoundary>
        <Header />
        <MainContent />
        <Footer />
      </ErrorBoundary>

      {/* Или защитить только часть */}
      <div>
        <Sidebar />
        <ErrorBoundary fallback={<div>Widget failed to load</div>}>
          <ComplexWidget />
        </ErrorBoundary>
      </div>
    </div>
  );
}
```

### Что НЕ ловит Error Boundary

❌ **Не ловит:**
- Ошибки в обработчиках событий (onClick, onChange)
- Асинхронный код (setTimeout, fetch)
- Ошибки в самом Error Boundary
- SSR (серверный рендеринг)

✅ **Ловит:**
- Ошибки при рендере
- Ошибки в методах жизненного цикла
- Ошибки в конструкторах

### Обработка ошибок в обработчиках событий

```typescript
function MyComponent() {
  const handleClick = () => {
    try {
      // Опасный код
      dangerousOperation();
    } catch (error) {
      console.error('Error in event handler:', error);
      // Показать уведомление пользователю
    }
  };

  return <button onClick={handleClick}>Click me</button>;
}
```

### Множественные Error Boundaries

```typescript
function App() {
  return (
    <ErrorBoundary fallback={<div>App failed</div>}>
      <Header />

      <main>
        <ErrorBoundary fallback={<div>Sidebar failed</div>}>
          <Sidebar />
        </ErrorBoundary>

        <ErrorBoundary fallback={<div>Content failed</div>}>
          <Content />
        </ErrorBoundary>
      </main>

      <Footer />
    </ErrorBoundary>
  );
}
```

**Преимущества:**
- Более детальная обработка
- Часть UI может работать при ошибке в другой части
- Лучший UX

### Интеграция с логированием

```typescript
class ErrorBoundary extends Component<Props, State> {
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Отправка в Sentry
    // Sentry.captureException(error, { extra: errorInfo });

    // Или свой backend
    fetch('/api/log-error', {
      method: 'POST',
      body: JSON.stringify({
        error: error.toString(),
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
      }),
    });
  }
}
```

### Best Practices

1. **Размещайте Error Boundaries стратегически**
   - На уровне layout (для всего приложения)
   - На уровне роутов (для каждой страницы)
   - Вокруг сложных виджетов

2. **Хороший fallback UI**
   ```typescript
   <ErrorBoundary fallback={
     <div>
       <h2>Oops! Something went wrong</h2>
       <p>We're working on fixing this issue.</p>
       <button onClick={() => window.location.reload()}>
         Reload page
       </button>
     </div>
   } />
   ```

3. **Логирование в production**
   - Всегда логируйте ошибки
   - Используйте сервисы мониторинга (Sentry, LogRocket)

4. **Не используйте для flow control**
   ```typescript
   // ❌ Плохо
   <ErrorBoundary fallback={<LoginPage />}>
     <PrivateRoute />
   </ErrorBoundary>

   // ✅ Хорошо
   {isAuthenticated ? <PrivateRoute /> : <LoginPage />}
   ```

---

## Оптимизация производительности {#оптимизация}

### Проблемы производительности

**Основная проблема React**: Лишние ре-рендеры

```typescript
function Parent() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <button onClick={() => setCount(c => c + 1)}>
        Count: {count}
      </button>
      <ExpensiveChild />  {/* Ре-рендерится при каждом клике! */}
    </div>
  );
}
```

### Как найти проблемы

**React DevTools Profiler:**

1. Откройте React DevTools
2. Перейдите во вкладку "Profiler"
3. Нажмите "Start profiling"
4. Взаимодействуйте с приложением
5. Нажмите "Stop profiling"
6. Смотрите flame chart

**Что искать:**
- Компоненты, которые рендерятся часто
- Компоненты с долгим временем рендера
- Компоненты, которые рендерятся без изменений props

---

### React.memo {#react-memo}

**React.memo** — это HOC, который мемоизирует компонент и пропускает ре-рендер, если props не изменились.

#### Базовое использование

```typescript
import { memo } from 'react';

interface Props {
  name: string;
  age: number;
}

// Без memo - ре-рендерится всегда
function UserCard({ name, age }: Props) {
  console.log('UserCard rendered');
  return (
    <div>
      <h2>{name}</h2>
      <p>Age: {age}</p>
    </div>
  );
}

// С memo - ре-рендерится только при изменении props
const UserCardMemo = memo(UserCard);

export default UserCardMemo;
```

#### Кастомное сравнение

```typescript
interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
}

const ProductCard = memo(
  ({ product }: { product: Product }) => {
    console.log('ProductCard rendered');
    return (
      <div>
        <h3>{product.name}</h3>
        <p>${product.price}</p>
      </div>
    );
  },
  // Кастомная функция сравнения
  (prevProps, nextProps) => {
    // Возвращаем true, если пропсы равны (НЕ нужен ре-рендер)
    return (
      prevProps.product.id === nextProps.product.id &&
      prevProps.product.name === nextProps.product.name &&
      prevProps.product.price === nextProps.product.price
    );
  }
);
```

#### Когда использовать React.memo

✅ **Используйте если:**
- Компонент рендерится часто с одинаковыми props
- Компонент дорогой в рендере (сложные вычисления, большой DOM)
- Компонент в списке

❌ **Не используйте если:**
- Props меняются при каждом рендере
- Компонент простой и быстрый
- Нет проблем с производительностью

---

### useMemo {#usememo}

**useMemo** — хук для мемоизации **вычислений**.

#### Базовое использование

```typescript
import { useMemo, useState } from 'react';

interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
}

function ProductList({ products }: { products: Product[] }) {
  const [filter, setFilter] = useState('');

  // ❌ Без useMemo - фильтрация при каждом рендере
  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(filter.toLowerCase())
  );

  // ✅ С useMemo - фильтрация только при изменении products или filter
  const filteredMemo = useMemo(() => {
    console.log('Filtering products...');
    return products.filter(p =>
      p.name.toLowerCase().includes(filter.toLowerCase())
    );
  }, [products, filter]); // dependency array

  return (
    <div>
      <input
        value={filter}
        onChange={e => setFilter(e.target.value)}
        placeholder="Search..."
      />
      <div>
        {filteredMemo.map(product => (
          <div key={product.id}>{product.name}</div>
        ))}
      </div>
    </div>
  );
}
```

#### Дорогие вычисления

```typescript
function ExpensiveCalculation({ numbers }: { numbers: number[] }) {
  // Дорогая операция - мемоизируем
  const sum = useMemo(() => {
    console.log('Calculating sum...');
    return numbers.reduce((acc, n) => acc + n, 0);
  }, [numbers]);

  const average = useMemo(() => {
    console.log('Calculating average...');
    return sum / numbers.length;
  }, [sum, numbers.length]);

  return (
    <div>
      <p>Sum: {sum}</p>
      <p>Average: {average}</p>
    </div>
  );
}
```

#### Когда использовать useMemo

✅ **Используйте если:**
- Вычисления действительно дорогие (циклы, фильтрация больших массивов)
- Результат передаётся в компонент с React.memo
- Создание объектов/массивов для dependency arrays

❌ **Не используйте если:**
- Простые вычисления (сложение, умножение)
- Вычисления и так быстрые
- "На всякий случай"

**Правило:** Измерьте сначала, оптимизируйте потом!

---

### useCallback {#usecallback}

**useCallback** — хук для мемоизации **функций**.

#### Базовое использование

```typescript
import { useState, useCallback, memo } from 'react';

interface ItemProps {
  item: { id: number; name: string };
  onSelect: (id: number) => void;
}

// Мемоизированный компонент
const Item = memo(({ item, onSelect }: ItemProps) => {
  console.log('Item rendered:', item.name);
  return (
    <div onClick={() => onSelect(item.id)}>
      {item.name}
    </div>
  );
});

function ItemList() {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const items = [
    { id: 1, name: 'Item 1' },
    { id: 2, name: 'Item 2' },
    { id: 3, name: 'Item 3' },
  ];

  // ❌ Без useCallback - новая функция при каждом рендере
  // Item будет ре-рендериться всегда, даже с memo!
  const handleSelect = (id: number) => {
    setSelectedId(id);
  };

  // ✅ С useCallback - та же функция, если deps не изменились
  const handleSelectMemo = useCallback((id: number) => {
    setSelectedId(id);
  }, []); // нет зависимостей

  return (
    <div>
      {items.map(item => (
        <Item
          key={item.id}
          item={item}
          onSelect={handleSelectMemo}
        />
      ))}
    </div>
  );
}
```

#### useCallback с зависимостями

```typescript
function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filter, setFilter] = useState('all');

  // Функция зависит от filter
  const handleToggle = useCallback((id: number) => {
    setTodos(prev => prev.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));

    console.log('Current filter:', filter); // используем filter
  }, [filter]); // filter в dependencies

  return (
    <div>
      {todos.map(todo => (
        <TodoItem key={todo.id} todo={todo} onToggle={handleToggle} />
      ))}
    </div>
  );
}
```

#### useCallback vs useMemo

```typescript
// useCallback - мемоизирует функцию
const memoizedCallback = useCallback(() => {
  doSomething(a, b);
}, [a, b]);

// useMemo - мемоизирует результат
const memoizedValue = useMemo(() => {
  return computeExpensiveValue(a, b);
}, [a, b]);

// useCallback - это синтаксический сахар для useMemo
const memoizedCallback2 = useMemo(() => {
  return () => doSomething(a, b);
}, [a, b]);
```

#### Когда использовать useCallback

✅ **Используйте если:**
- Функция передаётся в мемоизированный компонент
- Функция в dependency array другого хука
- Оптимизируете производительность списков

❌ **Не используйте если:**
- Функция используется только внутри компонента
- Компонент и так быстрый
- Нет React.memo на дочерних компонентах

---

### Профилирование {#профилирование}

#### React DevTools Profiler

**Шаги:**

1. Установите [React DevTools](https://react.dev/learn/react-developer-tools)
2. Откройте вкладку "Profiler"
3. Нажмите "Start profiling" (🔴)
4. Взаимодействуйте с приложением
5. Нажмите "Stop profiling" (⏹️)
6. Анализируйте результаты

**Что смотреть:**

- **Flame Chart**: какие компоненты рендерятся и сколько времени тратят
- **Ranked Chart**: компоненты по времени рендера
- **Component renders**: сколько раз компонент рендерился

#### Профилирование в коде

```typescript
import { Profiler, ProfilerOnRenderCallback } from 'react';

const onRenderCallback: ProfilerOnRenderCallback = (
  id, // id Profiler
  phase, // "mount" или "update"
  actualDuration, // время рендера
  baseDuration, // оценочное время без мемоизации
  startTime, // когда React начал рендер
  commitTime, // когда React закоммитил
  interactions // Set of interactions
) => {
  console.log(`${id} ${phase} took ${actualDuration}ms`);
};

function App() {
  return (
    <Profiler id="App" onRender={onRenderCallback}>
      <Header />
      <Main />
      <Footer />
    </Profiler>
  );
}
```

#### Chrome Performance

1. Откройте DevTools → Performance
2. Нажмите "Record" (●)
3. Взаимодействуйте с приложением
4. Остановите запись
5. Анализируйте User Timing

**Смотрите на:**
- Долгие задачи (Long Tasks)
- Layout/Paint операции
- JavaScript execution time

### Чек-лист оптимизации

1. ✅ **Измерьте сначала** — используйте Profiler
2. ✅ **Оптимизируйте узкие места** — не оптимизируйте всё подряд
3. ✅ **React.memo** для компонентов с стабильными props
4. ✅ **useMemo** для дорогих вычислений
5. ✅ **useCallback** для функций в мемоизированных компонентах
6. ✅ **Профилируйте после** — убедитесь, что стало лучше

**❗ Помните:** Преждевременная оптимизация — корень всех зол!

---

## Работа с API через React Query {#react-query}

### Проблемы с обычным fetch

```typescript
function UserList() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch('/api/users')
      .then(res => res.json())
      .then(data => {
        setUsers(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // Много boilerplate, нет кэширования, нет ре-фетча...
}
```

**Проблемы:**
- ❌ Много boilerplate кода
- ❌ Нет кэширования
- ❌ Нет автоматического обновления
- ❌ Дублирование логики
- ❌ Сложная синхронизация

### Введение в React Query

**React Query (TanStack Query)** — мощная библиотека для работы с серверным состоянием.

**Преимущества:**
- ✅ Автоматическое кэширование
- ✅ Фоновое обновление
- ✅ Дедупликация запросов
- ✅ Optimistic updates
- ✅ Pagination, infinite scroll
- ✅ DevTools из коробки

### Установка

```bash
npm install @tanstack/react-query
# или
yarn add @tanstack/react-query
# или
pnpm add @tanstack/react-query
```

### Setup

```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// Создаём клиент
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 минут
      cacheTime: 1000 * 60 * 10, // 10 минут
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <YourApp />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

### useQuery - получение данных

```typescript
import { useQuery } from '@tanstack/react-query';

interface User {
  id: number;
  name: string;
  email: string;
}

// Функция для запроса
const fetchUsers = async (): Promise<User[]> => {
  const response = await fetch('/api/users');
  if (!response.ok) {
    throw new Error('Failed to fetch users');
  }
  return response.json();
};

function UserList() {
  const {
    data: users,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['users'], // уникальный ключ для кэша
    queryFn: fetchUsers,
  });

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error: {error.message}</div>;

  return (
    <div>
      <button onClick={() => refetch()}>Refresh</button>
      <ul>
        {users?.map(user => (
          <li key={user.id}>
            {user.name} - {user.email}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### queryKey - ключи кэша

```typescript
// Простой ключ
useQuery({ queryKey: ['users'], queryFn: fetchUsers });

// С параметрами
useQuery({
  queryKey: ['user', userId],
  queryFn: () => fetchUser(userId),
});

// С фильтрами
useQuery({
  queryKey: ['users', { role: 'admin', active: true }],
  queryFn: () => fetchUsers({ role: 'admin', active: true }),
});

// Иерархия ключей
useQuery({ queryKey: ['users'], ... });                    // все users
useQuery({ queryKey: ['users', 1], ... });                 // user с id 1
useQuery({ queryKey: ['users', 1, 'posts'], ... });        // posts user'а 1
```

### useMutation - изменение данных

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface CreateUserData {
  name: string;
  email: string;
}

const createUser = async (data: CreateUserData): Promise<User> => {
  const response = await fetch('/api/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to create user');
  return response.json();
};

function CreateUserForm() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: createUser,
    onSuccess: (newUser) => {
      // Инвалидировать кэш users - вызовет refetch
      queryClient.invalidateQueries({ queryKey: ['users'] });

      // Или обновить кэш напрямую
      queryClient.setQueryData<User[]>(['users'], (old) => {
        return old ? [...old, newUser] : [newUser];
      });
    },
    onError: (error) => {
      console.error('Error creating user:', error);
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    mutation.mutate({
      name: formData.get('name') as string,
      email: formData.get('email') as string,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" placeholder="Name" required />
      <input name="email" type="email" placeholder="Email" required />
      <button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? 'Creating...' : 'Create User'}
      </button>
      {mutation.isError && (
        <div style={{ color: 'red' }}>
          Error: {mutation.error.message}
        </div>
      )}
      {mutation.isSuccess && (
        <div style={{ color: 'green' }}>User created!</div>
      )}
    </form>
  );
}
```

### Оптимистичные обновления

```typescript
const mutation = useMutation({
  mutationFn: updateUser,
  onMutate: async (newUser) => {
    // Отменить текущие refetch'и
    await queryClient.cancelQueries({ queryKey: ['users'] });

    // Snapshot предыдущего значения
    const previousUsers = queryClient.getQueryData<User[]>(['users']);

    // Оптимистично обновить
    queryClient.setQueryData<User[]>(['users'], (old) => {
      return old?.map(user =>
        user.id === newUser.id ? { ...user, ...newUser } : user
      );
    });

    // Вернуть context для rollback
    return { previousUsers };
  },
  onError: (err, newUser, context) => {
    // Rollback при ошибке
    queryClient.setQueryData(['users'], context?.previousUsers);
  },
  onSettled: () => {
    // Всегда refetch после завершения
    queryClient.invalidateQueries({ queryKey: ['users'] });
  },
});
```

### Интеграция с Error Boundaries

```typescript
import { QueryErrorResetBoundary } from '@tanstack/react-query';
import { ErrorBoundary } from 'react-error-boundary';

function App() {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary
          onReset={reset}
          fallbackRender={({ error, resetErrorBoundary }) => (
            <div>
              <h2>Something went wrong:</h2>
              <pre>{error.message}</pre>
              <button onClick={resetErrorBoundary}>Try again</button>
            </div>
          )}
        >
          <YourApp />
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  );
}
```

### Best Practices

1. **Хорошие queryKey**
   ```typescript
   // ❌ Плохо
   useQuery({ queryKey: ['data'], ... });

   // ✅ Хорошо
   useQuery({ queryKey: ['users', { status: 'active' }], ... });
   ```

2. **Централизованные query functions**
   ```typescript
   // api/users.ts
   export const usersApi = {
     getAll: () => fetch('/api/users').then(r => r.json()),
     getOne: (id: number) => fetch(`/api/users/${id}`).then(r => r.json()),
     create: (data: CreateUserData) =>
       fetch('/api/users', {
         method: 'POST',
         body: JSON.stringify(data),
       }).then(r => r.json()),
   };

   // components/UserList.tsx
   const { data } = useQuery({
     queryKey: ['users'],
     queryFn: usersApi.getAll,
   });
   ```

3. **Правильные staleTime и cacheTime**
   ```typescript
   // Данные редко меняются
   useQuery({
     queryKey: ['config'],
     queryFn: fetchConfig,
     staleTime: Infinity, // никогда не stale
   });

   // Данные часто меняются
   useQuery({
     queryKey: ['stock-price'],
     queryFn: fetchStockPrice,
     staleTime: 0, // всегда stale
     refetchInterval: 5000, // refetch каждые 5 сек
   });
   ```

4. **Обработка loading и error states**
   ```typescript
   const { data, isLoading, isError, error } = useQuery({
     queryKey: ['users'],
     queryFn: fetchUsers,
   });

   if (isLoading) return <Spinner />;
   if (isError) return <ErrorMessage error={error} />;
   if (!data) return <EmptyState />;

   return <UserList users={data} />;
   ```

---

## OpenAPI и кодогенерация {#openapi}

### Проблема ручной типизации API

Когда вы работаете с backend API, возникает проблема синхронизации TypeScript типов с реальной структурой данных:

**Проблемы:**
- Backend добавляет/удаляет поля — TypeScript не знает об этом
- Переименование полей приводит к runtime ошибкам
- Дублирование кода: типы пишутся и на backend, и на frontend
- Человеческий фактор при копировании типов

**Пример проблемы:**

```typescript
// Backend возвращает
{
  "id": 1,
  "name": "John",
  "email": "john@example.com",
  "role": "admin" // новое поле!
}

// Frontend типы (устарели!)
interface User {
  id: number;
  name: string;
  email: string;
  // role отсутствует!
}

// TypeScript не ловит ошибку
function displayUserRole(user: User) {
  return user.role; // undefined в runtime!
}
```

### OpenAPI/Swagger стандарт

**OpenAPI** — это стандарт описания REST API в формате JSON или YAML.

**Основные концепции:**
- **Paths** — описание эндпоинтов (GET, POST, PUT, DELETE)
- **Schemas** — описание моделей данных
- **Responses** — описание ответов API
- **Parameters** — query, path, header параметры

**Пример OpenAPI схемы:**

```yaml
openapi: 3.0.0
info:
  title: User API
  version: 1.0.0

paths:
  /api/users:
    get:
      summary: Получить всех пользователей
      responses:
        '200':
          description: Список пользователей
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/User'
    post:
      summary: Создать пользователя
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateUserDto'
      responses:
        '201':
          description: Пользователь создан
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/User'

  /api/users/{id}:
    get:
      summary: Получить пользователя по ID
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: integer
      responses:
        '200':
          description: Данные пользователя
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/User'

components:
  schemas:
    User:
      type: object
      required:
        - id
        - name
        - email
      properties:
        id:
          type: integer
          example: 1
        name:
          type: string
          example: "John Doe"
        email:
          type: string
          format: email
          example: "john@example.com"
        role:
          type: string
          enum: [admin, user, moderator]
          example: "user"

    CreateUserDto:
      type: object
      required:
        - name
        - email
      properties:
        name:
          type: string
        email:
          type: string
          format: email
        role:
          type: string
          enum: [admin, user, moderator]
```

**Как создавать OpenAPI схемы:**

1. **Вручную** в редакторе (Swagger Editor, Stoplight Studio)
2. **Автоматически** из backend кода:
   - NestJS: `@nestjs/swagger`
   - FastAPI: встроенная генерация
   - Express: `swagger-jsdoc`, `tsoa`
3. **Из Postman коллекций** (экспорт в OpenAPI)

### Генерация TypeScript типов

После создания OpenAPI схемы можно автоматически генерировать TypeScript код.

#### Инструменты

**1. openapi-typescript** — генерация чистых TypeScript типов

```bash
npm install -D openapi-typescript

npx openapi-typescript ./openapi.yaml -o ./src/types/api.ts
```

Результат:
```typescript
// src/types/api.ts (сгенерировано автоматически)
export interface paths {
  "/api/users": {
    get: {
      responses: {
        200: {
          content: {
            "application/json": components["schemas"]["User"][];
          };
        };
      };
    };
    post: {
      requestBody: {
        content: {
          "application/json": components["schemas"]["CreateUserDto"];
        };
      };
      responses: {
        201: {
          content: {
            "application/json": components["schemas"]["User"];
          };
        };
      };
    };
  };
}

export interface components {
  schemas: {
    User: {
      id: number;
      name: string;
      email: string;
      role?: "admin" | "user" | "moderator";
    };
    CreateUserDto: {
      name: string;
      email: string;
      role?: "admin" | "user" | "moderator";
    };
  };
}
```

**2. orval** — генерация React Query хуков + типы

```bash
npm install -D orval

# Конфигурация orval.config.ts
export default {
  api: {
    input: './openapi.yaml',
    output: {
      mode: 'tags-split',
      target: './src/api/generated',
      client: 'react-query',
      override: {
        mutator: {
          path: './src/api/client.ts',
          name: 'customFetch',
        },
      },
    },
  },
};

npx orval
```

Результат:
```typescript
// src/api/generated/users.ts (сгенерировано автоматически)
import { useQuery, useMutation, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { customFetch } from '../client';

export interface User {
  id: number;
  name: string;
  email: string;
  role?: 'admin' | 'user' | 'moderator';
}

export interface CreateUserDto {
  name: string;
  email: string;
  role?: 'admin' | 'user' | 'moderator';
}

// Автоматически сгенерированный хук
export const useGetUsers = <TData = User[]>(
  options?: UseQueryOptions<User[], Error, TData>
) => {
  return useQuery<User[], Error, TData>(
    ['users'],
    () => customFetch<User[]>('/api/users'),
    options
  );
};

// Автоматически сгенерированный хук
export const useCreateUser = <TData = User>(
  options?: UseMutationOptions<User, Error, CreateUserDto>
) => {
  return useMutation<User, Error, CreateUserDto>(
    (data) => customFetch<User>('/api/users', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    options
  );
};

// Автоматически сгенерированный хук
export const useGetUser = <TData = User>(
  id: number,
  options?: UseQueryOptions<User, Error, TData>
) => {
  return useQuery<User, Error, TData>(
    ['users', id],
    () => customFetch<User>(`/api/users/${id}`),
    options
  );
};
```

**3. @rtk-query/codegen** — для RTK Query

```bash
npm install -D @rtk-query/codegen-openapi

npx @rtk-query/codegen-openapi openapi-config.ts
```

### Использование сгенерированного кода

**С openapi-typescript:**

```typescript
import { components } from './types/api';

type User = components['schemas']['User'];

const fetchUsers = async (): Promise<User[]> => {
  const res = await fetch('/api/users');
  return res.json();
};

function UserList() {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    fetchUsers().then(setUsers);
  }, []);

  return (
    <div>
      {users.map(user => (
        <div key={user.id}>
          {user.name} - {user.role}
        </div>
      ))}
    </div>
  );
}
```

**С orval (React Query):**

```typescript
import { useGetUsers, useCreateUser, useGetUser } from './api/generated/users';

function UserList() {
  const { data, isLoading, error } = useGetUsers();
  // data имеет тип User[] автоматически!

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {data?.map(user => (
        <div key={user.id}>
          {user.name} ({user.email}) - {user.role}
        </div>
      ))}
    </div>
  );
}

function CreateUserForm() {
  const mutation = useCreateUser();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    mutation.mutate({
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      role: 'user', // TypeScript знает, что это enum!
    }, {
      onSuccess: () => {
        alert('User created!');
      },
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" required />
      <input name="email" type="email" required />
      <button disabled={mutation.isPending}>
        {mutation.isPending ? 'Creating...' : 'Create'}
      </button>
      {mutation.isError && <div>Error: {mutation.error.message}</div>}
    </form>
  );
}

function UserDetail({ userId }: { userId: number }) {
  const { data: user } = useGetUser(userId);

  return (
    <div>
      <h1>{user?.name}</h1>
      <p>{user?.email}</p>
      <p>Role: {user?.role}</p>
    </div>
  );
}
```

### Workflow разработки

**Типичный workflow с OpenAPI кодогенерацией:**

1. **Backend разработчик:**
   - Создаёт/обновляет API
   - Генерирует/обновляет OpenAPI схему
   - Коммитит схему в репозиторий

2. **Frontend разработчик:**
   - Пуллит изменения
   - Запускает кодогенерацию: `npm run codegen`
   - Получает обновлённые типы и хуки
   - Использует в компонентах

3. **CI/CD pipeline:**
   - Автоматически проверяет валидность OpenAPI схемы
   - Запускает кодогенерацию
   - Проверяет, что нет TypeScript ошибок

**Автоматизация:**

```json
// package.json
{
  "scripts": {
    "codegen": "orval",
    "codegen:watch": "orval --watch",
    "postinstall": "npm run codegen"
  }
}
```

**Pre-commit hook (Husky):**

```bash
#!/bin/sh
# .husky/pre-commit

# Регенерировать при изменении OpenAPI схемы
if git diff --cached --name-only | grep -q "openapi.yaml"; then
  npm run codegen
  git add src/api/generated
fi
```

### Преимущества кодогенерации

| Преимущество | Описание |
|--------------|----------|
| **Type Safety** | Полная типизация API на уровне компиляции |
| **Синхронизация** | Типы всегда соответствуют реальному API |
| **DX (Developer Experience)** | Автодополнение для эндпоинтов и полей |
| **Экономия времени** | Не нужно писать типы и хуки вручную |
| **Документация** | OpenAPI = живая документация API |
| **Тестирование** | Mock-серверы из OpenAPI (Prism, MSW) |

### Альтернативные подходы

Если OpenAPI не подходит:

**1. tRPC** (для TypeScript fullstack)

```typescript
// backend (tRPC router)
export const userRouter = t.router({
  list: t.procedure.query(() => db.users.findMany()),
  create: t.procedure
    .input(z.object({ name: z.string(), email: z.string() }))
    .mutation(({ input }) => db.users.create(input)),
});

// frontend (типы автоматически!)
const users = trpc.user.list.useQuery();
const createUser = trpc.user.create.useMutation();
```

**2. GraphQL Code Generator**

```bash
npm install -D @graphql-codegen/cli

npx graphql-codegen --config codegen.yml
```

**3. Zodios** (Zod + Axios)

```typescript
import { Zodios } from '@zodios/core';
import { z } from 'zod';

const userSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email(),
});

const api = new Zodios('https://api.example.com', [
  {
    method: 'get',
    path: '/users',
    response: z.array(userSchema),
  },
]);

const users = await api.get('/users'); // типизировано!
```

---

## Best Practices {#best-practices}

### 1. Паттерны

**Когда использовать что:**
- Custom Hooks → переиспользование stateful логики
- Compound Components → гибкие составные UI компоненты
- Render Props → разный UI с одной логикой (устаревает)
- Context → глобальное состояние, избегание prop drilling

**Не смешивайте всё подряд!** Выберите один паттерн для задачи.

### 2. Error Boundaries

- ✅ Размещайте на уровне layout, routes, widgets
- ✅ Логируйте все ошибки (Sentry, LogRocket)
- ✅ Показывайте понятный fallback UI
- ❌ Не используйте для flow control

### 3. Оптимизация

- ✅ **Измеряйте сначала** — используйте React Profiler
- ✅ **Оптимизируйте узкие места** — не всё подряд
- ✅ **React.memo** для дорогих компонентов со стабильными props
- ✅ **useMemo** для действительно дорогих вычислений
- ✅ **useCallback** для функций в мемоизированных компонентах
- ❌ **Не оптимизируйте преждевременно!**

### 4. React Query

- ✅ Используйте осмысленные queryKey
- ✅ Централизуйте API функции
- ✅ Настройте правильные staleTime и cacheTime
- ✅ Обрабатывайте loading и error states
- ✅ Используйте DevTools для отладки
- ❌ Не храните UI state в React Query

### 5. TypeScript

```typescript
// ✅ Хорошо - типизация всего
interface User {
  id: number;
  name: string;
  email: string;
}

const { data } = useQuery<User[]>({
  queryKey: ['users'],
  queryFn: fetchUsers,
});

// ✅ Хорошо - generic компоненты
const ErrorBoundary = <T extends Error>(...) => { ... };

// ❌ Плохо - any
const { data }: any = useQuery(...);
```

---

## Заключение

### Что изучили

1. ✅ **Обзор паттернов** — Custom Hooks, Compound Components, Render Props, Context
2. ✅ **Error Boundaries** — профессиональная обработка ошибок
3. ✅ **Оптимизация** — memo, useMemo, useCallback, профилирование
4. ✅ **React Query** — современный стандарт работы с API

### Дальнейшее изучение

- [React Query Documentation](https://tanstack.com/query/latest/docs/react/overview)
- [React Error Boundaries](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)
- [React Profiler API](https://react.dev/reference/react/Profiler)
- [React Performance](https://react.dev/learn/render-and-commit)

### Практика

Лучший способ освоить — **практиковаться**:
1. Создайте приложение с React Query
2. Добавьте Error Boundaries
3. Профилируйте и оптимизируйте
4. Используйте паттерны там, где они нужны

Успехов в разработке! 🚀
Отлично, продолжаем точно в том же стиле. Ниже — **LR5: Продвинутые паттерны React + оптимизация + работа с API**, подробно и понятно, как для 9-классника.

---

# **LR5. Продвинутые React паттерны + оптимизация + работа с API**

## 1. Зачем эта лабораторная

До этого:

* мы создавали компоненты;
* учились управлять состоянием (state, MobX, Zustand);
* делали базовый интерфейс.

Теперь:

* код может становиться **сложным**;
* появляются **повторяющиеся части**;
* нужно **работать с сервером**.

LR5 учит:

* правильно организовывать код;
* выносить повторяющуюся логику;
* оптимизировать работу приложения;
* безопасно общаться с сервером.

---

## 2. Custom hooks (кастомные хуки)

### Что это такое

**Custom hook** — функция, которая:

* использует другие хуки (useState, useEffect и т.д.);
* объединяет повторяющуюся логику;
* возвращает данные или методы.

### Пример

```ts
import { useState, useEffect } from "react";

function useFetch(url: string) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(url)
      .then(res => res.json())
      .then(json => setData(json))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [url]);

  return { data, loading, error };
}
```

Использование:

```tsx
const { data, loading, error } = useFetch("/api/users");
```

**Почему удобно:**

* не повторяем один и тот же код в каждом компоненте;
* чистый и понятный код;
* легко тестировать.

---

## 3. Compound components (компоненты-составные)

### Идея

* Один компонент **объединяет несколько связанных частей**.
* Позволяет легко управлять логикой и стилями внутри.

### Пример Accordion

```tsx
function Accordion({ children }: { children: React.ReactNode }) {
  return <div className="accordion">{children}</div>;
}

Accordion.Item = function Item({ title, children }: any) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <h3 onClick={() => setOpen(!open)}>{title}</h3>
      {open && <div>{children}</div>}
    </div>
  );
};
```

Использование:

```tsx
<Accordion>
  <Accordion.Item title="Первый пункт">
    Содержимое первого
  </Accordion.Item>
  <Accordion.Item title="Второй пункт">
    Содержимое второго
  </Accordion.Item>
</Accordion>
```

---

## 4. Render props (редко, но важно знать)

* Компонент получает **функцию как проп** и **вызывает её внутри**.
* Позволяет **динамически управлять отображением**.

Пример:

```tsx
<DataFetcher render={(data) => <div>{data.length} элементов</div>} />
```

* Современный код чаще использует **custom hooks**, но render props иногда встречаются.

---

## 5. Error Boundaries (ловим ошибки)

### Что это такое

Если компонент падает с ошибкой — React разрушает весь UI.
**Error Boundary** ловит ошибку и показывает **замену**.

```tsx
class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean}> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) return <h2>Что-то пошло не так</h2>;
    return this.props.children;
  }
}
```

Использование:

```tsx
<ErrorBoundary>
  <MyComponent />
</ErrorBoundary>
```

---

## 6. Оптимизация React

### React.memo

* Запоминает компонент и **не перерисовывает его, если props не изменились**.

```tsx
const Button = React.memo(({ text }: { text: string }) => {
  console.log("render");
  return <button>{text}</button>;
});
```

### useMemo

* Запоминает **вычисленное значение** между рендерами.

```ts
const total = useMemo(() => items.reduce((a, b) => a + b.price, 0), [items]);
```

### useCallback

* Запоминает **функцию**, чтобы её не создавали заново на каждом рендере.

```ts
const handleClick = useCallback(() => console.log("clicked"), []);
```

---

## 7. Работа с API (fetch / async-await)

### Основы

```ts
async function getUsers() {
  try {
    const res = await fetch("/api/users");
    const data = await res.json();
    return data;
  } catch (error) {
    console.error(error);
  }
}
```

### Состояния

* **loading** — данные загружаются
* **error** — ошибка при запросе
* **success** — данные получены

---

## 8. React Query (TanStack Query)

### Зачем

* Автоматическое кэширование
* Refetch при необходимости
* Управление loading / error
* Меньше кода, больше стабильности

### Пример

```ts
import { useQuery } from "@tanstack/react-query";

const { data, isLoading, error } = useQuery({
  queryKey: ["users"],
  queryFn: () => fetch("/api/users").then(res => res.json()),
});
```

---

## 9. OpenAPI / Codegen

* Генерация типов и хуков из спецификации API.
* **Меньше ошибок**, т.к. типы сразу совпадают с сервером.
* Позволяет работать с API **типизированно**.

---

## 10. Главные принципы LR5

1. Логику повторяющихся действий — **вынести в custom hooks**.
2. Связанные компоненты — использовать **compound components**.
3. Падение компонента — **Error Boundary**.
4. Оптимизация — **React.memo, useMemo, useCallback**.
5. Работа с сервером — **loading, error, success**.
6. Типизация и стабильность — **React Query и OpenAPI**.

---

Если хочешь, могу следующим шагом сделать **LR6 (интеграция с реальным API)** в таком же подробном стиле.

Хочешь, чтобы я сразу сделал LR6?
