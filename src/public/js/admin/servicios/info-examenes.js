    const d = document
    d.addEventListener('click', e => {
        if (e.target.classList.contains('examen')) {
            let data = {
                Numero: e.target.textContent
            }
            fetch('/solicitar-datos-examen', {
                method: 'POST',
                body: JSON.stringify(data),
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then((res) => {
                return res.json()
            }).then((data) => {
                let ul = ""
                console.log(data)
                data.ListaExamenes.forEach((examen) => {
                    if (examen.subtipo) {
                        li = `<li class="text-start" style="line-height: 1.2">${examen.nombre}  ${examen.subtipo} x ${examen.cantidad}</li>`
                        ul += li
                    } else if (examen.agregadoPosterior) {
                        li = `<li class="text-start" style="line-height: 1.2">${examen.nombre}  ${examen.agregadoPosterior} x ${examen.cantidad}</li>`
                        ul += li
                    } else {
                        li = `<li class="text-start list-item" style="line-height: 1.2">${examen.nombre} x ${examen.cantidad}</li>`
                        ul += li
                    }
                })
                swal.fire({
                    title: `Examen #${data.Numero}`,
                    type: 'info',
                    html: `
                    <h4 class="text-start">Examenes solicitados:</h4>  
                    <ul class="list-group list-group-flush ">
                        ${ul}
                    </ul>
                `,
                    showCloseButton: true,
                    showCancelButton: false,
                    confirmButtonText: 'Ok',
                })
            })
        }
    })