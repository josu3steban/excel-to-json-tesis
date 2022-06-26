const fs = require('fs');


const { dateFormat } = require('./src/helper/dateFormat');
const { ExcelHandling } = require('./src/model');


//rita de donde se encuentra el archivo
const dataPath = './src/data/FRPB-TESIS-GINECO-OBSTETRICIAv2.xlsx';


//intancia de la clase
const excelHandling = new ExcelHandling();


//tranformar el archivo excel a un formato json
const dataToJson = excelHandling.excelToJson( dataPath );



//guardar el json en un archivo
// excelHandling.saveFile( dataToJson );


//Columna por la que se quiere filtrar los datos
const column = 'H_C_PACIENTE'; 

const dataByPatientCodes = excelHandling.dataFilterByPatientCodes( dataToJson, column );



//tranformar la fecha de atencion de entero a formato fecha "dd/mm/yyyy"
const dataFormatDate = dateFormat( dataToJson );
// fs.writeFileSync( './src/data/prueba-format-fecha.json', JSON.stringify( dataFormatDate ) );



//datos filtrados. Varias filas de un mismo paciente agrupas en una fila según las fechas cercanas. Se envia como argumentos el json de los datos y los codigos de pacientes
const dataFiltered = excelHandling.dataFilterByDateAttenction( dataFormatDate, dataByPatientCodes );



console.log(dataFiltered);



// const codigoPaciente = dataFormatDate.filter( data => data.H_C_PACIENTE === 693 );



// console.log(typeof fecha.FECHA_ATENCION)


// const meses = fechaAtencion.map( fecha => console.log( new Date(fecha.FECHA_ATENCION) )  )


// console.log(meses)

// console.log( meses.map( mes => mes.getMonth() + 1 ) );
// console.log( meses.map( mes => mes.getDate() ) );
// console.log( meses.map( mes => mes.getFullYear() ) );

// fs.writeFileSync( './src/data/prueba.json', JSON.stringify( fechaAtencion ) );