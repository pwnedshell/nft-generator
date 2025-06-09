export interface LayerOption {
    id: string
    weight?: number
}

export interface Layer {
    id: string
    probability: number
    options: LayerOption[]
}
