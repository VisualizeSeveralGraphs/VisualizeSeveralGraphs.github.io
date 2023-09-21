# VisualizeSeveralGraphs.github.io
Visualize Several Graphs

- Compile to wasm file with: 
`em++ -sEXPORTED_RUNTIME_METHODS=stringToUTF8,lengthBytesUTF8,UTF8ToString -s MALLOC=emmalloc main.cpp -s EXPORTED_FUNCTIONS=_malloc,_free -sALLOW_MEMORY_GROWTH -s WASM=1 -o main.js`


