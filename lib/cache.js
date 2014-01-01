var cache_manager = require('cache-manager');

module.exports.memoryCache = cache_manager.caching({store: 'memory', max: 1000, ttl: 0/*seconds*/});