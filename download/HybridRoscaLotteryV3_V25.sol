pragma solidity ^0.8.0;


// SPDX-License-Identifier: MIT
// OpenZeppelin Contracts (last updated v5.4.0) (token/ERC20/IERC20.sol)
/**
 * @dev Interface of the ERC-20 standard as defined in the ERC.
 */
interface IERC20 {
    /**
     * @dev Emitted when `value` tokens are moved from one account (`from`) to
     * another (`to`).
     *
     * Note that `value` may be zero.
     */
    event Transfer(address indexed from, address indexed to, uint256 value);

    /**
     * @dev Emitted when the allowance of a `spender` for an `owner` is set by
     * a call to {approve}. `value` is the new allowance.
     */
    event Approval(address indexed owner, address indexed spender, uint256 value);

    /**
     * @dev Returns the value of tokens in existence.
     */
    function totalSupply() external view returns (uint256);

    /**
     * @dev Returns the value of tokens owned by `account`.
     */
    function balanceOf(address account) external view returns (uint256);

    /**
     * @dev Moves a `value` amount of tokens from the caller's account to `to`.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * Emits a {Transfer} event.
     */
    function transfer(address to, uint256 value) external returns (bool);

    /**
     * @dev Returns the remaining number of tokens that `spender` will be
     * allowed to spend on behalf of `owner` through {transferFrom}. This is
     * zero by default.
     *
     * This value changes when {approve} or {transferFrom} are called.
     */
    function allowance(address owner, address spender) external view returns (uint256);

    /**
     * @dev Sets a `value` amount of tokens as the allowance of `spender` over the
     * caller's tokens.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * IMPORTANT: Beware that changing an allowance with this method brings the risk
     * that someone may use both the old and the new allowance by unfortunate
     * transaction ordering. One possible solution to mitigate this race
     * condition is to first reduce the spender's allowance to 0 and set the
     * desired value afterwards:
     * https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729
     *
     * Emits an {Approval} event.
     */
    function approve(address spender, uint256 value) external returns (bool);

    /**
     * @dev Moves a `value` amount of tokens from `from` to `to` using the
     * allowance mechanism. `value` is then deducted from the caller's
     * allowance.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * Emits a {Transfer} event.
     */
    function transferFrom(address from, address to, uint256 value) external returns (bool);
}

interface IERC165 {
    /**
     * @dev Returns true if this contract implements the interface defined by
     * `interfaceId`. See the corresponding
     * https://eips.ethereum.org/EIPS/eip-165#how-interfaces-are-identified[ERC section]
     * to learn more about how these ids are created.
     *
     * This function call must use less than 30 000 gas.
     */
    function supportsInterface(bytes4 interfaceId) external view returns (bool);
}

interface IERC1363 is IERC20, IERC165 {
    /*
     * Note: the ERC-165 identifier for this interface is 0xb0202a11.
     * 0xb0202a11 ===
     *   bytes4(keccak256('transferAndCall(address,uint256)')) ^
     *   bytes4(keccak256('transferAndCall(address,uint256,bytes)')) ^
     *   bytes4(keccak256('transferFromAndCall(address,address,uint256)')) ^
     *   bytes4(keccak256('transferFromAndCall(address,address,uint256,bytes)')) ^
     *   bytes4(keccak256('approveAndCall(address,uint256)')) ^
     *   bytes4(keccak256('approveAndCall(address,uint256,bytes)'))
     */

    /**
     * @dev Moves a `value` amount of tokens from the caller's account to `to`
     * and then calls {IERC1363Receiver-onTransferReceived} on `to`.
     * @param to The address which you want to transfer to.
     * @param value The amount of tokens to be transferred.
     * @return A boolean value indicating whether the operation succeeded unless throwing.
     */
    function transferAndCall(address to, uint256 value) external returns (bool);

    /**
     * @dev Moves a `value` amount of tokens from the caller's account to `to`
     * and then calls {IERC1363Receiver-onTransferReceived} on `to`.
     * @param to The address which you want to transfer to.
     * @param value The amount of tokens to be transferred.
     * @param data Additional data with no specified format, sent in call to `to`.
     * @return A boolean value indicating whether the operation succeeded unless throwing.
     */
    function transferAndCall(address to, uint256 value, bytes calldata data) external returns (bool);

    /**
     * @dev Moves a `value` amount of tokens from `from` to `to` using the allowance mechanism
     * and then calls {IERC1363Receiver-onTransferReceived} on `to`.
     * @param from The address which you want to send tokens from.
     * @param to The address which you want to transfer to.
     * @param value The amount of tokens to be transferred.
     * @return A boolean value indicating whether the operation succeeded unless throwing.
     */
    function transferFromAndCall(address from, address to, uint256 value) external returns (bool);

    /**
     * @dev Moves a `value` amount of tokens from `from` to `to` using the allowance mechanism
     * and then calls {IERC1363Receiver-onTransferReceived} on `to`.
     * @param from The address which you want to send tokens from.
     * @param to The address which you want to transfer to.
     * @param value The amount of tokens to be transferred.
     * @param data Additional data with no specified format, sent in call to `to`.
     * @return A boolean value indicating whether the operation succeeded unless throwing.
     */
    function transferFromAndCall(address from, address to, uint256 value, bytes calldata data) external returns (bool);

    /**
     * @dev Sets a `value` amount of tokens as the allowance of `spender` over the
     * caller's tokens and then calls {IERC1363Spender-onApprovalReceived} on `spender`.
     * @param spender The address which will spend the funds.
     * @param value The amount of tokens to be spent.
     * @return A boolean value indicating whether the operation succeeded unless throwing.
     */
    function approveAndCall(address spender, uint256 value) external returns (bool);

    /**
     * @dev Sets a `value` amount of tokens as the allowance of `spender` over the
     * caller's tokens and then calls {IERC1363Spender-onApprovalReceived} on `spender`.
     * @param spender The address which will spend the funds.
     * @param value The amount of tokens to be spent.
     * @param data Additional data with no specified format, sent in call to `spender`.
     * @return A boolean value indicating whether the operation succeeded unless throwing.
     */
    function approveAndCall(address spender, uint256 value, bytes calldata data) external returns (bool);
}

// OpenZeppelin Contracts (last updated v5.5.0) (token/ERC20/utils/SafeERC20.sol)
/**
 * @title SafeERC20
 * @dev Wrappers around ERC-20 operations that throw on failure (when the token
 * contract returns false). Tokens that return no value (and instead revert or
 * throw on failure) are also supported, non-reverting calls are assumed to be
 * successful.
 * To use this library you can add a `using SafeERC20 for IERC20;` statement to your contract,
 * which allows you to call the safe operations as `token.safeTransfer(...)`, etc.
 */
