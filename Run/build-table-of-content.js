const fs = require('fs-extra')
const _ = require('underscore')
const path = require('path')

const chaptersPath = '../Chapters'
const miscPath = '../Misc'
const tocPath = '../Table-Of-Content.md'
const tocTitle = 'Table Of Content'
const chapters = fs.readdirSync(chaptersPath)
const misc = fs.readdirSync(miscPath)
const tocFile = fs.existsSync(tocPath) ? fs.readFileSync(tocPath, 'utf8') : `# ${tocTitle} \n\n`

console.log('tocFile', tocFile);
console.log('chapters', chapters);
console.log('misc', misc);

const regex = /^(# Table Of Content)$([\w\W]*)/gm;
console.log('regex', tocFile.match(regex));
const toc = []

const makeTitle = ({n, t, p}) => {
  const rel = path.relative('../', p)
  const title = t.split('-').join(' ')
  return `[${n}. ${title}](${rel})`
}

const pullTitle = /(\w)-([\w-]*).md/;
misc.forEach(title => {
  const p = `${miscPath}/${title}`
  const n = title.match(pullTitle)[1]
  const t = title.match(pullTitle)[2]
  toc.push(makeTitle({n, t, p}))
})

chapters.forEach(title => {
  const p = `${chaptersPath}/${title}`
  const n = title.match(pullTitle)[1]
  const t = title.match(pullTitle)[2]
  toc.push(makeTitle({n, t, p}))
})


const updatedToc = tocFile.replace(regex, `# Table Of Content\n\n${toc.join('\n\n')}`)

fs.outputFileSync(tocPath, updatedToc)
