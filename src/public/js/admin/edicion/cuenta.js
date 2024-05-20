    const d = document,
    $fileinput = d.getElementById('file-input'),
    $insertErrorImage = d.getElementById('insertErrorImage'),
    $form = d.getElementById('form'),
    $Nombres = d.getElementById('Nombres'),
    $Apellidos = d.getElementById('Apellidos'),
    $profileImageRight = d.getElementById('profileImageRight'),
    $profileImageLeft = d.getElementById('profileImageLeft'),
    $Cedula = d.getElementById('Cedula'),
    $Direccion = d.getElementById('Direccion'),
    $email = d.getElementById('email'),
    $insertError  = d.getElementById('insertError'),
    $btnSubmit = d.getElementById('btnSubmit'),
    $password = d.getElementById('password'),
    $imageProfile = d.getElementById('imageProfile'),
    $passwordConfirm = d.getElementById('passwordConfirm'),
    $emailConfirm = d.getElementById('emailConfirm'),
    $btnTest = d.getElementById('btnTest');

    let actualizarFoto = (data) => {
        fetch('/actualizar-foto-perfil', {
            method: 'POST',
            body: data
        })
        .then(res => res.json())
        .then(data => {
            if(data.status === 'ok'){
              $imageProfile.src = data.image;
              $profileImageRight.src = data.image;
              $profileImageLeft.src = data.image;
              $insertErrorImage.innerHTML = `
               <div class="alert alert-success" role="alert">
                        <i class="dripicons-checkmark me-2"></i> ${data.msg}.
                </div>`
                setTimeout(() => {
                    $insertErrorImage.innerHTML = ""
                }, 10000);
                
            }else{
                $insertErrorImage.innerHTML = `
               <div class="alert alert-danger" role="alert">
                        <i class="dripicons-wrong me-2"></i> ${data.msg}.
                </div>`
                setTimeout(() => {
                    $insertErrorImage.innerHTML = ""
                }, 10000);
            }
        })
    }

    const enviar = (data) => {
        fetch('/edicion/actualizar-usuario', {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            }
        }).then(res => res.json())
        .then(data => {
            if (data.status === 'ok') {
                $btnSubmit.disabled = false;
                $btnSubmit.innerHTML = `Actualizar datos`;
                $insertError.innerHTML = `
                <div class="alert alert-success" role="alert">
                    <i class="dripicons-checkmark me-2"></i> ${data.msg}.
                </div>
                `;
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


    $btnTest.onclick = () => {
        $fileinput.click();
    }
    $fileinput.onchange = () => {
        let form = new FormData();
        form.append('imagen', $fileinput.files[0], $fileinput.files[0].name);
        form.append('id', $form.dataset.id);
        actualizarFoto(form);
        $insertErrorImage.innerHTML = `
            <div class="spinner-grow text-info" role="status"></div>
        `
    }

$form.addEventListener('submit', (e) => {
    e.preventDefault();
    if($Nombres.value === '') {
        $Nombres.classList.add('is-invalid');
    }else if($Nombres.classList.contains('is-invalid')){
        $Nombres.classList.remove('is-invalid');
    }else if($Apellidos.value === '') {
        $Apellidos.classList.add('is-invalid');
    }else if($Apellidos.classList.contains('is-invalid')){
        $Apellidos.classList.remove('is-invalid');
    }
    else if($Cedula.value === '') {
        $Cedula.classList.add('is-invalid');
    }else if($Cedula.classList.contains('is-invalid')){
        $Cedula.classList.remove('is-invalid');
    }
    else if($Direccion.value === '') {
        $Direccion.classList.add('is-invalid');
    }else if($Direccion.classList.contains('is-invalid')){
        $Direccion.classList.remove('is-invalid');
    }
    else if ($email.value === '') {
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
    
    }else {
        let _id = $form.dataset.id;
        let data = {
            Nombres: $Nombres.value,
            Apellidos: $Apellidos.value,
            Cedula: $Cedula.value,
            Direccion: $Direccion.value,
            _id: _id,
            email: $email.value,
            password: $password.value
        }
        enviar(data);
        $btnSubmit.setAttribute('disabled', 'disabled');
        $btnSubmit.innerHTML = `
        <span class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
        Actualizando datos...
        ` 
    } 
})