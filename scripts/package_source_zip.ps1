$srcDir = 'D:\IdeaStruct AI'
$zipPath = 'D:\IdeaStruct AI\IdeaStruct-AI-source.zip'
if (Test-Path $zipPath) { Remove-Item $zipPath -Force }

# Use tar to cleanly create a portable zip archive with exclusions
$excludeArgs = @(
    '--exclude=frontend/node_modules',
    '--exclude=frontend/dist',
    '--exclude=backend/target',
    '--exclude=.idea',
    '--exclude=.vscode',
    '--exclude=.git',
    '--exclude=*.zip',
    '--exclude=*.env'
)

# Run tar.exe from root
& tar.exe -a -c -f $zipPath $excludeArgs -C 'D:\IdeaStruct AI' api backend database docs frontend scripts shared .env.example .gitignore README.md

if (Test-Path $zipPath) {
    $finalItem = Get-Item $zipPath
    $sizeBytes = $finalItem.Length
    $sizeMB = [math]::Round($sizeBytes / 1MB, 2)
    $sizeKB = [math]::Round($sizeBytes / 1KB, 2)

    Write-Host "=========================================="
    Write-Host "FINAL SOURCE ARCHIVE CREATED SUCCESSFULLY"
    Write-Host "Archive Path: $zipPath"
    Write-Host "Archive Size: $sizeKB KB ($sizeMB MB)"
    Write-Host "=========================================="
} else {
    Write-Error "Failed to create archive"
}
