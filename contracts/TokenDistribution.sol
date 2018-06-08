pragma solidity ^0.4.24;
import "./Ownable.sol";
import "./Token.sol";
import "./SafeMath.sol";

contract Airdrop{
    function airdrop( Token token, address sender, address[] recipients, uint256 amount ) public {}
}

contract Bounty{
    function bounty( Token token, address sender, address[] recipients, uint256[] amount ) public {}
}

contract TokenDistribution is Ownable{
    using SafeMath for uint256;
    struct Allocation {
        uint256 amount;
        Reason reason;
        bytes32 comment;
    }

    enum Reason {TOKEN_SALE, TEAM_AND_ADVISORS, PARTNERSHIPS_MARKETING, COMPANY_RESERVE}
    enum Mode {NORMAL, AIRDROP, BOUNTY, PREALLOCATED}
    Reason reason;

    Token token;
    Airdrop public t2tAirdrop;
    Bounty public t2tBounty;

    address airdropWallet;
    address bountyWallet;

    mapping(address => Allocation) AccAllocated;

    event SetApprovedUser(address _approvedUser);   
    event SetAllocation(address accAllocated, uint256 amount, Reason reason);
    event ContractAddressFound(address accAllocated, uint256 amount, Reason reason);

    constructor(address _distributer, address _tokenAddress, address _airdropWallet, address _bountyWallet) public {
        transferOwnership(_distributer);
        token = Token(_tokenAddress);
        airdropWallet = _airdropWallet;
        bountyWallet = _bountyWallet;
    }

    function setAirdropContract(address airdropAddress) onlyOwner public{
        t2tAirdrop = Airdrop(airdropAddress);
    }

    function setBountyContract(address airdropAddress) onlyOwner public{
        t2tBounty = Bounty(airdropAddress);
    }

    function doAllocation(address _recipient, uint256 _amount, Reason _reason, Mode _mode, bytes32 _comment) onlyOwner public returns(bool) {
        if(_mode == Mode.NORMAL){
            uint codeLength;
            assembly {
                // Retrieve the size of the code on target address, this needs assembly .
                codeLength := extcodesize(_recipient)
            }
            if(codeLength==0) {
                assert( token.transferFrom(msg.sender, _recipient, _amount ) );
            }
            else {
                emit ContractAddressFound(_recipient, _amount, _reason);
            }
        }

        AccAllocated[_recipient].amount = AccAllocated[_recipient].amount.add(_amount);
        AccAllocated[_recipient].reason = _reason;
        AccAllocated[_recipient].comment = _comment;

        emit SetAllocation(_recipient, _amount, _reason);

        return true;
    }

    function doAllocationsWithSameAmount(address [] _recipients, uint256 _amount, Reason _reason, Mode _mode, bytes32 _comment) onlyOwner public returns(bool) {
        if(_mode == Mode.AIRDROP){
            doAllocation(airdropWallet, _recipients.length.mul(_amount), _reason, _mode, _comment);
            t2tAirdrop.airdrop(token, airdropWallet, _recipients, _amount);
        }
        else if(_mode == Mode.NORMAL || _mode == Mode.PREALLOCATED){
            for(uint8 idxAddr = 0; idxAddr < _recipients.length; idxAddr++){
                doAllocation(_recipients[idxAddr], _amount, _reason, _mode, _comment);
            }
        }
        return true;
    }

    function doAllocationsWithAmounts(address [] _recipients, uint256[] _amount, Reason _reason, Mode _mode, bytes32 _comment) onlyOwner public returns(bool) {
        uint256 len = _recipients.length <= _amount.length ? _recipients.length : _amount.length;
        if(_mode == Mode.BOUNTY){
            uint256 sum = 0;
            for(uint8 idxBounty = 0; idxBounty < len; idxBounty++){
                sum = sum.add(_amount[idxBounty]);
            }
            doAllocation(bountyWallet, sum, _reason, _mode, _comment);
            t2tBounty.bounty(token, airdropWallet, _recipients, _amount);
        }
        else if(_mode == Mode.NORMAL || _mode == Mode.PREALLOCATED){
            for(uint8 idxAddr = 0; idxAddr < len; idxAddr++){
                doAllocation(_recipients[idxAddr], _amount[idxAddr], _reason, _mode, _comment);
            }
        }
        return true;
    }

    function getAllocationAmount(address _recipient)  public view returns(uint256) {
        return AccAllocated[_recipient].amount;
    }

    function getAllocationAmounts(address[] _recipients)  public view returns(uint256) {
        uint256  amountTotal = 0;
        for(uint8 accCounter = 0; accCounter < _recipients.length; accCounter++){
            amountTotal = amountTotal.add(getAllocationAmount(_recipients[accCounter]));
        }
        return amountTotal;
    }

    function emergencyERC20Drain(Token _token, uint256 amount ) {
        address tracetoMultisig = 0x146f2Fba9EBa1b72d5162a56e3E5da6C0f4808Cc;
        _token.transfer( tracetoMultisig, amount );
    }
}
