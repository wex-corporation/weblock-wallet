interface ITime {
  delay(ms: number): Promise<void>
}

export const Time: ITime = {
  delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}
