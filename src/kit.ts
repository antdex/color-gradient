import sortBy from 'lodash/sortBy'

type RGBValues = [number, number, number]

/**
 * 给定一组数字集合，返回用于计算颜色梯度的函数
 * wiki: https://zh.wikipedia.org/wiki/%E8%89%B2%E5%BD%A9%E6%A2%AF%E5%BA%A6
 * 注意：这里的梯度并不用于生成连续渐变
 */
export function createColorGradient(dataSource: number[]) {
    dataSource = sortBy(dataSource)
    const length = dataSource.length

    // 来自 Excel 中的三色阶配色：max/median/min -> 红/黄/绿
    const colors = [[99, 190, 123], [255, 235, 132], [248, 105, 107]]
    const steps = colors.length - 1

    /**
     * 获取颜色之间的插值
     */
    function getValue(
        start: number[],
        end: number[],
        percent: number,
        index: number
    ) {
        const value = start[index] + (end[index] - start[index]) * percent
        return Math.ceil(value)
    }

    return (num: number): RGBValues | null => {
        const index = dataSource.findIndex(d => d === num)

        if (index < 0) {
            return null
        }

        const percent = index / length
        const step = Math.floor(steps * percent)
        const left = steps * percent - step
        const start = colors[step]
        const end = step === steps ? start : colors[step + 1]

        const rgbValues: RGBValues = [
            getValue(start, end, left, 0),
            getValue(start, end, left, 1),
            getValue(start, end, left, 2)
        ]

        return rgbValues
    }
}
