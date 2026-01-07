cd ..
del MarkovChains.exe

call neu.cmd build --release --embed-resources

move .\dist\MarkovChains\MarkovChains-win_x64.exe MarkovChains.exe
rmdir /S /Q dist
cd desktop-app