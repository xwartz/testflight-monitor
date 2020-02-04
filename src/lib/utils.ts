export function sleep(ms: number): Promise<null> {
  return new Promise(resolve => {
    setTimeout(resolve, ms)
  })
}

export async function asyncForEach(array: any[], callback: Function): Promise<any> {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array)
  }
}
