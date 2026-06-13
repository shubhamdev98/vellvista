@echo off
echo Setting up LuxeScents Backend...

REM Check if .env exists
if not exist .env (
    echo Creating .env file from template...
    copy env.example .env
    echo Please edit .env file with your database credentials
)

REM Install dependencies
echo Installing dependencies...
npm install

echo Setup complete!
echo.
echo Next steps:
echo 1. Edit .env file with your PostgreSQL credentials
echo 2. Run: npm run db:generate
echo 3. Run: npm run db:migrate
echo 4. Run: npm run seed
echo 5. Run: npm run dev
pause
