@echo off
echo Stopping NFT Marketplace...
echo.

echo Stopping React frontend (port 3000)...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":3000" ^| find "LISTENING"') do (
    echo Killing process %%a
    taskkill /f /pid %%a >nul 2>&1
)

echo Stopping Hardhat node (port 8545)...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":8545" ^| find "LISTENING"') do (
    echo Killing process %%a
    taskkill /f /pid %%a >nul 2>&1
)

echo Stopping any remaining Node.js processes...
taskkill /f /im node.exe >nul 2>&1

echo Stopping any remaining cmd windows with titles...
taskkill /f /fi "WINDOWTITLE eq Hardhat Node*" >nul 2>&1
taskkill /f /fi "WINDOWTITLE eq Frontend*" >nul 2>&1

echo.
echo NFT Marketplace stopped successfully!
echo.
pause