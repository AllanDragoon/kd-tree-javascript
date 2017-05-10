var $ = require('jquery');
var KdTree = require('../../kdTree1.js');

var tree;
// Pretty good color distance from
// http://www.compuphase.com/cmetric.htm
function colorDistance(a, b) {
    var dr = a.red - b.red;
    var dg = a.green - b.green;
    var db = a.blue - b.blue;
    var redMean = (a.red + b.red) / 2;
    return (2 + redMean / 256) * dr * dr + 4 * dg * dg + (2 + (255 - redMean) / 256) * db * db;
}

function update(color) {
    $("#picked").css('background', color.toHex());
    var rgb = color.toRgb();
    var search = { red: rgb.r, green: rgb.g, blue: rgb.b };
    var nearest = tree.nearest(search, 10);
    nearest.sort(function (a, b) { return a[1] - b[1] });

    var $list = $("#results ul");
    $list.html("");
    for (var i = 0; i < nearest.length; i++) {
        var c = nearest[i][0];

        var $box = $("<div>")
            .css('background', c.hex)
            .css('display', 'inline-block')
            .css('margin-right', '10px')
            .height('30px')
            .width('30px');
        var $line = $("<li>").append($box).append(c.title);
        $list.append($line);
    }
}

$(function () {
    for (var i = 0; i < colors.length; i++) {
        var color = new tinycolor(colors[i].hex).toRgb();
        colors[i].red = color.r;
        colors[i].green = color.g;
        colors[i].blue = color.b;
    }
    tree = new KdTree(colors, colorDistance, ["red", "green", "blue"]);

    $("#picker").spectrum({
        flat: true,
        showInput: true,
        preferredFormat: "hex",
        move: update
    });
});