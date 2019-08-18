function drawRoundedRectangle(ctx,x,y,w,h,r,fill,stroke,lineWidth){
    if (w < 2 * r) r = w / 2;
    if (h < 2 * r) r = h / 2;
    ctx.beginPath();
    ctx.moveTo(x+r, y);
    ctx.arcTo(x+w, y,   x+w, y+h, r);
    ctx.arcTo(x+w, y+h, x,   y+h, r);
    ctx.arcTo(x,   y+h, x,   y,   r);
    ctx.arcTo(x,   y,   x+w, y,   r);
    ctx.closePath();
    draw(ctx,fill,stroke,lineWidth)
}

function draw(ctx,fill,stroke,lineWidth = 1){
    if(fill){
        ctx.fillStyle = fill;
        ctx.fill()
    }
    if(stroke){
        ctx.strokeStyle = stroke;
        ctx.lineWidth = lineWidth
        ctx.stroke()
    }
}

function drawRectangle(ctx,x,y,w,h,fill,stroke){
    ctx.beginPath()
    ctx.rect(x,y,w,h)
    ctx.closePath()
    draw(ctx,fill,stroke)
}

function drawText(ctx,alignment,color,font,content = "",x,y,maxWidth = 9999,maxHeight = 9999){
    console.log(`drawing text = ${content},${font},${x},${y},${maxWidth}`)
    let lineHeight = ctx.measureText('M').width+5;
    ctx.font = font;
    ctx.textAlign = alignment
    ctx.fillStyle = color
    let lines = content.split('\n')
    let lastLineY = y
    lines.forEach((line,l_number)=>{
        let lineY = y+(lineHeight*l_number)
        let nextLineY = y+(lineHeight*(l_number+2))
        if(lineY+lineHeight < maxHeight){
            let lastLine = nextLineY >= maxHeight
            let text = line
            if(lastLine){
                text = line.split(/,|\.|:|;/)[0]
                lastLineY = lineY
            }
            ctx.fillText(text, x, lineY,maxWidth);
        }
    })
    return lastLineY;
}

function drawImageXCentered(ctx,img,x,y,maxWidth,maxHeight){
    // get the scale
    var scale = Math.min(maxWidth / img.width, maxHeight / img.height);
    // get the top left position of the image
    var x = (maxWidth / 2) - (img.width / 2) * scale;
    ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
    return y+(img.height*scale)
}

function wordWrap(str = "", maxWidth) {
    var newLineStr = "\n"; done = false; res = '';
    while (str.length > maxWidth) {                 
        found = false;
        // Inserts new line at first whitespace of the line
        for (i = maxWidth - 1; i >= 0; i--) {
            if (testWhite(str.charAt(i))) {
                res = res + [str.slice(0, i), newLineStr].join('');
                str = str.slice(i + 1);
                found = true;
                break;
            }
        }
        // Inserts new line at maxWidth position, the word is too long to wrap
        if (!found) {
            res += [str.slice(0, maxWidth), newLineStr].join('');
            str = str.slice(maxWidth);
        }

    }

    return res + str;
}

function testWhite(x) {
    var white = new RegExp(/^\s$/);
    return white.test(x.charAt(0));
};