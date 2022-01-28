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
    : 'https://raw.githubusercontent.com/hiulit/Lospec-API/master/paletteList.json'

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

  getAllPalettes(apiUrl).then(palettes => {
    let results = palettes

    switch (colorNumberFilterType) {
      case 'any':
        results = palettes

        break
      case 'max':
        results = palettes.filter(item => item.colors.length <= colorNumber)

        break
      case 'min':
        results = palettes.filter(item => item.colors.length >= colorNumber)

        break
      case 'exact':
        results = palettes.filter(item => item.colors.length == colorNumber)
        break
      default:
        break
    }

    switch (sortingType) {
      case 'alphabetical':
        results = results.sort((a, b) => a.title.localeCompare(b.title))

        break
      case 'downloads':
        results = results.sort(function (a, b) {
          let c = parseInt(a.downloads.replace(/,/g, ''))
          let d = parseInt(b.downloads.replace(/,/g, ''))
          return d - c
        })

        break
      case 'newest':
        results = results.sort(
          (a, b) => new Date(b.sortNewest) - new Date(a.sortNewest)
        )

        break
      default:
        break
    }

    if (tags) {
      let tagsSplit = tags.split(',').map(item => item.trim().replace(' ', ''))

      results = results.filter(item =>
        tagsSplit.every(i => item.tags.includes(i))
      )
    }

    let resultsLength = results.length

    console.log(resultsLength)

    if (page) {
      res.json(results.slice(page * itemsPerPage, (page + 1) * itemsPerPage))
    } else {
      res.json(results)
    }
  })
})

app.listen(port, () => {
  console.log('Server is running at http://localhost:' + port)
})
