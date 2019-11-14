
var App = {
  web3Provider: null,
  contracts: {},
  account: "0x0",
  box: undefined,
  space: undefined,
  spaceName: "myApp",

  init: function() {

  }
}

$(function() {
  $(window).load(function() {
    App.init();
  });
});
