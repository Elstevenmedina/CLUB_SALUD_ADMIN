const d = document,
$form = d.getElementById('form'),
$email = d.getElementById('email'),
$emailConfirm = d.getElementById('emailConfirm'),
$password = d.getElementById('password'),
$insertError = d.getElementById('insertError'),
$btnSubmit = d.getElementById('btnSubmit'),
$passwordConfirm = d.getElementById('passwordConfirm');


const enviar = (data) => {
    fetch('/edicion/actualizar-usuarios', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        }
    }).then(res => res.json())
    .then(data => {
        if (data.status === 'ok') {
            $form.reset();
            $insertError.innerHTML = `
            <div class="alert alert-success" role="alert">
                <i class="dripicons-checkmark me-2"></i> ${data.msg}.
            </div>
            `;
            $btnSubmit.disabled = false;
            $btnSubmit.innerHTML = `Actualizar datos`;
            setTimeout(() => {
                $insertError.innerHTML = ""
            }, 10000);
        } else {
            $btnSubmit.disabled = false;
            $btnSubmit.innerHTML = `Actualizar datos`;
            $insertError.innerHTML = `
            <div class="alert alert-danger" role="alert">
                <i class="dripicons-wrong me-2"></i> ${data.msg}.
            </div>
            `;
            setTimeout(() => {
                $insertError.innerHTML = ""
            }, 10000);
        }
    })
} 

$form.addEventListener('submit', (e) => {
    e.preventDefault();
    if ($email.value === '') {
        $email.classList.add('is-invalid');
    }else if($email.classList.contains('is-invalid')){
        $email.classList.remove('is-invalid');
    }
    else if ($emailConfirm.value === '') {
        $emailConfirm.classList.add('is-invalid');
    }else if($emailConfirm.classList.contains('is-invalid')){
        $emailConfirm.classList.remove('is-invalid');
    }
    else if ($password.value === '') {
        $password.classList.add('is-invalid');
    }else if($password.classList.contains('is-invalid')){
        $password.classList.remove('is-invalid');
    }
    else if ($passwordConfirm.value === '') {
        $passwordConfirm.classList.add('is-invalid');
    }else if($passwordConfirm.classList.contains('is-invalid')){
        $passwordConfirm.classList.remove('is-invalid');
    }
    else if ($email.value !== $emailConfirm.value) {
        $insertError.innerHTML =  `
        <div class="alert alert-danger" role="alert">
            <i class="dripicons-wrong me-2"></i> Los correos no coinciden.
        </div>
        `
    }else if ($password.value !== $passwordConfirm.value) {
        $insertError.innerHTML =  `
        <div class="alert alert-danger" role="alert">
            <i class="dripicons-wrong me-2"></i> Las contraseñas no coinciden.
        </div>
        `
    } else {
        let _id = $form.dataset.id;
        let data = {
            email: $email.value,
            _id: _id,
            password: $password.value
        }
        enviar(data);
        $btnSubmit.disabled = true;
        $btnSubmit.innerHTML = `
        <span class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
        Actualizando datos...
        ` 

    } 
})
