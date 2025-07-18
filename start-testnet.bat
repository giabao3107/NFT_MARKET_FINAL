@echo off
echo Starting NFT Marketplace with Testnet (Sepolia)...
echo.

echo Deploying contracts to Sepolia testnet...
cd contracts
call npm run deploy:sepolia
if %errorlevel% neq 0 (
    echo Contract deployment to Sepolia failed!
    echo Please check your .env file and network configuration.
    pause
    exit /b 1
)
cd ..

echo Starting React frontend...
start "Frontend" cmd /k "cd /d frontend && npm start"

echo.
echo NFT Marketplace is starting with Sepolia testnet!
echo - Network: Sepolia Testnet
echo - Frontend: http://localhost:3000
echo.
echo Make sure to:
echo 1. Configure MetaMask to Sepolia network
echo 2. Have Sepolia ETH for gas fees
echo 3. Update frontend to connect to Sepolia
echo.
echo Press any key to exit...
pause >nul