

  browser.browserAction.onClicked.addListener(openPage);
  function onExecuted(result) {
    console.log(`We made it green`);
  }
  
  function onError(error) {
    console.log(`Error: ${error}`);
  }
  
function openPage() {

    const executing = browser.tabs.executeScript(null, { file: "assets/js/jquery-3.2.0.js" }, function() {
      browser.tabs.executeScript(null, { file: "contentscript.js" });
  });
    executing.then(onExecuted, onError);
  }
