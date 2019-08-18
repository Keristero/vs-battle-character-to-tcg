let canvas = document.getElementById('canvas')
let ctx = canvas.getContext('2d')

let MegamanEXE = new RenderCard(result,imgLoadedCallback)

function imgLoadedCallback(){
    console.log('loaded img!')
    MegamanEXE.draw(ctx)
}