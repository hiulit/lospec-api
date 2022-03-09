const fetch = require('node-fetch')
const fs = require('fs')
const path = require('path')

const http = require('http')
const https = require('https')
http.globalAgent.maxSockets = 1
https.globalAgent.maxSockets = 1

function writeJSON (data, filePath) {
  try {
    fs.writeFileSync(
      path.resolve(filePath) + '.json',
      JSON.stringify(data, null, 2)
    )
    console.log(
      '\033[1;32m"' + filePath + '.json"\033[0m has been created successfully!'
    )
  } catch (err) {
    console.error(err)
  }
}

let getPalettes = async function (page = 0) {
  let url = `https://lospec.com/palette-list/load?colorNumberFilterType=any&colorNumber=8&page=${page}&tag=&sortingType=default`

  let results = await fetch(url).then(response => {
    return response.text()
  })

  return results
}

let getPaletteList = async function (page = 0) {
  let results = await getPalettes(page)

  console.log('Retreiving data from API for page : ' + page)

  results = JSON.parse(results)

  results.palettes.forEach((element, index) => {
    if (element.publishedAt) {
      results.palettes[index].publishedAt = Date.parse(
        element.publishedAt.split('.')[0]
      )
    }
    if (element.createdAt) {
      results.palettes[index].createdAt = Date.parse(
        element.createdAt.split('.')[0]
      )
    }
    if (element.sortNewest) {
      results.palettes[index].sortNewest = Date.parse(
        element.sortNewest.split('.')[0]
      )
    }
    if (element.updatedAt) {
      results.palettes[index].updatedAt = Date.parse(
        element.updatedAt.split('.')[0]
      )
    }
  })

  let totalCount = results.totalCount
  // let itemsPerPage = results.palettes.length
  let itemsPerPage = 10
  let maxPages = Math.ceil(totalCount / itemsPerPage) //- 1
  // maxPages = 0

  if (page < maxPages) {
    return results.palettes.concat(await getPaletteList(page + 1))
  } else {
    return results.palettes
  }
}

;(async () => {
  const paletteList = await getPaletteList()
  console.log(paletteList.length)

  let finalJSON = {
    palettes: paletteList,
    totalCount: paletteList.length
  }
  writeJSON(finalJSON, './paletteList')
})()
