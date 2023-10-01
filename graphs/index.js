
function passStringToWasm(str) {
    const lengthBytes = Module.lengthBytesUTF8(str) + 1; // +1 for the null terminator
    const stringOnWasmHeap = Module._malloc(lengthBytes);
    Module.stringToUTF8(str, stringOnWasmHeap, lengthBytes);
    const returnedPointer = Module.__Z12print_stringPKc(stringOnWasmHeap);
    const returnedString = Module.UTF8ToString(returnedPointer);
    Module._free(returnedPointer); 
    Module._free(stringOnWasmHeap);
    return returnedString;
}

function convertToCytoscapeGraph(edgeString) {
    const edgesArray = edgeString.split("--").slice(0, -1); 

    const nodes = {};
    const edges = [];

    edgesArray.forEach(edge => {
    let [source, target] = edge.split(",");
    source = parseInt(source) + 1;
    target = parseInt(target) + 1;

    nodes[source] = { data: { id: source.toString() } };
    nodes[target] = { data: { id: target.toString() } };

    edges.push({
        data: {
            id: `${source}-${target}`,
            source: source.toString(),
            target: target.toString()
        }
    });
    });

    return {
    nodes: Object.values(nodes),
    edges: edges
    };
}

mycys = [];

function addElements() {
    var strings = document.getElementById("strings").value;
    var cnt = 0;
    strings.split(',').forEach(function(d) {
        mytable.append("div").attr("id", "g" + cnt);
        cnt++;
    });
}

function send() {
    var strings = document.getElementById("strings").value;
    d3.select('#mytable').html(''); 
    var mytable = d3.select('#mytable');
    var str = "";
    var cnt = 0;
    var cys = [];
    // strings.split(',').forEach(function(d) {
    //     mytable.append("div").attr("id", "g" + cnt);
    //     cnt++;
    // });
    cnt = 0;
    strings.split(',').forEach(function(d) {
        strings.split(',').forEach(function(d) {
            var res = passStringToWasm(d);
            var tmpcy = cytoscape({
                container: d3.select("#g" + cnt),
                style: [ 
                    {
                        selector: 'node',
                        style: {
                            'background-color': 'lightgray',
                            'label': 'data(label)',
                            'text-valign': 'center',
                            'background-opacity': 0.7,
                            'border-width': 1,
                            'border-color': 'black',
                            'label': function(ele) {
                                    return (parseInt(ele.id()) + 1).toString();
                            }
                        }
                    },
                    {
                        selector: '.selected',
                        style: {
                            'background-color': 'rgba(150, 211, 255,0.6)',
                            'label': 'data(label)',
                            'text-valign': 'center'
                        }
                    },
                    {
                        selector: 'edge',
                        style: {
                            'curve-style': 'bezier'
                            // 'target-arrow-shape': arrow
                        }
                    }]
            });
            cys.push(tmpcy);
            const graph = convertToCytoscapeGraph(res);
            var nodes = graph.nodes;
            var edges = graph.edges;
            tmpcy.elements().remove();
            tmpcy.add(nodes);
            tmpcy.add(edges);
            cnt = cnt + 1;
        });
    });
    

    cys.forEach(function (c) {
        c.layout({name:"cose"}).run();
        c.layout({name:"cose"}).run();
    });
    mycys = cys;
}

function create_images() {
    let cnt = 0;
    mycys.forEach(function(c) {
        const imgURI = c.png();
        const containerDiv = d3.select("#imageContainer").append("div").attr("class", "image-container");

        containerDiv.append("img").attr("src", imgURI);

        containerDiv.append("span").attr("class", "graph-name-label").text(`G${cnt+1}`);

        d3.select(`#g${cnt}`).style("display", "none");
        cnt++;
    });

    const newWindow = window.open("", "_blank");
    const table = d3.select(newWindow.document.body).append("table").style({
        borderCollapse: 'collapse',
        width: '100%'
    });

    const headerRow = table.append("tr");
    headerRow.append("th");
    cnt = 0;
    mycys.forEach(function() {
        headerRow.append("th").text(`G${++cnt}`);
    });

    cnt = 0;
    mycys.forEach(function() {
        const row = table.append("tr");
        row.append("th").text(`G${++cnt}`);
        mycys.forEach(function() {
            row.append("td").attr("class", "table-cell").text('1');
        });
    });

    newWindow.document.write("<head><title>Graph Table</title>");
    newWindow.document.write('<link rel="stylesheet" type="text/css" href="tableStyles.css">'); // Link the external CSS
    newWindow.document.write("</head>");
}