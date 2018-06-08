pragma solidity ^0.4.24;
import "./Ownable.sol";
import "./Token.sol";
import "./SafeMath.sol";

contract TokenAirdrop is Ownable{
    using SafeMath for uint256;
    uint256 public numDrops;
    uint256 public dropAmount;

    constructor( address dropper ) public {
        transferOwnership(dropper);
    }

    event TokenDrop( address receiver, uint256 amount );
    event ContractAddressFoundAirdrop(address accAllocated, uint256 amount);

    function airdrop( Token _token, address _sender, address[] _recipients, uint256 _amount ) payable onlyOwner public {
        for( uint8 i = 0 ; i < _recipients.length ; i++ ) {
            uint codeLength;
            address _recipient;
            _recipient = _recipients[i];
            assembly {
                // Retrieve the size of the code on target address, this needs assembly .
                codeLength := extcodesize(_recipient)
            }
            if(codeLength>0) {
                assert( _token.approve(_recipient, _amount ) );
                ContractAddressFoundAirdrop(_recipient, _amount );
            } else {
                assert( _token.transferFrom( _sender, _recipient, _amount ) );
            }
                
            emit TokenDrop( _recipient, _amount );
        }

        numDrops = numDrops.add(_recipients.length);
        dropAmount = dropAmount.add(_recipients.length.mul(_amount));
    }

    function emergencyERC20Drain( Token _token, uint256 amount ) public {
        address tracetoMultisig = 0x146f2Fba9EBa1b72d5162a56e3E5da6C0f4808Cc;
        _token.transfer(tracetoMultisig, amount);
    }
}