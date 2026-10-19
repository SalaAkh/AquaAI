$ppt = New-Object -ComObject PowerPoint.Application
$file = "D:\User\Desktop\AquaAI\docs\AquaAI_Idea_Miners_Pitch.pptx"
$out = "D:\User\Desktop\AquaAI\docs\AquaAI_Idea_Miners_Pitch.pdf"
if (Test-Path $out) { Remove-Item $out -Force }
$pres = $ppt.Presentations.Open($file, [Microsoft.Office.Core.MsoTriState]::msoTrue, [Microsoft.Office.Core.MsoTriState]::msoFalse, [Microsoft.Office.Core.MsoTriState]::msoFalse)
$pres.SaveAs($out, 32) # 32 = ppSaveAsPDF
$pres.Close()
$ppt.Quit()
[System.Runtime.Interopservices.Marshal]::ReleaseComObject($ppt) | Out-Null
Write-Host "PDF created: $(Test-Path $out)"
if (Test-Path $out) {
    $item = Get-Item $out
    Write-Host "File size: $($item.Length) bytes ($([math]::Round($item.Length / 1MB, 2)) MB)"
}
