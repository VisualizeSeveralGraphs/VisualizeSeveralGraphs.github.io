
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

        $("<span>").addClass("graph-name-label").text(`G${cnt+1}`).appendTo(containerDiv);

        $("#imageContainer").append(containerDiv);
        $("#g" + cnt).hide();
        cnt++;
    });

    const newWindow = window.open("", "_blank", 1);
    const table = $("<table>").css({
        borderCollapse: 'collapse',
        width: '100%'
    });

    const headerRow = $("<tr>");
    headerRow.append($("<th>")); 
    cnt = 0;
    $.each(mycys, function() {
        headerRow.append($("<th>").text(`G${++cnt}`));
    });
    table.append(headerRow);

    cnt = 0;
    $.each(mycys, function() {
        const row = $("<tr>");
        row.append($("<th>").text(`G${++cnt}`));
        $.each(mycys, function() {
            row.append($("<td>").addClass("table-cell").text(' '));
        });
        table.append(row);
    });

    newWindow.document.write("<html><head><title>Graph Table</title>");
    newWindow.document.write('<link rel="stylesheet" type="text/css" href="tableStyles.css">'); // Link the external CSS
    newWindow.document.write("</head><body>");
    newWindow.document.write(table.prop('outerHTML'));
    newWindow.document.write("</body></html>");
    newWindow.document.close();

    // Read the CSV file
    $.get('upton5_homs2.csv', function(data) {
        // Split the CSV data into lines
        var lines = data.split('\n');

        // Iterate over each line
        $.each(lines, function(lineNo, line) {
            var items = line.split(','); // Assuming comma-separated values

            if (items.length >= 3) {
                // Extract the row, column, and value
                var rowIndex = parseInt(items[0]) + 1;
                var colIndex = parseInt(items[1]);
                var value = items[2];

                // Update the table cell based on the row and column indices
                var cell = $(newWindow.document).find(`table tr:eq(${rowIndex}) td:eq(${colIndex})`);
                cell.text(value);

                // Highlight cells with zero values
                if (value.trim() === '0') {
                    cell.css('background-color', 'yellow'); // or any other color you prefer
                }
            }
        });
    });


    const newWindow2 = window.open("", "_blank", 2);
    const table2 = $("<table>").css({
        borderCollapse: 'collapse',
        width: '100%'
    });

    const headerRow2 = $("<tr>");
    headerRow2.append($("<th>")); 
    cnt = 0;
    $.each(mycys, function() {
        headerRow2.append($("<th>").text(`G${++cnt}`));
    });
    table2.append(headerRow2);

    cnt = 0;
    $.each(mycys, function() {
        const row2 = $("<tr>");
        row2.append($("<th>").text(`G${++cnt}`));
        $.each(mycys, function() {
            row2.append($("<td>").addClass("table-cell").text('0'));
        });
        table2.append(row2);
    });

    newWindow2.document.write("<html><head><title>Graph Table</title>");
    newWindow2.document.write('<link rel="stylesheet" type="text/css" href="tableStyles.css">'); // Link the external CSS
    newWindow2.document.write("</head><body>");
    newWindow2.document.write(table2.prop('outerHTML'));
    newWindow2.document.write("</body></html>");
    newWindow2.document.close();

    // Read the CSV file
    $.get('upton5_homs2.csv', function(data) {
        // Split the CSV data into lines
        var lines = data.split('\n');

        // Iterate over each line
        $.each(lines, function(lineNo, line) {
            var items = line.split(','); // Assuming comma-separated values

            if (items.length >= 3) {
                // Extract the row, column, and value
                var rowIndex = parseInt(items[0]) + 1;
                var colIndex = parseInt(items[1]);
                var value = parseInt(items[2]);

                // Update the table cell based on the row and column indices
                var cell = $(newWindow2.document).find(`table tr:eq(${rowIndex}) td:eq(${colIndex})`);
                if(value == 0)
                    cell.text(1);
                else 
                    cell.text(0)

                // Highlight cells with zero values
                if (value !== '0') {
                    cell.css('background-color', 'yellow'); // or any other color you prefer
                }
            }
        });
    });
}

