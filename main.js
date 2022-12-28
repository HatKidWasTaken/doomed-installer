const { app, BrowserWindow, ipcMain } = require('electron')

// const clone = require('git-clone/promise')
const request = require('superagent')
const path = require('path')
const fs = require('fs-extra')
const admZip = require('adm-zip')

// const repo = 'https://github.com/Jleguim/chimbamods.git'
const repo = 'https://github.com/HatKidWasTaken/doomedmods/archive/refs/heads/main.zip'
const pz = process.env.USERPROFILE + '\\Zomboid\\'
const mods = pz + '\\mods'
const temp = process.env.TEMP + '\\doomed-installer\\'
//const launcher_profiles = minecraft + '\\launcher_profiles.json\\'

function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 500,
        height: 375,
        resizable: false,
        fullscreenable: false,
        title: "DOOMED Installer",
        icon: "./icon.ico",
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    })

    mainWindow.removeMenu()
    mainWindow.loadFile('index.html')
}

ipcMain.handle('checkInstalled', (event) => {
    return new Promise((res, rej) => {
        res(fs.existsSync(mods))
    })
})

ipcMain.handle('deleteModFolder', (event) => {
    return fs.rm(mods, { recursive: true, force: true })
})

ipcMain.handle('downloadMods', (event) => {
    if (!fs.existsSync(temp)) fs.mkdirSync(temp)

    const dest = temp + '\\main.zip' // %temp%/main.zip
    const stream = fs.createWriteStream(dest) // crea stream al que escribir
    const pipe = request.get(repo).pipe(stream) // descarga y escribe al stream

    return new Promise((resolve) => {
        pipe.on('finish', () => resolve())
    })
})

ipcMain.handle('unzipMods', (event) => {
    return new Promise((resolve, reject) => {
        var zipPath = temp + '\\main.zip' // %temp%/main.zip
        var zip = new admZip(zipPath) // crea zip
        zip.extractAllTo(mods, true);

        // mover la carpeta mods fuera
        let modsFiles = fs.readdirSync(path.join(mods + "/doomedmods-main/mods/"))
        
        modsFiles.forEach(async (name, i) => {
            let dir = path.join(mods + "/doomedmods-main/mods/" + `${name}/`)
            await fs.move(dir, path.join(mods + `/${name}/`), { overwrite: true }).catch(err => console.log(err)) // mover las carpetas de mods al root

            if(i === modsFiles.length - 1) {
                fs.rm(path.join(mods + "/doomedmods-main/"), { recursive: true }); // eliminar el directorio extraido restante
                fs.rmSync(temp, { recursive: true, force: true }); // eliminar el directorio temp
                        
                resolve();
            }
        })
    })

})

/* ipcMain.handle('createProfile', (event) => {
    return new Promise(async (res, rej) => {
        if (!fs.existsSync(launcher_profiles)) return res()

        const profile_data = JSON.parse(fs.readFileSync(launcher_profiles))

        if (profile_data.profiles.chimbaland) return res()

        profile_data.profiles.chimbaland = {
            gameDir: path.normalize(chimbaland),
            icon: require('./image.js'),
            javaArgs: '-Xmx4G -XX:+UnlockExperimentalVMOptions -XX:+UseG1GC -XX:G1NewSizePercent=20 -XX:G1ReservePercent=20 -XX:MaxGCPauseMillis=50 -XX:G1HeapRegionSize=32M',
            lastUsed: "2022-06-27T05:02:27.601Z",
            lastVersionId: "1.16.5-forge-36.2.34",
            name: "Chimbaland 3",
            type: "custom"
        }

        fs.writeFileSync(launcher_profiles, JSON.stringify(profile_data, 0, 3))
        res()
    })
}) */

ipcMain.handle('getVersion', (event) => {
    return require("./package.json").version;
})

app.whenReady().then(() => {
    createWindow()
})