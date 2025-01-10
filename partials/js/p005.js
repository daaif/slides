/* This content is editable */
$(function () {$( '#selectable' ).selectable()})

/* Console support examples */
console.log('Il fait beau !!!')
console.warn('Le temps est est nuageux !!!')
console.error('Il pleut !!!')
console.log(12345.898)
console.log(["abc", true, null, [], {key: 'value'}])
fetch('https://dummyjson.com/users?limit=2')
.then(res => res.json())
.then(console.log)
