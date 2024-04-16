// Vertex & Fragment shader source codes
var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'uniform float u_PointSize;\n' + // Add this line
  'void main() {\n' +
  '  gl_Position = a_Position;\n' +
  '  gl_PointSize = u_PointSize;\n' + // Use the uniform for size
  '}\n';

var FSHADER_SOURCE =
  'precision mediump float;\n' +
  'uniform vec4 u_FragColor;\n' +
  'void main() {\n' +
  '  gl_FragColor = u_FragColor;\n' +
  '}\n';


var shapesList = [];

// global vars for WebGL context & shader program attributes/uniforms
var gl;
var a_Position;
var u_FragColor;
var canvas;
var u_PointSize;
var currentSize = 10; // default size
var isDrawing = false;
var rotation = 0;

var currentRgb = [128 / 255, 128 / 255, 128 / 255, 1.0]; // default val



function setupWebGL() {
    // Retrieve <canvas> element & get the rendering context for WebGL
    canvas = document.getElementById('webgl');
    gl = canvas.getContext("webgl", { preserveDrawingBuffer: true }); // for performance
    if (!gl) {
      console.log('Failed to get the rendering context for WebGL');
      return false;
    }
  
    canvas.onmousedown = function(ev) { click(ev, true); };
    canvas.onmouseup = function(ev) { click(ev, false); }; 
    canvas.onmousemove = function(ev) { if (isDrawing) click(ev, true); };
  
    return true;
  }
  

function connectVariablesToGLSL() {
  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to initialize shaders.');
    return false;
  }

  // Get the storage locations of a_Position & u_FragColor
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');

  if (a_Position < 0 || !u_FragColor) {
    console.log('Failed to get the storage location of a_Position or u_FragColor');
    return false;
  }

  u_PointSize = gl.getUniformLocation(gl.program, 'u_PointSize');
  if (!u_PointSize) { 
  console.log('Failed to get the storage location of u_PointSize');
  return false;
  }

  // Set the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  return true;
}

function renderAllShapes() {
    gl.clear(gl.COLOR_BUFFER_BIT);

    shapesList.forEach(point => {
        point.render();
    });
}

var currentSegments = 30;

function click(ev, mouseDown) {
    isDrawing = mouseDown;
    if (!isDrawing) return;

    var shapeType = document.getElementById('shape').value;
    var rect = ev.target.getBoundingClientRect();
    var x = ((ev.clientX - rect.left) - canvas.width / 2) / (canvas.width / 2);
    var y = (canvas.height / 2 - (ev.clientY - rect.top)) / (canvas.height / 2);

    var shape;
    switch (shapeType) {
        case 'triangle':
            shape = new Triangle(x, y, currentColor, currentSize, rotation);
            break;
        case 'square': // Assuming squares are drawn using the Point class for simplicity
            shape = new Point(x, y, currentColor, currentSize);
            break;
        case 'circle':
            shape = new Circle(x, y, currentColor, currentSize, currentSegments, rotation);
            break;
        case 'meow':
            shape = new CatPaw(x, y, currentColor, currentSize, currentSegments);
            break;        
        default:
            console.log('Unknown shape type:', shapeType);
    }

    if (shape) {
        shapesList.push(shape);
        renderAllShapes();
    }
}



function main() {
    if (!setupWebGL()) {
        return;
    }
    if (!connectVariablesToGLSL()) {
        return;
    }

    // Register function (event handler) to be called on a mouse press
    var canvas = document.getElementById('webgl');
    canvas.onmousedown = function(ev) { click(ev, true); };
    canvas.onmouseup = function(ev) { click(ev, false); };
    canvas.onmousemove = function(ev) { if (isDrawing) click(ev, true); };

    // Initial render call
    renderAllShapes();
  
    document.getElementById('clearCanvas').addEventListener('click', clearCanvas);
}

var currentColor = [0.5, 0.5, 0.5, 1.0]; // Assuming initial color in the middle of the range

function updateColorPreview() {
    var r = document.getElementById('red').value;
    var g = document.getElementById('green').value;
    var b = document.getElementById('blue').value;
    var v = parseFloat(document.getElementById('value').value);
    var colorPreview = document.getElementById('colorPreview');
    colorPreview.style.backgroundColor = `rgba(${r}, ${g}, ${b}, ${v})`;
}

