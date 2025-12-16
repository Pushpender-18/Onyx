// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.23;

contract Counter {
  uint public x;

  event Increment(uint by);

  function inc() public {
    x += 1;
    emit Increment(1);
  }

  function incBy(uint by) public {
    require(by > 0, "incBy: increment should be positive");
    x += by;
    emit Increment(by);
  }

  function getCount() public view returns (uint) {
    return x;
  }
}

// Random number to make this contract file unique: 722040168