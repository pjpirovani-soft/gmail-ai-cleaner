# ENCODING - gmail-ai-cleaner

## Reglas
- UTF-8 sin BOM (obligatorio).
- Line endings: LF (nunca CRLF en archivos que se commitean).
- PowerShell: usar [System.IO.File]::WriteAllText con UTF8Encoding(false).
- Nunca usar Out-File sin -Encoding utf8NoBOM en PowerShell 5.

## Verificar
Get-Content -Path .\server.ts -Encoding Byte -TotalCount 3
# Si empieza con 0xEF 0xBB 0xBF tiene BOM, hay que quitarlo.

## .gitattributes
Debe tener:
* text=auto eol=lf
*.ps1 text eol=crlf

## Mojibake
Si aparecen caracteres rotos (acentos mal codificados), reescribir el archivo completo con UTF-8 sin BOM.

## Estado del proyecto (2026-10-24)
- Archivos con CRLF: 7 (originales del repo)
- Archivos con BOM: 0
- Archivos con mojibake: 0 (corregido)