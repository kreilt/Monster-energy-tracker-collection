<#
==========================================================================
  Monster Energy Tracker - image downloader
--------------------------------------------------------------------------
  Reads flavors-data.js (the single data file used by the tracker),
  computes the same slug for every flavor, and downloads ONE real photo
  per flavor into the images\ folder as <slug>.jpg.

  After this finishes the tracker shows real photos and works OFFLINE
  (the pictures live next to the HTML, no internet needed afterwards).

  HOW TO RUN (needs internet, once):
    1) Right-click this file -> "Run with PowerShell"
       OR open PowerShell in this folder and run:
         powershell -ExecutionPolicy Bypass -File .\download-images.ps1

  USEFUL OPTIONS:
    -Force        re-download even if the image already exists
    -Delay 1200   pause (ms) between requests (default 800)

  Re-running is safe: existing images are skipped, so you can resume
  anytime. Some flavors may grab a wrong/odd photo (auto image search is
  not perfect) - just delete that images\<slug>.jpg and re-run, or drop
  your own picture named <slug>.jpg into the images\ folder.

  MANUAL OVERRIDES (optional):
    Create image-manifest.json next to this script, e.g.:
      [ { "slug":"monster-energy-original", "url":"https://.../can.jpg" },
        { "slug":"juice-monster-mango-loco", "query":"mango loco can front" } ]
    "url"   -> download exactly that image
    "query" -> use this search text instead of the flavor name
==========================================================================
#>

param(
    [switch]$Force,
    [int]$Delay = 800
)

$ErrorActionPreference = "Stop"
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12 -bor [Net.SecurityProtocolType]::Tls11 -bor [Net.SecurityProtocolType]::Tls
$UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"

$root      = Split-Path -Parent $MyInvocation.MyCommand.Path
$dataFile  = Join-Path $root "flavors-data.js"
$imgDir    = Join-Path $root "images"
$manifest  = Join-Path $root "image-manifest.json"

if (-not (Test-Path $dataFile)) { Write-Host "ERROR: flavors-data.js not found next to this script." -ForegroundColor Red; exit 1 }
if (-not (Test-Path $imgDir))   { New-Item -ItemType Directory -Path $imgDir | Out-Null }

# ---- slug: MUST match slugify() in Monster-Tracker.html ----
function Get-Slug([string]$s) {
    $s = $s.ToLowerInvariant()
    $s = $s -replace '&', ' and '
    $s = $s -replace '[^a-z0-9]+', '-'
    $s = $s -replace '^-+', ''
    $s = $s -replace '-+$', ''
    return $s
}

# ---- read flavor names from flavors-data.js ----
$raw   = Get-Content -Path $dataFile -Raw -Encoding UTF8
$names = [regex]::Matches($raw, '\{\s*n:"([^"]+)"') | ForEach-Object { $_.Groups[1].Value }
if ($names.Count -eq 0) { Write-Host "ERROR: no flavors parsed from flavors-data.js" -ForegroundColor Red; exit 1 }
Write-Host ("Found {0} flavors in flavors-data.js" -f $names.Count) -ForegroundColor Cyan

# ---- load optional overrides ----
$overrides = @{}
if (Test-Path $manifest) {
    try {
        $m = Get-Content $manifest -Raw -Encoding UTF8 | ConvertFrom-Json
        foreach ($e in $m) { if ($e.slug) { $overrides[$e.slug] = $e } }
        Write-Host ("Loaded {0} overrides from image-manifest.json" -f $overrides.Count) -ForegroundColor Cyan
    } catch { Write-Host "WARN: could not read image-manifest.json - ignoring." -ForegroundColor Yellow }
}

function Get-BingImageUrls([string]$query) {
    $q  = [uri]::EscapeDataString("$query")
    $url = "https://www.bing.com/images/search?q=$q&qft=+filterui:photo-photo&form=IRFLTR&first=1"
    $html = (Invoke-WebRequest -Uri $url -UserAgent $UA -UseBasicParsing -TimeoutSec 30).Content
    $html = [System.Net.WebUtility]::HtmlDecode($html)
    $urls = New-Object System.Collections.Generic.List[string]
    foreach ($m in [regex]::Matches($html, '"murl":"(https?:[^"]+?)"')) {
        $u = $m.Groups[1].Value -replace '\\/', '/'
        if ($u -notmatch '\.(jpg|jpeg|png|webp)(\?|$)') { continue }
        if ($urls -notcontains $u) { $urls.Add($u) }
    }
    return $urls
}

function Save-Image([string]$imgUrl, [string]$dest) {
    try {
        Invoke-WebRequest -Uri $imgUrl -OutFile $dest -UserAgent $UA -TimeoutSec 30 -UseBasicParsing
        if ((Test-Path $dest) -and ((Get-Item $dest).Length -gt 2000)) { return $true }
        if (Test-Path $dest) { Remove-Item $dest -Force }
        return $false
    } catch {
        if (Test-Path $dest) { Remove-Item $dest -Force -ErrorAction SilentlyContinue }
        return $false
    }
}

$done = 0; $skip = 0; $fail = 0; $failed = @()
$i = 0
foreach ($name in $names) {
    $i++
    $slug = Get-Slug $name
    $dest = Join-Path $imgDir ($slug + ".jpg")
    Write-Progress -Activity "Downloading Monster images" -Status "$i / $($names.Count) : $name" -PercentComplete (($i/$names.Count)*100)

    if ((Test-Path $dest) -and -not $Force) { $skip++; continue }

    $ov = $overrides[$slug]
    $ok = $false

    # 1) direct url override
    if ($ov -and $ov.url) {
        $ok = Save-Image $ov.url $dest
    }

    # 2) search (override query, else flavor name)
    if (-not $ok) {
        $query = if ($ov -and $ov.query) { $ov.query } else { "$name energy drink can" }
        try {
            $candidates = Get-BingImageUrls $query
            foreach ($u in $candidates) {
                if (Save-Image $u $dest) { $ok = $true; break }
            }
        } catch {
            Write-Host ("  search failed for '{0}': {1}" -f $name, $_.Exception.Message) -ForegroundColor DarkYellow
        }
    }

    if ($ok) {
        $done++
        Write-Host ("  [OK]   {0}" -f $slug) -ForegroundColor Green
    } else {
        $fail++; $failed += $name
        Write-Host ("  [FAIL] {0}" -f $slug) -ForegroundColor Red
    }

    Start-Sleep -Milliseconds $Delay
}

Write-Progress -Activity "Downloading Monster images" -Completed
Write-Host ""
Write-Host "================ SUMMARY ================" -ForegroundColor Cyan
Write-Host ("  Downloaded : {0}" -f $done)  -ForegroundColor Green
Write-Host ("  Skipped    : {0} (already had image)" -f $skip) -ForegroundColor Gray
Write-Host ("  Failed     : {0}" -f $fail)  -ForegroundColor ($(if($fail){"Red"}else{"Green"}))
if ($failed.Count) {
    Write-Host ""
    Write-Host "  Not found (add manually to images\<slug>.jpg or image-manifest.json):" -ForegroundColor Yellow
    $failed | ForEach-Object { Write-Host ("    - {0}  ->  {1}.jpg" -f $_, (Get-Slug $_)) -ForegroundColor DarkYellow }
}
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Done. Open Monster-Tracker.html to see the photos." -ForegroundColor Cyan
