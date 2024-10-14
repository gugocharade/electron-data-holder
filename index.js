const path = require('path');
const fs = require('fs');
const onChange = require('on-change');
const { encrypt, decrypt } = require('./crypto');

// Function to get saved data from file
const getSavedData = (dataPath) => {
  let savedData;
  try {
    savedData = JSON.parse(fs.readFileSync(dataPath));
  } catch (error) {
    console.error('Error reading saved data:', error);
    savedData = {}; // Return an empty object in case of error
  }
  return savedData;
};

// Async function to save data to file
const saveData = async (data, dataPath) => {
  try {
    fs.writeFileSync(dataPath, JSON.stringify(data), 'utf8');
  } catch (err) {
    console.error('Error saving data:', err); // Improved error handling
  }
};

// Initialize the database with optional encryption key and custom path
exports.initDB = ({ key, customPath } = {}) => {
  const { ipcMain, app } = require('electron');

  ipcMain.on('pathAndKey', (event) => {
    if (customPath) {
      event.returnValue = { appPath: customPath, key };
    } else {
      event.returnValue = { appPath: app.getPath('userData'), key };
    }
  });
};

// Function to store data and handle optional encryption
exports.storeDB = (data, { fileName = 'data', encryption = false } = {}) => {
  const { ipcRenderer } = require('electron');

  const { appPath, key } = ipcRenderer.sendSync('pathAndKey');

  if (!appPath) {
    throw new Error('You need to call initDB() in the main process');
  }

  // Remove '.json' only if it exists at the end of the fileName
  fileName = fileName.endsWith('.json') ? fileName.slice(0, -5) : fileName;

  const filePath = path.join(appPath, `${fileName}.json`);
  const savedData = getSavedData(filePath);

  // Validate key length
  if (key && key.length !== 32) {
    throw new Error('The encryption key must be exactly 32 characters long');
  }

  // Ensure encryption key is provided if encryption is enabled
  if (!key && encryption) {
    throw new Error(
      'You need to pass the encryption key to the initDB() function'
    );
  }

  try {
    if (typeof savedData === 'object' && encryption) {
      // Decrypt data if encryption is enabled
      data = Object.keys(savedData).length
        ? JSON.parse(decrypt(savedData, key))
        : data;
    } else if (typeof savedData === 'object' && !encryption) {
      // Use saved data if it exists, without decryption
      data = Object.keys(savedData).length ? savedData : data;
    }
  } catch (error) {
    // Handle case where data is not encrypted but encryption is enabled
    if (
      error.message.includes(
        'The first argument must be of type string or an instance of Buffer'
      )
    ) {
      console.warn('Saved data is not encrypted, but encryption is enabled.');
      data = savedData;
    } else {
      console.error('Error decrypting saved data:', error);
    }
  }

  // Return reactive data object
  return onChange(data, function () {
    saveData(encryption ? encrypt(JSON.stringify(this), key) : this, filePath);
  });
};
