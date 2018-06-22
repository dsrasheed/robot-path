var field;
var table;

function init() {
    var fieldContainer = document.getElementById('field');
    var modeBtns = document.getElementsByName('field-mode');
    var clearBtn = document.getElementById('clear-btn');

    table = document.querySelector('#wp-table tbody');
   
    field = new Field(fieldContainer);
    field.onWaypointAdded = addTableRow;
    field.onWaypointChanged = updateTableRow;
    field.onWaypointRemoved = removeTableRow;
    field.draw();

    modeBtns.forEach(btn => btn.addEventListener('click', () => field.mode = btn.value));
    clearBtn.addEventListener('click', () => field.clear());
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

    console.log(tr.children);
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

init();
