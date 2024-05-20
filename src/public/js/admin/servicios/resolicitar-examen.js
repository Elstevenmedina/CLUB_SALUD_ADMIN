d.addEventListener('click', e => {
    if (e.target.classList.contains('resolicitud')) {

        swal.fire({
            title: 'Resolicitando examen',
            html: `
            <div class="my-3 spinner-border avatar-lg text-success" role="status"></div>
            `,
            allowOutsideClick: false,
            showCancelButton: false,
            showConfirmButton: false
        })
        let data = {
            Numero: e.target.dataset.numero
        }
        fetch('/resolicitar-examen', {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json',
            }
        }).then((res) => {
            return res.json()
        }).then((data) => {
            if (data.status == 'success') {
                Swal.fire({
                    title: 'Éxito',
                    text: data.msg,
                    type: 'success',
                    icon: 'success'
                })
            } else {
                Swal.fire({
                    title: 'Error',
                    text: data.msg,
                    type: 'error',
                    icon: 'error',
                })
            }
        })
    }
})