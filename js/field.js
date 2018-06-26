/**
 * Field constructor
 * @param {HTMLElement} container - element to contain field
 */
function Field(container) {
    var scaleRatio, viewport, staticLayer, wpLayer, sceneCanvas;

    // creation and sizing of the field and its layers
    scaleRatio = parseFloat(container.getAttribute('scale')) || 1;
    viewport = new Concrete.Viewport({
        container: container,
        width: scaleRatio * Field.width,
        height: scaleRatio * Field.height
    });
    this.scaleRatio = scaleRatio;

    staticLayer = new Concrete.Layer();
    wpLayer = new Concrete.Layer();

    viewport.add(staticLayer);
    viewport.add(wpLayer);

    staticLayer.scene.context.scale(scaleRatio, scaleRatio);
    wpLayer.scene.context.scale(scaleRatio, scaleRatio);

    // event handlers
    sceneCanvas = viewport.scene.canvas;  
    sceneCanvas.addEventListener('mousedown', this.onMouseDown.bind(this));
    sceneCanvas.addEventListener('mousemove', this.onMouseMove.bind(this));
    sceneCanvas.addEventListener('mouseup', this.onMouseUp.bind(this));
    sceneCanvas.addEventListener('mouseleave', this.onMouseUp.bind(this));
    
    // bind to object
    this.viewport = viewport;
    this.wpLayer = wpLayer;
    this.staticLayer = staticLayer;
    this.waypoints = [];
    this.keyToWaypoint = {};

    this.mode = 'change';
}

Object.defineProperty(Field, 'width', {
    writable: false,
    configurable: false,
    value: 648
});

Object.defineProperty(Field, 'height', {
    writable: false,
    configurable: false,
    value: 324
});

