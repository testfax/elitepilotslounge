const { app,BrowserWindow } = require('electron')
const Store = require('electron-store');
const store = new Store({ name: 'electronWindowIds'})
const thisWindow = store.get('electronWindowIds')
const colors = require('colors');
const colorize = require('json-colorizer');
const path = require('path')
const fs = require('fs')
const getPath = require('platform-folders')
// const {savedGameLocation} = require('./loungeClientStore')

const dcoh = {
    pageData: { currentPage: "" },
    getCommander: function(data) {
    }
}

module.exports = dcoh