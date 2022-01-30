const cors = require('cors')
const express = require('express')
const fetch = require('node-fetch')

const app = express()
const port = 5000

if (process.env.NODE_ENV === 'development') app.use(express.static(__dirname))

app.set('port', port)
app.use(cors())

const apiUrl =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:' + port + '/paletteList.json'
    : 'https://raw.githubusercontent.com/hiulit/lospec-api/master/paletteList.json'

let getAllPalettes = async function (url) {
  const response = await fetch(url)
  return response.json()
}

app.get('/', (req, res) => {
  res.redirect('/api')
})

app.get('/api', (req, res) => {
  let colorNumberFilterType = req.query.colorNumberFilterType
  let colorNumber = req.query.colorNumber
  let page = req.query.page
  let tags = req.query.tag
  let sortingType = req.query.sortingType

  let itemsPerPage = 10

  getAllPalettes(apiUrl).then(response => {
    let results = {
      palettes: response.palettes,
      totalCount: response.totalCount
    }

    switch (colorNumberFilterType) {
      case 'max':
        results.palettes = response.palettes.filter(
          item => item.colors.length <= colorNumber
        )

        break
      case 'min':
        results.palettes = response.palettes.filter(
          item => item.colors.length >= colorNumber
        )

        break
      case 'exact':
        results.palettes = response.palettes.filter(
          item => item.colors.length == colorNumber
        )
        break
    }

    switch (sortingType) {
      case 'alphabetical':
        results.palettes = results.palettes.sort((a, b) =>
          a.title.localeCompare(b.title)
        )

        break
      case 'downloads':
        results.palettes = results.palettes.sort(function (a, b) {
          let c = parseInt(a.downloads.replace(/,/g, ''))
          let d = parseInt(b.downloads.replace(/,/g, ''))
          return d - c
        })

        break
      case 'newest':
        results.palettes = results.palettes.sort(
          (a, b) => new Date(b.sortNewest) - new Date(a.sortNewest)
        )

        break
    }

    if (tags) {
      let tagsSplit = tags.split(',').map(item => item.trim().replace(' ', ''))

      results.palettes = results.palettes.filter(item =>
        tagsSplit.every(i => item.tags.includes(i))
      )
    }

    results.totalCount = results.palettes.length

    if (page) {
      results.palettes = results.palettes.slice(
        page * itemsPerPage,
        page * itemsPerPage + itemsPerPage
      )
    }

    res.json(results)
  })
})

app.listen(port, () => {
  console.log('Server is running at http://localhost:' + port)
})
