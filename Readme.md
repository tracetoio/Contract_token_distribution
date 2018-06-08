# traceto.io Token Distribution Contract 

This repo is for running the distribution of Tokens to users, traceto.io intends to use this to distribute the tokens minted to different categories of users. This contract can be called multiple times.

Towards this we have made an enum for Reason, and another enum for Mode along with a comment all described below.

| Reason        | Comment       | Mode    | Files  | Date Executed |
| ------------- |:-------------:|:----:|:-----:|:----:|
| TOKEN_SALE | Public Sale | NORMAL |[data.csv](/data/data.csv) | DD/MM/YYYY |
| TOKEN_SALE | Private Sale | NORMAL |[data.csv](/data/data.csv) | DD/MM/YYYY |
| TOKEN_SALE | Early Backer Sale | NORMAL |[data.csv](/data/data.csv) | DD/MM/YYYY |
| TOKEN_SALE | Private Sale | PREALLOCATED |[data.csv](/data/data.csv) | DD/MM/YYYY |
| TOKEN_SALE | Public Sale | PREALLOCATED |[data.csv](/data/data.csv) | DD/MM/YYYY |
| TEAM_AND_ADVISORS | TEAM | NORMAL |[data.csv](/data/data.csv)| DD/MM/YYYY |
| TEAM_AND_ADVISORS | ADVISORS | NORMAL |[data.csv](/data/data.csv) | DD/MM/YYYY |
| TEAM_AND_ADVISORS | FOUNDERS | NORMAL |[data.csv](/data/data.csv) | DD/MM/YYYY |
| PARTNERSHIPS_MARKETING | BOUNTY<CAMPAIGNNAME> | BOUNTY |[data.csv](/data/data.csv) | DD/MM/YYYY |
| PARTNERSHIPS_MARKETING | AIRDROP<CAMPAIGNNAME> | AIRDROP |[data.csv](/data/data.csv) | DD/MM/YYYY |
| COMPANY_RESERVE | RESERVE | NORMAL |[data.csv](/data/data.csv) | DD/MM/YYYY |

## MODE

The various mode's are 
1. NORMAL
2. AIRDROP
3. BOUNTY
4. PREALLOCATED

Normal refers to the mode to be used for the distribution for non Airdrop/Bounty Related Campaigns. The other exception is for the categories of users to whom we have PREALLOCATED, or already distributed prior to actually running this contract.

## Setup

The data can be loaded in two ways:
1. Via a whitelisted smart contract.
2. Via a csv file that has the contract addresses and amounts.

The csv files will be made public before deployment.

Then depending on the use case we can call the correct method.




## Use cases 

1) Transfer of T2T to private sale participants from a distribution wallet `node loadAndFire.js <contractDeployedAddress> <BATCH-SIZE> "" Y`

Approve the amounts for transfer from the distribution address before executing the contract.

Also remember to set mode=0 reason=0. 

 ###enum Reason {TOKEN_SALE, TEAM_AND_ADVISORS, PARTNERSHIPS_MARKETING, COMPANY_RESERVE}
 ###enum Mode {NORMAL, AIRDROP, BOUNTY, PREALLOCATED}




## Things to check prior to running

Once the PolyDistribution contract is live, the following steps can be taken:

1) Ensure all csv files in /data are correct
2) Check that you have added the private key in loadAndFire.js
3) Deploy Contract via truffle

## Distributing the allocations

Once the startTime has passed and tokens become tradeable, the tokens can be distributed by running:

`node ./scripts/distribute.js <PolyDistribution contract address>`

