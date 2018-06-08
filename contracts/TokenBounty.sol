pragma solidity ^0.4.24;
import "./Ownable.sol";
import "./Token.sol";
import "./SafeMath.sol";

contract TokenBounty is Ownable{
    using SafeMath for uint256;
    uint256 public numDrops;
    uint256 public dropAmount;

    constructor( address dropper ) public {
        transferOwnership(dropper);
    }

    event TokenDrop( address receiver, uint256 amount );
    event ContractAddressFoundBounty(address accAllocated, uint256 amount);

    function bounty( Token _token, address _sender, address[] _recipients, uint[] _amount ) onlyOwner public {
        uint256 len = _recipients.length <= _amount.length ? _recipients.length : _amount.length;
        uint256 sum = 0;
        uint256 size = 0;
        for( uint8 i = 0 ; i < len ; i++ ) {
            uint codeLength;
            address _recipient;
            _recipient = _recipients[i];
            assembly {
                // Retrieve the size of the code on target address, this needs assembly .
                codeLength := extcodesize(_recipient)
            }
            if(codeLength>0) {
                assert( _token.approve(_recipients[i], _amount[i] ) );
                ContractAddressFoundBounty(_recipients[i], _amount[i] );
            } else {
                assert( _token.transferFrom( _sender, _recipients[i], _amount[i] ) );
            }
                
            sum =  sum.add(_amount[i]);
            size = size.add(1);
            emit TokenDrop( _recipients[i], _amount[i] );
        }
        numDrops = numDrops.add(size);
        dropAmount = dropAmount.add(sum);
    }

    function emergencyERC20Drain( Token _token, uint256 amount ) public {
        address tracetoMultisig = 0x146f2Fba9EBa1b72d5162a56e3E5da6C0f4808Cc;
        _token.transfer(tracetoMultisig, amount);
    }
}
