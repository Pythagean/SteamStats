//Returns active spreadsheet, with AllGames set as active sheet
function allGamesSheet(){
  var active_sheet = SpreadsheetApp.getActiveSpreadsheet();
  active_sheet.setActiveSheet(active_sheet.getSheetByName('AllGames'));
  return active_sheet;
};

//Returns active spreadsheet, with OwnedGames set as active sheet
function ownedGamesSheet(){
  var active_sheet = SpreadsheetApp.getActiveSpreadsheet();
  active_sheet.setActiveSheet(active_sheet.getSheetByName('OwnedGames'));
  return active_sheet;
};

//Returns active spreadsheet, with OwnedGames set as active sheet
function settingsSheet(){
  var active_sheet = SpreadsheetApp.getActiveSpreadsheet();
  active_sheet.setActiveSheet(active_sheet.getSheetByName('Settings'));
  return active_sheet;
};

//Returns active spreadsheet, with Compare set as active sheet
function compareSheet(){
  var active_sheet = SpreadsheetApp.getActiveSpreadsheet();
  active_sheet.setActiveSheet(active_sheet.getSheetByName('Compare'));
  return active_sheet;
};

//Returns active spreadsheet, with Compare set as active sheet
function compareSummarySheet(){
  var active_sheet = SpreadsheetApp.getActiveSpreadsheet();
  active_sheet.setActiveSheet(active_sheet.getSheetByName('CompareSummary'));
  return active_sheet;
};