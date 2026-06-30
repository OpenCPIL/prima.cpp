#include "common.cuh"

#define CUDA_READ_BLOCK_SIZE 512

void ggml_cuda_read(ggml_tensor * dst);
