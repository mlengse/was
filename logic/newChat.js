const mainChatFunc = require('../inBrowserFunction/_mainChatFunc')

const handleReply = require('../logic/handleReply')

const handleUnstructured = require('../logic/handleUnstructured')

const {
  mainChatSel, 
  mainChatSel2, 
  keywords
} = require('../config')

module.exports = async (page, chat) => {
  console.log(chat)
  //console.log(`${new Date()} handle new chat`)
  let mainChatElArr = []
  let newMainChatElArr = []
  //console.log(mainChatElArr.length)
  //console.log(Number(chat.newNotif))
  //console.log(mainChatElArr.length < Number(chat.newNotif))
  while (mainChatElArr.length < Number(chat.newNotif)) {
    mainChatElArr = await page.evaluate(mainChatFunc, mainChatSel, mainChatSel2)
    if (!Array.isArray(mainChatElArr)) {
      //console.log(mainChatElArr)
      mainChatElArr = []
    }
  }
  //console.log(mainChatElArr)
  while (newMainChatElArr.length < Number(chat.newNotif)) {
    let newChatText = mainChatElArr.pop()

    newMainChatElArr.push(newChatText)
  }
  for (let newChatText of newMainChatElArr) {
    //if (chat.isGroup) {
     // newChatText.group = chat.group
    //}
    //console.log(newChatText)
    newChatText.user = chat.user
    let containsPandawa = newChatText.content && newChatText.content.toLowerCase().includes('pandawa')
    let isTag = newChatText.content && newChatText.content.charAt(0) == '#' ? true : false
    let contentArr = []

    try {
      if (containsPandawa) {
        await page.type('#main > footer > .copyable-area', 'Harap mengganti kata pandawa dengan nama pasien.')
        await page.type('#main > footer > .copyable-area', '\u000d')

      } else {
        if (isTag) {

          if (newChatText.content.includes('alamat')) {
            newChatText.content = newChatText.content.split('alamat').join('#')
          }

          if (newChatText.content.includes('.')) {
            newChatText.content = newChatText.content.split('.').join('')
          }

          while (newChatText.content.includes('##')) {
            newChatText.content = newChatText.content.split('##').join('#')
          }

          contentArr = newChatText.content.split('#')
          contentArr = contentArr.map(e => e.trim())
          contentArr.shift()
          let firstWord = contentArr.shift()
          if(firstWord){
            firstWord = firstWord.split(' ').join('')
          }
          let isKeyword = keywords.filter(e => {
            if (firstWord == e) {
              return true
            }
            return false
          })
          if (isKeyword.length) {
            newChatText.contentArr = contentArr
            await handleReply(page, newChatText)
          } else {
            await handleUnstructured(page, newChatText)
          }
        } else {
          await handleUnstructured(page, newChatText)
        }

      }

    } catch (err) {
      console.error(`${new Date()} ${err}`)
    }

  }
}
