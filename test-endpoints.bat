@echo off
setlocal enabledelayedexpansion

echo === 1. LOGIN ===
curl.exe -s -c cookies.txt -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d "{\"identifier\":\"ketua@tunasharapan.id\",\"password\":\"Dusun2026\"}"
echo.
echo === Cookie jar ===
type cookies.txt
echo.

echo === 2. DASHBOARD GET ===
curl.exe -s -b cookies.txt http://localhost:3000/api/dashboard
echo.

echo === 3. FINANCE GET ===
curl.exe -s -b cookies.txt "http://localhost:3000/api/finance"
echo.

echo === 4. FINANCE POST ===
curl.exe -s -b cookies.txt -X POST http://localhost:3000/api/finance -H "Content-Type: application/json" -d "{\"type\":\"INCOME\",\"sumberKas\":\"INDUK\",\"category\":\"Iuran Wajib\",\"amount\":100000,\"description\":\"Test manual\"}"
echo.

echo === 5. Session check ===
curl.exe -s -b cookies.txt http://localhost:3000/api/auth/session
echo.
del cookies.txt 2>nul
