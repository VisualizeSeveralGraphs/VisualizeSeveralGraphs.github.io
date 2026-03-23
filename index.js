function passStringToWasm(str) {
    const lengthBytes = Module.lengthBytesUTF8(str) + 1;
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

    return { nodes: Object.values(nodes), edges };
}

function send() {
    var strings = document.getElementById("strings").value;
    $('#mytable').empty();
    var mytable = $('#mytable');
    var str = "";
    var cnt = 0;
    var cys = [];
    strings.split(',').forEach(function(d) {
        str += "<div id='g" + cnt + "'></div>";
        cnt++;
    });
    mytable.append(str);
    cnt = 0;
    strings.split(',').forEach(function(d) {
        var res = passStringToWasm(d);
        var tmpcy = cytoscape({
            container: document.getElementById("g" + cnt),
            style: [
                {
                    selector: 'node',
                    style: {
                        'background-color': 'lightgray',
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
                    }
                }
            ]
        });
        cys.push(tmpcy);
        const graph = convertToCytoscapeGraph(res);
        tmpcy.elements().remove();
        tmpcy.add(graph.nodes);
        tmpcy.add(graph.edges);
        cnt++;
    });

    cys.forEach(function(c) {
        c.layout({ name: "cose" }).run();
    });
}
