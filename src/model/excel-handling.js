const XLSX = require('xlsx');
const fs = require('fs');

const dayjs = require('dayjs');
const customParseFormat = require('dayjs/plugin/customParseFormat');
const localizedFormat = require('dayjs/plugin/localizedFormat');
const { type } = require('os');
const { sortDatesWithoutRepeating } = require('../helper');
dayjs.extend(customParseFormat);
dayjs.extend(localizedFormat);

class ExcelHandling {


    constructor() {

        this.fileFolderPath = './src/data/excelToJson.json';
        
    }


    excelToJson ( data ) {

        const workbook = XLSX.readFile( data );

        const workbookSheets = workbook.SheetNames;


        // console.log('********** Arreglo de hojas que contiene el excel **********');
        console.log( workbookSheets );


        // Obtener la primera hoja del excel
        const sheet = workbookSheets[0];


        // Convertir los datos de excel a formato JSON
        const dataToJson = XLSX.utils.sheet_to_json( workbook.Sheets[ sheet ] );


        return dataToJson;
        

    }


    jsonToExcel( data, sheetName = "" ) {


        // Convertir los datos de json a excel
        const workSheet = XLSX.utils.json_to_sheet( data );

        const workbook = XLSX.utils.book_new();


        XLSX.utils.book_append_sheet( workbook, workSheet, sheetName );

        XLSX.writeFile(workbook, './src/data/prueba-fina.xlsx');

        // XLSX.utils.book_append_sheet( workSheet, workbook, sheetName );

        // const workbookSheet = dataToJson.Sheets[sheetName ?? ""];
        // XLSX.utils.sheet_add_aoa( workbookSheet, [["Created "+new Date().toISOString()]], {origin:-1} );
        

        // XLSX.write( workbook, {bookType: 'xlsx', type:'buffer'});
        
    }



    // recibir los datos en formato json y guardarla en un archivo
    saveFile( data ) {

        fs.writeFileSync( this.fileFolderPath, JSON.stringify( data ) );
        
    }



    // metodo que recibe un archivo json
    dataFilterByPatientCodes( data = [], Columnfilter = '' ) {

        let patientsFilter = [];
        

        //arreglo filtrado con la Columna recibida
        const hCPacientes = data.map( column => column[Columnfilter] );
 

        //insertar en la lista hcPatientsFilter los codigos sin repetirse
        hCPacientes.map( filter =>  !patientsFilter.includes( filter ) && patientsFilter.push( filter ) );
        

        //retorna la lista de codigos de pacientes (h c paciente) sin repetirse
        return patientsFilter;
        
        
    }



    // agrupar pacientes por H-C-PACIENTE. parámetros ==> ( COLUMNA, DATOS DE EXCEL EN FORMATO JSON )
    dataGroupByColumn( column,  columnRows = [], data = [] ) {

        let patientsGroupByColumn = [];


        columnRows.map( columna => {


            let temp = data.filter(  filtro => filtro[column] === columna );
            

            patientsGroupByColumn.push( temp );
            
            
        });

        
        return patientsGroupByColumn;
        
    }



