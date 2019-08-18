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
        this.borderColor.addColorStop(0,'rgb(0,0,255)'); 
        this.borderColor.addColorStop(1,'rgb(0,0,155)'); 
        this.borderWidth = 15

        //origin
        this.originHeight = 20;
        this.originWidth = 250
        this.originX = (this.width/2)-(this.originWidth/2)
        this.originY = this.height-this.originHeight
        this.originTextY = this.originY+12;
        this.originTextColor = "violet"
        this.originFont = 'bold 15px Courier New';

        //variables
        let counterSize = 40

        this.counters = {
            "Cost":new RenderCounter(4,4,40,40,"darkgreen","darkblue",data.stats.Cost),
            "HP":new RenderCounter(4,this.height-44,60,40,"darkred","darkblue",data.stats.HP),
            "AttackPower":new RenderCounter(this.width-44,4,40,40,"rgb(150,75,0)","darkorange",data.stats.AttackPower),
            "EquipmentPower":new RenderCounter(this.width-44,50,40,40,"rgb(50,50,50)","rgb(100,100,100)",data.stats.EquipmentPower),
            "Speed":new RenderCounter(this.width-44,94,40,40,"rgb(50,100,50)","rgb(100,200,100)",data.stats.Speed),
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
        drawText(ctx,"center",this.titleTextColor,this.titleFont,this.name,this.width/2,(this.titleHeight/4)*3,innerCardWidth-80)

        //card footer
        this.footer_top_y = Math.min(avatar_bottom_y,this.height-this.footerHeight)
        drawRectangle(ctx,0,this.footer_top_y,this.width,this.height-this.footer_top_y,this.footerBackgroundColor)

        //classifications
        drawText(ctx,"left",this.classificationsTextColor,this.flavourTextFont,this.classifications,this.classifications_xOffset,this.footer_top_y+this.classifications_yOffset,innerCardWidth,this.originY-this.flavorTextPaddingBottom)

        //flavor text
        let wordWrappedText = wordWrap(this.flavourText,70)
        drawText(ctx,"center",this.flavourTextColor,this.flavourTextFont,wordWrappedText,this.width/2,this.footer_top_y+this.flavourText_yOffset,innerCardWidth,this.originY-this.flavorTextPaddingBottom)

        //card border
        drawRoundedRectangle(ctx,0,0,this.width,this.height,this.cornerRadius,undefined,this.borderColor,this.borderWidth)

        //origin text
        drawRoundedRectangle(ctx,this.originX,this.originY,this.originWidth,this.originHeight,this.cornerRadius,this.borderColor)
        drawText(ctx,"center",this.originTextColor,this.originFont,this.origin,this.width/2,this.originTextY,this.originWidth-20)

        //draw counters
        for(let counterName in this.counters){
            let counter = this.counters[counterName]
            counter.draw(ctx)
        }

        ctx.globalCompositeOperation = "source-over"
    }
}

class RenderCounter{
    constructor(x,y,width,height,fillColor,strokeColor,value){
        this.initialValue = value
        this.currentValue = value
        this.maxValue = value

        this.x = x;
        this.y = y;
        this.w = width;
        this.h = height;
        this.fillColor = fillColor;
        this.strokeColor = strokeColor;
        this.textYOffset = 9

        this.borderRadius = 7;
        this.lineWidth = 5
        this.font = 'bold 30px Courier New';
    }
    draw(ctx){
        //Determine font color
        let textColor = "white"
        if(this.currentValue < this.initialValue){
            textColor = "red"
        }else if(this.currentValue > this.initialValue){
            textColor = "green"
        }
        drawRoundedRectangle(ctx,this.x,this.y,this.w,this.h,this.borderRadius,this.fillColor,this.strokeColor,this.lineWidth)

        drawText(ctx,"center",textColor,this.font,`${this.currentValue}`,this.x+(this.w/2),this.y+(this.h/2)+this.textYOffset,this.w)
    }
}