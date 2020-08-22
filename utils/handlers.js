const re = /-UFOP_FULL_/g
var url

exports.getUrlFromHtml = function (d) {
  d.toString()
    .split('<')
    .filter(v => v[0] === 'a' && v.search(re) !== -1 ? url = v.split('"')[1] : false)
  return url || 'Url not found'
}
