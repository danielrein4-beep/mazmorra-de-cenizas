@echo off
rem Formatea el codigo con Prettier.
cd /d "%~dp0"
call npm.cmd run formatear
pause
