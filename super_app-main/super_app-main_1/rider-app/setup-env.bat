@echo off
echo Creating .env file for Rider App...
echo.

if exist .env (
    echo .env file already exists!
    echo Do you want to overwrite it? (y/n)
    set /p choice=
    if /i "%choice%"=="y" (
        echo Overwriting .env file...
    ) else (
        echo Aborting...
        pause
        exit /b
    )
)

copy env.example .env
echo.
echo ✅ .env file created successfully!
echo.
echo 📝 Please edit the .env file and update the following important values:
echo    - REACT_APP_SUPER_APP_API_URL (should be http://localhost:5000/api)
echo    - REACT_APP_LOCATIONIQ_API_KEY (your LocationIQ API key)
echo    - REACT_APP_GOOGLE_MAPS_API_KEY (your Google Maps API key)
echo    - REACT_APP_RAZORPAY_KEY_ID (your Razorpay test key)
echo    - REACT_APP_RAZORPAY_KEY_SECRET (your Razorpay secret key)
echo.
echo 🚀 After updating the .env file, you can start the rider app with: npm start
echo.
pause
