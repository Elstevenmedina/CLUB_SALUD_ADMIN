const d = document,
    $search = d.getElementById('search'),
    $titulosExamenes = d.querySelectorAll('.titulosExamenes'),
    $Paciente = d.getElementById('Paciente'),
    $FechaNacimiento = d.getElementById('FechaNacimiento'),
    $Documento = d.getElementById('Documento'),
    $Telefono = d.getElementById('Telefono'),
    $Direccion = d.getElementById('Direccion'),
    $pacienteText = d.getElementById('pacienteText'),
    $cedulaText = d.getElementById('cedulaText'),
    $cantidadExamenes = d.getElementById('cantidadExamenes'),
    $puntosGenerados = d.getElementById('puntosGenerados'),
    $Observacion = d.getElementById('Observacion'),
    $btnGuardar = d.getElementById('btnGuardar'),
    $puntosObtenidos = d.getElementById('puntosObtenidos'),
    $pacienteRegistrado = d.getElementById('pacienteRegistrado'),
    $Medico = d.getElementById('Medico'),
    $cardExamenes = d.getElementById('cardExamenes'),
    $examenes = d.querySelectorAll('.examenes');
    let listaExamenes = [];
    let puntos = 0;
    let numeroChecked = null
    let nombrePaciente
    var sweet_loader = `
    <div class="sweet_loader">
        <svg viewBox="0 0 140 140" width="140" height="140">
            <g class="outline">
                <path d="m 70 28 a 1 1 0 0 0 0 84 a 1 1 0 0 0 0 -84" stroke="rgba(0,0,0,0.1)" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"></path></g><g class="circle"><path d="m 70 28 a 1 1 0 0 0 0 84 a 1 1 0 0 0 0 -84" stroke="#71BBFF" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-dashoffset="200" stroke-dasharray="300">
                </path>
            </g>
        </svg>
    </div>`

//Inicio de filtro
let porcentajeComisiones 
let ComisionesDisponibles 

let buttonActive = "Tipo examenes"

const reiniciarData = () =>{
    listaExamenes = []
    $cantidadExamenes.textContent = listaExamenes.length
    $puntosGenerados.textContent = 0
    $puntosObtenidos.textContent = 0
    //get all the elements checked and uncheck them
    let checked = d.querySelectorAll('.checkExamen:checked')
        checked.forEach((check) => {
            check.checked = false
        }
    )
}

d.addEventListener('click', e=>{
    if(e.target.matches('.nav-link')){
        if(buttonActive != e.target.dataset.nombre){
            buttonActive = e.target.dataset.nombre
            reiniciarData()
        }
    }
})



$pacienteRegistrado.onchange = () =>{
    if(!$pacienteRegistrado.checked){
         location.href = `/registro-rapido-paciente`   
    }
 }

