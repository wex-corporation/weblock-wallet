// src/core/index.ts
import { SDKOptions } from '../types'
import { InternalCoreImpl } from './internal'

export class Core {
  private readonly internal: InternalCoreImpl

  constructor(options: SDKOptions) {
    this.internal = new InternalCoreImpl(options)
  }

  getInternalCore(): InternalCoreImpl {
    return this.internal
  }
}
