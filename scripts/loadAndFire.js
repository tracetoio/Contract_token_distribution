const fs = require('fs');
const csv = require('fast-csv');
const BigNumber = require('bignumber.js');
const contract = require('truffle-contract');
const Web3 = require('web3');



const tracetoDistributionAddress = process.argv.slice(2)[0];
const BATCH_SIZE = process.argv.slice(2)[1];
const allocAmountTrue = process.argv.slice(2)[2];

const providerUrl = "https://ropsten.infura.io/<token>";

const tracetoDistributionABI = require('../build/contracts/TokenDistribution.json');
const wallet_priKey = "";

if(!BATCH_SIZE) BATCH_SIZE = 80;
let distribData = new Array();
let distribDataAmount = new Array();
let allocData = new Array();
let allocAmount = new Array();

//     enum Reason {TOKEN_SALE, TEAM_AND_ADVISORS, PARTNERSHIPS_MARKETING, COMPANY_RESERVE}
//     enum Mode {NORMAL, AIRDROP, BOUNTY, PREALLOCATED}

const reason = 0;
const mode = 0;

if (typeof web3 !== 'undefined') {
  web3 = new Web3(web3.currentProvider);

} else {
  web3 = new Web3(new Web3.providers.HttpProvider(providerUrl));
  console.log("Setting Provider")
}

const tracetoDistribution = new web3.eth.Contract(tracetoDistributionABI.abi, tracetoDistributionAddress);



async function setAllocationWithPrivateKey() {


  console.log(`
    --------------------------------------------
    ---------Performing allocations ------------
    --------------------------------------------
    `);

  try{

    const acc = await web3.eth.accounts.privateKeyToAccount(wallet_priKey);
    const account = acc.address;
    let nonce = await web3.eth.getTransactionCount(account);
    web3.eth.accounts.wallet.add(acc);
    web3.eth.defaultAccount = web3.eth.accounts.wallet[0].address;


    const userBalance = await web3.eth.getBalance(account);
    web3.eth.getGasPrice((err, gasPrice)=>{
      const gasPriceHex = web3.utils.numberToHex(gasPrice*4);
      const gasLimitHex = web3.utils.numberToHex(450000);

      for (var i = 0; i < distribData.length; i++) {
        if(distribData[i].length>0){
          // console.log(distribData[i], distribDataAmount[i], mode, web3.utils.asciiToHex("PrivateSale"))
          tracetoDistribution.methods.doAllocationsWithAmounts(distribData[i],distribDataAmount[i] , mode, web3.utils.asciiToHex("PrivateSale"))
          .send( {'from':account, 'gasPrice': gasPriceHex, 'gasLimit': gasLimitHex , 'nonce':nonce+i})
          .then(function(txCompleteData, err){
            if(!err){
              console.log(txCompleteData)
            }
            else
              console.log(err)
          })
        }
      }
    })
  }
  catch(error){
    console.log('Caught an unexpected error::', error);
  }

}


function readFile() {
  const stream = fs.createReadStream(__dirname+"/data/drop.csv");
  let index = 0;
  let batch = 0;

  var csvStream = csv()
  .on("data", function(data){
    let isAddress = web3.utils.isAddress(data[0]);
    if(isAddress && data[0]!=null && data[0]!='' ){
      allocData.push(data[0]);
      allocAmountTrue == "Y"?allocAmount.push(data[1]):null;
      index++;
      if(index >= BATCH_SIZE)
      {
        distribData.push(allocData);
        allocAmountTrue == "Y"?distribDataAmount.push(allocAmount):null;
        allocData = [];
        allocAmount = [];
        index = 0;
      }
    }
  })
  .on("end", function(){
    //Add last remainder batch
    distribData.push(allocData);
    allocAmountTrue == "Y"?distribDataAmount.push(allocAmount):null;
    allocData = [];
    setAllocationWithPrivateKey();
  });
  stream.pipe(csvStream);
}
if(tracetoDistributionAddress){
  console.log("Processing airdrop. Batch size is",BATCH_SIZE, "accounts per transaction");
  readFile();
}else{
  console.log("Please run the script by providing the address of the tracetoDistribution contract");
}