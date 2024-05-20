document.addEventListener('click', e => {
    if (e.target.classList.contains('resultados')) {
        let data = {
            Numero: e.target.dataset.numero
        }
        fetch('/solicitar-resultados-examen', {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json'
            }
        }).then((res) => {
            return res.json()
        }).then((data) => {
            let ul = ""
            for(i=0; i< data.Resultado.length; i++){
                li = `<li class="" style="line-height: 1.2">
                        <a target="_blank" class="btn btn-outline-info" href="/ver-resultados/${data._id}:${i}">
                            Ver resultado <i class="mdi mdi-file-pdf-box"></i>
                        </a>
                    </li>`
                ul += li
            }
              
            swal.fire({
                title: `Resultados de solicitud #${e.target.dataset.numero}`,
                type: 'info',
                html: `
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