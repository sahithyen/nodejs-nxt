/**
 *
 * Node.js package to control the LEGO MINDSTORMS NXT
 * Copyright (C) 2016  Sahithyen Kanaganayagam
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
**/

// Dependencies
const SerialPort = require('serialport');

// Enumerations
exports.MotorPort = {
  A: 0x00,
  B: 0x01,
  C: 0x02
};

exports.Power = {
  n100: 0x9C,
  n75: 0xB5,
  n50: 0xCE,
  n25: 0xE7,
  0: 0x00,
  25: 0x19,
  50: 0x32,
  75: 0x4B,
  100: 0x64
};

exports.Mode = {
  MotorOn: 0x01,
  Brake: 0x02,
  Regulated: 0x05
};

exports.RegulationMode = {
  Idle: 0x00,
  MotorSpeed: 0x01,
  MotorSync: 0x02
};

exports.TurnRatio = {
  n100: 0x9C,
  n75: 0xB5,
  n50: 0xCE,
  n25: 0xE7,
  0: 0x00,
  25: 0x19,
  50: 0x32,
  75: 0x4B,
  100: 0x64
};

exports.RunState = {
  Idle: 0x00,
  RampUp: 0x10,
  Running: 0x20,
  RampDown: 0x40
};

exports.SensorPort = {
  1: 0x00,
  2: 0x01,
  3: 0x02,
  4: 0x03
};

exports.SensorType = {
  NoSensor: 0x00,
  Switch: 0x01,
  Temperature: 0x02,
  Reflection: 0x03,
  Angle: 0x04,
  LightActive: 0x05,
  LightInactive: 0x06,
  SoundDB: 0x07,
  SoundDBA: 0x08,
  Costum: 0x09,
  LowSpeed: 0x0A,
  LowSpeed9V: 0x0B,
  NoOfSensorTypes: 0x0C
};

exports.SensorMode = {
  Raw: 0x00,
  Boolean: 0x20,
  TransitionCounter: 0x40,
  PeriodCounter: 0x60,
  FullScaled: 0x80,
  Celsius: 0xA0,
  Fahrenheit: 0xC0,
  AngleSteps: 0xE0,
  SlopeMask: 0x1F,
  ModeMask: 0xE0
};

const CommandType = {
  Direct: 0x00,
  System: 0x01,
  NoReply: 0x80
};

const DirectCommand = {
  StartProgram: 0x00,
  StopProgram: 0x01,
  PlaySoundFile: 0x02,
  PlayTone: 0x03,
  SetOutputState: 0x04,
  SetInputMode: 0x05,
  GetOutputState: 0x06,
  GetInputValues: 0x07,
  ResetInputScaledValue: 0x08,
  MessageWrite: 0x09,
  ResetMotorPosition: 0x0A,
  GetBatteryLevel: 0x0B,
  StopSoundPlayback: 0x0C,
  KeepAlive: 0x0D,
  LSGetStatus: 0x0E,
  LSWrite: 0x0F,
  LSRead: 0x10,
  GetCurrentProgramName: 0x11,
  MessageRead: 0x13
};

const SystemCommand = {
  OpenRead: 0x80,
  OpenWrite: 0x81,
  Read: 0x82,
  Write: 0x83,
  Close: 0x84,
  Delete: 0x85,
  FindFirst: 0x86,
  FindNext: 0x87,
  GetFirmwareVersion: 0x88,
  OpenWriteLinear: 0x89,
  OpenReadLinear: 0x8A,
  OpenWriteData: 0x8B,
  OpenAppendData: 0x8C,
  Boot: 0x97,
  SetBrickName: 0x98,
  GetDeviceInfo: 0x9B,
  DeleteUserFlash: 0xA0,
  PollLength: 0xA1,
  Poll: 0xA2,
  BluethoothFactoryReset: 0xA4
};

