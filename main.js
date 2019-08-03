
// 初期化する
function setUp() {
  initLibraries();

  // spreadsheetが無かったら初期化
  var global_settings = new GASProperties();
  if(!global_settings.get('spreadsheet')) {

    // シートを作る
    var spreadsheet = SpreadsheetApp.create("sremo");
    var sheets = spreadsheet.getSheets();
    if(sheets.length == 1 && sheets[0].getLastRow() == 0) {
      sheets[0].setName('_setting');
    }
    global_settings.set('spreadsheet', spreadsheet.getId());

    var settings = new GSProperties(spreadsheet);
    settings.set('token', '');
    settings.setNote('token', 'sremoのtokenを入力してください');
    settings.set('get_url', '');
    settings.setNote('get_url', 'sremoのapi urlを入力してください');

    // 記録用のシートを作成
    new GSTimesheets(spreadsheet);

    // データ取得
    ScriptApp.newTrigger('confirm')
      .timeBased()
      .everyHours(1)
      .create();
  }
};

function confirm() {
  var sremo = init();
  var token = sremo.setting.get('token');
  var get_url = sremo.setting.get('get_url');
  var params = {
    headers: {
      Authorization: "Bearer " + token,
    }
  }
  var result = UrlFetchApp.fetch(get_url, params).getContentText();
  Logger.log(result);
  sremo.storage.set(getNow(), JSON.parse(result));
}


// 各モジュールの読み込み
var initLibraries = function() {
  if(typeof EventListener === 'undefined') EventListener = loadEventListener();
  // if(typeof DateUtils === 'undefined') DateUtils = loadDateUtils();
  if(typeof GASProperties === 'undefined') GASProperties = loadGASProperties();
  if(typeof GSProperties === 'undefined') GSProperties = loadGSProperties();
  //if(typeof GSTemplate === 'undefined') GSTemplate = loadGSTemplate();
  if(typeof GSTimesheets === 'undefined') GSTimesheets = loadGSTimesheets();
  //if(typeof Timesheets === 'undefined') Timesheets = loadTimesheets();
  if(typeof Slack === 'undefined') Slack = loadSlack();
}


var init = function() {
  initLibraries();

  var global_settings = new GASProperties();

  var spreadsheetId = global_settings.get('spreadsheet');
  if(spreadsheetId) {
    var spreadsheet = SpreadsheetApp.openById(spreadsheetId);
    var settings = new GSProperties(spreadsheet);
//    var slack = new Slack(settings.get('Slack Incoming URL'), template, settings);
    var storage = new GSTimesheets(spreadsheet, settings);
//    var timesheets = new Timesheets(settings, slack);
    return({
      storage: storage,
      setting: settings,
    });
  }
  return null;
}
