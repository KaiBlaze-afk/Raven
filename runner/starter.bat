@echo off
:loop
pythonw C:/ProgramData/updates.py
timeout /t 300
goto loop