Add-Type -AssemblyName System.IO.Compression.FileSystem

$zipPath = 'D:\IdeaStruct AI\IdeaStruct-AI-source.zip'
$zip = [System.IO.Compression.ZipFile]::OpenRead($zipPath)

$fileItem = Get-Item $zipPath
Write-Host "=========================================="
Write-Host "ZIP PACKAGE VERIFICATION AUDIT"
Write-Host "File Name: $($fileItem.Name)"
Write-Host "File Size: $([math]::Round($fileItem.Length / 1MB, 2)) MB ($($fileItem.Length) bytes)"
Write-Host "Total Entries: $($zip.Entries.Count)"
Write-Host "=========================================="

$mustInclude = @(
    'frontend/src/utils/dimensions.js',
    'frontend/src/components/common/ErrorBoundary.jsx',
    'frontend/src/components/hardware/Parametric3DViewer.jsx',
    'frontend/src/components/hardware/HardwarePlanSection.jsx',
    'frontend/src/components/hardware/HardwareWiringDiagram.jsx',
    'frontend/src/components/dashboard/DashboardTabs.jsx',
    'frontend/src/components/dashboard/RequirementsTab.jsx',
    'frontend/src/components/dashboard/ValidationTab.jsx',
    'frontend/src/components/dashboard/ConnectionsTab.jsx',
    'frontend/src/pages/ProjectDetailPage.jsx',
    'scripts/e2e/phase6_global_blank_screen_stress.cjs',
    'scripts/e2e/phase7_live_ai_error_state_test.cjs',
    'scripts/e2e/phase7b_live_ai_verification.cjs',
    'scripts/e2e/phase7b_results.json',
    'backend/src/main/java/com/ideastruct/infrastructure/ai/GeminiAiBlueprintProvider.java',
    'backend/src/test/java/com/ideastruct/infrastructure/ai/GeminiAiBlueprintProviderTest.java',
    'backend/src/main/java/com/ideastruct/exception/AiServiceException.java',
    'docs/screenshots/phase7/phase7_generation_error_card.png',
    'docs/screenshots/phase7/phase7_recovery_demo_plan_success.png'
)

Write-Host "`n--- 1. Checking Mandatory Phase 6 Files ---"
$missingCount = 0
foreach ($target in $mustInclude) {
    $found = $zip.Entries | Where-Object { ($_.FullName -replace '\\', '/') -eq $target }
    if ($found) {
        Write-Host "  [PRESENT] $target ($($found.Length) bytes)"
    } else {
        Write-Host "  [MISSING] $target"
        $missingCount++
    }
}

Write-Host "`n--- 2. Checking Forbidden Excluded Folders/Files ---"
$forbiddenRules = @(
    @{ Name = 'node_modules'; Pattern = 'node_modules' },
    @{ Name = 'frontend/dist'; Pattern = 'frontend/dist' },
    @{ Name = 'backend/target'; Pattern = 'backend/target' },
    @{ Name = '.idea'; Pattern = '\.idea' },
    @{ Name = '.vscode'; Pattern = '\.vscode' },
    @{ Name = '.git'; Pattern = '\.git/' },
    @{ Name = 'Real .env files'; Pattern = '(^|/)\.env$' },
    @{ Name = 'Old ZIP files'; Pattern = '\.zip$' }
)

$violationCount = 0
foreach ($rule in $forbiddenRules) {
    $foundViolations = $zip.Entries | Where-Object { ($_.FullName -replace '\\', '/') -match $rule.Pattern }
    if ($foundViolations) {
        Write-Host "  [VIOLATION] Found $($foundViolations.Count) items matching $($rule.Name)"
        $violationCount += $foundViolations.Count
    } else {
        Write-Host "  [CLEAN] No entries matching $($rule.Name)"
    }
}

$zip.Dispose()

Write-Host "`n=========================================="
if ($missingCount -eq 0 -and $violationCount -eq 0) {
    Write-Host "RESULT: AUDIT PASS (All Phase 6 files included, 0 forbidden files)"
    exit 0
} else {
    Write-Host "RESULT: AUDIT FAIL (Missing: $missingCount, Violations: $violationCount)"
    exit 1
}
Write-Host "=========================================="
