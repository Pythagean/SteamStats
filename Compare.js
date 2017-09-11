function comparePlayers(player_1, player_2){
  var active_sheet = SpreadsheetApp.getActiveSpreadsheet(),
      games_both_owned = [],
      p1_played_games = 0, p2_played_games = 0,
      games_both_played = [], games_array = [], full_games_array = [],
      favorite_param, favorite_num,
      p1_hours = 0, p2_hours = 0;

  if (player_1 == null && player_2 == null){
    var compareSheet = active_sheet.getSheetByName("Settings");
    player_1 = compareSheet.getRange(5, 2).getValue(); // Get steam id for player_1
    player_2 = compareSheet.getRange(5, 3).getValue(); // Get steam id for player_2
    favorite_param = compareSheet.getRange(6, 2).getValue();
    favorite_num = compareSheet.getRange(7, 2).getValue();
  }

  var p1_json = steamApiCall('getOwnedGames', '', player_1),
      p1_data = JSON.parse(p1_json).response,
      p2_json = steamApiCall('getOwnedGames', '', player_2),
      p2_data = JSON.parse(p2_json).response,
      p1_own_games = p1_data.game_count,
      p1_games = p1_data.games,
      p2_own_games = p2_data.game_count,
      p2_games = p2_data.games,
      p1_fav_count = 0, p2_fav_count = 0;

  p1_games = sortHashArrayByParam(p1_games, 'playtime_forever');
  p2_games = sortHashArrayByParam(p2_games, 'playtime_forever');

  // Build up full_games_array containing all games owned by either player
  full_games_array = playerGamesToFullGames(playerGamesToFullGames(full_games_array, p1_games), p2_games);
  var all_games = getDataFromAllGames(); // Get whole list

  // ******
  // Player Loops
  // ******
  var player_1 = playerLoop('p1', p1_games, full_games_array, all_games, favorite_num, p1_hours);
  //Logger.log(player_1.release_years);
  p1_games = player_1.games_arr;
  p1_fav_count = player_1.fav_count;
  p1_hours = player_1.hours;
  var p1_genres = sortHashArrayByParam(player_1.genres_arr, 'playtime'),
      p1_developers = sortHashArrayByParam(player_1.developers_arr, 'playtime'),
      p1_themes = sortHashArrayByParam(player_1.themes_arr, 'playtime'),
      p1_release_years = sortHashArrayByParam(player_1.release_years, 'year'),
      p1_concepts = sortHashArrayByParam(excludeFromArray(player_1.concepts_arr, 'Concepts'), 'playtime');

  var player_2 = playerLoop('p2', p2_games, full_games_array, all_games, favorite_num, p2_hours);
  p2_games = player_2.games_arr;
  p2_fav_count = player_2.fav_count;
  p2_hours = player_2.hours;
  var p2_genres = sortHashArrayByParam(player_2.genres_arr, 'playtime'),
      p2_developers = sortHashArrayByParam(player_2.developers_arr, 'playtime'),
      p2_themes = sortHashArrayByParam(player_2.themes_arr, 'playtime'),
      p2_release_years = sortHashArrayByParam(player_2.release_years, 'year'),
      p2_concepts = sortHashArrayByParam(excludeFromArray(player_2.concepts_arr, 'Concepts'), 'playtime');


  var all_genres = mergePlayerArrays('Genres', p1_genres, p2_genres),
      all_developers = mergePlayerArrays('Developers', p1_developers, p2_developers),
      all_themes = mergePlayerArrays('Themes', p1_themes, p2_themes),
      all_release_years = mergePlayerArrays('Years', p1_release_years, p2_release_years),
      all_concepts = mergePlayerArrays('Concepts', p1_concepts, p2_concepts);

  //all_genres = sortHashArrayByParam(all_genres, 'total_playtime');
  //Logger.log(all_genres);
  /*var test = [];
   Logger.log(test);
   Logger.log('aaaaaaaaaaaaaaaa');
   for (var attrname in p2_genres) { test[attrname] = p2_genres[attrname]; }
   Logger.log(test);*/

  //Logger.log(p1_release_years);
  var p1_favs = [],
      p2_favs = [];

  full_games_array.forEach(function(game){
    if (game.p1_favorite) { p1_favs.push(game.name); }
    if (game.p2_favorite) { p2_favs.push(game.name); }
    var p1_fav = game.p1_favorite ? '* ' : '',
        p2_fav = game.p2_favorite ? '* ' : '';
  });

  active_sheet.setActiveSheet(active_sheet.getSheetByName('Compare'));
  var sheet = SpreadsheetApp.getActiveSheet(),
      both_owned_counter = 0, both_played_counter = 0, both_played_hour_counter = 0,
      both_owned_array = [], both_played_array = [], both_played_hour_array = [];

  // ******
  // Final loop over games array
  // ******
  for (var i = 0; i < full_games_array.length; i++){
    var game = full_games_array[i],
        both_owned = game.p1_owned && game.p2_owned ? true : false,
        both_played = game.p1_played && game.p2_played ? true : false,
        both_played_hour = game.p1_played_hour && game.p2_played_hour ? true : false;

    if (both_owned) { both_owned_counter++; both_owned_array.push(game.name); }
    if (both_played) { both_played_counter++; both_played_array.push(game.name); }
    if (both_played_hour) {
      both_played_hour_counter++;
      both_played_hour_array.push(game.name);
    }

    var app_id = game.app_id,
        name = game.name,
        p1_percent_of_play = (game.p1_playtime / p1_hours) * 100,        p2_percent_of_play = (game.p2_playtime / p2_hours) * 100,
        p1_playtime = game.p1_playtime,        p2_playtime = game.p2_playtime,
        p1_played = game.p1_played ? 'true':'false',        p2_played = game.p2_played ? 'true':'false',
        p1_played_hour = game.p1_played_hour ? 'true':'false',        p2_played_hour = game.p2_played_hour ? 'true':'false',
        p1_favorite = game.p1_favorite ? 'true':'false',        p2_favorite = game.p2_favorite ? 'true':'false';

    if (game.p1_played) { p1_played_games++; }
    if (game.p2_played) { p2_played_games++; }

    var games = [[app_id, name,
          game.p1_owned, game.p2_owned, both_owned,
          p1_played, p2_played, both_played,
          p1_favorite, p2_favorite,
          game.p1_playtime, game.p2_playtime,
          p1_percent_of_play, p2_percent_of_play]],
        row = i + 7;
    var range = sheet.getRange(row,1,1,14);
    range.setValues(games);



  }

  //******
  //compareSummarySheet
  //******
  active_sheet.setActiveSheet(active_sheet.getSheetByName('CompareSummary'));
  var sheet = SpreadsheetApp.getActiveSheet();
  //getRange (row, col, num_rows, num_cols)
  var summary = [[p1_own_games], [p2_own_games],
        [p1_played_games], [p2_played_games],
        [both_owned_counter], [both_played_counter],
        [both_played_hour_array.join(', ')],
        [arrayToDashDelimited(p1_genres).join(', ')],
        [arrayToDashDelimited(p2_genres).join(', ')],
        [arrayToDashDelimited(p1_developers).join(', ')],
        [arrayToDashDelimited(p2_developers).join(', ')],
        [arrayToDashDelimited(p1_themes).join(', ')],
        [arrayToDashDelimited(p2_themes).join(', ')],
        [arrayToDashDelimited(p1_concepts).join(', ')],
        [arrayToDashDelimited(p2_concepts).join(', ')],
        [arrayToDashDelimited(p1_release_years).join(', ')],
        [arrayToDashDelimited(p2_release_years).join(', ')]],
      range = sheet.getRange(1,2,summary.length,1);
  range.setValues(summary);





  /*p1_genres.forEach(function(p1_genre){

   });*/

};




