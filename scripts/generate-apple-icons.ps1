Add-Type -AssemblyName System.Drawing

$root = Split-Path -Parent $PSScriptRoot
$iconsDir = Join-Path $root 'public/icons'
$publicDir = Join-Path $root 'public'
$srcPath = Join-Path $iconsDir 'logo.png'

if (-not (Test-Path $srcPath)) {
  Write-Error "Source logo not found: $srcPath"
  exit 1
}

$src = [System.Drawing.Image]::FromFile($srcPath)
$sizes = @(180, 167, 152, 120)
$bg = [System.Drawing.Color]::FromArgb(255, 12, 12, 12)

foreach ($size in $sizes) {
  $bmp = New-Object System.Drawing.Bitmap($size, $size)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $g.Clear($bg)
  $g.DrawImage($src, 0, 0, $size, $size)
  $out = Join-Path $iconsDir ("apple-touch-icon-" + $size + ".png")
  $bmp.Save($out, [System.Drawing.Imaging.ImageFormat]::Png)
  $g.Dispose()
  $bmp.Dispose()
  Write-Host "Generated $out"
}

$src.Dispose()

Copy-Item -Path (Join-Path $iconsDir 'apple-touch-icon-180.png') -Destination (Join-Path $publicDir 'apple-touch-icon.png') -Force
Write-Host "Copied apple-touch-icon.png to public root"
