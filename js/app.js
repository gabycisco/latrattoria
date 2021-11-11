var app = angular.module("app", []);

app.controller("controlador", function($scope, $http){
    var vm = this;

    /* INICIALIZA LAS VARIABLES DEL PROYECTO */
    vm.inicializarVariables = ()  => {
        vm.msjError = ""
        vm.msjInfo  = ""
        vm.denuncias = {
            new: "",
            published: "",
            erased: ""
        }
        vm.mensajes = {
            new: "",
            published: "",
            erased: ""
        }

        vm.denuncia_form = {
            date:"",
            time:"",
            adress:"",
            type:"Seleccioná una opción",
            detail:""
        }
        vm.contact_form  = {
            name:   "",
            email:  "",
            phone:  "",
            message: ""
        }

        vm.mensajes_recibidos = ""
        
        vm.get_denuncias("Published")
        vm.get_mensajes("all")
    }

    /* VALIDA EL FORMULARIO DE CONTACTO */
    vm.validate_contact_form =() => {
        
        vm.msjError = ""
        let $errorConter = 0

        if(vm.contact_form.name == "" || vm.contact_form.message == ""){
            $errorConter++
            vm.msjError = "INCOMPLETE"
            vm.mostrar_msjError()
        }
        
        if($errorConter == 0) {
            vm.add_mensaje()
        }

    }

    /* AGREGA EL MSJ AL JSON DE MENSAJES */
    vm.add_mensaje = () => {

        vm.msjError = ""
        let $req = `./webservice/import/import_mensaje.php`

        $http.get($req, {
            params: {
                NAME:       vm.contact_form.name,
                EMAIL:      vm.contact_form.email,
                PHONE:      vm.contact_form.phone,
                MESSAGE:    vm.contact_form.message
            },
            headers: {}
        })
        .then(function (response) {
            
            let $temp = response.data
            vm.msjError = $temp.STATUS
            if($temp.STATUS == 'SUCCESS'){
                vm.msjError = 'MSJ'
            }
            vm.msjInfo  = $temp.INFO
            vm.mostrar_msjError()
            vm.inicializarVariables()
            
        }, function (x) {
            // Request error
        });   
    }

    /* VALIDADOR DEL FORMULARIO DE DENUNCIAS */
    vm.validate_denuncia =() => {
        
        vm.msjError = ""
        let $errorConter = 0

        if(vm.denuncia_form.date == "") {
            $errorConter++
        } else {
            /* COMBIERTE EL FORMATO DE LA FECHA AL DESEADO */
            let $denuncia_date       = new Date(vm.denuncia_form.date);
            let year    = $denuncia_date.getFullYear();
            let month   = $denuncia_date.getMonth() + 1;
            let date    = $denuncia_date.getDate();      

            /* vm.denuncia_form.date = date + '/' + month + '/' + year  ; */
            vm.denuncia_form.date = year + '-' + month + '-' + date 
            console.log(vm.denuncia_form.date);
        }

        if(vm.denuncia_form.time == "" || vm.denuncia_form.adress == "" || vm.denuncia_form.detail == ""){
            $errorConter++
            vm.msjError = "INCOMPLETE"
            vm.mostrar_msjError()
        }
        
        if($errorConter == 0) {
            vm.add_denuncia()
        }

    }

    /* AGREGAR DENUNCIA AL JSON DE DENUNCIAS */
    vm.add_denuncia = () => {

        vm.msjError = ""
        if(vm.denuncia_form.type == "Seleccioná una opción") {
            vm.denuncia_form.type = "Sin informar"
        }

        let $req = `./webservice/import/import_denuncia.php`
        $http.get($req, {
            params: {
                DATE: vm.denuncia_form.date,
                TIME: vm.denuncia_form.time,
                ADRESS: vm.denuncia_form.adress,
                TYPE: vm.denuncia_form.type,
                DETAIL: vm.denuncia_form.detail
            },
            headers: {}
        })
        .then(function (response) {
            
            let $temp = response.data
            vm.msjError = $temp.STATUS
            vm.msjInfo  = $temp.INFO
            vm.mostrar_msjError()
            vm.inicializarVariables()
            /* $('#exampleModal').hide();
            $('.modal-backdrop').hide(); */
            
        }, function (x) {
            // Request error
        });   
    }

    /* ACTUALIZA EL ESTATUS DE LAS DENUNCIAS */
    vm.update_denuncia_status = ($status, $fecha_unix) => {

        vm.msjError = ""

        let $req = `./webservice/update/update_denuncia_status.php`

        $http.get($req, {
            params: {
                STATUS: $status,
                FECHA_UNIX: $fecha_unix
            },
            headers: {}
        })
        .then(function (response) {
            
            /* let $temp = response.data */
            vm.get_denuncias('All')

            
        }, function (x) {
            // Request error
        });   
    }


    /* LEE EL JSON DE DENUNCIAS RECIBIDAS Y LO GUARDA EN UN ARRAY*/
    vm.get_denuncias = ($status) => {
        let $req = `./webservice/request/request_denuncias.php`

        $http.get($req, {
            params: {
                STATUS: $status
            },
            headers: {}
        })
        .then(function (response) {
            
            let $temp = response.data

            switch ($status) {
                case 'New':
                    vm.denuncias.new = $temp.DATA
                    break;
                case 'Published':
                    vm.denuncias.published = $temp.DATA
                    break;
                case 'Erased':
                    vm.denuncias.erased = $temp.DATA
                    break;  
                case 'All':
                    vm.denuncias.new = $temp.DATA.New
                    vm.denuncias.published = $temp.DATA.Published
                    vm.denuncias.erased = $temp.DATA.Erased
                    break;  
            }

        }, function (x) {
            // Request error
        });   
    }

    /* LEE EL JSON DE MENSAJES RECIBIDOS Y LO GUARDA EN UN ARRAY*/
    vm.get_mensajes = ($status) => {

        let $req = `./webservice/request/request_mensajes.php`
        $http.get($req, {
            params: {
                STATUS: $status
            },
            headers: {}
        })
        .then(function (response) {
            
            let $temp = response.data
            vm.mensajes_recibidos = $temp.DATA
            
        }, function (x) {
            // Request error
        });   
    }

    /* MOSTRAR MSJ DE SWEET ALERT 2 */
    vm.mostrar_msjError = () => {


        switch (vm.msjError) {

            case "SUCCESS":
                $msj_icon = 'success'
                $msj_title= 'Denuncia Registrada',
                $msj_text = vm.msjInfo
                break;
            
            case "MSJ":
                $msj_icon = 'success'
                $msj_title= 'Recibimos tu mensaje',
                $msj_text = vm.msjInfo
                break;
            
            case "INCOMPLETE":
                $msj_icon = 'warning'
                $msj_title= 'Oops...',
                $msj_text = "Por favor complete los campos antes de enviar el formulario."
                break;
        }

        if (vm.msjError == "SUCCESS" || vm.msjError == "MSJ" || vm.msjError == "help") {

            if (vm.msjError == "help") {
                $aux_allowOutsideClick = false;
            }
            else{
                $aux_allowOutsideClick = true;
            }

            Swal.fire({
                icon: $msj_icon,
                title:$msj_title,
                text: $msj_text,
                showCloseButton: true,
                allowOutsideClick: $aux_allowOutsideClick,
                /* footer: '<a href>Why do I have this issue?</a>' */
            })
        }
        else{
            let timerInterval
            Swal.fire({
                icon: $msj_icon,
                /* title: 'Faltan datos...', */
                html: $msj_text,
                timer: 3000,
                timerProgressBar: true,
                /* allowOutsideClick: false, */
                showCloseButton: true,
                didOpen: () => {
                    Swal.showLoading()
                    timerInterval = setInterval(() => {
                    const content = Swal.getContent()
                    if (content) {
                        const b = content.querySelector('b')
                        if (b) {
                        b.textContent = Swal.getTimerLeft()
                        }
                    }


                    }, 100)
                },
                willClose: () => {
                    clearInterval(timerInterval)
                }
            }).then((result) => {
            /* Read more about handling dismissals below */
            if (result.dismiss === Swal.DismissReason.timer) {
                /* console.log('I was closed by the timer') */
            }
            })
        }
        

        
    }

    //CAMBIA EN LA VISTA EL FORMATO DE FECHA '2021-10-31' A '31-10-2021'
    vm.change_date_format = ($date) => {

        console.log(`$date: ${$date}`)
        let months          = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']

        let $denuncia_date  = new Date($date)
        let year            = $denuncia_date.getFullYear()
        let month           = months[$date.substr(5,2)-1]
        let date            = $date.substr($date.length - 2)

        $date               = date + ' ' + month + ' ' + year 
        console.log(`$date: ${$date}`)
        return $date
    }


    vm.inicializarVariables()
})