/* This content is editable */
$(function () {$( '#selectable' ).selectable()})

/* Console support examples */
console.log(["abc", true, null, {keys: []}])

console.log(' \u2705 Il fait beau \u2600 \u2600 \u2600 \u2600 \u2600  !!!')
console.warn(' \u26A1 Le temps est nuageux \u2601 \u2601 \u2601 \u2601 \u2601 !!!')
console.error(' \u26D4 Il pleut  \u2614 \u2614 \u2614 \u2614 \u2614 \u2614 !!!')

fetch('https://dummyjson.com/comments?limit=2')
.then(res => res.json())
.then(r => r.comments)
.then(r => r.map(({body, likes}) => ({body, likes})))
.then(console.log)

console.log(12345.898)
