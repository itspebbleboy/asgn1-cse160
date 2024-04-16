class Shape {
    constructor(vertices, color, rotation) {
        this.vertices = vertices;
        this.color = color;
        this.vertexBuffer = gl.createBuffer();
        if (!this.vertexBuffer) {
            console.error('Failed to create the buffer object');
            return;
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);
    }

    bindData() {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_Position);
        gl.uniform4f(u_FragColor, this.color[0], this.color[1], this.color[2], this.color[3]);
    }
}

class Triangle extends Shape {
    constructor(x, y, color, size, rotation) {
        super([], color);
        this.x = x;
        this.y = y;
        this.color = color;
        this.size = size / 100;  // Adjust size relative to canvas size
        this.rotation = rotation;  // Store rotation in radians
        console.log(rotation)
        this.calculateVertices();
    }

    calculateVertices() {
        let halfSize = this.size / 2;
        let height = this.size * Math.sqrt(3) / 2;  // Height of the equilateral triangle

        // Base vertices without rotation
        let vertices = [
            [0, 2 * height / 3],             // Top vertex
            [-halfSize, -height / 3],        // Bottom left vertex
            [halfSize, -height / 3]          // Bottom right vertex
        ];

        // Rotate each vertex around the center
        this.vertices = vertices.map(vertex => {
            let rotatedX = Math.cos(this.rotation) * vertex[0] - Math.sin(this.rotation) * vertex[1] + this.x;
            let rotatedY = Math.sin(this.rotation) * vertex[0] + Math.cos(this.rotation) * vertex[1] + this.y;
            return [rotatedX, rotatedY];
        });

        // Update buffer data
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices.flat()), gl.STATIC_DRAW);
    }

    render() {
        this.bindData();
        gl.drawArrays(gl.TRIANGLES, 0, 3);
    }
}



class Point extends Shape {
    constructor(x, y, color, size, rotation) {
        const vertices = [x, y];
        super(vertices, color);
        this.size = size;
    }

    render() {
        gl.uniform1f(u_PointSize, this.size);
        this.bindData();
        gl.drawArrays(gl.POINTS, 0, 1);
    }
}

// Redefine renderAllShapes to handle new structure
function renderAllShapes() {
    gl.clear(gl.COLOR_BUFFER_BIT);
    shapesList.forEach(shape => {
        shape.render();
    });
}

class Circle extends Shape {
    constructor(x, y, color, size, segments, rotation) {
        super([], color);
        this.x = x;
        this.y = y;
        this.size = size / 100; // Adjust size relative to canvas size
        this.segments = segments; // Dynamic number of segments for smoothness
        this.rotation = rotation; // Store rotation in radians
        this.calculateVertices();
    }

    calculateVertices() {
        this.vertices = [];
        const angleStep = Math.PI * 2 / this.segments;
        // Apply rotation to each vertex calculation
        for (let i = 0; i < this.segments; i++) {
            const angle = i * angleStep + this.rotation; // Add rotation to each angle
            this.vertices.push(this.x + this.size * Math.cos(angle), this.y + this.size * Math.sin(angle));
        }

        // Re-bind and set the vertex buffer data to update the shape
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);
    }

    render() {
        this.bindData();
        gl.drawArrays(gl.TRIANGLE_FAN, 0, this.segments); // Use TRIANGLE_FAN for a solid circle
    }
}



class CatPaw extends Shape {
    constructor(x, y, color, size) {
        super([], color); // Initialize with no vertices initially
        this.x = x;
        this.y = y;
        this.size = size / 100; // Adjust size relative to canvas size
        this.mainPadSize = this.size; // Main pad size
        this.toePadSize = this.size * 0.3; // Toe pad size, smaller
        this.calculateVertices();
    }

    calculateVertices() {
        // Calculate vertices for the main pad (larger circle)
        this.vertices = this.generateCircleVertices(this.x, this.y, this.mainPadSize, 30);
        
        // Toe positions
        const toeOffsetY = this.mainPadSize + this.toePadSize * 0.5;
        const toeOffsetX = this.mainPadSize * 0.75 ;

        // Calculate vertices for the toe pads (smaller circles)
        this.vertices = this.vertices.concat(
            this.generateCircleVertices(this.x - toeOffsetX, this.y - toeOffsetY, this.toePadSize, 20),
            this.generateCircleVertices(this.x, this.y - toeOffsetY * 1.3, this.toePadSize, 20),
            this.generateCircleVertices(this.x + toeOffsetX, this.y - toeOffsetY, this.toePadSize, 20)
        );

        // Update buffer data
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);
    }

    generateCircleVertices(centerX, centerY, radius, segments) {
        const vertices = [];
        const angleStep = Math.PI * 2 / segments;
        for (let i = 0; i < segments; i++) {
            const angle = i * angleStep;
            vertices.push(centerX + radius * Math.cos(angle), centerY + radius * Math.sin(angle));
        }
        return vertices;
    }

    render() {
        this.bindData();
        gl.drawArrays(gl.TRIANGLE_FAN, 0, 30); // Render the main pad
        gl.drawArrays(gl.TRIANGLE_FAN, 30, 20); // Render the first toe
        gl.drawArrays(gl.TRIANGLE_FAN, 50, 20); // Render the second toe
        gl.drawArrays(gl.TRIANGLE_FAN, 70, 20); // Render the third toe
    }
}







/*

class Triangle {
    constructor(x, y, color, size) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.size = size/100;  // size should be a fraction of the canvas (e.g., 0.1 for 10% of canvas height)

        let halfSize = this.size / 2;
        let height = this.size * Math.sqrt(3) / 2;  // Height of the equilateral triangle

        this.vertices = [
            this.x, this.y + 2 * height / 3,          // Top vertex
            this.x - halfSize, this.y - height / 3,   // Bottom left vertex
            this.x + halfSize, this.y - height / 3    // Bottom right vertex
        ];
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);
    }
    render() {
        console.log("render called")
        // Compute vertices based on the center (x, y) and size
        // Create a buffer object
        var vertexBuffer = gl.createBuffer();
        if (!vertexBuffer) {
            console.log('Failed to create the buffer object');
            return -1;
        }

        // Bind the buffer object to target
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);

        var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
        if (a_Position < 0) {
            console.log('Failed to get the storage location of a_Position');
            return -1;
        }

        // Assign the buffer object to a_Position variable
        gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);

        // Enable the assignment to a_Position variable
        gl.enableVertexAttribArray(a_Position);

        // Set the colors
        gl.uniform4f(u_FragColor, this.color[0], this.color[1], this.color[2], this.color[3]);

        // Draw the triangle
        gl.drawArrays(gl.TRIANGLES, 0, 3);
    }

    render(){
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);
        gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_Position);
        gl.uniform4f(u_FragColor, this.color[0], this.color[1], this.color[2], this.color[3]);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
    }
    
}*/