const ErrorMessages = {
  0x00: 'Success',
  0x81: 'No more handles',
  0x82: 'No space',
  0x83: 'No more files',
  0x84: 'End of file expected',
  0x85: 'End of file',
  0x86: 'Not a linear file',
  0x87: 'File not found',
  0x88: 'Handle all ready closed',
  0x89: 'No linear space',
  0x8A: 'Undefined error',
  0x8B: 'File is busy',
  0x8C: 'No write buffers',
  0x8D: 'Append not possible',
  0x8E: 'File is full',
  0x8F: 'File exists',
  0x90: 'Module not found',
  0x91: 'Out of boundary',
  0x92: 'Illegal file name',
  0x93: 'Illegal handle',
  0x20: 'Pending communication transaction in progress',
  0x40: 'Specified mailbox queue is empty',
  0xBD: 'Request failed (i.e. specified file not found)',
  0xBE: 'Unknown command opcode',
  0xBF: 'Insane packet',
  0xC0: 'Data contains out-of-range values',
  0xDD: 'Communication bus error',
  0xDE: 'No free memory in communication buffer',
  0xDF: 'Specified channel/connection is not valid',
  0xE0: 'Specified channel/connection not configured or busy',
  0xEC: 'No active program',
  0xED: 'Illegal size specified',
  0xEE: 'Illegal mailbox queue ID specified',
  0xEF: 'Attempted to access invalid field of a structure',
  0xF0: 'Bad input or output specified',
  0xFB: 'Insufficient memory available',
  0xFF: 'Bad arguments'
};

const isBluethooth = true;

