cd ..
del MarkovChains.exe
del MarkovChains_Linux_MacOS.zip
call neu.cmd build --release
cd desktop-app
"C:\Program Files (x86)\NSIS\makensis.exe" Launcher.nsi
move MarkovChains.exe ..
cd ..
move .\dist\MarkovChains-release.zip MarkovChains_Linux_MacOS.zip
rmdir /S /Q dist
cd desktop-app