# Script para configurar variáveis de ambiente do Android
# Execute este script como Administrador para configurar permanentemente

$androidSdkPath = "C:\Users\viell\AppData\Local\Android\Sdk"

Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "  Configuração do Android SDK" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

# Verificar se SDK existe
if (Test-Path $androidSdkPath) {
    Write-Host "✓ Android SDK encontrado em:" -ForegroundColor Green
    Write-Host "  $androidSdkPath" -ForegroundColor Yellow
    Write-Host ""
    
    # Configurar ANDROID_HOME para sessão atual
    $env:ANDROID_HOME = $androidSdkPath
    Write-Host "✓ ANDROID_HOME configurado para esta sessão" -ForegroundColor Green
    Write-Host ""
    
    # Adicionar ao PATH da sessão atual
    $env:Path += ";$androidSdkPath\platform-tools"
    $env:Path += ";$androidSdkPath\tools"
    $env:Path += ";$androidSdkPath\tools\bin"
    Write-Host "✓ Ferramentas Android adicionadas ao PATH" -ForegroundColor Green
    Write-Host ""
    
    # Mostrar comandos para configuração permanente
    Write-Host "=============================================" -ForegroundColor Cyan
    Write-Host "  Para configurar PERMANENTEMENTE:" -ForegroundColor Yellow
    Write-Host "=============================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Execute os seguintes comandos em um PowerShell como ADMINISTRADOR:" -ForegroundColor White
    Write-Host ""
    Write-Host '[System.Environment]::SetEnvironmentVariable("ANDROID_HOME", "' + $androidSdkPath + '", "User")' -ForegroundColor Magenta
    Write-Host ""
    Write-Host "Ou manualmente:" -ForegroundColor White
    Write-Host "1. Abra 'Configurações do Sistema' (Win + Pause)" -ForegroundColor White
    Write-Host "2. Clique em 'Configurações avançadas do sistema'" -ForegroundColor White
    Write-Host "3. Clique em 'Variáveis de Ambiente'" -ForegroundColor White
    Write-Host "4. Em 'Variáveis do usuário', clique em 'Novo'" -ForegroundColor White
    Write-Host "5. Nome: ANDROID_HOME" -ForegroundColor White
    Write-Host "6. Valor: $androidSdkPath" -ForegroundColor White
    Write-Host ""
    
    Write-Host "=============================================" -ForegroundColor Cyan
    Write-Host "  Testando configuração:" -ForegroundColor Cyan
    Write-Host "=============================================" -ForegroundColor Cyan
    Write-Host ""
    
    # Testar adb
    if (Test-Path "$androidSdkPath\platform-tools\adb.exe") {
        Write-Host "✓ ADB encontrado" -ForegroundColor Green
        & "$androidSdkPath\platform-tools\adb.exe" version
    } else {
        Write-Host "✗ ADB não encontrado" -ForegroundColor Red
    }
    
    Write-Host ""
    Write-Host "=============================================" -ForegroundColor Cyan
    Write-Host "Configuração concluída para esta sessão!" -ForegroundColor Green
    Write-Host "Para tornar permanente, execute o comando acima como Admin" -ForegroundColor Yellow
    Write-Host "=============================================" -ForegroundColor Cyan
    
} else {
    Write-Host "✗ Android SDK não encontrado em: $androidSdkPath" -ForegroundColor Red
    Write-Host ""
    Write-Host "Instale o Android Studio em:" -ForegroundColor Yellow
    Write-Host "https://developer.android.com/studio" -ForegroundColor Cyan
}
