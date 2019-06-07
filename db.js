const loki = require('lokijs')
const randomColor = require('randomcolor');

var db = new loki('totality.json', {
  autoload: true,
  autoloadCallback : databaseInitialize,
  autosave: true, 
  autosaveInterval: 4000
})
// var db = new loki('totality.json')

var etDB
var oracleDB

function databaseInitialize() {
  etDB = db.getCollection("et")
  // etDB = db.addCollection('et')
  if (etDB === null) {
    etDB = db.addCollection('et')
  }
}

Array.prototype.unique = function() {
  var a = this.concat();
  for(var i=0; i<a.length; ++i) {
      for(var j=i+1; j<a.length; ++j) {
          if(a[i] === a[j])
              a.splice(j--, 1);
      }
  }

  return a;
};

class DBModule {
  constructor() {
    databaseInitialize()
  }

  makeid(length) {
    var text = ""
    var possible = "0123456789"
  
    for (var i = 0; i < length; i++)
      text += possible.charAt(Math.floor(Math.random() * possible.length))
  
    return text
  }

  findOpenET() {
    return etDB.find({status: "OPEN"});
  }

  findAllET() {
    return etDB.find();
  }

  findMyETs(userId) {
    var joinedInRole1ByMe = etDB.find({role1User: userId})
    var joinedInRole2ByMe = etDB.find({role2User: userId})
    var joinedInRole3ByMe = etDB.find({role3User: userId})
    var joinedInRole4ByMe = etDB.find({role4User: userId})
    var joinedInRole5ByMe = etDB.find({role5User: userId})

    return joinedInRole1ByMe.concat(joinedInRole2ByMe).concat(joinedInRole3ByMe).concat(joinedInRole4ByMe).concat(joinedInRole5ByMe).unique()
  }

  findET(name) {
    return etDB.findOne({name: name})
  }

  createET(createdBy, customId, date, romChannel, discordChannel, roles) {
    var newEt
    if (roles && roles.length > 0) {
        newEt = {
          createdBy: createdBy,
          name: customId ? customId : this.makeid(5),
          color: randomColor(),
          date: date,
          romChannel: romChannel,
          discordChannel: discordChannel,
          role1Name: roles[0],
          role1User: null,
          role1Alt: false,
          role2Name: roles[1],
          role2User: null,
          role2Alt: false,
          role3Name: roles[2],
          role3User: null,
          role3Alt: false,
          role4Name: roles[3],
          role4User: null,
          role4Alt: false,
          role5Name: roles[4],
          role5User: null,
          role5Alt: false,
          status: "OPEN",
          queue: []
        }
    } else {
        newEt = {
            createdBy: createdBy,
            name: customId ? customId : this.makeid(5),
            color: randomColor(),
            date: date,
            romChannel: romChannel,
            discordChannel: discordChannel,
            role1Name: 'TANK',
            role1User: null,
            role1Alt: false,
            role2Name: 'PRIEST',
            role2User: null,
            role2Alt: false,
            role3Name: 'DPS',
            role3User: null,
            role3Alt: false,
            role4Name: 'DPS',
            role4User: null,
            role4Alt: false,
            role5Name: 'DPS',
            role5User: null,
            role5Alt: false,
            status: "OPEN",
            queue: []
          }
    } 

    return etDB.insert(newEt)
  }

  updateET(et) {
    return etDB.update(et)
  }

  deleteET(name) {
    etDB.chain().find({name: name}).remove()
  }

	doesETNameExist(name) {
		if (etDB.findOne({name: name})) {
			return true;
		}
		return false;
	}
}

module.exports = DBModule
