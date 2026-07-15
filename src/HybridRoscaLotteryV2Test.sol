// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./HybridRoscaLotteryV2.sol";

/**
 * @title HybridRoscaLotteryV2Test
 * @notice Test version with lower POOL_TARGET (10 USDT instead of 1,000,000)
 *         for quick draw testing on Sepolia.
 */
contract HybridRoscaLotteryV2Test is HybridRoscaLotteryV2 {
    // Override POOL_TARGET to 10 USDT for testing
    function POOL_TARGET() public pure override returns (uint256) {
        return 10 * 10 ** 6; // 10 USDT
    }

    constructor(
        address _usdt,
        address _vrfCoordinator,
        bytes32 _vrfKeyHash,
        uint64  _vrfSubscriptionId,
        address _aavePool,
        address _aUsdt
    ) HybridRoscaLotteryV2(
        _usdt,
        _vrfCoordinator,
        _vrfKeyHash,
        _vrfSubscriptionId,
        _aavePool,
        _aUsdt
    ) {}
}