Object.assign(Field.prototype, {
    /*
     * Draw the static elements of the field
     */
    draw() {
        var ctx = this.staticLayer.scene.context;

        // draw floor
        ctx.save();
        ctx.moveTo(0,30);
        ctx.lineTo(36,0);
        ctx.lineTo(612,0);
        ctx.lineTo(648,30);
        ctx.lineTo(648,294);
        ctx.lineTo(612,324);
        ctx.lineTo(36,324);
        ctx.lineTo(0,294);
        ctx.closePath();
        ctx.fillStyle = 'rgb(101,99,100)';
        ctx.fill();
        ctx.restore();

        // draw tape
        ctx.save();
        ctx.lineWidth = 2;
        ctx.beginPath();
        // horizontal center tape
        ctx.moveTo(0,162);
        ctx.lineTo(648,162);
        // vertical center tape
        ctx.moveTo(324,0);
        ctx.lineTo(324,324);
        // auto line tape
        ctx.moveTo(121,0);
        ctx.lineTo(121,324);
        ctx.moveTo(527,0);
        ctx.lineTo(527,324);
        // exchange boundaries
        ctx.moveTo(0,149);
        ctx.lineTo(35,149);
        ctx.lineTo(35,103);
        ctx.lineTo(0,103);
        ctx.moveTo(648,175);
        ctx.lineTo(613,175);
        ctx.lineTo(613,221);
        ctx.lineTo(648,221);
        // platform zone boundaries
        ctx.moveTo(196,96);
        ctx.lineTo(452,96);
        ctx.moveTo(196,228);
        ctx.lineTo(452,228);
        // stroke black tape
        ctx.strokeStyle = 'black';
        ctx.stroke();
        // null zone boundaries
        ctx.beginPath();
        ctx.moveTo(289,0);
        ctx.lineTo(289,94);
        ctx.lineTo(359,94);
        ctx.lineTo(359,0);
        ctx.moveTo(289,324);
        ctx.lineTo(289,230);
        ctx.lineTo(359,230);
        ctx.lineTo(359,324);
        ctx.strokeStyle = 'rgb(168,175,194)';
        ctx.stroke();
        // red power cube zone boundary
        ctx.beginPath();
        ctx.moveTo(140,141);
        ctx.lineTo(99,141);
        ctx.lineTo(99,184);
        ctx.lineTo(140,184);
        ctx.strokeStyle = 'red';
        ctx.stroke();
        // blue power cube zone boundary
        ctx.beginPath();
        ctx.moveTo(508,141);
        ctx.lineTo(549,141);
        ctx.lineTo(549,184);
        ctx.lineTo(508,184);
        ctx.strokeStyle = 'blue';
        ctx.stroke();
        ctx.restore();

        // draw switches
        ctx.save();
        ctx.lineWidth = 2;
        // switch containers
        ctx.strokeStyle = 'rgb(168,175,194)';
        ctx.strokeRect(141,86,54,152);
        ctx.strokeRect(453,86,54,152);
        // switch platforms
        ctx.restore();
        ctx.save();
        ctx.fillStyle = 'rgb(8,8,8)';
        ctx.fillRect(144,90,48,36);
        ctx.fillRect(456,90,48,36);
        ctx.fillRect(144,198,48,36);
        ctx.fillRect(456,198,48,36);
        // switch middle bar
        ctx.fillStyle = 'rgb(168,175,194)';
        ctx.fillRect(162,124,12,76);
        ctx.fillRect(474,124,12,76);
        ctx.restore();

        // draw platforms
        ctx.save();
        ctx.fillStyle = 'red';
        ctx.fillRect(261,97,63,130);
        ctx.fillStyle = 'blue';
        ctx.fillRect(324,97,63,130);
        ctx.restore();
        
        // draw scale
        ctx.save();
        // scale platform
        ctx.beginPath();
        ctx.fillStyle = 'rgb(8,8,8)';
        ctx.strokeStyle = 'black'
        ctx.lineWidth = 1;
        ctx.rect(300,72,48,36);
        ctx.rect(300,216,48,36);
        ctx.stroke();
        ctx.fill();
        // scale middle bar
        ctx.fillStyle = 'rgb(168,175,194)';
        ctx.fillRect(318,106,12,112)
        ctx.restore();
        
        // draw platform zone cubes
        ctx.save();
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            ctx.rect(196,85 + i*13 + i*15,11,13);
            ctx.rect(441,85 + i*13 + i*15,11,13);
        }
        ctx.fillStyle = 'yellow';
        ctx.fill();
        ctx.restore();

        this.viewport.render();
    },
    /*
     * Draw the waypoints on the field
     */
    drawWaypoints() {
        var waypoints = this.waypoints,
            sceneCtx = this.wpLayer.scene.context,
            hitCtx = this.wpLayer.hit.context;

        this.wpLayer.scene.clear();
        this.wpLayer.hit.clear();
        for (let i = 0; i < waypoints.length; i++) {
            let waypoint = waypoints[i], x = waypoint.x, y = Field.height - waypoint.y;

            // draw connecting line
            if (waypoints.length - 1 - i != 0) {
                sceneCtx.beginPath();
                sceneCtx.moveTo(x,y);
                sceneCtx.lineTo(waypoints[i+1].x, Field.height - waypoints[i+1].y);
                sceneCtx.lineWidth = 38;
                sceneCtx.strokeStyle = 'rgba(255,255,255,0.6)';
                sceneCtx.stroke();
                sceneCtx.beginPath();
                sceneCtx.moveTo(x,y);
                sceneCtx.lineTo(waypoints[i+1].x, Field.height - waypoints[i+1].y);
                sceneCtx.lineWidth = 2;
                sceneCtx.strokeStyle = 'white';
                sceneCtx.stroke();
            }

            // draw the waypoints
            sceneCtx.beginPath();
            sceneCtx.fillStyle = 'green';
            if (this.selected === waypoint)
                sceneCtx.fillStyle = 'orange';
            sceneCtx.arc(x,y,4.5,0,2 * Math.PI);
            sceneCtx.fill();

            hitCtx.beginPath();
            hitCtx.arc(x,y,4.5,0,2 * Math.PI);
            hitCtx.fillStyle = waypoint.hitColor;
            hitCtx.fill();
        }
        this.viewport.render();
    },
    /*
     * Handles mouse down, selects or creates a waypoint
     * @param {MouseEvent} evt
     */
    onMouseDown(evt) {
        var x, y, key, waypoint;
        
        x = Math.round(evt.offsetX / this.scaleRatio);
        y = Math.round(evt.offsetY / this.scaleRatio);

        key = this.wpLayer.hit.getIntersection(x,y);
        waypoint = this.keyToWaypoint[key];

        // begin click and drag when user clicks on an existing waypoint
        if (waypoint) {
            if (this.mode === 'change') {
                this.selected = waypoint;
                this.drawWaypoints();
            }
            else if (this.mode === 'delete')
                this.remove(waypoint);
        } 
        // create a new waypoint since click was on an empty spot
        else {
            if (this.mode === 'change') {
                waypoint = new Waypoint(x,Field.height - y);
                this.selected = waypoint;
                this.add(waypoint);
            }
        }
    },
    /*
     * Handles mouse move, drags a selected waypoint
     * @param {MouseEvent} evt
     */
    onMouseMove(evt) {
        var selected = this.selected;
        if (selected != null) {
            let x, y, index;
            x = Math.round(evt.offsetX / this.scaleRatio);
            y = Field.height - Math.round(evt.offsetY / this.scaleRatio);
            selected.x = x;
            selected.y = y;
            this.drawWaypoints();
        }
    },
    /*
     * Handles mouse up, deselects a selected waypoint
     * @param {MouseEvent} evt
     */
    onMouseUp(evt) {
        var selected = this.selected,
            waypoints = this.waypoints;

        if (selected != null) {
            let i = waypoints.indexOf(selected);
            let behind = waypoints[i-1];
            let front = waypoints[i+1];

            if (behind) {
                behind.heading = behind.calcHeading(selected);
                this.onWaypointChanged(behind, i-1);
            }
            
            if (front) {
                selected.heading = selected.calcHeading(front);
                this.onWaypointChanged(selected, i);
                if (i+1 == waypoints.length - 1) {
                    front.heading = selected.heading;
                    this.onWaypointChanged(front, i+1);
                }
            }
            else if (behind) {
                selected.heading = behind.heading;
                this.onWaypointChanged(selected, i);
            }

            this.selected = null;
            this.drawWaypoints();
        }
    },
    /*
     * Adds a waypoint to the field
     * @param {Waypoint} waypoint - the waypoint to add
     */
    add(waypoint) {
        var key = waypoint.id,
            hit = this.wpLayer.hit,
            waypoints = this.waypoints,
            heading;
        
        hit.registerKey(key);
        waypoint.hitColor = hit.getColorFromKey(key);
        this.keyToWaypoint[key] = waypoint;

        this.waypoints.push(waypoint);
        this.drawWaypoints();

        heading = 0;
        if (waypoints.length > 1) {
            let prevPoint = waypoints[waypoints.length - 2];
            heading = prevPoint.calcHeading(waypoint);
            prevPoint.heading = heading;
            this.onWaypointChanged(prevPoint, waypoints.length - 2);
        }
        waypoint.heading = heading;

        this.onWaypointAdded(waypoint);
    },
    /*
     * Removes a waypoint
     * @param {Waypoint} waypoint - the waypoint to remove
     */
    remove(waypoint) {
        var waypoints = this.waypoints, i

        i = waypoints.indexOf(waypoint);
        if (i != -1) {
            waypoints.splice(i,1);
            this.drawWaypoints();            
            this.onWaypointRemoved(i);
        }
    },
    /*
     * Deletes all waypoints
     */
    clear() {
        for (let i = this.waypoints.length - 1; i >= 0; i--)
            this.onWaypointRemoved(i);
        this.waypoints = [];
        this.drawWaypoints();
    }

});


/*
 * Waypoint constructor
 * @param {Number} x - x position of point
 * @param {Number} y - y position of point
 * @param {Number} heading - heading of point
 */
function Waypoint(x,y,heading) {
    this.x = x;
    this.y = y;
    this.heading = heading;
    this.id = Waypoint.idCounter++;
}
Waypoint.idCounter = 0;

Object.assign(Waypoint.prototype, {
    calcHeading(o) {
        var rad = Math.atan2(o.y - this.y, o.x - this.x);
        return Math.round(rad * 180 / Math.PI);
    }
});
