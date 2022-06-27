const XLSX = require('xlsx');
const fs = require('fs');

const dayjs = require('dayjs');
const customParseFormat = require('dayjs/plugin/customParseFormat');
const localizedFormat = require('dayjs/plugin/localizedFormat');
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

        // 1.- filtrar los pacientes según el código - obtener los objetos del mismo paciente
        // 2.- comparar las fechas de atencion del paciente
        // 3.- agrupar las fechas cercanas
        // 4.- unificar las fechas cercanas en unas misma - crear un objeto uniendo todos los objetos con fechas cercanas
        // 5.- al nuevo objeto unificado, crear pripiedades que contenga la fecha inicio - fecha fin, luego los datos que cambian de las atenciones, poner la de la primera atencion, la segunda y así con todas las atenciones que tenga

        const newData = [];

        // let paciente;

        const dateTemp = [520, 693, 5733];
        
        dateTemp.map( hc => {


            let months = [];
            
            const monthsFilter = [];


            const groupPatient = data.filter( filtro => filtro.H_C_PACIENTE === hc );
            

            months = groupPatient.map( patient => {
                
                
                return dayjs(patient.FECHA_ATENCION, 'DD/MM/YYYY').month() + 1;

            
            });



            months.map( month => !monthsFilter.includes( month ) && monthsFilter.push( month ) );


            //objeto para guardar los meses que ha tenido cita un paciente
            let mostRepeatedMonth = {};


            //objeto para guardar los meses que ha tenido cita un paciente
            let mostRepeatedMonthOrdered = {};


            //crea un objeto con los meses en numero con el valor de 0
            monthsFilter.map( month => {

                // mostRepeatedMonth.H_C_PACIENTE = hc;
                mostRepeatedMonth[month] = 0;
                
            });




            //hace un conteo de los meses que tiene un paciente y los va sumando al objeto de los meses para tener el total de veces que se repite (total de citas que tiene en un mes )
            //ejem. { 3: 1,  5: 4,  11: 9 } ==> ejemp. descriptivo { marzo: 1,  mayo: 4,  noviembre: 9 }
            months.map( (month ) => {


                monthsFilter.map( monthF => {



                    if(month === monthF) {

                        mostRepeatedMonth[monthF] = mostRepeatedMonth[monthF] + 1;
                        
                    }
                         
                    
                });
                
                
            });



            //array para guardar las veces que se repite cada mes
            //ejem. [ 1,  4,  9 ]
            const list = [];
            
            Object.keys( mostRepeatedMonth ).forEach( key => {


                const month = mostRepeatedMonth[key];

                list.push( month );

                
            });


            list.sort( ( a, b ) => a - b );

            
            //del array de las veces que se repite cada mes, se saca el mayor de ellos
            // const mostRepeat = Math.max( ...list );

            //variable para guardar el numero del mes que más se repite
            // let mostRepeatKey;

            //obtiene la llave según el número mayor obtenido de las veces que se repite cada mes
            // Object.keys( mostRepeatedMonth ).forEach( key => {

            //si el valor de la propiedad del objeto es igual al numero mayor de los meses que se repite 
            //     if( mostRepeatedMonth[key] === mostRepeat ) {

            //         mostRepeatKey = key;
                    
            //     }
                
                
                
            // });


            
            
            // let newDataPatient = {};
            // let cont = 1;
            

            console.log(mostRepeatedMonth);


            //iterar el objeto segun su key
            Object.keys( mostRepeatedMonth ).forEach( key => {

                //objeto para insertar las citas de un mismo mes
                let newDataPatient = {};

                //contador para concatenar a las propiedades indicando el numero de cita ==> propiedada_{numero_cita}
                let contAttention = 1;

                //recorrer el paciente con el cual se esta trabajando
                groupPatient.map( patient => {


                    //formatear la fecha de la cita al formato dd/mm/aaaa
                    const patientMonthAttention = dayjs(patient.FECHA_ATENCION, 'DD/MM/YYYY').month() + 1;

                    //si el mes de la cita es igual mes del array, para asi identificar todas las citad de cierto mes de forma dinamica mes_cita === 10 <== numero dinamico de cada mes que el paciente ha tenido una cita
                    if( patientMonthAttention === Number(key) ) {


                        const { H_C_PACIENTE, TIPO_ATENCION, ESPECIALIDAD_CE, TIPO_CITA, FECHA_ATENCION, HORA_ATENCION, COD_DEP, DEPENDENCIA, COD_MED, NOM_MEDICO, TIPO_DIAG, Desc_Diagnóstico, Desc_Diagnóstico_Pres_1, Des_Diagnóstico_Pres_2, Des_Diagnóstico_Pres_3, desc_Diagnóstico_Def_1, Desc_Diagnóstico_Def_2, ...rest  } = patient;



                        newDataPatient = {

                            ...newDataPatient,

                            H_C_PACIENTE,
                            // [`TIPO_ATENCION_ATENCION_${cont}`]           : TIPO_ATENCION,
                            // [`ESPECIALIDAD_CE_ATENCION_${cont}`]         : ESPECIALIDAD_CE,
                            // [`TIPO_CITA_ATENCION_${cont}`]               : TIPO_CITA,
                            [`FECHA_ATENCION_ATENCION_${contAttention}`]             : FECHA_ATENCION,
                            // [`HORA_ATENCION_ATENCION_${cont}`]           : HORA_ATENCION,
                            // [`COD_DEP_ATENCION_${cont}`]                 : COD_DEP,
                            // [`DEPENDENCIA_ATENCION_${cont}`]             : DEPENDENCIA,
                            // [`COD_MED_ATENCION_${cont}`]                 : COD_MED,
                            // [`NOM_MEDICO_ATENCION_${cont}`]              : NOM_MEDICO,
                            // [`TIPO_DIAG_ATENCION_${cont}`]               : TIPO_DIAG,
                            // [`Desc_Diagnostico_ATENCION_${cont}`]        : Desc_Diagnóstico,
                            // [`Desc_Diagnostico_Pres_1_ATENCION_${cont}`] : Desc_Diagnóstico_Pres_1,
                            // [`Des_Diagnostico_Pres_2_ATENCION_${cont}`]  : Des_Diagnóstico_Pres_2,
                            // [`Des_Diagnostico_Pres_3_ATENCION_${cont}`]  : Des_Diagnóstico_Pres_3,
                            // [`desc_Diagnostico_Def_1_ATENCION_${cont}`]  : desc_Diagnóstico_Def_1,
                            // [`Desc_Diagnostico_Def_2_ATENCION_${cont}`]  : Desc_Diagnóstico_Def_2

                            // ...rest
                            
                        };


                        contAttention++;

                        
                    }


                });


                newData.push( newDataPatient );
                
            });


            // console.log(newData);

            
        });



        return newData;


    }
    
    
    
}

module.exports = ExcelHandling;