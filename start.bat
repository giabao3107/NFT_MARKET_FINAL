@echo off
echo Starting NFT Marketplace...
echo.

echo Starting Hardhat local blockchain...
start "Hardhat Node" cmd /k "cd /d contracts && npm run node"

echo Waiting for blockchain to start...
timeout /t 10 /nobreak >nul

echo Deploying contracts to local network...
cd contracts
call npm run deploy:local
if %errorlevel% neq 0 (
    echo Contract deployment failed!
    pause
    exit /b 1
)
cd ..

echo Starting React frontend...
start "Frontend" cmd /k "cd /d frontend && npm start"

echo.
echo NFT Marketplace is starting up!
echo - Blockchain: http://localhost:8545
echo - Frontend: http://localhost:3000
echo.
echo Press any key to exit...
pause >nul