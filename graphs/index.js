
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

    // Iterate over each edge and extract source and target vertices
    edgesArray.forEach(edge => {
    let [source, target] = edge.split(",");
    // Increment the source and target vertices to start from 1
    source = parseInt(source) + 1;
    target = parseInt(target) + 1;

    // Add nodes to the nodes object (this ensures no duplicates)
    nodes[source] = { data: { id: source.toString() } };
    nodes[target] = { data: { id: target.toString() } };

    // Add edge to the edges array
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
mycys.forEach(function (c) {
    const imgURI = c.png();

    // Create a container div for the image and the name
    const containerDiv = document.createElement('div');
    containerDiv.style.position = 'relative';
    containerDiv.style.display = 'inline-block'; // To display images side by side
    containerDiv.style.margin = '10px'; // Some spacing between images
    containerDiv.style.fontSize = '25px';

    // Create the image
    const img = new Image();
    img.src = imgURI;
    containerDiv.appendChild(img);

    // Create the name label
    const nameLabel = document.createElement('span');
    nameLabel.innerText = `G(${cnt+1})`;
    nameLabel.style.position = 'absolute';
    nameLabel.style.top = '5px'; // Adjust this to position the name over the image
    nameLabel.style.left = '5px'; // Adjust this to position the name beside the image
    nameLabel.style.backgroundColor = 'rgba(255, 255, 255, 0.7)'; // Optional: Add a background to make the name more visible
    nameLabel.style.padding = '2px 5px'; // Some padding for the name label
    containerDiv.appendChild(nameLabel);

    document.body.appendChild(containerDiv);
    document.getElementById("g" + cnt).hidden = true;
    cnt++;
});

// Create the table and table body
const table = document.createElement('table');
const tbody = document.createElement('tbody');

// Create header row for column labels
const headerRow = document.createElement('tr');
headerRow.appendChild(document.createElement('th')); // Empty cell for top-left corner
mycys.forEach(function (colGraph) {
    const th = document.createElement('th');
    th.innerText = `G(${cnt+1})`;
    headerRow.appendChild(th);
    cnt++;
});
tbody.appendChild(headerRow);
cnt = 0; 
mycys.forEach(function (rowGraph) {
    const row = document.createElement('tr');

    // Add row label
    const rowLabel = document.createElement('th');
    rowLabel.innerText = `G(${cnt+1})`;
    row.appendChild(rowLabel);

    mycys.forEach(function (colGraph) {
        // Create the cell
        const cell = document.createElement('td');
        cell.innerText = '1';
        cell.style.textAlign = 'center';
        cell.style.border = '1px solid black';
        cell.style.padding = '5px';
        cell.style.width = '30px'; 
        cell.style.height = '30px';
        cell.style.fontSize = '20px';
        row.appendChild(cell);
    });

    tbody.appendChild(row);
    cnt++;
});

// Append the table body to the table
table.appendChild(tbody);

// Style the table
table.style.borderCollapse = 'collapse';
table.style.width = '100%';

// Append the table to the body
document.body.appendChild(table);
}