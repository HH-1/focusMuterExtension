var stoppedTabs = [];
var activeTabID = null
var enabled = true


function removeStoppedTab(tabId){
  var index = stoppedTabs.indexOf(tabId)
  if(index > -1){
    stoppedTabs.splice(index, 1);
  }
}

function getPlayingTabs(callback){
  chrome.tabs.query({"audible":true}, callback);
}

function startMusicFromTab(tabId){
  chrome.tabs.get(tabId, function(tab){
    if(!tab.audible){
      chrome.tabs.executeScript(tabId, {"file": "./utils/play.js"}, function(){
        removeStoppedTab(tabId)
      })
    }
  })
}

function stopMusicFromTab(tabId){
  chrome.tabs.executeScript(tabId,{"file": "./utils/stop.js"}, function(){
    stoppedTabs.push(tabId)
  })
}

function stopMusicFromOtherTabs(){
  getPlayingTabs(function(playingTabs){
    playingTabs.forEach(function(tab){
      if(tab.id != activeTabID && !stoppedTabs.includes(tab.id)){
        stopMusicFromTab(tab.id)
      }
    })
  })
}

function addMusicListener(){
  chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab){
    if (enabled){
      if (changeInfo.hasOwnProperty("audible")){
        if (tabId == activeTabID){
          if (changeInfo["audible"]){
            //mute all the others
            stopMusicFromOtherTabs()
          } else if (stoppedTabs.length > 0){
            //unmute the previously playing
            startMusicFromTab(stoppedTabs.pop())
          }
        } else if (changeInfo["audible"]){
          chrome.tabs.get(activeTabID, function(tab){
            if(tab && tab.audible){
              stopMusicFromTab(tabId)
            }
          })
        }
        else {
          getPlayingTabs(function(tabs){
            if(tabs.length == 0 && stoppedTabs.length > 0){
              startMusicFromTab(stoppedTabs.pop())
            }
          })
        }
      }
    }
  })
}

chrome.storage.sync.get("enabled", function(data){
  if(data && data.hasOwnProperty("enabled")){
    enabled = data.enabled
  }
})

chrome.tabs.onActivated.addListener(function(activeInfo){
  if(enabled){
    if (stoppedTabs.includes(activeInfo.tabId)){
      startMusicFromTab(activeInfo.tabId)
    }
    activeTabID = activeInfo.tabId
  }
})
addMusicListener(activeTabID)

chrome.tabs.onRemoved.addListener(function(tabId, removeInfo){
  removeStoppedTab(tabId)
})
