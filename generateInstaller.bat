@echo off
setlocal enabledelayedexpansion

:: Change to the script directory
cd /d "%~dp0"

echo Cleaning previous files...
if exist "dist" rd /s /q "dist"
if exist "node_modules" rd /s /q "node_modules"
if exist "package-lock.json" del /f /q "package-lock.json"
if exist "out" rd /s /q "out"

echo.
echo Generating Code Solver installer...
echo =====================================
echo.

:: Verify Node.js
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Node.js not found.
    echo Please install Node.js before generating the installer.
    pause
    exit /b 1
)

:: Create temporary build directory
set "BUILD_DIR=%TEMP%\CodeSolverBuild"
if exist "%BUILD_DIR%" rd /s /q "%BUILD_DIR%"
mkdir "%BUILD_DIR%"

:: Copy necessary files to the build
echo Preparing files...
xcopy /y "src\*.js" "%BUILD_DIR%\src\" >nul
xcopy /y "src\scripts\*.js" "%BUILD_DIR%\src\scripts\" >nul
xcopy /y "public\*.html" "%BUILD_DIR%\public\" >nul
xcopy /y "package.json" "%BUILD_DIR%\" >nul
if exist "assets" xcopy /y /e /i "assets" "%BUILD_DIR%\assets\" >nul

:: Change to the build directory
cd /d "%BUILD_DIR%"

:: Install dependencies
echo Installing dependencies...
call npm install

:: Generate the installer
echo.
echo Generating the installer...
call npm run build

:: Copy the generated installer back
cd /d "%~dp0"
if not exist "dist" mkdir "dist"
xcopy /y "%BUILD_DIR%\dist\*Setup*.exe" "dist\" >nul 2>&1

:: Clean temporary files
rd /s /q "%BUILD_DIR%"

echo.
echo Installer generated successfully!
echo The installer file is in the "dist" folder
echo.
dir "dist"
echo.
pause 