// Class
exports.NXT = function(portName, initCallback) {
  'use strict';

  // Serial port variables
  const shift = isBluethooth ? 2 : 0;
  const serialPort = new SerialPort(portName, undefined, initCallback);

  // Response callbacks
  let responseCallbacks = {};

  var init = function () {
    serialPort.on('data', dataReceived);
  }.bind(this);

  this.Disconnect = function(callback) {
    serialPort.close(callback);
  }.bind(this);

  // Direct commands
  this.StartProgram = function(filename, callback) {
    // Convert filename string to buffer
    const filenameBuffer = new Buffer(filename, 'ASCII');

    // Create command to send
    const command = new Buffer(22);
    command.fill(0);

    command[0] = CommandType.Direct;
    command[1] = DirectCommand.StartProgram;
    filenameBuffer.copy(command, 2, 0, 18);
    command[21] = 0;

    // Send reply if callback is defined
    if (callback) {
      getResponse(command[1], function(error, status, data) {
        const result = {
          status: status
        };

        if (callback) callback(error, result);
        callback = null;
      });
    } else {
      command[0] = command[0] | CommandType.NoReply;
    }

    // Send command
    sendCommand(command, function(error) {
      if (error && callback) {
        callback(error);
        callback = null;
      }
    });
  }.bind(this);

  this.StopProgram = function(callback) {
    // Create command to send
    const command = new Buffer(2);

    command[0] = CommandType.Direct;
    command[1] = DirectCommand.StopProgram;

    // Send reply if callback is defined
    if (callback) {
      getResponse(command[1], function(error, status, data) {
        const result = {
          status: status
        };

        if (callback) callback(error, result);
        callback = null;
      });
    } else {
      command[0] = command[0] | CommandType.NoReply;
    }

    // Send command
    sendCommand(command, function(error) {
      if (error && callback) {
        callback(error);
        callback = null;
      }
    });
  }.bind(this);

  this.PlaySoundFile = function(filename, loop, callback) {
    // Convert filename string to buffer
    const filenameBuffer = new Buffer(filename, 'ASCII');

    // Create command to send
    const command = new Buffer(23);
    command.fill(0);

    command[0] = CommandType.Direct;
    command[1] = DirectCommand.PlaySoundFile;
    command[2] = loop ? 0x01 : 0x00;
    filenameBuffer.copy(command, 3, 0, 18);
    command[22] = 0;

    // Send reply if callback is defined
    if (callback) {
      getResponse(command[1], function(error, status, data) {
        const result = {
          status: status
        };

        if (callback) callback(error, result);
        callback = null;
      });
    } else {
      command[0] = command[0] | CommandType.NoReply;
    }

    // Send command
    sendCommand(command, function(error) {
      if (error && callback) {
        callback(error);
        callback = null;
      }
    });
  }.bind(this);

  this.PlayTone = function(frequency, duration, callback) {
    // Adjust frequency for sending
    frequency = frequency > 14000 ? 14000 : frequency;
    frequency = frequency < 200 ? 200 : frequency;

    // Create command to send
    const command = new Buffer(6);

    command[0] = CommandType.Direct;
    command[1] = DirectCommand.PlayTone;
    command[2] = frequency & 0xFF;
    command[3] = (frequency >>> 8) & 0xFF;
    command[4] = duration & 0xFF;
    command[5] = (duration >>> 8) & 0xFF;

    // Send reply if callback is defined
    if (callback) {
      getResponse(command[1], function(error, status, data) {
        const result = {
          status: status
        };

        if (callback) callback(error, result);
        callback = null;
      });
    } else {
      command[0] = command[0] | CommandType.NoReply;
    }

    // Send command
    sendCommand(command, function(error) {
      if (error && callback) {
        callback(error);
        callback = null;
      }
    });
  }.bind(this);

  this.SetOutputState = function(port, power, mode, regulationMode, turnRatio, runState, tachoLimit, callback) {
    // Create command to send
    const command = new Buffer(13);

    command[0] = CommandType.Direct;
    command[1] = DirectCommand.SetOutputState;
    command[2] = port;
    command[3] = power;
    command[4] = mode;
    command[5] = regulationMode;
    command[6] = turnRatio;
    command[7] = runState;
    command[8] = tachoLimit & 0xFF;
    command[9] = (tachoLimit >>> 8) & 0xFF;
    command[10] = (tachoLimit >>> 16) & 0xFF;
    command[11] = (tachoLimit >>> 24) & 0xFF;
    command[12] = (tachoLimit >>> 32) & 0xFF;

    // Send reply if callback is defined
    if (callback) {
      getResponse(command[1], function(error, status, data) {
        const result = {
          status: status
        };

        if (callback) callback(error, result);
        callback = null;
      });
    } else {
      command[0] = command[0] | CommandType.NoReply;
    }

    // Send command
    sendCommand(command, function(error) {
      if (error && callback) {
        callback(error);
        callback = null;
      }
    });
  }.bind(this);

  this.SetInputMode = function(port, sensorType, sensorMode, callback) {
    // Create command to send
    const command = new Buffer(5);

    command[0] = CommandType.Direct;
    command[1] = DirectCommand.SetInputMode;
    command[2] = port;
    command[3] = sensorType;
    command[4] = sensorMode;

    // Send reply if callback is defined
    if (callback) {
      getResponse(command[1], function(error, status, data) {
        const result = {
          status: status
        };

        if (callback) callback(error, result);
        callback = null;
      });
    } else {
      command[0] = command[0] | CommandType.NoReply;
    }

    // Send command
    sendCommand(command, function(error) {
      if (error && callback) {
        callback(error);
        callback = null;
      }
    });
  }.bind(this);

  this.GetOutputState = function(port, callback) {
    // Create command to send
    const command = new Buffer(3);

    command[0] = CommandType.Direct;
    command[1] = DirectCommand.GetOutputState;
    command[2] = port;

    // Send reply if callback is defined
    if (callback) {
      getResponse(command[1], function(error, status, data) {
        const result = {
          status: status
        };

        if (!error) {
          result.port = data[3 + shift];
          result.power = data[4 + shift];
          result.mode = data[5 + shift];
          result.regulationMode = data[6 + shift];
          result.turnRatio = data[7 + shift];
          result.runState = data[8 + shift];
          result.tachoLimit = data[9 + shift];
          result.tachoLimit += data[10 + shift] << 8;
          result.tachoLimit += data[11 + shift] << 16;
          result.tachoLimit += data[12 + shift] << 24;
          result.tachoCount = data[13 + shift];
          result.tachoCount += data[14 + shift] << 8;
          result.tachoCount += data[15 + shift] << 16;
          result.tachoCount += data[16 + shift] << 24;
          result.blockTachoCount = data[17 + shift];
          result.blockTachoCount += data[18 + shift] << 8;
          result.blockTachoCount += data[19 + shift] << 16;
          result.blockTachoCount += data[20 + shift] << 24;
          result.rotationCount = data[21 + shift];
          result.rotationCount += data[22 + shift] << 8;
          result.rotationCount += data[23 + shift] << 16;
          result.rotationCount += data[24 + shift] << 24;
        }

        if (callback) callback(error, result);
        callback = null;
      });
    } else {
      command[0] = command[0] | CommandType.NoReply;
    }

    // Send command
    sendCommand(command, function(error) {
      if (error && callback) {
        callback(error);
        callback = null;
      }
    });
  }.bind(this);

  this.GetInputValues = function(port, callback) {
    // Create command to send
    const command = new Buffer(3);

    command[0] = CommandType.Direct;
    command[1] = DirectCommand.GetInputValues;
    command[2] = port;

    // Send reply if callback is defined
    if (callback) {
      getResponse(command[1], function(error, status, data) {
        const result = {
          status: status
        };

        if (!error) {
          result.port = data[3 + shift];
          result.valid = data[4 + shift] == 0x01;
          result.calibrated = data[5 + shift] == 0x01;
          result.sensorType = data[6 + shift];
          result.sensorMode = data[7 + shift];
          result.rawValue = data[8 + shift];
          result.rawValue += data[9 + shift] << 8;
          result.normalizedValue = data[10 + shift];
          result.normalizedValue += data[11 + shift] << 8;
          result.scaledValue = data[12 + shift];
          result.scaledValue += data[13 + shift] << 8;
          result.calibratedValue = data[14 + shift];
          result.calibratedValue += data[15 + shift] << 8;
        }

        if (callback) callback(error, result);
        callback = null;
      });
    } else {
      command[0] = command[0] | CommandType.NoReply;
    }

    // Send command
    sendCommand(command, function(error) {
      if (error && callback) {
        callback(error);
        callback = null;
      }
    });
  }.bind(this);

  this.ResetInputScaledValue = function(port, callback) {
    // Create command to send
    const command = new Buffer(3);

    command[0] = CommandType.Direct;
    command[1] = DirectCommand.ResetInputScaledValue;
    command[2] = port;

    // Send reply if callback is defined
    if (callback) {
      getResponse(command[1], function(error, status, data) {
        const result = {
          status: status
        };

        if (callback) callback(error, result);
        callback = null;
      });
    } else {
      command[0] = command[0] | CommandType.NoReply;
    }

    // Send command
    sendCommand(command, function(error) {
      if (error && callback) {
        callback(error);
        callback = null;
      }
    });
  };

  this.MessageWrite = function(inboxNumber, message, callback) {
    // Convert message string to buffer
    const messageBuffer = new Buffer(message, 'ASCII');

    // Create command to send
    const command = new Buffer(64);
    command.fill(0);

    command[0] = CommandType.Direct;
    command[1] = DirectCommand.MessageWrite;
    command[2] = inboxNumber;
    command[3] = messageBuffer.length;
    messageBuffer.copy(command, 4, 0, messageBuffer.length);

    // Send reply if callback is defined
    if (callback) {
      getResponse(command[1], function(error, status, data) {
        const result = {
          status: status
        };

        if (callback) callback(error, result);
        callback = null;
      });
    } else {
      command[0] = command[0] | CommandType.NoReply;
    }

    // Send command
    sendCommand(command, function(error) {
      if (error && callback) {
        callback(error);
        callback = null;
      }
    });
  }.bind(this);

  this.ResetMotorPosition = function(port, relative, callback) {
    // Create command to send
    const command = new Buffer(4);

    command[0] = CommandType.Direct;
    command[1] = DirectCommand.ResetMotorPosition;
    command[2] = port;
    command[3] = relative ? 0x01 : 0x00;

    // Send reply if callback is defined
    if (callback) {
      getResponse(command[1], function(error, status, data) {
        const result = {
          status: status
        };

        if (callback) callback(error, result);
        callback = null;
      });
    } else {
      command[0] = command[0] | CommandType.NoReply;
    }

    // Send command
    sendCommand(command, function(error) {
      if (error && callback) {
        callback(error);
        callback = null;
      }
    });
  }.bind(this);

  this.GetBatteryLevel = function(callback) {
    // Create command to send
    const command = new Buffer(2);

    command[0] = CommandType.Direct;
    command[1] = DirectCommand.GetBatteryLevel;

    // Send reply if callback is defined
    if (callback) {
      getResponse(command[1], function(error, status, data) {
        const result = {
          status: status
        };

        if (!error) {
          result.voltage = data[3 + shift];
          result.voltage += data[4 + shift] << 8;
        }

        if (callback) callback(error, result);
        callback = null;
      });
    } else {
      command[0] = command[0] | CommandType.NoReply;
    }

    // Send command
    sendCommand(command, function(error) {
      if (error && callback) {
        callback(error);
        callback = null;
      }
    });
  }.bind(this);

  this.StopSoundPlayback = function(callback) {
    // Create command to send
    const command = new Buffer(2);

    command[0] = CommandType.Direct;
    command[1] = DirectCommand.StopSoundPlayback;

    // Send reply if callback is defined
    if (callback) {
      getResponse(command[1], function(error, status, data) {
        const result = {
          status: status
        };

        if (callback) callback(error, result);
        callback = null;
      });
    } else {
      command[0] = command[0] | CommandType.NoReply;
    }

    // Send command
    sendCommand(command, function(error) {
      if (error && callback) {
        callback(error);
        callback = null;
      }
    });
  }.bind(this);

  this.KeepAlive = function(callback) {
    // Create command to send
    const command = new Buffer(2);

    command[0] = CommandType.Direct;
    command[1] = DirectCommand.KeepAlive;

    // Send reply if callback is defined
    if (callback) {
      getResponse(command[1], function(error, status, data) {
        const result = {
          status: status
        };

        if (!error) {
          result.currentSleepTimeLimit = data[3 + shift];
          result.currentSleepTimeLimit += data[4 + shift] << 8;
          result.currentSleepTimeLimit += data[5 + shift] << 16;
          result.currentSleepTimeLimit += data[6 + shift] << 24;
        }

        if (callback) callback(error, result);
        callback = null;
      });
    } else {
      command[0] = command[0] | CommandType.NoReply;
    }

    // Send command
    sendCommand(command, function(error) {
      if (error && callback) {
        callback(error);
        callback = null;
      }
    });
  }.bind(this);

  this.LSGetStatus = function(port, callback) {
    // Create command to send
    const command = new Buffer(2);

    command[0] = CommandType.Direct;
    command[1] = DirectCommand.LSGetStatus;
    command[2] = port;

    // Send reply if callback is defined
    if (callback) {
      getResponse(command[1], function(error, status, data) {
        const result = {
          status: status
        };

        if (!error) {
          result.bytesReady = data[3 + shift];
        }

        if (callback) callback(error, result);
        callback = null;
      });
    } else {
      command[0] = command[0] | CommandType.NoReply;
    }

    // Send command
    sendCommand(command, function(error) {
      if (error && callback) {
        callback(error);
        callback = null;
      }
    });
  }.bind(this);

  this.LSWrite = function(port, txData, rxDataLength) {
    // Create command to send
    const command = new Buffer(5 + txData.length);

    command[0] = CommandType.Direct;
    command[1] = DirectCommand.LSWrite;
    command[2] = port;
    command[3] = txData.length;
    command[4] = rxDataLength;
    txData.copy(command, 5, 0, txData.length);

    // Send reply if callback is defined
    if (callback) {
      getResponse(command[1], function(error, status, data) {
        const result = {
          status: status
        };

        if (callback) callback(error, result);
        callback = null;
      });
    } else {
      command[0] = command[0] | CommandType.NoReply;
    }

    // Send command
    sendCommand(command, function(error) {
      if (error && callback) {
        callback(error);
        callback = null;
      }
    });
  }.bind(this);

  this.LSRead = function(port) {
    // Create command to send
    const command = new Buffer(3);

    command[0] = CommandType.Direct;
    command[1] = DirectCommand.LSRead;
    command[2] = port;

    // Send reply if callback is defined
    if (callback) {
      getResponse(command[1], function(error, status, data) {
        const result = {
          status: status
        };

        if (!error) {
          result.rxData = data.slice(3 + shift);
        }

        if (callback) callback(error, result);
        callback = null;
      });
    } else {
      command[0] = command[0] | CommandType.NoReply;
    }

    // Send command
    sendCommand(command, function(error) {
      if (error && callback) {
        callback(error);
        callback = null;
      }
    });
  }.bind(this);

  this.GetCurrentProgramName = function(callback) {
    // Create command to send
    const command = new Buffer(2);

    command[0] = CommandType.Direct;
    command[1] = DirectCommand.GetCurrentProgramName;

    // Send reply if callback is defined
    if (callback) {
      getResponse(command[1], function(error, status, data) {
        const result = {
          status: status
        };

        if (!error) {
          result.fileName = data.slice(3 + shift).toString('ascii');
        }

        if (callback) callback(error, result);
        callback = null;
      });
    } else {
      command[0] = command[0] | CommandType.NoReply;
    }

    // Send command
    sendCommand(command, function(error) {
      if (error && callback) {
        callback(error);
        callback = null;
      }
    });
  }.bind(this);

  this.MessageRead = function(remoteInboxNumber, localInboxNumber, remove, callback) {
    // Create command to send
    const command = new Buffer(5);

    command[0] = CommandType.Direct;
    command[1] = DirectCommand.MessageRead;
    command[2] = remoteInboxNumber;
    command[3] = localInboxNumber;
    command[4] = remove ? 0x01 : 0x00;

    // Send reply if callback is defined
    if (callback) {
      getResponse(command[1], function(error, status, data) {
        const result = {
          status: status
        };

        if (!error) {
          result.localInboxNumber = data[3 + shift];
          result.messageSize = data[4 + shift];
          result.message = data[5 + shift].slice(5).toString('ascii');
        }

        if (callback) callback(error, result);
        callback = null;
      });
    } else {
      command[0] = command[0] | CommandType.NoReply;
    }

    // Send command
    sendCommand(command, function(error) {
      if (error && callback) {
        callback(error);
        callback = null;
      }
    });
  }.bind(this);

  // Communication functions
  var sendCommand = function(command, callback) {
    // Create packet
    let packet;

    if (isBluethooth) {
      // Create packet
      packet = new Buffer(command.length + 2);
      packet[0] = command.length;
      packet[1] = 0;

      // Merge command with packet
      command.copy(packet, 2);
    } else {
      // Create packet
      packet = command;
    }

    // Send packet
    serialPort.write(packet, callback);
  }.bind(this);

  var getResponse = function(command, callback) {
    responseCallbacks[command] = callback;
  }.bind(this);

  var dataReceived = function(data) {
    var command = data[1 + shift];

    if (responseCallbacks[command]) {
      const status = data[2 + shift];
      const error = status === 0 ? null : new Error(ErrorMessages[status]);

      responseCallbacks[command](error, status, data);

      responseCallbacks[command] = null;
    }
  }.bind(this);

  init();
};
