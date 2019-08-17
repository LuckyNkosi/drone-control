//DRONE
const { DroneConnection, CommandParser } = require("minidrone-js");

const parser = new CommandParser();
const drone = new DroneConnection();
const droneSpeed = 80;
/*
 * Commands are easily found by reading the xml specification
 * https://github.com/Parrot-Developers/arsdk-xml/blob/master/xml/
 */
const flatTrim = parser.getCommand("minidrone", "Piloting", "FlatTrim");
const flip = parser.getCommand("minidrone", "Animations", "Flip", {
  direction: "front"
});
const leftFlip = parser.getCommand("minidrone", "Animations", "Flip", {  direction: "left"});
const rightFlip = parser.getCommand("minidrone", "Animations", "Flip", {
  direction: "right"
});

const takePicture = parser.getCommand("minidrone", "MediaRecord", "PictureV2");
const fireGun = parser.getCommand('minidrone', 'UsbAccessory', 'GunControl', {id: 0, action: 'FIRE'});
const clawOpen = parser.getCommand('minidrone', 'UsbAccessory', 'ClawControl', {id: 0, action: 'OPEN'});
const clawClose = parser.getCommand('minidrone', 'UsbAccessory', 'ClawControl', {id: 0, action: 'CLOSE'});
const allState = parser.getCommand('common', 'Common', 'AllStates');
const autoTakeOff = parser.getCommand('minidrone', 'Piloting', 'AutoTakeOffMode', {state: 1});
const takeoff = parser.getCommand("minidrone", "Piloting", "TakeOff");
const landing = parser.getCommand("minidrone", "Piloting", "Landing");
const backFlip = parser.getCommand("minidrone", "Animations", "Flip", {
  direction: "back"
});

const moveRight = parser.getCommand("minidrone", "Piloting", "PCMD", {
  flag: 1,
  roll: droneSpeed,
  pitch: 0,
  yaw: 0,
  gaz: 0,
  timestamp: 1000
});
const moveLeft = parser.getCommand("minidrone", "Piloting", "PCMD", {
  flag: 1,
  roll: -droneSpeed,
  pitch: 0,
  yaw: 0,
  gaz: 0,
  timestamp: 1000
});
const moveForward = parser.getCommand("minidrone", "Piloting", "PCMD", {
  flag: 1,
  roll: 0,
  pitch: droneSpeed,
  yaw: 0,
  gaz: 0,
  timestamp: 1000
});
const moveBackward = parser.getCommand("minidrone", "Piloting", "PCMD", {
  flag: 1,
  roll: 0,
  pitch: -droneSpeed,
  yaw: 0,
  gaz: 0,
  timestamp: 1000
});
const moveUp = parser.getCommand("minidrone", "Piloting", "PCMD", {
  flag: 1,
  roll: 0,
  pitch: 0,
  yaw: 0,
  gaz: droneSpeed / 2,
  timestamp: 1000
});
const moveDown = parser.getCommand("minidrone", "Piloting", "PCMD", {
  flag: 1,
  roll: 0,
  pitch: 0,
  yaw: 0,
  gaz: -(droneSpeed / 2),
  timestamp: 1000
});
const spinLeft = parser.getCommand("minidrone", "Piloting", "PCMD", {
  flag: 1,
  roll: 0,
  pitch: 0,
  yaw: -droneSpeed,
  gaz: 0,
  timestamp: 1000
});
const spinRight = parser.getCommand("minidrone", "Piloting", "PCMD", {
  flag: 1,
  roll: 0,
  pitch: 0,
  yaw: droneSpeed,
  gaz: 0,
  timestamp: 1000
});

var express = require("express");
var socket = require("socket.io");
// var app = express();
// var server = app.listen(3000);

// //Server site
// app.use(express.static("public"));
// //Init web socket
// var io = socket(server);

var app = express();
var server = app.listen(3000);

drone.on("connected", () => {

  //Server site
  var io = socket(server);
  app.use(express.static("public"));
  //Init web socket

  // Makes the code a bit clearer
  console.log("drone connected");

  const runCommand = x => drone.runCommand(x);

  // runCommand(flatTrim);
  // setTimeout(runCommand, 2000, takeoff);

  // setTimeout(runCommand, 4000, moveRight);
  // setTimeout(runCommand, 6000, moveForward);
  // setTimeout(runCommand, 8000, moveLeft);  
  // setTimeout(runCommand, 10000, moveBackward);
  // setTimeout(runCommand, 12000, landing);
  // setTimeout(process.exit, 16000);
  // LandDrone();
  //FRONT END

  //Communication Call backs
  io.sockets.on("connection", socket => {
    console.log("new connection: " + socket.id);
    runCommand(flatTrim);

    socket.on("TestDrone", () => {
      console.log("inside stop drone");

      runCommand(flatTrim);
      setTimeout(runCommand, 2000, takeoff);

      setTimeout(runCommand, 4000, moveRight);
      setTimeout(runCommand, 6000, moveForward);
      setTimeout(runCommand, 8000, moveLeft);
      setTimeout(runCommand, 10000, moveBackward);
      setTimeout(runCommand, 12000, landing);
      setTimeout(process.exit, 16000);
    });

    socket.on("SensorData", actionData => {
      console.log(actionData);
      runCommand(GetCommand(actionData));
    });
    
  });

  function GetCommand(dir) {
    switch (dir) {
      case "up":
        return moveUp;
      case "down":
        return moveDown;
      case "spinLeft":
        return spinLeft;
      case "spinRight":
        return spinRight;
      case "origin":
        return landing;
      case "faceDown":
        return backFlip;
      case "straightUp":
        return takeoff;
      case "upsideDown":
        return flip;
      case "rightTilt":
        return moveRight;
      case "leftTilt":
        return moveLeft;
      case "leanAway":
        return moveForward;
      case "leanTowards":
        return moveBackward;
      default:
        console.log("Invalid direction reveived from FE: " + dir);
        break;
    }
  }
});
