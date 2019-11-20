
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
      return App.initContract();
    });
  },

  initContract: function() {
    var abi = JSON.parse('[{"constant":true,"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"owners","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"docHashLog","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"name":"docs","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"_newOwner","type":"address"}],"name":"addOwner","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"bytes32","name":"_docId","type":"bytes32"},{"internalType":"bytes32","name":"_docHash","type":"bytes32"}],"name":"updateDocs","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"docIdLog","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"getDocIdLogLength","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"}]');

    App.contracts.SimpleStorage = new web3.eth.Contract(abi);
    // App.contracts.SimpleStorage.options.address = '0xa425b6824bad190ca7972a8d15cf17fe946edf21'; // Ganache
    App.contracts.SimpleStorage.options.address = '0xb4db0e1c919d2941046722423cd40072435f7c52'; // Ropsten Network

    return App.initBox();
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
    });
    $(document).on("click", "#text-editor-hash-btn", function() {
      if (App.openDoc == undefined) {
        App.openDoc = new App.Textdoc();
      };
      App.openDoc.content = $("#text").html();
      App.commitDocHash();
    });

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
    $(".list-group-item").hover(function() {
      $(this).css("background-color", "#add8e6");
    }, function() {
      $(this).css("background-color", "white");
    });
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
      console.log("Doc saved at time: " + (new Date()).getTime());
      App.docTitlesList[App.openDoc.id] = App.openDoc.title;
      App.space.private.set(App.docTitlesListKey, App.docTitlesList);
    });
  },

  Textdoc: function() {
    this.title = null;
    this.address = null;
    this.content = null;
    this.timestamp = (new Date()).getTime();
    this.id = web3.utils.keccak256(this.timestamp + App.account).substr(0, 42);
    this.counterparty = null;
    this.fundsData = null;
    this.version = null
  },

  commitDocHash: function() {
    App.contracts.SimpleStorage.methods.updateDocs(
      App.openDoc.id,
      web3.utils.keccak256(App.openDoc.content)).send({
        from: App.account
      });
  }


}

$(function() {
  $(window).load(function() {
    App.init();
  });
});
