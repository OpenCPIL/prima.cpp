#include "common.cuh"
#include "read.cuh"

__global__ void read_vram_f32(
    const float * data, int64_t ne) {
    int idx = blockIdx.x * blockDim.x + threadIdx.x;
    if (idx >= ne) return;

    volatile float value = data[idx];
    asm volatile("" : : "f"(value) : "memory");
}

void ggml_cuda_read(ggml_tensor * dst) {
    const int64_t ne = ggml_nelements(dst);
    GGML_ASSERT(ggml_nbytes(dst) <= INT_MAX);
    GGML_ASSERT(ggml_is_contiguous(dst));
    GGML_ASSERT(dst->type == GGML_TYPE_F32);

    const char * dst_ddc = (const char *)dst->data;

    cudaStream_t stream;
    cudaStreamCreate(&stream);

    const int num_blocks = (ne + CUDA_READ_BLOCK_SIZE - 1) / CUDA_READ_BLOCK_SIZE;

    read_vram_f32<<<num_blocks, CUDA_READ_BLOCK_SIZE, 0, stream>>>(
        (const float *)dst_ddc, ne
    );

    cudaStreamSynchronize(stream);
    cudaStreamDestroy(stream);
}
