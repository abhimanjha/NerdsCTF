$credentials = @(
    "mysql://root@localhost:3306/nerdctf",
    "mysql://root:root@localhost:3306/nerdctf",
    "mysql://root:password@localhost:3306/nerdctf",
    "mysql://root:admin@localhost:3306/nerdctf"
)

$successUrl = $null

foreach ($url in $credentials) {
    Write-Host "Probing connection: $url"
    $env:DATABASE_URL = $url
    
    # Run using cmd /c to shield from PowerShell error handler
    $output = cmd /c "npx prisma db push --skip-generate 2>&1"
    $outputString = $output -join "`n"
    
    if ($outputString -match "sync" -or $outputString -match "already in sync") {
        $successUrl = $url
        Write-Host "SUCCESS: Connected successfully to MySQL!"
        break
    } else {
        if ($outputString -match "P1000") {
            Write-Host "Failed: Authentication rejected."
        } elseif ($outputString -match "P1001") {
            Write-Host "Failed: Cannot reach database server."
        } else {
            Write-Host "Failed with error details: $outputString"
        }
    }
}

if ($successUrl) {
    $envFile = ".env"
    $content = Get-Content $envFile
    $newContent = $content -replace 'DATABASE_URL=".*"', "DATABASE_URL=`"$successUrl`""
    Set-Content $envFile $newContent
    Write-Host "Updated .env file with verified database URL."
    exit 0
} else {
    Write-Host "Could not connect to MySQL with any default credentials."
    exit 1
}
