var db = require('../lib/db_mylands'),
    cache = require('../lib/cache'),
    validator = require('./validator'),
    HashMap = require('hashmap').HashMap;

function defaultNumberGetter(value) {
    return value === null ? 0 : value;
}
	
var LandSchema = new db.Schema({
		x: { type: Number, required: true },
		y: { type: Number, required: true },
		z: { type: Number, required: true },
		fields: { type: Number, default: 0, get: defaultNumberGetter },
		city_level: { type: Number, default: 0, get: defaultNumberGetter },
		type: {type: String, validate: validator.typeValidator, required: true},
		obstacles: { type: Number, default: 0, get: defaultNumberGetter },
		grain: {
            inner: { type: Number, default: 0, get: defaultNumberGetter },
            outer: { type: Number, default: 0, get: defaultNumberGetter }
        },
		iron: {
            inner: { type: Number, default: 0, get: defaultNumberGetter },
            outer: { type: Number, default: 0, get: defaultNumberGetter }
        },
		stone: {
            inner: { type: Number, default: 0, get: defaultNumberGetter },
            outer: { type: Number, default: 0, get: defaultNumberGetter }
        },
		picture: {type: String, required: true}
	});
LandSchema.index({x: 1, y: 1, z: 1}, { unique: true });
	
var MyLand = db.mongoose.model('Land', LandSchema);

module.exports.addLand = add;
module.exports.findLands = findAll;
module.exports.findKingdomCounts = findKingdomCountsFromCache;
module.exports.findKingdom = findKingdom;

function add(landVO, callback) {
	var instance = new MyLand();
	
	instance.x = landVO.x;
	instance.y = landVO.y;
	instance.z = landVO.z;
	instance.fields = landVO.fields;
	instance.city_level = landVO.cityLevel;
	instance.type = landVO.type;
	instance.obstacles = landVO.obstacles;
	instance.grain.inner = landVO.grain.inner;
	instance.grain.outer = landVO.grain.outer;
	instance.iron.inner = landVO.iron.inner;
	instance.iron.outer = landVO.iron.outer;
	instance.stone.inner = landVO.stone.inner;
	instance.stone.outer = landVO.stone.outer;
	instance.picture = landVO.picture;
	
	instance.save(function (err) {
		if (err) {
            callback(err);
		}
		else {
            cache.memoryCache.del("lands");
            cache.memoryCache.del("lands-" + instance.city_level);
            
            callback(null, instance);
		}
	});	
};

function findAll(callback) {
    var query = MyLand.find().sort({x: 1, y: 1, z: 1}).skip(0).limit(50);
    
    query.exec(function (err, myLand) {
		if (err) {
		  callback(err);
		}
		else {
          console.log(myLand.length);
		  callback(null, myLand);
		}
	});
};

function findKingdomCountsFromCache(level, callback) {
    var key = level ? "lands-" + level : "lands";
    cache.memoryCache.wrap(key, function(cacheCallback) {
            findKingdomCounts(level, cacheCallback);
    }, callback);
}

function findKingdomCounts(level, callback) {
   var levelCondition = level != null ? {city_level: level} : {};
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

    MyLand.collection.group(group.key, group.cond, group.initial, group.reduce, group.finalize, true, function(err, results) {
        console.log('Kingdom counts in DB: %j', results.length);
        
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
    MyLand.find({x: x, y: y}, function(err, results) {
        console.log("%s-%s kingdom's land count: %j", x, y, results.length);
        
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