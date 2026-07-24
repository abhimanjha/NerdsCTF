# Free port 80 from any previously running Node lab
try {
    $conn = Get-NetTCPConnection -LocalPort 80 -ErrorAction SilentlyContinue
    if ($conn) {
        Stop-Process -Id $conn.OwningProcess -Force -ErrorAction SilentlyContinue
        Write-Host "Killed previous lab running on port 80."
    }
} catch {}

$labs = @("lab1-cookie-monster", "lab2-source-detective", "lab3-hidden-header", "lab4-encoded-secrets", "lab5-broken-api")
$port = 8001
foreach ($lab in $labs) {
    Write-Host "Setting up and starting $lab on port $port..."
    cd "labs/$lab"
    # Port is set dynamically for cmd/node
    Start-Process -NoNewWindow -FilePath "cmd.exe" -ArgumentList "/c set PORT=$port && node server.js"
    $port++
    cd ../..
}
Write-Host "All 5 security labs initialized and running on ports 8001-8005."
