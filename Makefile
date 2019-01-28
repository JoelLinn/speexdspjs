SPEEXDSP_FUNCS:=               '_speex_resampler_init', '_speex_resampler_process_float', '_speex_resampler_destroy', '_speex_resampler_get_ratio', '_speex_resampler_reset_mem', '_speex_resampler_strerror'

SPEEXDSP_DIR=./speexdsp
EMCC_OPTS=-O3 --llvm-lto 3 -s MODULARIZE_INSTANCE=1 -s EXPORT_NAME='speexdsp' -s NO_FILESYSTEM=1 -s ALLOW_MEMORY_GROWTH=1 -s EXTRA_EXPORTED_RUNTIME_METHODS='['ccall', 'getValue', 'setValue']' -s EXPORTED_FUNCTIONS="['_malloc', ${SPEEXDSP_FUNCS}]"

.PHONY: test

all: init compile
autogen:
	cd $(SPEEXDSP_DIR); \
	./autogen.sh
configure:
	cd $(SPEEXDSP_DIR); \
	emconfigure ./configure --disable-examples
bind:
	cd $(SPEEXDSP_DIR); \
	emmake make;
init: autogen configure bind
compile:
	mkdir -p ./build; \
	emcc ${EMCC_OPTS} --bind -I ${SPEEXDSP_DIR}/include --post-js ./src/resampler.js ${SPEEXDSP_DIR}/libspeexdsp/.libs/libspeexdsp.a -o build/speexdsp.js; \
	cp -f ${SPEEXDSP_DIR}/COPYING build/COPYING.speexdsp;
test:
	emrun --serve_root ./ ./test/test.html
