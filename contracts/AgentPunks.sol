// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721URIStorage} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

interface IAgentIdRegistry {
    function hasAgentId(address account) external view returns (bool);
}

contract AgentPunks is ERC721URIStorage, Ownable, ReentrancyGuard {
    uint256 public constant MAX_SUPPLY = 5_000;
    uint256 public constant FREE_MINT_SUPPLY = 1_000;
    uint256 public constant MINT_PRICE = 0.001 ether;
    uint256 public constant MAX_MINT_PER_TRANSACTION = 10;
    uint256 public constant MARKET_FEE_BPS = 250;
    uint256 public constant BPS_DENOMINATOR = 10_000;

    enum Rarity {
        Common,
        Uncommon,
        Rare,
        Epic,
        Legendary,
        Mythic
    }

    struct Listing {
        address seller;
        uint256 price;
        uint256 expiresAt;
    }

    struct Offer {
        address bidder;
        uint256 amount;
    }

    IAgentIdRegistry public agentIdRegistry;
    address payable public mintFeeRecipient;
    address payable public protocolFeeRecipient;
    uint256 public totalMinted;
    uint256 public freeMinted;
    uint256 public offerEscrowed;
    string private baseTokenURI;

    mapping(address => bool) public freeMintClaimed;
    mapping(uint256 => Rarity) public rarityOf;
    mapping(uint256 => Listing) public listings;
    mapping(uint256 => Offer) public offers;

    event AgentIdRegistryUpdated(address indexed registry);
    event MintFeeRecipientUpdated(address indexed recipient);
    event ProtocolFeeRecipientUpdated(address indexed recipient);
    event BaseURIUpdated(string baseURI);
    event Minted(address indexed minter, uint256 indexed tokenId, bool freeMint, Rarity rarity);
    event Listed(address indexed seller, uint256 indexed tokenId, uint256 price);
    event ListingEdited(address indexed seller, uint256 indexed tokenId, uint256 price);
    event ListingCancelled(address indexed seller, uint256 indexed tokenId);
    event Sold(address indexed seller, address indexed buyer, uint256 indexed tokenId, uint256 price);
    event OfferMade(address indexed bidder, uint256 indexed tokenId, uint256 amount);
    event OfferCancelled(address indexed bidder, uint256 indexed tokenId, uint256 amount);
    event OfferAccepted(address indexed seller, address indexed bidder, uint256 indexed tokenId, uint256 amount);

    error InvalidQuantity();
    error MintQuantityTooHigh();
    error SoldOut();
    error WrongPayment(uint256 expected, uint256 received);
    error AgentIdRegistryMissing();
    error AgentIdRequired();
    error NotTokenOwner();
    error InvalidPrice();
    error TokenListed();
    error TokenNotListed();
    error InsufficientOffer();
    error OfferUnavailable();
    error InvalidDuration();
    error ListingExpired();
    error InvalidRecipient();
    error InsufficientWithdrawableBalance();

    constructor(
        address initialOwner,
        address registry,
        string memory initialBaseURI,
        address payable initialMintFeeRecipient,
        address payable initialProtocolFeeRecipient
    )
        ERC721("Agent Punks", "APUNK")
        Ownable(initialOwner)
    {
        if (initialMintFeeRecipient == address(0) || initialProtocolFeeRecipient == address(0)) revert InvalidRecipient();
        agentIdRegistry = IAgentIdRegistry(registry);
        baseTokenURI = initialBaseURI;
        mintFeeRecipient = initialMintFeeRecipient;
        protocolFeeRecipient = initialProtocolFeeRecipient;
    }

    function mint(uint256 quantity) external payable nonReentrant {
        if (quantity == 0) revert InvalidQuantity();
        if (quantity > MAX_MINT_PER_TRANSACTION) revert MintQuantityTooHigh();
        if (totalMinted + quantity > MAX_SUPPLY) revert SoldOut();

        if (!_hasAgentId(msg.sender)) revert AgentIdRequired();
        bool freeMint = !freeMintClaimed[msg.sender] && freeMinted < FREE_MINT_SUPPLY;
        uint256 paidQuantity = freeMint ? quantity - 1 : quantity;
        uint256 requiredValue = paidQuantity * MINT_PRICE;
        if (msg.value != requiredValue) revert WrongPayment(requiredValue, msg.value);
        if (requiredValue > 0) _sendValue(mintFeeRecipient, requiredValue);

        if (freeMint) {
            freeMintClaimed[msg.sender] = true;
            freeMinted++;
        }
        for (uint256 i = 0; i < quantity; i++) {
            totalMinted++;
            uint256 tokenId = totalMinted;
            Rarity rarity = _rollRarity(tokenId, msg.sender);
            rarityOf[tokenId] = rarity;
            _safeMint(msg.sender, tokenId);
            emit Minted(msg.sender, tokenId, freeMint && i == 0, rarity);
        }
    }

    function list(uint256 tokenId, uint256 price, uint256 duration) external nonReentrant {
        if (ownerOf(tokenId) != msg.sender) revert NotTokenOwner();
        if (price == 0) revert InvalidPrice();
        if (duration == 0) revert InvalidDuration();
        if (listings[tokenId].seller != address(0)) revert TokenListed();
        listings[tokenId] = Listing(msg.sender, price, block.timestamp + duration);
        _transfer(msg.sender, address(this), tokenId);
        emit Listed(msg.sender, tokenId, price);
    }

    function editListing(uint256 tokenId, uint256 newPrice, uint256 duration) external {
        Listing storage listing = listings[tokenId];
        if (listing.seller != msg.sender) revert NotTokenOwner();
        if (newPrice == 0) revert InvalidPrice();
        if (duration == 0) revert InvalidDuration();
        listing.price = newPrice;
        listing.expiresAt = block.timestamp + duration;
        emit ListingEdited(msg.sender, tokenId, newPrice);
    }

    function cancelListing(uint256 tokenId) external nonReentrant {
        Listing memory listing = listings[tokenId];
        if (listing.seller != msg.sender) revert NotTokenOwner();
        delete listings[tokenId];
        _safeTransfer(address(this), msg.sender, tokenId, "");
        emit ListingCancelled(msg.sender, tokenId);
    }

    function buy(uint256 tokenId) external payable nonReentrant {
        Listing memory listing = listings[tokenId];
        if (listing.seller == address(0)) revert TokenNotListed();
        if (block.timestamp >= listing.expiresAt) revert ListingExpired();
        if (msg.value != listing.price) revert WrongPayment(listing.price, msg.value);
        delete listings[tokenId];

        uint256 fee = (msg.value * MARKET_FEE_BPS) / BPS_DENOMINATOR;
        _safeTransfer(address(this), msg.sender, tokenId, "");
        _sendValue(payable(listing.seller), msg.value - fee);
        _sendValue(protocolFeeRecipient, fee);
        emit Sold(listing.seller, msg.sender, tokenId, msg.value);
    }

    function expireListing(uint256 tokenId) external nonReentrant {
        Listing memory listing = listings[tokenId];
        if (listing.seller == address(0)) revert TokenNotListed();
        if (block.timestamp < listing.expiresAt) revert ListingExpired();
        delete listings[tokenId];
        _safeTransfer(address(this), listing.seller, tokenId, "");
        emit ListingCancelled(listing.seller, tokenId);
    }

    function makeOffer(uint256 tokenId) external payable nonReentrant {
        if (listings[tokenId].seller != address(0)) revert TokenListed();
        if (msg.value == 0 || msg.value <= offers[tokenId].amount) revert InsufficientOffer();

        Offer memory previous = offers[tokenId];
        offers[tokenId] = Offer(msg.sender, msg.value);
        offerEscrowed = offerEscrowed - previous.amount + msg.value;
        if (previous.bidder != address(0)) _sendValue(payable(previous.bidder), previous.amount);
        emit OfferMade(msg.sender, tokenId, msg.value);
    }

    function cancelOffer(uint256 tokenId) external nonReentrant {
        Offer memory offer = offers[tokenId];
        if (offer.bidder != msg.sender) revert OfferUnavailable();
        delete offers[tokenId];
        offerEscrowed -= offer.amount;
        _sendValue(payable(msg.sender), offer.amount);
        emit OfferCancelled(msg.sender, tokenId, offer.amount);
    }

    function acceptOffer(uint256 tokenId) external nonReentrant {
        if (listings[tokenId].seller != address(0)) revert TokenListed();
        if (ownerOf(tokenId) != msg.sender) revert NotTokenOwner();
        Offer memory offer = offers[tokenId];
        if (offer.bidder == address(0)) revert OfferUnavailable();
        delete offers[tokenId];
        offerEscrowed -= offer.amount;
        uint256 fee = (offer.amount * MARKET_FEE_BPS) / BPS_DENOMINATOR;
        _safeTransfer(msg.sender, offer.bidder, tokenId, "");
        _sendValue(payable(msg.sender), offer.amount - fee);
        _sendValue(protocolFeeRecipient, fee);
        emit OfferAccepted(msg.sender, offer.bidder, tokenId, offer.amount);
    }

    function setAgentIdRegistry(address registry) external onlyOwner {
        agentIdRegistry = IAgentIdRegistry(registry);
        emit AgentIdRegistryUpdated(registry);
    }

    function setMintFeeRecipient(address payable recipient) external onlyOwner {
        if (recipient == address(0)) revert InvalidRecipient();
        mintFeeRecipient = recipient;
        emit MintFeeRecipientUpdated(recipient);
    }

    function setProtocolFeeRecipient(address payable recipient) external onlyOwner {
        if (recipient == address(0)) revert InvalidRecipient();
        protocolFeeRecipient = recipient;
        emit ProtocolFeeRecipientUpdated(recipient);
    }

    function setBaseURI(string calldata newBaseURI) external onlyOwner {
        baseTokenURI = newBaseURI;
        emit BaseURIUpdated(newBaseURI);
    }

    function withdraw(address payable recipient) external onlyOwner nonReentrant {
        uint256 withdrawable = address(this).balance - offerEscrowed;
        if (withdrawable == 0) revert InsufficientWithdrawableBalance();
        _sendValue(recipient, withdrawable);
    }

    function hasAgentId(address account) public view returns (bool) {
        return _hasAgentId(account);
    }

    function _hasAgentId(address account) internal view returns (bool) {
        if (address(agentIdRegistry) == address(0)) revert AgentIdRegistryMissing();
        return agentIdRegistry.hasAgentId(account);
    }

    function _rollRarity(uint256 tokenId, address minter) internal view returns (Rarity) {
        uint256 roll = uint256(keccak256(abi.encode(block.prevrandao, block.timestamp, tokenId, minter))) % 10000;
        if (roll < 5) return Rarity.Mythic;
        if (roll < 55) return Rarity.Legendary;
        if (roll < 255) return Rarity.Epic;
        if (roll < 1055) return Rarity.Rare;
        if (roll < 3055) return Rarity.Uncommon;
        return Rarity.Common;
    }

    function _baseURI() internal view override returns (string memory) {
        return baseTokenURI;
    }

    function _sendValue(address payable recipient, uint256 amount) private {
        (bool success,) = recipient.call{value: amount}("");
        require(success, "ETH_TRANSFER_FAILED");
    }
}