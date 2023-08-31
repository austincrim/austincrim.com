// @ts-check

import puppeteer from 'puppeteer-core'
import chrome from 'chrome-aws-lambda'
import fsSync from 'fs'
import fs from 'fs/promises'
import path from 'path'

async function main() {
  const browser = await puppeteer.launch({
    args: chrome.args,
    executablePath: await chrome.executablePath,
    headless: 'new',
  })

  let dirs = await fs.readdir('src/content/posts')
  await Promise.all(
    dirs.map(async (slug) => {
      let url = slug.replace('.md', '')
      let page = await browser.newPage()
      await page.setViewport({ width: 1200, height: 627 })
      await page.goto(`http://localhost:3000/og/${url}`, {
        waitUntil: 'networkidle0',
      })
      let buffer = await page.screenshot({
        type: 'png',
        clip: { x: 0, y: 0, width: 1200, height: 630 },
      })

      let imagePath = path.join('public', 'og', `${url}.png`)

      if (fsSync.existsSync(imagePath)) {
        console.log(`skipped!`)
      } else {
        if (buffer) {
          await fs.writeFile(imagePath, buffer)
          console.log(`wrote ${imagePath}`)
        }
      }
      await page.close()
    })
  )
}

main()
  .then(() => {
    console.log('done')
    process.exit(0)
  })
  .catch((e) => console.error(e))
