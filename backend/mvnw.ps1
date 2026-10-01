[CmdletBinding()]
param(
    [Parameter(ValueFromRemainingArguments = $true)]
    [string[]]$MavenArgs
)

if (-not (Test-Path "$env:JAVA_HOME\bin\javac.exe")) {
    if (Test-Path "C:\Program Files\Eclipse Adoptium\jdk-25.0.3.9-hotspot\bin\javac.exe") {
        $env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-25.0.3.9-hotspot"
    }
}

& "$PSScriptRoot\mvnw.cmd" @MavenArgs
