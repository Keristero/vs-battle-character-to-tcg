class RenderCard{
    constructor(data,imgLoadedCallback){
        //parameters
        this.name = data.names[0].full
        this.avatar = data.images[0].src
        this.origin = data.origin

        //classifications
        let classificationsText = data.classifications.map((obj,index)=>{
            return obj.title
        })
        classificationsText = classificationsText.filter((item,index)=>{
            return index <= 3
        })
        this.classifications = `[${classificationsText.join("/")}]`
        if(data.classifications.length == 0){
            this.classifications = ""
        }
        console.log("CLASSIFICATIONS",this.classifications)

        this.flavourTextFont = 'italic 18px Courier New';
        this.flavourText = ""
        //Use quote if there is one
        if(data.quotes[0]){
            this.flavourText = `"${data.quotes[0]}"`
        }else if(data.description){
            //If there is no quote, use the description
            this.flavourTextFont = '18px Courier New';
            this.flavourText = data.description
        }

        //constants
        this.borderRadius = 15;

        //main div
        this.width = 400;
        this.height = 600;
        this.cornerRadius = 15;
        this.backgroundColor = ctx.createLinearGradient(0,0,this.width,this.height);
        this.backgroundColor.addColorStop(0,'rgb(0,0,0)'); 
        this.backgroundColor.addColorStop(1,'rgb(100,100,100)'); 

        //title bar
        this.titleHeight = 50
        this.titleBackgroundColor = "rgb(240,240,200)"
        this.titleFont = 'bold 30px Courier New';
        this.titleTextColor = "black"

        //avatar
        this.img_avatar = document.createElement("img")
        this.img_avatar.src = this.avatar
        this.img_avatar.onload = imgLoadedCallback

        //footer
        this.footerHeight = 150
        this.footerY = this.height-this.footerHeight
        this.footerBackgroundColor = "rgb(0,0,0)"

        //classifications
        this.classificationsFont = 'bold 20px Courier New';
        this.classificationsTextColor = "yellow"
        this.classifications_yOffset = 20
        this.classifications_xOffset = 10

        //flavorText
        this.flavourTextColor = "white"
        this.flavourText_yOffset = 40;
        this.flavorTextPaddingBottom = 5;

        //border
        this.borderColor = ctx.createLinearGradient(0,0,this.width,this.height);
        this.borderColor.addColorStop(0,'rgb(46,0,171)'); 
        this.borderColor.addColorStop(0.5,'rgb(57,13,107)'); 
        this.borderColor.addColorStop(1,'rgb(79,0,29)'); 
        this.borderWidth = 15

        //origin
        this.originHeight = 20;
        this.originWidth = 222
        this.originX = (this.width/2)-(this.originWidth/2)
        this.originY = this.height-this.originHeight
        this.originTextY = this.originY+12;
        this.originTextColor = "violet"
        this.originFont = 'bold 15px Courier New';

        //counter size
        let cs = 40
        //padding pixels
        let pp = 42

        this.counters = {
            "Cost":new RenderCounter(4,4,cs,cs,{r:45,g:156,b:194},this.borderColor,data.stats.Cost),
            "HP":new RenderCounter(this.width-86,this.height-pp,84,cs,{r:148,g:47,b:40},this.borderColor,data.stats.HP),
            "AttackPower":new RenderCounter(3,this.height-pp,pp,cs,{r:194,g:127,b:45},this.borderColor,data.stats.AttackPower),
            "EquipmentPower":new RenderCounter(45,this.height-pp,pp,cs,{r:127,g:129,b:130},this.borderColor,data.stats.EquipmentPower),
            "Speed":new RenderCounter(this.width-44,4,cs,cs,{r:79,g:194,b:40},this.borderColor,data.stats.Speed),
        }
    }
    draw(ctx){
        let innerCardWidth = this.width-(this.borderWidth*2)
        //Main card shape
        drawRoundedRectangle(ctx,0,0,this.width,this.height,this.cornerRadius,this.backgroundColor)

        ctx.globalCompositeOperation = "source-atop" //dont draw outside of card bounds
        //card title
        drawRectangle(ctx,0,0,this.width,this.titleHeight,this.titleBackgroundColor)

        //avatar
        let avatar_bottom_y = drawImageXCentered(ctx,this.img_avatar,this.width/2,this.titleHeight,this.width,this.height-this.titleHeight)

        //card title text
        drawText(ctx,"center",this.titleTextColor,this.titleFont,this.name,this.width/2,(this.titleHeight/4)*3,innerCardWidth-80,undefined,2,'red')

        //card footer
        this.footer_top_y = Math.min(avatar_bottom_y,this.height-this.footerHeight)
        drawRectangle(ctx,0,this.footer_top_y,this.width,this.height-this.footer_top_y,this.footerBackgroundColor)

        //classifications
        drawText(ctx,"left",this.classificationsTextColor,this.flavourTextFont,this.classifications,this.classifications_xOffset,this.footer_top_y+this.classifications_yOffset,innerCardWidth,this.originY-this.flavorTextPaddingBottom)

        //flavor text
        let wordWrappedText = wordWrap(this.flavourText,40)
        drawText(ctx,"center",this.flavourTextColor,this.flavourTextFont,wordWrappedText,this.width/2,this.footer_top_y+this.flavourText_yOffset,innerCardWidth,this.originY-this.flavorTextPaddingBottom)

        //draw counters
        for(let counterName in this.counters){
            let counter = this.counters[counterName]
            counter.draw(ctx)
        }

        //card border
        drawRoundedRectangle(ctx,0,0,this.width,this.height,this.cornerRadius,undefined,this.borderColor,this.borderWidth)

        //origin text
        drawRectangle(ctx,this.originX,this.originY,this.originWidth,this.originHeight,this.borderColor)
        drawText(ctx,"center",this.originTextColor,this.originFont,this.origin,this.width/2,this.originTextY,this.originWidth-6)

        ctx.globalCompositeOperation = "source-over"
    }
}

class RenderCounter{
    constructor(x,y,width,height,obj_rgb,strokeColor,value){
        this.initialValue = value
        this.currentValue = value
        this.maxValue = value

        this.x = x;
        this.y = y;
        this.w = width;
        this.h = height;
        this.obj_rgb = obj_rgb
        this.strokeColor = strokeColor;
        this.textYOffset = 8

        this.borderRadius = 7;
        this.lineWidth = 7
        this.font = 'bold 25px Courier New';
    }
    draw(ctx){
        if(!this.fillColor){
            this.fillColor = this.generateGradient(this.obj_rgb);
        }
        //Determine font color
        let textColor = "white"
        if(this.currentValue < this.initialValue){
            textColor = "red"
        }else if(this.currentValue > this.initialValue){
            textColor = "green"
        }
        drawRoundedRectangle(ctx,this.x,this.y,this.w,this.h,this.borderRadius,this.fillColor,this.strokeColor,this.lineWidth)

        drawText(ctx,"center",textColor,this.font,`${this.currentValue}`,this.x+(this.w/2),this.y+(this.h/2)+this.textYOffset,this.w,undefined,6)
    }
    generateGradient(rgb){
        let r = rgb.r;
        let g = rgb.g;
        let b = rgb.b;
        let gradient = ctx.createLinearGradient(this.x,this.y,this.x+this.w,this.y+this.h);
        gradient.addColorStop(0,`rgb(${r-50},${g-50},${b-50})`);
        gradient.addColorStop(0.7,`rgb(${r+50},${g+50},${b+50})`);
        gradient.addColorStop(1,`rgb(${r-100},${g-100},${b-100})`);
        return gradient
    }
}