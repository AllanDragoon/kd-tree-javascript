
var BinaryHeap = require('./binaryHeap.js');
/**
 * KdTree's node definition.
 */
var Node = function (obj, dimension, parent) {
    this.obj = obj;
    this.left = null;
    this.right = null;
    this.parent = parent;
    this.dimension = dimension;
};

var KdTree = function (points, distanceFunc, dimensions) {
    this.distanceFunc = distanceFunc;
    this.dimensions = dimensions;
    // If points is not an array, assume we're loading a pre-built tree
    if (!Array.isArray(points)) {
        this._loadTree(points);
    } else {
        this.root = this._buildTree(points, 0, null, 0, points.length - 1);
    }
};

// KdTree.prototype._buildTree = function (points, depth, parent) {
//     var dimensions = this.dimensions;
//     var dim = depth % dimensions.length,
//         median,
//         node;

//     if (points.length === 0) {
//         return null;
//     }
//     if (points.length === 1) {
//         return new Node(points[0], dim, parent);
//     }

//     points.sort(function (a, b) {
//         return a[dimensions[dim]] - b[dimensions[dim]];
//     });

//     median = Math.floor(points.length / 2);
//     node = new Node(points[median], dim, parent);
//     node.left = this._buildTree(points.slice(0, median), depth + 1, node);
//     node.right = this._buildTree(points.slice(median + 1), depth + 1, node);

//     return node;
// };

KdTree.prototype._buildTree = function (points, depth, parent, startIndex, endIndex) {
    var length = points.length;
    if (length <= 0 || startIndex > endIndex) {
        return null;
    }

    var dimensions = this.dimensions;
    var dim = depth % dimensions.length; 
    if (startIndex === endIndex) {
        return new Node(points[startIndex], dim, parent);
    }

    function compare(a, b) {
        var propA = a[dimensions[dim]];
        var propB = b[dimensions[dim]];
        if (propA > propB) {
            return 1;
        } else if (propA < propB) {
            return -1;
        }
        return 0;
    }

    var mid = KdTree._quickSelectMedian(points, compare, startIndex, endIndex);
    var node = new Node(points[mid], dim, parent);

    node.left = this._buildTree(points, depth + 1, node, startIndex, mid-1);
    node.right = this._buildTree(points, depth + 1, node, mid+1, endIndex);
    return node;
};

/**
 * Reloads a serialied tree
 */
KdTree.prototype._loadTree = function (data) {
    function restoreParent(root) {
        if (root.left) {
            root.left.parent = root;
            restoreParent(root.left);
        }

        if (root.right) {
            root.right.parent = root;
            restoreParent(root.right);
        }
    }

    // Just need to restore the `parent` parameter
    this.root = data;
    restoreParent(this.root);
};

/**
 * Convert to a JSON serializable structure;
 * this just requires removing the `parent` property
 */
KdTree.prototype.toJSON = function (src) {
    if (!src) src = this.root;
    var dest = new Node(src.obj, src.dimension, null);
    if (src.left) dest.left = this.toJSON(src.left);
    if (src.right) dest.right = this.toJSON(src.right);
    return dest;
};

KdTree.prototype._innerSearch = function (point, node, parent) {
    if (!node) {
        return parent;
    }

    var dimensions = this.dimensions;
    var dimension = dimensions[node.dimension];
    if (point[dimension] < node.obj[dimension]) {
        return this._innerSearch(point, node.left, node);
    } else {
        return this._innerSearch(point, node.right, node);
    }
};

KdTree.prototype.insert = function (point) {
    var insertPosition = this._innerSearch(point, this.root, null);
    if (insertPosition === null) {
        this.root = new Node(point, 0, null);
        return;
    }

    var dimensions = this.dimensions;
    var newNode = new Node(point, (insertPosition.dimension + 1) % dimensions.length, insertPosition);
    var dimension = dimensions[insertPosition.dimension];

    if (point[dimension] < insertPosition.obj[dimension]) {
        insertPosition.left = newNode;
    } else {
        insertPosition.right = newNode;
    }
};

KdTree.prototype._nodeSearch = function (point, node) {
    if (node === null) {
        return null;
    }

    if (node.obj === point) {
        return node;
    }

    var dimensions = this.dimensions;
    var dimension = dimensions[node.dimension];

    if (point[dimension] < node.obj[dimension]) {
        return this._nodeSearch(point, node.left);
    } else {
        return this._nodeSearch(point, node.right);
    }
};

