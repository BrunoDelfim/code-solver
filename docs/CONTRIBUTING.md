# Contributing to Code Solver

Thank you for your interest in contributing to Code Solver! This document provides guidelines and instructions for contributing to the project.

## 🛠️ Development Setup

### Prerequisites

- Node.js 18 or higher
- npm 9 or higher
- Windows 10/11
- Git

### Dependencies

#### Main Dependencies
- Electron ^28.2.3
- TypeScript ^5.3.3
- @google/genai ^0.2.0
- electron-store ^8.1.0
- node-tesseract-ocr ^2.0.2
- screenshot-desktop ^1.12.7
- tesseract.js ^5.0.4

#### Development Dependencies
- @types/electron ^1.6.10
- @types/node ^20.11.24
- cross-env ^7.0.3
- electron-builder ^24.9.1
- electron-reload ^2.0.0-alpha.1
- nodemon ^3.1.0
- rimraf ^5.0.5

### Installation

1. Fork the repository
2. Clone your fork:
```bash
git clone https://github.com/your-username/code-solver.git
cd code-solver
```

3. Install dependencies:
```bash
npm install
```

4. Start development server:
```bash
npm run dev
```

## 📝 Code Style

- Follow TypeScript best practices
- Use ESLint for code linting
- Maintain consistent indentation (2 spaces)
- Use meaningful variable and function names
- Add comments for complex logic
- Write unit tests for new features

## 🔄 Development Workflow

1. Create a new branch for your feature:
```bash
git checkout -b feature/your-feature-name
```

2. Make your changes and commit them:
```bash
git add .
git commit -m "feat: add your feature description"
```

3. Push your changes:
```bash
git push origin feature/your-feature-name
```

4. Create a Pull Request on GitHub

## 🧪 Testing

- Run tests before submitting PR:
```bash
npm test
```

- Ensure all tests pass
- Add new tests for new features
- Update existing tests if needed

## 📚 Documentation

- Update README.md if adding new features
- Document API changes
- Add comments for complex code
- Update CONTRIBUTING.md if needed

## 🤝 Pull Request Process

1. Ensure your code follows the style guide
2. Update documentation if needed
3. Add tests for new features
4. Ensure all tests pass
5. Submit PR with clear description
6. Reference related issues if any

## 📜 License

By contributing, you agree that your contributions will be licensed under the ISC License.

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the issue list as you might find out that you don't need to create one. When you are creating a bug report, please include as many details as possible:

* Use a clear and descriptive title
* Describe the exact steps which reproduce the problem
* Provide specific examples to demonstrate the steps
* Describe the behavior you observed after following the steps
* Explain which behavior you expected to see instead and why
* Include screenshots if possible
* Include your operating system and Code Solver version

### Suggesting Enhancements

If you have a suggestion for the project, we'd love to hear about it! Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please include:

* A clear and descriptive title
* A detailed description of the proposed feature
* Explain why this enhancement would be useful
* List some examples of how it would be used

### Pull Requests

* Fill in the required template
* Do not include issue numbers in the PR title
* Include screenshots and animated GIFs in your pull request whenever possible
* Follow the TypeScript styleguide
* Include thoughtfully-worded, well-structured tests
* Document new code
* End all files with a newline

## Styleguides

### Git Commit Messages

* Use the present tense ("Add feature" not "Added feature")
* Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
* Limit the first line to 72 characters or less
* Reference issues and pull requests liberally after the first line

### TypeScript Styleguide

* Use TypeScript for all new code
* Enable strict mode in tsconfig.json
* Add proper type annotations
* Use interfaces for data structures
* Avoid using `any` type
* Use type guards when necessary
* Keep renderer code in `src/renderers`
* Each window should have its own renderer
* Use proper event typing for IPC communication
* Handle errors appropriately

Example:
```typescript
// Good
interface SolutionDetails {
    title: string;
    language: string;
    problem: string;
    code: string;
    explanation: string;
    testing: string;
}

/**
 * Updates the solution interface with the provided data
 * @param {Electron.IpcRendererEvent} _event - The IPC event (unused)
 * @param {SolutionData} data - The solution data to display
 */
function updateSolution(_event: Electron.IpcRendererEvent, data: SolutionData): void {
    // Implementation
}

// Bad
function updateSolution(event, data) {  // No type annotation or documentation
    // Implementation
}
```

### Documentation Styleguide

* Use [Markdown](https://guides.github.com/features/mastering-markdown/)
* Reference functions with parentheses: `functionName()`
* Reference classes with brackets: `[ClassName]`
* Use code blocks for examples

## Project Structure

```
code-solver/
├── src/                    # Main source code
│   ├── config/            # App configurations
│   ├── services/          # App services
│   ├── utils/             # Utilities
│   ├── windows/           # Window management
│   ├── renderers/         # Renderer processes
│   └── main.ts            # Entry point
│
├── public/                # Public files
│   ├── index.html        # Main HTML
│   ├── about.html        # About HTML
│   ├── api-key.html      # API key configuration
│   ├── solution.html     # Solution display
│   └── capture-status.html # Capture status
│
├── assets/               # Static resources
│   └── icon.ico         # Application icon
│
├── docs/                # Documentation
├── dist/               # Builds and distribution
├── .github/            # GitHub configurations
├── node_modules/       # Dependencies
├── package.json        # Project configuration
├── package-lock.json   # Dependency lock file
├── .gitignore         # Git ignore rules
├── eng.traineddata    # English OCR data
├── por.traineddata    # Portuguese OCR data
├── README.md          # Main documentation
└── LICENSE            # License
```

## Additional Notes

### Issue and Pull Request Labels

* `bug`: Something isn't working
* `enhancement`: New feature or request
* `documentation`: Improvements or additions to documentation
* `good first issue`: Good for newcomers
* `help wanted`: Extra attention is needed
* `question`: Further information is requested

## Questions?

Feel free to contact the project maintainers if you have any questions or need clarification on anything.

Thank you for contributing to Code Solver! 🚀
