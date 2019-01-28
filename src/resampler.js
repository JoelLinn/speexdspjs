Module["resampler_init"] = function (nb_channels, in_rate, out_rate, quality) {
	const errorPtr = Module._malloc(4);

	const ret = Module._speex_resampler_init(nb_channels, in_rate, out_rate, quality, errorPtr);

	const error = Module.getValue(errorPtr, 'i32');
	Module._free(errorPtr);
	if (error !== 0) {
		throw error;
	}

	return ret;
};

Module["resampler_process_float"] = function (st, channel_index, _in) {
	var rawInLen = _in.length;
	const rawInLenPtr = Module._malloc(4);
	Module.setValue(rawInLenPtr, rawInLen, 'i32');

	const rawInPtr = Module._malloc(rawInLen * 4);
	Module.HEAPF32.set(_in, rawInPtr / 4, rawInPtr / 4 + rawInLen);

	const ratio = Module.resampler_get_ratio(st);
	var rawOutLen = Math.ceil(rawInLen * ratio.denominator / ratio.numerator);
	const rawOutLenPtr = Module._malloc(4);
	Module.setValue(rawOutLenPtr, rawOutLen, 'i32');

	const rawOutPtr = Module._malloc(rawOutLen * 4);

	const error = Module._speex_resampler_process_float(st, channel_index, rawInPtr, rawInLenPtr, rawOutPtr, rawOutLenPtr);

	rawInLen = Module.getValue(rawInLenPtr, 'i32');
	rawOutLen = Module.getValue(rawOutLenPtr, 'i32');
	Module._free(rawInLenPtr);
	Module._free(rawOutLenPtr);
	Module._free(rawInPtr);

	if (error !== 0) {
		Module._free(rawOutPtr);
		throw error;
	}

	const out = new Float32Array(rawOutLen);
	out.set(Module.HEAPF32.subarray(rawOutPtr / 4, rawOutPtr / 4 + rawOutLen));

	Module._free(rawOutPtr);

	return out;
}

Module["resampler_destroy"] = function (st) {
	Module._speex_resampler_destroy(st);
};

Module["resampler_get_ratio"] = function (st) {
	const numPtr = Module._malloc(4);
	const denPtr = Module._malloc(4);

	Module._speex_resampler_get_ratio(st, numPtr, denPtr);

	return {
		numerator: Module.getValue(numPtr, 'i32'),
		denominator: Module.getValue(denPtr, 'i32')
	};
};

Module["resampler_reset_mem"] = function (st) {
	const error = Module._speex_resampler_reset_mem(st);
	if (error !== 0) {
		throw error;
	}
};

Module["resampler_strerror"] = function (error) {
	return Pointer_stringify(Module._speex_resampler_strerror(error));
};
