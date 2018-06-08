var Airdrop = artifacts.require("./TokenAirdrop.sol");
var Bounty = artifacts.require("./TokenBounty.sol");

var Distribution = artifacts.require("./TokenDistribution.sol");

module.exports = function(deployer) {
  let t2tContractAddr = '<t2tContractAddr>';

  let admin = '<admin>';
  // admin should be the one running the distribution contract
  
  let airdropWallet = '<airdropWallet>';
  let bountyWallet = '<bountyWallet>';

  let airdropAddr;
  let bountyAddr;

  let distributionAddr;

  deployer.deploy(Distribution, admin, t2tContractAddr, airdropWallet, bountyWallet).then(function(_distribution){
     console.log('Distribution.address',Distribution.address);
    deployer.deploy(Airdrop, Distribution.address)
    .then(function(){
      console.log('Airdrop.address',Airdrop.address);
      _distribution.setAirdropContract(Airdrop.address);
     
    })
     deployer.deploy(Bounty, Distribution.address)
      .then(function(){    
        console.log('Bounty.address',Bounty.address);
       _distribution.setBountyContract(Bounty.address);
     })
  })
}