function playerLoop(player, games_arr, full_games_arr, all_games_arr, fav_num, hours){
  var fav_count = 0, hours = 0, genres_arr = [], developers_arr = [], themes_arr = [], concepts_arr = [], release_years = [];

  // Loop through and figure out if player owns/has played etc.
  for (var i = 0; i < games_arr.length; i++){
    var game_id = games_arr[i].appid,
        game_idx = hashArrayContainsValue('app_id', game_id, full_games_arr, 'idx'),
        all_games_idx = hashArrayContainsValue('steam_id', game_id, all_games_arr, 'idx');

    if (fav_count < fav_num) {
      full_games_arr[game_idx][player+'_favorite'] = true;
      fav_count++;
    }

    full_games_arr[game_idx][player+'_owned'] = true;
    full_games_arr[game_idx][player+'_playtime'] = games_arr[i].playtime_forever;
    hours = hours + games_arr[i].playtime_forever;
    full_games_arr[game_idx][player+'_played'] = games_arr[i].playtime_forever > 0 ? true : false;
    full_games_arr[game_idx][player+'_played_hour'] = games_arr[i].playtime_forever > 60 ? true : false;

    // If player has played it, and it's in AllGames
    if (full_games_arr[game_idx][player+'_played'] && all_games_idx >= 0) {

      genres_arr = allGamesArrayParser(player, full_games_arr, all_games_arr, all_games_idx, game_idx, 'genres', genres_arr);
      developers_arr = allGamesArrayParser(player, full_games_arr, all_games_arr, all_games_idx, game_idx, 'developers', developers_arr);
      themes_arr = allGamesArrayParser(player, full_games_arr, all_games_arr, all_games_idx, game_idx, 'themes', themes_arr);
      concepts_arr = allGamesArrayParser(player, full_games_arr, all_games_arr, all_games_idx, game_idx, 'concepts', concepts_arr);

      // Release Years
      var record = all_games_arr[all_games_idx];
      if (record.release_date != null && record.release_date != ''){
        var release_year = record.release_date.getFullYear(),
            record_idx = hashArrayContainsValue('year', release_year, release_years, 'idx');
        if (record_idx < 0){
          //Logger.log('adding new record for ' + release_year);
          var new_record = {year: release_year, count: 1};
          new_record.playtime =  full_games_arr[game_idx][player+'_playtime'];
          release_years.push(new_record);
        } else {
          release_years[record_idx].count++;
          release_years[record_idx].playtime += full_games_arr[game_idx][player+'_playtime'];
        }
      }
    }
  }

  var result = {games_arr: games_arr, fav_count: fav_count, hours: hours,
    genres_arr: genres_arr,
    developers_arr: developers_arr,
    themes_arr: themes_arr,
    concepts_arr: concepts_arr,
    release_years: release_years}
  return result;
};



