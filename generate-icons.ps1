<#
  Генерирует иконки приложения (PWA) в папке icons/.
  Стиль: три зелёных "когтя" Monster на тёмном фоне.
  Запуск: powershell -ExecutionPolicy Bypass -File .\generate-icons.ps1
#>
Add-Type -AssemblyName System.Drawing

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$dir = Join-Path $root "icons"
if(-not (Test-Path $dir)){ New-Item -ItemType Directory -Path $dir | Out-Null }

function New-Icon([int]$size, [string]$path, [double]$pad){
  $bmp = New-Object System.Drawing.Bitmap($size,$size)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias

  # фон: тёмный с лёгким зелёным свечением сверху
  $bg = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255,10,10,10))
  $g.FillRectangle($bg, 0, 0, $size, $size)
  $glow = New-Object System.Drawing.Drawing2D.GraphicsPath
  $glow.AddEllipse(-$size*0.3, -$size*0.6, $size*1.6, $size*1.1)
  $pgb = New-Object System.Drawing.Drawing2D.PathGradientBrush($glow)
  $pgb.CenterColor = [System.Drawing.Color]::FromArgb(120,22,33,10)
  $pgb.SurroundColors = @([System.Drawing.Color]::FromArgb(0,10,10,10))
  $g.FillPath($pgb, $glow)

  # область когтей (с отступом pad для maskable)
  $m = $size * $pad
  $w = $size - 2*$m
  $h = $size - 2*$m
  $cx = $size/2.0
  $top = $m + $h*0.10
  $bot = $m + $h*0.92

  $green = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255,165,255,0))

  # три когтя: трапеции, сужающиеся книзу; средний длиннее
  function Claw($g,$brush,$cxc,$topY,$botY,$topHalf,$botHalf){
    $pts = @(
      (New-Object System.Drawing.PointF([single]($cxc-$topHalf), [single]$topY)),
      (New-Object System.Drawing.PointF([single]($cxc+$topHalf), [single]$topY)),
      (New-Object System.Drawing.PointF([single]($cxc+$botHalf), [single]$botY)),
      (New-Object System.Drawing.PointF([single]$cxc,            [single]($botY+($botY-$topY)*0.06))),
      (New-Object System.Drawing.PointF([single]($cxc-$botHalf), [single]$botY))
    )
    $g.FillPolygon($brush, $pts)
  }

  $tw = $w*0.085   # half-width сверху
  $bw = $w*0.030   # half-width снизу
  $gap = $w*0.165  # расстояние между когтями

  Claw $g $green ($cx-$gap) ($top+$h*0.05) ($bot-$h*0.06) $tw $bw
  Claw $g $green ($cx)      ($top)         ($bot)         $tw $bw
  Claw $g $green ($cx+$gap) ($top+$h*0.05) ($bot-$h*0.06) $tw $bw

  $g.Dispose()
  $bmp.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
  $bmp.Dispose()
  Write-Host ("  saved {0} ({1}x{1})" -f (Split-Path $path -Leaf), $size) -ForegroundColor Green
}

Write-Host "Generating icons..." -ForegroundColor Cyan
New-Icon 192 (Join-Path $dir "icon-192.png") 0.16
New-Icon 512 (Join-Path $dir "icon-512.png") 0.16
New-Icon 512 (Join-Path $dir "icon-512-maskable.png") 0.26   # больше отступ для маски
New-Icon 180 (Join-Path $dir "apple-touch-icon-180.png") 0.16
New-Icon 32  (Join-Path $dir "favicon-32.png") 0.12
Write-Host "Done." -ForegroundColor Cyan
