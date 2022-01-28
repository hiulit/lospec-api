const fetch = require('node-fetch')
const fs = require('fs')
const path = require('path')

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

  let totalCount = results.totalCount
  // let itemsPerPage = results.palettes.length
  let itemsPerPage = 10
  let maxPages = Math.ceil(totalCount / itemsPerPage) //- 1

  if (page < maxPages) {
    return results.palettes.concat(await getPaletteList(page + 1))
  } else {
    return results.palettes
  }
}

;(async () => {
  const paletteList = await getPaletteList()
  console.log(paletteList)
  console.log(paletteList.length)
  writeJSON(paletteList, './paletteList')
})()
