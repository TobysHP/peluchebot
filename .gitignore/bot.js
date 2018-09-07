const Discord = require("discord.js");
const fs = require('fs')
const fileExists = require('file-exists')
const client = new Discord.Client()
//const config = require('./config.json')
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/peluchebot";


// déclaration des variables----------------------------------------------------

var money = "☆";
var prefix = "!";
var tournoi=[];
var orga=[];
var participant ={
  init: function(joueur, i){
    this.joueur=joueur;
    this.points=i;
  },

  affiche: function(){
    var affichage=this.joueur+" : "+this.points+money;
    return affichage;
  },

  echange: function(x){
    this.points=this.points+x;
  },

  getName: function(){
    return this.joueur;
  },

  getPoints: function(){
    return this.points;
  },

  setPoints: function(x){
    this.points=x;
  }
};
//var fileSystem=new ActiveXObject("Scripting.FileSystemObject");
//fileSystem.CreateTextFile("tutorielsenfolie.txt",false);

// fin déclarations-------------------------------------------------------------

MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  var dbo = db.db("peluchebot");
  dbo.collection("part").find({}).toArray(function(err, result) {
  if (err) throw err;
  console.log(result);
  y=result.length;
  console.log(y);
  for(var i=0;i<y;i++){
    console.log(i);
    var x;
    tournoi.push(x);
    tournoi[i]=Object.create(participant);
    tournoi[i].init(result[i].name,parseInt(result[i].points));
  }
  db.close();
  });
});

MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  var dbo = db.db("peluchebot");
  dbo.collection("orga").find({}).toArray(function(err, resultbis) {
  if (err) throw err;
  console.log(resultbis);
  y=resultbis.length;
  console.log(y);
  for(var i=0;i<y;i++){
    console.log(i);
    var x=resultbis[i].name;
    orga.push(x);
  }
  db.close();
  });
});

// fonctions--------------------------------------------------------------------

function find(name){
  var y=tournoi.length;
  for(var i=0;i<y;i++){
    if (name==tournoi[i].getName()){
      return i;
    }
  }
  return -1;
}

function tri(tab){
  var y=tab.length;
  var compt=1;
  while (compt){
  for(var i=0;i<y-1;i++){
    compt=0;
    if(tab[i].getPoints()<tab[i+1].getPoints()){
      var temp;
      temp=tab[i];
      tab[i]=tab[i+1];
      tab[i+1]=temp;
      compt=1
    }
  }
  }
}


//fn des fonctions--------------------------------------------------------------

// début du code----------------------------------------------------------------

client.on("ready", function () {
    console.log(`Ready`);
  });

// lecture des messages---------------------------------------------------------