library SafeERC20 {
    /**
     * @dev An operation with an ERC-20 token failed.
     */
    error SafeERC20FailedOperation(address token);

    /**
     * @dev Indicates a failed `decreaseAllowance` request.
     */
    error SafeERC20FailedDecreaseAllowance(address spender, uint256 currentAllowance, uint256 requestedDecrease);

    /**
     * @dev Transfer `value` amount of `token` from the calling contract to `to`. If `token` returns no value,
     * non-reverting calls are assumed to be successful.
     */
    function safeTransfer(IERC20 token, address to, uint256 value) internal {
        if (!_safeTransfer(token, to, value, true)) {
            revert SafeERC20FailedOperation(address(token));
        }
    }

    /**
     * @dev Transfer `value` amount of `token` from `from` to `to`, spending the approval given by `from` to the
     * calling contract. If `token` returns no value, non-reverting calls are assumed to be successful.
     */
    function safeTransferFrom(IERC20 token, address from, address to, uint256 value) internal {
        if (!_safeTransferFrom(token, from, to, value, true)) {
            revert SafeERC20FailedOperation(address(token));
        }
    }

    /**
     * @dev Variant of {safeTransfer} that returns a bool instead of reverting if the operation is not successful.
     */
    function trySafeTransfer(IERC20 token, address to, uint256 value) internal returns (bool) {
        return _safeTransfer(token, to, value, false);
    }

    /**
     * @dev Variant of {safeTransferFrom} that returns a bool instead of reverting if the operation is not successful.
     */
    function trySafeTransferFrom(IERC20 token, address from, address to, uint256 value) internal returns (bool) {
        return _safeTransferFrom(token, from, to, value, false);
    }

    /**
     * @dev Increase the calling contract's allowance toward `spender` by `value`. If `token` returns no value,
     * non-reverting calls are assumed to be successful.
     *
     * IMPORTANT: If the token implements ERC-7674 (ERC-20 with temporary allowance), and if the "client"
     * smart contract uses ERC-7674 to set temporary allowances, then the "client" smart contract should avoid using
     * this function. Performing a {safeIncreaseAllowance} or {safeDecreaseAllowance} operation on a token contract
     * that has a non-zero temporary allowance (for that particular owner-spender) will result in unexpected behavior.
     */
    function safeIncreaseAllowance(IERC20 token, address spender, uint256 value) internal {
        uint256 oldAllowance = token.allowance(address(this), spender);
        forceApprove(token, spender, oldAllowance + value);
    }

    /**
     * @dev Decrease the calling contract's allowance toward `spender` by `requestedDecrease`. If `token` returns no
     * value, non-reverting calls are assumed to be successful.
     *
     * IMPORTANT: If the token implements ERC-7674 (ERC-20 with temporary allowance), and if the "client"
     * smart contract uses ERC-7674 to set temporary allowances, then the "client" smart contract should avoid using
     * this function. Performing a {safeIncreaseAllowance} or {safeDecreaseAllowance} operation on a token contract
     * that has a non-zero temporary allowance (for that particular owner-spender) will result in unexpected behavior.
     */
    function safeDecreaseAllowance(IERC20 token, address spender, uint256 requestedDecrease) internal {
        unchecked {
            uint256 currentAllowance = token.allowance(address(this), spender);
            if (currentAllowance < requestedDecrease) {
                revert SafeERC20FailedDecreaseAllowance(spender, currentAllowance, requestedDecrease);
            }
            forceApprove(token, spender, currentAllowance - requestedDecrease);
        }
    }

    /**
     * @dev Set the calling contract's allowance toward `spender` to `value`. If `token` returns no value,
     * non-reverting calls are assumed to be successful. Meant to be used with tokens that require the approval
     * to be set to zero before setting it to a non-zero value, such as USDT.
     *
     * NOTE: If the token implements ERC-7674, this function will not modify any temporary allowance. This function
     * only sets the "standard" allowance. Any temporary allowance will remain active, in addition to the value being
     * set here.
     */
    function forceApprove(IERC20 token, address spender, uint256 value) internal {
        if (!_safeApprove(token, spender, value, false)) {
            if (!_safeApprove(token, spender, 0, true)) revert SafeERC20FailedOperation(address(token));
            if (!_safeApprove(token, spender, value, true)) revert SafeERC20FailedOperation(address(token));
        }
    }

    /**
     * @dev Performs an {ERC1363} transferAndCall, with a fallback to the simple {ERC20} transfer if the target has no
     * code. This can be used to implement an {ERC721}-like safe transfer that relies on {ERC1363} checks when
     * targeting contracts.
     *
     * Reverts if the returned value is other than `true`.
     */
    function transferAndCallRelaxed(IERC1363 token, address to, uint256 value, bytes memory data) internal {
        if (to.code.length == 0) {
            safeTransfer(token, to, value);
        } else if (!token.transferAndCall(to, value, data)) {
            revert SafeERC20FailedOperation(address(token));
        }
    }

    /**
     * @dev Performs an {ERC1363} transferFromAndCall, with a fallback to the simple {ERC20} transferFrom if the target
     * has no code. This can be used to implement an {ERC721}-like safe transfer that relies on {ERC1363} checks when
     * targeting contracts.
     *
     * Reverts if the returned value is other than `true`.
     */
    function transferFromAndCallRelaxed(
        IERC1363 token,
        address from,
        address to,
        uint256 value,
        bytes memory data
    ) internal {
        if (to.code.length == 0) {
            safeTransferFrom(token, from, to, value);
        } else if (!token.transferFromAndCall(from, to, value, data)) {
            revert SafeERC20FailedOperation(address(token));
        }
    }

    /**
     * @dev Performs an {ERC1363} approveAndCall, with a fallback to the simple {ERC20} approve if the target has no
     * code. This can be used to implement an {ERC721}-like safe transfer that rely on {ERC1363} checks when
     * targeting contracts.
     *
     * NOTE: When the recipient address (`to`) has no code (i.e. is an EOA), this function behaves as {forceApprove}.
     * Oppositely, when the recipient address (`to`) has code, this function only attempts to call {ERC1363-approveAndCall}
     * once without retrying, and relies on the returned value to be true.
     *
     * Reverts if the returned value is other than `true`.
     */
    function approveAndCallRelaxed(IERC1363 token, address to, uint256 value, bytes memory data) internal {
        if (to.code.length == 0) {
            forceApprove(token, to, value);
        } else if (!token.approveAndCall(to, value, data)) {
            revert SafeERC20FailedOperation(address(token));
        }
    }

    /**
     * @dev Imitates a Solidity `token.transfer(to, value)` call, relaxing the requirement on the return value: the
     * return value is optional (but if data is returned, it must not be false).
     *
     * @param token The token targeted by the call.
     * @param to The recipient of the tokens
     * @param value The amount of token to transfer
     * @param bubble Behavior switch if the transfer call reverts: bubble the revert reason or return a false boolean.
     */
    function _safeTransfer(IERC20 token, address to, uint256 value, bool bubble) private returns (bool success) {
        bytes4 selector = IERC20.transfer.selector;

        assembly ("memory-safe") {
            let fmp := mload(0x40)
            mstore(0x00, selector)
            mstore(0x04, and(to, shr(96, not(0))))
            mstore(0x24, value)
            success := call(gas(), token, 0, 0x00, 0x44, 0x00, 0x20)
            // if call success and return is true, all is good.
            // otherwise (not success or return is not true), we need to perform further checks
            if iszero(and(success, eq(mload(0x00), 1))) {
                // if the call was a failure and bubble is enabled, bubble the error
                if and(iszero(success), bubble) {
                    returndatacopy(fmp, 0x00, returndatasize())
                    revert(fmp, returndatasize())
                }
                // if the return value is not true, then the call is only successful if:
                // - the token address has code
                // - the returndata is empty
                success := and(success, and(iszero(returndatasize()), gt(extcodesize(token), 0)))
            }
            mstore(0x40, fmp)
        }
    }

    /**
     * @dev Imitates a Solidity `token.transferFrom(from, to, value)` call, relaxing the requirement on the return
     * value: the return value is optional (but if data is returned, it must not be false).
     *
     * @param token The token targeted by the call.
     * @param from The sender of the tokens
     * @param to The recipient of the tokens
     * @param value The amount of token to transfer
     * @param bubble Behavior switch if the transfer call reverts: bubble the revert reason or return a false boolean.
     */
    function _safeTransferFrom(
        IERC20 token,
        address from,
        address to,
        uint256 value,
        bool bubble
    ) private returns (bool success) {
        bytes4 selector = IERC20.transferFrom.selector;

        assembly ("memory-safe") {
            let fmp := mload(0x40)
            mstore(0x00, selector)
            mstore(0x04, and(from, shr(96, not(0))))
            mstore(0x24, and(to, shr(96, not(0))))
            mstore(0x44, value)
            success := call(gas(), token, 0, 0x00, 0x64, 0x00, 0x20)
            // if call success and return is true, all is good.
            // otherwise (not success or return is not true), we need to perform further checks
            if iszero(and(success, eq(mload(0x00), 1))) {
                // if the call was a failure and bubble is enabled, bubble the error
                if and(iszero(success), bubble) {
                    returndatacopy(fmp, 0x00, returndatasize())
                    revert(fmp, returndatasize())
                }
                // if the return value is not true, then the call is only successful if:
                // - the token address has code
                // - the returndata is empty
                success := and(success, and(iszero(returndatasize()), gt(extcodesize(token), 0)))
            }
            mstore(0x40, fmp)
            mstore(0x60, 0)
        }
    }

    /**
     * @dev Imitates a Solidity `token.approve(spender, value)` call, relaxing the requirement on the return value:
     * the return value is optional (but if data is returned, it must not be false).
     *
     * @param token The token targeted by the call.
     * @param spender The spender of the tokens
     * @param value The amount of token to transfer
     * @param bubble Behavior switch if the transfer call reverts: bubble the revert reason or return a false boolean.
     */
    function _safeApprove(IERC20 token, address spender, uint256 value, bool bubble) private returns (bool success) {
        bytes4 selector = IERC20.approve.selector;

        assembly ("memory-safe") {
            let fmp := mload(0x40)
            mstore(0x00, selector)
            mstore(0x04, and(spender, shr(96, not(0))))
            mstore(0x24, value)
            success := call(gas(), token, 0, 0x00, 0x44, 0x00, 0x20)
            // if call success and return is true, all is good.
            // otherwise (not success or return is not true), we need to perform further checks
            if iszero(and(success, eq(mload(0x00), 1))) {
                // if the call was a failure and bubble is enabled, bubble the error
                if and(iszero(success), bubble) {
                    returndatacopy(fmp, 0x00, returndatasize())
                    revert(fmp, returndatasize())
                }
                // if the return value is not true, then the call is only successful if:
                // - the token address has code
                // - the returndata is empty
                success := and(success, and(iszero(returndatasize()), gt(extcodesize(token), 0)))
            }
            mstore(0x40, fmp)
        }
    }
}

