var field, table;
var titleField = document.getElementsByName('title')[0];

function init() {
    var fieldContainer = document.getElementById('field');
    var modeBtns = document.getElementsByName('field-mode');
    var clearBtn = document.getElementById('clear-btn');
    var exportBtn = document.getElementById('export-btn');
    var importBtn = document.getElementsByName('waypoint-file')[0];

    table = document.querySelector('#wp-table tbody');
   
    field = new Field(fieldContainer);
    field.onWaypointAdded = addTableRow;
    field.onWaypointChanged = updateTableRow;
    field.onWaypointRemoved = removeTableRow;
    field.draw();

    modeBtns.forEach(btn => btn.addEventListener('click', () => field.mode = btn.value));
    clearBtn.addEventListener('click', () => field.clear());
    exportBtn.addEventListener('click', exportPoints);
    importBtn.addEventListener('change', importPoints);
}

function addTableRow(waypoint) {
    var tr = `
        <tr class="wp-tr">
            <td class="wp-td">${waypoint.x}</td>
            <td class="wp-td">${waypoint.y}</td>
            <td class="wp-td">${waypoint.heading}</td>
        </tr>`;
    table.insertAdjacentHTML('beforeend', tr);
}

function updateTableRow(waypoint, index) {
    var tr = table.rows[index];
    var x = tr.children[0],
        y = tr.children[1],
        heading = tr.children[2];

    if (x.innerHTML != waypoint.x)
        x.innerHTML = waypoint.x;

    if (y.innerHTML != waypoint.y)
        y.innerHTML = waypoint.y;

    if (heading.innerHTML != waypoint.heading)
        heading.innerHTML = waypoint.heading;
}

function removeTableRow(index) {
    table.removeChild(table.rows[index]);
}

function exportPoints() {
    if (field.waypoints.length == 0 || !titleField.value)
        return;

    var csv = '';
    field.waypoints.forEach(point => {
        csv += `${point.x},${point.y},${point.heading},\n`;
    });
    // remove \n from last line
    csv = csv.substring(0, csv.length - 1);

    var file = new File([csv], {type: 'text/csv;charset=utf-8'}); 

    saveAs(file, titleField.value + '.csv');
}

function importPoints() {
    var reader = new FileReader();

    reader.onload = e => {
        var csv = e.target.result;

        field.clear();
        csv.split('\n').forEach(line => {
            var [x, y, heading] = line.split(',');
            x = parseInt(x);
            y = parseInt(y);
            heading = parseInt(heading);

            field.add(new Waypoint(x,y,heading));

            var name = file.name;
            // remove .csv extension
            name = name.substring(0,name.length - 4);
            titleField.value = name;
        });
    };

    reader.onerror = e => {
        alert('You done goofed');
    };

    var file = this.files[0];
    reader.readAsText(file);
}

init();
