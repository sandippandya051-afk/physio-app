# ---------------------------------------------
# Physio App: Offline APK Build Script (PowerShell)
# ---------------------------------------------

# --- 1. Set Java Home ---
$javaPath = "C:\Program Files\Eclipse Adoptium\jdk-17.0.16.8-hotspot"
if (-Not (Test-Path $javaPath)) {
    Write-Host "ERROR: Java path not found: $javaPath" -ForegroundColor Red
    exit
}
[Environment]::SetEnvironmentVariable("JAVA_HOME", $javaPath, "User")
$env:JAVA_HOME = $javaPath
$env:PATH = "$javaPath\bin;$env:PATH"

# --- 2. Set Android SDK Home ---
$androidSdkPath = "C:\Users\sandi\AppData\Local\Android\Sdk"
if (-Not (Test-Path $androidSdkPath)) {
    Write-Host "ERROR: Android SDK path not found: $androidSdkPath" -ForegroundColor Red
    exit
}
[Environment]::SetEnvironmentVariable("ANDROID_HOME", $androidSdkPath, "User")
$env:ANDROID_HOME = $androidSdkPath
$env:PATH = "$androidSdkPath\platform-tools;$env:PATH"

# --- 3. Verify Java ---
Write-Host "`nChecking Java version..."
java -version
javac -version

# --- 4. Verify ADB ---
Write-Host "`nChecking ADB version..."
adb --version

# --- 5. Move to Android Project Directory ---
$androidProjectPath = "C:\Users\sandi\physio app\frontend\android"
if (-Not (Test-Path $androidProjectPath)) {
    Write-Host "ERROR: Android project path not found: $androidProjectPath" -ForegroundColor Red
    exit
}
Set-Location $androidProjectPath

# --- 6. Verify Gradle Wrapper ---
if (-Not (Test-Path ".\gradlew.bat")) {
    Write-Host "`nGradle wrapper not found. Please run 'npx cap add android' first." -ForegroundColor Red
    exit
}

Write-Host "`nChecking Gradle version..."
.\gradlew.bat -v

# --- 7. Build APK Offline ---
Write-Host "`nBuilding Debug APK (offline)..."
.\gradlew.bat assembleDebug --offline

# --- 8. Completion Message ---
Write-Host "`nScript finished. Check 'app\build\outputs\apk\debug' for your APK." -ForegroundColor Green
