var OwnableContract = artifacts.require("../contracts/Ownable.sol");
var utils = require("../test/utils.js");

var BigNumber = require('bignumber.js');
contract('OwnableContract', function(accounts) {
	let ownableContract;

	beforeEach('setup contract for each test', async function () {
		const admin = accounts[8];
		ownableContract = await OwnableContract.new({from: admin})
	})

	it('has an owner', async () => {
		const admin = accounts[8];
		assert.equal(await ownableContract.owner(), admin)
	})

	it('can transfer ownership by owner', async () => {
		const admin = accounts[8];
		assert.equal(await ownableContract.owner(), admin)

		const newAdmin = accounts[9];
		await ownableContract.transferOwnership(newAdmin, {from: admin})
		assert.equal(await ownableContract.owner(), newAdmin)
	})

	it('cannot transfer ownership by not owner', async () => {
		const admin = accounts[8];
		assert.equal(await ownableContract.owner(), admin)

		const newAdmin = accounts[9];
		await utils.expectThrow(ownableContract.transferOwnership(newAdmin))
		assert.equal(await ownableContract.owner(), admin)
	})
});