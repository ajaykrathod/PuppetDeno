import puppeteer from "https://deno.land/x/puppeteer@9.0.2/mod.ts";
import {
    Application,
    Router
  } from "https://deno.land/x/oak/mod.ts";
  import {
    oakAdapter,
    viewEngine,
    denjuckEngine,
  } from "https://deno.land/x/view_engine@v10.5.1/mod.ts";


const router = new Router()







router.get('/', (ctx) => {
    ctx.render('public/index.html',{data:{name:"Hello Ajay"}})
    
  })


router.all('/screenshot',async(ctx) => {
    const body = ctx.request.body({type: 'form-data'})
    const value = await body.value.read();
    const browser = await puppeteer.launch()
    const page = await browser.newPage();
    await page.goto(value.fields.url,{
      waitUntil:'networkidle2'
    });
    const screenshot = await page.screenshot({ path: "public/example.png" });
    
    await browser.close();
    const blob = new Blob(screenshot,{type: 'image/png'});
    
    const imageURL = URL.createObjectURL(blob)
    // const downloadURL = Deno.cwd() + "public/example.png"
    ctx.render('public/screenshot.html',{data:{src:"/example.png"}})
    ctx.response.status = 200
    
  })
  
  
  router.all('/pdf',async(ctx) => {
    if(ctx.request.method == "POST"){
      const body = ctx.request.body({type: 'form-data'})
    const value = await body.value.read();
    const browser = await puppeteer.launch({product:"chrome"})
    const page = await browser.newPage();
    await page.goto(value.fields.url,{
      waitUntil: 'networkidle2',
    });
    
    await page.pdf({path:"public/example.pdf",format:"a4"});
    // Stream a PDF into a file
    // const pdfStream = await page.createPDFStream();
    // const writeStream = createWriteStream('public/example.pdf');
    // pdfStream.pipeThrough(writeStream);
    // console.log("blocked");
    
    await browser.close();
    // const headers = new Headers()
    // const downloadURL = Deno.cwd() + "public/example.png"
    // headers.append('Content-Length', String(pdf.byteLength))
    // headers.append('Content-Type','application/pdf')
    // headers.append('Content-Disposition', 'attachment; filename=quote.pdf')
    ctx.render('public/pdf.html',{data:{src:"/example.pdf"}})
    ctx.response.status = 200
    
  }
})

const app = new Application()
app.use(viewEngine(oakAdapter,denjuckEngine))
app.use(router.routes());
app.use(router.allowedMethods())


app.use(async (context) => {
  await context.send({
      root: `${Deno.cwd()}/public`,
  })
});

app.addEventListener("listen",() => {
    console.log("Listening");
})
await app.listen({port:5000})