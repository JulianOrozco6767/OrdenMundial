$baseDir = $PSScriptRoot
if (-not $baseDir) { $baseDir = (Get-Location).Path }
$htmlPath = Join-Path $baseDir "index.html"
$cssPath = Join-Path $baseDir "styles.css"
$jsPath = Join-Path $baseDir "app.js"
$outputPath = Join-Path $baseDir "presentacion_completa.html"

$html = Get-Content -Path $htmlPath -Raw -Encoding UTF8
$css = Get-Content -Path $cssPath -Raw -Encoding UTF8
$js = Get-Content -Path $jsPath -Raw -Encoding UTF8

$styleBlock = "<style>`n" + $css + "`n</style>"
$scriptBlock = "<script>`n" + $js + "`n</script>"

$bundled = [System.Text.RegularExpressions.Regex]::Replace($html, '<link rel="stylesheet"[^>]*>', $styleBlock)
$bundled = [System.Text.RegularExpressions.Regex]::Replace($bundled, '<script src="app.js"[^>]*></script>', $scriptBlock)

[System.IO.File]::WriteAllText($outputPath, $bundled, [System.Text.Encoding]::UTF8)
Write-Output "OK: Generated presentacion_completa.html successfully"
