// basically an Either

export interface Success<T> {
    readonly ok: true
    readonly value: T
}

export class Failure<E = unknown> {
    readonly ok: false
    readonly error: E
}

export type Result<T, E = unknown> = Success<T> | Failure<E>

export default <T>(f: () => T): Result<T> => {
    try {
        return { ok: true, value: f() }
    } catch (e) {
        return { ok: false, error: e }
    }
}
