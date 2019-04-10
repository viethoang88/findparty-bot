const loki = require('lokijs')
// var db = new loki('totality.json', {
//   autoload: true,
//   autoloadCallback : databaseInitialize,
//   autosave: true, 
//   autosaveInterval: 4000
// })
var db = new loki('totality.json')

var etDB
var oracleDB

function databaseInitialize() {
  // etDB = db.getCollection("et")
  etDB = db.addCollection('et')
  if (etDB === null) {
    etDB = db.addCollection('et')
  }
}

class DBModule {
  constructor() {
    databaseInitialize()
  }

  makeid(length) {
    var text = ""
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  
    for (var i = 0; i < length; i++)
      text += possible.charAt(Math.floor(Math.random() * possible.length))
  
    return text
  }

  findAllET() {
    return etDB.find()
  }

  findET(name) {
    return etDB.findOne({name: name})
  }

  createET(date, romChannel, discordChannel, roles) {
    var newEt
    if (roles.length > 0) {
        newEt = {
          name: this.makeid(5),
          date: date,
          romChannel: romChannel,
          discordChannel: discordChannel,
          role1Name: roles[0],
          role1User: null,
          role2Name: roles[1],
          role2User: null,
          role3Name: roles[2],
          role3User: null,
          role4Name: roles[3],
          role4User: null,
          role5Name: roles[4],
          role5User: null,
          queue: []
        }
    } else {
        newEt = {
            name: this.makeid(5),
            date: date,
            romChannel: romChannel,
            discordChannel: discordChannel,
            role1Name: 'TANK',
            role1User: null,
            role2Name: 'PRIEST',
            role2User: null,
            role3Name: 'DPS',
            role3User: null,
            role4Name: 'DPS',
            role4User: null,
            role5Name: 'DPS',
            role5User: null,
            queue: []
          }
    } 

    return etDB.insert(newEt)
  }

  updateET(et) {
    return etDB.update(et)
  }
}

module.exports = DBModule