const solicitarInfoMedico = (data) =>{
    fetch('/solicitar-info-medico-comisiones-admin', {
        method:'POST',
        headers:{
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    }).then((data) =>{
        return data.json()
    }).then((data) =>{
        porcentajeComisiones = data.porcentaje
        ComisionesDisponibles = data.comisiones
    })
}

const busquedaFiltro = (e) =>{
    e.preventDefault();
    let validacion = 0

    for (i = 0; i < $examenes.length; i++) {
        let validacion = 0
        if ($examenes[i].textContent.toLowerCase().includes(e.target.value.toLowerCase())) {
            $examenes[i].parentElement.classList.remove('filtro');
        } else if ($examenes[i].dataset.name) {
            if ($examenes[i].dataset.name.toLowerCase().includes(e.target.value.toLowerCase())) {
                $examenes[i].parentElement.classList.remove('filtro');
            } else {
                $examenes[i].parentElement.classList.add('filtro');
            }
        } else {
            $examenes[i].parentElement.classList.add('filtro');
        }
    }

    $titulosExamenes.forEach((titulo) => {
        let validacion = 0
        for (i = 0; i < titulo.nextElementSibling.children.length; i++) {
            if (titulo.nextElementSibling.children[i].classList.contains('filtro') == false) {
                validacion++
            }
        }
        if (validacion > 0) {
            titulo.parentElement.parentElement.parentElement.classList.remove('filtro');
        } else {
            titulo.parentElement.parentElement.parentElement.classList.add('filtro');
        }
    })
}

const actualizarPuntosUnitarios = (e) =>{
    let idExamen = e.target.dataset.id

    if(e.target.value <= 0){
        e.target.value = 1
    }

    listaExamenes = listaExamenes.map((data) =>{
        if(data.id == idExamen){
            data.puntosUnitarios = e.target.value
            data.puntos = (+data.cantidad * e.target.value).toFixed(2)
            e.target.parentElement.parentElement.lastElementChild.lastElementChild.value = data.puntos
        }
        return data
    }) 

    //ACTUALIZAR TOTALES
    let suma = listaExamenes.reduce((total, item) => (+total + +item.puntos).toFixed(2), 0)
    $puntosGenerados.textContent = suma
    if(+porcentajeComisiones >= 10){
        let factorMultiplicacion = `0.${porcentajeComisiones}`
        $puntosObtenidos.textContent = (+suma * +factorMultiplicacion).toFixed(2)
    }else{
        let factorMultiplicacion = `0.0${porcentajeComisiones}`
        $puntosObtenidos.textContent = (+suma * +factorMultiplicacion).toFixed(2)
    }

    let puntosTotalesComision2 = (+ComisionesDisponibles + +$puntosObtenidos.textContent).toFixed(2)

    document.getElementById('puntosTotalesFinales').textContent = $puntosGenerados.textContent
    document.getElementById('puntosObtenidosMedico').textContent = $puntosObtenidos.textContent
    document.getElementById('puntosActualesMedico').textContent = puntosTotalesComision2
     
}

const actualizarCantidadExamenes = (e) => {
    let idExamen = e.target.dataset.id

    if(e.target.value <= 0){
        e.target.value = 1
    }
    console.log(listaExamenes)

    listaExamenes = listaExamenes.map((data) =>{
        if(data.id == idExamen){
            if(+data.CantidadMaxima < e.target.value){
                e.target.value = +data.CantidadMaxima 
            }
            data.cantidad = e.target.value
            data.puntos = (+data.puntosUnitarios * e.target.value).toFixed(2)
            e.target.parentElement.parentElement.lastElementChild.lastElementChild.value = data.puntos
        }
        return data
    }) 

    //ACTUALIZAR TOTALES
    let suma = listaExamenes.reduce((total, item) => (+total + +item.puntos).toFixed(2), 0)
    $puntosGenerados.textContent = suma
    if(+porcentajeComisiones >= 10){
        let factorMultiplicacion = `0.${porcentajeComisiones}`
        $puntosObtenidos.textContent = (+suma * +factorMultiplicacion).toFixed(2)
    }else{
        let factorMultiplicacion = `0.0${porcentajeComisiones}`
        $puntosObtenidos.textContent = (+suma * +factorMultiplicacion).toFixed(2)
    }

    let puntosTotalesComision2 = (+ComisionesDisponibles + +$puntosObtenidos.textContent).toFixed(2)

    document.getElementById('puntosTotalesFinales').textContent = $puntosGenerados.textContent
    document.getElementById('puntosObtenidosMedico').textContent = $puntosObtenidos.textContent
    document.getElementById('puntosActualesMedico').textContent = puntosTotalesComision2
}


//Inicio de agregar examenes
d.addEventListener('keyup', e=>{
    if(e.target.matches('#search')){
        busquedaFiltro(e)
    }
    if(e.target.matches('.puntosUnitariosAgregado')){
        actualizarPuntosUnitarios(e)
    }
    if(e.target.matches('.cantidadExamenAgregado')){
        actualizarCantidadExamenes(e)
    }
})

let puntosDescuento = 0
d.addEventListener('change', e => {
        
        if (e.target.classList.contains('checkExamen')) {
            if (e.target.classList.contains('checkExamenInto')) {
                if (e.target.checked) {
                    let data = {
                        _idHijo : e.target.value,
                        id: e.target.dataset.id,
                        nombre: e.target.dataset.name,
                        puntosUnitarios: e.target.dataset.puntos,
                        puntos: e.target.dataset.puntos,
                        subtipo: e.target.dataset.subtipo,
                        CantidadMaxima: e.target.dataset.cantidadmaxima,
                        tipo: e.target.dataset.tipo,
                        cantidad: 1,
                        Comisones: e.target.dataset.comisiones,
                    }
                    listaExamenes.push(data);
                    $cantidadExamenes.textContent = listaExamenes.length
                    if(e.target.dataset.comisiones == 'true'){
                        let suma = listaExamenes.reduce((total, item) => (+total + +item.puntos).toFixed(2), 0)
                        $puntosGenerados.textContent = suma
                        if(+porcentajeComisiones >= 10){
                            let factorMultiplicacion = `0.${porcentajeComisiones}`
                            $puntosObtenidos.textContent = (+suma * +factorMultiplicacion).toFixed(2)
                        }else{
                            let factorMultiplicacion = `0.0${porcentajeComisiones}`
                            $puntosObtenidos.textContent = (+suma * +factorMultiplicacion).toFixed(2)
                        }
                    }
                } else {
                    listaExamenes = listaExamenes.filter(item => item.subtipo != e.target.dataset.subtipo);
                    $cantidadExamenes.textContent = listaExamenes.length
                    if(e.target.dataset.comisiones == 'true'){
                        let suma = listaExamenes.reduce((total, item) => (+total + +item.puntos).toFixed(2), 0)
                        $puntosGenerados.textContent = suma
                        if(+porcentajeComisiones >= 10){
                            let factorMultiplicacion = `0.${porcentajeComisiones}`
                            $puntosObtenidos.textContent = (+suma * +factorMultiplicacion).toFixed(2)
                        }else{
                            let factorMultiplicacion = `0.0${porcentajeComisiones}`
                            $puntosObtenidos.textContent = (+suma * +factorMultiplicacion).toFixed(2)
                        }
                    }
                    
                }

            } else if (e.target.classList.contains('checExamenText')) {
                if (e.target.value == '') {
                    e.target.parentElement.parentElement.parentElement.children[0].checked = false
                    listaExamenes = listaExamenes.filter(item => item.id != e.target.dataset.id);
                    $cantidadExamenes.textContent = listaExamenes.length
                    $puntosGenerados.textContent = puntos
                    if(e.target.dataset.comisiones == 'true'){
                        let suma = listaExamenes.reduce((total, item) => (+total + +item.puntos).toFixed(2), 0)
                        $puntosGenerados.textContent = suma
                        if(+porcentajeComisiones >= 10){
                            let factorMultiplicacion = `0.${porcentajeComisiones}`
                            $puntosObtenidos.textContent = (+suma * +factorMultiplicacion).toFixed(2)
                        }else{
                            let factorMultiplicacion = `0.0${porcentajeComisiones}`
                            $puntosObtenidos.textContent = (+suma * +factorMultiplicacion).toFixed(2)
                        }
                    }
                } else {
                    e.target.parentElement.parentElement.parentElement.children[0].checked = true
                    let data = {
                        id: e.target.dataset.id,
                        nombre: e.target.dataset.name,
                        puntos: e.target.dataset.puntos,
                        tipo: e.target.dataset.tipo,
                        cantidad: 1,
                        CantidadMaxima: e.target.dataset.cantidadmaxima,
                        puntosUnitarios: e.target.dataset.puntos,
                        agregadoPosterior: `${e.target.value} ${e.target.dataset.unidad}`,
                        Comisones: e.target.dataset.comisiones,

                    }
                    listaExamenes.push(data);
                    $cantidadExamenes.textContent = listaExamenes.length
                    if(e.target.dataset.comisiones == 'true'){
                        let suma = listaExamenes.reduce((total, item) => (+total + +item.puntos).toFixed(2), 0)
                        $puntosGenerados.textContent = suma
                        if(+porcentajeComisiones >= 10){
                            let factorMultiplicacion = `0.${porcentajeComisiones}`
                            $puntosObtenidos.textContent = (+suma * +factorMultiplicacion).toFixed(2)
                        }else{
                            let factorMultiplicacion = `0.0${porcentajeComisiones}`
                            $puntosObtenidos.textContent = (+suma * +factorMultiplicacion).toFixed(2)
                        }
                    }
                }
            } else {
                if (e.target.checked) {
                    let data = {
                        id: e.target.id,
                        nombre: e.target.dataset.name,
                        puntos: e.target.dataset.puntos,
                        tipo: e.target.dataset.tipo,
                        cantidad: 1,
                        CantidadMaxima: e.target.dataset.cantidadmaxima,
                        puntosUnitarios: e.target.dataset.puntos,
                        Comisones: e.target.dataset.comisiones,
                    }
                    listaExamenes.push(data);
                    $cantidadExamenes.textContent = listaExamenes.length
                    if(e.target.dataset.comisiones == 'true'){
                        let suma = listaExamenes.reduce((total, item) => (+total + +item.puntos).toFixed(2), 0)
                        $puntosGenerados.textContent = suma
                        if(+porcentajeComisiones >= 10){
                            let factorMultiplicacion = `0.${porcentajeComisiones}`
                            $puntosObtenidos.textContent = (+suma * +factorMultiplicacion).toFixed(2)
                        }else{
                            let factorMultiplicacion = `0.0${porcentajeComisiones}`
                            $puntosObtenidos.textContent = (+suma * +factorMultiplicacion).toFixed(2)
                        }
                    }
                    
                    
                } else {
                    listaExamenes = listaExamenes.filter(item => item.id != e.target.id);
                    $cantidadExamenes.textContent = listaExamenes.length
                    if(e.target.dataset.comisiones == 'true'){
                        let suma = listaExamenes.reduce((total, item) => (+total + +item.puntos).toFixed(2), 0)
                        $puntosGenerados.textContent = suma
                        if(+porcentajeComisiones >= 10){
                            let factorMultiplicacion = `0.${porcentajeComisiones}`
                            $puntosObtenidos.textContent = (+suma * +factorMultiplicacion).toFixed(2)
                        }else{
                            let factorMultiplicacion = `0.0${porcentajeComisiones}`
                            $puntosObtenidos.textContent = (+suma * +factorMultiplicacion).toFixed(2)
                        }
                    }

                }
            }
        }
    })
    //Fin de agregar examenes

//Inicio solcitud de informacion pacientes
$Paciente.onchange = () => {
        if ($Paciente.value != 0) {
            let data = {
                Paciente: $Paciente.value
            }
            fetch('/solicitar-datos-paciente', {
                    method: 'POST',
                    body: JSON.stringify(data),
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })
                .then(res => res.json())
                .then(res => {
                    $FechaNacimiento.value = res.FechaNacimiento
                    $Documento.value = res.Documento
                    $Telefono.value = res.Telefono
                    $Direccion.value = res.Direccion
                    $pacienteText.textContent = `${res.Nombres}`
                    $cedulaText.textContent = res.Documento
                    nombrePaciente = `${res.Nombres}`
                    //aqui
                    $Medico.innerHTML = "<option value='0'>--Seleccione el médico asignado--</option>"
                    for(i=0; i< res.MedicosAsginados.length; i++){
                        $Medico.innerHTML += `
                        <option value="${res.MedicosAsginados[i]._id}" data-cedula="${res.MedicosAsginados[i].Cedula}">${res.MedicosAsginados[i].Nombres} ${res.MedicosAsginados[i].Apellidos} - ${res.MedicosAsginados[i].Cedula}</option>
                        `
                    }
                    $Medico.disabled= false

                })
        } else {
            $FechaNacimiento.value = ''
            $Documento.value = ''
            $Telefono.value = ''
            $Direccion.value = ''
            $pacienteText.textContent = ''
            $cedulaText.textContent = ''
        }
    }
    //Fin solcitud de informacion pacientes

$Medico.onchange = () =>{
    if($Medico.value != 0){
        solicitarInfoMedico({Cedula: $Medico.options[$Medico.selectedIndex].dataset.cedula})
        $cardExamenes.style.display = 'block'
    }else{
        reiniciarData()
        $cardExamenes.style.display = 'none'
    }
}

//envio de datos
$btnGuardar.onclick = () => {
        if ($Paciente.value == 0) {
            //enviar error de paciente
            swal.fire({
                title: 'Error',
                text: 'Debe seleccionar un paciente',
                icon: 'error',
                button: 'Aceptar'
            })
        } else if($Medico.value == 0){
            swal.fire({
                title: 'Error',
                text: 'Debe seleccionar un medico',
                icon: 'error',
                button: 'Aceptar'
            })
        }  else {
            if (listaExamenes.length == 0) {
                //enviar error de examenes
                swal.fire({
                    title: 'Error',
                    text: 'Debe seleccionar al menos un examen',
                    icon: 'error',
                    button: 'Aceptar'
                })
            } else {
                let ul = ""
                console.log(listaExamenes)
                listaExamenes.forEach((examen) => {
                    if (examen.subtipo) {
                        li = `<li class="list-group-item" style="line-height: 1.2; background: white !important" >
                            <div class="row">
                                <div class="col-sm-12">
                                    ${examen.nombre}  ${examen.subtipo}
                                </div>
                                <div class="col-sm-12 mt-2">
                                    <div class="row">
                                        <div class="col-sm-4">
                                            <label>Cantidad</label>
                                            <input type="number" class="form-control cantidadExamenAgregado" data-id="${examen.id}" value="1" style="background-color:white !important; color:black !important" placehoder="Introduzca la cantidad">
                                        </div>
                                        <div class="col-sm-4">
                                            <label>Puntos U.</label>
                                            <input type="number" class="form-control puntosUnitariosAgregado" data-id="${examen.id}" value="${examen.puntosUnitarios}" style="background-color:white !important; color:black !important" placehoder="Introduzca los puntos unitarios">
                                        </div>
                                        <div class="col-sm-4">
                                            <label>Puntos T.</label>
                                            <input type="number" class="form-control puntosTotalesAgregado" data-id="${examen.id}" value="${examen.puntos}" style="background-color:white !important; color:black !important" placehoder="Puntos totales" readonly>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </li>`
                        ul += li
                    } else if (examen.agregadoPosterior) {
                        li = `<li class="list-group-item" style="line-height: 1.2; background: white !important">
                                <div class="row">
                                    <div class="col-sm-12">
                                        ${examen.nombre}  ${examen.agregadoPosterior}
                                    </div>
                                    <div class="col-sm-12 mt-2">
                                    <div class="row">
                                        <div class="col-sm-4">
                                            <label>Cantidad</label>
                                            <input type="number" class="form-control cantidadExamenAgregado" data-id="${examen.id}" value="1" style="background-color:white !important; color:black !important" placehoder="Introduzca la cantidad">
                                        </div>
                                        <div class="col-sm-4">
                                            <label>Puntos U.</label>
                                            <input type="number" class="form-control puntosUnitariosAgregado" data-id="${examen.id}" value="${examen.puntosUnitarios}" style="background-color:white !important; color:black !important" placehoder="Introduzca los puntos unitarios">
                                        </div>
                                        <div class="col-sm-4">
                                            <label>Puntos T.</label>
                                            <input type="number" class="form-control puntosTotalesAgregado" data-id="${examen.id}" value="${examen.puntos}" style="background-color:white !important; color:black !important" placehoder="Puntos totales" readonly>
                                        </div>
                                    </div>
                                </div>
                                </div>
                             </li>`
                        ul += li
                    } else {
                        li = `<li class="list-group-item" style="line-height: 1.2; background: white !important">
                            <div class="row">
                                <div class="col-sm-12">
                                    ${examen.nombre}
                                </div>
                                <div class="col-sm-12 mt-2">
                                    <div class="row">
                                        <div class="col-sm-4">
                                            <label>Cantidad</label>
                                            <input type="number" class="form-control cantidadExamenAgregado" data-id="${examen.id}" value="1" style="background-color:white !important; color:black !important" placehoder="Introduzca la cantidad">
                                        </div>
                                        <div class="col-sm-4">
                                            <label>Puntos U.</label>
                                            <input type="number" class="form-control puntosUnitariosAgregado" data-id="${examen.id}" value="${examen.puntosUnitarios}" style="background-color:white !important; color:black !important" placehoder="Introduzca los puntos unitarios">
                                        </div>
                                        <div class="col-sm-4">
                                            <label>Puntos T.</label>
                                            <input type="number" class="form-control puntosTotalesAgregado" data-id="${examen.id}"  value="${examen.puntos}" style="background-color:white !important; color:black !important" placehoder="Puntos totales" readonly>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </li>`
                        ul += li
                    }
                })
                let puntosTotalesComision = (+ComisionesDisponibles + +$puntosObtenidos.textContent).toFixed(2)
                let options = ""
                
                if(+puntosTotalesComision >= +$puntosGenerados.textContent){
                    options = `
                        <option value="0" selected>0</option>
                        <option value="5">5</option>
                        <option value="10">10</option>
                        <option value="25">25</option>
                        <option value="50">50</option>
                        <option value="75">75</option>
                        <option value="100">100</option>
                    `
                }else{
                    if(+puntosTotalesComision >= (+$puntosGenerados.textContent * +`0.75`).toFixed(2)){
                        options = `
                            <option value="0" selected>0</option>
                            <option value="5">5</option>
                            <option value="10">10</option>
                            <option value="25">25</option>
                            <option value="50">50</option>
                            <option value="75">75</option>
                            <option value="100" disabled>100 (No disponible) </option>
                        `
                    }else{
                        if(+puntosTotalesComision >= (+$puntosGenerados.textContent * +`0.50`).toFixed(2)){
                            options = `
                                <option value="0" selected>0</option>
                                <option value="5">5</option>
                                <option value="10">10</option>
                                <option value="25">25</option>
                                <option value="50">50</option>
                                <option value="75" disabled>75 (No disponible) </option>
                                <option value="100" disabled>100 (No disponible) </option>
                            `
                        }else{
                            if(+puntosTotalesComision >= (+$puntosGenerados.textContent * +`0.25`).toFixed(2)){
                                options = `
                                    <option value="0" selected>0</option>
                                    <option value="5">5</option>
                                    <option value="10">10</option>
                                    <option value="25">25</option>
                                    <option value="50" disabled>50 (No disponible) </option>
                                    <option value="75" disabled>75 (No disponible) </option>
                                    <option value="100" disabled>100 (No disponible) </option>
                                `
                            }else{
                                if(+puntosTotalesComision >= (+$puntosGenerados.textContent * +`0.25`).toFixed(2)){
                                    options = `
                                        <option value="0" selected>0</option>
                                        <option value="5">5</option>
                                        <option value="10">10</option>
                                        <option value="25" disabled>25 (No disponible) </option>
                                        <option value="50" disabled>50 (No disponible) </option>
                                        <option value="75" disabled>75 (No disponible) </option>
                                        <option value="100" disabled>100 (No disponible) </option>
                                    `
                                }else{
                                    if(+puntosTotalesComision >= (+$puntosGenerados.textContent * +`0.10`).toFixed(2)){
                                        options = `
                                            <option value="0" selected>0</option>
                                            <option value="5">5</option>
                                            <option value="10"disabled>10 (No disponible) </option>
                                            <option value="25" disabled>25 (No disponible) </option>
                                            <option value="50" disabled>50 (No disponible) </option>
                                            <option value="75" disabled>75 (No disponible) </option>
                                            <option value="100" disabled>100 (No disponible) </option>
                                        `
                                    }else{
                                        if(+puntosTotalesComision >= (+$puntosGenerados.textContent * +`0.05`).toFixed(2)){
                                            options = `
                                                <option value="0" selected>0</option>
                                                <option value="5" >5</option>
                                                <option value="10"disabled>10 (No disponible) </option>
                                                <option value="25" disabled>25 (No disponible) </option>
                                                <option value="50" disabled>50 (No disponible) </option>
                                                <option value="75" disabled>75 (No disponible) </option>
                                                <option value="100" disabled>100 (No disponible) </option>
                                            `
                                        }else{
                                            options = `
                                                <option value="0" selected>0</option>
                                                <option value="5" disabled>5 (No disponible) </option>
                                                <option value="10" disabled>10 (No disponible) </option>
                                                <option value="25" disabled>25 (No disponible) </option>
                                                <option value="50" disabled>50 (No disponible) </option>
                                                <option value="75" disabled>75 (No disponible) </option>
                                                <option value="100" disabled>100 (No disponible) </option>
                                            `
                                        }
                                    }
                                }
                            }
                        }

                    }
                }

                swal.fire({
                    title: 'Resumen de solicitud',
                    type: 'info',
                    html: `
                    <h3><u>${nombrePaciente}</u></h3>
                    <div class="accordion-item">
                        <h2 class="accordion-header" id="headingTwo">
                            <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseTwo" aria-expanded="false" aria-controls="collapseTwo">
                                Resumen de solicitudes
                            </button>
                        </h2>
                        <div id="collapseTwo" class="accordion-collapse collapse" aria-labelledby="headingTwo" data-bs-parent="#accordionExample">
                            <div class="accordion-body">
                                <ol class="list-group list-group-flush" style="background: white !important">
                                    ${ul}
                                </ol>
                            </div>
                        </div>
                    </div>
                    </br>
                    <p class="text-left text-info">Observación / Peticiones adicionales:</p>
                    <textarea name="" id="ObservacionFinal" cols="30" rows="2" class="form-control labelCkeck" 
                    placeholder="Introduzca observación o petición adicional" 
                    style="border:none; border-bottom: 1px solid #1890ff; padding: 5px 10px; outline: none; background-color:white !important; color:black !important">${$Observacion.value}</textarea>
                    </br>
                    <div class="">
                        <div class=" text-start">
                          <p style="font-size:13px">Puntos total de la solicitud= <span id="puntosTotalesFinales">${$puntosGenerados.textContent}</span></p>  
                        </div>
                        <div class=" text-start">
                          <p style="font-size:13px">Puntos a obtener= <span id="puntosObtenidosMedico">${$puntosObtenidos.textContent}</span></p>  
                        </div>
                        <div class=" text-start">
                          <p style="font-size:13px">Puntos totales (Comisiones)= <span id="puntosActualesMedico">${puntosTotalesComision}</span></p>  
                        </div>
                        <div class=" mt-2">
                            <label class="Descuento">Descuento <span class="text-muted">(Opcional)</span> </label>
                            <input class="form-control" id="Descuento" value="0" style="background-color:white !important; color:black !important" placehoder="Introduzca el descuento"/>
                        </div>
                        <div>
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" value="" id="noGeneraComision">
                            <label class="form-check-label" for="noGeneraComision">
                                No generar puntos al médico
                            </label>
                        </div>
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" value="" id="noGenerarPuntos">
                            <label class="form-check-label" for="noGenerarPuntos">
                                No generar puntos
                            </label>
                        </div>
                        </div>
                    </div>


                `,
                    showCloseButton: true,
                    showCancelButton: true,
                    confirmButtonText: 'Procesar',
                    cancelButtonText: 'Cancelar',
                }).then((data) => {
                    if (data.isConfirmed) {
                        let data = {
                            Paciente: $Paciente.value,
                            listaExamenes,
                            Observacion: d.getElementById('ObservacionFinal').value,
                            DescuentoPuntos: d.getElementById('Descuento').value || 0,
                            PuntosDescuento: d.getElementById('Descuento').value || 0,
                            PuntosFinal : d.getElementById('puntosTotalesFinales').textContent,
                            puntosObtenidosMedico : d.getElementById('puntosObtenidosMedico').textContent,
                            puntosActualesMedico :  d.getElementById('puntosActualesMedico').textContent,
                            puntosTotalesFinales :  d.getElementById('puntosTotalesFinales').textContent,
                            noGeneraComision : d.getElementById('noGeneraComision').checked,
                            noGenerarPuntos :  d.getElementById('noGenerarPuntos').checked,
                            Medico : $Medico.value,
                        }
                        swal.fire({
                            title: 'Registrando solicitud',
                            html: `
                            <div class="my-3 spinner-border avatar-lg text-success" role="status"></div>
                            `,
                            allowOutsideClick: false,
                            showCancelButton: false,
                            showConfirmButton: false
                        })
                        fetch('/medico/nuevo-admin', {
                            method: 'POST',
                            body: JSON.stringify(data),
                            headers: {
                                'Content-Type': 'application/json',
                            }
                        }).then((res) => {
                            return res.json()
                        }).then((res) => {
                            swal.fire({
                                title: 'Solicitud registrada correctamente',
                                type: 'success',
                                icon: 'success',
                                timer: 2000,
                                allowOutsideClick: false,
                            })
                            let examenesCheck = d.querySelectorAll('.checkExamen')
                            for (i = 0; i < examenesCheck.length; i++) {
                                if (examenesCheck[i].checked) {
                                    examenesCheck[i].checked = false
                                }
                            }
                            $("#Paciente").select2("val", "0");
                                
                            $cardExamenes.style.display = 'none'
                            
                            $Medico.innerHTML = '<option value="0">--Seleccione el médico asignado--</option>'
                            $Medico.disabled = true
                            $FechaNacimiento.value = ''
                            $Documento.value = ''
                            $Telefono.value = ''
                            $Direccion.value = ''
                            $pacienteText.textContent = ''
                            $cedulaText.textContent = ''
                            $pacienteText.textContent = ''
                            $cedulaText.textContent = ''
                            $cantidadExamenes.textContent = ''
                            $puntosGenerados.textContent = ''
                            $Observacion.textContent = ''
                            $Observacion.value = ''
                            $puntosObtenidos.textContent = ''
                            listaExamenes = []

                        })
                    }
                })
            }
        }
    }
    //fin envio de datos