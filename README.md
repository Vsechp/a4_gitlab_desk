# A4GitlabDesk

## GitLab Projects Explorer
<img width="1728" alt="Снимок экрана 2025-03-27 в 22 35 52" src="https://github.com/user-attachments/assets/a264edce-a4e2-4289-b532-b033aaf75010" />

<img width="1728" alt="Снимок экрана 2025-03-27 в 22 35 39" src="https://github.com/user-attachments/assets/9440e641-1b77-4f13-b79c-5e82a675ef5e" />

## Features

- 🖼️ UI on Angular 19 & Tailwind
- 📊 Statistics on projects and commits
- 📋 Activity history
- ⚙️ GitLab connection settings
- 🌙 Dark and light themes

## Requirements

- Node.js 18+ and npm
- Angular CLI 19+

## Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/a4_gitlab_desk.git
cd a4_gitlab_desk
```

2. Install dependencies:

```bash
npm install
```

3. Start the project:

```bash
npm start
```

The application will be available at: http://localhost:4200

## Environment Configuration

Before running the application, you need to set up environment files with your GitLab credentials:

1. In the `src/environments/` directory, you'll find these files:
   - `environment.ts` (default)
   - `environment.development.ts` (for development)
   - `environment.prod.ts` (for production)

2. Open these files and update the GitLab URL and personal access token:

```typescript
export const environment = {
  production: false, // set to true for environment.prod.ts
  gitlab: {
    url: 'https://git.b3it.ru/a3', // Your GitLab server URL
    token: 'your-personal-access-token' // Your GitLab personal access token
  }
};
```

3. To get your personal access token:
   - Go to GitLab → User Settings → Access Tokens
   - Create a new token with `api` scope
   - Copy the generated token and paste it in your environment files

These environment files are required for the application to connect to your GitLab instance.

## Project Structure

```
src/
  ├── app/
  │    ├── components/        # Application components
  │    ├── services/          # API services
  │    └── interfaces/        # TypeScript interfaces
  ├── assets/                 # Static files
  └── styles.css              # Global styles
```

## Development

To run in development mode:

```bash
ng serve
```

## Build

To build the project:

```bash
ng build --prod
```

The build output will be in the `dist/` directory.

## License

MIT
