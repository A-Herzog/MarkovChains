!define PrgName "Markov chain simulator"
!define PrgTempPathName "MarkovChains"
!define PrgFileName "MarkovChains"
!define PrgIcon "..\docs\favicon.ico"
!define Copyright "Alexander Herzog"

Name "${PrgName}"
Caption "${PrgName}"
Icon "${PrgIcon}"
OutFile "${PrgFileName}.exe"

VIProductVersion "1.0.0.0"
VIAddVersionKey "ProductName" "${PrgName}"
VIAddVersionKey "FileDescription" "${PrgName}"
VIAddVersionKey "LegalCopyright" "${Copyright}"
VIAddVersionKey "CompanyName" "${Copyright}"
VIAddVersionKey "FileVersion" "1.0"
VIAddVersionKey "InternalName" "${PrgName}"

ManifestDPIAware true

SilentInstall silent
AutoCloseWindow true
ShowInstDetails nevershow
;ShowInstDetails show

RequestExecutionLevel user

Section ""
  SetOutPath "$TEMP\${PrgTempPathName}"

  File "..\dist\MarkovChains\MarkovChains-win_x64.exe"
  File "..\dist\MarkovChains\resources.neu"
  ; File "..\dist\MarkovChains\WebView2Loader.dll"

  ExecWait "$TEMP\${PrgTempPathName}\MarkovChains-win_x64.exe"

  RmDir /r "$TEMP\${PrgTempPathName}"
SectionEnd