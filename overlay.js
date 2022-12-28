async function getVersion() {
    const version = await window.chimbaland.getVersion()

    let p = document.querySelector("#version");
    p.innerHTML = `v${version}`
}

async function fade(){
    let overlay = document.querySelector(".overlay");
    overlay.classList.toggle("after");
}

async function run(){
    await getVersion()

    setTimeout(async () => { // hay que apreciar la belleza
        await fade()
    }, 1000)
}

run()