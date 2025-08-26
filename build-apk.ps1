# ----------------------------
# Build APK Offline Script
# ----------------------------

# --- 1. Set Java Home ---
$javaPath = "C:\Program Files\Eclipse Adoptium\jdk-17.0.16.8-hotspot"
[Environment]::SetEnvironmentVariable("JAVA_HOME", $javaPath, "User")
$env:JAVA_HOME = $javaPath
$env:PATH += ";$javaPath\bin"

# --- 2. Set Android SDK Home ---
$androidSdkPath = "C:\Users\sandi\AppData\Local\Android\Sdk"
[Environment]::SetEnvironmentVariable("ANDROID_HOME", $androidSdkPath, "User")
$env:ANDROID_HOME = $androidSdkPath
$env:PATH += ";$androidSdkPath\platform-tools"

# --- 3. Verify Java ---
Write-Host "`nChecking Java version..."
java -version
javac -version

# --- 4. Verify ADB ---
Write-Host "`nChecking ADB version..."
adb --version

# --- 5. Update SDK versions in root build.gradle ---
$rootBuildGradle = "C:\Users\sandi\physio app\frontend\android\build.gradle"
if (Test-Path $rootBuildGradle) {
    (Get-Content $rootBuildGradle) -replace 'compileSdkVersion\s*=\s*\d+', 'compileSdkVersion = 36' `
                                  -replace 'targetSdkVersion\s*=\s*\d+', 'targetSdkVersion = 36' |
    Set-Content $rootBuildGradle
    Write-Host "Updated compileSdkVersion and targetSdkVersion to 36 in root build.gradle"
} else {
    Write-Host "Root build.gradle not found at $rootBuildGradle"
}

# --- 6. Move to Android Project Directory ---
$androidProjectPath = "C:\Users\sandi\physio app\frontend\android"
Set-Location $androidProjectPath

# --- 7. Verify Gradle Wrapper ---
if (Test-Path ".\gradlew.bat") {
    Write-Host "`nChecking Gradle version..."
    .\gradlew.bat -v
} else {
    Write-Host "`nGradle wrapper not found. Please run 'npx cap add android' first."
    exit
}

# --- 8. Build APK ---
Write-Host "`nBuilding Debug APK..."
.\gradlew.bat assembleDebug

Write-Host "`nScript finished. Check for errors above."
