/**
 * Created by Nikko on 2016-02-15.
 */
var fs = require('fs');
var prompt = require('prompt');

var digimon;

var jsonsql = {

    query: function(sql,json){

        var returnfields = sql.match(/^(select)\s+([a-z0-9_\,\.\s\*]+)\s+from\s+([a-z0-9_\.]+)(?: where\s+\((.+)\))?\s*(?:order\sby\s+([a-z0-9_\,]+))?\s*(asc|desc|ascnum|descnum)?\s*(?:limit\s+([0-9_\,]+))?/i);

        var ops = {
            fields: returnfields[2].replace(' ','').split(','),
            from: returnfields[3].replace(' ',''),
            where: (returnfields[4] == undefined)? "true":returnfields[4],
            orderby: (returnfields[5] == undefined)? []:returnfields[5].replace(' ','').split(','),
            order: (returnfields[6] == undefined)? "asc":returnfields[6],
            limit: (returnfields[7] == undefined)? []:returnfields[7].replace(' ','').split(',')
        };

        return this.parse(json, ops);
    },

    parse: function(json,ops){
        var o = { fields:["*"], from:"json", where:"", orderby:[], order: "asc", limit:[] };
        for(i in ops) o[i] = ops[i];

        var result = [];
        result = this.returnFilter(json,o);
        result = this.returnOrderBy(result,o.orderby,o.order);
        result = this.returnLimit(result,o.limit);

        return result;
    },

    returnFilter: function(json,jsonsql_o){
        var jsonsql_scope = eval(jsonsql_o.from);
        var jsonsql_result = [];
        var jsonsql_rc = 0;

        if(jsonsql_o.where == "")
            jsonsql_o.where = "true";

        for(var jsonsql_i in jsonsql_scope){
            var current = jsonsql_scope[jsonsql_i];
            with(jsonsql_scope[jsonsql_i]){
                if(eval(jsonsql_o.where)){
                    jsonsql_result[jsonsql_rc++] = this.returnFields(jsonsql_scope[jsonsql_i],jsonsql_o.fields);
                }
            }
        }
        return jsonsql_result;
    },

    returnFields: function(scope,fields){
        if(fields.length == 0)
            fields = ["*"];

        if(fields[0] == "*")
            return scope;

        var returnobj = {};
        for(var i in fields)
            returnobj[fields[i]] = scope[fields[i]];

        return returnobj;
    },

    returnOrderBy: function(result,orderby,order){
        if(orderby.length == 0)
            return result;

        result.sort(function(a,b){
            switch(order.toLowerCase()){
                case "desc": return (eval('a.'+ orderby[0] +' < b.'+ orderby[0]))? 1:-1;
                case "asc":  return (eval('a.'+ orderby[0] +' > b.'+ orderby[0]))? 1:-1;
                case "descnum": return (eval('a.'+ orderby[0] +' - b.'+ orderby[0]));
                case "ascnum":  return (eval('b.'+ orderby[0] +' - a.'+ orderby[0]));
            }
        });

        return result;
    },

    returnLimit: function(result,limit){
        switch(limit.length){
            case 0: return result;
            case 1: return result.splice(0,limit[0]);
            case 2: return result.splice(limit[0]-1,limit[1]);
        }
    }

};

function handleQuery(err, result){
    if(err) console.log(err);
    console.log('Query: ' + result.query)
    if(result.query == 'stop'){
        prompt.stop();
    }else{
        //console.log(jsq(result.query, {data: digimon}))
        //console.log(jsql(digimon, result.query));
        try{
            console.log(jsonsql.query(result.query, digimon));
        }catch(err){
            console.log("~~~");
            console.error(err);
        }

        prompt.get(['query'], handleQuery);
    }
}

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

fs.readFile('concat', function(err, data){
    if(err) console.error(err);

    digimon = JSON.parse(data);

    prompt.start();
    prompt.get(['query'], handleQuery);
})


/**
 Sample Queries

 Find name of digimon from number
    select name from digimon where (num==100)

 Find 'Vaccine' type digimon
    select name from digimon where (type=='Vaccine')

 Find digimon that learn given skill
    select name from digimon where (hasSkill(skills, "Nightmare III"))

 Find digimon with stat criteria
    select name from digimon where (lv99Stats.hp > 2500)

 Find digimon that digivolve to given digimon
    select name from digimon where (digivolvesTo(current, "Omnimon"))

 Find digimon that digivolve from given digimon
    select name from digimon where (digivolvesFrom(current, "Agumon"))

 Chaining queries
    select name from digimon where (type=='Vaccine' && attribute=='Fire' && lv99Stats.hp > 2000)
 */