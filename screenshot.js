import puppeteer from "https://deno.land/x/puppeteer@14.1.1/mod.ts";
import {
    Application,
    Router
  } from "https://deno.land/x/oak@v10.6.0/mod.ts";
  import {
    oakAdapter,
    viewEngine,
    denjuckEngine,
  } from "https://deno.land/x/view_engine@v10.5.1/mod.ts";


const router = new Router()

const app = new Application()



app.use(viewEngine(oakAdapter,denjuckEngine))


router.get('/', (ctx) => {
    ctx.render('index.html',{data:{name:"Hello Ajay"}})
    
})


router.all('/screenshot',async(ctx) => {
    const body = ctx.request.body({type: 'form-data'})
    const value = await body.value.read();
    const browser = await puppeteer.launch()
    const page = await browser.newPage();
    await page.goto(value.fields.url);
    const screenshot = await page.screenshot({ path: "example.png" });
    
    await browser.close();
    const blob = new Blob(screenshot,{type: 'image/png'});

    const imageURL = URL.createObjectURL(blob)
    // const downloadURL = Deno.cwd() + "public/example.png"
    ctx.render('screenshot.html',{data:{src:imageURL}})
    ctx.response.status = 200
    
})


router.all('/pdf',async(ctx) => {
  if(ctx.request.method == "POST"){
    const body = ctx.request.body({type: 'form-data'})
    const value = await body.value.read();
    const browser = await puppeteer.launch()
    const page = await browser.newPage();
    await page.goto(value.fields.url,{
      waitUntil: 'networkidle2',
    });
    const pdf = await page.pdf({path:"example.pdf",format:"A4"});
    
    await browser.close();
    const headers = new Headers()
    // const downloadURL = Deno.cwd() + "public/example.png"
    headers.append('Content-Length', String(pdf.byteLength))
    headers.append('Content-Type','application/pdf')
    headers.append('Content-Disposition', 'attachment; filename=quote.pdf')
    ctx.response.body = pdf
    ctx.response.headers = headers
    ctx.response.status = 200

  }
  if(ctx.request.method == "GET"){
    ctx.render('pdf.html')

  }
  
})

app.use(router.routes());
app.use(router.allowedMethods())


// app.use(async (context) => {
//   await context.send({
//       root: `${Deno.cwd()}/public`,
//   })
// });

app.addEventListener("listen",() => {
    console.log("Listening");
})
await app.listen({port:5000})