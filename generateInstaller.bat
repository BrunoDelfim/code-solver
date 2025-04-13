@echo off
setlocal enabledelayedexpansion

:: Mudar para o diretório do script
cd /d "%~dp0"

echo Limpando arquivos anteriores...
if exist "dist" rd /s /q "dist"
if exist "node_modules" rd /s /q "node_modules"
if exist "package-lock.json" del /f /q "package-lock.json"
if exist "out" rd /s /q "out"

echo.
echo Gerando instalador do LeetCode Solver...
echo =====================================
echo.

:: Verificar Node.js
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo Erro: Node.js nao encontrado.
    echo Por favor, instale o Node.js antes de gerar o instalador.
    pause
    exit /b 1
)

:: Criar diretório temporário de build
set "BUILD_DIR=%TEMP%\LeetCodeSolverBuild"
if exist "%BUILD_DIR%" rd /s /q "%BUILD_DIR%"
mkdir "%BUILD_DIR%"

:: Copiar arquivos necessários para o build
echo Preparando arquivos...
xcopy /y "*.js" "%BUILD_DIR%\" >nul
xcopy /y "*.html" "%BUILD_DIR%\" >nul
xcopy /y "package.json" "%BUILD_DIR%\" >nul
if exist "assets" xcopy /y /e /i "assets" "%BUILD_DIR%\assets\" >nul
if exist "scripts" xcopy /y /e /i "scripts" "%BUILD_DIR%\scripts\" >nul

:: Mudar para o diretório de build
cd /d "%BUILD_DIR%"

:: Instalar dependências
echo Instalando dependencias...
call npm install

:: Gerar o instalador
echo.
echo Gerando o instalador...
call npm run build

:: Copiar o instalador gerado de volta
cd /d "%~dp0"
if not exist "dist" mkdir "dist"
xcopy /y "%BUILD_DIR%\dist\*Setup*.exe" "dist\" >nul 2>&1

:: Limpar arquivos temporários
rd /s /q "%BUILD_DIR%"

echo.
echo Instalador gerado com sucesso!
echo O arquivo do instalador esta na pasta "dist"
echo.
dir "dist"
echo.
pause 