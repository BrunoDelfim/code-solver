# Code Solver

A desktop application that uses AI to analyze and solve programming problems through screen captures.

The software is designed to help developers during live coding sessions, as screen content often doesn't appear properly in recordings or live streams. With Code Solver, you can capture the code and get instant AI-generated solutions without interrupting the flow of your presentation.

## 🚀 Features

- 📸 Screen capture with integrated OCR
- 🤖 Problem analysis using AI (Google Gemini)
- 💡 Automatic solution generation in multiple languages
- 🔍 Floating interface for quick viewing
- ⌨️ Global shortcuts for all functions
- 🔒 Content protection on windows
- 🎯 Support for multiple captures
- 📝 TypeScript support for better code quality

## ⚡ Shortcuts

- `Alt + P`: Show/hide main window  
- `Ctrl + Shift + P` or `Crtl + Alt + P`: Capture screen  
- `Ctrl + Enter`: Process captures
- `Alt + S`: Show/hide solution  
- `Ctrl + Shift + Q`: Exit application  

## 🛠️ Technologies

- Electron ^28.2.3
- Node.js
- TypeScript ^5.3.3
- Tesseract.js ^5.0.4 (OCR)
- Google Gemini API ^0.2.0
- HTML/CSS/JavaScript
- cross-env ^7.0.3 (Environment variables management)
- electron-store ^8.1.0
- node-tesseract-ocr ^2.0.2
- screenshot-desktop ^1.12.7

## 📦 Dependencies

### Main Dependencies
- Electron ^28.2.3
- TypeScript ^5.3.3
- @google/genai ^0.2.0
- electron-store ^8.1.0
- node-tesseract-ocr ^2.0.2
- screenshot-desktop ^1.12.7
- tesseract.js ^5.0.4

### Development Dependencies
- @types/electron ^1.6.10
- @types/node ^20.11.24
- cross-env ^7.0.3
- electron-builder ^24.9.1
- electron-reload ^2.0.0-alpha.1
- nodemon ^3.1.0
- rimraf ^5.0.5

## 📋 Requirements

- Google Gemini API key  
- Windows 10/11

## 🔧 Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/code-solver.git
cd code-solver
```

2. Install the dependencies::
```bash
npm install
```

3. Run the application:
```bash
npm start
```

## 📦 Generating the Installer

1. Run the command on terminal:
```bash
npm run build
# or
yarn build
```

2. The installer will be generated in the `dist` folder

## 📁 Project Structure

```
code-solve/
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
├── tsconfig.json      # TypeScript configuration
├── eng.traineddata    # English OCR data
├── por.traineddata    # Portuguese OCR data
├── README.md          # Main documentation
└── LICENSE            # License
```

## ⚙️ Configuration

1. Get an API key from Google Gemini at: https://makersuite.google.com/app/apikey
2. On the first run, the application will request the API key
3. The key will be saved at: %APPDATA%/Code Solver/gemini_api_key.txt

## 🔐 Security

- API keys are securely stored locally
- Solution windows are protected against screen capture
- Sensitive content is protected from leaks

## 🤝 Contributing

1. Fork the project
2. Create a branch for your feature (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. If there is a related issue, please reference it (Closes#)
6. Open a Pull Request

## 📝 License

This project is under the ISC license. See the `LICENSE` file for more details.

## ✨ Acknowledgments

- Google Gemini for the AI API
- Tesseract.js for the OCR technology
- Electron for the framework
- cross-env (Environment variables management)
- TypeScript team for the amazing type system
