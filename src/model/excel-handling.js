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


            // let months = [];
            
            // const monthsFilter = [];


            const groupPatient = data.filter( filtro => filtro.H_C_PACIENTE === hc );
            

            // months = groupPatient.map( patient => {
                
                
            //     return dayjs(patient.FECHA_ATENCION, 'DD/MM/YYYY').month() + 1;

            
            // });



            // months.map( month => !monthsFilter.includes( month ) && monthsFilter.push( month ) );


            // //objeto para guardar los meses que ha tenido cita un paciente
            // let mostRepeatedMonth = {};


            // //objeto para guardar los meses que ha tenido cita un paciente
            // let mostRepeatedMonthOrdered = {};


            // //crea un objeto con los meses en numero con el valor de 0
            // monthsFilter.map( month => {

            //     // mostRepeatedMonth.H_C_PACIENTE = hc;
            //     mostRepeatedMonth[month] = 0;
                
            // });



            // //hace un conteo de los meses que tiene un paciente y los va sumando al objeto de los meses para tener el total de veces que se repite (total de citas que tiene en un mes )
            // //ejem. { 3: 1,  5: 4,  11: 9 } ==> ejemp. descriptivo { marzo: 1,  mayo: 4,  noviembre: 9 }
            // months.map( (month ) => {


            //     monthsFilter.map( monthF => {


            //         if(month === monthF) {

            //             mostRepeatedMonth[monthF] = mostRepeatedMonth[monthF] + 1;
                        
            //         }
                         
                    
            //     });
                
                
            // });



            // //array para guardar las veces que se repite cada mes
            // //ejem. [ 1,  4,  9 ]
            // const list = [];
            
            // Object.keys( mostRepeatedMonth ).forEach( key => {

            //     const month = mostRepeatedMonth[key];

            //     list.push( month );
                
            // });


            // list.sort( ( a, b ) => a - b );

            
            const auxYears = [];
            groupPatient.map( patient => {

                auxYears.push( dayjs( patient.FECHA_ATENCION, 'DD/MM/YYYY').year() );

            });


            //meotodo para ordenar los años sin repetirse
            const years = sortDatesWithoutRepeating( auxYears );



            years.forEach( year => {

                const auxMonths = [];

                //obtener todas las fechas de citas de un año
                const patientByYear = groupPatient.filter( gp => dayjs(gp.FECHA_ATENCION,'DD/MM/YYYY').year() === year );


                //de las fechas obtenidas se extraen los meses
                patientByYear.map( auxPat => auxMonths.push( dayjs( auxPat.FECHA_ATENCION, 'DD/MM/YYYY').month() + 1 ) );


                //metodo para ordenar los meses sin repetirse
                const months = sortDatesWithoutRepeating( auxMonths );


                months.forEach( month => {

                    //objeto para insertar las citas de un mismo mes
                    let newDataPatient = {};

                    let contAttention = 1;

                    let fechaInicial;
                    let fechaFinal;
                    let fecha;

                    patientByYear.map( patientYear => {

                        fecha = dayjs(patientYear.FECHA_ATENCION,'DD/MM/YYYY');

                        if( (dayjs(patientYear.FECHA_ATENCION,'DD/MM/YYYY').month() + 1) === month ) {


                            console.log(year)
                            console.log(month)
                            console.log(patientYear.FECHA_ATENCION)
                            
                            

                            if( contAttention === 1 ) {

                                fechaInicial = dayjs(patientYear.FECHA_ATENCION, 'DD/MM/YYYY');
                                fechaFinal   = dayjs(patientYear.FECHA_ATENCION, 'DD/MM/YYYY');
                                
                            } else {
                                
                                if(!fechaInicial.isBefore( fecha )) fechaInicial = fecha
    
                                if(!fechaFinal.isAfter( fecha )) fechaFinal = fecha
                            }
    
    
                            const { H_C_PACIENTE, TIPO_ATENCION, ESPECIALIDAD_CE, TIPO_CITA, FECHA_ATENCION, HORA_ATENCION, COD_DEP, DEPENDENCIA, COD_MED, NOM_MEDICO, TIPO_DIAG, Desc_Diagnóstico, Desc_Diagnóstico_Pres_1, Des_Diagnóstico_Pres_2, Des_Diagnóstico_Pres_3, desc_Diagnóstico_Def_1, Desc_Diagnóstico_Def_2 } = patientYear;
                            

                            newDataPatient = {

                                ...newDataPatient,
    
                                H_C_PACIENTE,
                                // ['FECHA_ATENCION_INICIAL']          : fechaInicial.format('DD/MM/YYYY'),
                                // ['FECHA_ATENCION_FINAL']            : fechaFinal.format('DD/MM/YYYY'),
    
                                // [`TIPO_ATENCION_ATENCION_${contAttention}`]           : TIPO_ATENCION,
                                // [`ESPECIALIDAD_CE_ATENCION_${contAttention}`]         : ESPECIALIDAD_CE,
                                // [`TIPO_CITA_ATENCION_${contAttention}`]               : TIPO_CITA,
                                [`FECHA_ATENCION_ATENCION_${contAttention}`]          : FECHA_ATENCION,
                                // [`HORA_ATENCION_ATENCION_${contAttention}`]           : HORA_ATENCION,
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

                    // const dataTemp2 = groupPatient.find( groupPat => {


                    //     return (dayjs(groupPat.FECHA_ATENCION, 'DD/MM/YYYY').month() + 1) === month
                        
                        
                    // });
    
    
                    // const { H_C_PACIENTE, TIPO_ATENCION, ESPECIALIDAD_CE, TIPO_CITA, FECHA_ATENCION, HORA_ATENCION, COD_DEP, DEPENDENCIA, COD_MED, NOM_MEDICO, TIPO_DIAG, Desc_Diagnóstico, Desc_Diagnóstico_Pres_1, Des_Diagnóstico_Pres_2, Des_Diagnóstico_Pres_3, desc_Diagnóstico_Def_1, Desc_Diagnóstico_Def_2, ...rest } = dataTemp2;
    
    
                    // newDataPatient = { ...newDataPatient, ...rest };
    
                    newData.push( newDataPatient );
                    
                });

                // console.log(patient.map( p => p.FECHA_ATENCION))
                
            });


            console.log( newData )
            

            return;
            
            

            years.forEach( year => {

                const auxMonths = groupPatient.filter


                //objeto para insertar las citas de un mismo mes
                let newDataPatient = {};

                //contador para concatenar a las propiedades indicando el numero de cita ==> propiedada_{numero_cita}
                let contAttention = 1;

                let fechaInicial;
                let fechaFinal;
                let prueba;

                //recorrer el paciente con el cual se esta trabajando
                groupPatient.map( patient => {


                    //formatear la fecha de la cita al formato dd/mm/aaaa
                    const patientMonthAttention = dayjs(patient.FECHA_ATENCION, 'DD/MM/YYYY');
                    prueba = dayjs(patient.FECHA_ATENCION, 'DD/MM/YYYY');

                    // (prueba.isAfter())

                    // console.log(`${year.format('DD/MM/YYYY')} - ${patientMonthAttention.format('DD/MM/YYYY')}  ===> ${year.isSame( patientMonthAttention )} `)


                    //si el mes de la cita es igual mes del array, para asi identificar todas las citad de cierto mes de forma dinamica mes_cita === 10 <== numero dinamico de cada mes que el paciente ha tenido una cita
                    if( year.isSame( patientMonthAttention ) ) {


                        if( contAttention === 1 ) {

                            fechaInicial = dayjs(patient.FECHA_ATENCION, 'DD/MM/YYYY');
                            fechaFinal   = dayjs(patient.FECHA_ATENCION, 'DD/MM/YYYY');
                            
                        } else {
                            
                            if(!fechaInicial.isBefore( prueba )) fechaInicial = prueba

                            if(!fechaFinal.isAfter( prueba )) fechaFinal = prueba
                        }


                        const { H_C_PACIENTE, TIPO_ATENCION, ESPECIALIDAD_CE, TIPO_CITA, FECHA_ATENCION, HORA_ATENCION, COD_DEP, DEPENDENCIA, COD_MED, NOM_MEDICO, TIPO_DIAG, Desc_Diagnóstico, Desc_Diagnóstico_Pres_1, Des_Diagnóstico_Pres_2, Des_Diagnóstico_Pres_3, desc_Diagnóstico_Def_1, Desc_Diagnóstico_Def_2 } = patient;


                        newDataPatient = {

                            ...newDataPatient,

                            H_C_PACIENTE,
                            // ['FECHA_ATENCION_INICIAL']          : fechaInicial.format('DD/MM/YYYY'),
                            // ['FECHA_ATENCION_FINAL']            : fechaFinal.format('DD/MM/YYYY'),

                            // [`TIPO_ATENCION_ATENCION_${contAttention}`]           : TIPO_ATENCION,
                            // [`ESPECIALIDAD_CE_ATENCION_${contAttention}`]         : ESPECIALIDAD_CE,
                            // [`TIPO_CITA_ATENCION_${contAttention}`]               : TIPO_CITA,
                            [`FECHA_ATENCION_ATENCION_${contAttention}`]          : FECHA_ATENCION,
                            // [`HORA_ATENCION_ATENCION_${contAttention}`]           : HORA_ATENCION,
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


                // const dataTemp2 = groupPatient.find( fecha => {


                //     return year.isSame( dayjs(fecha.FECHA_ATENCION, 'DD/MM/YYYY') ) 
                    
                    
                // });


                // const { H_C_PACIENTE, TIPO_ATENCION, ESPECIALIDAD_CE, TIPO_CITA, FECHA_ATENCION, HORA_ATENCION, COD_DEP, DEPENDENCIA, COD_MED, NOM_MEDICO, TIPO_DIAG, Desc_Diagnóstico, Desc_Diagnóstico_Pres_1, Des_Diagnóstico_Pres_2, Des_Diagnóstico_Pres_3, desc_Diagnóstico_Def_1, Desc_Diagnóstico_Def_2, ...rest } = dataTemp2;


                // newDataPatient = { ...newDataPatient, ...rest };

                newData.push( newDataPatient );
                
                
            });
            

            // console.log(newData)
            
            
            return;
            

            //iterar el objeto segun su key
            Object.keys( mostRepeatedMonth ).forEach( key => {

                //objeto para insertar las citas de un mismo mes
                let newDataPatient = {};

                //contador para concatenar a las propiedades indicando el numero de cita ==> propiedada_{numero_cita}
                let contAttention = 1;

                let fechaInicial;
                let fechaFinal;
                let prueba;

                //recorrer el paciente con el cual se esta trabajando
                groupPatient.map( patient => {


                    //formatear la fecha de la cita al formato dd/mm/aaaa
                    const patientMonthAttention = dayjs(patient.FECHA_ATENCION, 'DD/MM/YYYY').month() + 1;
                    prueba = dayjs(patient.FECHA_ATENCION, 'DD/MM/YYYY');

                    // (prueba.isAfter())


                    //si el mes de la cita es igual mes del array, para asi identificar todas las citad de cierto mes de forma dinamica mes_cita === 10 <== numero dinamico de cada mes que el paciente ha tenido una cita
                    if( patientMonthAttention === Number(key) ) {


                        if( contAttention === 1 ) {

                            fechaInicial = dayjs(patient.FECHA_ATENCION, 'DD/MM/YYYY');
                            fechaFinal   = dayjs(patient.FECHA_ATENCION, 'DD/MM/YYYY');
                            
                        } else {
                            
                            if(!fechaInicial.isBefore( prueba )) fechaInicial = prueba

                            if(!fechaFinal.isAfter( prueba )) fechaFinal = prueba
                        }


                        const { H_C_PACIENTE, TIPO_ATENCION, ESPECIALIDAD_CE, TIPO_CITA, FECHA_ATENCION, HORA_ATENCION, COD_DEP, DEPENDENCIA, COD_MED, NOM_MEDICO, TIPO_DIAG, Desc_Diagnóstico, Desc_Diagnóstico_Pres_1, Des_Diagnóstico_Pres_2, Des_Diagnóstico_Pres_3, desc_Diagnóstico_Def_1, Desc_Diagnóstico_Def_2 } = patient;


                        newDataPatient = {

                            ...newDataPatient,

                            H_C_PACIENTE,
                            ['FECHA_ATENCION_INICIAL']          : fechaInicial.format('DD/MM/YYYY'),
                            ['FECHA_ATENCION_FINAL']            : fechaFinal.format('DD/MM/YYYY'),

                            [`TIPO_ATENCION_ATENCION_${contAttention}`]           : TIPO_ATENCION,
                            [`ESPECIALIDAD_CE_ATENCION_${contAttention}`]         : ESPECIALIDAD_CE,
                            [`TIPO_CITA_ATENCION_${contAttention}`]               : TIPO_CITA,
                            [`FECHA_ATENCION_ATENCION_${contAttention}`]          : FECHA_ATENCION,
                            [`HORA_ATENCION_ATENCION_${contAttention}`]           : HORA_ATENCION,
                            [`COD_DEP_ATENCION_${contAttention}`]                 : COD_DEP,
                            [`DEPENDENCIA_ATENCION_${contAttention}`]             : DEPENDENCIA,
                            [`COD_MED_ATENCION_${contAttention}`]                 : COD_MED,
                            [`NOM_MEDICO_ATENCION_${contAttention}`]              : NOM_MEDICO,
                            [`TIPO_DIAG_ATENCION_${contAttention}`]               : TIPO_DIAG,
                            [`Desc_Diagnostico_ATENCION_${contAttention}`]        : Desc_Diagnóstico,
                            [`Desc_Diagnostico_Pres_1_ATENCION_${contAttention}`] : Desc_Diagnóstico_Pres_1,
                            [`Des_Diagnostico_Pres_2_ATENCION_${contAttention}`]  : Des_Diagnóstico_Pres_2,
                            [`Des_Diagnostico_Pres_3_ATENCION_${contAttention}`]  : Des_Diagnóstico_Pres_3,
                            [`desc_Diagnostico_Def_1_ATENCION_${contAttention}`]  : desc_Diagnóstico_Def_1,
                            [`Desc_Diagnostico_Def_2_ATENCION_${contAttention}`]  : Desc_Diagnóstico_Def_2

                            // ...rest
                            
                        };


                        contAttention++;

                        
                    }


                });


                const dataTemp2 = groupPatient.find( fecha => {


                    return (dayjs(fecha.FECHA_ATENCION, 'DD/MM/YYYY').month() + 1) === Number(key)
                    
                    
                });


                const { H_C_PACIENTE, TIPO_ATENCION, ESPECIALIDAD_CE, TIPO_CITA, FECHA_ATENCION, HORA_ATENCION, COD_DEP, DEPENDENCIA, COD_MED, NOM_MEDICO, TIPO_DIAG, Desc_Diagnóstico, Desc_Diagnóstico_Pres_1, Des_Diagnóstico_Pres_2, Des_Diagnóstico_Pres_3, desc_Diagnóstico_Def_1, Desc_Diagnóstico_Def_2, ...rest } = dataTemp2;


                newDataPatient = { ...newDataPatient, ...rest };

                newData.push( newDataPatient );
                
            });


            // console.log(newData);

            
        });



        return newData;


    }
    
    
    
}

module.exports = ExcelHandling;