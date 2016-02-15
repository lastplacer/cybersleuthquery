var fs = require('fs');
var htj = require("html-to-json");

function handleData($section) {
    var data = $section.find('dd');

    var num = data[0].children[0].children[0].data.replace(/\D/g, "");
    var type = data[1].children[1].data.replace(/[^a-zA-Z]/g, "");
    var attribute = data[1].children[3].data.replace(/[^a-zA-Z]/g, "");
    var slots = data[2].children[1].data.replace(/\D/g, "");
    var memory = data[2].children[3].data.replace(/\D/g, "");

    var skills = $section.find('tr');
    var skillset = [];

    for (var i = 1; i < skills.length - 1; i++) {
        skillset.push({
            "name": skills[i].children[1].children[0].children[0].data,
            "desc": skills[i].children[3].children[0].data,
            "cost": Number(skills[i].children[4].children[0].data),
            "lv": Number(skills[i].children[5].children[0].data.replace(/\D/g, ""))
        });
    }

    skillset.push({
        "name": skills[skills.length - 1].children[1].children[0].children[0].data,
        "desc": skills[skills.length - 1].children[3].children[0].data,
        "cost": "n/a",
        "lv": "n/a"
    })

    var out = {
        "num": Number(num),
        "type": type,
        "attribute": attribute,
        "slots": Number(slots),
        "memory": Number(memory),
        "skills": skillset
    };


    return out;
}

function handleStats($section) {
    var data = $section.find('td');

    return {
        "hp": Number(data[0].children[0].data.replace(/\D/g, "")),
        "sp": Number(data[1].children[0].data.replace(/\D/g, "")),
        "atk": Number(data[2].children[0].data.replace(/\D/g, "")),
        "int": Number(data[3].children[0].data.replace(/\D/g, "")),
        "def": Number(data[4].children[0].data.replace(/\D/g, "")),
        "spd": Number(data[5].children[0].data.replace(/\D/g, ""))
    }
}

function handleDevolve($section) {
    var data = $section.find('td');

    var mons = [];
    for (var i = 0; i < data.length; i++) {
        mons.push(data[i].children[0].children[0].data.replace(/[ \t]+$/, ""))
    }

    return mons;
}

function handleEvolve($section) {
    var header = $section.find('th');
    var data = $section.find('tr');

    var reqs = [];


    for (var i = 1; i < header.length; i++) {
        reqs.push(header[i].children[0].data.toLowerCase());
    }

    var out = [];

    for (var i = 1; i < data.length; i++) {
        var name = data[i].children[1].children[0].children[0].data.replace(/[ \t]+$/, "");
        var stats = {
            "level": 0,
            "hp": 0,
            "sp": 0,
            "atk": 0,
            "int": 0,
            "def": 0,
            "spd": 0
        };
        for (var j = 2; j < data[i].children.length; j++) {
            if (data[i].children[j].children[0]) {

                var stat = data[i].children[j].children[0].data;
                if (typeof stat == "string") {
                    stat = stat.replace(",", "");
                }
                if (!isNaN(Number(stat))) {
                    stat = Number(stat);
                }
                stats[reqs[j - 2]] = stat;
            }
        }

        out.push({
            "name": name,
            "reqs": stats
        });
    }

    return out;
}


fs.readFile('digimin.html', function (err, data) {
    if (err) return console.error(err);

    var out = htj.batch(data, {
        section: htj.createParser(['div', {
            'name': function ($section) {
                return $section.find('h5>a,h4>a').text().replace(/[ \t]+$/, "");
            },
            'data': function ($section) {
                var name = $section.find('h5>a, h5>a').text().replace(/[ \t]+$/, "");

                switch (name) {
                    case "Level 1 Raw Stats":
                    case "Level 99 Raw Stats":
                        return handleStats($section);
                    case "De-digivolution":
                        return handleDevolve($section);
                    case "Digivolution Requirements":
                        return handleEvolve($section);
                    default:
                        return handleData($section);
                }
            }
        }])
    });

    out.done(function (results) {
        console.log("\n\nResults")
        console.log(results);

        var allDigi = [];

        var digimon = results.section;

        var currDigi;

        for (var i = 0; i < digimon.length; i++) {
            switch (digimon[i].name) {
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
                    if (currDigi) {
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
        fs.writeFile('concat', JSON.stringify(allDigi, null, '\t'), function (err) {
            if (err) {
                return console.log(err);
            }
            console.log("The file was saved!");
        })
    });
});
