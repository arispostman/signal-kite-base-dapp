// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract SignalKite {
    struct Signal {
        address flyer;
        string title;
        string wind;
        string color;
        string note;
        uint256 createdAt;
    }

    uint256 public nextSignalId = 1;
    mapping(uint256 => Signal) private signals;

    event KiteRaised(uint256 indexed signalId, address indexed flyer, string title, string wind);

    function raiseKite(
        string calldata title,
        string calldata wind,
        string calldata color,
        string calldata note
    ) external returns (uint256 signalId) {
        bytes memory titleBytes = bytes(title);
        bytes memory windBytes = bytes(wind);
        bytes memory colorBytes = bytes(color);
        bytes memory noteBytes = bytes(note);

        require(titleBytes.length > 0 && titleBytes.length <= 48, "Invalid title");
        require(windBytes.length > 0 && windBytes.length <= 32, "Invalid wind");
        require(colorBytes.length > 0 && colorBytes.length <= 32, "Invalid color");
        require(noteBytes.length > 0 && noteBytes.length <= 140, "Invalid note");

        signalId = nextSignalId++;
        signals[signalId] = Signal({
            flyer: msg.sender,
            title: title,
            wind: wind,
            color: color,
            note: note,
            createdAt: block.timestamp
        });

        emit KiteRaised(signalId, msg.sender, title, wind);
    }

    function getSignal(uint256 signalId)
        external
        view
        returns (
            address flyer,
            string memory title,
            string memory wind,
            string memory color,
            string memory note,
            uint256 createdAt
        )
    {
        Signal storage signal = signals[signalId];
        return (signal.flyer, signal.title, signal.wind, signal.color, signal.note, signal.createdAt);
    }
}
