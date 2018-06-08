var DistributionContract = artifacts.require("../contracts/TokenDistribution.sol");
var AirdropContract = artifacts.require("../contracts/TokenAirdrop.sol");
var BountyContract = artifacts.require("../contracts/TokenBounty.sol");
var T2TContract = artifacts.require("../contracts/TraceToToken.sol");
var utils = require("../test/utils.js");

var BigNumber = require('bignumber.js');
contract('TokenDistribution', function(accounts) {
	let distributionContract;

	let airdropContract;
	let bountyContract;

	let t2tTokenContract;

	const defaultAcc = accounts[0];
	const t2tMainWallet = accounts[1];

	const t2tSender = accounts[2];
	const t2tReceiver0 = accounts[3];
	const t2tReceiver1 = accounts[4];
	const t2tReceiver2 = accounts[5];

	const t2tAmount = 10;

	beforeEach('setup contract for each test', async function () {
		t2tTokenContract = await T2TContract.new(t2tMainWallet, 3000, 0, t2tSender);

		distributionContract = await DistributionContract.new(t2tSender, t2tTokenContract.address, t2tSender, t2tSender, {from: defaultAcc});

		airdropContract = await AirdropContract.new(distributionContract.address, {from: defaultAcc});
		bountyContract = await BountyContract.new(distributionContract.address, {from: defaultAcc});

		await distributionContract.setAirdropContract(airdropContract.address, {from: t2tSender});
		await distributionContract.setBountyContract(bountyContract.address, {from: t2tSender});

		t2tTokenContract.transfer(t2tSender, 300, {from: t2tMainWallet});

		assert.equal(await t2tTokenContract.balanceOf.call(t2tSender), 300);
		assert.equal(await t2tTokenContract.balanceOf.call(t2tReceiver0), 0);
		assert.equal(await t2tTokenContract.balanceOf.call(t2tReceiver1), 0);
		assert.equal(await t2tTokenContract.balanceOf.call(t2tReceiver2), 0);
	})

	it('should not be able to set airdrop/bounty contract by not owner', async () => {
		assert.equal(await distributionContract.t2tAirdrop(), airdropContract.address);
		assert.equal(await distributionContract.t2tBounty(), bountyContract.address);

		newAirdropContract = await AirdropContract.new(distributionContract.address, {from: defaultAcc});
		newBountyContract = await BountyContract.new(distributionContract.address, {from: defaultAcc});

		await utils.expectThrow(distributionContract.setAirdropContract(newAirdropContract.address));
		await utils.expectThrow(distributionContract.setBountyContract(newBountyContract.address));

		assert.equal(await distributionContract.t2tAirdrop(), airdropContract.address);
		assert.equal(await distributionContract.t2tBounty(), bountyContract.address);
	})

	it("should revert if not from owner", async () => {
		await utils.expectThrow(distributionContract.doAllocation(t2tReceiver0, t2tAmount, 0, 0, "0x0"));

		await t2tTokenContract.approve(distributionContract.address, t2tAmount*5, {from: t2tSender});
		await utils.expectThrow(distributionContract.doAllocation(t2tReceiver0, t2tAmount, 0, 0, "0x0"));
		await utils.expectThrow(distributionContract.doAllocationsWithSameAmount([t2tReceiver0, t2tReceiver1], t2tAmount, 0, 0, "0x0"));
		await utils.expectThrow(distributionContract.doAllocationsWithAmounts([t2tReceiver0, t2tReceiver1], [t2tAmount, t2tAmount*3], 0, 0, "0x0"));
	})

	it('should revert if not enough allowence', async () => {
		await utils.expectThrow(distributionContract.doAllocation(t2tReceiver0, t2tAmount, 0, 0, "0x0", {from: t2tSender}));

		await t2tTokenContract.approve(distributionContract.address, t2tAmount-1, {from: t2tSender});
		await utils.expectThrow(distributionContract.doAllocation(t2tReceiver0, t2tAmount, 0, 0, "0x0", {from: t2tSender}));
	})

	it('should do allocation for individual', async () => {
		await t2tTokenContract.approve(distributionContract.address, t2tAmount, {from: t2tSender});
		await distributionContract.doAllocation(t2tReceiver0, t2tAmount, 0, 0, "0x0", {from: t2tSender});

		assert.equal(await t2tTokenContract.balanceOf.call(t2tSender), 300-t2tAmount);
		assert.equal(await t2tTokenContract.balanceOf.call(t2tReceiver0), t2tAmount);

		await t2tTokenContract.approve(distributionContract.address, t2tAmount, {from: t2tSender});
		await distributionContract.doAllocation(t2tReceiver0, t2tAmount, 0, 0, "0x0", {from: t2tSender});

		assert.equal(await t2tTokenContract.balanceOf.call(t2tSender), 300-t2tAmount*2);
		assert.equal(await t2tTokenContract.balanceOf.call(t2tReceiver0), t2tAmount*2);

		await t2tTokenContract.approve(distributionContract.address, t2tAmount, {from: t2tSender});
		await distributionContract.doAllocation(t2tReceiver0, t2tAmount, 0, 3, "0x0", {from: t2tSender});

		assert.equal(await t2tTokenContract.balanceOf.call(t2tSender), 300-t2tAmount*2);
		assert.equal(await t2tTokenContract.balanceOf.call(t2tReceiver0), t2tAmount*2);

		await t2tTokenContract.approve(distributionContract.address, t2tAmount, {from: t2tSender});
		await distributionContract.doAllocation(t2tReceiver1, t2tAmount, 2, 0, "0x0", {from: t2tSender});

		assert.equal(await t2tTokenContract.balanceOf.call(t2tSender), 300-t2tAmount*3);
		assert.equal(await t2tTokenContract.balanceOf.call(t2tReceiver1), t2tAmount);

		await t2tTokenContract.approve(distributionContract.address, t2tAmount, {from: t2tSender});
		await distributionContract.doAllocation(t2tReceiver1, t2tAmount, 2, 3, "0x0", {from: t2tSender});

		assert.equal(await t2tTokenContract.balanceOf.call(t2tSender), 300-t2tAmount*3);
		assert.equal(await t2tTokenContract.balanceOf.call(t2tReceiver1), t2tAmount);
	})

	it('should do allocation in bulk', async () => {
		await t2tTokenContract.approve(distributionContract.address, t2tAmount*6, {from: t2tSender});

		await distributionContract.doAllocationsWithSameAmount([t2tReceiver0, t2tReceiver1], t2tAmount, 1, 0, "0x0", {from: t2tSender});
		assert.equal(await t2tTokenContract.balanceOf.call(t2tReceiver0), t2tAmount);
		assert.equal(await t2tTokenContract.balanceOf.call(t2tReceiver1), t2tAmount);
		assert.equal(await t2tTokenContract.balanceOf.call(t2tSender), 300-t2tAmount*2);
		
		await distributionContract.doAllocationsWithAmounts([t2tReceiver0, t2tReceiver1], [t2tAmount, t2tAmount*3], 0, 0, "0x0", {from: t2tSender});
		assert.equal(await t2tTokenContract.balanceOf.call(t2tSender), 300-t2tAmount*6);
		assert.equal(await t2tTokenContract.balanceOf.call(t2tReceiver0), t2tAmount*2);
		assert.equal(await t2tTokenContract.balanceOf.call(t2tReceiver1), t2tAmount*4);

		await distributionContract.doAllocationsWithAmounts([t2tReceiver0, t2tReceiver1], [t2tAmount, t2tAmount*3], 0, 3, "0x0", {from: t2tSender});
		assert.equal(await t2tTokenContract.balanceOf.call(t2tSender), 300-t2tAmount*6);
		assert.equal(await t2tTokenContract.balanceOf.call(t2tReceiver0), t2tAmount*2);
		assert.equal(await t2tTokenContract.balanceOf.call(t2tReceiver1), t2tAmount*4);
	})

	it('should send airdrop', async () => {
		await t2tTokenContract.approve(airdropContract.address, t2tAmount*5, {from: t2tSender});

		await distributionContract.doAllocationsWithSameAmount([t2tReceiver0, t2tReceiver1], t2tAmount, 1, 1, "0x0", {from: t2tSender});
		assert.equal(await t2tTokenContract.balanceOf.call(t2tReceiver0), t2tAmount);
		assert.equal(await t2tTokenContract.balanceOf.call(t2tReceiver1), t2tAmount);
		assert.equal(await t2tTokenContract.balanceOf.call(t2tSender), 300-t2tAmount*2);

		await distributionContract.doAllocationsWithSameAmount([t2tReceiver0, t2tReceiver1, t2tReceiver2], t2tAmount, 1, 1, "0x0", {from: t2tSender});
		assert.equal(await t2tTokenContract.balanceOf.call(t2tReceiver0), t2tAmount*2);
		assert.equal(await t2tTokenContract.balanceOf.call(t2tReceiver1), t2tAmount*2);
		assert.equal(await t2tTokenContract.balanceOf.call(t2tReceiver2), t2tAmount);
		assert.equal(await t2tTokenContract.balanceOf.call(t2tSender), 300-t2tAmount*5);
	})

	it('should send bounty', async () => {
		await t2tTokenContract.approve(bountyContract.address, t2tAmount*9, {from: t2tSender});

		await distributionContract.doAllocationsWithAmounts([t2tReceiver0, t2tReceiver1],[t2tAmount, t2tAmount*2], 1, 2, "0x0", {from: t2tSender});
		assert.equal(await t2tTokenContract.balanceOf.call(t2tReceiver0), t2tAmount);
		assert.equal(await t2tTokenContract.balanceOf.call(t2tReceiver1), t2tAmount*2);
		assert.equal(await t2tTokenContract.balanceOf.call(t2tSender), 300-t2tAmount*3);

		await distributionContract.doAllocationsWithAmounts([t2tReceiver0, t2tReceiver1, t2tReceiver2], [t2tAmount*3, t2tAmount, t2tAmount*2], 1, 2, "0x0", {from: t2tSender});
		assert.equal(await t2tTokenContract.balanceOf.call(t2tReceiver0), t2tAmount*4);
		assert.equal(await t2tTokenContract.balanceOf.call(t2tReceiver1), t2tAmount*3);
		assert.equal(await t2tTokenContract.balanceOf.call(t2tReceiver2), t2tAmount*2);
		assert.equal(await t2tTokenContract.balanceOf.call(t2tSender), 300-t2tAmount*9);
	})

	it('should count the allocation amount', async () => {
		await t2tTokenContract.approve(distributionContract.address, t2tAmount*6, {from: t2tSender});

		await distributionContract.doAllocationsWithSameAmount([t2tReceiver0, t2tReceiver1], t2tAmount, 1, 0, "0x0", {from: t2tSender});
		assert.equal(await distributionContract.getAllocationAmount.call(t2tReceiver0), t2tAmount);
		assert.equal(await distributionContract.getAllocationAmount.call(t2tReceiver1), t2tAmount);
		
		await distributionContract.doAllocationsWithAmounts([t2tReceiver0, t2tReceiver1], [t2tAmount, t2tAmount*3], 0, 0, "0x0", {from: t2tSender});

		assert.equal(await distributionContract.getAllocationAmount.call(t2tReceiver0), t2tAmount*2);
		assert.equal(await distributionContract.getAllocationAmount.call(t2tReceiver1), t2tAmount*4);

		await distributionContract.doAllocationsWithAmounts([t2tReceiver0, t2tReceiver1], [t2tAmount*2, t2tAmount*2], 0, 3, "0x0", {from: t2tSender});

		assert.equal(await distributionContract.getAllocationAmount.call(t2tReceiver0), t2tAmount*4);
		assert.equal(await distributionContract.getAllocationAmount.call(t2tReceiver1), t2tAmount*6);
		assert.equal(await distributionContract.getAllocationAmount.call(t2tReceiver2), 0);

		let amounts = await distributionContract.getAllocationAmounts.call([t2tReceiver0, t2tReceiver1, t2tReceiver2]);
		assert.equal(amounts, t2tAmount*10);
	})



});