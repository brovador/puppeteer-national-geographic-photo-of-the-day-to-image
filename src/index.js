const puppeteer = require('puppeteer')
const delay = require('delay')
const fs = require('fs').promises

const url = 'https://www.nationalgeographic.com/photography/photo-of-the-day/'

;(async () => {
  let browser = await puppeteer.launch()
  let page = await browser.newPage()
  page.setViewport({ 'width': 1920, 'height': 1080 })
  await page.goto(url)
  await delay(1500)

  await page.evaluate(() => {
    let showMore = document.querySelector('.show-more-button')
    if (showMore) {
      showMore.click()
    }
  })

  let imageUrl = await page.evaluate(() => {
    let images = document.getElementsByTagName('source')[0].getAttribute('srcset').split(' ')
    return images[images.length - 2]
  })

  let photoTitle = await page.evaluate(() => {
    return document.getElementsByClassName('media__caption--title')[0].textContent
  })

  let photoText = await page.evaluate(() => {
    var p = document.getElementsByTagName('p')[0]
    if (p.getElementsByTagName('b').length) {
      p.getElementsByTagName('b')[0].remove()
    }
    return p.textContent
  })

  if (imageUrl) {
    let template = await fs.readFile('./template/index.html', { encoding: 'utf-8' })
    template = template.replace('IMAGE_URL', imageUrl)
      .replace('PHOTO_TITLE', photoTitle)
      .replace('PHOTO_TEXT', photoText)
    await fs.writeFile('./template.out.html', template)
    await page.setContent(template)
    await page.screenshot({ path: './background.png' })
  }
  await browser.close()
})()
