function logArray(name, array){
  Logger.log(name + ': ' + array.join(', '));
  Logger.log('');
};

function logArrayObj(name, p_array){
  var msg = [], array = p_array.slice();

  array.forEach(function(rec){
    if (rec.count == null){
      msg.push('(' + rec.id + '_' + rec.name + ')');
    } else {
      msg.push('(' + rec.id + '_' + rec.name+'_'+rec.count+'_'+rec.playtime + ')');
    }
  });
  Logger.log(name + ': ' + msg.join(', '));
  Logger.log('');
};

function logValue(name, value){
  Logger.log(name + ': ' + value);
  Logger.log('');
};

function logObj(name, obj){
  Logger.log(name + ': (' + obj.id + ' - ' + obj.name + ')');
  Logger.log('');
};