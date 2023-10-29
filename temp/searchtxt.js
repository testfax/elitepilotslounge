const fs = require('fs');
const path = require('path');

function searchWordInFiles(directory, word) {
  fs.readdir(directory, (err, files) => {
    if (err) {
      console.error('Error reading directory:', err);
      return;
    }

    files.forEach((file) => {
      const filePath = path.join(directory, file);
      // Check if the file has a .log extension
      if (path.extname(file) === '.js') {
        fs.readFile(filePath, 'utf8', (err, content) => {
          if (err) {
            console.error(`Error reading file ${filePath}:`, err);
            return;
          }
          const index = content.indexOf(searchWord)
          // console.log(index)
          if (index !== -1) {
            console.log(`Found '${word}' in file: ${filePath}`);
          }
        });
      }
    });
  });
}

// Provide the directory path and the word to search for
const directoryPath = '../';
const searchWord = 'initial';
// const searchWord = '"Thargoid Bio-Storage Capsule"';

searchWordInFiles(directoryPath, searchWord);

//! Power shell search. Replace "THESEARCHSTRING" with the one you want for finding code items.
// Get-ChildItem -Recurse -Filter *.js | ForEach-Object {
//   $filePath = $_.FullName
//   if (Get-Content $filePath | Select-String -Pattern "socketMain") {
//       Write-Host "String found in $filePath"
//   }
// }