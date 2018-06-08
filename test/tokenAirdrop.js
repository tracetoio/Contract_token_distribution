var AirdropContract = artifacts.require("../contracts/TokenAirdrop.sol");
var T2TContract = artifacts.require("../contracts/TraceToToken.sol");
var utils = require("../test/utils.js");

var BigNumber = require('bignumber.js');
contract('AirdropContract', function(accounts) {
	let airdropContract;
	let t2tTokenContract;

	const defaultAcc = accounts[0];
	const t2tMainWallet = accounts[1];

	const t2tDropper = accounts[2];
	const t2tReceiver0 = accounts[3];
	const t2tReceiver1 = accounts[4];
	const t2tReceiver2 = accounts[5];

	const airdropAmount = 10;

	beforeEach('setup contract for each test', async function () {
		airdropContract = await AirdropContract.new(t2tDropper, {from: defaultAcc});

		t2tTokenContract = await T2TContract.new(t2tMainWallet, 3000, 0, t2tDropper);
	})

	it('cannot airdrop by not owner', async () => {
		console.log(await airdropContract.owner())
		await utils.expectThrow(airdropContract.airdrop(t2tTokenContract.address, t2tDropper, [t2tReceiver0], airdropAmount));
	})

	it('cannot airdrop if not enough allowence', async () => {
		await utils.expectThrow(airdropContract.airdrop(t2tTokenContract.address, t2tMainWallet, [t2tReceiver0], airdropAmount, {from: t2tDropper}));
		await t2tTokenContract.approve(airdropContract.address, airdropAmount-1, {from: t2tMainWallet});
		await utils.expectThrow(airdropContract.airdrop(t2tTokenContract.address, t2tMainWallet, [t2tReceiver0], airdropAmount, {from: t2tDropper}));
	})

	it('should revert if amount is less then 0', async () => {
		await t2tTokenContract.approve(airdropContract.address, airdropAmount*3, {from: t2tMainWallet});
		await utils.expectThrow(airdropContract.airdrop(t2tTokenContract.address, t2tMainWallet, [t2tReceiver0, t2tReceiver1, t2tReceiver2], -airdropAmount, {from: t2tDropper}));

		assert.equal(await t2tTokenContract.balanceOf(t2tReceiver0), 0);
		assert.equal(await t2tTokenContract.balanceOf(t2tReceiver1), 0);
		assert.equal(await t2tTokenContract.balanceOf(t2tReceiver2), 0);
		assert.equal(await t2tTokenContract.balanceOf(t2tMainWallet), 3000);

		await t2tTokenContract.approve(airdropContract.address, airdropAmount*2, {from: t2tMainWallet});
		await utils.expectThrow(airdropContract.airdrop(t2tTokenContract.address, t2tMainWallet, [t2tReceiver0, t2tReceiver1], -airdropAmount, {from: t2tDropper}));

		assert.equal(await t2tTokenContract.balanceOf(t2tReceiver0), 0);
		assert.equal(await t2tTokenContract.balanceOf(t2tReceiver1), 0);
		assert.equal(await t2tTokenContract.balanceOf(t2tReceiver2), 0);
		assert.equal(await t2tTokenContract.balanceOf(t2tMainWallet), 3000);
	})

	it('should be able to airdrop to one user', async () => {
		await t2tTokenContract.approve(airdropContract.address, airdropAmount, {from: t2tMainWallet});
		await airdropContract.airdrop(t2tTokenContract.address, t2tMainWallet, [t2tReceiver0], airdropAmount, {from: t2tDropper});

		assert.equal(await t2tTokenContract.balanceOf(t2tReceiver0), airdropAmount);
		assert.equal(await t2tTokenContract.balanceOf(t2tMainWallet), 3000-airdropAmount);

		await t2tTokenContract.approve(airdropContract.address, airdropAmount, {from: t2tMainWallet});
		await airdropContract.airdrop(t2tTokenContract.address, t2tMainWallet, [t2tReceiver0], airdropAmount, {from: t2tDropper});

		assert.equal(await t2tTokenContract.balanceOf(t2tReceiver0), airdropAmount*2);
		assert.equal(await t2tTokenContract.balanceOf(t2tMainWallet), 3000-airdropAmount*2);
	})

	it('should be able to airdrop to users', async () => {
		await t2tTokenContract.approve(airdropContract.address, airdropAmount*3, {from: t2tMainWallet});
		await airdropContract.airdrop(t2tTokenContract.address, t2tMainWallet, [t2tReceiver0, t2tReceiver1, t2tReceiver2], airdropAmount, {from: t2tDropper});

		assert.equal(await t2tTokenContract.balanceOf(t2tReceiver0), airdropAmount);
		assert.equal(await t2tTokenContract.balanceOf(t2tReceiver1), airdropAmount);
		assert.equal(await t2tTokenContract.balanceOf(t2tReceiver2), airdropAmount);
		assert.equal(await t2tTokenContract.balanceOf(t2tMainWallet), 3000-airdropAmount*3);

		await t2tTokenContract.approve(airdropContract.address, airdropAmount*2, {from: t2tMainWallet});
		await airdropContract.airdrop(t2tTokenContract.address, t2tMainWallet, [t2tReceiver0, t2tReceiver1], airdropAmount, {from: t2tDropper});

		assert.equal(await t2tTokenContract.balanceOf(t2tReceiver0), airdropAmount*2);
		assert.equal(await t2tTokenContract.balanceOf(t2tReceiver1), airdropAmount*2);
		assert.equal(await t2tTokenContract.balanceOf(t2tReceiver2), airdropAmount);
		assert.equal(await t2tTokenContract.balanceOf(t2tMainWallet), 3000-airdropAmount*5);

		await t2tTokenContract.approve(airdropContract.address, airdropAmount, {from: t2tMainWallet});
		await airdropContract.airdrop(t2tTokenContract.address, t2tMainWallet, [t2tReceiver0], airdropAmount, {from: t2tDropper});

		assert.equal(await t2tTokenContract.balanceOf(t2tReceiver0), airdropAmount*3);
		assert.equal(await t2tTokenContract.balanceOf(t2tReceiver1), airdropAmount*2);
		assert.equal(await t2tTokenContract.balanceOf(t2tReceiver2), airdropAmount);
		assert.equal(await t2tTokenContract.balanceOf(t2tMainWallet), 3000-airdropAmount*6);
	})

	it('should be able to count drops and drop amount', async () => {
		await t2tTokenContract.approve(airdropContract.address, airdropAmount*3, {from: t2tMainWallet});
		await airdropContract.airdrop(t2tTokenContract.address, t2tMainWallet, [t2tReceiver0, t2tReceiver1, t2tReceiver2], airdropAmount, {from: t2tDropper});

		assert.equal(await airdropContract.numDrops(), 3);
		assert.equal(await airdropContract.dropAmount(), airdropAmount*3);

		await t2tTokenContract.approve(airdropContract.address, airdropAmount*2, {from: t2tMainWallet});
		await airdropContract.airdrop(t2tTokenContract.address, t2tMainWallet, [t2tReceiver0, t2tReceiver1], airdropAmount, {from: t2tDropper});

		assert.equal(await airdropContract.numDrops(), 5);
		assert.equal(await airdropContract.dropAmount(), airdropAmount*5);

		await t2tTokenContract.approve(airdropContract.address, airdropAmount, {from: t2tMainWallet});
		await airdropContract.airdrop(t2tTokenContract.address, t2tMainWallet, [t2tReceiver0], airdropAmount, {from: t2tDropper});

		assert.equal(await airdropContract.numDrops(), 6);
		assert.equal(await airdropContract.dropAmount(), airdropAmount*6);
	})
});