
var App = {
  web3Provider: null,
  contracts: {},
  account: "0x0",
  box: undefined,
  space: undefined,
  spaceName: "myApp",

  init: function() {
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
        return App.render();
      });
    });
  },

  render: function() {
    $(document).on("click", "#create-new-btn", function() {
      App.openEditor();
    });
  },

  openEditor: function(_docId) {
    $("#homepage").hide();

    var heading;
    var content;

    if (_docId == undefined) {
      heading = "Type heading here";
      content = "Type content here";
    } else {
      App.space.private.get(_docId).then(function(docObj) {
        heading = docObj.title;
        content = docObj.content;
      })
    }
  }


}

$(function() {
  $(window).load(function() {
    App.init();
  });
});
