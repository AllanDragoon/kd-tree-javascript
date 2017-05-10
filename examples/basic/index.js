var $ = require('jquery');
var KdTree = require('../../kdTree1.js');

var fps = 0, fpsSmoothing = 50, now, lastFrame = new Date;
var ctx, canvas;
var tree, points, balls, neighbors, useTree;

function distance(a, b) {
    var dx = a.x - b.x;
    var dy = a.y - b.y;
    return dx * dx + dy * dy;
}

function findNearest(ball) {
    if (useTree) {
        return tree.nearest(ball, neighbors);
    } else {
        points.sort(function (a, b) { return distance(a, ball) - distance(b, ball) });
        return points.slice(0, neighbors);
    }
}

function renderBalls() {
    for (var i = 0; i < balls.length; i++) {
        var ball = balls[i];
        ctx.fillStyle = ball.color;
        ctx.strokeStyle = ball.color;
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, 10, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();

        var nearest = findNearest(ball);
        for (var j = 0; j < nearest.length; j++) {
            var point;
            if (useTree) {
                point = nearest[j][0];
            } else {
                point = nearest[j];
            }
            ctx.beginPath();
            ctx.moveTo(ball.x, ball.y);
            ctx.lineTo(point.x, point.y);
            ctx.stroke();
            ctx.closePath();

            ctx.beginPath();
            ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
            ctx.closePath();
            ctx.fill();
        }
    }
}

function moveBalls() {
    for (var i = 0; i < balls.length; i++) {
        var ball = balls[i];
        ball.x += ball.xSpeed * 10;
        ball.y += ball.ySpeed * 10;
        if (ball.x < 0 || ball.x > canvas.width) ball.xSpeed = -ball.xSpeed;
        if (ball.y < 0 || ball.y > canvas.height) ball.ySpeed = -ball.ySpeed;
    }
}

function renderFrame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    renderBalls();
    moveBalls();

    now = new Date;
    var frameFPS = 1000 / (now - lastFrame);
    fps = (frameFPS - fps) / fpsSmoothing;
    lastFrame = now;

    setTimeout(renderFrame, 1);
}

function showFPS() {
    $("#fps").html((fps * 100).toFixed(1));
    setTimeout(showFPS, 1000);
}

function setup() {
    points = [];
    balls = [];
    for (var i = 0; i < $("#points").val(); i++) {
        var point = { x: Math.random() * canvas.width, y: Math.random() * canvas.height, id: i };
        points.push(point);
    }

    for (var i = 0; i < $("#balls").val(); i++) {
        var ball = {
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            xSpeed: Math.random() - 0.5,
            ySpeed: Math.random() - 0.5,
            color: '#' + Math.floor(Math.random() * 16777215).toString(16)
        }
        balls.push(ball);
    }
    neighbors = $("#neighbors").val();
    useTree = $("#useTree")[0].checked ? true : false;
    tree = new KdTree(points, distance, ["x", "y"]);
}

$(function () {
    canvas = $("#canvas")[0];
    ctx = canvas.getContext('2d');

    setup();

    $("#start").click(setup);

    renderFrame();
    showFPS();
});