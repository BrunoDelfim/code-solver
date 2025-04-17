# Contributing to Code Solver

First off, thank you for considering contributing to Code Solver! It's people like you that make Code Solver such a great tool.

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
* Follow the JavaScript styleguide
* Include thoughtfully-worded, well-structured tests
* Document new code
* End all files with a newline

## Styleguides

### Git Commit Messages

* Use the present tense ("Add feature" not "Added feature")
* Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
* Limit the first line to 72 characters or less
* Reference issues and pull requests liberally after the first line

### JavaScript Styleguide

* Use 2 spaces for indentation
* Use camelCase for variables and functions
* Use PascalCase for classes
* Prefer `const` over `let`
* Place spaces around operators
* End statements with semicolons
* Use template literals instead of string concatenation
* Add trailing commas for cleaner diffs

### Documentation Styleguide

* Use [Markdown](https://guides.github.com/features/mastering-markdown/)
* Reference functions with parentheses: `functionName()`
* Reference classes with brackets: `[ClassName]`
* Use code blocks for examples

## Project Structure

```
code-solver/
├── src/                    # Source code
│   ├── main.js            # Main Electron file
│   └── scripts/           # Helper scripts
├── public/                # Public assets
├── assets/                # Static assets
└── docs/                  # Documentation
```

## Development Setup

1. Fork the repository
2. Clone your fork:
```bash
git clone https://github.com/your-username/code-solver.git
```

3. Install dependencies:
```bash
cd code-solver
npm install
```

4. Create a branch for your changes:
```bash
git checkout -b feature/card#0 (card number)
```

5. Make your changes and test them
6. Push to your fork and submit a pull request

## Testing

* Write test cases for any new functionality
* Ensure all tests pass before submitting PR
* Include both unit tests and integration tests where appropriate
* Test on multiple platforms if possible

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