client.on('message', message => {

    if (message.author.bot) return
    if (message.content.indexOf(config.prefix) !== 0) return



    const args = message.content.slice(prefix.length).trim().split(/ +/g)
    const command = args.shift().toLowerCase()

    if (message.channel.type === 'dm' && command != 'help') return
    // !addorga-----------------------------------------------------------------
    if (command == 'addorga'){
      y=orga.length;
      if(orga.length==0){
        orga.push(message.author.username);
        MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        console.log("connect")
        var dbo = db.db("peluchebot");
        var myobj = { name: message.author.username };
        dbo.collection("orga").insertOne(myobj, function(err, res) {
          if (err) throw err;
          console.log("1 document inserted");
          db.close();
        });
        });
      }
      else {
        mtadd=message.mentions.users.last();
        if(mtadd==undefined){
          return;
        }
        for(var i=0;i<y;i++){
          if(mtadd.username==orga[i]){
            message.reply("Cette personne fait déjà partie de l'organisation!")
            return;
          }
        }
        for(var i=0;i<y;i++){
          if(message.author.username==orga[i]){
            orga.push(mtadd.username);
            MongoClient.connect(url, function(err, db) {
            if (err) throw err;
            console.log("connect")
            var dbo = db.db("peluchebot");
            var myobj = { name: mtadd.username };
            dbo.collection("orga").insertOne(myobj, function(err, res) {
              if (err) throw err;
              console.log("1 document inserted");
              db.close();
            });
            });
          }
        }
      }
      return;
    }
    // !listorga----------------------------------------------------------------
    if (command == 'listorga'){
      var mess="```==Liste des organisateurs==\n";
      for(var i=0;i<orga.length;i++){
        mess=mess+"\n"+orga[i];
      }
      mess=mess+"```";
      message.channel.sendMessage(mess);
      return;
    }
    // !eliminate---------------------------------------------------------------
    if (command == 'eliminate'){
      for(var i=0;i<orga.length;i++){
        if(message.author.username==orga[i]){
          mtsupp=message.mentions.users.last();
          if(mtsupp==undefined){
            message.reply("Il faut mentionner quelqu'un!")
            return;
          }
          pos=find(mtsupp.username);
          if(pos==-1){
            message.reply("Ce joueur ne participe pas au tournoi!")
            return;
          }
          temp=tournoi[pos];
          for(var i=pos;i<tournoi.length-1;i++){
            tournoi[i]=tournoi[i+1];
          }
          tournoi.pop();
          message.channel.sendMessage("```Oups... "+mtsupp.username+" a été éliminé du tournoi!```");
          MongoClient.connect(url, function(err, db) {
             if (err) throw err;
             var dbo = db.db("peluchebot");
             var myquery = { name: mtsupp.username };
             dbo.collection("part").deleteOne(myquery, function(err, obj) {
             if (err) throw err;
             console.log("1 document deleted");
             db.close();
             });
          });
        }
      }
      return;
    }
    // !participate-------------------------------------------------------------
    if (command == 'participate') {
      auteur = message.author.username;
      if(find(auteur)!=-1){
        message.reply('Tu es déjà inscrit!');
        return;
      }
      var y;
      var x;
      tournoi.push(x);
      y=tournoi.length;
      tournoi[y-1]=Object.create(participant);
      /*tournoi.push(Object.create(participant));
      y=tournoi.length-1;*/
      tournoi[y-1].init(auteur,3);
      message.channel.send(tournoi[y-1].affiche())
      message.reply("Tu es inscrit au tournoi !");
      MongoClient.connect(url, function(err, db) {
      if (err) throw err;
      console.log("connect")
      var dbo = db.db("peluchebot");
      var myobj = { name: auteur, points: '3' };
      dbo.collection("part").insertOne(myobj, function(err, res) {
        if (err) throw err;
        console.log("1 document inserted");
        db.close();
      });
      });
      return;
    }
    // !leaderboard-------------------------------------------------------------
    if (command=='leaderboard'){
      //temporaire
      y=tournoi.length;
      if(y>1){
      tri(tournoi);
      }
      if(y==0){
        message.channel.sendMessage("le tableau est vide");
      }
      else{
        var text='';
        for(var i=0;i<y;i++){
          text=text+'\n'+(i+1)+'- '+tournoi[i].affiche();
        }
        message.channel.sendMessage('```'+text+'```');
      }
      return
    }
    // !give--------------------------------------------------------------------
    if(command=='give'){
      var donneur=message.author;
      var ok=1;
      try{
        var receveur=message.mentions.users.last();
        ok=0;
      }catch(err){}
      if(receveur==undefined){
        message.reply("Aucun joueur n'a été mentionné");
        return
      }
      if(!message.content[6]){
        return;
      }
      const nb=parseInt(message.content[6]);
      if (isNaN(parseFloat(nb))){
         message.reply("Vous n'avez pas spécifié le montant de la transaction");
         return;
      }
      var posd=find(donneur.username);
      var posr=find(receveur.username);
      if(posd==-1){
        message.reply("Vous ne participez pas au tournoi!");
      }
      if(posr==-1){
        message.reply("Ce joueur ne participe pas au tournoi!");
      }
      if(tournoi[posd].getPoints()==0){
        message.reply("Tu n'as plus d'étoiles, tu dois faire l'épreuve de la dernière chance !");
        return;
      }
      if(tournoi[posd].getPoints()<nb){
        message.reply("tu n'as pas assez d'étoiles pour en donner autant !");
        return;
      }
      if(posr != -1 && posd != -1){
        tournoi[posd].echange(-nb);
        tournoi[posr].echange(nb);
        message.channel.sendMessage("```"+receveur.username+" a récupéré "+nb+" étoile(s) de "+donneur.username+"```" );
      }
      if(tournoi[posd].getPoints()==0){
          message.channel.sendMessage("``` Coup dur pour "+donneur.username+", il devra maintenant passer au conseil pour l'épreuve de la dernière chance!!!```" );
      }

      MongoClient.connect(url, function(err, db) {
      if (err) throw err;
      var psd=tournoi[posd].getName();
      var pnt=tournoi[posd].getPoints().toString();
      var dbo = db.db("peluchebot");
      var myquery = { name: psd };
      var newvalues = { $set: {name: psd, points: pnt } };
      dbo.collection("part").updateOne(myquery, newvalues, function(err, res) {
        if (err) throw err;
        console.log("1 document updated");
        db.close();
      });
      });

      MongoClient.connect(url, function(err, db) {
      if (err) throw err;
      var psd=tournoi[posr].getName();
      var pnt=tournoi[posr].getPoints().toString();
      var dbo = db.db("peluchebot");
      var myquery = { name: psd };
      var newvalues = { $set: {name: psd, points: pnt } };
      dbo.collection("part").updateOne(myquery, newvalues, function(err, res) {
        if (err) throw err;
        console.log("1 document updated");
        db.close();
      });
      });
      return;
    }
    // !stop--------------------------------------------------------------------
    if(command=='stop'){
      throw new Error( 'STOP COCO!' );
    };
    // !data--------------------------------------------------------------------
    if(command=='data'){
      MongoClient.connect(url, function(err, db) {
     if (err) throw err;
     var dbo = db.db("peluchebot");
     dbo.collection("part").find({}).toArray(function(err, result) {
     if (err) throw err;
     console.log(result);
     db.close();
        });
     });
     return;
    };
    // !add---------------------------------------------------------------------
    if(command=='add'){
     for(var i=0;i<orga.length;i++){
       if(message.author.username==orga[i]){
         const nb=parseInt(message.content[5]);
         try{
           var receveur=message.mentions.users.last();
         }catch(err){}
         if(receveur==undefined){
           message.reply("Aucun joueur n'a été mentionné");
           return
         }
         var posr=find(receveur.username);
         if(posr==-1){
           message.reply("Ce joueur ne participe pas au tournoi!");
           return;
         }
         if (isNaN(parseFloat(nb))){
            message.reply("Vous n'avez pas spécifié le montant de la transaction");
            return;
         }
         tournoi[posr].echange(nb);
         message.channel.sendMessage("```"+receveur.username+" a reçu "+nb+" étoile(s) ```" );
         MongoClient.connect(url, function(err, db) {
         if (err) throw err;
         var psd=tournoi[posr].getName();
         var pnt=tournoi[posr].getPoints().toString();
         var dbo = db.db("peluchebot");
         var myquery = { name: psd };
         var newvalues = { $set: {name: psd, points: pnt } };
         dbo.collection("part").updateOne(myquery, newvalues, function(err, res) {
           if (err) throw err;
           console.log("1 document updated");
           db.close();
         });
         });
       }

     }
     return;
    };
    // !remove---------------------------------------------------------------------
    if(command=='remove'){
     for(var i=0;i<orga.length;i++){
       if(message.author.username==orga[i]){
         const nb=parseInt(message.content[8]);
         try{
           var receveur=message.mentions.users.last();
         }catch(err){}
         if(receveur==undefined){
           message.reply("Aucun joueur n'a été mentionné");
           return
         }
         var posr=find(receveur.username);
         if(posr==-1){
           message.reply("Ce joueur ne participe pas au tournoi!");
           return;
         }
         if (isNaN(parseFloat(nb))){
            message.reply("Vous n'avez pas spécifié le montant de la transaction");
            return;
         }
         tournoi[posr].echange(-nb);
         message.channel.sendMessage("```"+receveur.username+" a été débité de "+nb+" étoile(s) ```" );
         MongoClient.connect(url, function(err, db) {
         if (err) throw err;
         var psd=tournoi[posr].getName();
         var pnt=tournoi[posr].getPoints().toString();
         var dbo = db.db("peluchebot");
         var myquery = { name: psd };
         var newvalues = { $set: {name: psd, points: pnt } };
         dbo.collection("part").updateOne(myquery, newvalues, function(err, res) {
           if (err) throw err;
           console.log("1 document updated");
           db.close();
         });
         });
       }

     }
     return;
    };

    // fonctions propres aux fichiers ------------------------------------------
    try {
      let commandFile = require(`./commands/${command}.js`)
      fileExists(`./commands/${command}.js`).then(exists => {
        if (exists) commandFile.run(client, message, args)
      })
    } catch(err) {
      if (command != 'test'){
          message.channel.send('Commande inconnue ou corrompue. Faites `' + prefix + 'help bot` pour la liste des commandes. Si la commande que vous avez entré existe bel et bien, informez un membre du staff du problème.')
          .catch(error => console.log(error));
            }
        }
  })

  client.login(process.env.BOT_TOKEN)
