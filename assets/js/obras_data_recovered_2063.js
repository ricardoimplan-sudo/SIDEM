$kml1 = "C:\Users\IMP-1620-LAPAZUL\.gemini\OBRA_PUBLICA_2022_2024_FULL.kml"
$kml2 = "C:\Users\IMP-1620-LAPAZUL\.gemini\PAOP 2025.kml"
$imgDir = "C:\Users\IMP-1620-LAPAZUL\.gemini\antigravity\scratch\pimags-moderno\assets\img\obras"
$outJs = "C:\Users\IMP-1620-LAPAZUL\.gemini\antigravity\scratch\pimags-moderno\assets\js\obras_data.js"

$utf&deg; oBom = New-Object System.Text.UTF&deg; ncoding($false)

# Character helpers for PS 5.1
$o_acute = [char]0x00F3
$u_acute = [char]0x00FA

$rubro_vial = "Vialidades y Pavimentaci" + $o_acute + "n"
$rubro_agua = "Agua y Saneamiento"
$rubro_alum = "Alumbrado y Electrificaci" + $o_acute + "n"
$rubro_espacios = "Espacios P" + $u_acute + "blicos y Deporte"
$rubro_edif = "Edificaci" + $o_acute + "n y Equipamiento"
$rubro_infra = "Infraestructura Urbana"

function Clean-Text($val) {
    if ($null -eq $val) { return "" }
    $s = ""
    if ($val -is [System.Xml.XmlElement]) {
        $s = $val.InnerText
    } else {
        $s = $val.ToString()
    }
    if ([string]::IsNullOrWhiteSpace($s) -or $s -eq "System.Xml.XmlElement") { return "" }
    $s = $s.Trim()
    $s = $s.Replace("&amp;", "&").Replace("&quot;", '"').Replace("&lt;", "<").Replace("&gt;", ">")
    return $s.Trim()
}

function Extract-Amount($text) {
    if ([string]::IsNullOrWhiteSpace($text)) { return 0.0 }
    $s = $text.ToString()
    # Match patterns like $ 1,403,403.86, $1'403,403.86, $ 1â€™403,403.86, $1403403.86
    if ($s -match "\$\s*([0-9]{1,3}(&bull;:[,\'â€™\s][0-9]{3})*(&bull;:\.[0-9]{2})&bull;)") {
        $rawNum = $matches[1] -replace "[,\'â€™\s]", ""
        $res = 0.0
        if ([double]::TryParse($rawNum, [System.Globalization.NumberStyles]::Any, [System.Globalization.CultureInfo]::InvariantCulture, [ref]$res)) {
            if ($res -gt 50) { return $res }
        }
    }
    # Direct numeric parse
    $clean = $s -replace "[\$,\sMXNmxn\'â€™]", ""
    $res2 = 0.0
    if ([double]::TryParse($clean, [System.Globalization.NumberStyles]::Any, [System.Globalization.CultureInfo]::InvariantCulture, [ref]$res2)) {
        if ($res2 -gt 50) { return $res2 }
    }
    return 0.0
}

function Classify-Rubro([string]$desc, [string]$name, [string]$conc) {
    $t = ($desc + " " + $name + " " + $conc).ToUpper()
    if ($t -match "(POZO|AGUA|DRENAJE|COLECTOR|HIDR|ALCANTARILLADO|CONDUCCI|CLORACI|DESAZOLVE|PLUVIAL|EMISOR)") { return $script:rubro_agua }
    if ($t -match "(ALUMBRADO|LUMINAR|ELECTRIF|ELECTRICA|LAMPARAS|SUBESTACI|POSTES)") { return $script:rubro_alum }
    if ($t -match "(PARQUE|DEPORTIV|CANCHA|PLAZA|JARDIN|CAMPO|GIMNASIO|VERDE|INFANTIL|POLIDEPORTIVO|VELARIA|SKATE|PISTA)") { return $script:rubro_espacios }
    if ($t -match "(EDIFICI|MERCADO|SALUD|OFICINA|ESCUELA|AULA|BIBLIOTECA|COMEDOR|COMUNITARIO|DIF|CASONA|PANTEON|AUDITORIO|CENDI)") { return $script:rubro_edif }
    if ($t -match "(PAVIMENT|ASFALT|CONCRETO|SOBRECARPETA|CALZADA|AVENIDA|GUARNICI|BANQUETA|BACHEO|CALLE|VIALIDAD|CRUCERO|EMBOQUILLADO|SENALIZACI|PASO DESNIVEL|PUENTE)") { return $script:rubro_vial }
    return $script:rubro_infra
}

Write-Host "Regenerating obras_data.js..."

[xml]$xml1 = Get-Content $kml1 -Encoding UTF8
[xml]$xml2 = Get-Content $kml2 -Encoding UTF8

