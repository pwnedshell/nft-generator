import { Layer, LayerOption } from 'types/layer'
import { svgMap } from '@layers/svgs'
import content from '@layers/content.json'

function mulberry32(seed: number) {
    return function () {
        let t = (seed += 0x6d2b79f5)
        t = Math.imul(t ^ (t >>> 15), t | 1)
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    }
}

function xmur3(str: string): () => number {
    let h = 1779033703 ^ str.length
    for (let i = 0; i < str.length; i++) {
        h = Math.imul(h ^ str.charCodeAt(i), 3432918353)
        h = (h << 13) | (h >>> 19)
    }
    return () => h >>> 0
}

function pickWeighted(options: LayerOption[], rand: () => number): LayerOption {
    const total = options.reduce((acc, o) => acc + (o.weight ?? 1), 0)
    let r = rand() * total
    for (const option of options) {
        r -= option.weight ?? 1
        if (r <= 0) return option
    }
    return options[options.length - 1]
}

function randomlySelectLayers(layers: Layer[], rand: () => number) {
    const selected: { layerName: string; option: LayerOption }[] = []

    for (const layer of layers) {
        if (rand() <= (layer.probability ?? 1.0)) {
            const option = pickWeighted(layer.options, rand)
            selected.push({ layerName: layer.id, option })
        }
    }

    return selected
}

function extractInnerSVG(content: string): string {
    const start = content.indexOf('<svg')
    const innerStart = content.indexOf('>', start) + 1
    const end = content.lastIndexOf('</svg>')
    return `<g>${content.slice(innerStart, end).trim()}</g>`
}

export function generateNFT(seed: string = ''): string {
    const hashSeed = xmur3(seed)()
    const rand = mulberry32(hashSeed)

    const layers = content.layers as Layer[]
    const selectedLayers = randomlySelectLayers(layers, rand)

    const innerSVGs = selectedLayers.map(({ option }) => {
        const rawSVG = svgMap[option.id]
        return extractInnerSVG(rawSVG)
    })

    return `<svg xmlns="http://www.w3.org/2000/svg" width="500" height="500" viewBox="0 0 500 500">\n${innerSVGs.join('\n')}\n</svg>`
}
