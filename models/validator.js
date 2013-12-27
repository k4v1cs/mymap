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

var customTypeValidator = [typeValidator, 'Uh oh, {PATH} a föld típusa nem megfelelo.']

module.exports.typeValidator = customTypeValidator;

//x 1-73
//y 1-22
//z 1-63
//field 0-43
//level 0-5
//obstacles 0-(field)
//res 0-(<=field-obstacles)