$obrasList = New-Object System.Collections.ArrayList
$idCounter = 1

# 1. Process 2022-2024
foreach ($f in $xml1.kml.Document.Folder) {
    $layerName = Clean-Text $f.name
    $anio = 2024
    if ($layerName -match "2022") { $anio = 2022 }
    elseif ($layerName -match "2023") { $anio = 2023 }
    elseif ($layerName -match "2024") { $anio = 2024 }
    
    $pms = $f.Placemark
    $list = if ($pms -is [array]) { $pms } elseif ($null -ne $pms) { @($pms) } else { @() }
    
    foreach ($p in $list) {
        $dict = @{}
        if ($p.ExtendedData -and $p.ExtendedData.Data) {
            foreach ($d in $p.ExtendedData.Data) {
                $k = (Clean-Text $d.name).ToUpper()
                $v = Clean-Text $d.InnerText
                $dict[$k] = $v
            }
        }
        
        $pname = Clean-Text $p.name
        $desc = ""
        foreach ($k in $dict.Keys) {
            if ($k -like "*DESCRIP*") {
                if ($dict[$k].Length -gt $desc.Length) { $desc = $dict[$k] }
            }
        }
        if (-not $desc) { $desc = Clean-Text $p.description }
        
        $colonia = ""
        foreach ($k in $dict.Keys) {
            if ($k -like "*COLONIA*" -or $k -like "*COMUNIDAD*" -or $k -like "*FRACC*") {
                $colonia = $dict[$k]; break
            }
        }
        
        # Monto extraction: explicit first, then regex from all text
        $montoVal = 0.0
        foreach ($k in $dict.Keys) {
            if ($k -like "*MONTO*" -or $k -like "*INVERSION*" -or $k -like "*COSTO*") {
                $montoVal = Extract-Amount $dict[$k]
                if ($montoVal -gt 0) { break }
            }
        }
        if ($montoVal -eq 0) {
            $montoVal = Extract-Amount $desc
        }
        
        $currentId = $idCounter++
        $localFotoPath = ""
        $fileName = "obra_$currentId.jpg"
        $destFile = Join-Path $imgDir $fileName
        if (Test-Path $destFile) {
            $localFotoPath = "assets/img/obras/$fileName"
        }
        
        $rubro = Classify-Rubro $desc $pname ""
        
        $geomType = "Point"
        $lat = 0.0
        $lng = 0.0
        $ptsList = @()
        
        if ($p.Point) {
            $geomType = "Point"
            $cparts = (Clean-Text $p.Point.coordinates) -split ","
            if ($cparts.Length -ge 2) {
                $lng = [double]::Parse($cparts[0], [System.Globalization.CultureInfo]::InvariantCulture)
                $lat = [double]::Parse($cparts[1], [System.Globalization.CultureInfo]::InvariantCulture)
            }
        } elseif ($p.LineString) {
            $geomType = "LineString"
            $rawCoords = (Clean-Text $p.LineString.coordinates) -split "\s+"
            foreach ($rc in $rawCoords) {
                $cp = $rc -split ","
                if ($cp.Length -ge 2) {
                    $clng = [double]::Parse($cp[0], [System.Globalization.CultureInfo]::InvariantCulture)
                    $clat = [double]::Parse($cp[1], [System.Globalization.CultureInfo]::InvariantCulture)
                    $ptsList += ,@([Math]::Round($clat, 6), [Math]::Round($clng, 6))
                }
            }
            if ($ptsList.Count -gt 0) {
                $lat = $ptsList[0][0]
                $lng = $ptsList[0][1]
            }
        }
        
        # Fix name if empty or System.Xml.XmlElement
        $titulo = $pname
        if (-not $titulo -or $titulo -eq "System.Xml.XmlElement" -or $titulo -like "L*nea*") {
            if ($desc) {
                $firstSentence = ($desc -split "\r&bull;\n")[0].Trim()
                $titulo = if ($firstSentence.Length -gt 85) { $firstSentence.Substring(0, 82) + "..." } else { $firstSentence }
            } else {
                $titulo = "Obra Municipal $anio #$currentId"
            }
        } elseif ($desc -and ($pname.Length -lt 15 -or $pname -like "PRODDER*" -or $pname -like "FISM*" -or $pname -like "DIRECTA*" -or $pname -like "FONDO*")) {
            $firstSentence = ($desc -split "\r&bull;\n")[0].Trim()
            if ($firstSentence.Length -gt 10) {
                $titulo = if ($firstSentence.Length -gt 85) { $firstSentence.Substring(0, 82) + "..." } else { $firstSentence }
            }
        }
        
        $item = [PSCustomObject]@{
            id = $currentId
            anio = $anio
            clave = if ($pname -and $pname -ne "System.Xml.XmlElement") { $pname } else { "OBRA-$anio-$currentId" }
            nombre = $titulo
            descripcion = if ($desc) { $desc } else { $titulo }
            rubro = $rubro
            monto = [Math]::Round($montoVal, 2)
            colonia = if ($colonia) { $colonia } else { "Aguascalientes" }
            distrito = "Municipio de Aguascalientes"
            foto = $localFotoPath
            fotoRemota = ""
            tipoGeom = $geomType
            lat = [Math]::Round($lat, 6)
            lng = [Math]::Round($lng, 6)
            linea = $ptsList
            fuente = "Obra P" + $u_acute + "blica 2022-2024"
        }
        [void]$obrasList.Add($item)
    }
}

