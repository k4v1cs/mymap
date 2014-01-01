var db = require('../lib/db_mylands')
   ,HashMap = require('hashmap').HashMap;

var RuinSchema = new db.Schema({
		x: { type: Number, required: true },
		y: { type: Number, required: true },
		z: { type: Number, required: true },
        level: { type: Number, required: true },
        agressive: { type: Boolean, required: true },
        date: { type : Date, default: Date.now }
    });
RuinSchema.index({x: 1, y: 1, z: 1}, { unique: true });

var MyRuin = db.mongoose.model('Ruin', RuinSchema);

module.exports.addRuin = add;
module.exports.removeRuin = remove;
module.exports.findKingdomCounts = findKingdomCounts;
module.exports.findKingdom = findKingdom;

function add(ruin, callback) {
	var instance = new MyRuin();
	
	instance.x = ruin.x;
	instance.y = ruin.y;
	instance.z = ruin.z;
	instance.level = ruin.level;
    instance.agressive = ruin.agressive;
	
	instance.save(function (err) {
		if (err) {
            callback(err);
		}
		else {
            callback(null, instance);
		}
	});	
};

function remove(x, y, z, callback) {
    MyRuin.findOne({x: x, y: y, z: z}, function(err, ruin) {
        if(err) {
            callback(err);
        } else {
            ruin.remove();
            callback(null);
        }
    });
}

function findKingdomCounts(level, callback) {
   var levelCondition = level != null ? {level: level} : {};
   var group = {
       key: {x: 1, y:1},
       cond: levelCondition,
       reduce: function ( curr, result ) {
                result.count++;
       },
       initial: {
           count: 0
       },
       finalize: function(out) {
       }
    };

    MyRuin.collection.group(group.key, group.cond, group.initial, group.reduce, group.finalize, true, function(err, results) {
        console.log('kingdom counts for ruins %j', results.length);
        
        if(err) {
            callback(err);
        } else {
            var map = new HashMap();
            for(i=0; i<results.length; i++) {
                var result = results[i];
                map.set(result.x + '-' + result.y, result);
            }
            callback(null, map);
        }
    });
}

function findKingdom(x, y, callback) {
    MyRuin.find({x: x, y: y}, function(err, results) {
        console.log("%s-%s kingdom's ruin count: %j", x, y, results.length);
        
        if(err) {
            callback(err);
        } else {
            
            var map = new HashMap();
            for(i=0; i<results.length; i++) {
                var result = results[i];
                map.set(result.z, result);
            }
            callback(null, map);
        }
    });
}

function buildKingdomMap(results) {
    var map = new HashMap();
    for(i=0; i<results.length; i++) {
        var result = results[i];
        map.set(result.x + '-' + result.y, result);
    }
    
    return map;
}