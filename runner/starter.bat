@echo off
:loop
pythonw main.py
timeout /t 300
goto loop