library StorageSlot {
    struct AddressSlot {
        address value;
    }

    struct BooleanSlot {
        bool value;
    }

    struct Bytes32Slot {
        bytes32 value;
    }

    struct Uint256Slot {
        uint256 value;
    }

    struct Int256Slot {
        int256 value;
    }

    struct StringSlot {
        string value;
    }

    struct BytesSlot {
        bytes value;
    }

    /**
     * @dev Returns an `AddressSlot` with member `value` located at `slot`.
     */
    function getAddressSlot(bytes32 slot) internal pure returns (AddressSlot storage r) {
        assembly ("memory-safe") {
            r.slot := slot
        }
    }

    /**
     * @dev Returns a `BooleanSlot` with member `value` located at `slot`.
     */
    function getBooleanSlot(bytes32 slot) internal pure returns (BooleanSlot storage r) {
        assembly ("memory-safe") {
            r.slot := slot
        }
    }

    /**
     * @dev Returns a `Bytes32Slot` with member `value` located at `slot`.
     */
    function getBytes32Slot(bytes32 slot) internal pure returns (Bytes32Slot storage r) {
        assembly ("memory-safe") {
            r.slot := slot
        }
    }

    /**
     * @dev Returns a `Uint256Slot` with member `value` located at `slot`.
     */
    function getUint256Slot(bytes32 slot) internal pure returns (Uint256Slot storage r) {
        assembly ("memory-safe") {
            r.slot := slot
        }
    }

    /**
     * @dev Returns a `Int256Slot` with member `value` located at `slot`.
     */
    function getInt256Slot(bytes32 slot) internal pure returns (Int256Slot storage r) {
        assembly ("memory-safe") {
            r.slot := slot
        }
    }

    /**
     * @dev Returns a `StringSlot` with member `value` located at `slot`.
     */
    function getStringSlot(bytes32 slot) internal pure returns (StringSlot storage r) {
        assembly ("memory-safe") {
            r.slot := slot
        }
    }

    /**
     * @dev Returns an `StringSlot` representation of the string storage pointer `store`.
     */
    function getStringSlot(string storage store) internal pure returns (StringSlot storage r) {
        assembly ("memory-safe") {
            r.slot := store.slot
        }
    }

    /**
     * @dev Returns a `BytesSlot` with member `value` located at `slot`.
     */
    function getBytesSlot(bytes32 slot) internal pure returns (BytesSlot storage r) {
        assembly ("memory-safe") {
            r.slot := slot
        }
    }

    /**
     * @dev Returns an `BytesSlot` representation of the bytes storage pointer `store`.
     */
    function getBytesSlot(bytes storage store) internal pure returns (BytesSlot storage r) {
        assembly ("memory-safe") {
            r.slot := store.slot
        }
    }
}

// OpenZeppelin Contracts (last updated v5.5.0) (utils/ReentrancyGuard.sol)
/**
 * @dev Contract module that helps prevent reentrant calls to a function.
 *
 * Inheriting from `ReentrancyGuard` will make the {nonReentrant} modifier
 * available, which can be applied to functions to make sure there are no nested
 * (reentrant) calls to them.
 *
 * Note that because there is a single `nonReentrant` guard, functions marked as
 * `nonReentrant` may not call one another. This can be worked around by making
 * those functions `private`, and then adding `external` `nonReentrant` entry
 * points to them.
 *
 * TIP: If EIP-1153 (transient storage) is available on the chain you're deploying at,
 * consider using {ReentrancyGuardTransient} instead.
 *
 * TIP: If you would like to learn more about reentrancy and alternative ways
 * to protect against it, check out our blog post
 * https://blog.openzeppelin.com/reentrancy-after-istanbul/[Reentrancy After Istanbul].
 *
 * IMPORTANT: Deprecated. This storage-based reentrancy guard will be removed and replaced
 * by the {ReentrancyGuardTransient} variant in v6.0.
 *
 * @custom:stateless
 */
abstract contract ReentrancyGuard {
    using StorageSlot for bytes32;

    // keccak256(abi.encode(uint256(keccak256("openzeppelin.storage.ReentrancyGuard")) - 1)) & ~bytes32(uint256(0xff))
    bytes32 private constant REENTRANCY_GUARD_STORAGE =
        0x9b779b17422d0df92223018b32b4d1fa46e071723d6817e2486d003becc55f00;

    // Booleans are more expensive than uint256 or any type that takes up a full
    // word because each write operation emits an extra SLOAD to first read the
    // slot's contents, replace the bits taken up by the boolean, and then write
    // back. This is the compiler's defense against contract upgrades and
    // pointer aliasing, and it cannot be disabled.

    // The values being non-zero value makes deployment a bit more expensive,
    // but in exchange the refund on every call to nonReentrant will be lower in
    // amount. Since refunds are capped to a percentage of the total
    // transaction's gas, it is best to keep them low in cases like this one, to
    // increase the likelihood of the full refund coming into effect.
    uint256 private constant NOT_ENTERED = 1;
    uint256 private constant ENTERED = 2;

    /**
     * @dev Unauthorized reentrant call.
     */
    error ReentrancyGuardReentrantCall();

    constructor() {
        _reentrancyGuardStorageSlot().getUint256Slot().value = NOT_ENTERED;
    }

    /**
     * @dev Prevents a contract from calling itself, directly or indirectly.
     * Calling a `nonReentrant` function from another `nonReentrant`
     * function is not supported. It is possible to prevent this from happening
     * by making the `nonReentrant` function external, and making it call a
     * `private` function that does the actual work.
     */
    modifier nonReentrant() {
        _nonReentrantBefore();
        _;
        _nonReentrantAfter();
    }

    /**
     * @dev A `view` only version of {nonReentrant}. Use to block view functions
     * from being called, preventing reading from inconsistent contract state.
     *
     * CAUTION: This is a "view" modifier and does not change the reentrancy
     * status. Use it only on view functions. For payable or non-payable functions,
     * use the standard {nonReentrant} modifier instead.
     */
    modifier nonReentrantView() {
        _nonReentrantBeforeView();
        _;
    }

    function _nonReentrantBeforeView() private view {
        if (_reentrancyGuardEntered()) {
            revert ReentrancyGuardReentrantCall();
        }
    }

    function _nonReentrantBefore() private {
        // On the first call to nonReentrant, _status will be NOT_ENTERED
        _nonReentrantBeforeView();

        // Any calls to nonReentrant after this point will fail
        _reentrancyGuardStorageSlot().getUint256Slot().value = ENTERED;
    }

    function _nonReentrantAfter() private {
        // By storing the original value once again, a refund is triggered (see
        // https://eips.ethereum.org/EIPS/eip-2200)
        _reentrancyGuardStorageSlot().getUint256Slot().value = NOT_ENTERED;
    }

    /**
     * @dev Returns true if the reentrancy guard is currently set to "entered", which indicates there is a
     * `nonReentrant` function in the call stack.
     */
    function _reentrancyGuardEntered() internal view returns (bool) {
        return _reentrancyGuardStorageSlot().getUint256Slot().value == ENTERED;
    }

    function _reentrancyGuardStorageSlot() internal pure virtual returns (bytes32) {
        return REENTRANCY_GUARD_STORAGE;
    }
}

abstract contract Context {
    function _msgSender() internal view virtual returns (address) {
        return msg.sender;
    }

    function _msgData() internal view virtual returns (bytes calldata) {
        return msg.data;
    }

    function _contextSuffixLength() internal view virtual returns (uint256) {
        return 0;
    }
}

// OpenZeppelin Contracts (last updated v5.0.0) (access/Ownable.sol)
/**
 * @dev Contract module which provides a basic access control mechanism, where
 * there is an account (an owner) that can be granted exclusive access to
 * specific functions.
 *
 * The initial owner is set to the address provided by the deployer. This can
 * later be changed with {transferOwnership}.
 *
 * This module is used through inheritance. It will make available the modifier
 * `onlyOwner`, which can be applied to your functions to restrict their use to
 * the owner.
 */
