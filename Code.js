function onOpen() {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var entries = [{
    name : "Read Data",
    functionName : "readRows"
  }];

  var ui = SpreadsheetApp.getUi();
  ui.createMenu('Scripts')
    .addItem('Import My Games', 'importOwnedGames')
    .addItem('Import Friends', 'importFriendsList')
    .addItem('Compare Players', 'comparePlayers')
    .addItem('Import Games from Giant Bomb API', 'updateAllGamesFromCompareList')
    .addToUi();

};

function importOwnedGames() {
  var active_sheet = SpreadsheetApp.getActiveSpreadsheet();
  var json = steamApiCall('getOwnedGames', 'default', ''),
      data = JSON.parse(json).response;

  // Put data into OwnedGames sheet
  active_sheet.setActiveSheet(active_sheet.getSheetByName('OwnedGames'));
  var sheet = SpreadsheetApp.getActiveSheet();
  for (var i = 0; i < data.games.length; i++){
    var app_id = data.games[i].appid,
        name = data.games[i].name,
        playtime = data.games[i].playtime_forever,
        games = [[app_id, name, playtime]],
        row = i + 2;
    var range = sheet.getRange(row,1,1,3);
    range.setValues(games);
  }

  // Copy playtime to Played sheet
  smartCopyPlayed();

};

function importFriendsList(){
  var active_sheet = SpreadsheetApp.getActiveSpreadsheet(),
      json = steamApiCall('getFriends', 'default', ''),
      data = JSON.parse(json).friendslist;

  active_sheet.setActiveSheet(active_sheet.getSheetByName('Friends'));
  var sheet = SpreadsheetApp.getActiveSheet(),
      user_ids = [];
  for (var i = 0; i < data.friends.length; i++){
    user_ids.push(data.friends[i].steamid);
    //var user_info = steamApiCall('getUser');
  }

  var user_json = steamApiCall('getUsers', '', user_ids.join(',')),
      user_data = JSON.parse(user_json).response;

  // Put data into Friends sheet
  active_sheet.setActiveSheet(active_sheet.getSheetByName('Friends'));
  var sheet = SpreadsheetApp.getActiveSheet(),
      last_row = 2;
  for (var i = 0; i < user_data.players.length; i++){
    var steam_id = user_data.players[i].steamid,
        persona_name = user_data.players[i].personaname,
        real_name = user_data.players[i].realname == null ? '' : user_data.players[i].realname,
        game_1, game_2, game_3, game_4, game_5, game_6, game_7, game_8, game_9, game_10;

    var user_games_json = steamApiCall('getOwnedGames', '', steam_id),
        user_games = JSON.parse(user_games_json).response.games;

    user_games.sort(function(a, b) {
      return parseFloat(b.playtime_forever) - parseFloat(a.playtime_forever);
    });

    var player_game = [steam_id,persona_name,real_name],
        length = user_games.length > 50 ? 50 : user_games.length;
    for (var y = 0; y < length; y++){
      player_game.push(user_games[y].appid);
      player_game.push(user_games[y].name);
      player_game.push(user_games[y].playtime_forever);
      //var row = y + 2;
      last_row = last_row + 1;
      var range = sheet.getRange(last_row,1,1,6);
      range.setValues([player_game]);
      player_game = [steam_id,persona_name,real_name];
    }
  }


};






function test() {
  var arr = [{id:1},{id:2}];
  var x = arr;
  var y = arr.slice();
  logValue('x',x);
  logValue('y',y);
  arr.push({id:3});

  logValue('x',x);
  logValue('y',y);
};














