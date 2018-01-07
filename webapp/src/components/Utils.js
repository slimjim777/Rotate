

export function sectionFromPath(path) {
    return path.split('/')[1]
}


export function subsectionFromPath(path) {
    var p = path.split('/')
    if (p.length > 1) {
        return path.split('/')[2]
    } else {
        return ''
    }
}

export function subSubsectionFromPath(path) {
    var p = path.split('/')
    if (p.length > 2) {
        return path.split('/')[3]
    } else {
        return ''
    }
}


// 
// 
// export function sectionIdFromPath(path, section) {
//   const parts = path.split('/').slice(1)
//   return (parts[0] === section && parts[1]) || ''
// }
