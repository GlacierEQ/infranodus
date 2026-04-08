module.exports = Instruments

function Instruments() {}

// Borrowed from this beautiful example: http://stackoverflow.com/a/9229821/712347

// Optimization: replaced object-based lookup (seen = {}) with Set (seen = new Set())
// to provide O(1) average time complexity for deduplication. This is especially
// effective for large arrays like nodes/edges in graph data.
Instruments.uniqualizeArray = function(ary, key) {
    var seen = new Set()
    return ary.filter(function(elem) {
        var k = key(elem)
        if (seen.has(k)) {
            return false
        }
        seen.add(k)
        return true
    })
}

Instruments.cleanHtml = function(Description) {
    var tmp = Description.replace(/<br\s*\/?>/gm, '\n')
    tmp = tmp.replace(/(<([^>]+)>)/gi, ' ')
    tmp = tmp.replace(/&nbsp;/g, ' ')
    return tmp
}

Instruments.findInArray = function(array, key, reverse) {
    for (var i = 0; i < array.length; i++) {
        if (reverse) {
            if (array[i][1] == key) {
                return array[i][0]
            }
        } else {
            if (array[i][0] == key) {
                return array[i][1]
            }
        }
    }
}

Instruments.chunkString = function(str, size) {
    const numChunks = Math.ceil(str.length / size)
    const chunks = new Array(numChunks)
  
    for (let i = 0, o = 0; i < numChunks; ++i, o += size) {
      chunks[i] = str.substr(o, size)
    }
  
    return chunks
}
