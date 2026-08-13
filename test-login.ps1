$env:DATABASE_URL = "postgresql://postgres:admin1234@localhost:5432/tunas_harapan?schema=public"
$env:AUTH_SECRET = "TghLyFVRoP90b1yD-Ltv5NsGLdvD7NeQdsykYDDzM-IZdzUp1c645lCRCcZM6pJl"
$env:DEFAULT_PASSWORD = "Dusun2026"
$env:NEXT_PUBLIC_ADMIN_WHATSAPP = "6281234567890"
Set-Location "C:\Users\User\Desktop\tunas-harapan"
Start-Process -NoNewWindow -PassThru -FilePath "cmd" -ArgumentList "/c npm run dev" | Out-Null
Start-Sleep -Seconds 20
try {
  $body = '{"identifier":"ketua@tunasharapan.id","password":"Dusun2026"}'
  $r = Invoke-WebRequest -Uri "http://localhost:3000/api/auth/login" -Method POST -Body $body -ContentType "application/json"
  Write-Host "LOGIN STATUS: $($r.StatusCode)"
  Write-Host "RESPONSE: $($r.Content)"
  Write-Host "SET-COOKIE: $($r.Headers['Set-Cookie'])"
} catch {
  Write-Host "LOGIN FAILED: $($_.Exception.Message)"
  if ($_.Exception.Response) {
    $stream = $_.Exception.Response.GetResponseStream()
    $reader = New-Object System.IO.StreamReader($stream)
    Write-Host "DETAIL: $($reader.ReadToEnd())"
  }
}
