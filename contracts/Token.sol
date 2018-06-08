contract Token{
    function transferFrom(address from, address to, uint value) public returns (bool){}
    function transfer(address to, uint value) public returns (bool){}
    function approve(address spender, uint256 value) public returns (bool){}
}