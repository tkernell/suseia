
var App = {
  web3Provider: null,
  contracts: {},
  account: "0x0",
  box: undefined,
  space: undefined,
  spaceName: "myApp",
  openDoc: undefined,
  docTitlesList: {},
  docTitlesListKey: "__docTitles",

  init: function() {
    $("#text-editor").hide();
    $("#homepage").show();
    return App.initWeb3();
  },

  initWeb3: function() {
    if (typeof web3 !== "undefined") {
      console.log("Using web3 detected from external source like Metamask");
      App.web3Provider = web3.givenProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      console.log("Using localhost");
      web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
    }
    return App.initEth();
  },

  initEth: function() {
    ethereum.enable().then(function() {
      console.log("Ethereum enabled");
      App.account = window.ethereum.selectedAddress;
      console.log("In initEth: " + App.account);
      return App.initBox();
    });
  },

  initBox: function() {
    console.log("Opening box...");
    console.log("In initBox: " + App.account);
    Box.openBox(App.account, window.ethereum).then(function(box) {
      box.syncDone.then(function() {
        console.log(box);
        App.box = box;
        return App.initSpace();
      });
    });
  },

  initSpace: function() {
    console.log("Opening space...");
    App.box.openSpace(App.spaceName).then(function(space) {
      space.syncDone.then(function() {
        console.log(space);
        App.space = space;
        return App.runOnce();
      });
    });
  },

  runOnce: function() {
    $(document).on("click", "#create-new-btn", function() {
      App.openEditor();
    });
    $(document).on("click", "#text-editor-save", function() {
      console.log("clicked save");
      App.saveDoc();
    });
    $(document).on("click", "#close-text-editor-btn", function() {
      App.render();
    })
    return App.render();
  },

  render: function() {
    $("#text-editor").hide();
    $("#homepage").show();
    App.space.private.get(App.docTitlesListKey).then(function(titlesList) {
      if (titlesList != null) {
        App.docTitlesList = titlesList;
      }
      App.populateDocsList();
    });    
  },

  populateDocsList: function() {
    var docIds = Object.keys(App.docTitlesList);
    var $listGroupItem;
    var $listGroupItemHeading;
    var $listGroup = $(".list-group");
    $listGroup.html(""); // Clear list for refresh
    for (let i in docIds) {
      $listGroupItem = $("<div>", { class: "list-group-item", id: docIds[i] + "-list-item" });
      $listGroupItemHeading = $("<h4>", { class: "list-group-heading" });
      $listGroupItemHeading.text(App.docTitlesList[docIds[i]]);
      $listGroupItem.append($listGroupItemHeading);
      $listGroup.append($listGroupItem);

      $(document).on("click", "#" + docIds[i] + "-list-item", function() {
        App.openEditor(docIds[i]);
      });
    }
  },

  openEditor: function(_docId) {
    $("#homepage").hide();

    var heading;
    var content;
    App.openDoc = undefined;

    if (_docId == undefined) {
      heading = "Type heading here";
      content = "Type content here";
      App.__openEditor(heading, content);
    } else {
      App.space.private.get(_docId).then(function(docObj) {
        App.openDoc = docObj;
        heading = docObj.title;
        content = docObj.content;
        App.__openEditor(heading, content);
      })
    }

  },

  __openEditor: function(heading, content) {
    $("#heading").text(heading);
    $("#text").html(content);
    $("#text-editor").show();
  },

  saveDoc: function() {
    if (App.openDoc == undefined) {
      App.openDoc = new App.Textdoc();
    }
    App.openDoc.title = $("#heading").text();
    App.openDoc.content = $("#text").html();
    App.space.private.set(App.openDoc.id, App.openDoc).then(function(itWorked) {
      console.log("Doc saved at time: " + getUnixTimestamp());
      App.docTitlesList[App.openDoc.id] = App.openDoc.title;
      App.space.private.set(App.docTitlesListKey, App.docTitlesList);
    });
  },

  Textdoc: function() {
    this.title = null;
    this.address = null;
    this.content = null;
    this.timestamp = getUnixTimestamp();
    this.id = web3.utils.keccak256(this.timestamp + App.account).substr(0, 42);
    this.counterparty = null;
    this.fundsData = null;
    this.version = null
  }


}

$(function() {
  $(window).load(function() {
    App.init();
  });
});


function getUnixTimestamp() {
  var timestamp = new Date();
  return timestamp.getTime();
}
