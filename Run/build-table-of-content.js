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

const tocRegex = /^(# Table Of Content)$([\w\W]*)/gm;
const nextorprevRegex = /^(Next|Previous) \[.*\]\(.*\)$/gm;
const nextRegex = /^Next \[.*\]\(.*\)$/gm;
const prevRegex = /^Previous \[.*\]\(.*\)$/gm;

const toc = []

const makeTitle = ({n, t, p}) => {
  const rel = path.relative('../', p)
  const title = t.split('-').join(' ')
  return `[${n}. ${title}](/${rel})`
}

const makeItem = ({n, t, p}) => {
  const title = makeTitle({n, t, p})
  const path = p
  return {
    title,
    path
  }
}

const updatePageNav = ({current, prev, next}) => {
  console.log('updatePageNav', {current, prev, next})
  const page = fs.readFileSync(current, 'utf8')

  let updatedPage = page.replace(nextorprevRegex, '').trim()
  if (prev) {
    console.log('prev find', page.match(prevRegex));
    updatedPage = `${updatedPage}\n\nPrevious ${prev.title}`
  }

  if (next) {
    updatedPage = `${updatedPage}\n\nNext ${next.title}`
    console.log('next find', page.match(nextRegex));
  }

  fs.outputFileSync(current, updatedPage)

}

const pullTitle = /(\w)-([\w-]*).md/;
misc.forEach(title => {
  const p = `${miscPath}/${title}`
  const n = title.match(pullTitle)[1]
  const t = title.match(pullTitle)[2]
  const item = makeItem({n, t, p})
  toc.push(item)
})

chapters.forEach(title => {
  const p = `${chaptersPath}/${title}`
  const n = title.match(pullTitle)[1]
  const t = title.match(pullTitle)[2]
  const item = makeItem({n, t, p})
  toc.push(item)
})

const updatedToc = tocFile.replace(tocRegex, `# Table Of Content\n\n${toc.map(i => i.title).join('\n\n')}`)

const pages = toc.length
toc.forEach((i, index) => {
  const page = index + 1
  if (page > 1) {
    i.prev = {
      title: toc[index-1].title,
      path: toc[index-1].path
    }
  }
  if (page < pages) {
    i.next = {
      title: toc[index+1].title,
      path: toc[index+1].path
    }
  }
  // console.log('i', page, pages, i);
})

toc.forEach(i => {
  const current = i.path
  const prev = i.prev
  const next = i.next
  updatePageNav({current, prev, next})
})

fs.outputFileSync(tocPath, updatedToc)
