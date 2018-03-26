pragma solidity ^0.4.18;

import "./BurnableToken.sol";
import "./PausableToken.sol";
import "./SafeMath.sol";

contract PAXToken is BurnableToken, PausableToken {

    using SafeMath for uint;

    string public constant name = "Pax Token";

    string public constant symbol = "PAX";

    uint32 public constant decimals = 10;

    uint256 public constant INITIAL_SUPPLY = 999500000 * (10 ** uint256(decimals));

    /**
     * @dev Constructor that gives msg.sender all of existing tokens.
     * @param _isPause bool (pause === true)
     */
    function PAXToken(bool _isPause) public {
        paused = _isPause;
        totalSupply = INITIAL_SUPPLY;
        balances[msg.sender] = INITIAL_SUPPLY;
        emit Transfer(0x0, msg.sender, balances[msg.sender]);

    }

    /**
    * @dev transfer contracts for a specified address, despite the pause state
    * @param _to The address to transfer to.
    * @param _value The amount to be transferred.
    */
    function ownersTransfer(address _to, uint256 _value) public onlyOwner returns (bool) {
        return BasicToken.transfer(_to, _value);
    }
}