# 2. Process PAOP 2025
foreach ($f in $xml2.kml.Document.Folder) {
    $layerName = Clean-Text $f.name
    $pms = $f.Placemark
    $list = if ($pms -is [array]) { $pms } elseif ($null -ne $pms) { @($pms) } else { @() }
    
    foreach ($p in $list) {
        $dict = @{}
        if ($p.ExtendedData -and $p.ExtendedData.Data) {
            foreach ($d in $p.ExtendedData.Data) {
                $k = (Clean-Text $d.name).ToUpper()
                $v = Clean-Text $d.InnerText
                $dict[$k] = $v
            }
        }
        
        $pname = Clean-Text $p.name
        $desc = ""
        foreach ($k in $dict.Keys) {
            if ($k -like "*DESCRIP*") {
                if ($dict[$k].Length -gt $desc.Length) { $desc = $dict[$k] }
            }
        }
        if (-not $desc) { $desc = Clean-Text $p.description }
        
        $colonia = ""
        foreach ($k in $dict.Keys) {
            if ($k -like "*COLONIA*" -or $k -like "*COMUNIDAD*") { $colonia = $dict[$k]; break }
        }
        
        $concepto = ""
        foreach ($k in $dict.Keys) {
            if ($k -like "*CONCEPTO*") { $concepto = $dict[$k]; break }
        }
        
        $montoVal = 0.0
        foreach ($k in $dict.Keys) {
            if ($k -like "*MONTO*" -or $k -like "*INVERSION*" -or $k -like "*COSTO*") {
                $montoVal = Extract-Amount $dict[$k]
                if ($montoVal -gt 0) { break }
            }
        }
        if ($montoVal -eq 0) {
            $montoVal = Extract-Amount $desc
        }
        if ($montoVal -eq 0) {
            $montoVal = Extract-Amount $concepto
        }
        
        $currentId = $idCounter++
        $localFotoPath = ""
        $fileName = "obra_$currentId.jpg"
        $destFile = Join-Path $imgDir $fileName
        if (Test-Path $destFile) {
            $localFotoPath = "assets/img/obras/$fileName"
        }
        
        $rubro = Classify-Rubro $desc $pname $concepto
        
        $geomType = "Point"
        $lat = 0.0
        $lng = 0.0
        $ptsList = @()
        
        if ($p.Point) {
            $geomType = "Point"
            $cparts = (Clean-Text $p.Point.coordinates) -split ","
            if ($cparts.Length -ge 2) {
                $lng = [double]::Parse($cparts[0], [System.Globalization.CultureInfo]::InvariantCulture)
                $lat = [double]::Parse($cparts[1], [System.Globalization.CultureInfo]::InvariantCulture)
            }
        } elseif ($p.LineString) {
            $geomType = "LineString"
            $rawCoords = (Clean-Text $p.LineString.coordinates) -split "\s+"
            foreach ($rc in $rawCoords) {
                $cp = $rc -split ","
                if ($cp.Length -ge 2) {
                    $clng = [double]::Parse($cp[0], [System.Globalization.CultureInfo]::InvariantCulture)
                    $clat = [double]::Parse($cp[1], [System.Globalization.CultureInfo]::InvariantCulture)
                    $ptsList += ,@([Math]::Round($clat, 6), [Math]::Round($clng, 6))
                }
            }
            if ($ptsList.Count -gt 0) {
                $lat = $ptsList[0][0]
                $lng = $ptsList[0][1]
            }
        }
        
        $titulo = $pname
        if (-not $titulo -or $titulo -eq "System.Xml.XmlElement" -or $titulo -like "L*nea*") {
            if ($desc) {
                $firstSentence = ($desc -split "\r&bull;\n")[0].Trim()
                $titulo = if ($firstSentence.Length -gt 85) { $firstSentence.Substring(0, 82) + "..." } else { $firstSentence }
            } else {
                $titulo = "Obra PAOP 2025 #$currentId"
            }
        } elseif ($pname -like "2025-PDM*" -or $pname -like "2025-FAIS*") {
            if ($desc) {
                $firstSentence = ($desc -split "\r&bull;\n")[0].Trim()
                if ($firstSentence.Length -gt 8) {
                    $titulo = if ($firstSentence.Length -gt 80) { $firstSentence.Substring(0, 77) + "..." } else { $firstSentence }
                }
            }
        }
        
        $item = [PSCustomObject]@{
            id = $currentId
            anio = 2025
            clave = if ($pname -and $pname -ne "System.Xml.XmlElement") { $pname } else { "PAOP-2025-$currentId" }
            nombre = $titulo
            descripcion = if ($desc) { $desc } else { $titulo }
            rubro = $rubro
            monto = [Math]::Round($montoVal, 2)
            colonia = if ($colonia) { $colonia } else { "Aguascalientes" }
            distrito = "Municipio de Aguascalientes"
            foto = $localFotoPath
            fotoRemota = ""
            tipoGeom = $geomType
            lat = [Math]::Round($lat, 6)
            lng = [Math]::Round($lng, 6)
            linea = $ptsList
            fuente = "PAOP 2025 ($layerName)"
        }
        [void]$obrasList.Add($item)
    }
}

