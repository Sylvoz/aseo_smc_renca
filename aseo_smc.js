import puppeteer from "puppeteer";

export async function aseo_smc(rol,dv){
  const browser = await puppeteer.launch({
    headless: 'new',
    args: [
      "--disable-setuid-sandbox",
      "--no-sandbox",
      "--single-process",
      "--no-zygote",
      "--disable-dev-shm-usage",
      "--disable-gpu",
    ],
    executablePath:
      process.env.NODE_ENV === "production"
        ? process.env.PUPPETEER_EXECUTABLE_PATH
        : puppeteer.executablePath(),
  })

try{

  // Puppeteer process

  const page = await browser.newPage()

  const url=`https://pago.smc.cl/pagoAseov2/muni/renca.aspx`

  await page.goto(url,{waitUntil: 'domcontentloaded',timeout:15000});
  await page.waitForSelector('#ctl00_ContentPlaceHolder1_txtRol',{timeout:10000})
  await page.type('#ctl00_ContentPlaceHolder1_txtRol',rol)
  await page.type('#ctl00_ContentPlaceHolder1_txtRol2',dv)
  new Promise(r => setTimeout(r, 1000));
  await page.click('#ctl00_ContentPlaceHolder1_btnAceptar')
  


  try{
    await page.waitForSelector('#ctl00_ContentPlaceHolder1_lblTextHelp',{timeout:2000})
    let working= await page.evaluate(() =>{
      let data=document.getElementById("ctl00_ContentPlaceHolder1_lblTextHelp").innerText
      return data
    })
    if (working== "PREDIO NO EXISTE"){
      await browser.close()
      return {data:{
        total_debt_amount: "PREDIO NO EXISTE",
      }}
    } 
  } catch (e){
  }

  try{
  await page.waitForSelector('#ctl00_ContentPlaceHolder1_UpdatePanel2 > table > tbody > tr:nth-child(2) > td:nth-child(6)',{timeout:7000})

  
  const result= await page.evaluate(() =>{
    total=document.getElementsByClassName('lblTres')[0].innerText
    return total
  })

  let total=result
  if (total != '$'){
    total=total.replace('$','').replace('.','')
    total=parseInt(total)
  } else {
    total=0
  }

  await browser.close()

  if(total >=0){
    return { data:{
      total_debt_amount: total,
    }}
  }

  } catch (e){
    console.log(e)
    await browser.close()
    return {data:{
      total_debt_amount: "Error al cargar página",
    }}
  }}
  catch (e){
    console.log(e)
    await browser.close()
    return {data:{
      total_debt_amount: "Error al cargar página",
    }}
  }
  
}

export default aseo_smc 