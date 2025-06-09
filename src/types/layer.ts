export interface Option {
    id: string
    weight?: number
}

export interface Layer {
    id: string
    probability: number
    options: Option[]
}
