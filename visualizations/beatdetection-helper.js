'use strict';
(function(exports) {

	var BeatDetectionHelper = function() {
		this.length = 100;
		this.range = 100;
		this.banddata = [[],[]];
		this.peaks = [[],[]];
		this.bands = [];
		this.band_count = 0;
		this.low_timer = 0;
		this.mid_timer = 0;
		this.high_timer = 0;
		this.peaks = [[],[]];
		this.low_peak = false;
  		this.mid_peak = false;
  		this.high_peak = false;
  		this.low_treshold = 80;
  		this.mid_treshold = 80;
  		this.high_treshold = 70;
		this.low_cutoff = 3;
		this.mid_cutoff = 4;
		this.high_cutoff = 7;
	}

	BeatDetectionHelper.prototype.setData = function(spectrum) {

		var i, l, x, y, db;

		this.low_peak = false;
		this.mid_peak = false;
		this.high_peak = false;

		for (i = 0, l = spectrum.left.length; i < l; i++) {
			db = spectrum.left[i];
			x = Math.round(Math.max(Math.min(Math.floor(db + 60), 72), 0) / 72 * this.range);
			db = spectrum.right[i];
			y = Math.round(Math.max(Math.min(Math.floor(db + 60), 72), 0) / 72 * this.range);
			this.banddata[0][i] = (x + y) / 2;
		}

		if (this.peaks[0].length == 0) {
			this.peaks[0] = this.banddata[0].map(function(x) {return 0;});
		}

		for (i = 0, l = this.banddata[0].length; i < l; i++) {
			if (this.banddata[0][i] > (this.peaks[0][i] * 1.1)) {
			  this.peaks[0][i] = this.banddata[0][i];
			  if (i == this.low_cutoff && this.peaks[0][i] > this.low_treshold)
			    this.low_peak = true;
			  else if (i == this.high_cutoff && this.peaks[0][i] > this.high_treshold)
			    this.high_peak = true;
			  else if (i == this.mid_cutoff && this.peaks[0][i] > this.mid_treshold)
			    this.mid_peak = true;
			}
		}

		if (this.low_peak) {
			console.log('low peak');
			if (this.low_timer > 15) this.low_timer = 0;
		}
		if (this.mid_peak) {
			console.log('mid peak');
			if (this.mid_timer > 15) this.mid_timer = 0;
		}
		if (this.high_peak) {
			console.log('high peak');
			if (this.high_timer > 15) this.high_timer = 0;
		}
	}

	BeatDetectionHelper.prototype.update = function() {
		this.low_peak = false;
		this.mid_peak = false;
		this.high_peak = false;

		this.low_timer ++;
		this.mid_timer ++;
		this.high_timer ++;

	    var i,l;
	    l = this.banddata[0].length;

	    if (l > 0) {
			for (i = 0; i < l; i++) {
				this.peaks[0][i] = Math.max(0, this.peaks[0][i] - 2);
			}
	    }
	}

	exports.BeatDetectionHelper = BeatDetectionHelper;

})(exports);