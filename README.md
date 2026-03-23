# VisualizeSeveralGraphs.github.io

A web tool that takes a comma-separated list of graphs in [g6 format](https://users.cecs.anu.edu.au/~bdm/data/formats.txt) and visualizes them in an interactive tabular grid.

Each graph is decoded by a WebAssembly module (compiled from C++) and rendered as an interactive [Cytoscape.js](https://js.cytoscape.org/) canvas. Nodes are labeled starting from 1, and the layout is computed automatically using the force-directed (CoSE) algorithm.

**Usage:** Paste one or more comma-separated g6 strings into the input field and click "Go".

- Compile to wasm file with: 
`em++ -sEXPORTED_RUNTIME_METHODS=stringToUTF8,lengthBytesUTF8,UTF8ToString -s MALLOC=emmalloc main.cpp -s EXPORTED_FUNCTIONS=_malloc,_free -sALLOW_MEMORY_GROWTH -s WASM=1 -o main.js`


