var $ = require('jquery');
var KdTree = require('../../kdTree.js');

var tree, canvas, ctx;
var points = [];

function distance(a, b) {
    var dx = a.x - b.x;
    var dy = a.y - b.y;
    return dx * dx + dy * dy;
}

function renderTree() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    render(tree.root, [[0, canvas.width], [0, canvas.height]]);
    $("#factor").text(tree.balanceFactor());

    function render(node, bounds) {
        if (node == null) return;

        ctx.beginPath();
        ctx.fillStyle = "#00f";
        ctx.beginPath();
        ctx.arc(node.obj.x, node.obj.y, 5, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();

        var leftBounds = [];
        leftBounds[0] = bounds[0].slice(0);
        leftBounds[1] = bounds[1].slice(0);

        var rightBounds = [];
        rightBounds[0] = bounds[0].slice(0);
        rightBounds[1] = bounds[1].slice(0);

        ctx.beginPath();
        if (node.dimension == 0) { // was split on x value
            ctx.moveTo(node.obj.x, bounds[1][0]);
            ctx.lineTo(node.obj.x, bounds[1][1]);
            leftBounds[0][1] = node.obj.x;
            rightBounds[0][0] = node.obj.x;
        } else {
            ctx.moveTo(bounds[0][0], node.obj.y);
            ctx.lineTo(bounds[0][1], node.obj.y);
            leftBounds[1][1] = node.obj.y;
            rightBounds[1][0] = node.obj.y;
        }
        ctx.closePath();
        ctx.stroke();

        ctx.fillStyle = "rgba(255,0,0,0.2)";
        ctx.fillRect(bounds[0][0], bounds[1][0], bounds[0][1] - bounds[0][0], bounds[1][1] - bounds[1][0]);

        render(node.left, leftBounds);
        render(node.right, rightBounds);
    }
}

$(function () {
    canvas = $("#canvas")[0];
    ctx = canvas.getContext('2d');

    tree = new KdTree([], distance, ["x", "y"]);

    $("#add").click(function () {
        var point = {
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height
        };
        points.push(point);
        tree.insert(point);
        renderTree();
    });

    $("#rebuild").click(function () {
        tree = new KdTree(points, distance, ["x", "y"]);
        renderTree();
    });

    $("#canvas").click(function (e) {
        var offset = $(e.target).offset(),
            offsetX = (e.offsetX || e.clientX - offset.left),
            offsetY = (e.offsetY || e.clientY - offset.top);

        var point = tree.nearest({ x: offsetX, y: offsetY }, 1)[0][0];
        points.splice(points.indexOf(point), 1);
        tree.remove(point);
        renderTree();
    });
});