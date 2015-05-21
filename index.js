var get = require('get-pixels')
var set = require('save-pixels')
var ndarray = require('ndarray')
var zeros = require('zeros')
var fs = require('fs')

var files = fs.readdirSync('./in')
console.log('<style>img {border: solid;width: 40%;}</style>')
files.forEach(function(file){
  var fileIn = __dirname+'/in/'+file
  var fileOut = __dirname+'/out/'+file

  var ws = fs.createWriteStream(fileOut);

  get(fileIn, function(err, pixels) {
    var shape = pixels.shape.slice();
    var diffs =  zeros(shape);
    var matrix =  zeros([512, 512]);

    for(var i = 0; i < shape[0]; i++){
      for(var k = 0; k < shape[1]; k++){
        var pixel = px(i,k,pixels)

        var step = 1
        var neighbors = [
          //top
          px(i-step,k-step,pixels),
          px(i,k-step,pixels),
          px(i+step,k-step,pixels),
          //middle
          px(i-step,k,pixels),
          px(i+step,k,pixels),
          //bottom
          px(i-step,k+step,pixels),
          px(i,k+step,pixels),
          px(i+step,k+step,pixels)
        ];

        var maxDiff = 0;
        neighbors.forEach(function(neighbor){
          var diff = colorDiff(pixel, neighbor);
          if(diff > maxDiff) maxDiff = diff;
        });

        if(maxDiff >= 65) val = [0,0,0,255]
        else val = [0,0,0,0]

        diffs.set(i,k,0,val[0]);
        diffs.set(i,k,1,val[1]);
        diffs.set(i,k,2,val[2]);
        diffs.set(i,k,3,val[3]);
        if(val.toString() !== '0,0,0,0') matrix.set(i,k, 1)

        if(choroselect(pixel, [255,255,255], 110)||
          (pixel[0] > pixel[1]+pixel[2])) pixel = [255,0,0,255]
        else pixel = [0,0,0,0]

        if(pixel.toString() !== '0,0,0,0'){
          diffs.set(i,k,0,pixel[0])
          diffs.set(i,k,1,pixel[1])
          diffs.set(i,k,2,pixel[2])
          diffs.set(i,k,3,pixel[3])
          matrix.set(i,k, 1)
        }
      }
    }

    set(diffs, 'png').pipe(ws);
    console.log('<img src="in/'+file+'">')
    console.log('<img src="out/'+file+'">')
  })
})

function colorDiff(color1, color2){
  //return Math.sqrt((color1[0]-color1[0])^2+(color2[1]-color1[1])^2+(color2[2]-color1[2])^2);
  return Math.abs((color1[0]+color1[1]+color1[2]) - (color2[0]+color2[1]+color2[2]))
}

function px(x,y,pixels){
  var pixel = [];
  for(var j = 0; j < pixels.shape[2]; j++){
    pixel.push(pixels.get(x,y,j));
  }
  return pixel;
}

function choroselect (pixel, rgb, tolerance) {
  if(
      pixel[0] > (rgb[0] - tolerance) &&
      pixel[0] < (rgb[0] + tolerance) &&
      pixel[1] > (rgb[1] - tolerance) &&
      pixel[1] < (rgb[1] + tolerance) &&
      pixel[2] > (rgb[2] - tolerance) &&
      pixel[2] < (rgb[2] + tolerance)
    ) {
    return true
  } else{ 
    return false
  }
}