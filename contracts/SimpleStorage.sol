pragma solidity 0.5.11;

contract SimpleStorage {

    mapping (bytes32 => bytes32) public docs;
    mapping (address => bool) public owners;

    bytes32[] public docIdLog;
    bytes32[] public docHashLog;

    modifier onlyOwnerSpecial {
        require (owners[msg.sender]);
        _;
    }

    constructor () public {
        owners[msg.sender] = true;
    }

    function updateDocs (bytes32 _docId, bytes32 _docHash) public onlyOwnerSpecial {
        docs[_docId] = _docHash;
        docIdLog.push(_docId);
        docHashLog.push(_docHash);
    }

    function addOwner (address _newOwner) public onlyOwnerSpecial {
        owners[_newOwner] = true;
    }

    function getDocIdLogLength () public view returns(uint256) {
        return(docIdLog.length);
    }
}
