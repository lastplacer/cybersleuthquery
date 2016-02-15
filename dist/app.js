/**
 * Created by Nikko on 2016-02-15.
 */

var digimon;

function hasSkill(skillset, skill){
    var found = false;
    skillset.forEach(function(s){
        if(s.name.toUpperCase() == skill.toUpperCase()){
            found = true;
        }
    });
    return found;
};

function digivolvesTo(current, digimon){
    var found = false;
    if(doesDigivolve(current)){
        current.digivolution.forEach(function(d){
            if(d.name.toUpperCase() == digimon.toUpperCase()){
                found = true;
            }
        });
    }

    return found;
}

function digivolvesFrom(current, digimon){
    var found = false;
    if(isDigivolved(current)){
        current.dedigivolution.forEach(function(d){
            if(d.toUpperCase() == digimon.toUpperCase()){
                found = true;
            }
        });
    }

    return found;
}

function doesDigivolve(curr){
    return curr.hasOwnProperty('digivolution');
}

function isDigivolved(curr){
    return curr.hasOwnProperty('dedigivolution');
}

$(document).ready(function(){
    var select = $('#nameSelect');


    $.getJSON('concat', function(data){
        digimon = data;

        var digi = jsonsql.query('select name,num from digimon order by name asc', digimon)
        $.each(digi, function(){
            select.append($("<option />").val(this.num).text(this.name));
        })
    })

    $('form').submit(function(e){
        e.preventDefault();
        //alert("submitting");

        var queryType = Number($("#querySelect").val());
        console.log(queryType);

        var qStr = 'select name from digimon where (';

        switch(queryType){
            case 0: //Stats
                qStr+=('lv99Stats.' + $('#statSelect').val() + $('#statComp').val() + $('#statVal').val()); break;
            case 1: //Type
                qStr+=('type=="' + $('#typeSelect').val() + '"'); break;
            case 2: //Attribute
                qStr+=('attribute=="' + $('#attrSelect').val() + '"'); break;
            case 3: //Digivolutions
                qStr+=('digivolvesFrom(current, "' + $('#nameSelect option:selected').text() + '")'); break;
            case 4: //Skills
                qStr+=('hasSkill(skills, "' + $('#skillVal').val() + '")'); break;
            default:
                qStr+=('true');
        }
        qStr+=(')');

        if(queryType == 5){
            qStr = $("#manualQuery").val();
        }

        console.log(qStr);

        var results = jsonsql.query(qStr, digimon);
        $('#output').text('');
        results.forEach(function(curr){
            $('#output').append(curr.name).append('<br>');
        })
    })
});