function allGamesArrayParser(player, full_games_arr, all_games_arr, all_games_idx, game_idx, array_name, records_arr){
  //var records_arr = []
  all_games_arr[all_games_idx][array_name].forEach(function(record){
    /*hashArrayContainsValue(field, value, array_of_games, return_val)*/
    var record_idx = hashArrayContainsValue('id', record.id, records_arr, 'idx');
    if (record_idx < 0){
      var new_record = {id: record.id, name: record.name};
      new_record.count = 1;
      //new_record[player+'_count'] = 1;
      new_record.playtime =  full_games_arr[game_idx][player+'_playtime'];
      //new_record[player+'_playtime'] =  full_games_arr[game_idx][player+'_playtime'];
      records_arr.push(new_record);
    } else {
      // record already exists, add 1 to counter and add playtime
      records_arr[record_idx].count++;
      //records_arr[record_idx][player+'_count']++;
      records_arr[record_idx].playtime += full_games_arr[game_idx][player+'_playtime'];
      //records_arr[record_idx][player+'_playtime'] += full_games_arr[game_idx][player+'_playtime'];
    }
  });
  //Logger.log(records_arr);
  return records_arr;
};

function excludeFromArray(array, type){
  var valuesToExclude = getExcludedValues(type);
  valuesToExclude.forEach(function(val){
    var idx = hashArrayContainsValue('id', val, array, 'idx');
    if (idx >= 0){
      array.splice(idx,1); // Remove excluded record from array
    }
  });
  return array;
};


function mergePlayerArrays(name, p1_array, p2_array){
  var result = [];
  p1_array.forEach(function(p1_rec){
    var new_rec = {id: p1_rec.id, name: p1_rec.name, p1_count: p1_rec.count, p1_playtime: p1_rec.playtime, total_playtime:  p1_rec.playtime};
    result.push(new_rec);
  });
  p2_array.forEach(function(p2_rec){
    var p2_idx = hashArrayContainsValue('id', p2_rec.id, result, 'idx');
    if (p2_idx >= 0){
      result[p2_idx].p2_count = p2_rec.count;
      result[p2_idx].p2_playtime = p2_rec.playtime;
      result[p2_idx].total_playtime += p2_rec.playtime;
      result[p2_idx].p2_playtime_percent = p2_rec.playtime / result[p2_idx].total_playtime;
    } else {
      var new_rec = {id: p2_rec.id, name: p2_rec.name, p2_count: p2_rec.count, p2_rec: p2_rec.playtime, total_playtime:  p2_rec.playtime};
      result.push(new_rec);
    }
  });
  p1_array.forEach(function(p1_rec){
    var p1_idx = hashArrayContainsValue('id', p1_rec.id, result, 'idx');
    if (p1_idx >= 0){
      result[p1_idx].p1_playtime_percent = p1_rec.playtime / result[p1_idx].total_playtime;
    }
  });

  result = sortHashArrayByParam(result, 'total_playtime');

  var data = [];
  var active_sheet = SpreadsheetApp.getActiveSpreadsheet();
  active_sheet.setActiveSheet(active_sheet.getSheetByName('Compare' + name));
  var sheet = SpreadsheetApp.getActiveSheet();
  result.forEach(function(rec){
    data.push(rec);
  });

  var range = sheet.getRange(2,1,data.length,1);
  Logger.log(data);
  range.setValues(data);

  return result;
};














