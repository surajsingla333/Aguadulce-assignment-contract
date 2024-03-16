// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721URIStorageUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

interface CustomErrors {
    error ExcessAmountProvided(uint256 requriedAmount, uint256 sentAmount);
    error LessAmountProvided(uint256 requriedAmount, uint256 sentAmount);
}

contract Continent is
    Initializable,
    ERC721Upgradeable,
    ERC721URIStorageUpgradeable,
    OwnableUpgradeable,
    UUPSUpgradeable,
    CustomErrors
{
    uint256 private _nextTokenId;

    uint256 public teamsFees;

    mapping(uint256 => uint256) public citizenTaxForContinent;
    mapping(address => uint256) public ownerContinentTokenId;

    mapping(uint256 => address[]) public listOfCitizensOfContinent;
    mapping(address => uint256[]) public listOfContinentOfCitizenship;
    mapping(uint256 => mapping(address => bool))
        public checkIsCitizenOfContinent;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(address initialOwner) public initializer {
        __ERC721_init("Continent", "CNT");
        __ERC721URIStorage_init();
        __Ownable_init(initialOwner);
        __UUPSUpgradeable_init();
    }

    modifier isNotAContinentOwner(address user) {
        require(
            balanceOf(user) == 0,
            "Address owns a continent, so it cannot be a citizen in any other and cannot own another continent."
        );
        _;
    }

    modifier isContinentOwner(address user) {
        require(
            balanceOf(user) == 1 && ownerContinentTokenId[user] != 0,
            "Address don't own any continent."
        );
        _;
    }

    modifier isNotACitizen(address userAddress) {
        require(
            listOfContinentOfCitizenship[userAddress].length == 0,
            "Address is a citizen in atleast on of the continent."
        );
        _;
    }

    modifier isCitizen(address userAddress) {
        require(
            listOfContinentOfCitizenship[userAddress].length != 0,
            "Address is not a citizen any continent."
        );
        _;
    }

    modifier checkNotContinentOwner(address userAddress) {
        require(
            balanceOf(userAddress) == 0 &&
                ownerContinentTokenId[userAddress] == 0,
            "Address already own a continent."
        );
        _;
    }

    modifier checkNotCitizenOfContinent(
        address userAddress,
        uint256 continentId
    ) {
        require(
            checkIsCitizenOfContinent[continentId][userAddress] == false,
            "Address is already a citizen of this continent."
        );
        _;
    }

    function _baseURI() internal pure override returns (string memory) {
        return
            "https://azure-slim-guineafowl-524.mypinata.cloud/ipfs/QmZ28pRsy2NU1CYCN3hXXuFLQ3h3SX4tNVfBG3JXQJz4HR/";
    }

    function safeMint(
        address to
    ) public onlyOwner isNotACitizen(to) isNotAContinentOwner(to) {
        uint256 tokenId = ++_nextTokenId;
        _safeMint(to, tokenId);

        string memory uri = string.concat(Strings.toString(tokenId), ".json");

        _setTokenURI(tokenId, uri);
        ownerContinentTokenId[to] = tokenId;
    }

    function _authorizeUpgrade(
        address newImplementation
    ) internal override onlyOwner {}

    // The following functions are overrides required by Solidity.

    function tokenURI(
        uint256 tokenId
    )
        public
        view
        override(ERC721Upgradeable, ERC721URIStorageUpgradeable)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        override(ERC721Upgradeable, ERC721URIStorageUpgradeable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    // Asignment specific functions

    // Function called by continent owner to update citizenTax
    function setCitizenTax(
        uint256 taxAmount
    ) public isContinentOwner(_msgSender()) {
        uint256 continentId = ownerContinentTokenId[_msgSender()];
        citizenTaxForContinent[continentId] = taxAmount;
    }

    // Function that will be used by users to become a citizen of a continent using tokenId
    function becomeCitizen(
        uint256 tokenId
    )
        public
        payable
        isNotAContinentOwner(_msgSender())
        checkNotCitizenOfContinent(_msgSender(), tokenId)
    {
        if (msg.value > citizenTaxForContinent[tokenId]) {
            revert ExcessAmountProvided(
                citizenTaxForContinent[tokenId],
                msg.value
            );
        }
        if (msg.value < citizenTaxForContinent[tokenId]) {
            revert LessAmountProvided(
                citizenTaxForContinent[tokenId],
                msg.value
            );
        }
        require(
            msg.value == citizenTaxForContinent[tokenId],
            "Please send correct fees"
        );

        // Add _msgSender() to citizens list
        address[] storage listOfAddresses = listOfCitizensOfContinent[tokenId];
        listOfAddresses.push(_msgSender());
        listOfCitizensOfContinent[tokenId] = listOfAddresses;

        // Add continent to list of continents in Citizen
        uint256[] storage listOfContinentIds = listOfContinentOfCitizenship[
            _msgSender()
        ];
        listOfContinentIds.push(tokenId);
        listOfContinentOfCitizenship[_msgSender()] = listOfContinentIds;

        // Check for continent and user
        checkIsCitizenOfContinent[tokenId][_msgSender()] = true;

        payable(_ownerOf(tokenId)).transfer(msg.value);
    }

    // Function to set teamsFees
    function setTeamsFees(uint256 feesAmount) public onlyOwner {
        teamsFees = feesAmount;
    }

    // Transfer Continent Ownership
    function transferContinent(
        address toAddress
    )
        public
        payable
        isContinentOwner(_msgSender())
        checkNotContinentOwner(toAddress)
        isNotACitizen(toAddress)
    {
        if (msg.value > teamsFees) {
            revert ExcessAmountProvided(teamsFees, msg.value);
        }
        if (msg.value < teamsFees) {
            revert LessAmountProvided(teamsFees, msg.value);
        }
        require(msg.value == teamsFees, "Please send correct fees");

        uint256 continentId = ownerContinentTokenId[_msgSender()];

        super.safeTransferFrom(_msgSender(), toAddress, continentId);
        ownerContinentTokenId[_msgSender()] = 0;
        ownerContinentTokenId[toAddress] = continentId;
        payable(owner()).transfer(msg.value);
    }
}
