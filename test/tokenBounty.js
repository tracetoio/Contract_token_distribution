var BountyContract = artifacts.require("../contracts/TokenBounty.sol");
var T2TContract = artifacts.require("../contracts/TraceToToken.sol");
var utils = require("../test/utils.js");

var BigNumber = require('bignumber.js');
contract('TokenBounty', function(accounts) {
	let bountyContract;
	let t2tTokenContract;

	const defaultAcc = accounts[0];
	const t2tMainWallet = accounts[1];

	const t2tSender = accounts[2];
	const t2tReceiver0 = accounts[3];
	const t2tReceiver1 = accounts[4];
	const t2tReceiver2 = accounts[5];

	const bountyAmount = 10;

	beforeEach('setup contract for each test', async function () {
		bountyContract = await BountyContract.new(t2tSender, {from: defaultAcc});

		t2tTokenContract = await T2TContract.new(t2tMainWallet, 3000, 0, t2tSender);
	})

	it('cannot send bounty by not owner', async () => {
		console.log(await bountyContract.owner())
		await utils.expectThrow(bountyContract.bounty(t2tTokenContract.address, t2tSender, [t2tReceiver0], [bountyAmount]));
	})

	it('cannot send bounty if not enough allowence', async () => {
		await utils.expectThrow(bountyContract.bounty(t2tTokenContract.address, t2tMainWallet, [t2tReceiver0], [bountyAmount], {from: t2tSender}));
		await t2tTokenContract.approve(bountyContract.address, bountyAmount-1, {from: t2tMainWallet});
		await utils.expectThrow(bountyContract.bounty(t2tTokenContract.address, t2tMainWallet, [t2tReceiver0], [bountyAmount], {from: t2tSender}));
	})

	it('should revert if amount is less then 0', async () => {
		await t2tTokenContract.approve(bountyContract.address, bountyAmount*3, {from: t2tMainWallet});
		await utils.expectThrow(bountyContract.bounty(t2tTokenContract.address, t2tMainWallet, [t2tReceiver0, t2tReceiver1, t2tReceiver2], [-bountyAmount, -bountyAmount, bountyAmount], {from: t2tSender}));

		assert.equal(await t2tTokenContract.balanceOf(t2tReceiver0), 0);
		assert.equal(await t2tTokenContract.balanceOf(t2tReceiver1), 0);
		assert.equal(await t2tTokenContract.balanceOf(t2tReceiver2), 0);
		assert.equal(await t2tTokenContract.balanceOf(t2tMainWallet), 3000);

		await t2tTokenContract.approve(bountyContract.address, bountyAmount*2, {from: t2tMainWallet});
		await utils.expectThrow(bountyContract.bounty(t2tTokenContract.address, t2tMainWallet, [t2tReceiver0, t2tReceiver1],[-bountyAmount, -bountyAmount], {from: t2tSender}));

		assert.equal(await t2tTokenContract.balanceOf(t2tReceiver0), 0);
		assert.equal(await t2tTokenContract.balanceOf(t2tReceiver1), 0);
		assert.equal(await t2tTokenContract.balanceOf(t2tReceiver2), 0);
		assert.equal(await t2tTokenContract.balanceOf(t2tMainWallet), 3000);
	})

	it('should be able to send bounty to one user', async () => {
		await t2tTokenContract.approve(bountyContract.address, bountyAmount, {from: t2tMainWallet});
		await bountyContract.bounty(t2tTokenContract.address, t2tMainWallet, [t2tReceiver0], [bountyAmount], {from: t2tSender});

		assert.equal(await t2tTokenContract.balanceOf(t2tReceiver0), bountyAmount);
		assert.equal(await t2tTokenContract.balanceOf(t2tMainWallet), 3000-bountyAmount);

		await t2tTokenContract.approve(bountyContract.address, bountyAmount, {from: t2tMainWallet});
		await bountyContract.bounty(t2tTokenContract.address, t2tMainWallet, [t2tReceiver0], [bountyAmount], {from: t2tSender});

		assert.equal(await t2tTokenContract.balanceOf(t2tReceiver0), bountyAmount*2);
		assert.equal(await t2tTokenContract.balanceOf(t2tMainWallet), 3000-bountyAmount*2);
	})

	it('should be able to send bounty to users', async () => {
		await t2tTokenContract.approve(bountyContract.address, bountyAmount*16, {from: t2tMainWallet});
		await bountyContract.bounty(t2tTokenContract.address, t2tMainWallet, [t2tReceiver0, t2tReceiver1, t2tReceiver2], [bountyAmount*7, bountyAmount*4, bountyAmount*5], {from: t2tSender});

		assert.equal(await t2tTokenContract.balanceOf(t2tReceiver0), bountyAmount*7);
		assert.equal(await t2tTokenContract.balanceOf(t2tReceiver1), bountyAmount*4);
		assert.equal(await t2tTokenContract.balanceOf(t2tReceiver2), bountyAmount*5);
		assert.equal(await t2tTokenContract.balanceOf(t2tMainWallet), 3000-bountyAmount*16);

		await t2tTokenContract.approve(bountyContract.address, bountyAmount*5, {from: t2tMainWallet});
		await bountyContract.bounty(t2tTokenContract.address, t2tMainWallet, [t2tReceiver0, t2tReceiver1], [bountyAmount*3, bountyAmount*2], {from: t2tSender});

		assert.equal(await t2tTokenContract.balanceOf(t2tReceiver0), bountyAmount*10);
		assert.equal(await t2tTokenContract.balanceOf(t2tReceiver1), bountyAmount*6);
		assert.equal(await t2tTokenContract.balanceOf(t2tReceiver2), bountyAmount*5);
		assert.equal(await t2tTokenContract.balanceOf(t2tMainWallet), 3000-bountyAmount*21);

		await t2tTokenContract.approve(bountyContract.address, bountyAmount, {from: t2tMainWallet});
		await bountyContract.bounty(t2tTokenContract.address, t2tMainWallet, [t2tReceiver0], [bountyAmount], {from: t2tSender});

		assert.equal(await t2tTokenContract.balanceOf(t2tReceiver0), bountyAmount*11);
		assert.equal(await t2tTokenContract.balanceOf(t2tReceiver1), bountyAmount*6);
		assert.equal(await t2tTokenContract.balanceOf(t2tReceiver2), bountyAmount*5);
		assert.equal(await t2tTokenContract.balanceOf(t2tMainWallet), 3000-bountyAmount*22);
	})

	it('should be able to count drops and drop amount', async () => {
		await t2tTokenContract.approve(bountyContract.address, bountyAmount*16, {from: t2tMainWallet});
		await bountyContract.bounty(t2tTokenContract.address, t2tMainWallet, [t2tReceiver0, t2tReceiver1, t2tReceiver2], [bountyAmount*7, bountyAmount*4, bountyAmount*5], {from: t2tSender});

		assert.equal(await bountyContract.numDrops(), 3);
		assert.equal(await bountyContract.dropAmount(), bountyAmount*16);

		await t2tTokenContract.approve(bountyContract.address, bountyAmount*5, {from: t2tMainWallet});
		await bountyContract.bounty(t2tTokenContract.address, t2tMainWallet, [t2tReceiver0, t2tReceiver1], [bountyAmount*3, bountyAmount*2], {from: t2tSender});

		assert.equal(await bountyContract.numDrops(), 5);
		assert.equal(await bountyContract.dropAmount(), bountyAmount*21);

		await t2tTokenContract.approve(bountyContract.address, bountyAmount, {from: t2tMainWallet});
		await bountyContract.bounty(t2tTokenContract.address, t2tMainWallet, [t2tReceiver0], [bountyAmount], {from: t2tSender});

		assert.equal(await bountyContract.numDrops(), 6);
		assert.equal(await bountyContract.dropAmount(), bountyAmount*22);
	})
});