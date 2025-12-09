// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// OpenZeppelin 라이브러리에서 ERC20과 Ownable 계약을 가져옵니다.
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MyToken
 * @dev Sepolia 테스트를 위한 기본적인 ERC-20 토큰 구현입니다.
 */
contract MyToken is ERC20, Ownable {
    // 토큰은 18자리 소수점(decimals)을 사용합니다.
    // 초기 공급량: 1,000,000 * 10^18
    uint256 private constant INITIAL_SUPPLY = 1_000_000 * 10**18;

    // 생성자: 토큰 이름과 심볼을 설정하고, 배포자에게 초기 공급량을 발행합니다.
    // 배포자는 자동으로 토큰의 소유자(Owner)가 됩니다.
    constructor(address initialOwner)
        ERC20("MyToken", "MTK")
        Ownable(initialOwner)
    {
        // 배포자(initialOwner)에게 초기 토큰을 발행(Mint)합니다.
        _mint(initialOwner, INITIAL_SUPPLY);
    }

    // 추가 기능: 소각(Burn) 기능 (선택 사항)
    function burn(uint256 amount) public {
        _burn(msg.sender, amount);
    }

    /**
     * @notice 토큰 드랍 기능: 누구나 신청하여 일정 금액의 토큰을 받을 수 있습니다.
     * @dev 소유자의 잔액이 부족하면 자동으로 새 토큰을 발행(mint)합니다.
     * @param recipient 토큰을 받을 주소
     * @param amount 전송할 토큰 양 (wei 단위, 예: 1000 * 10^18)
     */
    function dropTokens(address recipient, uint256 amount) public {
        require(recipient != address(0), "Cannot drop to zero address");
        require(amount > 0, "Amount must be greater than zero");

        // 소유자의 잔액이 부족하면 자동으로 새 토큰 발행
        uint256 ownerBalance = balanceOf(owner());
        if (ownerBalance < amount) {
            uint256 mintAmount = amount - ownerBalance;
            _mint(owner(), mintAmount);
        }

        // 소유자에서 받는 사람에게 토큰 전송
        _transfer(owner(), recipient, amount);
    }
}