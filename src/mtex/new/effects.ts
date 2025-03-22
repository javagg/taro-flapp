import { SkEmbindObject } from "../bass";
import { Blender, InputMatrix, MallocObj, RuntimeEffect, Shader, TracedShader } from "../canvaskit";
import { ShaderJS } from "./shader";

export class RuntimeEffectJS extends SkEmbindObject<"RuntimeEffect"> implements RuntimeEffect {
    private uniformMap;
  
    /**
     * Compiles a RuntimeEffect from the given shader code.
     * @param sksl - Source code for a shader written in SkSL
     * @param callback - will be called with any compilation error. If not provided, errors will
     *                   be printed to console.log().
     */
    static Make(
      sksl: string,
      callback?: ((err: string) => void) | undefined
    ): RuntimeEffect | null {
      return new RuntimeEffectJS(new WebGLContext(sksl, false, callback));
    }
  
    /**
     * Compiles a RuntimeEffect from the given blender code.
     * @param sksl - Source code for a blender written in SkSL
     * @param callback - will be called with any compilation error. If not provided, errors will
     *                   be printed to console.log().
     */
    static MakeForBlender(sksl: string, callback?: (err: string) => void): RuntimeEffect | null {
      throw new Error("MakeForBlender not implemented.");
    }
  
    /**
     * Adds debug tracing to an existing RuntimeEffect.
     * @param shader - An already-assembled shader, created with RuntimeEffect.makeShader.
     * @param traceCoordX - the X coordinate of the device-space pixel to trace
     * @param traceCoordY - the Y coordinate of the device-space pixel to trace
     */
    static MakeTraced(shader: Shader, traceCoordX: number, traceCoordY: number): TracedShader {
      throw new Error("MakeTraced not implemented.");
    }
  
    constructor(private readonly ctx: WebGLContext) {
      super("RuntimeEffect");
      this.uniformMap = this.getUniforms().filter(
        (u) => u.type !== ctx.gl.SAMPLER_2D
      );
    }
  
  
    private getUniforms() {
      const { gl, program } = this.ctx;
      const uniformCount = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
      return Array.from({ length: uniformCount }, (_, i) =>
        gl.getActiveUniform(program, i)
      )
        .filter(Boolean)
        .map((uniform, index) => ({ ...uniform, index }));
    }
  
        /**
     * Returns a shader executed using the given uniform data.
     * @param uniforms
     */
        makeBlender(uniforms: Float32Array | number[] | MallocObj): Blender {
            throw new Error("Method not implemented.");
        }
    /**
   * Returns a shader executed using the given uniform data.
   * @param uniforms
   */
    makeShader(
      inputUniforms: MallocObj | Float32Array | number[],
      localMatrix?: InputMatrix
    ): Shader {
      return this.makeShaderWithChildren(inputUniforms, undefined, localMatrix);
    }
  
    /**
   * Returns a shader executed using the given uniform data and the children as inputs.
   * @param uniforms
   * @param children
   * @param localMatrix
   */
    makeShaderWithChildren(
      inputUniforms: MallocObj | Float32Array | number[],
      input?: ShaderJS[],
      localMatrix?: InputMatrix
    ): Shader {
      const uniforms = Array.from(normalizeArray(inputUniforms));
      const mappedUniforms = createUniformMap(
        this.ctx.gl,
        this.ctx.program,
        uniforms
      );
      const children = input ? input.map((c) => c.getShader()) : [];
  
      return new ShaderJS(
        new WebGLShader(
          this.ctx,
          mappedUniforms,
          children,
          localMatrix ? nativeMatrix(localMatrix) : undefined
        )
      );
    }
  
    /**
  * Returns the nth uniform from the effect.
  * @param index
  */
    getUniform(index: number) {
      const uniform = this.uniformMap[index];
      if (!uniform) {
        throw new Error(`No uniform at index ${index}`);
      }
      const { gl } = this.ctx;
      let rows = 1,
        columns = 1,
        isInteger = false;
  
      switch (uniform.type) {
        case gl.FLOAT_VEC2:
          rows = 2;
          break;
        case gl.FLOAT_VEC3:
          rows = 3;
          break;
        case gl.FLOAT_VEC4:
          rows = 4;
          break;
        case gl.FLOAT_MAT2:
          rows = 2;
          columns = 2;
          break;
        case gl.FLOAT_MAT3:
          rows = 3;
          columns = 3;
          break;
        case gl.FLOAT_MAT4:
          rows = 4;
          columns = 4;
          break;
        case gl.INT:
          isInteger = true;
          break;
        case gl.INT_VEC2:
          isInteger = true;
          rows = 2;
          break;
        case gl.INT_VEC3:
          isInteger = true;
          rows = 3;
          break;
        case gl.INT_VEC4:
          isInteger = true;
          rows = 4;
          break;
        default:
          if (uniform.type !== gl.FLOAT) {
            throw new Error(`Unsupported uniform type: ${uniform.type}`);
          }
      }
      return { columns, rows, slot: uniform.index, isInteger };
    }
  
    /**
   * Returns the number of uniforms on the effect.
   */
    getUniformCount() {
      return this.uniformMap.length;
    }
  
    /**
   * Returns the total number of floats across all uniforms on the effect. This is the length
   * of the uniforms array expected by makeShader. For example, an effect with a single float3
   * uniform, would return 1 from `getUniformCount()`, but 3 from `getUniformFloatCount()`.
   */
    getUniformFloatCount() {
      return this.uniformMap
        .filter((u) => u.type === this.ctx.gl.FLOAT)
        .reduce((count, u) => count + u.size!, 0);
    }
  
    getUniformName(index: number) {
      const uniform = this.uniformMap[index];
      if (!uniform) {
        throw new Error(`No uniform at index ${index}`);
      }
      return uniform.name!;
    }
  }
  