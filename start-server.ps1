param(
    [int]$Port = 8080
)

$baseDir = if ($PSScriptRoot) { $PSScriptRoot } else { (Get-Location).Path }
$listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Any, $Port)
$listener.Start()

$ip = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.InterfaceAlias -notlike "*Loopback*" -and $_.IPAddress -notlike "169.254*" } | Select-Object -First 1).IPAddress

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host " Dental Case Sheet Server is Running!" -ForegroundColor Green
Write-Host " PC Local:    http://localhost:$Port/" -ForegroundColor Yellow
Write-Host " Mobile/LAN:  http://$($ip):$Port/" -ForegroundColor Yellow
Write-Host "==================================================" -ForegroundColor Cyan

while ($true) {
    try {
        $client = $listener.AcceptTcpClient()
        $stream = $client.GetStream()
        $reader = New-Object System.IO.StreamReader($stream, [System.Text.Encoding]::ASCII)
        $firstLine = $reader.ReadLine()
        
        if ($firstLine) {
            $tokens = $firstLine.Split(" ")
            if ($tokens.Length -ge 2) {
                $rawPath = $tokens[1].Split("?")[0]
                if ($rawPath -eq "/" -or $rawPath -eq "") {
                    $rawPath = "/index.html"
                }

                $cleanRel = [System.Uri]::UnescapeDataString($rawPath.TrimStart("/").Replace("/", [System.IO.Path]::DirectorySeparatorChar))
                $targetFile = [System.IO.Path]::Combine($baseDir, $cleanRel)

                if (Test-Path $targetFile -PathType Container) {
                    $targetFile = [System.IO.Path]::Combine($targetFile, "index.html")
                }

                if (Test-Path $targetFile -PathType Leaf) {
                    $ext = [System.IO.Path]::GetExtension($targetFile).ToLower()
                    $ctype = "application/octet-stream"
                    if ($ext -eq ".html" -or $ext -eq ".htm") { $ctype = "text/html; charset=utf-8" }
                    elseif ($ext -eq ".css") { $ctype = "text/css; charset=utf-8" }
                    elseif ($ext -eq ".js") { $ctype = "application/javascript; charset=utf-8" }
                    elseif ($ext -eq ".json") { $ctype = "application/json; charset=utf-8" }
                    elseif ($ext -eq ".png") { $ctype = "image/png" }
                    elseif ($ext -eq ".jpg" -or $ext -eq ".jpeg") { $ctype = "image/jpeg" }
                    elseif ($ext -eq ".svg") { $ctype = "image/svg+xml" }
                    elseif ($ext -eq ".ico") { $ctype = "image/x-icon" }

                    $bytes = [System.IO.File]::ReadAllBytes($targetFile)
                    $header = "HTTP/1.1 200 OK`r`nContent-Type: $ctype`r`nContent-Length: $($bytes.Length)`r`nAccess-Control-Allow-Origin: *`r`nConnection: close`r`n`r`n"
                    $headerBytes = [System.Text.Encoding]::ASCII.GetBytes($header)
                    $stream.Write($headerBytes, 0, $headerBytes.Length)
                    $stream.Write($bytes, 0, $bytes.Length)
                } else {
                    $nf = "HTTP/1.1 404 Not Found`r`nContent-Type: text/plain`r`nContent-Length: 13`r`nConnection: close`r`n`r`n404 Not Found"
                    $nfBytes = [System.Text.Encoding]::ASCII.GetBytes($nf)
                    $stream.Write($nfBytes, 0, $nfBytes.Length)
                }
                $stream.Flush()
            }
        }
        $client.Close()
    } catch {
        # continue loop safely
    }
}
