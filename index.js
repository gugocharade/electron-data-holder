const path = require('path');
const fs = require('fs');
const onChange = require('on-change');
const { encrypt, decrypt } = require('./crypto');

const getSavedData = (dataPath) => {
  let savedData;
  try {
    savedData = JSON.parse(fs.readFileSync(dataPath));
  } catch (error) {}

  return savedData;
};

const saveData = (data, dataPath) => {
  fs.writeFile(dataPath, JSON.stringify(data), 'utf8', (err) => {
    console.log(err);
  });
};

exports.initDB = ({ key, customPath } = {}) => {
  const { ipcMain, app } = require('electron');

  ipcMain.on('pathAndKey', (event, arg) => {
    if (customPath) {
      event.returnValue = { appPath: customPath, key };
    } else {
      event.returnValue = { appPath: app.getPath('userData'), key };
    }
  });
};

exports.storeDB = (data, { fileName = 'data', encryption = false } = {}) => {
  const { ipcRenderer } = require('electron');

  const { appPath, key } = ipcRenderer.sendSync('pathAndKey');

  if (!appPath) {
    throw new Error('you need to call initDB() in the main process');
  }

  const savedData = getSavedData(
    path.join(appPath, `${fileName.replace('.json', '')}.json`)
  );

  // the key string must have 32 caracter, if not throw an error
  if (key && key.length !== 32) {
    throw new Error('the key must be of length 32 caracter');
  }

  // if the encrypt option is true and there is no encryption key throw an error
  if (!key && encryption) {
    throw new Error(
      'you need to pass the encryption key to the initDB() function'
    );
  }

  try {
    if (typeof savedData === 'object' && encryption) {
      data = Object.keys(savedData).length
        ? JSON.parse(decrypt(savedData, key))
        : data;
    } else if (typeof savedData === 'object' && !encryption) {
      data = Object.keys(savedData).length ? savedData : data;
    }
  } catch (error) {
    // if the data exist in the file is not encrypted and the user is passing true for encrypt option, trying to decrypt it will throw an error so we need to get it without decrypting it
    if (
      error.message.includes(
        'The first argument must be of type string or an instance of Buffer'
      )
    ) {
      data = savedData;
    }
  }

  return onChange(data, function () {
    saveData(
      encryption ? encrypt(JSON.stringify(this), key) : this,
      path.join(appPath, fileName ? `${fileName}.json` : 'data.json')
    );
  });
};