    dataFilterByDateAttenction(  data=[], hcPaciente=[] ) {

        const newData = [];

        const dateTemp = [520, 5733, 2412];
        
        dateTemp.map( hc => {


            const groupPatient = data.filter( filtro => filtro.H_C_PACIENTE === hc );
            

            const auxYears = [];
            groupPatient.map( patient => {

                auxYears.push( dayjs( patient.FECHA_ATENCION, 'DD/MM/YYYY').year() );

            });


            //meotodo para ordenar los años sin repetirse
            const years = sortDatesWithoutRepeating( auxYears );


            years.forEach( year => {

                const auxMonths = [];

                //**********SACAR MESES**********
                //obtener todas las fechas de citas de un año
                const patientByYear = groupPatient.filter( gp => dayjs(gp.FECHA_ATENCION,'DD/MM/YYYY').year() === year );

                //de las fechas obtenidas se extraen los meses
                patientByYear.map( auxPat => auxMonths.push( dayjs( auxPat.FECHA_ATENCION, 'DD/MM/YYYY').month() + 1 ) );

                //metodo para ordenar los meses sin repetirse
                const months = sortDatesWithoutRepeating( auxMonths );


                months.forEach( month => {


                    const auxDays = [];

                    //**********OBTENER EL MES ACTUAL**********
                    const patientByMonth = patientByYear.filter( pby => (dayjs(pby.FECHA_ATENCION,'DD/MM/YYYY').month() + 1) === month );

                    patientByMonth.map( pbm => auxDays.push( dayjs( pbm.FECHA_ATENCION, 'DD/MM/YYYY').date() ) );

                    const days = sortDatesWithoutRepeating( auxDays );


                    let newDataPatient = {};

                    let contAttention = 1;
                    let fechaInicial;
                    let fechaFinal;
                    let fecha;
                    
                    days.forEach( day => {


                        const auxHours = [];

                        //**********OBTENER LOS DIAS DEL MES ACTUAL**********
                        const patientByDays = patientByMonth.filter( pbm => (dayjs(pbm.FECHA_ATENCION,'DD/MM/YYYY').date()) === day );

                        patientByDays.map( pbd => {

                            const patientDays = (pbd.HORA_ATENCION * 24).toFixed(2);
                            let hours = Math.floor(patientDays);
                            // let minuto = ( ( Number(patientHours.toString().split('.')[1]) * 60) / 100).toFixed() || 0;

                            auxHours.push( hours );
                            
                        });

                        const hours = sortDatesWithoutRepeating( auxHours );



                        //sacar la fecha inicial y la fecha final de la cita
                        patientByMonth.map( patientMonth => {

                            fecha = dayjs(patientMonth.FECHA_ATENCION,'DD/MM/YYYY');

                            if( (dayjs(patientMonth.FECHA_ATENCION,'DD/MM/YYYY').date()) === day ) {

                                // console.log(`${hc}    => AÑO: ${year}   => MES: ${month}    => DÍA: ${day}   => ${contAttention}`);

                                if( contAttention === 1 ) {

                                    fechaInicial = dayjs(patientMonth.FECHA_ATENCION, 'DD/MM/YYYY');
                                    fechaFinal   = dayjs(patientMonth.FECHA_ATENCION, 'DD/MM/YYYY');
                                    
                                } else {
                                    
                                    if(!fechaInicial.isBefore( fecha )) fechaInicial = fecha
        
                                    if(!fechaFinal.isAfter( fecha )) fechaFinal = fecha
                                }
                                
                            }
                            
                        });
                        
                        // console.log('***********************************');
                        // console.log('ARREGLO DE HORAS 0RDENADOS', hours);


                        hours.forEach( hour => {

                            const auxMinutes = [];

                            //**********OBTENER LOS DIAS DEL MES ACTUAL**********
                            const patientByHour = patientByDays.filter( pbd => Math.floor( (pbd.HORA_ATENCION * 24).toFixed(2) ) === hour );

                            patientByHour.map( pbh => {
    
                                const patientHour = (pbh.HORA_ATENCION * 24).toFixed(2);
                                // let hours = Math.floor(patientHour);
                                let minutes = ( ( Number(patientHour.toString().split('.')[1]) * 60) / 100).toFixed() || 0;
                                minutes = minutes.padStart(2,0);
    
                                auxMinutes.push( Number(minutes) );

                            });
    
                            
                            const minutes = sortDatesWithoutRepeating( auxMinutes );

                            // console.log('ARREGLO DE MINUTOS 0RDENADOS', minutes);

                            minutes.forEach( minute => {

                                //objeto para insertar las citas de un mismo mes
                                // let newDataPatient = {};

                                patientByHour.map( patientHour => {

                                    let auxPatientHour = (patientHour.HORA_ATENCION * 24).toFixed(2);
                                    auxPatientHour = ( (Number(auxPatientHour.toString().split('.')[1]) * 60) / 100).toFixed() || 0;
                                    auxPatientHour = auxPatientHour.padStart(2.0);


                                    // console.log(`${Number(auxPatientHour)} === ${minute}`)
                                    // console.log(`${Number(auxPatientHour) === minute}`)

                                    if( Number(auxPatientHour) === minute ) {


                                        const { H_C_PACIENTE, TIPO_ATENCION, ESPECIALIDAD_CE, TIPO_CITA, FECHA_ATENCION, HORA_ATENCION, COD_DEP, DEPENDENCIA, COD_MED, NOM_MEDICO, TIPO_DIAG, Desc_Diagnóstico, Desc_Diagnóstico_Pres_1, Des_Diagnóstico_Pres_2, Des_Diagnóstico_Pres_3, desc_Diagnóstico_Def_1, Desc_Diagnóstico_Def_2 } = patientHour;
                                        

                                        newDataPatient = {

                                            ...newDataPatient,
                
                                            H_C_PACIENTE,
                                            ['FECHA_ATENCION_INICIAL']          : fechaInicial.format('DD/MM/YYYY'),
                                            ['FECHA_ATENCION_FINAL']            : fechaFinal.format('DD/MM/YYYY'),
                
                                            // [`TIPO_ATENCION_ATENCION_${contAttention}`]           : TIPO_ATENCION,
                                            // [`ESPECIALIDAD_CE_ATENCION_${contAttention}`]         : ESPECIALIDAD_CE,
                                            // [`TIPO_CITA_ATENCION_${contAttention}`]               : TIPO_CITA,
                                            [`FECHA_ATENCION_ATENCION_${contAttention}`]          : FECHA_ATENCION,
                                            [`HORA_ATENCION_ATENCION_${contAttention}`]           : HORA_ATENCION,
                                            // [`COD_DEP_ATENCION_${contAttention}`]                 : COD_DEP,
                                            // [`DEPENDENCIA_ATENCION_${contAttention}`]             : DEPENDENCIA,
                                            // [`COD_MED_ATENCION_${contAttention}`]                 : COD_MED,
                                            // [`NOM_MEDICO_ATENCION_${contAttention}`]              : NOM_MEDICO,
                                            // [`TIPO_DIAG_ATENCION_${contAttention}`]               : TIPO_DIAG,
                                            // [`Desc_Diagnostico_ATENCION_${contAttention}`]        : Desc_Diagnóstico,
                                            // [`Desc_Diagnostico_Pres_1_ATENCION_${contAttention}`] : Desc_Diagnóstico_Pres_1,
                                            // [`Des_Diagnostico_Pres_2_ATENCION_${contAttention}`]  : Des_Diagnóstico_Pres_2,
                                            // [`Des_Diagnostico_Pres_3_ATENCION_${contAttention}`]  : Des_Diagnóstico_Pres_3,
                                            // [`desc_Diagnostico_Def_1_ATENCION_${contAttention}`]  : desc_Diagnóstico_Def_1,
                                            // [`Desc_Diagnostico_Def_2_ATENCION_${contAttention}`]  : Desc_Diagnóstico_Def_2
                
                                            // ...rest
                                            
                                        };
                                        
                                        
                                        contAttention++;
                                    }

                                });

                                
                            });

                            
                        });
                        

                    });

                    // const dataTemp2 = groupPatient.find( groupPat => {


                    //     return (dayjs(groupPat.FECHA_ATENCION, 'DD/MM/YYYY').month() + 1) === month
                        
                        
                    // });
    
    
                    // const { H_C_PACIENTE, TIPO_ATENCION, ESPECIALIDAD_CE, TIPO_CITA, FECHA_ATENCION, HORA_ATENCION, COD_DEP, DEPENDENCIA, COD_MED, NOM_MEDICO, TIPO_DIAG, Desc_Diagnóstico, Desc_Diagnóstico_Pres_1, Des_Diagnóstico_Pres_2, Des_Diagnóstico_Pres_3, desc_Diagnóstico_Def_1, Desc_Diagnóstico_Def_2, ...rest } = dataTemp2;
    
    
                    // newDataPatient = { ...newDataPatient, ...rest };
    
                    newData.push( newDataPatient );
                    
                });

                
            });

            
        });

        console.log(newData);
        
        return newData;

    }
    
    
}

module.exports = ExcelHandling;