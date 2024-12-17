// src/core/index.ts
import { SDKOptions } from '../types'
import { InternalCore } from './internal'

export class Core {
  private readonly internal: InternalCore

  constructor(options: SDKOptions) {
    this.internal = new InternalCore(options)
  }

  getInternalCore(): InternalCore {
    return this.internal
  }
}