function updateCurrentColor() {
    var r = parseInt(document.getElementById('red').value);
    var g = parseInt(document.getElementById('green').value);
    var b = parseInt(document.getElementById('blue').value);
    var v = parseFloat(document.getElementById('value').value);
    
    currentColor = [r / 255 * v, g / 255 * v, b / 255 * v, 1.0]; // Adjust the global color
    renderAllShapes(); // Redraw shapes to reflect new color settings
}


function updateShapePreview() {
    let previewCanvas = document.getElementById('shapePreview');
    let ctx = previewCanvas.getContext('2d');
    ctx.clearRect(0, 0, previewCanvas.width, previewCanvas.height); // Clear the canvas

    // Set the fill style based on the current color and opacity
    ctx.fillStyle = `rgba(${currentColor[0] * 255}, ${currentColor[1] * 255}, ${currentColor[2] * 255}, ${currentColor[3]})`;

    let centerX = previewCanvas.width / 2;
    let centerY = previewCanvas.height / 2;
    let maxDim = Math.min(previewCanvas.width, previewCanvas.height);
    let size = currentSize / 100 * maxDim / 2; // Calculate size based on canvas size

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(rotation); // Rotate the context

    // Draw the selected shape
    switch (document.getElementById('shape').value) {
        case 'square':
            ctx.fillRect(-size, -size, size * 2, size * 2);
            break;
        case 'triangle':
            ctx.beginPath();
            ctx.moveTo(0, -size);
            ctx.lineTo(-size, size);
            ctx.lineTo(size, size);
            ctx.closePath();
            ctx.fill();
            break;
        case 'circle':
            ctx.beginPath();
            ctx.arc(0, 0, size, 0, Math.PI * 2);
            ctx.fill();
            break;
        case 'meow':
            // Add drawing logic for cat paw if necessary
            break;
    }
    ctx.restore();
}

//          [EVENTS]        //

document.getElementById('red').addEventListener('input', updateShapePreview);
document.getElementById('green').addEventListener('input', updateShapePreview);
document.getElementById('blue').addEventListener('input', updateShapePreview);
document.getElementById('value').addEventListener('input', updateShapePreview);
document.getElementById('size').addEventListener('input', updateShapePreview);
document.getElementById('rotation').addEventListener('input', function () {
    rotation = parseFloat(this.value) * Math.PI / 180;
    updateShapePreview();
});
document.getElementById('shape').addEventListener('change', updateShapePreview);


document.addEventListener('DOMContentLoaded', function() {
    function updateSliderValue(sliderId) {
        var slider = document.getElementById(sliderId);
        slider.oninput = function() {
            document.getElementById(sliderId + 'Value').textContent = this.value;
            if (sliderId === 'segments') {
                currentSegments = parseInt(this.value);
            }else if (sliderId === 'rotation') {
                rotation = parseFloat(this.value) * Math.PI / 180;
            } else {
                updateCurrentColor();
            }
        };
    }
    updateSliderValue('red');
    updateSliderValue('green');
    updateSliderValue('blue');
    updateSliderValue('value');
    updateSliderValue('segments'); // Initialize segments slider
    updateSliderValue('rotation'); // Initialize segments slider

    document.getElementById('size').oninput = function() {
        document.getElementById('sizeValue').textContent = this.value;
        currentSize = parseFloat(this.value);
        renderAllShapes(); // Redraw shapes with new size
    };
    /*
    document.getElementById('rotation').addEventListener('input', function() {
        const rotationValue = parseFloat(document.getElementById('rotation').value);
        document.getElementById('rotationValue').textContent = rotationValue;
        
        rotation = rotationValue * Math.PI * 2; // Convert from 0-1 range to 0-2π range
    });*/
    document.getElementById('red').addEventListener('input', updateColorPreview);
    document.getElementById('green').addEventListener('input', updateColorPreview);
    document.getElementById('blue').addEventListener('input', updateColorPreview);
    document.getElementById('value').addEventListener('input', updateColorPreview);

    updateColorPreview(); // Initial update so the color preview shows the initial color
});

function clearCanvas() {
    shapesList = []; // Reset the list of shapes
    renderAllShapes(); // Re-render the canvas, which should now be clear
}


main();