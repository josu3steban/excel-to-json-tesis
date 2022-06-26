

const dateFormat = ( data ) => {


    const newData = [];


    data.map( paciente => {


        
        const fechaAtencion         =   formatearFechaExcel( paciente.FECHA_ATENCION )
        // const fechaNacimiento       =   formatearFechaExcel( paciente.FEC_NACIMIENTO )
        // const fechaActualizacion    =   formatearFechaExcel( paciente.FECHA_ACTUALIZACION )
    
    
        // fecha.toLocaleDateString('es-ES', {
        //     year: 'numeric',
        //     month: '2-digit',
        //     day: '2-digit'
        // });



        newData.push({
            ...paciente,
            FECHA_ATENCION        : fechaAtencion
            // FEC_NACIMIENTO        : fechaNacimiento,
            // FECHA_ACTUALIZACION   : fechaActualizacion
        });
        
        
    });


    return newData;
    
    
}




function formatearFechaExcel(fechaExcel) {

    let diasUTC = Math.floor(fechaExcel - 25569);

    let valorUTC = diasUTC * 86400;

    let infoFecha = new Date(valorUTC * 1000);


    let diaFraccionado = fechaExcel - Math.floor(fechaExcel) + 0.0000001;

    let totalSegundosDia = Math.floor(86400 * diaFraccionado);

    let segundos = totalSegundosDia % 60;

    totalSegundosDia -= segundos;


    let horas = Math.floor(totalSegundosDia / (60 * 60));

    let minutos = Math.floor(totalSegundosDia / 60) % 60;

    
    // Convertidos a 2 dígitos
    infoFecha.setDate(infoFecha.getDate() + 1);

    let dia = ('0' + infoFecha.getDate()).slice(-2);

    let mes = ('0' + (infoFecha.getMonth() + 1)).slice(-2);
    
    let anio = infoFecha.getFullYear();

    let fecha = `${dia}/${mes}/${anio}`;

    return   fecha;

}






module.exports = {
    dateFormat
}