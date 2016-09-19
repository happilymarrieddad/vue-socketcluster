module.exports.isEmpty = function (obj) {
  var i;
  for (i in obj) {
    if (obj.hasOwnProperty(i)) {
      return false;
    }
  }
  return true;
};