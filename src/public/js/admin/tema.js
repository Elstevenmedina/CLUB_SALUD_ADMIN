const tema = (data) => {
    fetch('/configuracion-tema',{
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
}

document.getElementById('light-mode-check').onchange = () => {
if (this.checked) {
    let data = {
        modo: 'light'
    }
    tema(data)
} else {
   let data = {
        modo: 'light'
    }
    tema(data)
    }
}
document.getElementById('dark-mode-check').onchange = () => {
if (this.checked) {
     let data = {
        modo: 'dark'
    }
    tema(data)
} else {
     let data = {
        modo: 'dark'
    }
    tema(data)
    }
}