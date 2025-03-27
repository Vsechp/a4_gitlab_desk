# A4GitlabDesk

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 19.2.1.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

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

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
