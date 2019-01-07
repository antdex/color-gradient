/**
 * 包装 Table 获取三色色阶支持的组件
 *
 * ## 用法：
 *   <ColorGradient>
 *     <Table columns={columns} dataSource={dataSource} />
 *   </ColorGradient>
 *
 * ## 注意：
 *   - 子组件必须是 antd 的 Table 组件
 */

import * as React from 'react'
import values from 'lodash/values'
import pick from 'lodash/pick'
import flatten from 'lodash/flatten'
import identity from 'lodash/identity'
import { createColorGradient } from './kit'

import { ColumnProps, TableProps } from 'antd/es/table'

const defaultOnCell = (...args: any[]) => ({})

interface DataItem {
    [K: string]: any
}

type Column = ColumnProps<DataItem>

interface Props {
    children: React.ReactElement<TableProps<DataItem>>

    /**
     * dataIndex 的数组，匹配时则不给相应列的所有 Cell 设置背景色
     */
    ignoreColumns?: string[]

    /**
     * 设置 Cell 背景色的透明度
     */
    opacity?: number
}

const ColorGradient = (props: Props) => {
    const { children, ignoreColumns = [], opacity = 0.8 } = props

    if (!children) {
        return null
    }

    const tableProps = children.props
    const { dataSource = [], columns = [], ...restTableProps } = tableProps

    // 被 filter 之后，dataIndexList 一定只有 string
    const dataIndexList = columns
        .map((c: Column) => c.dataIndex)
        .filter(identity)
        .filter(key => !ignoreColumns.includes(key as string)) as string[]

    const validNumberList = flatten<number>(
        dataSource.map((d: object) => values(pick(d, dataIndexList)))
    )

    const colorGradient = createColorGradient(validNumberList)

    const updatedColumns = columns.map((col: Column) => {
        const oldOnCell = col.onCell || defaultOnCell

        if (!col.dataIndex) {
            console.error(
                '[ColorGradient] 传入的 Table columns 中必须指定 dataIndex'
            )
            return col
        }

        if (ignoreColumns.includes(col.dataIndex)) {
            return col
        }

        return {
            ...col,
            onCell(record: DataItem, rowIndex: number) {
                const rgbValues = colorGradient(record[col.dataIndex as string])
                const color = rgbValues && `rgba(${[...rgbValues, opacity].join(',')})`
                return {
                    ...oldOnCell(record, rowIndex),
                    style: {
                        background: color
                    }
                }
            }
        }
    })

    return React.cloneElement(children, {
        ...restTableProps,
        columns: updatedColumns,
        dataSource
    })
}

export default ColorGradient