Write-Host "Total Obras Processed: $($obrasList.Count)"
$withAmt = ($obrasList | Where-Object { $_.monto -gt 0 }).Count
$noAmt = ($obrasList | Where-Object { $_.monto -eq 0 }).Count
Write-Host "Obras con monto: $withAmt | Obras sin monto: $noAmt"

# Metrics
$totalObras = $obrasList.Count
$totalInversion = ($obrasList | Measure-Object -Property monto -Sum).Sum
Write-Host "Inversion Total Recuperada: `$ $([Math]::Round($totalInversion, 2))"

$aniosGroup = $obrasList | Group-Object anio | Sort-Object Name
$porAnioArray = @()
foreach ($ag in $aniosGroup) {
    $sumA = ($ag.Group | Measure-Object -Property monto -Sum).Sum
    $porAnioArray += @{
        anio = [int]$ag.Name
        total = $ag.Count
        inversion = [Math]::Round($sumA, 2)
    }
}

$rubrosGroup = $obrasList | Group-Object rubro | Sort-Object Count -Descending
$porRubroArray = @()
$colorMap = @{
    "$rubro_vial" = "#009FB9"
    "$rubro_agua" = "#0A3B66"
    "$rubro_alum" = "#F5A800"
    "$rubro_espacios" = "#72B626"
    "$rubro_edif" = "#E11482"
    "$rubro_infra" = "#7C3AED"
}
$iconMap = @{
    "$rubro_vial" = "navigation"
    "$rubro_agua" = "droplets"
    "$rubro_alum" = "zap"
    "$rubro_espacios" = "trees"
    "$rubro_edif" = "building-2"
    "$rubro_infra" = "hammer"
}

foreach ($rg in $rubrosGroup) {
    $sumR = ($rg.Group | Measure-Object -Property monto -Sum).Sum
    $c = $colorMap[$rg.Name]
    if (-not $c) { $c = "#009FB9" }
    $ic = $iconMap[$rg.Name]
    if (-not $ic) { $ic = "hammer" }
    $porRubroArray += @{
        nombre = $rg.Name
        total = $rg.Count
        inversion = [Math]::Round($sumR, 2)
        color = $c
        icono = $ic
    }
}

# Export JS
$sb = New-Object System.Text.StringBuilder
[void]$sb.AppendLine("/**")
[void]$sb.AppendLine(" * PIMAgs - Modulo de Obra Publica de Aguascalientes")
[void]$sb.AppendLine(" * Total de proyectos georreferenciados: $totalObras")
[void]$sb.AppendLine(" * Total de obras con inversion identificada: $withAmt")
[void]$sb.AppendLine(" * Inversion total calculada: `$ $([Math]::Round($totalInversion, 2)) MXN")
[void]$sb.AppendLine(" */")
[void]$sb.AppendLine("")

$metricsObj = @{
    totalObras = $totalObras
    inversionTotal = [Math]::Round($totalInversion, 2)
    porAnio = $porAnioArray
    porRubro = $porRubroArray
}

$metricsJson = $metricsObj | ConvertTo-Json -Depth 5
[void]$sb.AppendLine("window.OBRAS_METRICAS = $metricsJson;")
[void]$sb.AppendLine("")

$itemsJson = $obrasList | ConvertTo-Json -Depth 5
[void]$sb.AppendLine("window.OBRAS_ITEMS = $itemsJson;")
[void]$sb.AppendLine("")

[System.IO.File]::WriteAllText($outJs, $sb.ToString(), $utf&deg; oBom)
Write-Host "SUCCESS: Generated clean UTF-8 $outJs"