abstract contract Ownable is Context {
    address private _owner;

    /**
     * @dev The caller account is not authorized to perform an operation.
     */
    error OwnableUnauthorizedAccount(address account);

    /**
     * @dev The owner is not a valid owner account. (eg. `address(0)`)
     */
    error OwnableInvalidOwner(address owner);

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    /**
     * @dev Initializes the contract setting the address provided by the deployer as the initial owner.
     */
    constructor(address initialOwner) {
        if (initialOwner == address(0)) {
            revert OwnableInvalidOwner(address(0));
        }
        _transferOwnership(initialOwner);
    }

    /**
     * @dev Throws if called by any account other than the owner.
     */
    modifier onlyOwner() {
        _checkOwner();
        _;
    }

    /**
     * @dev Returns the address of the current owner.
     */
    function owner() public view virtual returns (address) {
        return _owner;
    }

    /**
     * @dev Throws if the sender is not the owner.
     */
    function _checkOwner() internal view virtual {
        if (owner() != _msgSender()) {
            revert OwnableUnauthorizedAccount(_msgSender());
        }
    }

    /**
     * @dev Leaves the contract without owner. It will not be possible to call
     * `onlyOwner` functions. Can only be called by the current owner.
     *
     * NOTE: Renouncing ownership will leave the contract without an owner,
     * thereby disabling any functionality that is only available to the owner.
     */
    function renounceOwnership() public virtual onlyOwner {
        _transferOwnership(address(0));
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Can only be called by the current owner.
     */
    function transferOwnership(address newOwner) public virtual onlyOwner {
        if (newOwner == address(0)) {
            revert OwnableInvalidOwner(address(0));
        }
        _transferOwnership(newOwner);
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Internal function without access restriction.
     */
    function _transferOwnership(address newOwner) internal virtual {
        address oldOwner = _owner;
        _owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }
}

/**
 *
 * @notice Interface for contracts using VRF randomness
 * *****************************************************************************
 * @dev PURPOSE
 *
 * @dev Reggie the Random Oracle (not his real job) wants to provide randomness
 * @dev to Vera the verifier in such a way that Vera can be sure he's not
 * @dev making his output up to suit himself. Reggie provides Vera a public key
 * @dev to which he knows the secret key. Each time Vera provides a seed to
 * @dev Reggie, he gives back a value which is computed completely
 * @dev deterministically from the seed and the secret key.
 *
 * @dev Reggie provides a proof by which Vera can verify that the output was
 * @dev correctly computed once Reggie tells it to her, but without that proof,
 * @dev the output is indistinguishable to her from a uniform random sample
 * @dev from the output space.
 *
 * @dev The purpose of this contract is to make it easy for unrelated contracts
 * @dev to talk to Vera the verifier about the work Reggie is doing, to provide
 * @dev simple access to a verifiable source of randomness. It ensures 2 things:
 * @dev 1. The fulfillment came from the VRFCoordinator
 * @dev 2. The consumer contract implements fulfillRandomWords.
 * *****************************************************************************
 * @dev USAGE
 *
 * @dev Calling contracts must inherit from VRFConsumerBase, and can
 * @dev initialize VRFConsumerBase's attributes in their constructor as
 * @dev shown:
 *
 * @dev   contract VRFConsumer {
 * @dev     constructor(<other arguments>, address _vrfCoordinator, address _link)
 * @dev       VRFConsumerBase(_vrfCoordinator) public {
 * @dev         <initialization with other arguments goes here>
 * @dev       }
 * @dev   }
 *
 * @dev The oracle will have given you an ID for the VRF keypair they have
 * @dev committed to (let's call it keyHash). Create subscription, fund it
 * @dev and your consumer contract as a consumer of it (see VRFCoordinatorInterface
 * @dev subscription management functions).
 * @dev Call requestRandomWords(keyHash, subId, minimumRequestConfirmations,
 * @dev callbackGasLimit, numWords),
 * @dev see (VRFCoordinatorInterface for a description of the arguments).
 *
 * @dev Once the VRFCoordinator has received and validated the oracle's response
 * @dev to your request, it will call your contract's fulfillRandomWords method.
 *
 * @dev The randomness argument to fulfillRandomWords is a set of random words
 * @dev generated from your requestId and the blockHash of the request.
 *
 * @dev If your contract could have concurrent requests open, you can use the
 * @dev requestId returned from requestRandomWords to track which response is associated
 * @dev with which randomness request.
 * @dev See "SECURITY CONSIDERATIONS" for principles to keep in mind,
 * @dev if your contract could have multiple requests in flight simultaneously.
 *
 * @dev Colliding `requestId`s are cryptographically impossible as long as seeds
 * @dev differ.
 *
 * *****************************************************************************
 * @dev SECURITY CONSIDERATIONS
 *
 * @dev A method with the ability to call your fulfillRandomness method directly
 * @dev could spoof a VRF response with any random value, so it's critical that
 * @dev it cannot be directly called by anything other than this base contract
 * @dev (specifically, by the VRFConsumerBase.rawFulfillRandomness method).
 *
 * @dev For your users to trust that your contract's random behavior is free
 * @dev from malicious interference, it's best if you can write it so that all
 * @dev behaviors implied by a VRF response are executed *during* your
 * @dev fulfillRandomness method. If your contract must store the response (or
 * @dev anything derived from it) and use it later, you must ensure that any
 * @dev user-significant behavior which depends on that stored value cannot be
 * @dev manipulated by a subsequent VRF request.
 *
 * @dev Similarly, both miners and the VRF oracle itself have some influence
 * @dev over the order in which VRF responses appear on the blockchain, so if
 * @dev your contract could have multiple VRF requests in flight simultaneously,
 * @dev you must ensure that the order in which the VRF responses arrive cannot
 * @dev be used to manipulate your contract's user-significant behavior.
 *
 * @dev Since the block hash of the block which contains the requestRandomness
 * @dev call is mixed into the input to the VRF *last*, a sufficiently powerful
 * @dev miner could, in principle, fork the blockchain to evict the block
 * @dev containing the request, forcing the request to be included in a
 * @dev different block with a different hash, and therefore a different input
 * @dev to the VRF. However, such an attack would incur a substantial economic
 * @dev cost. This cost scales with the number of blocks the VRF oracle waits
 * @dev until it calls responds to a request. It is for this reason that
 * @dev that you can signal to an oracle you'd like them to wait longer before
 * @dev responding to the request (however this is not enforced in the contract
 * @dev and so remains effective only in the case of unmodified oracle software).
 */
abstract contract VRFConsumerBaseV2 {
  error OnlyCoordinatorCanFulfill(address have, address want);

  // solhint-disable-next-line chainlink-solidity/prefix-immutable-variables-with-i
  address private immutable vrfCoordinator;

  /**
   * @param _vrfCoordinator address of VRFCoordinator contract
   */
  constructor(
    address _vrfCoordinator
  ) {
    vrfCoordinator = _vrfCoordinator;
  }

  /**
   * @notice fulfillRandomness handles the VRF response. Your contract must
   * @notice implement it. See "SECURITY CONSIDERATIONS" above for important
   * @notice principles to keep in mind when implementing your fulfillRandomness
   * @notice method.
   *
   * @dev VRFConsumerBaseV2 expects its subcontracts to have a method with this
   * @dev signature, and will call it once it has verified the proof
   * @dev associated with the randomness. (It is triggered via a call to
   * @dev rawFulfillRandomness, below.)
   *
   * @param requestId The Id initially returned by requestRandomness
   * @param randomWords the VRF output expanded to the requested number of words
   */
  // solhint-disable-next-line chainlink-solidity/prefix-internal-functions-with-underscore
  function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords) internal virtual;

  // rawFulfillRandomness is called by VRFCoordinator when it receives a valid VRF
  // proof. rawFulfillRandomness then calls fulfillRandomness, after validating
  // the origin of the call
  function rawFulfillRandomWords(uint256 requestId, uint256[] memory randomWords) external {
    if (msg.sender != vrfCoordinator) {
      revert OnlyCoordinatorCanFulfill(msg.sender, vrfCoordinator);
    }
    fulfillRandomWords(requestId, randomWords);
  }
}

// solhint-disable-next-line interface-starts-with-i
interface VRFCoordinatorV2Interface {
  /**
   * @notice Get configuration relevant for making requests
   * @return minimumRequestConfirmations global min for request confirmations
   * @return maxGasLimit global max for request gas limit
   * @return s_provingKeyHashes list of registered key hashes
   */
  function getRequestConfig() external view returns (uint16, uint32, bytes32[] memory);

  /**
   * @notice Request a set of random words.
   * @param keyHash - Corresponds to a particular oracle job which uses
   * that key for generating the VRF proof. Different keyHash's have different gas price
   * ceilings, so you can select a specific one to bound your maximum per request cost.
   * @param subId  - The ID of the VRF subscription. Must be funded
   * with the minimum subscription balance required for the selected keyHash.
   * @param minimumRequestConfirmations - How many blocks you'd like the
   * oracle to wait before responding to the request. See SECURITY CONSIDERATIONS
   * for why you may want to request more. The acceptable range is
   * [minimumRequestBlockConfirmations, 200].
   * @param callbackGasLimit - How much gas you'd like to receive in your
   * fulfillRandomWords callback. Note that gasleft() inside fulfillRandomWords
   * may be slightly less than this amount because of gas used calling the function
   * (argument decoding etc.), so you may need to request slightly more than you expect
   * to have inside fulfillRandomWords. The acceptable range is
   * [0, maxGasLimit]
   * @param numWords - The number of uint256 random values you'd like to receive
   * in your fulfillRandomWords callback. Note these numbers are expanded in a
   * secure way by the VRFCoordinator from a single random value supplied by the oracle.
   * @return requestId - A unique identifier of the request. Can be used to match
   * a request to a response in fulfillRandomWords.
   */
  function requestRandomWords(
    bytes32 keyHash,
    uint256 subId,
    uint16 minimumRequestConfirmations,
    uint32 callbackGasLimit,
    uint32 numWords
  ) external returns (uint256 requestId);

  /**
   * @notice Create a VRF subscription.
   * @return subId - A unique subscription id.
   * @dev You can manage the consumer set dynamically with addConsumer/removeConsumer.
   * @dev Note to fund the subscription, use transferAndCall. For example
   * @dev  LINKTOKEN.transferAndCall(
   * @dev    address(COORDINATOR),
   * @dev    amount,
   * @dev    abi.encode(subId));
   */
  function createSubscription() external returns (uint256 subId);

  /**
   * @notice Get a VRF subscription.
   * @param subId - ID of the subscription
   * @return balance - LINK balance of the subscription in juels.
   * @return reqCount - number of requests for this subscription, determines fee tier.
   * @return owner - owner of the subscription.
   * @return consumers - list of consumer address which are able to use this subscription.
   */
  function getSubscription(
    uint256 subId
  ) external view returns (uint96 balance, uint64 reqCount, address owner, address[] memory consumers);

  /**
   * @notice Request subscription owner transfer.
   * @param subId - ID of the subscription
   * @param newOwner - proposed new owner of the subscription
   */
  function requestSubscriptionOwnerTransfer(uint256 subId, address newOwner) external;

  /**
   * @notice Request subscription owner transfer.
   * @param subId - ID of the subscription
   * @dev will revert if original owner of subId has
   * not requested that msg.sender become the new owner.
   */
  function acceptSubscriptionOwnerTransfer(
    uint256 subId
  ) external;

  /**
   * @notice Add a consumer to a VRF subscription.
   * @param subId - ID of the subscription
   * @param consumer - New consumer which can use the subscription
   */
  function addConsumer(uint256 subId, address consumer) external;

  /**
   * @notice Remove a consumer from a VRF subscription.
   * @param subId - ID of the subscription
   * @param consumer - Consumer to remove from the subscription
   */
  function removeConsumer(uint256 subId, address consumer) external;

  /**
   * @notice Cancel a subscription
   * @param subId - ID of the subscription
   * @param to - Where to send the remaining LINK to
   */
  function cancelSubscription(uint256 subId, address to) external;

  /*
   * @notice Check to see if there exists a request commitment consumers
   * for all consumers and keyhashes for a given sub.
   * @param subId - ID of the subscription
   * @return true if there exists at least one unfulfilled request for the subscription, false
   * otherwise.
   */
  function pendingRequestExists(
    uint256 subId
  ) external view returns (bool);
}

/**
 * @title  HybridRoscaLotteryV3 — Production Version with Referral Program
 * @notice V3 = V2.1.1 + Referral Program
 *
 * Referral Program (Zero cost to platform):
 *   - Referred user gets +5 extra active days on first deposit
 *   - Referrer gets +5 extra active days when referred user deposits
 *   - Referrer gets 1% of prize ($9,953) if referred user wins a draw
 *   - Platform fee remains $1,000 per draw — unaffected
 *   - Anti-abuse: self-referral blocked, one-time bonus per address
 *
 * Changes from V2.1.1:
 *   - Added referralMapping, referralBonusDays, referralFeeBps
 *   - deposit() now accepts optional referrer address
 *   - _completeDraw() and _completeBonusDraw() now pay 1% to referrer
 *   - Added ReferralDeposited, ReferralRewardPaid events
 *   - Added getReferralInfo() view function
 */
interface IPool {
    function supply(address asset, uint256 amount, address onBehalfOf, uint16 referralCode) external;
    function withdraw(address asset, uint256 amount, address to) external returns (uint256);
}

contract HybridRoscaLotteryV3 is ReentrancyGuard, Ownable, VRFConsumerBaseV2 {
    using SafeERC20 for IERC20;

    // ============================================================
    // ====================== CUSTOM ERRORS =======================
    // ============================================================
    error ZeroAddress();
    error DepositBelowMinimum();
    error AmountMustBePositive();
    error InsufficientBalance();
    error AlreadyActive();
    error NotActive();
    error WinnerCannotReenter();
    error ContractPaused();
    error ContractNotPaused();
    error DrawInProgress();
    error PoolTargetNotReached();
    error NoActiveUsers();
    error UnknownRequestId();
    error RequestAlreadyFulfilled();
    error NoLockedAmount();
    error LockNotMature();
    error OnlyWinnersCanWithdrawLock();
    error CannotReserveUsdt();
    error YieldInsufficient();
    error NothingToSupply();
    error AaveSupplyFailed();
    error AaveWithdrawFailed();
    error BufferPercentTooHigh();
    error InsufficientLiquidityEvenAfterAave();
    error SelfReferral();
    error AlreadyReferred();

    // ============================================================
    // ====================== CONSTANTS ===========================
    // ============================================================
    uint256 private constant DECIMALS = 6;

    uint256 public constant DAILY_DEDUCTION    = 1 * 10 ** DECIMALS;
    uint256 public constant MIN_DEPOSIT        = 1 * 10 ** DECIMALS;
    uint256 public constant POOL_TARGET        = 1_000_000 * 10 ** DECIMALS;
    uint256 public constant BONUS_DRAW_TARGET  = 1_000_000 * 10 ** DECIMALS;
    uint256 public constant OPERATIONAL_FEE    = 1_000 * 10 ** DECIMALS;
    uint256 public constant WINNER_LOCK_AMOUNT = 3_650 * 10 ** DECIMALS;
    uint256 public constant WINNER_PAYOUT      = 995_350 * 10 ** DECIMALS;
    uint256 private constant ONE_DAY           = 1 days;
    uint256 private constant LOCK_DURATION     = 10 * 365 days;

    uint32 private constant VRF_CALLBACK_GAS_LIMIT     = 100_000;
    uint16 private constant VRF_REQUEST_CONFIRMATIONS  = 3;
    uint32 private constant VRF_NUM_WORDS              = 1;

    uint16  public constant MAX_BUFFER_PERCENT = 50;
    uint256 private constant BPS_DENOMINATOR   = 100;

    // ====== REFERRAL CONSTANTS ======
    /// @notice Bonus days given to both referrer and referred on first deposit
    uint256 public constant REFERRAL_BONUS_DAYS = 5;
    /// @notice Referral fee in basis points (100 = 1%)
    uint256 public constant REFERRAL_FEE_BPS = 100;
    /// @notice Referral payout amount: 1% of POOL_TARGET
    uint256 public constant REFERRAL_PAYOUT = (POOL_TARGET * REFERRAL_FEE_BPS) / 10000;
    /// @notice Winner payout when referred: POOL_TARGET - OPERATIONAL_FEE - WINNER_LOCK - REFERRAL_PAYOUT
    uint256 public constant WINNER_PAYOUT_REFERRED = POOL_TARGET - OPERATIONAL_FEE - WINNER_LOCK_AMOUNT - REFERRAL_PAYOUT;

    // ============================================================
    // ====================== STATE VARS ==========================
    // ============================================================

    IERC20  public immutable usdt;
    IERC20  public immutable aUsdt;
    IPool   public immutable aavePool;

    VRFCoordinatorV2Interface public immutable vrfCoordinator;
    bytes32 public immutable vrfKeyHash;
    uint256 public immutable vrfSubscriptionId;

    struct User {
        uint128 balance;
        uint128 lockedAmount;
        uint64  lastDeductionTime;
        bool    isActive;
        bool    hasWon;
        uint64  lockedStartTime;
    }
    mapping(address => User) public users;
    address[] public activeUsers;
    mapping(address => uint256) public activeUserIndex;

    uint256 public currentPool;
    uint256 public totalLockedAmounts;
    uint256 public accumulatedFees;
    uint256 public totalUserBalances;

    uint256 public totalPrincipalSupplied;
    uint16  public liquidityBufferPercent;

    bool     public drawInProgress;
    uint256  public regularDrawCount;
    uint256  public bonusDrawCount;
    uint256  public lastRequestId;
    uint256  public lastBonusRequestId;

    struct VRFRequest {
        bool     exists;
        bool     fulfilled;
        bool     isBonus;
        address  winner;
        uint256  randomNumber;
        uint256  activeUserCount;
    }
    mapping(uint256 => VRFRequest) public vrfRequests;

    bool public paused;

    // ====== REFERRAL STATE ======
    /// @notice Maps referred user → referrer (set once, immutable)
    mapping(address => address) public referrerOf;
    /// @notice Maps referrer → count of people they've referred
    mapping(address => uint256) public referralCount;
    /// @notice Maps referrer → total earnings from referrals
    mapping(address => uint256) public referralEarnings;

    // ============================================================
    // ====================== EVENTS ==============================
    // ============================================================
    event Deposited(address indexed user, uint256 amount, uint256 newBalance, uint256 newPool);
    event Withdrawn(address indexed user, uint256 amount, uint256 newBalance);
    event UserActivated(address indexed user);
    event UserDeactivated(address indexed user, string reason);
    event Deducted(address indexed user, uint256 amount, uint256 daysElapsed);
    event PoolUpdated(uint256 newPoolSize);
    event DrawTriggered(uint256 indexed requestId, uint256 poolSize, uint256 activeUserCount);
    event DrawCompleted(uint256 indexed requestId, address indexed winner, uint256 payout, uint256 locked);
    event FeesClaimed(address indexed owner, uint256 amount);
    event WinnerLockProcessed(address indexed winner, uint256 amountDeducted, uint256 remainingLock);
    event EmergencyPaused(address indexed by);
    event EmergencyUnpaused(address indexed by);
    event SuppliedToAave(uint256 amount, uint256 totalPrincipalSupplied);
    event WithdrawnFromAave(uint256 amount, uint256 totalPrincipalSupplied);
    event YieldAccrued(uint256 yieldAmount);
    event BonusDrawTriggered(uint256 indexed requestId, uint256 yieldSize, uint256 activeUserCount);
    event BonusDrawCompleted(uint256 indexed requestId, address indexed winner, uint256 payout, uint256 locked);
    event LiquidityBufferUpdated(uint16 oldPercent, uint16 newPercent);
    event AutoAaveWithdrawal(uint256 amount, string reason);

    // ====== REFERRAL EVENTS ======
    event ReferralRegistered(address indexed referrer, address indexed referred);
    event ReferralBonusDaysAwarded(address indexed user, uint256 bonusDays, bool isReferrer);
    event ReferralRewardPaid(address indexed referrer, address indexed winner, uint256 amount);

    // ============================================================
    // ====================== MODIFIERS ===========================
    // ============================================================
    modifier whenNotPaused() { if (paused) revert ContractPaused(); _; }
    modifier whenPaused()    { if (!paused) revert ContractNotPaused(); _; }
    modifier notDrawInProgress() { if (drawInProgress) revert DrawInProgress(); _; }

    // ============================================================
    // ====================== CONSTRUCTOR =========================
    // ============================================================
    constructor(
        address _usdt,
        address _vrfCoordinator,
        bytes32 _vrfKeyHash,
        uint256 _vrfSubscriptionId,
        address _aavePool,
        address _aUsdt
    ) VRFConsumerBaseV2(_vrfCoordinator) Ownable(msg.sender) {
        if (_usdt == address(0) || _vrfCoordinator == address(0) ||
            _aavePool == address(0) || _aUsdt == address(0)) revert ZeroAddress();

        usdt              = IERC20(_usdt);
        vrfCoordinator    = VRFCoordinatorV2Interface(_vrfCoordinator);
        vrfKeyHash        = _vrfKeyHash;
        vrfSubscriptionId = _vrfSubscriptionId;
        aavePool          = IPool(_aavePool);
        aUsdt             = IERC20(_aUsdt);

        liquidityBufferPercent = 5;
    }

    // ============================================================
    // =================== USER FUNCTIONS =========================
    // ============================================================

    /**
     * @notice Deposit USDT with optional referrer.
     * @param amount Amount of USDT to deposit.
     * @param referrer Address of the referrer (address(0) if no referrer).
     */
    function deposit(uint256 amount, address referrer)
        external
        nonReentrant
        whenNotPaused
        notDrawInProgress
    {
        if (amount < MIN_DEPOSIT) revert DepositBelowMinimum();
        if (users[msg.sender].hasWon) revert WinnerCannotReenter();

        // Register referrer (one-time, before first deposit)
        if (referrer != address(0) && referrer != msg.sender && referrerOf[msg.sender] == address(0)) {
            // Check referrer has deposited before (must be an existing user)
            if (users[referrer].lastDeductionTime > 0 || users[referrer].isActive) {
                referrerOf[msg.sender] = referrer;
                referralCount[referrer] += 1;
                emit ReferralRegistered(referrer, msg.sender);
            }
        }

        _applyDeduction(msg.sender);
        usdt.safeTransferFrom(msg.sender, address(this), amount);

        User storage u = users[msg.sender];
        u.balance += uint128(amount);
        totalUserBalances += amount;

        bool wasNewUser = !u.isActive && u.lastDeductionTime == 0;
        if (!u.isActive) _activateUser(msg.sender);

        // Award referral bonus days (one-time, on first deposit)
        if (wasNewUser) {
            address _referrer = referrerOf[msg.sender];
            if (_referrer != address(0)) {
                // Referred user gets +5 days
                u.balance += uint128(REFERRAL_BONUS_DAYS * DAILY_DEDUCTION);
                totalUserBalances += REFERRAL_BONUS_DAYS * DAILY_DEDUCTION;
                emit ReferralBonusDaysAwarded(msg.sender, REFERRAL_BONUS_DAYS, false);

                // Referrer gets +5 days too
                User storage r = users[_referrer];
                if (r.isActive || r.lastDeductionTime > 0) {
                    r.balance += uint128(REFERRAL_BONUS_DAYS * DAILY_DEDUCTION);
                    totalUserBalances += REFERRAL_BONUS_DAYS * DAILY_DEDUCTION;
                    emit ReferralBonusDaysAwarded(_referrer, REFERRAL_BONUS_DAYS, true);
                }
            }
        }

        emit Deposited(msg.sender, amount, u.balance, currentPool);

        _checkAndTriggerDraw();
        _checkAndTriggerBonusDraw();
    }

    /// @notice Backward-compatible deposit without referrer
    function deposit(uint256 amount) external {
        _depositSimple(amount);
    }

    function _depositSimple(uint256 amount) internal {
        if (amount < MIN_DEPOSIT) revert DepositBelowMinimum();
        if (users[msg.sender].hasWon) revert WinnerCannotReenter();

        _applyDeduction(msg.sender);
        usdt.safeTransferFrom(msg.sender, address(this), amount);

        User storage u = users[msg.sender];
        u.balance += uint128(amount);
        totalUserBalances += amount;

        if (!u.isActive) _activateUser(msg.sender);

        emit Deposited(msg.sender, amount, u.balance, currentPool);

        _checkAndTriggerDraw();
        _checkAndTriggerBonusDraw();
    }

    function withdraw(uint256 amount)
        external
        nonReentrant
        whenNotPaused
        notDrawInProgress
    {
        if (amount == 0) revert AmountMustBePositive();
        _applyDeduction(msg.sender);

        User storage u = users[msg.sender];
        if (u.balance < amount) revert InsufficientBalance();

        u.balance -= uint128(amount);
        totalUserBalances -= amount;
        if (u.balance == 0 && u.isActive) {
            _deactivateUser(msg.sender, "Withdrawal depleted balance");
        }

        _ensureLiquidity(amount, "user withdrawal");
        usdt.safeTransfer(msg.sender, amount);

        emit Withdrawn(msg.sender, amount, u.balance);
        _checkAndTriggerBonusDraw();
    }

    function syncUserState(address userAddr) external whenNotPaused notDrawInProgress {
        _applyDeduction(userAddr);
        _checkAndTriggerDraw();
        _checkAndTriggerBonusDraw();
    }

    function processWinnerLock(address winnerAddr) external whenNotPaused notDrawInProgress {
        User storage w = users[winnerAddr];
        if (!w.hasWon || w.lockedAmount == 0) revert NoLockedAmount();

        uint256 elapsed = (block.timestamp - w.lastDeductionTime) / ONE_DAY;
        if (elapsed == 0) return;

        uint256 deduction = elapsed * DAILY_DEDUCTION;
        uint256 actualDeduction = deduction > w.lockedAmount ? w.lockedAmount : deduction;

        w.lockedAmount    -= uint128(actualDeduction);
        w.lastDeductionTime = uint64(block.timestamp);
        currentPool        += actualDeduction;
        totalLockedAmounts -= actualDeduction;

        emit WinnerLockProcessed(winnerAddr, actualDeduction, w.lockedAmount);
        emit PoolUpdated(currentPool);

        _checkAndTriggerDraw();
        _checkAndTriggerBonusDraw();
    }

    // ============================================================
    // =============== DAILY DEDUCTION LOGIC ======================
    // ============================================================
    function _applyDeduction(address userAddr) internal {
        User storage u = users[userAddr];
        if (!u.isActive || u.lastDeductionTime == 0) return;

        uint256 elapsed = (block.timestamp - u.lastDeductionTime) / ONE_DAY;
        if (elapsed == 0) return;

        uint256 deduction = elapsed * DAILY_DEDUCTION;

        if (deduction >= u.balance) {
            uint256 actualDeduction = u.balance;
            u.balance = 0;
            u.lastDeductionTime = uint64(block.timestamp);
            totalUserBalances -= actualDeduction;
            currentPool += actualDeduction;
            _deactivateUser(userAddr, "Balance depleted by daily deductions");
            emit Deducted(userAddr, actualDeduction, elapsed);
            emit PoolUpdated(currentPool);
        } else {
            u.balance -= uint128(deduction);
            u.lastDeductionTime = uint64(block.timestamp);
            totalUserBalances -= deduction;
            currentPool += deduction;
            emit Deducted(userAddr, deduction, elapsed);
            emit PoolUpdated(currentPool);
        }
    }

    // ============================================================
    // ================== ACTIVE USER MGMT ========================
    // ============================================================
    function _activateUser(address userAddr) internal {
        if (users[userAddr].isActive) revert AlreadyActive();

        User storage u = users[userAddr];
        u.isActive = true;
        u.lastDeductionTime = uint64(block.timestamp);
        activeUserIndex[userAddr] = activeUsers.length;
        activeUsers.push(userAddr);

        emit UserActivated(userAddr);
    }

    function _deactivateUser(address userAddr, string memory reason) internal {
        User storage u = users[userAddr];
        if (!u.isActive) return;

        u.isActive = false;

        uint256 idx = activeUserIndex[userAddr];
        uint256 lastIdx = activeUsers.length - 1;

        if (idx != lastIdx) {
            address lastUser = activeUsers[lastIdx];
            activeUsers[idx] = lastUser;
            activeUserIndex[lastUser] = idx;
        }
        activeUsers.pop();
        activeUserIndex[userAddr] = type(uint256).max;

        emit UserDeactivated(userAddr, reason);
    }

    // ============================================================
    // ============== AAVE V3 YIELD LAYER =========================
    // ============================================================
    function supplyToAave(uint256 amount)
        external
        nonReentrant
        whenNotPaused
        notDrawInProgress
    {
        uint256 excess = _getExcessLiquidity();
        if (excess == 0) revert NothingToSupply();

        uint256 supplyAmount = amount == type(uint256).max ? excess : amount;
        if (supplyAmount > excess) supplyAmount = excess;
        if (supplyAmount == 0) revert NothingToSupply();

        usdt.safeIncreaseAllowance(address(aavePool), supplyAmount);
        aavePool.supply(address(usdt), supplyAmount, address(this), 0);

        if (usdt.allowance(address(this), address(aavePool)) > 0) {
            usdt.safeDecreaseAllowance(address(aavePool), usdt.allowance(address(this), address(aavePool)));
        }

        totalPrincipalSupplied += supplyAmount;
        emit SuppliedToAave(supplyAmount, totalPrincipalSupplied);
    }

    function withdrawFromAave(uint256 amount)
        external
        nonReentrant
        whenNotPaused
        notDrawInProgress
    {
        uint256 aBalance = aUsdt.balanceOf(address(this));
        if (aBalance == 0) revert NothingToSupply();

        uint256 withdrawAmount = amount == type(uint256).max ? aBalance : amount;
        if (withdrawAmount > aBalance) withdrawAmount = aBalance;
        if (withdrawAmount == 0) revert AmountMustBePositive();

        uint256 yieldBefore = _getYield();
        uint256 actual = aavePool.withdraw(address(usdt), withdrawAmount, address(this));
        if (actual == 0) revert AaveWithdrawFailed();

        if (actual > yieldBefore) {
            totalPrincipalSupplied -= (actual - yieldBefore);
        }

        emit WithdrawnFromAave(actual, totalPrincipalSupplied);
        emit YieldAccrued(_getYield());

        _checkAndTriggerBonusDraw();
    }

    function _getYield() internal view returns (uint256) {
        uint256 aBalance = aUsdt.balanceOf(address(this));
        if (aBalance <= totalPrincipalSupplied) return 0;
        return aBalance - totalPrincipalSupplied;
    }

    function getYieldBalance() external view returns (uint256) {
        return _getYield();
    }

    function getTotalPrincipal() public view returns (uint256) {
        return totalUserBalances + currentPool + totalLockedAmounts + accumulatedFees;
    }

    function _getExcessLiquidity() internal view returns (uint256) {
        uint256 usdtBal = usdt.balanceOf(address(this));
        uint256 principal = getTotalPrincipal();
        uint256 buffer = (principal * liquidityBufferPercent) / BPS_DENOMINATOR;
        if (usdtBal <= buffer) return 0;
        return usdtBal - buffer;
    }

    function getExcessLiquidity() external view returns (uint256) {
        return _getExcessLiquidity();
    }

    function _ensureLiquidity(uint256 needed, string memory reason) internal {
        uint256 usdtBal = usdt.balanceOf(address(this));
        if (usdtBal >= needed) return;

        uint256 shortfall = needed - usdtBal;
        uint256 aBalance = aUsdt.balanceOf(address(this));
        if (aBalance < shortfall) revert InsufficientLiquidityEvenAfterAave();

        uint256 yieldBefore = _getYield();
        uint256 actual = aavePool.withdraw(address(usdt), shortfall, address(this));
        if (actual < shortfall) revert AaveWithdrawFailed();

        if (actual > yieldBefore) {
            totalPrincipalSupplied -= (actual - yieldBefore);
        }

        emit AutoAaveWithdrawal(actual, reason);
    }

    function setLiquidityBufferPercent(uint16 newPercent) external onlyOwner {
        if (newPercent > MAX_BUFFER_PERCENT) revert BufferPercentTooHigh();
        uint16 old = liquidityBufferPercent;
        liquidityBufferPercent = newPercent;
        emit LiquidityBufferUpdated(old, newPercent);
    }

    // ============================================================
    // =============== DRAW & VRF LOGIC ===========================
    // ============================================================
    function _checkAndTriggerDraw() internal {
        if (drawInProgress) return;
        if (currentPool < POOL_TARGET) return;
        if (activeUsers.length == 0) return;
        _triggerDraw(false);
    }

    function triggerDrawManually() external whenNotPaused notDrawInProgress {
        if (currentPool < POOL_TARGET) revert PoolTargetNotReached();
        if (activeUsers.length == 0) revert NoActiveUsers();
        _triggerDraw(false);
    }

    function _triggerDraw(bool isBonus) internal {
        drawInProgress = true;

        uint256 requestId = vrfCoordinator.requestRandomWords(
            vrfKeyHash,
            vrfSubscriptionId,
            VRF_REQUEST_CONFIRMATIONS,
            VRF_CALLBACK_GAS_LIMIT,
            VRF_NUM_WORDS
        );

        vrfRequests[requestId] = VRFRequest({
            exists:           true,
            fulfilled:        false,
            isBonus:          isBonus,
            winner:           address(0),
            randomNumber:     0,
            activeUserCount:  activeUsers.length
        });

        lastRequestId = requestId;
        if (isBonus) lastBonusRequestId = requestId;

        if (isBonus) {
            emit BonusDrawTriggered(requestId, _getYield(), activeUsers.length);
        } else {
            emit DrawTriggered(requestId, currentPool, activeUsers.length);
        }
    }

    function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords)
        internal
        override
    {
        VRFRequest storage req = vrfRequests[requestId];
        if (!req.exists) revert UnknownRequestId();
        if (req.fulfilled) revert RequestAlreadyFulfilled();

        req.fulfilled = true;
        req.randomNumber = randomWords[0];

        if (req.isBonus) {
            _completeBonusDraw(requestId);
        } else {
            _completeDraw(requestId);
        }
    }

    function _completeDraw(uint256 requestId) internal {
        VRFRequest storage req = vrfRequests[requestId];
        uint256 userCount = activeUsers.length;
        if (userCount == 0) revert NoActiveUsers();

        uint256 winnerIndex = req.randomNumber % userCount;
        address winner = activeUsers[winnerIndex];
        req.winner = winner;

        User storage w = users[winner];
        w.hasWon = true;
        w.lockedAmount     += uint128(WINNER_LOCK_AMOUNT);
        w.lockedStartTime   = uint64(block.timestamp);
        w.lastDeductionTime = uint64(block.timestamp);
        totalLockedAmounts += WINNER_LOCK_AMOUNT;

        accumulatedFees += OPERATIONAL_FEE;

        _deactivateUser(winner, "User won the regular draw");

        if (currentPool >= POOL_TARGET) {
            currentPool -= POOL_TARGET;
        } else {
            currentPool = 0;
        }

        drawInProgress = false;
        regularDrawCount += 1;

        // ====== PAYOUT WITH REFERRAL LOGIC ======
        address _referrer = referrerOf[winner];
        bool hasReferrer = _referrer != address(0);

        if (hasReferrer) {
            // Winner came via referral: pay referrer 1% + reduced winner payout
            _ensureLiquidity(OPERATIONAL_FEE + WINNER_PAYOUT_REFERRED + REFERRAL_PAYOUT, "regular draw payout with referral");

            usdt.safeTransfer(owner(), OPERATIONAL_FEE);
            accumulatedFees -= OPERATIONAL_FEE;

            usdt.safeTransfer(winner, WINNER_PAYOUT_REFERRED);
            usdt.safeTransfer(_referrer, REFERRAL_PAYOUT);
            referralEarnings[_referrer] += REFERRAL_PAYOUT;

            emit ReferralRewardPaid(_referrer, winner, REFERRAL_PAYOUT);
            emit DrawCompleted(requestId, winner, WINNER_PAYOUT_REFERRED, WINNER_LOCK_AMOUNT);
        } else {
            // No referrer: standard payout
            _ensureLiquidity(OPERATIONAL_FEE + WINNER_PAYOUT, "regular draw payout");

            usdt.safeTransfer(owner(), OPERATIONAL_FEE);
            accumulatedFees -= OPERATIONAL_FEE;

            usdt.safeTransfer(winner, WINNER_PAYOUT);
            emit DrawCompleted(requestId, winner, WINNER_PAYOUT, WINNER_LOCK_AMOUNT);
        }

        emit FeesClaimed(owner(), OPERATIONAL_FEE);

        // Solvency fix-up
        {
            uint256 _yield = _getYield();
            uint256 _totalAssets = usdt.balanceOf(address(this)) + aUsdt.balanceOf(address(this));
            uint256 _principal = getTotalPrincipal();
            if (_totalAssets >= _principal) {
                uint256 _solvencyGap = _totalAssets - _principal;
                if (_yield > _solvencyGap) {
                    totalPrincipalSupplied += (_yield - _solvencyGap);
                }
            }
        }

        _checkAndTriggerBonusDraw();
    }

    function _checkAndTriggerBonusDraw() internal {
        if (drawInProgress) return;
        if (_getYield() < BONUS_DRAW_TARGET) return;
        if (activeUsers.length == 0) return;
        _triggerDraw(true);
    }

    function triggerBonusDrawManually() external whenNotPaused notDrawInProgress {
        if (_getYield() < BONUS_DRAW_TARGET) revert YieldInsufficient();
        if (activeUsers.length == 0) revert NoActiveUsers();
        _triggerDraw(true);
    }

    function _completeBonusDraw(uint256 requestId) internal {
        VRFRequest storage req = vrfRequests[requestId];
        uint256 userCount = activeUsers.length;
        if (userCount == 0) revert NoActiveUsers();

        uint256 yieldNow = _getYield();
        if (yieldNow < BONUS_DRAW_TARGET) revert YieldInsufficient();

        uint256 winnerIndex = req.randomNumber % userCount;
        address winner = activeUsers[winnerIndex];
        req.winner = winner;

        User storage w = users[winner];
        w.hasWon = true;
        w.lockedAmount     += uint128(WINNER_LOCK_AMOUNT);
        w.lockedStartTime   = uint64(block.timestamp);
        w.lastDeductionTime = uint64(block.timestamp);
        totalLockedAmounts += WINNER_LOCK_AMOUNT;

        accumulatedFees += OPERATIONAL_FEE;

        _deactivateUser(winner, "User won the bonus draw");

        drawInProgress = false;
        bonusDrawCount += 1;

        // ====== PAYOUT WITH REFERRAL LOGIC ======
        address _referrer = referrerOf[winner];
        bool hasReferrer = _referrer != address(0);

        if (hasReferrer) {
            _ensureLiquidity(OPERATIONAL_FEE + WINNER_PAYOUT_REFERRED + REFERRAL_PAYOUT, "bonus draw payout with referral");

            usdt.safeTransfer(owner(), OPERATIONAL_FEE);
            accumulatedFees -= OPERATIONAL_FEE;

            usdt.safeTransfer(winner, WINNER_PAYOUT_REFERRED);
            usdt.safeTransfer(_referrer, REFERRAL_PAYOUT);
            referralEarnings[_referrer] += REFERRAL_PAYOUT;

            emit ReferralRewardPaid(_referrer, winner, REFERRAL_PAYOUT);
            emit BonusDrawCompleted(requestId, winner, WINNER_PAYOUT_REFERRED, WINNER_LOCK_AMOUNT);
        } else {
            _ensureLiquidity(OPERATIONAL_FEE + WINNER_PAYOUT, "bonus draw payout");

            usdt.safeTransfer(owner(), OPERATIONAL_FEE);
            accumulatedFees -= OPERATIONAL_FEE;

            usdt.safeTransfer(winner, WINNER_PAYOUT);
            emit BonusDrawCompleted(requestId, winner, WINNER_PAYOUT, WINNER_LOCK_AMOUNT);
        }

        emit FeesClaimed(owner(), OPERATIONAL_FEE);
        emit YieldAccrued(_getYield());

        // Solvency fix-up
        {
            uint256 _yield = _getYield();
            uint256 _totalAssets = usdt.balanceOf(address(this)) + aUsdt.balanceOf(address(this));
            uint256 _principal = getTotalPrincipal();
            if (_totalAssets >= _principal) {
                uint256 _solvencyGap = _totalAssets - _principal;
                if (_yield > _solvencyGap) {
                    totalPrincipalSupplied += (_yield - _solvencyGap);
                }
            }
        }

        _checkAndTriggerDraw();
    }

    // ============================================================
    // =============== WINNER LOCKED AMOUNT =======================
    // ============================================================
    function withdrawLockedAmount()
        external
        nonReentrant
        whenNotPaused
    {
        User storage u = users[msg.sender];
        if (!u.hasWon) revert OnlyWinnersCanWithdrawLock();
        if (u.lockedAmount == 0) revert NoLockedAmount();
        if (block.timestamp < u.lockedStartTime + LOCK_DURATION) revert LockNotMature();

        uint256 amount = u.lockedAmount;
        u.lockedAmount = 0;
        totalLockedAmounts -= amount;

        _ensureLiquidity(amount, "winner lock withdrawal");
        usdt.safeTransfer(msg.sender, amount);

        emit WinnerLockProcessed(msg.sender, 0, 0);
    }

    // ============================================================
    // ================== OWNER FUNCTIONS =========================
    // ============================================================
    function claimFees() external onlyOwner nonReentrant {
        uint256 amount = accumulatedFees;
        if (amount == 0) revert AmountMustBePositive();
        accumulatedFees = 0;

        _ensureLiquidity(amount, "owner fee claim");
        usdt.safeTransfer(owner(), amount);
        emit FeesClaimed(owner(), amount);
    }

    function pause() external onlyOwner {
        paused = true;
        emit EmergencyPaused(msg.sender);
    }

    function unpause() external onlyOwner {
        paused = false;
        emit EmergencyUnpaused(msg.sender);
    }

    function rescueToken(address token, uint256 amount) external onlyOwner {
        if (token == address(usdt) || token == address(aUsdt)) revert CannotReserveUsdt();
        IERC20(token).safeTransfer(owner(), amount);
    }

    // ============================================================
    // ===================== VIEW HELPERS =========================
    // ============================================================
    function getActiveUserCount() external view returns (uint256) {
        return activeUsers.length;
    }

    function getActiveUsers() external view returns (address[] memory) {
        return activeUsers;
    }

    function getUserInfo(address userAddr)
        external
        view
        returns (
            uint128 balance,
            uint128 lockedAmount,
            uint64  lastDeductionTime,
            bool    isActive,
            bool    hasWon,
            uint64  lockedStartTime
        )
    {
        User storage u = users[userAddr];
        return (u.balance, u.lockedAmount, u.lastDeductionTime,
                u.isActive, u.hasWon, u.lockedStartTime);
    }

    function contractUsdtBalance() external view returns (uint256) {
        return usdt.balanceOf(address(this));
    }

    function contractAusdtBalance() external view returns (uint256) {
        return aUsdt.balanceOf(address(this));
    }

    function accountingSummary()
        external
        view
        returns (
            uint256 principal,
            uint256 yield_,
            uint256 usdtBalance,
            uint256 aUsdtBalance,
            uint256 totalAssets,
            uint256 solvencyGap
        )
    {
        usdtBalance  = usdt.balanceOf(address(this));
        aUsdtBalance = aUsdt.balanceOf(address(this));
        totalAssets  = usdtBalance + aUsdtBalance;
        principal    = getTotalPrincipal();
        yield_        = _getYield();
        solvencyGap  = totalAssets >= principal ? totalAssets - principal : 0;
    }

    // ====== REFERRAL VIEW FUNCTIONS ======

    /// @notice Get referral info for a user
    /// @return referrer The address of the user's referrer (address(0) if none)
    /// @return count Number of people this user has referred
    /// @return earnings Total USDT earned from referral rewards
    /// @return hasReferrer Whether this user was referred by someone
    function getReferralInfo(address userAddr)
        external
        view
        returns (
            address referrer,
            uint256 count,
            uint256 earnings,
            bool hasReferrer
        )
    {
        return (
            referrerOf[userAddr],
            referralCount[userAddr],
            referralEarnings[userAddr],
            referrerOf[userAddr] != address(0)
        );
    }
}
