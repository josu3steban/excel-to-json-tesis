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



            let mostRepeatedMonth = {};



            monthsFilter.map( month => {

                mostRepeatedMonth[month] = 0;
                
            });





            months.map( (month ) => {


                monthsFilter.map( monthF => {



                    if(month === monthF) {

                        mostRepeatedMonth[monthF] = mostRepeatedMonth[monthF] + 1;
                        
                    }
                         
                    
                });
                
                
            });




            const list = [];
            
            Object.keys( mostRepeatedMonth ).forEach( key => {


                const month = mostRepeatedMonth[key];

                list.push( month );

                
            });


            const mostRepeat = Math.max( ...list );

            let mostRepeatKey;

            Object.keys( mostRepeatedMonth ).forEach( key => {


                if( mostRepeatedMonth[key] === mostRepeat ) {

                    mostRepeatKey = key;
                    
                }
                
                
                
            });




            let newDataPatient = {};
            let cont = 1;

            //groupPatient => Todas las citas de un paciente
            groupPatient.map( patient => {

                const patientMonthAttention = dayjs(patient.FECHA_ATENCION, 'DD/MM/YYYY').month() + 1;

                if( patientMonthAttention === Number(mostRepeatKey) ) {


                    const { H_C_PACIENTE, TIPO_ATENCION, ESPECIALIDAD_CE, TIPO_CITA, FECHA_ATENCION, HORA_ATENCION, COD_DEP, DEPENDENCIA, COD_MED, NOM_MEDICO, TIPO_DIAG, Desc_Diagnóstico, Desc_Diagnóstico_Pres_1, Des_Diagnóstico_Pres_2, Des_Diagnóstico_Pres_3, desc_Diagnóstico_Def_1, Desc_Diagnóstico_Def_2, ...rest  } = patient;



                    newDataPatient = {

                        ...newDataPatient,

                        H_C_PACIENTE,
                        // [`TIPO_ATENCION_ATENCION_${cont}`]           : TIPO_ATENCION,
                        // [`ESPECIALIDAD_CE_ATENCION_${cont}`]         : ESPECIALIDAD_CE,
                        // [`TIPO_CITA_ATENCION_${cont}`]               : TIPO_CITA,
                        [`FECHA_ATENCION_ATENCION_${cont}`]          : FECHA_ATENCION,
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


                    cont++;

                    // newData.push( newDataPatient );
                    
                    
                }



                // newData.push( newDataPatient );
                
                
                
            });
            
            
            newData.push( newDataPatient );
            


            console.log(mostRepeatedMonth);


            console.log(list);

            console.log(mostRepeatKey);


            console.log(newData);

            // console.log(newData.length);



        })


        console.log(newData.length);


    }
    
    
    
}

module.exports = ExcelHandling;