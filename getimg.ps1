<#
  Helper: download ONE image for a search query into a target file.
  Usage:
    powershell -ExecutionPolicy Bypass -File .\getimg.ps1 -Query "Monster Killer Brew Mean Bean can" -Out "images\java-monster-killer-brew-mean-bean.jpg" -Pick 0
  -Pick N : choose the N-th candidate (0 = first). Increase if the first is wrong.
#>
param(
  [Parameter(Mandatory=$true)][string]$Query,
  [Parameter(Mandatory=$true)][string]$Out,
  [int]$Pick = 0
)
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
$UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
$q = [uri]::EscapeDataString($Query)
$url = "https://www.bing.com/images/search?q=$q&qft=+filterui:photo-photo&form=IRFLTR&first=1"
$html = (Invoke-WebRequest -Uri $url -UserAgent $UA -UseBasicParsing -TimeoutSec 30).Content
$html = [System.Net.WebUtility]::HtmlDecode($html)
$cands = New-Object System.Collections.Generic.List[string]
foreach($m in [regex]::Matches($html,'"murl":"(https?:[^"]+?)"')){
  $u = $m.Groups[1].Value -replace '\\/','/'
  if($u -notmatch '\.(jpg|jpeg|png|webp)(\?|$)'){continue}
  if($cands -notcontains $u){$cands.Add($u)}
}
if($cands.Count -eq 0){ Write-Host "NO CANDIDATES for: $Query" -ForegroundColor Red; exit 2 }
$saved=$false
for($i=$Pick; $i -lt $cands.Count; $i++){
  try{
    Invoke-WebRequest -Uri $cands[$i] -OutFile $Out -UserAgent $UA -TimeoutSec 30 -UseBasicParsing
    if((Test-Path $Out) -and (Get-Item $Out).Length -gt 2000){
      Write-Host ("SAVED [{0}] {1}" -f $i,$cands[$i]) -ForegroundColor Green
      $saved=$true; break
    }
  }catch{}
}
if(-not $saved){ Write-Host "FAILED to save any candidate for: $Query" -ForegroundColor Red; exit 3 }
