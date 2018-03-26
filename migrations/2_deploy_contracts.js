var PAXToken = artifacts.require("./PAXToken.sol");
var Crowdsale = artifacts.require("./Crowdsale.sol");

module.exports = function(deployer) {

    deployer.deploy(
        PAXToken,
        true,
    )
    .then(() => {
        deployer.deploy(
            Crowdsale,
            web3.eth.accounts[1], // _company
            web3.eth.accounts[2], // _founders_1
            web3.eth.accounts[3], // _founders_2
            PAXToken.address,
        )
    })
};
