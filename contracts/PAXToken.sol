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
     * @param _company address reserve tokens (300000000)
     * @param _founders_1 address reserve tokens (300000000)
     * @param _founders_2 address reserve tokens (50000000)
     * @param _isPause bool (pause === true)
     */
    function PAXToken(address _company, address _founders_1, address _founders_2, bool _isPause) public {
        require(_company != address(0) && _founders_1 != address(0) && _founders_2 != address(0));
        paused = _isPause;
        totalSupply = INITIAL_SUPPLY;
        balances[msg.sender] = 349500000 * (10 ** uint256(decimals));
        balances[_company] = 300000000 * (10 ** uint256(decimals));
        balances[_founders_1] = 300000000 * (10 ** uint256(decimals));
        balances[_founders_2] = 50000000 * (10 ** uint256(decimals));
        Transfer(0x0, msg.sender, balances[msg.sender]);
        Transfer(0x0, _company, balances[_company]);
        Transfer(0x0, _founders_1, balances[_founders_1]);
        Transfer(0x0, _founders_2, balances[_founders_2]);

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
