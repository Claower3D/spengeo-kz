# SpenGeo - Project Startup
Write-Host "Starting SpenGeo servers..." -ForegroundColor Yellow

# Start Go Backend on port 8083
Write-Host "[1/2] Launching Go Backend on port 8083..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Write-Host 'SpenGeo Go Backend Server' -ForegroundColor Green; cd backend; go run main.go"

# Start React Frontend on port 5174
Write-Host "[2/2] Launching React Frontend on port 5174..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Write-Host 'SpenGeo React Frontend Server' -ForegroundColor Green; cd frontend; npm run dev"

Write-Host "Ready! Backend: http://localhost:8083 | Frontend: http://localhost:5174" -ForegroundColor Green
