function typeValidator (value) {
  return value === 'MOUNTAINS' ||
		value === 'HOLY LAND' ||
		value === 'FOREST' ||
		value === 'DESERT' ||
		value === 'PRAIRIE' ||
		value === 'CURSED FOREST' ||
        value === 'MAGICAL FOREST' ||
		value === 'DEAD LAND';
}

var customTypeValidator = [typeValidator, 'Uh oh, a f�ld t�pusa nem megfelelo.']

module.exports.typeValidator = customTypeValidator;