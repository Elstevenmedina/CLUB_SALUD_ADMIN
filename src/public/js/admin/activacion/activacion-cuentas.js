const d = document,
$password = d.getElementById('password'),
$btnActivar = d.getElementById('btnActivar'),
$passwordConfirm = d.getElementById('passwordConfirm'),
$cardBody = d.getElementById('cardBody'),
$form = d.getElementById('form');

let enviarDatos = (data) => {
    fetch('/activar-cuenta/{{id}}', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data),

    }).then((res) => {
        return res.json();
    }).then((data) => {
        if (data.status == 'success') {
            $cardBody.innerHTML = `
                <div class="row">
                    <div class="col-sm-12 text-center">
                        <p>¡Usuario registrado exitosamente!</p> <br>
                        <span class="text-muted">Será redireccionado al inicio de sesión para que acceda a Club Salud</span>
                    </div>
                    <div class="col-sm-12 text-center mt-2">
                        <img src="/images/business/check.png" class="img-fluid" width="150px">
                    </div>
                </div>
            `
            setTimeout(() => {
                window.location.href = '/';
            }, 6000);
        } else {
            alert(data.message);
        }
    }).catch((err) => {
        console.log(err);
    });
}

$form.addEventListener('submit', (e) => {
    e.preventDefault()
    let data = {
        password: $password.value
    }
    $btnActivar.innerHTML = `
        <span class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
        Validando datos...
    ` 
    $btnActivar.setAttribute('disabled','')
    enviarDatos(data)

})

$password.addEventListener('keyup', () => {
    if ($password.value === $passwordConfirm.value) {
        $passwordConfirm.classList.remove('is-invalid');
        $password.classList.remove('is-invalid');
        $passwordConfirm.classList.remove('is-valid');
        $password.classList.remove('is-valid');
        $passwordConfirm.setCustomValidity('');
        $btnActivar.removeAttribute('disabled');
    } else {
        $passwordConfirm.classList.add('is-invalid');
        $password.classList.add('is-invalid');
    }
});

$passwordConfirm.addEventListener('keyup', () => {
    if ($password.value === $passwordConfirm.value) {
        $passwordConfirm.classList.remove('is-invalid');
        $password.classList.remove('is-invalid');
        $passwordConfirm.classList.remove('is-valid');
        $password.classList.remove('is-valid');
        $passwordConfirm.setCustomValidity('');
        $btnActivar.removeAttribute('disabled');
    } else {
        $passwordConfirm.classList.add('is-invalid');
        $password.classList.add('is-invalid');
    }
});
