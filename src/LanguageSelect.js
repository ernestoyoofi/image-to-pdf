const languageLib = require("./language.json")

const defaultLang = "en"

function ApplyLanguage(textInserted) {
  const detectedLang = navigator.language || navigator.languages[0]
  let select = detectedLang
  if(!Object.keys(languageLib).includes(detectedLang)) {
    select = defaultLang
  }
  return languageLib[select][textInserted] || languageLib[defaultLang][textInserted] || "InsertNotFound."+textInserted
}

module.exports = ApplyLanguage