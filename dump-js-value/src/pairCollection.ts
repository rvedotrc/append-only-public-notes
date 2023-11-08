export interface Pair<L, R> { left: L, right: R }

export default class PairCollection<L, R> {
  private readonly pairs: Pair<L, R>[] = []

  constructor(
    private readonly leftsAreEqual: (a: L, b: L) => boolean,
    private readonly rightBuilder: (left: L) => R
  ) {
  }

  public findOrCreate(left: L): Pair<L, R> {
    const found = this.getPair(left)
    if (found !== undefined) return found

    const pair = this.buildPair(left)
    this.pairs.push(pair)
    return pair
  }

  public getPair(left: L): Pair<L, R> | undefined {
    return this.pairs.find(pair => this.leftsAreEqual(pair.left, left))
  }

  private buildPair(left: L): Pair<L, R> {
    const right = this.rightBuilder(left)
    return { left, right }
  }
}
