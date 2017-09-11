function steamApiCall (call_to_make, steam_id, param){
  var active_sheet = SpreadsheetApp.getActiveSpreadsheet(),
      settingsSheet = active_sheet.getSheetByName("Settings"),
      steam_api_key = settingsSheet.getRange(1, 2).getValue(),
      user_id = steam_id == 'default' ? settingsSheet.getRange(2, 2).getValue() : param,
      query = '"Apps Script" stars:">=100"',
      url = 'http://api.steampowered.com/';

  switch (call_to_make){
    case 'getOwnedGames':
      url += 'IPlayerService/GetOwnedGames/v0001/?include_appinfo=\'true\'?'
      url += '&steamid='
      url += user_id
      break;
    case 'getFriends':
      url += 'ISteamUser/GetFriendList/v1/?'
      url += '&steamid='
      url += user_id
      break;
    case 'getUsers':
      url += 'ISteamUser/GetPlayerSummaries/v0002/?steamids='
      url += param
      break;
  }
  url +='&key=' + steam_api_key + '&format=json';

  Logger.log(url);

  // Make Steam API Call
  var response = UrlFetchApp.fetch(url, {'muteHttpExceptions': true}),
      json = response.getContentText();
  return json;
};
