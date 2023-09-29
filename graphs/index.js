
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
    // Split the string by "--" to get individual edges
    const edgesArray = edgeString.split("--").slice(0, -1); // Remove the last empty element due to extra "--"

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

var uuid = guid();
var type = $('#graphType').find('option:selected').text();
mycys = [];

function send() {
    var strings = document.getElementById("strings").value;
    $('#mytable').empty();
    var mytable =$('#mytable');
    var str = "";
    var cnt = 0;
    var cys = [];
    strings.split(',').forEach(function(d) {
        str+="<div id='g" + cnt + "'></div>";
        cnt++;
    });
    mytable.append(str);
    cnt = 0;
    strings.split(',').forEach(function(d) {
        var res = passStringToWasm(d);
        var tmpcy = cytoscape({
            container: document.getElementById("g" + cnt),
            style: [ // the stylesheet for the graph
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

    cys.forEach(function (c) {
        c.layout({name:"cose"}).run();
        c.layout({name:"cose"}).run();
    });
    mycys = cys;
}

function create_images() {
    let cnt = 0;
    $.each(mycys, function(index, c) {
        const imgURI = c.png();
        const containerDiv = $("<div>").addClass("image-container");

        $("<img>").attr("src", imgURI).appendTo(containerDiv);

        $("<span>").addClass("graph-name-label").text(`G(${cnt+1})`).appendTo(containerDiv);

        $("#imageContainer").append(containerDiv);
        $("#g" + cnt).hide();
        cnt++;
    });

        const newWindow = window.open("", "_blank");
        const table = $("<table>").css({
            borderCollapse: 'collapse',
            width: '100%'
        });
    
        const headerRow = $("<tr>");
        headerRow.append($("<th>")); 
        $.each(mycys, function() {
            headerRow.append($("<th>").text(`G(${++cnt})`));
        });
        table.append(headerRow);
    
        cnt = 0;
        $.each(mycys, function() {
            const row = $("<tr>");
            row.append($("<th>").text(`G(${++cnt})`));
            $.each(mycys, function() {
                row.append($("<td>").addClass("table-cell").text('1'));
            });
            table.append(row);
        });
    
        newWindow.document.write("<html><head><title>Graph Table</title>");
        newWindow.document.write("<style>");
        newWindow.document.write("table { border-collapse: collapse; width: 100%; }");
        newWindow.document.write("th, td { border: 1px solid black; padding: 5px; text-align: center; }");
        newWindow.document.write("td.table-cell { width: 30px; height: 30px; font-size: 20px; }");
        newWindow.document.write("</style>");
        newWindow.document.write("</head><body>");
        newWindow.document.write(table.prop('outerHTML'));
        newWindow.document.write("</body></html>");
        newWindow.document.close(); 
}