


const sortDatesWithoutRepeating = ( listDates = [] ) => {

    const auxDates = [ ...listDates ];
    const dates = [];

    //se obtiene los años sin repetirse
    auxDates.forEach( year => !dates.includes( year ) && dates.push( year ) );

    //se ordena los años de menor a mayor
    dates.sort( (a,b) => a - b );


    return dates;
    
}


module.exports = {

    sortDatesWithoutRepeating
    
}