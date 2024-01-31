@echo off
:loop
pythonw C:\Updates\main.py
timeout /t 1000
goto loop
