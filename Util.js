// Sorts an array of games so most played is at the top
function sortHashArrayByParam(array, byParam){
  array.sort(function(a, b) {
    return parseFloat(b[byParam]) - parseFloat(a[byParam]);
  });
  return array;
};

// Check if a given array contains a game (can look up by the specified field)
function hashArrayContainsValue(field, value, array_of_games, return_val) {
  //Logger.log('checking if ' + field + '-' + value + ' is in array');
  for (var i = 0; i < array_of_games.length; i++) {
    if (array_of_games[i][field] == value) {
      //Logger.log(array_of_games[i][field] + ' == ' + value);
      if (return_val == 'bool') { return true; } else { return i; }
    }
  }
  if (return_val == 'bool') { return false; } else { return -1; }
};

function arrayContainsValue(value, array){
  //Logger.log('checking for "' + value + '" inside "' + array + '"');
  var inArray = false;
  array.forEach(function(arr_val){
    if (arr_val == value) {
      //Logger.log(value + ' inside array');
      inArray = true;
    }
  });
  return inArray;
};

function playerGamesToFullGames(full_games, player_games) {
  for (var i = 0; i < player_games.length; i++){
    if (!hashArrayContainsValue('app_id', player_games[i].appid, full_games, 'bool')){
      full_games.push({app_id: player_games[i].appid,
        name: player_games[i].name,
        p1_owned: false, p1_favorite: false,
        p1_playtime: 0, p2_playtime: 0,
        p2_owned: false, p2_favorite: false});
    }
  }
  return full_games;
};

// Copies values only from working column to a column on the end of 'Played'
function smartCopyPlayed(){
  var activeSheet = SpreadsheetApp.getActiveSpreadsheet();
  activeSheet.setActiveSheet(activeSheet.getSheetByName('Played'));
  var playedSheet = activeSheet.getSheetByName("Played"),
      lastRow = playedSheet.getLastRow(),
      lastCol = playedSheet.getLastColumn(),
      //getRange(row, column, numRows, numColumns)
      copyRange = playedSheet.getRange(2, 4, lastRow, 1),
      destRange = playedSheet.getRange(2, playedSheet.getLastColumn() + 1, lastRow, 1);

  // Insert date at top of new column
  var todaysDate = playedSheet.getRange(1, 1),
      dateHeaderCell = playedSheet.getRange(1, lastCol + 1);
  todaysDate.copyTo(dateHeaderCell, {contentsOnly: true});

  // Copy working column over to current date
  copyRange.copyTo (destRange, {contentsOnly: true});

};

function arrayToDashDelimited(array){
  var result = [];
  array = array.slice(0,20);
  array.forEach(function(rec){
    if (rec.count == null){
      result.push(rec.id+'_'+rec.name);
    } else {
      if (rec.year == null){
        result.push(rec.id+'_'+rec.name+'_'+rec.count+'_'+rec.playtime);
      } else {
        result.push(rec.year+'_'+rec.count+'_'+rec.playtime);
      }

    }

  });
  return result;
};

function dashDelimitedToArray(string){
  var result = [],
      array = string.split('|');
  array.forEach(function(rec){
    var split_rec = rec.split('_');
    result.push({id: split_rec[0], name: split_rec[1]});
  });
  return result;
};

function getExcludedValues(type){
  var namedRangeText = 'Excluded' + type,
      active_sheet = settingsSheet(),
      namedRange = active_sheet.getRange(namedRangeText),
      namedRangeValue = namedRange.getValue(),
      actualRange = active_sheet.getRange(namedRangeValue),
      values = actualRange.getValues();
  return values;
};