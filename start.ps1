
$fastApiProcess = Start-Process -NoNewWindow -File "uvicorn" -ArgumentList "prediction:app", "--host", "localhost", "--port", "8000", "--reload", "--log-level", "info" -PassThru
Start-Sleep -Seconds 2  


while ($true) {
    try {
        $response = Invoke-RestMethod -Uri http://localhost:8000/ready -ErrorAction Stop
        if ($response.status -eq "ready") {
            break
        }
        else {
            Write-Host "Waiting for FastAPI server to be ready..."
        }
    } catch {
        
    }
    Write-Host "Waiting for FastAPI server to be ready..."
    Start-Sleep -Seconds 1
}

Write-Host "FastAPI server is ready. Starting Expo..."


$expoProcess = Start-Process -NoNewWindow -File "npm" -ArgumentList "run", "web" -PassThru


try {
    
    Wait-Process -Id $fastApiProcess.Id
    Wait-Process -Id $expoProcess.Id
} catch {
    Write-Host "Ctrl+C pressed. Terminating processes..."

   
    if ($fastApiProcess -and !$fastApiProcess.HasExited) {
        Stop-Process -Id $fastApiProcess.Id -Force
        Write-Host "FastAPI server terminated."
    }


    if ($expoProcess -and !$expoProcess.HasExited) {
        Stop-Process -Id $expoProcess.Id -Force
        Write-Host "Expo server terminated."
    }
}
