# 🎨 Contributing to Tiny Museum

Thank you for your interest in contributing to Tiny Museum! Whether you're fixing a bug, adding a new feature, or improving documentation, we appreciate your help.

## 🏛️ Code of Conduct

Help us keep Tiny Museum a friendly and encouraging space for everyone. Please be respectful and helpful.

## 🚀 How to Contribute

1.  **Fork the repo**: Create a copy of the repository in your own GitHub account.
2.  **Create a branch**: For each change, create a new branch from `main`.
3.  **Make changes**: Implement your bug fix or feature.
4.  **Run tests**: Pulse-check your changes by running `npm test`.
5.  **Submit a Pull Request**: Explain your changes and how you've tested them.

## 🛠️ Coding Standards

- **TypeScript**: We use TypeScript for all logic. Ensure your changes are type-safe.
- **Next.js App Router**: Follow Next.js App Router patterns and layout structures.
- **Fabric.js**: When working with the canvas engine, be mindful of SSR issues and use dynamic imports where necessary.
- **Dexie.js**: All artwork and gallery data must be stored locally using IndexedDB.
- **Aesthetics**: Tiny Museum is designed to be vibrant, premium, and kid-friendly. Maintain high-quality visual design.

### Quality Checks

Before submitting a PR, ensure your code passes our quality checks:

- **Linting**: `npm run lint`
- **Typechecking**: `npm run typecheck`
- **Testing**: `npm test`
- **Quality (all-in-one)**: `npm run quality`

## 🧪 Testing

We use [Vitest](https://vitest.dev/) for unit testing. All new storage and core logic must be accompanied by relevant unit tests. Run `npm run vitest --coverage` to check your test coverage.
