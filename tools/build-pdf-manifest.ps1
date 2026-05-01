$items = Get-ChildItem -Path "pdf" -Recurse -File -Filter *.pdf |
    Sort-Object FullName |
    ForEach-Object {
        [pscustomobject]@{
            title = $_.BaseName
            href = ($_.FullName.Substring($PWD.Path.Length + 1)).Replace('\', '/')
        }
    }

$content = "window.TOTOLTEPEC_PDF_MANIFEST = " + ($items | ConvertTo-Json -Depth 3 -Compress) + ";"
Set-Content -Path "pdf-manifest.js" -Value $content -Encoding UTF8
