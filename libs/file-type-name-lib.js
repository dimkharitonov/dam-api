export function getFileTypeAndName(fileName) {
  let [ fileType, ...rest ] = decodeURIComponent(fileName).split('/');
  console.log('file type name', fileType, rest);
  return {
    fileType,
    fileName: rest && rest.length ? rest.join('/') : ''
  };
}
