# Create Windows Startup Shortcut for Stargate Portal
$startupFolder = [Environment]::GetFolderPath("Startup")
$shortcutPath = Join-Path $startupFolder "StargatePortal.lnk"
$targetPath = "C:\CURSOR PROJECTS\StargatePortal\scripts\start-stargate-on-boot.ps1"
$shell = New-Object -ComObject WScript.Shell
$shortcut = $shell.CreateShortcut($shortcutPath)
$shortcut.TargetPath = "powershell.exe"
$shortcut.Arguments = "-ExecutionPolicy Bypass -WindowStyle Hidden -File `"$targetPath`""
$shortcut.WorkingDirectory = "C:\CURSOR PROJECTS\StargatePortal"
$shortcut.Description = "Auto-start Stargate Portal on Windows boot"
$shortcut.Save()
Write-Host "SUCCESS: Startup shortcut created at $shortcutPath"

