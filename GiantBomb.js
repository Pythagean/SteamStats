// Pulls game data from Giantbomb API
function updateAllGamesFromCompareList(){
  var active_sheet = compareSheet(),
      last_row = active_sheet.getLastRow(),
      compare_sheet = active_sheet.getSheetByName("Compare"),
      existing_games = compare_sheet.getRange(7, 1, last_row - 7, 3).getValues(),
      games_inserted_count = 0,
      games_to_get = 40;

  existing_games.forEach(function(game){
    if (games_inserted_count < games_to_get){
      if(getGameDataFromGB(game)){
        games_inserted_count++;
      }
    }
  });

};

function getGameDataFromGB(game){
  var game_name = game[2],
      game_steam_id = game[1],
      in_allgames = game[0],
      query = '"Apps Script" stars:">=100"';

  //Logger.log(in_allgames);
  if (!in_allgames){

    if (game_steam_id == '') { return false; }
    //var alreadyExists = hashArrayContainsValue('steam_id', game_steam_id, all_games_array, 'idx');

    Logger.log('game ' + game_name + ' does not exist');
    var s_url = 'http://www.giantbomb.com/api/search/';
    s_url = s_url += encodeURIComponent('?api_key=695fc51cfe9223919cc00f148f4301a0f2caf9bf'
      + '&format=json'
      + '&query="' + game_name + '"'
      + '&resources=game'
      + '&field_list=name,id');

    Logger.log(s_url);

    var params = {
      'muteHttpExceptions': true,
      'escaping': false
    }

    var s_response = UrlFetchApp.fetch(s_url, params),
        s_json = s_response.getContentText(),
        s_data = JSON.parse(s_json).results;

    // Found game in Giant Bomb API
    if (s_data.length > 0){
      var gb_game_id = s_data[0].id;
      var url = 'http://www.giantbomb.com/api/game/'
        + gb_game_id + '/';
      url = url += encodeURIComponent('?api_key=695fc51cfe9223919cc00f148f4301a0f2caf9bf'
        + '&format=JSON'
        + '&limit=100'
        + '&plaforms=94'
        + '&field_list=id,name,original_release_date,concepts,developers,genres,similar_games,themes'
        + '&format=json');

      var response = UrlFetchApp.fetch(url, params),
          json = response.getContentText(),
          data = JSON.parse(json).results,
          gb_id = data.id,
          gb_name = data.name == game_name ? data.name : game_name,
          gb_release_date = data.original_release_date,
          gb_concepts = data.concepts == null ? [] : getIDsNamesFromGBArray(data.concepts),
          gb_developers = data.developers == null ? [] : getIDsNamesFromGBArray(data.developers),
          gb_genres = data.genres == null ? [] : getIDsNamesFromGBArray(data.genres),
          gb_similar_games = data.similar_games == null ? [] : getIDsNamesFromGBArray(data.similar_games),
          gb_themes = data.themes == null ? [] : getIDsNamesFromGBArray(data.themes);

      result = {steam_id: game_steam_id, gb_id: gb_id, name: gb_name, release_date: gb_release_date, concepts: gb_concepts,
        developers: gb_developers, genres: gb_genres, similar_games: gb_similar_games, themes: gb_themes};

      return writeToAllGames(result, true); // writeToAllGames returns true/false depending on if an entry was inserted into AllGames

    } else {
      // No search results from Giant Bomb API
      Logger.log('skipping ' + game_name + ' - cannot find in Giantbomb wiki');
      return writeToAllGames({steam_id: game_steam_id, gb_id: 0, name: game_name}, false)
      return false;
    }

  } else {
    Logger.log('game ' + game_name + ' already exists');
    return false;
  }

};

function getDataFromAllGames(){
  var active_sheet = allGamesSheet(),
      last_row = active_sheet.getLastRow(),
      all_games_sheet = active_sheet.getSheetByName("AllGames"),
      existing_games = last_row == 1 ? [] : all_games_sheet.getRange(2, 1, last_row - 1, 9).getValues(),
      all_games = [];
  //Logger.log('existing_games: ' + existing_games);
  existing_games.forEach(function(game){
    var game_obj = {};
    game_obj.steam_id = game[0];
    game_obj.gb_id = game[1];
    game_obj.name = game[2];
    game_obj.release_date = game[3];
    game_obj.concepts = dashDelimitedToArray(game[4]);
    game_obj.developers = dashDelimitedToArray(game[5]);
    game_obj.genres = dashDelimitedToArray(game[6]);
    game_obj.similar_games = dashDelimitedToArray(game[7]);
    game_obj.themes = dashDelimitedToArray(game[8]);
    //Logger.log(game_obj);
    //logArrayObj('game_obj.genres: ', game_obj.genres);
    all_games.push(game_obj);
  });
  return all_games;
};



function getNamesFromGBArray(array){
  result = [];
  array.forEach(function(val){
    result.push(val.name);
  });
  return result;
};

function getIDsNamesFromGBArray(array){
  result = [];
  array.forEach(function(val){
    result.push({id: val.id, name: val.name});
  });
  return result;
};

// Writes a game record into All Games if it doesn't exist
function writeToAllGames(game, gb_api) {
  var active_sheet = allGamesSheet(),
      all_games_array = getDataFromAllGames();

  //Logger.log(game);
  var sheet = SpreadsheetApp.getActiveSheet(),
      row = sheet.getLastRow() + 1;
  if (gb_api){

    var values_to_save = [game.steam_id, game.gb_id, game.name, game.release_date,
          arrayToDashDelimited(game.concepts).join('|'),
          arrayToDashDelimited(game.developers).join('|'),
          arrayToDashDelimited(game.genres).join('|'),
          arrayToDashDelimited(game.similar_games).join('|'),
          arrayToDashDelimited(game.themes).join('|'), gb_api],
        range = sheet.getRange(row,1,1,values_to_save.length);


  } else {
    if (game.steam_id == '') { return true; }
    var values_to_save = [game.steam_id, game.gb_id, game.name, '',
          '',
          '',
          '',
          '',
          '', gb_api],
        range = sheet.getRange(row,1,1,values_to_save.length);
  }
  Logger.log('writing ' + game.name + ' to AllGames');

  range.setValues([values_to_save]);
  return true; // returns true if it put an entry into AllGames

};




