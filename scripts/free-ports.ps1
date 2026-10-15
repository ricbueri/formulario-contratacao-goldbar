# Libera portas usadas pelo dev deste projeto (API + Vite)
$ports = 3002, 5173, 5174, 5175
foreach ($port in $ports) {
  $conns = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
  foreach ($c in $conns) {
    $procId = $c.OwningProcess
    if (-not $procId) { continue }
    $name = (Get-Process -Id $procId -ErrorAction SilentlyContinue).ProcessName
    if ($name -eq "node") {
      Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
      Write-Host "Encerrado node (PID $procId) na porta $port"
    }
  }
}
