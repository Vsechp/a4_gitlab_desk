# GitLab Projects Explorer

Веб-приложение для просмотра и управления проектами GitLab с современным интерфейсом на Angular 19 и Material.

![GitLab Projects Explorer](./src/assets/screenshot.png)

## Особенности

- 🖼️ Красивый и современный UI с анимациями
- 📊 Статистика по проектам и коммитам
- 📋 История активности
- ⚙️ Настройка подключения к GitLab
- 🌙 Темная и светлая темы

## Требования

- Node.js 18+ и npm
- Angular CLI 19+

## Установка

1. Клонируйте репозиторий:

```bash
git clone https://github.com/yourusername/a4_gitlab_desk.git
cd a4_gitlab_desk
```

2. Установите зависимости:

```bash
npm install
```

3. Запустите проект:

```bash
npm start
```

Приложение будет доступно по адресу: http://localhost:4200

## Настройка

1. После запуска откройте вкладку "Настройки"
2. Введите URL вашего GitLab и Personal Access Token
3. Нажмите "Сохранить настройки"

## Структура проекта

```
src/
  ├── app/
  │    ├── components/        # Компоненты приложения
  │    ├── services/          # Сервисы для работы с API
  │    └── interfaces/        # Интерфейсы TypeScript
  ├── assets/                 # Статические файлы
  └── styles.css              # Глобальные стили
```

## Разработка

Для запуска в режиме разработки:

```bash
ng serve
```

## Сборка

Для сборки проекта:

```bash
ng build --prod
```

Готовая сборка будет в директории `dist/`.

## Лицензия

MIT
