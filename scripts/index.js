const canvas = document.getElementById("canvas");
var ctx = canvas.getContext('2d');

ctx.beginPath();
ctx.fillStyle = '#f4f4f9';

var size = canvas.height;
var margin = Math.max(0, canvas.width - size) / 2;

ctx.fillRect(margin, 0, size, size);
