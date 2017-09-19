function importMyGames() {
  var active_sheet = SpreadsheetApp.getActiveSpreadsheet(),
      json = steamApiCall('getOwnedGames', 'default', ''),
      data = JSON.parse(json).response,
      existing_data_from_sheet = readDataFromMyPlaytime(),
      existing_data_array = [];

  existing_data_from_sheet.forEach(function(rec){
    //hashArrayContainsValue(field, value, array_of_games, return_val) {
    var existing_idx = hashArrayContainsValue('name', rec[1], existing_data_array, 'idx');
    if (existing_idx >= 0){
      existing_data_array[existing_idx].entries.push({date: rec[0], minutes: rec[2]})
    } else {
      existing_data_array.push({name: rec[1], entries: [{date: rec[0], minutes: rec[2]}]});
    }
  });

  var myPlaytimeRecords = [];

  data.games.forEach(function(game){
    if (game.playtime_forever > 0) {
      var existing_records = hashArrayContainsValue('name', game.name, existing_data_array, 'array'),
          latest_date = new Date(2000,1,1), total_minutes = 0;
      if (existing_records.length > 0){
        existing_records[0].entries.forEach(function(existing_rec){

          if (latest_date < existing_rec.date) {
            latest_date = existing_rec.date;
            total_minutes += existing_rec.minutes;
          }
        });
        myPlaytimeRecords.push([new Date(), game.name, (game.playtime_forever - total_minutes)]);
      } else {
        // Inserting a new record because game doesn't exist
        myPlaytimeRecords.push([new Date(), game.name, game.playtime_forever]);
      }
    }
  });

  if (myPlaytimeRecords.length > 0){
    active_sheet.setActiveSheet(active_sheet.getSheetByName('MyPlaytime'));
    var sheet = SpreadsheetApp.getActiveSheet(),
        range = sheet.getRange(sheet.getLastRow()+1,1,myPlaytimeRecords.length,myPlaytimeRecords[0].length);
    range.setValues(myPlaytimeRecords);
  }



};

function readDataFromMyPlaytime() {
  var active_sheet = myPlaytimeSheet(),
      sheet = SpreadsheetApp.getActiveSheet();
  if (active_sheet.getLastRow() == 1) { return []; }
  var range = sheet.getRange(2,1,active_sheet.getLastRow()-1, 3),
      values = range.getValues();
  return values;
}










