
function init_population() {
	
	var ppl = {}
		
	var data = sync_get_json('http://api.population.io:80/1.0/population/World/today-and-tomorrow/')
		
	ppl.today = data.total_population[0].population;
	ppl.tomorrow = data.total_population[1].population;
	ppl.pps = people_per_sec();

	return ppl;	
}

function people_per_sec() {
	ppy = 83000000;
	ppd = ppy / 365.0;	
	pph = ppd / 24.;
	ppm = pph / 60.;
	pps = ppm / 60.;
	return pps;
}

function sync_get_json(url){
	var local_data;	
	$.ajax({
		dataType: "json",
		async: false,
		url:url,
		success: function( data ) {
			local_data = data;
		}
	});
	return local_data;
}

function current(ppl) {
	// this should be an interpollation of today vs tomorrow

	var today_date = new Date(Date.now());
	var ppl_hrs = today_date.getHours() * 60 * 60 * ppl.pps;
	var ppl_mins = today_date.getMinutes() * 60 * ppl.pps;
	var ppl_secs = today_date.getSeconds() * ppl.pps;

	return Math.round(ppl.today + ppl_hrs + ppl_mins + ppl_secs);
}

function current_formatted(ppl) {
	return numberWithCommas(current(ppl));
}

const numberWithCommas = (x) => {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}


