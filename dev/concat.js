/**
 * Created by Nikko on 2016-02-15.
 */
var fs = require('fs');

var allDigi = [];

fs.readFile('out', function(err, data){
    if(err) return console.error(err);

    var digimon = JSON.parse(data).section;

    var currDigi;

    for(var i=0;i<digimon.length;i++){
        switch(digimon[i].name){
            case "Level 1 Raw Stats":
                currDigi.lv1Stats = digimon[i].data;
                break;
            case "Level 99 Raw Stats":
                currDigi.lv99Stats = digimon[i].data;
                break;
            case "De-digivolution":
                currDigi.dedigivolution = digimon[i].data;
                break;
            case "Digivolution Requirements":
                currDigi.digivolution = digimon[i].data;
                break;
            default:
                if(currDigi){
                    allDigi.push(currDigi);
                }
                currDigi = {};
                currDigi.name = digimon[i].name;
                currDigi.num = digimon[i].data.num;
                currDigi.type = digimon[i].data.type;
                currDigi.attribute = digimon[i].data.attribute;
                currDigi.slots = digimon[i].data.slots;
                currDigi.memory = digimon[i].data.memory;
                currDigi.skills = digimon[i].data.skills;
        }
    }
    allDigi.push(currDigi);

    console.log(allDigi.length);
    fs.writeFile('concat', JSON.stringify(allDigi, null, '\t'), function(err){
        if(err){
            return console.log(err);
        }
        console.log("The file was saved!");
    })
});