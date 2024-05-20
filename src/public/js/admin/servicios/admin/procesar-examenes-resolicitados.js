const $insertError = d.getElementById('insertError');
d.addEventListener('click', e => {
    if (e.target.classList.contains('procesar')) {
        let data = {
            Numero: e.target.dataset.numero
        }
        fetch('/examenes/procesar', {
                method: 'POST',
                body: JSON.stringify(data),
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            .then(res => res.json())
            .then(res => {
                if (res.status == 'success') {
                    location.href = `/examenes/procesar-resolicitud/${data.Numero}`
                } else {
                    $insertError.innerHTML = `
                        <div class="alert alert-danger" role="alert">
                            <i class="dripicons-wrong me-2"></i> El examen #${data.Numero} ya fue procesado. Valide e intente de nuevo.
                        </div>
                        `
                    setTimeout(() => {
                        $insertError.innerHTML = ""
                    }, 10000);
                }
            })
    }
})