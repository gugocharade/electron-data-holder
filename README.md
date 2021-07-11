# electron-data-holder

> `A simple way of storing data in electron app, save user data and app settings in simple steps.`

Trying to persist data in the electron app is not an option since it doesn't have a built-in way of doing it, also it's a headache trying to implement it yourself.

That's why this module exists, the data is saved in a JSON file named data.json but you can change the name to whatever you want for example config.json to store user preferences.

The path to the JSON file is `app.getPath('userData')` or you can specify your preferred path.

You can store multiple files each one with a preferred name and also you can specify if you want to encrypt the data or not, the data is watched and saved after every change.

# Install

```js
$ npm install electron-data-holder
```

# Usage

### Step 1 :

In the main process call `initDB()`, this function accepts a configuration object with 2 properties:

- key : `string` `(not required)` : the encryption key must be 32 characters long
- customPath : `string` `(not required)` : The path to the folder where you want to store the JSON files.

```js
const { initDB } = require('electron-data-holder');

// the encryption key must be 32 characters long.

initDB({ key: 'the-encryption-key', customPath: 'the-path-to-the-folder' });

// pass null instead of the key if you don't wan't to pass it but you want to pass a folder path;
```

The 2 parameters are not required, if you didn't pass an encryption key the data won't be encrypted and if you didn't pass a folder path, the folder will be `app.getPath('userData')`.

### Step 2 :

In the rendrer call `storeDB()`, this function accepts 2 parameters :

- Data object : `object` `(required)` : The data must be an object.
- Configuration object : `(not required)` : accepts 2 properties :
  - fileName : `string`: The name is a string and without the `.json` part the default is `data.json`.
  - encryption : `boolean` : whether you want the data to be encrypted or not, the default is ` false`.

```js
const { storeDB } = require('electron-data-holder');

// This function will returns a proxy with your data in it in order to watch the changes and update the JSON file.

const data = storeDB(
  {
    user: {
      firstName: 'Elon',
      lastName: 'Mask',
    },
    hobbies: ['learning', 'codding'],
  },

  {
    fileName: 'dataFile',
    encryption: true,
  }
);

// you can create multiple files by giving each one a different name

const config = storeDB(
  {
    darkMode: true,
    fontSize: 16,
    fontFamily: ['Courier', 'Courier', 'Everson Mono'],
  },

  { fileName: 'config' }
);
```

When the app is launched, it will search for the JSON files and get the data from them if they exist and return it, if not it will use the object you passed as the first parameter.

After writing these lines of code, you are now ready to work on your app without worrying about the data, and the beautiful thing is that there is no APIs to insert or get the data, use your data as you would do in vanilla javascript.

# Manipulating data

Let's use this example:

```js
const { storeDB } = require('electron-data-holder');

const data = storeDB(
  {
    user: {
      firstName: 'Elon',
      lastName: 'Mask',
    },
    hobbies: ['learning', 'coding'],
  },

  {
    fileName: 'dataFile',
    encryption: true,
  }
);
```

## Reading data

Let's log to the console the first element in the hobbies array:

```js
console.log(data.hobbies[0]); // 'learning'
```

## Modifying data

Let's add "gaming" to the hobbies array:

```js
data.hobbies.push('gaming');

console.log(data.hobbies); // Proxy {0: "learning", 1: "coding", 2: "gaming"}
```

Let's add an "age" property to the user object:

```js
data.user.age = 47;

console.log(data.user); // Proxy {firstName: "Elon", lastName: "Mask", age: 47}
```

The `storeDB()` function returns a proxy with your data in it in order to watch the changes and update the JSON file.
Every time you modify your data the JSON file will be updated accordingly.

As you can see there is no extra stuff for reading and modifying your data and also you don't need to worry about saving it in every change, this package will handle everything for you so you can focus on building your app. HAPPY CODING

# Donation

If you found this package useful support me.

[!["Buy Me A Coffee"](https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png)](https://www.buymeacoffee.com/gugocharade)