KdTree.prototype._removeNode = function (node) {
    var nextNode, nextObj, pDimension;
    var dimensions = this.dimensions;

    function findMin(node, dim) {
        if (node === null) {
            return null;
        }

        var dimension = dimensions[dim];

        if (node.dimension === dim) {
            if (node.left !== null) {
                return findMin(node.left, dim);
            }
            return node;
        }

        var own = node.obj[dimension];
        var left = findMin(node.left, dim);
        var right = findMin(node.right, dim);
        var min = node;

        if (left !== null && left.obj[dimension] < own) {
            min = left;
        }
        if (right !== null && right.obj[dimension] < min.obj[dimension]) {
            min = right;
        }
        return min;
    }

    if (node.left === null && node.right === null) {
        if (node.parent === null) {
            this.root = null;
            return;
        }

        pDimension = dimensions[node.parent.dimension];

        if (node.obj[pDimension] < node.parent.obj[pDimension]) {
            node.parent.left = null;
        } else {
            node.parent.right = null;
        }
        return;
    }

    // If the right subtree is not empty, swap with the minimum element on the
    // node's dimension. If it is empty, we swap the left and right subtrees and
    // do the same.
    if (node.right !== null) {
        nextNode = findMin(node.right, node.dimension);
        nextObj = nextNode.obj;
        this._removeNode(nextNode);
        node.obj = nextObj;
    } else {
        nextNode = findMin(node.left, node.dimension);
        nextObj = nextNode.obj;
        this._removeNode(nextNode);
        node.right = node.left;
        node.left = null;
        node.obj = nextObj;
    }

};

KdTree.prototype.remove = function (point) {
    var node = this._nodeSearch(point, this.root);
    if (node) {
        this._removeNode(node);
    }
};

KdTree.prototype.nearest = function (point, maxNodes, maxDistance) {
    var dimensions = this.dimensions;
    var distanceFunc = this.distanceFunc;
    var bestNodes = new BinaryHeap(function (e) { 
        return -e[1]; 
    });

    function saveNode(node, distance) {
        bestNodes.push([node, distance]);
        if (bestNodes.size() > maxNodes) {
            bestNodes.pop();
        }
    }

    function nearestSearch(node) {
        var dimension = dimensions[node.dimension];
        var linearPoint = {};
        for (var i = 0; i < dimensions.length; i += 1) {
            if (i === node.dimension) {
                linearPoint[dimensions[i]] = point[dimensions[i]];
            } else {
                linearPoint[dimensions[i]] = node.obj[dimensions[i]];
            }
        }

        var linearDistance = distanceFunc(linearPoint, node.obj);
        var ownDistance = distanceFunc(point, node.obj);
        if (node.right === null && node.left === null) {
            if (bestNodes.size() < maxNodes || ownDistance < bestNodes.peek()[1]) {
                saveNode(node, ownDistance);
            }
            return;
        }

        var bestChild;
        if (node.right === null) {
            bestChild = node.left;
        } else if (node.left === null) {
            bestChild = node.right;
        } else {
            if (point[dimension] < node.obj[dimension]) {
                bestChild = node.left;
            } else {
                bestChild = node.right;
            }
        }

        nearestSearch(bestChild);

        if (bestNodes.size() < maxNodes || ownDistance < bestNodes.peek()[1]) {
            saveNode(node, ownDistance);
        }

        var otherChild;
        if (bestNodes.size() < maxNodes || Math.abs(linearDistance) < bestNodes.peek()[1]) {
            if (bestChild === node.left) {
                otherChild = node.right;
            } else {
                otherChild = node.left;
            }
            if (otherChild !== null) {
                nearestSearch(otherChild);
            }
        }
    }

    if (maxDistance) {
        for (i = 0; i < maxNodes; i += 1) {
            bestNodes.push([null, maxDistance]);
        }
    }

    if (this.root)
        nearestSearch(this.root);

    result = [];

    for (i = 0; i < Math.min(maxNodes, bestNodes.content.length); i += 1) {
        if (bestNodes.content[i][0]) {
            result.push([bestNodes.content[i][0].obj, bestNodes.content[i][1]]);
        }
    }
    return result;
};

KdTree.prototype.balanceFactor = function () {
    function height(node) {
        if (node === null) {
            return 0;
        }
        return Math.max(height(node.left), height(node.right)) + 1;
    }

    function count(node) {
        if (node === null) {
            return 0;
        }
        return count(node.left) + count(node.right) + 1;
    }

    return height(this.root) / (Math.log(count(this.root)) / Math.log(2));
};

// Credit: Tony Tanzillo
// http://www.theswamp.org/index.php?topic=44312.msg495808#msg495808
KdTree._quickSelectMedian = function (points, compare, startIndex, endIndex) {
    var k = Math.floor((startIndex + endIndex) / 2);
    var from = startIndex;
    var to = endIndex;
    while (from < to) {
        var r = from;
        var w = to;
        var current = points[Math.floor((r + w) / 2)];
        while (r < w) {
            if (compare(points[r], current) > -1) {
                var tmp = points[w];
                points[w] = points[r];
                points[r] = tmp;
                w--;
            }
            else {
                r++;
            }
        }
        if (compare(points[r], current) > 0) {
            r--;
        }
        if (k <= r) {
            to = r;
        }
        else {
            from = r + 1;
        }
    }
    return k;
};

module.exports = KdTree;